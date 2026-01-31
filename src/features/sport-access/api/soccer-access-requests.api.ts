import { supabase } from '@/shared/lib/supabase/client';
import * as sportAccessApi from './sport-access.api';

export type SoccerAccessRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SoccerAccessRequest {
  id: number;
  player_id: string;
  status: SoccerAccessRequestStatus;
  message: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  player_name?: string;
  player_username?: string;
}

/** 축구 접근 권한 요청 생성 */
export async function createSoccerAccessRequest(
  playerId: string,
  message?: string
): Promise<{ id: number }> {
  const { data, error } = await supabase
    .from('soccer_access_requests')
    .insert({
      player_id: playerId,
      status: 'pending',
      message: message ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id };
}

/** 현재 유저의 pending 요청 존재 여부 */
export async function hasPendingSoccerRequest(playerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('soccer_access_requests')
    .select('id')
    .eq('player_id', playerId)
    .eq('status', 'pending')
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** pending 요청 목록 (권한자용) */
export async function getPendingSoccerAccessRequests(): Promise<SoccerAccessRequest[]> {
  const { data, error } = await supabase
    .from('soccer_access_requests')
    .select(`
      id,
      player_id,
      status,
      message,
      requested_at,
      reviewed_at,
      reviewed_by,
      player:players(name, username)
    `)
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => {
    const raw = row.player ?? row.players;
    const player = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: row.id,
      player_id: row.player_id,
      status: row.status,
      message: row.message,
      requested_at: row.requested_at,
      reviewed_at: row.reviewed_at,
      reviewed_by: row.reviewed_by,
      player_name: player?.name,
      player_username: player?.username,
    };
  }) as SoccerAccessRequest[];
}

/** 요청 승인: status 업데이트 + player_sport_access에 soccer 접근 부여 */
export async function approveSoccerAccessRequest(
  requestId: number,
  reviewedBy: string
): Promise<void> {
  const { data: req, error: fetchError } = await supabase
    .from('soccer_access_requests')
    .select('player_id')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single();
  if (fetchError || !req) throw new Error('요청을 찾을 수 없거나 이미 처리되었습니다.');

  const { error: updateError } = await supabase
    .from('soccer_access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', requestId);
  if (updateError) throw updateError;

  await sportAccessApi.setPlayerSportAccess(req.player_id, 'soccer', true);
}

/** 요청 거절 */
export async function rejectSoccerAccessRequest(
  requestId: number,
  reviewedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('soccer_access_requests')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', requestId)
    .eq('status', 'pending');
  if (error) throw error;
}
