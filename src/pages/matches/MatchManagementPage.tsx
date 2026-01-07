import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/shared/components/ui/dialog";
import MatchSection from '@/features/matches/components/match/MatchSection';
import PlayerAttendanceForm from '@/features/matches/components/match/PlayerAttendanceForm';
import { useMatchData } from '@/features/matches/hooks/use-match-data';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/shared/hooks/use-toast';
import { ClipboardCheck, Plus } from 'lucide-react';
import MatchForm from '@/features/matches/components/match/MatchForm';

const MatchManagement = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { 
    matches, 
    loading, 
    handleAttendanceChange,
    createMatch,
    updateMatch,
    deleteMatch,
    refreshMatches,
    error
  } = useMatchData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const { canManageMatches, canManagePlayerStats, userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const matchId = params.get('id');
    if (matchId) {
      setSelectedMatchId(matchId);
      setDialogOpen(true);
    }
  }, [location]);
  
  const getSelectedMatchAsNumber = () => {
    return selectedMatchId ? Number(selectedMatchId) : null;
  };
  
  const handleViewMatch = (matchId: number) => {
    setSelectedMatchId(matchId.toString());
    setDialogOpen(true);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMatchId(null);
  };

  const handleCreateClick = () => {
    if (!canManageMatches()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "이벤트 등록은 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    
    setEditMode(false);
    setCreateDialogOpen(true);
  };
  
  const handleEditClick = (matchId: number) => {
    if (!canManageMatches()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "이벤트 수정은 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedMatchId(matchId.toString());
    setEditMode(true);
    setCreateDialogOpen(true);
  };
  
  const handleCreateMatch = async (matchData: any) => {
    try {
      // localStorage에서 username 가져오기 (예: 'username' 키로 저장되어 있다고 가정)
      const username = localStorage.getItem('userName') || '알수없음';
      
      // matchData에 username 추가
      await createMatch(matchData, username);

      setCreateDialogOpen(false);
      toast({
        title: "등록 완료",
        description: "새 이벤트가 등록되었습니다.",
      });
    } catch (err) {
      console.error('이벤트 생성 중 오류:', err);
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : "이벤트 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateMatch = async (matchData: any) => {
    try {
      const matchId = getSelectedMatchAsNumber();
      if (matchId) {
        const username = localStorage.getItem('userName') || '알수없음';
        await updateMatch(matchId, matchData, username);
        setCreateDialogOpen(false);
        toast({
          title: "수정 완료",
          description: "이벤트 정보가 수정되었습니다.",
        });
      }
    } catch (err) {
      toast({
        title: "오류 발생",
        description: error || "이벤트 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteMatch = async (matchId: number) => {
    if (!canManageMatches()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "이벤트 삭제는 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      try {
        await deleteMatch(matchId);
        toast({
          title: "삭제 완료",
          description: "이벤트가 삭제되었습니다.",
        });
      } catch (err) {
        toast({
          title: "오류 발생",
          description: error || "이벤트 삭제 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    }
  };

  const navigateToStatsManagement = (matchId: number) => {
    if (!canManagePlayerStats()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "선수 기록 입력은 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/stats-management?matchId=${matchId}`);
  };

  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  const canceledMatches = matches.filter(match => match.status === 'cancelled');
  
  const selectedMatch = matches.find(m => m.id === Number(selectedMatchId));

  const isCoach = canManageMatches();
  const canManageStats = canManagePlayerStats();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>데이터 로딩 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">이벤트 일정</h1>
        <p className="text-gray-600">팀의 이벤트 일정을 확인하고 출석을 체크합니다.</p>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateClick} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          새 이벤트 등록
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">예정된 이벤트</TabsTrigger>
          <TabsTrigger value="completed">완료된 이벤트</TabsTrigger>
          <TabsTrigger value="canceled">취소된 이벤트</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <MatchSection 
            title="다가오는 이벤트"
            matches={upcomingMatches}
            onAttendanceChange={(matchId, status) => handleAttendanceChange(matchId, status, userId!)}
            canManageAnnouncements={isCoach}
            emptyMessage="등록된 예정 이벤트가 없습니다."
            showAddButton={false}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteMatch}
            onViewMatch={handleViewMatch}
          />
        </TabsContent>
        <TabsContent value="completed">
          <MatchSection 
            title="완료된 이벤트"
            matches={completedMatches}
            onAttendanceChange={() => {}}
            canManageAnnouncements={isCoach}
            emptyMessage="완료된 이벤트가 없습니다."
            onViewMatch={handleViewMatch}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteMatch}
          />
        </TabsContent>
        <TabsContent value="canceled">
          <MatchSection 
            title="취소된 이벤트"
            matches={canceledMatches}
            onAttendanceChange={() => {}}
            canManageAnnouncements={isCoach}
            emptyMessage="취소된 이벤트가 없습니다."
            onViewMatch={handleViewMatch}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteMatch}
          />
        </TabsContent>
      </Tabs>

      {/* 상세 보기 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMatch ? `${selectedMatch.opponent} 이벤트 상세` : '이벤트 상세'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <>
              <PlayerAttendanceForm 
                matchId={getSelectedMatchAsNumber() || 0}
                matchDate={selectedMatch.date}
                opponent={selectedMatch.opponent}
                players={[]}  // 추후 실제 선수 데이터 연동
                isCoach={isCoach}
              />
              
              {canManageStats && selectedMatch.status === 'completed' && (
                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => navigateToStatsManagement(selectedMatch.id)}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    선수 기록 입력
                  </Button>
                </div>
              )}
            </>
          )}
          
          <DialogFooter>
            <Button onClick={closeDialog}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 생성/수정 다이얼로그 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? '이벤트 수정' : '새 이벤트 등록'}</DialogTitle>
          </DialogHeader>
          
          <MatchForm
            editMode={editMode}
            matchId={getSelectedMatchAsNumber()}
            onSubmit={editMode ? handleUpdateMatch : handleCreateMatch}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MatchManagement;
