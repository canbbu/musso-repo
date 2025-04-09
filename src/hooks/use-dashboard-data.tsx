
import { DashboardData } from '@/types/dashboard';
import { useAnnouncements } from './use-announcements';
import { useUpcomingMatches } from './use-upcoming-matches';
import { useCalendarEvents } from './use-calendar-events';

export function useDashboardData(): DashboardData {
  const { announcements } = useAnnouncements();
  const { upcomingMatches } = useUpcomingMatches();
  const { calendarEvents } = useCalendarEvents(upcomingMatches, announcements);

  return {
    announcements,
    upcomingMatches,
    calendarEvents
  };
}
