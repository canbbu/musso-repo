
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Attendance {
  attending: number;
  notAttending: number;
  pending: number;
}

export interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  attendance: Attendance;
  userResponse?: 'attending' | 'notAttending' | null;
  score?: string;
  result?: 'win' | 'loss' | 'draw';
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  notes?: string;
  mvp?: string;
  review?: string;
}

export const useMatchData = () => {
  const { toast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([
    { 
      id: 1, 
      date: '2023-11-25T19:00', 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울', 
      status: 'upcoming',
      attendance: { attending: 8, notAttending: 3, pending: 5 },
      createdBy: '박감독',
      updatedBy: '김운영',
      updatedAt: '2023-11-22 10:30'
    },
    { 
      id: 2, 
      date: '2023-12-02T18:00', 
      location: '강남 체육공원', 
      opponent: '강남 유나이티드', 
      status: 'upcoming',
      attendance: { attending: 5, notAttending: 2, pending: 9 },
      createdBy: '김운영'
    },
    { 
      id: 3, 
      date: '2023-11-18T16:00', 
      location: '올림픽 공원 축구장', 
      opponent: '드림 FC', 
      status: 'completed',
      attendance: { attending: 11, notAttending: 4, pending: 0 },
      score: '2-1',
      result: 'win',
      createdBy: '박감독',
      updatedBy: '박감독',
      updatedAt: '2023-11-18 18:30',
      notes: '비가 오는 가운데 진행된 경기였지만 팀워크가 좋았음',
      mvp: '이공격수',
      review: '전반적으로 좋은 경기였습니다. 비가 와서 어려운 조건이었지만 팀원들의 협력이 좋았고, 특히 이공격수 선수의 득점으로 승리할 수 있었습니다.'
    },
    {
      id: 4,
      date: '2023-11-11T14:00',
      location: '강동 구민 체육관',
      opponent: '강동 FC',
      status: 'completed',
      attendance: { attending: 10, notAttending: 5, pending: 0 },
      score: '1-2',
      result: 'loss',
      createdBy: '박감독',
      updatedBy: '박감독',
      updatedAt: '2023-11-11 16:30',
      notes: '수비 집중력이 떨어졌던 경기',
      mvp: '최골키퍼',
      review: '패배했지만 최골키퍼 선수의 여러 차례 선방이 없었다면, 더 큰 점수 차이로 질 뻔했습니다. 다음 경기에서는 수비 조직력을 강화해야 합니다.'
    }
  ]);
  
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  
  const handleAttendanceChange = (matchId: number, response: 'attending' | 'notAttending') => {
    setMatches(matches.map(match => {
      if (match.id === matchId) {
        const oldResponse = match.userResponse;
        const newAttendance = { ...match.attendance };
        
        if (oldResponse === 'attending') newAttendance.attending--;
        if (oldResponse === 'notAttending') newAttendance.notAttending--;
        if (oldResponse === null) newAttendance.pending--;
        
        if (response === 'attending') newAttendance.attending++;
        if (response === 'notAttending') newAttendance.notAttending++;
        
        toast({
          title: response === 'attending' ? '참석 확인' : '불참 확인',
          description: `${match.opponent}와의 경기에 ${response === 'attending' ? '참석' : '불참'}으로 표시되었습니다.`,
        });
        
        return {
          ...match,
          attendance: newAttendance,
          userResponse: response
        };
      }
      return match;
    }));
  };

  const checkForTodaysMatch = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysMatch = matches.find(match => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() === today.getTime() && match.status === 'upcoming';
    });
    
    if (todaysMatch) {
      setSelectedMatchId(todaysMatch.id);
    }
    
    return todaysMatch;
  };
  
  useEffect(() => {
    checkForTodaysMatch();
  }, []);

  const currentYearMatches = matches.filter(
    match => new Date(match.date).getFullYear() === new Date().getFullYear()
  ).length;
  
  return {
    matches,
    selectedMatchId,
    setSelectedMatchId,
    handleAttendanceChange,
    currentYearMatches
  };
};
