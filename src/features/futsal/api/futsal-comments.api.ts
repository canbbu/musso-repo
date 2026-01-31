import { supabase } from '@/shared/lib/supabase/client';
import type { FutsalEventComment } from '../types/futsal.types';

export async function getFutsalEventComments(eventId: number): Promise<FutsalEventComment[]> {
  const { data, error } = await supabase
    .from('futsal_event_comments')
    .select('id, event_id, player_id, player_name, content, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    event_id: row.event_id,
    player_id: row.player_id,
    content: row.content,
    created_at: row.created_at,
    player_name: row.player_name ?? undefined,
  })) as FutsalEventComment[];
}

export async function addFutsalEventComment(eventId: number, playerId: string, content: string) {
  const { data: player } = await supabase
    .from('players')
    .select('name')
    .eq('id', playerId)
    .maybeSingle();
  const playerName = player?.name ?? null;

  const { data, error } = await supabase
    .from('futsal_event_comments')
    .insert({ event_id: eventId, player_id: playerId, player_name: playerName, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFutsalEventComment(commentId: number): Promise<void> {
  const { error } = await supabase.from('futsal_event_comments').delete().eq('id', commentId);
  if (error) throw error;
}
