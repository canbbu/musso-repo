// src/hooks/use-announcements.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  content: string;
  date: string;
  author: string;
  location?: string;
  opponent?: string;
  match_time?: string;
  attendance_tracking?: boolean;
  is_match: boolean;
  updated_at?: string;
}

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
      
      // 경기 관련 공지만 표시하는 경우
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
      
      console.log('[DB 응답] announcements 테이블 조회 결과:', data);

      const formattedAnnouncements = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        content: item.content,
        date: format(new Date(item.date), 'yyyy-MM-dd'),
        author: item.author,
        location: item.location,
        opponent: item.opponent,
        match_time: item.match_time ? new Date(item.match_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : undefined,
        attendance_tracking: item.attendance_tracking,
        is_match: item.is_match,
        updated_at: item.updated_at ? new Date(item.updated_at).toLocaleString('ko-KR') : undefined
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
        console.log('[DB 실시간] announcements 테이블 변경 감지:', payload);
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      console.log('[DB 구독] public:announcements 구독 해제');
      subscription.unsubscribe();
    };
  }, [showOnlyMatches]);

  // 공지사항 추가 함수
  const addAnnouncement = async (newAnnouncement: Omit<Announcement, 'id'>) => {
    try {
      console.log('[DB 요청] 새 공지사항 데이터:', newAnnouncement);
      
      const { data, error } = await supabase
        .from('announcements')
        .insert([newAnnouncement])
        .select();

      if (error) {
        console.error('[DB 오류] 공지사항 추가 실패:', error);
        throw error;
      }
      
      console.log('[DB 응답] 공지사항 추가 결과:', data);

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