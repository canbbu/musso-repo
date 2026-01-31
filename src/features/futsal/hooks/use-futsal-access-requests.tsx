import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/use-auth';
import * as api from '../api/futsal-access-requests.api';
import type { FutsalAccessRequest } from '../api/futsal-access-requests.api';

/** 권한자용: pending 요청 목록, 승인, 거절 */
export function useFutsalAccessRequests() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [requests, setRequests] = useState<FutsalAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPendingFutsalAccessRequests();
      setRequests(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '목록을 불러오지 못했습니다.';
      setError(msg);
      toast({ title: '오류', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approve = useCallback(
    async (requestId: number) => {
      if (!userId) return;
      try {
        await api.approveFutsalAccessRequest(requestId, userId);
        await refresh();
        toast({ title: '승인했습니다.' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '승인 처리에 실패했습니다.';
        toast({ title: '오류', description: msg, variant: 'destructive' });
      }
    },
    [userId, refresh, toast]
  );

  const reject = useCallback(
    async (requestId: number) => {
      if (!userId) return;
      try {
        await api.rejectFutsalAccessRequest(requestId, userId);
        await refresh();
        toast({ title: '거절했습니다.' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '거절 처리에 실패했습니다.';
        toast({ title: '오류', description: msg, variant: 'destructive' });
      }
    },
    [userId, refresh, toast]
  );

  return { requests, loading, error, refresh, approve, reject };
}

/** 일반 유저용: pending 여부, 요청 생성 */
export function useMyFutsalAccessRequest() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [hasPending, setHasPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const checkPending = useCallback(async () => {
    if (!userId) {
      setHasPending(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await api.hasPendingFutsalRequest(userId);
      setHasPending(result);
    } catch (e) {
      setHasPending(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkPending();
  }, [checkPending]);

  const submitRequest = useCallback(
    async (message?: string) => {
      if (!userId) return;
      try {
        setSubmitting(true);
        await api.createFutsalAccessRequest(userId, message);
        setHasPending(true);
        toast({ title: '권한 요청이 접수되었습니다. 승인 후 이용 가능합니다.' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '요청 전송에 실패했습니다.';
        toast({ title: '오류', description: msg, variant: 'destructive' });
      } finally {
        setSubmitting(false);
      }
    },
    [userId, toast]
  );

  return { hasPending, loading, submitting, checkPending, submitRequest };
}
