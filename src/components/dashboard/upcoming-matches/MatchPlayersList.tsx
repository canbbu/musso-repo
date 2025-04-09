
import React from 'react';
import { Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
}

interface MatchPlayersListProps {
  title: string;
  count: number;
  players?: Player[];
  textColor: string;
}

const MatchPlayersList = ({ title, count, players, textColor }: MatchPlayersListProps) => {
  return (
    <div>
      <h4 className={`text-sm font-medium flex items-center ${textColor} mb-2`}>
        <Users className="h-4 w-4 mr-1" /> {title} ({count}명)
      </h4>
      {players && players.length > 0 ? (
        <ul className="text-sm pl-6 list-disc">
          {players.map(player => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 pl-6">{title}가 없습니다.</p>
      )}
    </div>
  );
};

export default MatchPlayersList;
