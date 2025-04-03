
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMatchData } from '@/hooks/use-match-data';
import MatchStatsCard from '@/components/match/MatchStatsCard';
import MatchSection from '@/components/match/MatchSection';
import CompletedMatchSection from '@/components/match/CompletedMatchSection';
import PlayerAttendanceForm from '@/components/match/PlayerAttendanceForm';

interface Player {
  id: string;
  name: string;
}

const MatchManagement = () => {
  const { canManageAnnouncements, canManagePlayerStats } = useAuth();
  const { matches, selectedMatchId, handleAttendanceChange, currentYearMatches } = useMatchData();
  
  const [players] = useState<Player[]>([
    { id: 'player1', name: '김선수' },
    { id: 'player2', name: '이공격수' },
    { id: 'player3', name: '박수비' },
    { id: 'player4', name: '정미드필더' },
    { id: 'player5', name: '최골키퍼' },
    { id: 'player6', name: '강수비수' },
    { id: 'player7', name: '장미드필더' },
  ]);
  
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');

  const handleAddMatchClick = () => {
    window.location.href = "/announcement-management";
  };

  return (
    <div className="match-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">경기 관리</h1>
        <p className="text-gray-600">일정, 결과 및 모든 팀 경기 관리</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <MatchStatsCard currentYearMatches={currentYearMatches} />
      </div>

      <MatchSection
        title="다가오는 경기"
        matches={upcomingMatches}
        onAttendanceChange={handleAttendanceChange}
        canManageAnnouncements={canManageAnnouncements()}
        emptyMessage="예정된 경기가 없습니다."
        showAddButton={true}
        onAddClick={handleAddMatchClick}
      />

      {selectedMatchId && (
        <PlayerAttendanceForm 
          matchId={selectedMatchId}
          matchDate={matches.find(m => m.id === selectedMatchId)?.date || ''}
          opponent={matches.find(m => m.id === selectedMatchId)?.opponent || ''}
          players={players}
          isCoach={canManagePlayerStats()}
        />
      )}

      <CompletedMatchSection
        title="최근 경기"
        matches={completedMatches}
        emptyMessage="완료된 경기가 없습니다."
      />
    </div>
  );
};

export default MatchManagement;
