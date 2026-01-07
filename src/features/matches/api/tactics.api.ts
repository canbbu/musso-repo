// Tactics API 함수들
import { supabase } from '@/shared/lib/supabase/client';
import { Tactics, TacticsPlayer, TacticsFormData } from '../types/match.types';

// 작전판 가져오기
export async function getTactics(matchId: number, matchNumber: number = 1): Promise<Tactics | null> {
  const { data: tacticsData, error: tacticsError } = await supabase
    .from('tactics')
    .select('*')
    .eq('match_id', matchId)
    .eq('match_number', matchNumber)
    .maybeSingle();

  if (tacticsError && tacticsError.code !== 'PGRST116') {
    throw tacticsError;
  }

  if (!tacticsData) {
    return {
      id: 0,
      match_id: matchId,
      match_number: matchNumber,
      name: `경기 #${matchId} - ${matchNumber}경기 작전판`,
      team_a_strategy: '',
      team_b_strategy: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 선수 정보 가져오기
  const { data: playersData, error: playersError } = await supabase
    .from('match_attendance')
    .select('*, players:player_id(id, name)')
    .eq('match_id', matchId)
    .eq('match_number', matchNumber);

  if (playersError) throw playersError;

  const players: TacticsPlayer[] = (playersData || [])
    .filter(player => player.tactics_position_x !== null && player.tactics_position_y !== null)
    .map(player => ({
      id: player.id,
      match_id: player.match_id,
      match_number: player.match_number,
      player_id: player.player_id,
      status: player.status,
      goals: player.goals || 0,
      assists: player.assists || 0,
      rating: player.rating || 0,
      tactics_position_x: player.tactics_position_x,
      tactics_position_y: player.tactics_position_y,
      tactics_team: player.tactics_team,
      substitutions: player.substitutions || 0,
      is_substituted: player.is_substituted || false,
      player_name: Array.isArray(player.players) ? player.players[0]?.name : player.players?.name || 'Unknown'
    }));

  return {
    id: tacticsData.id,
    match_id: tacticsData.match_id,
    match_number: tacticsData.match_number,
    name: tacticsData.name,
    team_a_strategy: tacticsData.team_a_strategy || '',
    team_b_strategy: tacticsData.team_b_strategy || '',
    created_by: tacticsData.created_by || '',
    created_at: tacticsData.created_at,
    updated_at: tacticsData.updated_at,
    players
  };
}

// 작전판 저장/업데이트
export async function saveTactics(formData: TacticsFormData) {
  const tacticsData = {
    match_id: formData.match_id,
    match_number: formData.match_number,
    name: formData.name,
    team_a_strategy: formData.team_a_strategy,
    team_b_strategy: formData.team_b_strategy,
    created_by: null,
    updated_at: new Date().toISOString()
  };

  const { data: existingTactics, error: fetchError } = await supabase
    .from('tactics')
    .select('id')
    .eq('match_id', formData.match_id)
    .eq('match_number', formData.match_number)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  let tacticsResult;
  if (existingTactics) {
    const { data, error } = await supabase
      .from('tactics')
      .update(tacticsData)
      .eq('id', existingTactics.id)
      .select('*');

    if (error) throw error;
    tacticsResult = data;
  } else {
    const { data, error } = await supabase
      .from('tactics')
      .insert(tacticsData)
      .select('*');

    if (error) throw error;
    tacticsResult = data;
  }

  // match_attendance 테이블에 선수별 상세 정보 저장
  for (const player of formData.players) {
    const isOpponentTeam = player.player_id && player.player_id.startsWith('opponent_');
    if (isOpponentTeam) continue;

    const { data: existingData } = await supabase
      .from('match_attendance')
      .select('*')
      .eq('match_id', formData.match_id)
      .eq('match_number', formData.match_number)
      .eq('player_id', player.player_id)
      .maybeSingle();

    const updateData = {
      match_id: formData.match_id,
      match_number: formData.match_number,
      player_id: player.player_id,
      status: 'attending' as const,
      goals: player.goals || existingData?.goals || 0,
      assists: player.assists || existingData?.assists || 0,
      rating: existingData?.rating || 0,
      tactics_position_x: player.tactics_position_x,
      tactics_position_y: player.tactics_position_y,
      tactics_team: player.tactics_team,
      substitutions: player.substitutions || existingData?.substitutions || 0,
      is_substituted: player.is_substituted || existingData?.is_substituted || false,
      goal_timestamp: existingData?.goal_timestamp,
      assist_timestamp: existingData?.assist_timestamp
    };

    const { error: upsertError } = await supabase
      .from('match_attendance')
      .upsert(updateData, {
        onConflict: 'match_id,match_number,player_id'
      });

    if (upsertError) {
      console.error('match_attendance upsert error:', upsertError, player);
    }
  }

  return tacticsResult;
}

// 경기별 작전판 목록 가져오기
export async function getTacticsList(matchId: number) {
  const { data, error } = await supabase
    .from('tactics')
    .select('*')
    .eq('match_id', matchId)
    .order('match_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

// 경기별 참석 선수 목록 가져오기
export async function getMatchPlayers(matchId: number, matchNumber: number) {
  const { data, error } = await supabase
    .from('match_attendance')
    .select(`
      *,
      players:player_id (
        id,
        name,
        position
      )
    `)
    .eq('match_id', matchId)
    .eq('match_number', matchNumber)
    .eq('status', 'attending');

  if (error) throw error;
  return data || [];
}


