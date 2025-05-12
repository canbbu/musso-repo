import { DashboardData } from '@/types/dashboard';
import { useAnnouncements } from './use-announcements.tsx';
import { useUpcomingMatches } from './use-upcoming-matches';
import { useCalendarEvents } from './use-calendar-events';

export function useDashboardData(): DashboardData & { matchAnnouncements: any[] } {
  // 모든 공지사항 가져오기
  const { announcements } = useAnnouncements();
  
  // 이벤트 정보만 가져오기 (isMatch가 true인 공지사항)
  const { announcements: matchAnnouncements } = useAnnouncements(true);
  
  const { upcomingMatches } = useUpcomingMatches();
  const { calendarEvents } = useCalendarEvents(upcomingMatches, announcements);

  return {
    announcements,
    matchAnnouncements,
    upcomingMatches,
    calendarEvents
  };
}
