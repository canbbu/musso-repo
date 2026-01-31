import { supabase } from '@/shared/lib/supabase/client';
import type { FutsalEvent, FutsalEventFormData, FutsalEventWithAttendance } from '../types/futsal.types';

export async function getFutsalEvents(userId?: string | null): Promise<FutsalEventWithAttendance[]> {
  const { data: eventsData, error: eventsError } = await supabase
    .from('futsal_events')
    .select('*')
    .order('date', { ascending: true });

  if (eventsError) throw eventsError;
  if (!eventsData) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const withAttendance = await Promise.all(
    eventsData.map(async (ev) => {
      const { data: partData, error: partError } = await supabase
        .from('futsal_event_participation')
        .select('player_id, status')
        .eq('event_id', ev.id);

      if (partError) throw partError;

      const attendance = { attending: 0, notAttending: 0, pending: 0 };
      let userResponse: 'attending' | 'not_attending' | 'pending' | null = null;

      partData?.forEach((p) => {
        if (p.status === 'attending') attendance.attending++;
        else if (p.status === 'not_attending') attendance.notAttending++;
        else attendance.pending++;
        if (userId && p.player_id === userId) userResponse = p.status as 'attending' | 'not_attending' | 'pending';
      });

      const eventDate = new Date(ev.date);
      let status = ev.status as FutsalEventWithAttendance['status'];
      if (status !== 'cancelled' && eventDate < today) status = 'completed';
      else if (status !== 'cancelled' && eventDate >= today) status = 'upcoming';

      return {
        ...ev,
        status,
        attendance,
        userResponse,
      } as FutsalEventWithAttendance;
    })
  );

  const past = withAttendance.filter((e) => new Date(e.date) < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const future = withAttendance.filter((e) => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return [...future, ...past];
}

export async function getFutsalEventById(eventId: number, userId?: string | null): Promise<FutsalEventWithAttendance | null> {
  const { data: ev, error: evError } = await supabase.from('futsal_events').select('*').eq('id', eventId).single();
  if (evError || !ev) return null;

  const { data: partData, error: partError } = await supabase
    .from('futsal_event_participation')
    .select('player_id, status')
    .eq('event_id', eventId);
  if (partError) throw partError;

  const attendance = { attending: 0, notAttending: 0, pending: 0 };
  let userResponse: 'attending' | 'not_attending' | 'pending' | null = null;
  partData?.forEach((p) => {
    if (p.status === 'attending') attendance.attending++;
    else if (p.status === 'not_attending') attendance.notAttending++;
    else attendance.pending++;
    if (userId && p.player_id === userId) userResponse = p.status as 'attending' | 'not_attending' | 'pending';
  });

  const eventDate = new Date(ev.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let status = ev.status as FutsalEventWithAttendance['status'];
  if (status !== 'cancelled' && eventDate < today) status = 'completed';
  else if (status !== 'cancelled' && eventDate >= today) status = 'upcoming';

  return { ...ev, status, attendance, userResponse } as FutsalEventWithAttendance;
}

export async function createFutsalEvent(form: FutsalEventFormData, createdBy: string | null) {
  const dateOnly = form.date.includes('T') ? form.date.split('T')[0] : form.date;
  const { data, error } = await supabase
    .from('futsal_events')
    .insert({
      title: form.title,
      date: dateOnly,
      time: form.time || null,
      location: form.location,
      description: form.description || null,
      status: form.status || 'upcoming',
      created_by: createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FutsalEvent;
}

export async function updateFutsalEvent(eventId: number, form: FutsalEventFormData) {
  const dateOnly = form.date.includes('T') ? form.date.split('T')[0] : form.date;
  const { data, error } = await supabase
    .from('futsal_events')
    .update({
      title: form.title,
      date: dateOnly,
      time: form.time || null,
      location: form.location,
      description: form.description || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data as FutsalEvent;
}

export async function deleteFutsalEvent(eventId: number): Promise<void> {
  const { error: partError } = await supabase.from('futsal_event_participation').delete().eq('event_id', eventId);
  if (partError) throw partError;
  const { error: commentError } = await supabase.from('futsal_event_comments').delete().eq('event_id', eventId);
  if (commentError) throw commentError;
  const { error: eventError } = await supabase.from('futsal_events').delete().eq('id', eventId);
  if (eventError) throw eventError;
}
