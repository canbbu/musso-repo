
import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  attendance: number;
  rating: number;
}

type RankingTab = 'goals' | 'assists' | 'attendance' | 'rating';

export const usePlayerRankings = () => {
  const [players] = useState<Player[]>([
    { 
      id: 'p1', 
      name: '김선수', 
      position: '공격수',
      games: 18, 
      goals: 12, 
      assists: 5, 
      attendance: 90,
      rating: 8.4 
    },
    { 
      id: 'p2', 
      name: '이공격수', 
      position: '공격수',
      games: 15, 
      goals: 9, 
      assists: 8, 
      attendance: 80,
      rating: 7.9 
    },
    { 
      id: 'p3', 
      name: '박수비', 
      position: '수비수',
      games: 20, 
      goals: 2, 
      assists: 3, 
      attendance: 95,
      rating: 8.0 
    },
    { 
      id: 'p4', 
      name: '정미드필더', 
      position: '미드필더',
      games: 16, 
      goals: 6, 
      assists: 12, 
      attendance: 85,
      rating: 8.2 
    },
    { 
      id: 'p5', 
      name: '최골키퍼', 
      position: '골키퍼',
      games: 19, 
      goals: 0, 
      assists: 1, 
      attendance: 92,
      rating: 7.6 
    },
    { 
      id: 'p6', 
      name: '강윙어', 
      position: '윙어',
      games: 14, 
      goals: 7, 
      assists: 4, 
      attendance: 75,
      rating: 7.5 
    },
    { 
      id: 'p7', 
      name: '황수비', 
      position: '수비수',
      games: 17, 
      goals: 1, 
      assists: 2, 
      attendance: 88,
      rating: 7.8 
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<RankingTab>('goals');
  
  // Get the top players in each category
  const goalRanking = [...players].sort((a, b) => b.goals - a.goals);
  const assistRanking = [...players].sort((a, b) => b.assists - a.assists);
  const attendanceRanking = [...players].sort((a, b) => b.attendance - a.attendance);
  const ratingRanking = [...players].sort((a, b) => b.rating - a.rating);
  
  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'goals':
        return goalRanking;
      case 'assists':
        return assistRanking;
      case 'attendance':
        return attendanceRanking;
      case 'rating':
        return ratingRanking;
      default:
        return goalRanking;
    }
  };
  
  return {
    players,
    activeTab,
    setActiveTab,
    goalRanking,
    assistRanking,
    attendanceRanking,
    ratingRanking,
    getCurrentRanking,
  };
};

export type { RankingTab, Player };
