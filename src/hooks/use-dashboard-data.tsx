import { DashboardData } from '@/types/dashboard';
import { useAnnouncements } from './use-announcements.tsx';
import { useUpcomingMatches } from './use-upcoming-matches';
import { useCalendarEvents } from './use-calendar-events';
import { useMemo } from 'react';

export function useDashboardData(): DashboardData & { 
  matchAnnouncements: any[], 
  loading: boolean, 
  error: string | null 
} {
  // 모든 공지사항 가져오기
  const { announcements, loading: announcementsLoading, error: announcementsError } = useAnnouncements();
  
  // 이벤트 정보만 가져오기 (isMatch가 true인 공지사항)
  const { announcements: matchAnnouncements, loading: matchAnnouncementsLoading, error: matchAnnouncementsError } = useAnnouncements(true);
  
  const { upcomingMatches, loading: matchesLoading, error: matchesError } = useUpcomingMatches();
  const { calendarEvents } = useCalendarEvents(upcomingMatches, announcements);

  // 통합 로딩 상태
  const loading = useMemo(() => {
    return announcementsLoading || matchAnnouncementsLoading || matchesLoading;
  }, [announcementsLoading, matchAnnouncementsLoading, matchesLoading]);

  // 통합 에러 상태
  const error = useMemo(() => {
    const errors = [announcementsError, matchAnnouncementsError, matchesError].filter(Boolean);
    return errors.length > 0 
      ? errors.map(err => err instanceof Error ? err.message : err).join(', ')
      : null;
  }, [announcementsError, matchAnnouncementsError, matchesError]);

  return {
    announcements,
    matchAnnouncements,
    upcomingMatches,
    calendarEvents,
    loading,
    error
  };
}
