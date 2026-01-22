// Dashboard 관련 타입 정의
// Player, Mvp, MvpStatus는 stats feature에서 재사용 가능하므로 별도로 정의하지 않음
// 필요한 경우 @/features/stats/types/stats.types에서 import

export interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
  isMatch?: boolean;
  attendance_tracking?: boolean;
}

export interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'upcoming' | 'cancelled';
  attendingPlayers?: any[];
  notAttendingPlayers?: any[];
  pendingPlayers?: any[];
  isPast?: boolean; // 과거 이벤트 여부
}

export interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'upcoming' | 'cancelled';
}

export interface DashboardData {
  announcements: Announcement[];
  matchAnnouncements: Announcement[];
  upcomingMatches: UpcomingMatch[];
  calendarEvents: Record<string, CalendarEvent[]>;
}




