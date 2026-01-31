import React, { useState } from 'react';
import Layout from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useMyFutsalAccessRequest } from '../hooks/use-futsal-access-requests';
import { useSportAccess } from '@/features/sport-access/hooks/use-sport-access';

/** 풋살 권한 없을 때: 안내 + 권한 요청 버튼(이미 요청함이면 "요청 대기 중" 표시) */
export function FutsalAccessDenied() {
  const { hasPending, loading, submitting, submitRequest } = useMyFutsalAccessRequest();
  const { refresh } = useSportAccess();
  const [message, setMessage] = useState('');

  const handleRequest = () => {
    submitRequest(message.trim() || undefined).then(() => setMessage(''));
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-6 max-w-md mx-auto">
        <p className="text-lg font-medium text-center">풋살 페이지 접근 권한이 없습니다.</p>
        <p className="text-muted-foreground text-sm text-center">
          풋살 관리자(system-manager 또는 futsal-manager)가 승인하면 이용할 수 있습니다.
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">확인 중...</p>
        ) : hasPending ? (
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-amber-600">권한 요청이 접수되었습니다.</p>
            <p className="text-xs text-muted-foreground">승인 후 페이지를 새로고침하면 이용 가능합니다.</p>
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              권한 상태 새로고침
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <Textarea
              placeholder="요청 사유 (선택)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button
              className="w-full"
              onClick={handleRequest}
              disabled={submitting}
            >
              {submitting ? '요청 중...' : '풋살 권한 요청'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
