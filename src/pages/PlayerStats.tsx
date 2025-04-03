
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Star } from "lucide-react";
import StatCard from '@/components/stats/StatCard';
import RankingTable from '@/components/stats/RankingTable';
import { usePlayerRankings } from '@/hooks/use-player-rankings';

const PlayerStats = () => {
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  const {
    activeTab,
    setActiveTab,
    goalRanking,
    assistRanking,
    attendanceRanking,
    ratingRanking,
    getCurrentRanking
  } = usePlayerRankings();

  return (
    <div className="player-stats-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">시즌 랭킹</h1>
        <p className="text-gray-600">선수들의 시즌 기록과 순위를 확인하세요.</p>
        
        {canManagePlayerStats() && (
          <div className="mt-4">
            <Button onClick={() => navigate('/stats-management')} className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              선수 기록 관리
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          type="goals" 
          isActive={activeTab === 'goals'} 
          topPlayer={goalRanking[0]} 
          onClick={() => setActiveTab('goals')} 
        />
        
        <StatCard 
          type="assists" 
          isActive={activeTab === 'assists'} 
          topPlayer={assistRanking[0]} 
          onClick={() => setActiveTab('assists')} 
        />
        
        <StatCard 
          type="attendance" 
          isActive={activeTab === 'attendance'} 
          topPlayer={attendanceRanking[0]} 
          onClick={() => setActiveTab('attendance')} 
        />
        
        <StatCard 
          type="rating" 
          isActive={activeTab === 'rating'} 
          topPlayer={ratingRanking[0]} 
          onClick={() => setActiveTab('rating')} 
        />
      </div>
      
      <RankingTable activeTab={activeTab} players={getCurrentRanking()} />
    </div>
  );
};

export default PlayerStats;
