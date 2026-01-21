// Stats 관련 타입 정의

export interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attendanceStatus: 'attending' | 'not_attending' | 'pending';
  goals: number;
  assists: number;
  rating: number;
}

export interface Match {
  id: number;
  date: string;
  opponent: string;
}

export interface Player {
  id: string;
  name: string;
  username: string;
  role: string;
  position?: string;
  games?: number;
  goals?: number;
  assists?: number;
  attendance?: number;
  rating?: number;
  boots_brand?: string;
  favorite_team?: string;
  fav_club?: string;
  birthday?: string;
  weekly_mvp_count?: number;
  monthly_mvp_count?: number;
  yearly_mvp_count?: number;
  // 선수 능력치 필드
  avr_stat?: number; // 평균 능력치
  pac?: number; // 속력 (Pace)
  sho?: number; // 슛 (Shooting)
  pas?: number; // 패스 (Passing)
  dri?: number; // 드리블 (Dribbling)
  def?: number; // 수비 (Defense)
  phy?: number; // 피지컬 (Physical)
}

export type RankingTab = 'goals' | 'assists' | 'attendance' | 'rating';

export interface Mvp {
  id: number;
  player_id: string;
  player_name: string;
  type: 'weekly' | 'monthly' | 'yearly';
  year: number;
  month?: number;
  week?: number;
  reason: string;
  created_at: string;
}

export type MvpType = 'weekly' | 'monthly' | 'yearly';

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

export interface StatsFilters {
  year?: number;
  month?: number;
  week?: number;
  position?: string;
  [key: string]: string | number | undefined;
}



