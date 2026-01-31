import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/use-auth';
import * as eventsApi from '../api/futsal-events.api';
import * as participationApi from '../api/futsal-participation.api';
import * as commentsApi from '../api/futsal-comments.api';
import type { FutsalEventWithAttendance, ParticipationStatus, FutsalEventComment } from '../types/futsal.types';

export function useFutsalEventDetail(eventId: number | null) {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [event, setEvent] = useState<FutsalEventWithAttendance | null>(null);
  const [comments, setComments] = useState<FutsalEventComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEvent = useCallback(async () => {
    if (eventId == null) {
      setEvent(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getFutsalEventById(eventId, userId ?? null);
      setEvent(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '이벤트를 불러오지 못했습니다.';
      setError(msg);
      toast({ title: '오류', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [eventId, userId, toast]);

  const refreshComments = useCallback(async () => {
    if (eventId == null) return;
    try {
      const data = await commentsApi.getFutsalEventComments(eventId);
      setComments(data);
    } catch (e) {
      console.error('댓글 로드 실패:', e);
    }
  }, [eventId]);

  useEffect(() => {
    refreshEvent();
  }, [refreshEvent]);

  useEffect(() => {
    refreshComments();
  }, [refreshComments]);

  const setParticipation = useCallback(
    async (status: ParticipationStatus) => {
      if (eventId == null || !userId) return;
      try {
        await participationApi.updateFutsalParticipation(eventId, userId, status);
        await refreshEvent();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '참가 상태 변경에 실패했습니다.';
        toast({ title: '오류', description: msg, variant: 'destructive' });
      }
    },
    [eventId, userId, refreshEvent, toast]
  );

  const addComment = useCallback(
    async (content: string) => {
      if (eventId == null || !userId) return;
      try {
        await commentsApi.addFutsalEventComment(eventId, userId, content);
        await refreshComments();
      } catch (e) {
        const msg = e instanceof Error ? e.message : '댓글 등록에 실패했습니다.';
        toast({ title: '오류', description: msg, variant: 'destructive' });
      }
    },
    [eventId, userId, refreshComments, toast]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      try {
        await commentsApi.deleteFutsalEventComment(commentId);
        await refreshComments();
        toast({ title: '댓글이 삭제되었습니다.' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '댓글 삭제에 실패했습니다.';
        toast({ title: '오류', description: msg, variant: 'destructive' });
      }
    },
    [refreshComments, toast]
  );

  return {
    event,
    comments,
    loading,
    error,
    refreshEvent,
    refreshComments,
    setParticipation,
    addComment,
    deleteComment,
  };
}
