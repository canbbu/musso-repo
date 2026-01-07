// Announcements React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from './announcements.api';
import { AnnouncementFormData } from '../types/announcement.types';

// 공지사항 목록 가져오기
export function useAnnouncements(showOnlyMatches: boolean = false) {
  return useQuery({
    queryKey: ['announcements', showOnlyMatches],
    queryFn: () => getAnnouncements(showOnlyMatches),
    staleTime: 1000 * 60 * 2, // 2분
  });
}

// 공지사항 생성
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: AnnouncementFormData) => createAnnouncement(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// 공지사항 수정
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: AnnouncementFormData) => updateAnnouncement(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// 공지사항 삭제
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}


