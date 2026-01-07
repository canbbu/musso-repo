// Attendance API 함수들
import { supabase } from '@/shared/lib/supabase/client';
import { Player, MatchInfo, AttendanceData, AttendanceStatus } from '../types/attendance.types';

// 모든 선수 목록 가져오기
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, position')
    .order('name');

  if (error) throw error;
  return data || [];
}

// 경기 정보 가져오기
export async function getMatchInfo(matchId: number): Promise<MatchInfo | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error) {
    console.error('경기 정보 로드 에러:', error);
    return null;
  }

  return data;
}

// 기존 출석 데이터 가져오기
export async function getAttendanceData(matchId: number, matchNumber: number = 1): Promise<AttendanceStatus[]> {
  const { data, error } = await supabase
    .from('match_attendance')
    .select('player_id, status')
    .eq('match_id', matchId)
    .eq('match_number', matchNumber);

  if (error) {
    console.error('기존 출석 데이터 로드 에러:', error);
    return [];
  }

  return (data || []).map(item => ({
    player_id: item.player_id,
    status: item.status as 'attending' | 'not_attending' | 'pending'
  }));
}

// 출석 데이터 저장
export async function saveAttendance(
  matchId: number,
  playerIds: string[],
  matchNumber: number = 1
): Promise<void> {
  // 기존 출석 데이터 삭제
  const { error: deleteError } = await supabase
    .from('match_attendance')
    .delete()
    .eq('match_id', matchId)
    .eq('match_number', matchNumber);

  if (deleteError) {
    console.error('기존 출석 데이터 삭제 에러:', deleteError);
    throw deleteError;
  }

  // 새로운 출석 데이터 삽입
  const attendanceRecords = playerIds.map(playerId => ({
    match_id: matchId,
    match_number: matchNumber,
    player_id: playerId,
    status: 'attending' as const
  }));

  const { error: insertError } = await supabase
    .from('match_attendance')
    .insert(attendanceRecords);

  if (insertError) {
    console.error('출석 데이터 저장 에러:', insertError);
    throw insertError;
  }
}

// 출석 상태 업데이트
export async function updateAttendanceStatus(
  matchId: number,
  playerId: string,
  status: 'attending' | 'not_attending' | 'pending',
  matchNumber: number = 1
): Promise<void> {
  const { error } = await supabase
    .from('match_attendance')
    .upsert({
      match_id: matchId,
      match_number: matchNumber,
      player_id: playerId,
      status: status
    }, {
      onConflict: 'match_id,match_number,player_id'
    });

  if (error) {
    console.error('출석 상태 업데이트 에러:', error);
    throw error;
  }
}


