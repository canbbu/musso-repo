import { UpcomingMatch, Announcement, CalendarEvent } from '../types/dashboard.types';

export function useCalendarEvents(upcomingMatches: UpcomingMatch[], announcements: Announcement[]) {
  // Calculate events for the calendar
  const getCalendarEvents = () => {
    const events: Record<string, CalendarEvent[]> = {};
    
    // 날짜 형식 통일 함수
    const formatDateString = (dateStr: string) => {
      if (!dateStr) return "";
      if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length >= 3) {
          return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
      }
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          // 로컬 타임존 기준으로 변환
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.error('날짜 변환 오류:', e);
      }
      return dateStr;
    };
    
    // Add matches to calendar
    upcomingMatches.forEach(match => {
      const dateStr = formatDateString(match.date);
      if (!dateStr) return;
      
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ 
        type: 'match', 
        title: ` ${match.opponent || '상대팀 미정'}`,
        status: match.status 
      });
    });
    
    // Add all types of announcements to calendar
    announcements
      .filter(announcement => announcement.attendance_tracking)
      .forEach(announcement => {
        const dateStr = formatDateString(announcement.date);
        if (!dateStr) return;
        
        if (!events[dateStr]) events[dateStr] = [];
        
        // is_match가 true인 announcements는 이미 upcomingMatches에 포함되어 있을 수 있음
        // 중복 방지를 위해 is_match가 false인 경우에만 추가
        if (!announcement.isMatch) {
          events[dateStr].push({ 
            type: 'notice', 
            title: announcement.title || '제목 없음'
          });
        }
      });
    
    return events;
  };

  const calendarEvents = getCalendarEvents();

  return { calendarEvents };
}
