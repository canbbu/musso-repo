import { supabase } from '@/shared/lib/supabase/client';
import { RunningRecord, RunningRecordFormData } from '../types/running.types';

// 런닝 기록 생성
export async function createRunningRecord(
  playerId: string,
  record: RunningRecordFormData
): Promise<RunningRecord> {
  // 평균 페이스 계산 (분/km)
  const pace = record.duration / record.distance;

  const { data, error } = await supabase
    .from('running_records')
    .insert({
      player_id: playerId,
      date: record.date,
      distance: record.distance,
      duration: record.duration,
      pace: Math.round(pace * 100) / 100, // 소수점 2자리
      notes: record.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 특정 날짜의 런닝 기록 가져오기
export async function getRunningRecordByDate(
  playerId: string,
  date: string
): Promise<RunningRecord | null> {
  const { data, error } = await supabase
    .from('running_records')
    .select('*')
    .eq('player_id', playerId)
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 선수의 모든 런닝 기록 가져오기
export async function getRunningRecordsByPlayer(
  playerId: string,
  year?: number
): Promise<RunningRecord[]> {
  let query = supabase
    .from('running_records')
    .select('*')
    .eq('player_id', playerId)
    .order('date', { ascending: false });

  if (year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    query = query.gte('date', startDate).lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// 런닝 기록 업데이트
export async function updateRunningRecord(
  recordId: number,
  record: Partial<RunningRecordFormData>
): Promise<RunningRecord> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (record.distance !== undefined) updateData.distance = record.distance;
  if (record.duration !== undefined) updateData.duration = record.duration;
  if (record.notes !== undefined) updateData.notes = record.notes || null;
  if (record.date !== undefined) updateData.date = record.date;

  // distance와 duration이 모두 있으면 pace 재계산
  if (record.distance !== undefined && record.duration !== undefined) {
    updateData.pace = Math.round((record.duration / record.distance) * 100) / 100;
  }

  const { data, error } = await supabase
    .from('running_records')
    .update(updateData)
    .eq('id', recordId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 런닝 기록 삭제
export async function deleteRunningRecord(recordId: number): Promise<void> {
  const { error } = await supabase
    .from('running_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
}
