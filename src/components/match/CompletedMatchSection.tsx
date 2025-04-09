
import React from 'react';
import { Match } from '@/hooks/use-match-data';
import CompletedMatchCard from './CompletedMatchCard';
import NoMatchesInfo from './NoMatchesInfo';

interface CompletedMatchSectionProps {
  title: string;
  matches: Match[];
  emptyMessage: string;
  canManagePlayerStats?: boolean;
}

const CompletedMatchSection = ({ title, matches, emptyMessage, canManagePlayerStats = false }: CompletedMatchSectionProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map(match => (
            <CompletedMatchCard 
              key={match.id} 
              match={match} 
              canManagePlayerStats={canManagePlayerStats}
            />
          ))}
        </div>
      ) : (
        <NoMatchesInfo message={emptyMessage} />
      )}
    </div>
  );
};

export default CompletedMatchSection;
