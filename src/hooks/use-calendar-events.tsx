
import { UpcomingMatch, Announcement, CalendarEvent } from '@/types/dashboard';

export function useCalendarEvents(upcomingMatches: UpcomingMatch[], announcements: Announcement[]) {
  // Calculate events for the calendar
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

  return { calendarEvents };
}
