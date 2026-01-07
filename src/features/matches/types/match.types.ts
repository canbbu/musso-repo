// Match 관련 타입 정의

export interface Attendance {
  attending: number;
  notAttending: number;
  pending: number;
}

export interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendance: Attendance;
  userResponse?: 'attending' | 'notAttending' | 'pending' | null;
  score?: string;
  result?: 'win' | 'loss' | 'draw';
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  notes?: string;
  mvp?: string;
  review?: string;
  time?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

export interface MatchFormData {
  date: string;
  location: string;
  opponent: string;
  status: string;
  time?: string;
}

// Tactics 관련 타입 (matches feature에 포함)
export interface TacticsPlayer {
  id: number;
  match_id: number;
  match_number: number; // 같은 경기 내에서 몇 번째 경기인지 (1, 2, 3...)
  player_id: string;
  status: 'attending' | 'not_attending' | 'pending';
  goals: number;
  assists: number;
  rating: number;
  tactics_position_x?: number; // 경기장 내 x 좌표 (0-100%)
  tactics_position_y?: number; // 경기장 내 y 좌표 (0-100%)
  tactics_team?: 'A' | 'B';
  substitutions: number; // 교체 횟수 (0: 미교체, 1: 교체됨, 2: 재교체됨)
  is_substituted: boolean; // 교체되었는지 여부
  player_name?: string; // players 테이블에서 조인
}

export interface Tactics {
  id: number;
  match_id: number;
  match_number: number; // 같은 경기 내에서 몇 번째 경기인지 (1, 2, 3...)
  name: string;
  team_a_strategy?: string;
  team_b_strategy?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  players?: TacticsPlayer[];
}

export interface TacticsWithMatch extends Tactics {
  match: Match;
}

export interface TacticsFormData {
  match_id: number;
  match_number: number;
  name: string;
  team_a_strategy?: string;
  team_b_strategy?: string;
  players: Omit<TacticsPlayer, 'id' | 'match_id' | 'match_number' | 'status' | 'rating'>[];
}

export interface PlayerPosition {
  playerId: string;
  playerName: string;
  x: number;
  y: number;
  team: 'A' | 'B';
  goals?: number;
  assists?: number;
  substitutions?: number;
  isSubstituted?: boolean;
}

export interface Formation {
  id?: string;
  name: string;
  positions: PlayerPosition[];
  created_by: string;
  created_at?: string;
  updated_at?: string;
  teamA_strategy?: string;
  teamB_strategy?: string;
}


