
import { useState } from 'react';

interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
}

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'scheduled' | 'cancelled';
}

interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'scheduled' | 'cancelled';
}

interface DashboardData {
  announcements: Announcement[];
  upcomingMatches: UpcomingMatch[];
  calendarEvents: Record<string, CalendarEvent[]>;
}

export function useDashboardData(): DashboardData {
  // Mock data for announcements
  const [announcements] = useState<Announcement[]>([
    { 
      id: 1, 
      type: 'notice',
      title: '이번 주 경기 공지', 
      date: '2023-11-20', 
      content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
      author: '김운영',
      updatedAt: '2023-11-20 14:30'
    },
    { 
      id: 2, 
      type: 'notice',
      title: '연말 모임 안내', 
      date: '2023-11-18', 
      content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
      author: '박감독',
      updatedAt: '2023-11-18 10:15'
    },
    { 
      id: 3, 
      type: 'match',
      title: 'FC 서울과의 경기', 
      date: '2023-11-25', 
      content: '이번 경기는 중요한 라이벌전입니다. 많은 참여 부탁드립니다.',
      author: '박감독'
    },
  ]);

  // Mock data for upcoming matches - 현재 날짜로 업데이트
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayFormatted = getCurrentDate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  const [upcomingMatches] = useState<UpcomingMatch[]>([
    { 
      id: 1, 
      date: `${todayFormatted} 19:00`, 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울',
      attending: 8,
      notAttending: 3, 
      pending: 5,
      status: 'scheduled'
    },
    { 
      id: 2, 
      date: `${tomorrowFormatted} 18:00`, 
      location: '강남 체육공원', 
      opponent: '강남 유나이티드',
      attending: 6,
      notAttending: 2,
      pending: 8,
      status: 'cancelled'
    },
  ]);

  // Calculate events for the calendar - 날짜 형식 수정
  const getCalendarEvents = () => {
    const events: Record<string, CalendarEvent[]> = {};
    
    // Add matches to calendar
    upcomingMatches.forEach(match => {
      // 날짜 형식 수정 (시간 부분 제거)
      const dateStr = match.date.split(' ')[0];
      
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ 
        type: 'match', 
        title: `vs ${match.opponent}`,
        status: match.status 
      });
    });
    
    // Add other announcements with dates to calendar
    announcements.filter(a => a.type === 'notice').forEach(announcement => {
      const dateStr = announcement.date;
      
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ type: 'notice', title: announcement.title });
    });
    
    return events;
  };

  const calendarEvents = getCalendarEvents();

  return {
    announcements,
    upcomingMatches,
    calendarEvents
  };
}
