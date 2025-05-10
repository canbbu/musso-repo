// src/hooks/use-announcements.tsx
import { useState, useEffect } from 'react';
import { Announcement } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        
        // Supabase에서 받은 데이터를 애플리케이션 형식에 맞게 변환
        const formattedAnnouncements: Announcement[] = data.map(item => ({
          id: item.id,
          type: item.type as 'notice' | 'match',
          title: item.title,
          date: item.date,
          content: item.content,
          author: item.author,
          updatedAt: item.updated_at
        }));
        
        setAnnouncements(formattedAnnouncements);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        console.error('공지사항을 불러오는 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
    
    // 실시간 업데이트를 위한 구독 설정 (선택 사항)
    const subscription = supabase
      .channel('announcements_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' }, 
        fetchAnnouncements
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // 공지사항 추가 함수
  const addAnnouncement = async (newAnnouncement: Omit<Announcement, 'id' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          type: newAnnouncement.type,
          title: newAnnouncement.title,
          date: newAnnouncement.date,
          content: newAnnouncement.content,
          author: newAnnouncement.author
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // 새 공지사항을 상태에 추가
      const formattedAnnouncement: Announcement = {
        id: data.id,
        type: data.type as 'notice' | 'match',
        title: data.title,
        date: data.date,
        content: data.content,
        author: data.author,
        updatedAt: data.updated_at
      };
      
      setAnnouncements(prev => [formattedAnnouncement, ...prev]);
      return formattedAnnouncement;
    } catch (err) {
      setError(err instanceof Error ? err.message : '공지사항 추가 중 오류가 발생했습니다');
      throw err;
    }
  };

  return { 
    announcements, 
    loading, 
    error,
    addAnnouncement 
  };
}