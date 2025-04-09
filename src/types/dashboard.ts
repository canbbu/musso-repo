
export interface Player {
  id: string;
  name: string;
}

export interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
}

export interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'scheduled' | 'cancelled';
  attendingPlayers?: Player[];
  notAttendingPlayers?: Player[];
  pendingPlayers?: Player[];
}

export interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'scheduled' | 'cancelled';
}

export interface DashboardData {
  announcements: Announcement[];
  upcomingMatches: UpcomingMatch[];
  calendarEvents: Record<string, CalendarEvent[]>;
}
