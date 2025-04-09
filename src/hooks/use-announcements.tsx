
import { useState } from 'react';
import { Announcement } from '@/types/dashboard';
import { getMockAnnouncements } from '@/utils/mock-data';

export function useAnnouncements() {
  const [announcements] = useState<Announcement[]>(getMockAnnouncements());
  
  return { announcements };
}
