import React from 'react';
import { Button } from "@/components/ui/button";
import UpcomingMatchCard from '@/components/match/UpcomingMatchCard';
import NoMatchesInfo from '@/components/match/NoMatchesInfo';
import { Match } from '@/hooks/use-match-data';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface MatchSectionProps {
  title: string;
  matches: Match[];
  onAttendanceChange: (matchId: number, response: 'attending' | 'notAttending') => void;
  canManageAnnouncements: boolean;
  emptyMessage: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onViewMatch: (matchId: number) => void;
  onEditClick?: (matchId: number) => void;
  onDeleteClick?: (matchId: number) => void;
  disableVoting?: boolean;
  showOnlyVoting?: boolean;
}

const MatchSection = ({
  title,
  matches,
  onAttendanceChange,
  canManageAnnouncements,
  emptyMessage,
  showAddButton = false,
  onAddClick,
  onViewMatch,
  onEditClick,
  onDeleteClick,
  disableVoting = false,
  showOnlyVoting = false
}: MatchSectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  
  const handleAddClick = () => {
    if (!canManageAnnouncements) {
      toast({
        title: "접근 권한이 없습니다",
        description: "이벤트 등록은 감독만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (onAddClick) {
      onAddClick();
    }
  };

  const handleManageStats = (matchId: number) => {
    if (!canManagePlayerStats()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "선수 기록 관리는 감독과 코치만 가능합니다.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/stats-management?matchId=${matchId}`);
  };
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {showAddButton && (
          <Button onClick={handleAddClick} variant="default" className="flex items-center">
            새 이벤트 등록
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {matches.length > 0 ? (
          matches.map(match => (
            <UpcomingMatchCard
              key={match.id}
              match={match}
              onAttendanceChange={onAttendanceChange}
              canManageAnnouncements={canManageAnnouncements}
              onViewMatch={onViewMatch}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              disableVoting={disableVoting}
              showOnlyVoting={showOnlyVoting}
            />
          ))
        ) : (
          <NoMatchesInfo message={emptyMessage} />
        )}
      </div>
    </div>
  );
};

export default MatchSection;
