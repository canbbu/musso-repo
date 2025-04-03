
import React from 'react';
import CompletedMatchCard from '@/components/match/CompletedMatchCard';
import NoMatchesInfo from '@/components/match/NoMatchesInfo';
import { Match } from '@/hooks/use-match-data';

interface CompletedMatchSectionProps {
  title: string;
  matches: Match[];
  emptyMessage: string;
}

const CompletedMatchSection = ({
  title,
  matches,
  emptyMessage
}: CompletedMatchSectionProps) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {matches.length > 0 ? (
          matches.map(match => (
            <CompletedMatchCard key={match.id} match={match} />
          ))
        ) : (
          <NoMatchesInfo message={emptyMessage} />
        )}
      </div>
    </div>
  );
};

export default CompletedMatchSection;
