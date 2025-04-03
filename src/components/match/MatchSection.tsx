
import React from 'react';
import { Button } from "@/components/ui/button";
import UpcomingMatchCard from '@/components/match/UpcomingMatchCard';
import NoMatchesInfo from '@/components/match/NoMatchesInfo';
import { Match } from '@/hooks/use-match-data';

interface MatchSectionProps {
  title: string;
  matches: Match[];
  onAttendanceChange: (matchId: number, response: 'attending' | 'notAttending') => void;
  canManageAnnouncements: boolean;
  emptyMessage: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

const MatchSection = ({
  title,
  matches,
  onAttendanceChange,
  canManageAnnouncements,
  emptyMessage,
  showAddButton = false,
  onAddClick
}: MatchSectionProps) => {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {showAddButton && canManageAnnouncements && (
          <Button onClick={onAddClick} variant="default" className="flex items-center">
            새 경기 등록
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
