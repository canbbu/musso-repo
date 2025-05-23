import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { usePlayerStats } from '@/hooks/use-player-stats';
import MatchSelector from '@/components/stats/MatchSelector';
import StatsCard from '@/components/stats/StatsCard';
import NoMatchesInfo from '@/components/match/NoMatchesInfo';
import type { Match } from '@/types/dashboard';

const StatsManagement = () => {
  const { canManagePlayerStats } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const {
    matches,
    selectedMatch,
    setSelectedMatch,
    playerStats,
    isLoading,
    handleStatChange,
    handleAttendanceChange,
    formatDate
  } = usePlayerStats();

  const playerStatsForUI = playerStats.map(stat => ({
    ...stat,
    attended: stat.attendanceStatus === 'attending',
  }));
  
  const handleStatChangeForUI = (
    playerId: string,
    field: keyof typeof playerStatsForUI[0] | 'attended',
    value: any
  ) => {
    if (field === 'attended') {
      handleAttendanceChange(playerId, value ? 'attending' : 'not_attending');
    } else {
      handleStatChange(playerId, field, value);
    }
  };
  
  // Check if there's a matchId parameter in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const matchId = params.get('matchId');
    if (matchId) {
      setSelectedMatch(Number(matchId));
    }
  }, [location, setSelectedMatch]);
  
  useEffect(() => {
    // Redirect if no permissions
    if (!canManagePlayerStats()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "선수 기록 관리는 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      navigate('/stats');
    }
  }, [canManagePlayerStats, navigate, toast]);
  
  const handleSaveStats = () => {
    // 염지훈
    for (const stat of playerStats) {
      if(stat.attendanceStatus === "attending") {
        if (stat.rating === 0 || stat.rating === null) {
          
          toast({
            title: "저장 실패",
            description: "모든 선수의 평점이 입력되어야 저장할 수 있습니다.",
            style: { backgroundColor: "red" }, // 실패 색상
          });
          return false;
        }
      }
    }
    // In a real app, we would send this data to an API
    toast({
      title: "선수 기록 저장 완료",
      description: `${playerStats.length}명의 선수 기록이 저장되었습니다.`,
    });
    return true;
  };


  const selectedMatchData = selectedMatch ? matches.find(m => m.id === selectedMatch) : null;
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">선수 기록 관리</h1>
        <p className="text-gray-600">선수들의 이벤트 출석, 득점, 어시스트, :평점을 기록합니다.</p>
      </div>
      
      <MatchSelector 
        matches={matches as Match[]}
        selectedMatch={selectedMatch}
        onMatchSelect={setSelectedMatch}
        formatDate={formatDate}
      />
      
      {selectedMatch && selectedMatchData && (
        <StatsCard
          matchDate={formatDate(selectedMatchData.date)}
          opponent={selectedMatchData.opponent}
          playerStats={playerStatsForUI}
          onStatChange={handleStatChangeForUI}
          onSave={handleSaveStats}
          isLoading={isLoading}
        />
      )}
      
      {!selectedMatch && (
        <NoMatchesInfo message="기록을 관리할 이벤트를 선택해주세요." />
      )}
    </Layout>
  );
};

export default StatsManagement;
