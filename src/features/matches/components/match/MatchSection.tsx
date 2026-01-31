import React, { useState, useMemo } from 'react';
import { Button } from "@/shared/components/ui/button";
import UpcomingMatchCard from './UpcomingMatchCard';
import NoMatchesInfo from './NoMatchesInfo';
import { Match } from '@/features/matches/hooks/use-match-data';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

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
  /** 한 번에 표시할 개수 (페이지네이션) */
  itemsPerPage?: number;
  /** 지정 시 접힌 상태에서 이 개수만 표시하고, 화살표로 펼치기/접기 (대시보드용) */
  collapseToCount?: number;
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
  itemsPerPage = 4,
  collapseToCount
}: MatchSectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canManagePlayerStats } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // collapseToCount 사용 시: 접힌 상태에서 N개만 표시, 펼치면 전체
  const useCollapse = collapseToCount != null;
  const displayedMatches = useMemo(() => {
    if (useCollapse) {
      return expanded ? matches : matches.slice(0, collapseToCount);
    }
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return matches.slice(startIndex, endIndex);
  }, [matches, currentPage, itemsPerPage, useCollapse, expanded, collapseToCount]);

  const hasMoreCollapsed = useCollapse && matches.length > collapseToCount!;
  
  // 페이지네이션 계산 (collapse 모드가 아닐 때만)
  const totalPages = Math.ceil(matches.length / itemsPerPage);
  
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
            
            {/* 펼치기/접기 (collapseToCount 사용 시) */}
            {hasMoreCollapsed && (
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mt-2"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    이벤트 {matches.length - collapseToCount!}개 더 보기
                  </>
                )}
              </Button>
            )}
            {/* 페이지네이션 컨트롤 (collapse 모드가 아닐 때만) */}
            {!useCollapse && totalPages > 1 && (
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
