export interface Player {
  id: string;
  name: string;
  role: string;
  position: string | null;
  birthday: string | null;
  boots_brand: string | null;
  fav_club: string | null;
  weekly_mvp_count: number | null;
  monthly_mvp_count: number | null;
  yearly_mvp_count: number | null;
  is_deleted: boolean;
  games?: number;
  goals?: number;
  assists?: number;
  attendance_rate?: number;
  rating?: number;
  attendances?: any[]; // 참석 기록 데이터
  address?: string;
  phone_number?: string;
}

// MVP 타입 (주간/월간/년간)
export type MvpType ='weekly' | 'monthly' | 'yearly';

// 통합된 MVP 인터페이스
export interface Mvp {
  id: string;
  player_id: string;
  reason: string | null;
  created_at: string;
  mvp_type: MvpType;
  year: number;
  week?: number;
  month?: number;
}

// MVP 상태 정보
export interface MvpStatus {
  type: MvpType;
  exists: boolean;
  player_id: string | null;
  player_name: string | null;
  reason: string | null;
  period: {
    year: number;
    month?: number;
    week?: number;
  };
}

// MVP 상태 정보
export interface MvpStatus {
  type: MvpType;
  exists: boolean;
  player_id: string | null;
  player_name: string | null;
  reason: string | null;
  period: {
    year: number;
    month?: number;
    week?: number;
  };
}

/*
MVP 테이블 SQL 정의:

-- 주간 MVP 테이블
CREATE TABLE public.weekly_mvp (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  player_id uuid NOT NULL REFERENCES public.players(id),
  year integer NOT NULL,
  week integer NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT weekly_mvp_pkey PRIMARY KEY (id),
  CONSTRAINT weekly_mvp_year_week_unique UNIQUE (year, week)
);

-- 월간 MVP 테이블
CREATE TABLE public.monthly_mvp (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  player_id uuid NOT NULL REFERENCES public.players(id),
  year integer NOT NULL,
  month integer NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT monthly_mvp_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_mvp_year_month_unique UNIQUE (year, month)
);

-- 년간 MVP 테이블
CREATE TABLE public.yearly_mvp (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  player_id uuid NOT NULL REFERENCES public.players(id),
  year integer NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT yearly_mvp_pkey PRIMARY KEY (id),
  CONSTRAINT yearly_mvp_year_unique UNIQUE (year)
);

-- players 테이블에 weekly_mvp_count, monthly_mvp_count, yearly_mvp_count 컬럼 추가
ALTER TABLE public.players 
ADD COLUMN weekly_mvp_count integer DEFAULT 0,
ADD COLUMN monthly_mvp_count integer DEFAULT 0,
ADD COLUMN yearly_mvp_count integer DEFAULT 0;
*/

export interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
  isMatch?: boolean;
  attendance_tracking?: boolean;
}

export interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'upcoming' | 'cancelled';
  attendingPlayers?: Player[];
  notAttendingPlayers?: Player[];
  pendingPlayers?: Player[];
  isPast?: boolean; // 과거 이벤트 여부
}

export interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'upcoming' | 'cancelled';
}

export interface DashboardData {
  announcements: Announcement[];
  upcomingMatches: UpcomingMatch[];
  calendarEvents: Record<string, CalendarEvent[]>;
}

export interface Match {
  id: number;
  date: string;
  opponent: string;
  status: string;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  // ...필요한 필드 추가
}

export interface MatchInfo {
  date: string;
  opponent: string;
  location: string;
}

export interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attended: boolean;
  goals: number;
  assists: number;
  rating: number;
  attendanceStatus: string;
}

export interface StatsCardProps {
  matchDate: string;
  opponent: string;
  playerStats: PlayerStats[];
  onStatChange: (playerId: string, field: keyof PlayerStats, value: any) => void;
  onSave: () => void;
  isLoading: boolean;
}

export interface AttendanceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: number;
  matchInfo: MatchInfo;
}