import { useState, useEffect } from 'react';
import { Announcement, AnnouncementFormData } from '@/features/announcements/types/announcement.types';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/shared/lib/supabase/client';

export function useAnnouncementData() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // 데이터베이스에서 가져온 데이터 형식을 클라이언트 형식으로 변환
      const formattedData: Announcement[] = data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as 'notice' | 'match',
        content: item.content,
        date: item.date,
        author: item.author,
        location: item.location || undefined,
        opponent: item.opponent || undefined,
        matchTime: item.match_time ? new Date(item.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        attendanceTracking: item.attendance_tracking || false,
        isMatch: item.is_match || false
      }));

      setAnnouncements(formattedData);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "공지사항을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (formData: AnnouncementFormData) => {
    try {
      // Supabase 형식으로 데이터 변환
      const newItem = {
        title: formData.title!,
        type: formData.type as 'notice' | 'match',
        content: formData.content!,
        date: formData.date!,
        author: formData.author!,
        attendance_tracking: formData.attendanceTracking || false,
        location: formData.location || null,
        opponent: formData.opponent || null,
        match_time: formData.matchTime ? new Date(`${formData.date}T${formData.matchTime}`) : null,
        is_match: formData.type === 'match' || formData.isMatch || false,
        updated_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('announcements')
        .insert(newItem)
        .select();

      if (error) throw error;

      // 데이터가 없으면 에러 발생
      if (!data || data.length === 0) {
        throw new Error('데이터가 반환되지 않았습니다');
      }

      // 추가된 항목 반영
      const createdItem: Announcement = {
        id: data[0].id,
        title: data[0].title,
        type: data[0].type as 'notice' | 'match',
        content: data[0].content,
        date: data[0].date,
        author: data[0].author,
        location: data[0].location || undefined,
        opponent: data[0].opponent || undefined,
        matchTime: data[0].match_time ? new Date(data[0].match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        attendanceTracking: data[0].attendance_tracking || false,
        isMatch: data[0].is_match || false
      };
      
      setAnnouncements(prev => [...prev, createdItem]);
      
      toast({
        title: "등록 완료",
        description: `새 ${formData.type === 'notice' ? '공지사항' : '이벤트 일정'}이 등록되었습니다.`,
      });
      
      return createdItem;
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "공지사항 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleUpdateAnnouncement = async (formData: AnnouncementFormData) => {
    try {
      if (!formData.id) throw new Error('ID가 필요합니다');

      // Supabase 형식으로 데이터 변환
      const updateData = {
        title: formData.title!,
        type: formData.type as 'notice' | 'match',
        content: formData.content!,
        date: formData.date!,
        author: formData.author!,
        attendance_tracking: formData.attendanceTracking || false,
        location: formData.location || null,
        opponent: formData.opponent || null,
        match_time: formData.matchTime ? new Date(`${formData.date}T${formData.matchTime}`) : null,
        is_match: formData.type === 'match' || formData.isMatch || false,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', formData.id);

      if (error) throw error;
      
      // 클라이언트 측 데이터 업데이트
      setAnnouncements(prev => 
        prev.map(item => 
          item.id === formData.id ? { ...item, ...formData as Announcement } : item
        )
      );
      
      toast({
        title: "수정 완료",
        description: "항목이 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      console.error('공지사항 수정 오류:', error);
      toast({
        title: "오류 발생",
        description: "공지사항 수정 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 클라이언트 측 데이터 업데이트
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "항목 삭제 완료",
        description: "선택한 항목이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('공지사항 삭제 오류:', error);
      toast({
        title: "오류 발생",
        description: "공지사항 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return {
    announcements,
    loading,
    createAnnouncement: handleCreateAnnouncement,
    updateAnnouncement: handleUpdateAnnouncement,
    deleteAnnouncement: handleDeleteAnnouncement,
    refreshAnnouncements: fetchAnnouncements
  };
}
