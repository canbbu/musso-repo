import { UpcomingMatch, Announcement, CalendarEvent } from '@/types/dashboard';

export function useCalendarEvents(upcomingMatches: UpcomingMatch[], announcements: Announcement[]) {
  // Calculate events for the calendar
  const getCalendarEvents = () => {
    const events: Record<string, CalendarEvent[]> = {};
    
    // 날짜 형식 통일 함수
    const formatDateString = (dateStr: string) => {
      // 날짜 형식에서 시간 부분을 제거하고 YYYY-MM-DD 형식으로 통일
      if (!dateStr) return "";
      
      // 이미 YYYY-MM-DD 형식이면 그대로 반환
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // '2025-05-11-오전 09:00' 같은 형식 처리
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length >= 3) {
          return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
      }
      
      // 그 외 형식은 Date 객체로 변환 시도
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
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
    announcements.forEach(announcement => {
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
