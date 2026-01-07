// Matches API 함수들
import { supabase } from '@/shared/lib/supabase/client';
import { Match, MatchFormData, Attendance } from '../types/match.types';

// 모든 매치 가져오기
export async function getMatches(userId?: string | null): Promise<Match[]> {
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: true });

  if (matchesError) throw matchesError;
  if (!matchesData) return [];

  // 각 매치에 대한 출석 정보 가져오기
  const matchesWithAttendance = await Promise.all(
    matchesData.map(async (match) => {
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select('player_id, status')
        .eq('match_id', match.id);

      if (attendanceError) throw attendanceError;

      const attendance: Attendance = {
        attending: 0,
        notAttending: 0,
        pending: 0
      };

      let userResponse: 'attending' | 'notAttending' | 'pending' | null = null;

      type StatusType = 'attending' | 'not_attending' | 'pending';
      const playerStatusMap = new Map<string, StatusType>();

      attendanceData?.forEach(item => {
        const playerId = item.player_id;
        const newStatus = (item.status as StatusType) || 'pending';
        const existing = playerStatusMap.get(playerId);
        if (!existing) {
          playerStatusMap.set(playerId, newStatus);
        } else {
          const priority = (s: StatusType) => (s === 'attending' ? 3 : s === 'not_attending' ? 2 : 1);
          if (priority(newStatus) > priority(existing)) {
            playerStatusMap.set(playerId, newStatus);
          }
        }
      });

      playerStatusMap.forEach((status, playerId) => {
        if (status === 'attending') {
          attendance.attending++;
        } else if (status === 'not_attending') {
          attendance.notAttending++;
        } else {
          attendance.pending++;
        }
        if (userId && playerId === userId) {
          userResponse = status === 'attending' ? 'attending' : status === 'not_attending' ? 'notAttending' : 'pending';
        }
      });

      const matchDate = new Date(match.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let status = match.status as Match['status'];
      if (status !== 'cancelled' && matchDate < today) {
        status = 'completed';
      } else if (status !== 'cancelled' && matchDate >= today) {
        status = 'upcoming';
      }

      return {
        id: match.id,
        date: match.date,
        location: match.location,
        opponent: match.opponent,
        status,
        time: match.time,
        attendance,
        userResponse,
        created_by: match.created_by,
        updated_by: match.updated_by,
        deleted_by: match.deleted_by,
      };
    })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastMatches = matchesWithAttendance
    .filter(match => new Date(match.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const futureMatches = matchesWithAttendance
    .filter(match => new Date(match.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return [...futureMatches, ...pastMatches];
}

// 특정 매치 가져오기
export async function getMatchById(matchId: number, userId?: string | null): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error) throw error;
  if (!data) return null;

  const matches = await getMatches(userId);
  return matches.find(m => m.id === matchId) || null;
}

// 매치 생성
export async function createMatch(matchData: MatchFormData, created_by: string) {
  const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    return dateString.split('T')[0].split(' ')[0];
  };

  const normalizeStatus = (status: string): string => {
    if (['upcoming', 'completed', 'cancelled'].includes(status)) {
      return status;
    }
    return 'upcoming';
  };

  const formattedDate = normalizeDate(matchData.date);
  const formattedStatus = normalizeStatus(matchData.status);

  const { data, error } = await supabase
    .from('matches')
    .insert([{
      date: formattedDate,
      location: matchData.location,
      opponent: matchData.opponent,
      status: formattedStatus,
      created_by: created_by,
    }])
    .select();

  if (error) throw error;
  return data;
}

// 매치 업데이트
export async function updateMatch(matchId: number, matchData: MatchFormData, updated_by: string) {
  const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    return dateString.split('T')[0].split(' ')[0];
  };

  const normalizeStatus = (status: string): string => {
    if (['upcoming', 'completed', 'cancelled'].includes(status)) {
      return status;
    }
    return 'upcoming';
  };

  const formattedDate = normalizeDate(matchData.date);
  const formattedStatus = normalizeStatus(matchData.status);

  const { data, error } = await supabase
    .from('matches')
    .update({
      date: formattedDate,
      location: matchData.location,
      opponent: matchData.opponent,
      status: formattedStatus,
      time: matchData.time,
      updated_by: updated_by
    })
    .eq('id', matchId)
    .select();

  if (error) throw error;
  return data;
}

// 매치 삭제
export async function deleteMatch(matchId: number) {
  // 먼저 출석 정보 삭제
  const { error: attendanceError } = await supabase
    .from('match_attendance')
    .delete()
    .eq('match_id', matchId);

  if (attendanceError) throw attendanceError;

  // 매치 삭제
  const { error: matchError } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (matchError) throw matchError;
}

// 출석 상태 업데이트
export async function updateAttendance(matchId: number, playerId: string, status: 'attending' | 'notAttending' | 'pending') {
  const statusValue = status === 'notAttending' ? 'not_attending' : status;

  const { data: existingResponse, error: fetchError } = await supabase
    .from('match_attendance')
    .select('id, status')
    .eq('match_id', matchId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existingResponse) {
    const { error: updateError } = await supabase
      .from('match_attendance')
      .update({ status: statusValue })
      .eq('id', existingResponse.id);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('match_attendance')
      .insert({
        match_id: matchId,
        player_id: playerId,
        status: statusValue
      });

    if (insertError) throw insertError;
  }
}

// 다가오는 매치 가져오기
export async function getUpcomingMatches() {
  const { data: allMatches, error: allMatchesError } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: false });

  if (allMatchesError) throw allMatchesError;

  // 각 매치에 대한 참석 정보 가져오기
  const matchesWithAttendance = await Promise.all(
    (allMatches || []).map(async match => {
      const matchDate = new Date(match.date);
      if (isNaN(matchDate.getTime())) {
        return null;
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select(`
          status,
          player:players(id, name)
        `)
        .eq('match_id', match.id);

      if (attendanceError) throw attendanceError;

      type StatusType = 'attending' | 'not_attending' | 'pending';
      const playerStatusMap = new Map<string, { status: StatusType; player: any }>();

      attendanceData?.forEach(item => {
        const player = Array.isArray(item.player) ? item.player[0] : item.player;
        const playerId = player.id;
        const newStatus = (item.status as StatusType) || 'pending';
        const existing = playerStatusMap.get(playerId);

        if (!existing) {
          playerStatusMap.set(playerId, { status: newStatus, player });
        } else {
          const priority = (s: StatusType) => (s === 'attending' ? 3 : s === 'not_attending' ? 2 : 1);
          if (priority(newStatus) > priority(existing.status)) {
            playerStatusMap.set(playerId, { status: newStatus, player });
          }
        }
      });

      const attending: any[] = [];
      const notAttending: any[] = [];
      const pending: any[] = [];

      playerStatusMap.forEach(({ status, player }) => {
        if (status === 'attending') {
          attending.push(player);
        } else if (status === 'not_attending') {
          notAttending.push(player);
        } else {
          pending.push(player);
        }
      });

      return {
        id: match.id,
        date: matchDate.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        location: match.location,
        opponent: match.opponent,
        status: match.status as 'upcoming' | 'cancelled',
        attending: attending.length,
        notAttending: notAttending.length,
        pending: pending.length,
        attendingPlayers: attending,
        notAttendingPlayers: notAttending,
        pendingPlayers: pending,
        isPast: new Date() > matchDate
      };
    })
  );

  return matchesWithAttendance.filter((match): match is NonNullable<typeof match> => match !== null);
}


