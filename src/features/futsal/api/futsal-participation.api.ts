import { supabase } from '@/shared/lib/supabase/client';
import type { ParticipationStatus, FutsalParticipationListItem } from '../types/futsal.types';

export async function getFutsalEventParticipationList(
  eventId: number
): Promise<FutsalParticipationListItem[]> {
  const { data, error } = await supabase
    .from('futsal_event_participation')
    .select('player_id, player_name, status')
    .eq('event_id', eventId)
    .order('status', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    player_id: row.player_id,
    player_name: row.player_name ?? null,
    status: row.status as ParticipationStatus,
  }));
}

export async function updateFutsalParticipation(
  eventId: number,
  playerId: string,
  status: ParticipationStatus
): Promise<void> {
  const { data: existing } = await supabase
    .from('futsal_event_participation')
    .select('id')
    .eq('event_id', eventId)
    .eq('player_id', playerId)
    .maybeSingle();

  const { data: player } = await supabase
    .from('players')
    .select('name')
    .eq('id', playerId)
    .maybeSingle();
  const playerName = player?.name ?? null;

  if (existing) {
    const { error } = await supabase
      .from('futsal_event_participation')
      .update({ status, player_name: playerName, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('futsal_event_participation').insert({
      event_id: eventId,
      player_id: playerId,
      player_name: playerName,
      status,
    });
    if (error) throw error;
  }
}
