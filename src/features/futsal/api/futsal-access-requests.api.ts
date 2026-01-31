import { supabase } from '@/shared/lib/supabase/client';
import * as sportAccessApi from '@/features/sport-access/api/sport-access.api';

export type FutsalAccessRequestStatus = 'pending' | 'approved' | 'rejected';

export interface FutsalAccessRequest {
  id: number;
  player_id: string;
  status: FutsalAccessRequestStatus;
  message: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  player_name?: string;
  player_username?: string;
}

/** 풋살 접근 권한 요청 생성 (이미 pending 있으면 에러) */
export async function createFutsalAccessRequest(
  playerId: string,
  message?: string
): Promise<{ id: number }> {
  const { data: player } = await supabase
    .from('players')
    .select('name, username')
    .eq('id', playerId)
    .maybeSingle();

  const { data, error } = await supabase
    .from('futsal_access_requests')
    .insert({
      player_id: playerId,
      player_name: player?.name ?? null,
      status: 'pending',
      message: message ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id };
}

/** 현재 유저의 pending 요청 존재 여부 */
export async function hasPendingFutsalRequest(playerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('futsal_access_requests')
    .select('id')
    .eq('player_id', playerId)
    .eq('status', 'pending')
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** pending 요청 목록 (권한자용, 요청자 이름은 테이블 컬럼 사용) */
export async function getPendingFutsalAccessRequests(): Promise<FutsalAccessRequest[]> {
  const { data, error } = await supabase
    .from('futsal_access_requests')
    .select('id, player_id, player_name, status, message, requested_at, reviewed_at, reviewed_by')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    player_id: row.player_id,
    status: row.status,
    message: row.message,
    requested_at: row.requested_at,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    player_name: row.player_name ?? undefined,
    player_username: undefined,
  })) as FutsalAccessRequest[];
}

/** 요청 승인: status 업데이트 + player_sport_access에 futsal 접근 부여 */
export async function approveFutsalAccessRequest(
  requestId: number,
  reviewedBy: string
): Promise<void> {
  const { data: req, error: fetchError } = await supabase
    .from('futsal_access_requests')
    .select('player_id')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single();
  if (fetchError || !req) throw new Error('요청을 찾을 수 없거나 이미 처리되었습니다.');

  const { error: updateError } = await supabase
    .from('futsal_access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', requestId);
  if (updateError) throw updateError;

  await sportAccessApi.setPlayerSportAccess(req.player_id, 'futsal', true);
}

/** 요청 거절 */
export async function rejectFutsalAccessRequest(
  requestId: number,
  reviewedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('futsal_access_requests')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', requestId)
    .eq('status', 'pending');
  if (error) throw error;
}
