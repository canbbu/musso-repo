
import { useState } from 'react';
import { Announcement, AnnouncementFormData } from '@/types/announcement';
import { useToast } from '@/hooks/use-toast';

export function useAnnouncementData() {
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1, 
      title: '이번 주 경기 공지', 
      type: 'notice',
      date: '2023-11-20', 
      content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
      author: '김운영'
    },
    {
      id: 2, 
      title: 'FC 서울과의 경기', 
      type: 'match',
      date: '2023-11-25', 
      content: '이번 경기는 중요한 라이벌전입니다. 많은 참여 부탁드립니다.',
      author: '박감독',
      location: '서울 마포구 풋살장',
      opponent: 'FC 서울',
      matchTime: '19:00',
      attendanceTracking: true
    },
    {
      id: 3, 
      title: '연말 모임 안내', 
      type: 'notice',
      date: '2023-11-18', 
      content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
      author: '박감독',
      attendanceTracking: true
    },
  ]);

  const handleCreateAnnouncement = (formData: AnnouncementFormData) => {
    const newItem: Announcement = {
      id: Math.max(0, ...announcements.map(a => a.id)) + 1,
      title: formData.title!,
      type: formData.type as 'notice' | 'match',
      content: formData.content!,
      date: formData.date!,
      author: formData.author!,
      attendanceTracking: formData.attendanceTracking,
      ...(formData.type === 'match' && {
        location: formData.location,
        opponent: formData.opponent,
        matchTime: formData.matchTime
      })
    };
    
    setAnnouncements(prev => [...prev, newItem]);
    toast({
      title: "등록 완료",
      description: `새 ${formData.type === 'notice' ? '공지사항' : '경기 일정'}이 등록되었습니다.`,
    });
    
    return newItem;
  };

  const handleUpdateAnnouncement = (formData: AnnouncementFormData) => {
    setAnnouncements(prev => 
      prev.map(item => 
        item.id === formData.id ? { ...item, ...formData as Announcement } : item
      )
    );
    toast({
      title: "수정 완료",
      description: "항목이 성공적으로 수정되었습니다.",
    });
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
    toast({
      title: "항목 삭제 완료",
      description: "선택한 항목이 삭제되었습니다.",
    });
  };

  return {
    announcements,
    createAnnouncement: handleCreateAnnouncement,
    updateAnnouncement: handleUpdateAnnouncement,
    deleteAnnouncement: handleDeleteAnnouncement
  };
}
