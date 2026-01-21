import React, { useState, useMemo } from 'react';
import { Button } from "@/shared/components/ui/button";
import UpcomingMatchCard from './UpcomingMatchCard';
import NoMatchesInfo from './NoMatchesInfo';
import { Match } from '@/features/matches/hooks/use-match-data';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  hideManagementButton?: boolean;
  itemsPerPage?: number;
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
  showOnlyVoting = false,
  hideManagementButton = false,
  itemsPerPage = 4
}: MatchSectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(matches.length / itemsPerPage);
  const displayedMatches = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return matches.slice(startIndex, endIndex);
  }, [matches, currentPage, itemsPerPage]);
  
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
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
        {displayedMatches.length > 0 ? (
          <>
            {displayedMatches.map(match => (
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
                hideManagementButton={hideManagementButton}
              />
            ))}
            
            {/* 페이지네이션 컨트롤 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <NoMatchesInfo message={emptyMessage} />
        )}
      </div>
    </div>
  );
};

export default MatchSection;
