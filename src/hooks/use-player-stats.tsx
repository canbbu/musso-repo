
import { useState, useEffect } from 'react';

interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
}

interface Match {
  id: number;
  date: string;
  opponent: string;
}

export const usePlayerStats = () => {
  const [matches, setMatches] = useState<Match[]>([
    { id: 1, date: '2023-11-25T19:00', opponent: 'FC 서울' },
    { id: 2, date: '2023-12-02T18:00', opponent: '강남 유나이티드' },
    { id: 3, date: '2023-11-18T16:00', opponent: '드림 FC' }
  ]);
  
  const [players] = useState([
    { id: 'player1', name: '김선수' },
    { id: 'player2', name: '이공격수' },
    { id: 'player3', name: '박수비' },
    { id: 'player4', name: '정미드필더' },
    { id: 'player5', name: '최골키퍼' },
  ]);
  
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load player stats when a match is selected
  useEffect(() => {
    if (selectedMatch) {
      setIsLoading(true);
      // In a real app, we would fetch data from an API
      const selectedMatchData = matches.find(m => m.id === selectedMatch);
      
      // Generate placeholder stats for the selected match
      setTimeout(() => {
        const stats = players.map(player => ({
          id: player.id,
          name: player.name,
          matchId: selectedMatch,
          matchDate: selectedMatchData?.date || '',
          attended: Math.random() > 0.2, // 80% chance of attendance
          goals: Math.floor(Math.random() * 3),
          assists: Math.floor(Math.random() * 3),
          rating: Math.round((Math.random() * 4 + 6) * 10) / 10 // Rating between 6.0 and 10.0
        }));
        
        setPlayerStats(stats);
        setIsLoading(false);
      }, 500);
    } else {
      setPlayerStats([]);
    }
  }, [selectedMatch, players, matches]);
  
  const handleStatChange = (playerId: string, field: keyof PlayerStats, value: any) => {
    setPlayerStats(prev => 
      prev.map(stat => 
        stat.id === playerId 
          ? { ...stat, [field]: value } 
          : stat
      )
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    matches,
    players,
    selectedMatch,
    setSelectedMatch,
    playerStats,
    isLoading,
    handleStatChange,
    formatDate
  };
};
