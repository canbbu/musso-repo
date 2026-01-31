import React from 'react';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { usePlayersWithSportAccess } from '@/features/sport-access/hooks/use-sport-access';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Users } from 'lucide-react';
import type { SportType } from '@/features/sport-access/api/sport-access.api';

export default function FutsalMembersPage() {
  const { players, loading, error, setAccess } = usePlayersWithSportAccess('futsal' as SportType);
  const { canManageFutsal } = useAuth();
  const futsalMembers = players.filter((p) => p.can_access);

  if (!canManageFutsal?.()) {
    return (
      <Layout>
        <div className="text-destructive">풋살 권한 관리는 system-manager 또는 futsal-manager만 접근할 수 있습니다.</div>
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
          <Users className="h-6 w-6" />
          풋살 회원 권한 관리
        </h1>
        <p className="text-muted-foreground text-sm">
          풋살 권한이 있는 회원만 표시됩니다. 스위치로 권한을 해제할 수 있습니다.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">풋살 권한 회원 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {futsalMembers.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {p.username && (
                      <span className="text-muted-foreground text-sm ml-2">({p.username})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {p.can_access ? '접근 가능' : '접근 불가'}
                    </span>
                    <Switch
                      checked={p.can_access}
                      onCheckedChange={(checked) => setAccess(p.id, checked)}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {futsalMembers.length === 0 && (
              <p className="text-muted-foreground text-center py-8">풋살 권한이 있는 회원이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
