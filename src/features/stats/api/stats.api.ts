// Stats API 함수들
import { supabase } from '@/shared/lib/supabase/client';
import { Player, PlayerStats, StatsFilters } from '../types/stats.types';

// 선수 통계 가져오기 (특정 매치)
export async function getPlayerStatsByMatch(matchId: number, matchNumber: number = 1): Promise<PlayerStats[]> {
  const { data: attendanceData, error: attendanceError } = await supabase
    .from('match_attendance')
    .select('*')
    .eq('match_id', matchId)
    .eq('match_number', matchNumber);

  if (attendanceError) throw attendanceError;

  const { data: matchStatsData, error: matchStatsError } = await supabase
    .from('match_attendance')
    .select('player_id, goals, assists')
    .eq('match_id', matchId)
    .not('is_opponent_team', 'eq', true);

  if (matchStatsError) throw matchStatsError;

  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select('*');

  if (playersError) throw playersError;

  const matchStatsMap: Record<string, { totalGoals: number; totalAssists: number }> = {};
  matchStatsData?.forEach((row: any) => {
    if (!matchStatsMap[row.player_id]) {
      matchStatsMap[row.player_id] = { totalGoals: 0, totalAssists: 0 };
    }
    matchStatsMap[row.player_id].totalGoals += row.goals || 0;
    matchStatsMap[row.player_id].totalAssists += row.assists || 0;
  });

  const attendanceMap: Record<string, {
    status: 'attending' | 'not_attending' | 'pending';
    goals?: number;
    assists?: number;
    rating?: number;
  }> = {};

  attendanceData?.forEach((row: any) => {
    attendanceMap[row.player_id] = {
      status: row.status,
      goals: row.goals || 0,
      assists: row.assists || 0,
      rating: row.rating || 0
    };
  });

  const { data: matchData } = await supabase
    .from('matches')
    .select('date')
    .eq('id', matchId)
    .single();

  const stats: PlayerStats[] = (playersData || []).map((player: any) => ({
    id: player.id,
    name: player.name,
    matchId: matchId,
    matchDate: matchData?.date || '',
    attendanceStatus: attendanceMap[player.id]?.status || 'pending',
    goals: matchStatsMap[player.id]?.totalGoals || 0,
    assists: matchStatsMap[player.id]?.totalAssists || 0,
    rating: attendanceMap[player.id]?.rating || 0,
  }));

  return stats.sort((a, b) => {
    const order = { attending: 0, not_attending: 1, pending: 2 };
    const statusDiff = order[a.attendanceStatus] - order[b.attendanceStatus];
    if (statusDiff === 0) {
      return a.name.localeCompare(b.name, 'ko');
    }
    return statusDiff;
  });
}

// 모든 선수 통계 가져오기 (필터링 가능)
export async function getAllPlayerStats(filters?: StatsFilters): Promise<Player[]> {
  // 선수 기본 정보 가져오기
  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select('id, name, position, birthday, fav_club, boots_brand');

  if (playersError) throw playersError;

  // player_stats 테이블에서 능력치 정보 가져오기
  const { data: playerStatsData, error: playerStatsError } = await supabase
    .from('player_stats')
    .select('id, pac, sho, pas, dri, def, phy');

  if (playerStatsError) throw playerStatsError;

  // 완료된 매치 쿼리 구성
  let matchesQuery = supabase
    .from('matches')
    .select('id, date')
    .eq('status', 'completed');

  // 연도와 월 필터 적용
  if (filters?.year) {
    const startDate = filters.month
      ? new Date(filters.year, filters.month - 1, 1).toISOString()
      : new Date(filters.year, 0, 1).toISOString();

    const endDate = filters.month
      ? new Date(filters.year, filters.month, 0).toISOString()
      : new Date(filters.year, 11, 31).toISOString();

    matchesQuery = matchesQuery
      .gte('date', startDate)
      .lte('date', endDate);
  }

  const { data: completedMatches, error: matchesError } = await matchesQuery;

  if (matchesError) throw matchesError;

  // 각 선수별 통계 계산
  const playersWithStats = await Promise.all(
    (playersData || []).map(async (player: any) => {
      const stats = playerStatsData?.find(s => s.id === player.id);
      const playerId = player.id;

      // 해당 기간의 완료된 매치에서 선수 통계 집계
      const matchIds = (completedMatches || []).map(m => m.id);
      
      if (matchIds.length === 0) {
        return {
          ...player,
          games: 0,
          goals: 0,
          assists: 0,
          attendance: 0,
          rating: 0,
          pac: stats?.pac || 0,
          sho: stats?.sho || 0,
          pas: stats?.pas || 0,
          dri: stats?.dri || 0,
          def: stats?.def || 0,
          phy: stats?.phy || 0,
        };
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select('goals, assists, rating, status')
        .eq('player_id', playerId)
        .in('match_id', matchIds)
        .eq('status', 'attending');

      if (attendanceError) throw attendanceError;

      const games = attendanceData?.length || 0;
      const goals = attendanceData?.reduce((sum, a) => sum + (a.goals || 0), 0) || 0;
      const assists = attendanceData?.reduce((sum, a) => sum + (a.assists || 0), 0) || 0;
      const totalRating = attendanceData?.reduce((sum, a) => sum + (a.rating || 0), 0) || 0;
      const rating = games > 0 ? totalRating / games : 0;

      // 전체 매치에서 출석 횟수 계산
      const { data: allAttendanceData } = await supabase
        .from('match_attendance')
        .select('status')
        .eq('player_id', playerId)
        .in('match_id', matchIds);

      const attendance = allAttendanceData?.filter(a => a.status === 'attending').length || 0;

      return {
        ...player,
        games,
        goals,
        assists,
        attendance,
        rating: Math.round(rating * 10) / 10,
        pac: stats?.pac || 0,
        sho: stats?.sho || 0,
        pas: stats?.pas || 0,
        dri: stats?.dri || 0,
        def: stats?.def || 0,
        phy: stats?.phy || 0,
      };
    })
  );

  return playersWithStats;
}

// 선수 랭킹 가져오기
export async function getPlayerRankings(
  type: 'goals' | 'assists' | 'attendance' | 'rating',
  year?: number,
  month?: number
): Promise<Player[]> {
  const filters: StatsFilters = {};
  if (year) filters.year = year;
  if (month) filters.month = month;

  const players = await getAllPlayerStats(filters);

  // 타입에 따라 정렬
  const sorted = [...players].sort((a, b) => {
    const aValue = a[type] || 0;
    const bValue = b[type] || 0;
    return bValue - aValue;
  });

  return sorted;
}

// 시즌 랭킹 가져오기
export async function getSeasonRankings(year: number): Promise<Player[]> {
  return getPlayerRankings('goals', year);
}

// 매치 목록 가져오기 (선수 통계용)
export async function getMatchesForStats(): Promise<Array<{ id: number; date: string; opponent: string }>> {
  const { data, error } = await supabase
    .from('matches')
    .select('id, date, opponent')
    .order('date', { ascending: false });

  if (error) throw error;

  return (data || []).map((m: any) => ({
    id: m.id,
    date: m.date ? new Date(m.date).toISOString().slice(0, 16) : '',
    opponent: m.opponent || '',
  }));
}

// 선수 목록 가져오기
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*');

  if (error) throw error;
  return data || [];
}


