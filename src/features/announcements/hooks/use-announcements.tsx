// src/features/announcements/hooks/use-announcements.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { format } from 'date-fns';
import { Announcement } from '../types/announcement.types';

export function useAnnouncements(showOnlyMatches: boolean = false) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('announcements')
        .select('*');
      
      // 이벤트 관련 공지만 표시하는 경우
      if (showOnlyMatches) {
        query = query.eq('is_match', true);
      }
      
      // 날짜 내림차순 정렬
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;

      if (error) {
        console.error('[DB 오류] 공지사항 조회 실패:', error);
        throw error;
      }

      const formattedAnnouncements: Announcement[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type as 'notice' | 'match',
        content: item.content,
        date: format(new Date(item.date), 'yyyy-MM-dd'),
        author: item.author,
        location: item.location || undefined,
        opponent: item.opponent || undefined,
        matchTime: item.match_time ? new Date(item.match_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        attendanceTracking: item.attendance_tracking || false,
        isMatch: item.is_match || false
      }));

      setAnnouncements(formattedAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // 실시간 업데이트 구독 설정
  useEffect(() => {
    fetchAnnouncements();

    // 실시간 업데이트를 위한 구독
    const subscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload) => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [showOnlyMatches]);

  // 공지사항 추가 함수
  const addAnnouncement = async (newAnnouncement: Omit<Announcement, 'id' | 'updatedAt'>) => {
    try {
      
      const { data, error } = await supabase
        .from('announcements')
        .insert([newAnnouncement])
        .select();

      if (error) {
        console.error('[DB 오류] 공지사항 추가 실패:', error);
        throw error;
      }
      

      // 새로운 공지사항을 UI에 반영
      fetchAnnouncements();

      return { data, error: null };
    } catch (err) {
      console.error('Error adding announcement:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') };
    }
  };

  return { announcements, loading, error, addAnnouncement, fetchAnnouncements };
}