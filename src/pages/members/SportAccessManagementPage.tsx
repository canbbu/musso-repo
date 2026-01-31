import React from 'react';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { usePlayersWithAllSportAccess } from '@/features/sport-access/hooks/use-sport-access';
import { useSoccerAccessRequests } from '@/features/sport-access/hooks/use-soccer-access-requests';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Users, UserPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

export default function SportAccessManagementPage() {
  const { players, loading, error, setSoccerAccess, setFutsalAccess } = usePlayersWithAllSportAccess();
  const { requests: soccerRequests, loading: soccerLoading, approve: approveSoccer, reject: rejectSoccer } = useSoccerAccessRequests();
  const { isSystemManager } = useAuth();

  if (!isSystemManager?.()) {
    return (
      <Layout>
        <div className="text-destructive">축구/풋살 전체 권한 관리는 system-manager만 접근할 수 있습니다.</div>
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

  const soccerPlayers = players.filter((p) => p.soccer_access);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          스포츠 권한 관리
        </h1>
        <p className="text-muted-foreground text-sm">
          축구 권한이 있는 회원에 대해서만 축구·풋살 접근 권한을 설정할 수 있습니다.
        </p>
        {soccerRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                축구 권한 요청 ({soccerRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {soccerRequests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <span className="font-medium">{r.player_name ?? '-'}</span>
                      {r.player_username && (
                        <span className="text-muted-foreground text-sm ml-2">({r.player_username})</span>
                      )}
                      {r.message && (
                        <p className="text-xs text-muted-foreground mt-1">{r.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => approveSoccer(r.id)} disabled={soccerLoading}>
                        승인
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectSoccer(r.id)} disabled={soccerLoading}>
                        거절
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">축구 권한이 있는 회원 (축구 / 풋살 권한 설정)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead className="text-muted-foreground">아이디</TableHead>
                  <TableHead className="w-[120px] text-center">축구</TableHead>
                  <TableHead className="w-[120px] text-center">풋살</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soccerPlayers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.username ?? '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {p.soccer_access ? '가능' : '불가'}
                        </span>
                        <Switch
                          checked={p.soccer_access}
                          onCheckedChange={(checked) => setSoccerAccess(p.id, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {p.futsal_access ? '가능' : '불가'}
                        </span>
                        <Switch
                          checked={p.futsal_access}
                          onCheckedChange={(checked) => setFutsalAccess(p.id, checked)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {soccerPlayers.length === 0 && (
              <p className="text-muted-foreground text-center py-8">축구 권한이 있는 회원이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
