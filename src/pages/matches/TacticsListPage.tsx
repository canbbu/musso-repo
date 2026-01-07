import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useMatchTactics } from '@/features/matches/hooks/use-match-tactics';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/shared/hooks/use-toast';
import { Match } from '@/features/matches/types/match.types';
import { ClipboardCheck, ClipboardList } from 'lucide-react';

interface MatchWithTactics extends Match {
  hasTactics?: boolean;
  tacticsCount?: number;
}

const TacticsList: React.FC = () => {
  const navigate = useNavigate();
  const { matches, loading, error, checkTacticsExistence } = useMatchTactics();
  const { canManagePlayerStats, canManageMatches, isSystemManager } = useAuth();
  const { toast } = useToast();

  const handleTacticsClick = async (matchId: number) => {
    // 해당 경기에 이미 작전판이 있는지 확인
    const hasExistingTactics = await checkTacticsExistence(matchId);

    if (hasExistingTactics) {
      // 이미 작전판이 있으면 바로 작전판으로 이동
      navigate(`/tactics/${matchId}/1`);
    } else {
      // 감독, 코치, 시스템 관리자만 출석체크 가능
      if (!canManagePlayerStats()) {
        toast({
          title: "접근 제한",
          description: "작전판 생성은 감독, 코치, 시스템 관리자만 가능합니다.",
          variant: "destructive"
        });
        return;
      }

      // 작전판이 없으면 출석체크를 묻습니다
      const shouldCheckAttendance = window.confirm(
        '출석체크를 진행하시겠습니까?\n\n' +
        '전체 인원 중 오늘 출석한 인원을 선택하여 체크할 수 있습니다.'
      );
      
      if (shouldCheckAttendance) {
        // 출석체크 페이지로 이동
        navigate(`/attendance/${matchId}`);
      } else {
        // 바로 작전판 페이지로 이동
        navigate(`/tactics/${matchId}/1`);
      }
    }
  };

  const handleMatchRecordClick = (matchId: number) => {
    // 경기 기록 페이지로 이동 (작전판에서 온 것으로 표시)
    navigate(`/stats-management?matchId=${matchId}&matchNumber=1`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">예정</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">완료</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700">취소</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const canEditMatchRecord = (match: MatchWithTactics) => {
    // 감독, 코치, 시스템 관리자만 수정 가능
    if (!canManagePlayerStats()) return false;
    
    // 취소된 경기는 수정 불가
    if (match.status === 'cancelled') return false;
    
    // 완료된 경기는 3일이 지나면 수정 불가
    if (match.status === 'completed') {
      const matchDate = new Date(match.date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff <= 3;
    }
    
    return true;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">경기 목록을 불러오는 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">오류: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">작전판 관리</h1>
          <p className="text-gray-600">경기를 선택하여 작전판을 확인하고 편집할 수 있습니다.</p>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p>아직 등록된 경기가 없습니다.</p>
                <p className="mt-2">경기 관리에서 먼저 경기를 등록해주세요.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => {
              const canEdit = canEditMatchRecord(match);
              const isReadOnly = !canEdit && match.status === 'completed';
              
              return (
              <Card 
                key={match.id}
                className="transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">경기 #{match.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(match.status)}
                      {match.hasTactics && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          작전판 {match.tacticsCount}개
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">상대팀:</span>
                      <span className="text-sm font-medium">
                        {match.opponent || '미정'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">날짜:</span>
                      <span className="text-sm">
                        {formatDate(match.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">장소:</span>
                      <span className="text-sm">
                        {match.location || '미정'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    {match.hasTactics ? (
                      <div className="text-sm text-green-600">
                        ✓ 작전판이 생성되어 있습니다
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        아직 작전판이 없습니다
                      </div>
                    )}
                    {isReadOnly && (
                      <div className="text-xs text-gray-400 mt-2">
                        (3일이 지나 수정이 제한됩니다)
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTacticsClick(match.id)}
                    >
                      <ClipboardList className="w-4 h-4 mr-1" />
                      작전판보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMatchRecordClick(match.id)}
                    >
                      <ClipboardCheck className="w-4 h-4 mr-1" />
                      {canEdit ? '경기기록보기' : '기록보기'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TacticsList; 