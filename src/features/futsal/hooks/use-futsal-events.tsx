import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/use-auth';
import * as eventsApi from '../api/futsal-events.api';
import type { FutsalEventWithAttendance, FutsalEventFormData } from '../types/futsal.types';

export function useFutsalEvents() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [events, setEvents] = useState<FutsalEventWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getFutsalEvents(userId ?? null);
      setEvents(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '이벤트 목록을 불러오지 못했습니다.';
      setError(msg);
      toast({ title: '오류', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEvent = useCallback(
    async (form: FutsalEventFormData) => {
      const created = await eventsApi.createFutsalEvent(form, userId ?? null);
      await refresh();
      toast({ title: '이벤트가 등록되었습니다.' });
      return created;
    },
    [userId, refresh, toast]
  );

  const updateEvent = useCallback(
    async (eventId: number, form: FutsalEventFormData) => {
      await eventsApi.updateFutsalEvent(eventId, form);
      await refresh();
      toast({ title: '이벤트가 수정되었습니다.' });
    },
    [refresh, toast]
  );

  const deleteEvent = useCallback(
    async (eventId: number) => {
      await eventsApi.deleteFutsalEvent(eventId);
      await refresh();
      toast({ title: '이벤트가 삭제되었습니다.' });
    },
    [refresh, toast]
  );

  return { events, loading, error, refresh, createEvent, updateEvent, deleteEvent };
}
