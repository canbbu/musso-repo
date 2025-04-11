import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import MatchSection from '@/components/match/MatchSection';
import PlayerAttendanceForm from '@/components/match/PlayerAttendanceForm';
import { useMatchData } from '@/hooks/use-match-data';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck } from 'lucide-react';

const MatchManagement = () => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { matches, handleAttendanceChange } = useMatchData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canManageMatches, canManagePlayerStats } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const matchId = params.get('matchId');
    if (matchId) {
      setSelectedMatchId(matchId);
      setDialogOpen(true);
    }
  }, [location]);
  
  useEffect(() => {
    if (!canManageMatches()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "경기 관리 페이지는 감독만 접근할 수 있습니다.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [canManageMatches, navigate, toast]);
  
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

  const navigateToStatsManagement = (matchId: number) => {
    navigate(`/stats-management?matchId=${matchId}`);
  };

  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');
  
  const selectedMatch = matches.find(m => m.id === Number(selectedMatchId));

  const isCoach = canManageMatches();
  const canManageStats = canManagePlayerStats();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">경기 일정</h1>
        <p className="text-gray-600">팀의 경기 일정을 확인하고 출석을 체크합니다.</p>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">예정된 경기</TabsTrigger>
          <TabsTrigger value="completed">완료된 경기</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <MatchSection 
            title="다가오는 경기"
            matches={upcomingMatches}
            onAttendanceChange={handleAttendanceChange}
            canManageAnnouncements={isCoach}
            emptyMessage="등록된 예정 경기가 없습니다."
            showAddButton={isCoach}
            onAddClick={() => console.log('Adding new match')}
            onViewMatch={handleViewMatch}
          />
        </TabsContent>
        <TabsContent value="completed">
          <MatchSection 
            title="완료된 경기"
            matches={completedMatches}
            onAttendanceChange={() => {}}
            canManageAnnouncements={isCoach}
            emptyMessage="완료된 경기가 없습니다."
            onViewMatch={handleViewMatch}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMatch ? `${selectedMatch.opponent} 경기 상세` : '경기 상세'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <>
              <PlayerAttendanceForm 
                matchId={getSelectedMatchAsNumber() || 0}
                matchDate={selectedMatch.date}
                opponent={selectedMatch.opponent}
                players={[]}  // This would need real player data
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
    </Layout>
  );
};

export default MatchManagement;
