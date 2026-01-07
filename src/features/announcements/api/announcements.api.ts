// Announcements API 함수들
import { supabase } from '@/shared/lib/supabase/client';
import { Announcement, AnnouncementFormData } from '../types/announcement.types';

// 공지사항 목록 가져오기
export async function getAnnouncements(showOnlyMatches: boolean = false): Promise<Announcement[]> {
  let query = supabase
    .from('announcements')
    .select('*');
  
  if (showOnlyMatches) {
    query = query.eq('is_match', true);
  }
  
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // 데이터베이스 형식을 클라이언트 형식으로 변환
  return (data || []).map((item: any) => ({
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
    isMatch: item.is_match || false,
    updatedAt: item.updated_at || undefined
  }));
}

// 공지사항 생성
export async function createAnnouncement(formData: AnnouncementFormData): Promise<Announcement> {
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
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error('데이터가 반환되지 않았습니다');
  
  return {
    id: data.id,
    title: data.title,
    type: data.type as 'notice' | 'match',
    content: data.content,
    date: data.date,
    author: data.author,
    location: data.location || undefined,
    opponent: data.opponent || undefined,
    matchTime: data.match_time ? new Date(data.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    attendanceTracking: data.attendance_tracking || false,
    isMatch: data.is_match || false
  };
}

// 공지사항 수정
export async function updateAnnouncement(formData: AnnouncementFormData): Promise<void> {
  if (!formData.id) throw new Error('ID가 필요합니다');
  
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
}

// 공지사항 삭제
export async function deleteAnnouncement(id: number): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}


