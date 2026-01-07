export interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  content: string;
  date: string;
  author: string;
  location?: string;
  opponent?: string;
  matchTime?: string;
  attendanceTracking?: boolean;
  isMatch?: boolean;
}

export interface AnnouncementFormData extends Partial<Announcement> {}
