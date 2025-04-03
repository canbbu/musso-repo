
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { usePlayerStats } from '@/hooks/use-player-stats';
import MatchSelector from '@/components/stats/MatchSelector';
import StatsCard from '@/components/stats/StatsCard';
import NoMatchesInfo from '@/components/match/NoMatchesInfo';

const StatsManagement = () => {
  const { canManagePlayerStats } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    matches,
    selectedMatch,
    setSelectedMatch,
    playerStats,
    isLoading,
    handleStatChange,
    formatDate
  } = usePlayerStats();
  
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
    // In a real app, we would send this data to an API
    toast({
      title: "선수 기록 저장 완료",
      description: `${playerStats.length}명의 선수 기록이 저장되었습니다.`,
    });
  };

  const selectedMatchData = selectedMatch ? matches.find(m => m.id === selectedMatch) : null;

  return (
    <div className="stats-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">선수 기록 관리</h1>
        <p className="text-gray-600">선수들의 경기 출석, 득점, 어시스트, 평점을 기록합니다.</p>
      </div>
      
      <MatchSelector 
        matches={matches}
        selectedMatch={selectedMatch}
        onMatchSelect={setSelectedMatch}
        formatDate={formatDate}
      />
      
      {selectedMatch && selectedMatchData && (
        <StatsCard
          matchDate={formatDate(selectedMatchData.date)}
          opponent={selectedMatchData.opponent}
          playerStats={playerStats}
          onStatChange={handleStatChange}
          onSave={handleSaveStats}
          isLoading={isLoading}
        />
      )}
      
      {!selectedMatch && (
        <NoMatchesInfo message="기록을 관리할 경기를 선택해주세요." />
      )}
    </div>
  );
};

export default StatsManagement;
