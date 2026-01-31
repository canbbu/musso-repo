import React from 'react';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useFutsalAccessRequests } from '@/features/futsal/hooks/use-futsal-access-requests';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { format } from 'date-fns';
import { UserCheck, UserX, Inbox } from 'lucide-react';

export default function FutsalAccessRequestsPage() {
  const { requests, loading, error, approve, reject } = useFutsalAccessRequests();
  const { canManageFutsal } = useAuth();

  if (!canManageFutsal?.()) {
    return (
      <Layout>
        <div className="text-destructive">풋살 권한 요청 관리는 system-manager 또는 futsal-manager만 접근할 수 있습니다.</div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">로딩 중...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-destructive">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Inbox className="h-6 w-6" />
          풋살 권한 요청 관리
        </h1>
        <p className="text-muted-foreground text-sm">
          풋살 접근 권한을 요청한 회원을 승인하거나 거절할 수 있습니다.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">대기 중인 요청</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">대기 중인 요청이 없습니다.</p>
            ) : (
              <ul className="space-y-4">
                {requests.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{req.player_name ?? '이름 없음'}</p>
                      {req.player_username && (
                        <p className="text-sm text-muted-foreground">@{req.player_username}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(req.requested_at), 'yyyy.MM.dd HH:mm')} 요청
                      </p>
                      {req.message && (
                        <p className="text-sm text-muted-foreground mt-2">"{req.message}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approve(req.id)}>
                        <UserCheck className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(req.id)}>
                        <UserX className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
