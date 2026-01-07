// Attendance 관련 타입 정의

export interface Player {
  id: string;
  name: string;
  position: string;
}

export interface MatchInfo {
  id: number;
  date: string;
  opponent: string;
  location: string;
  status: string;
}

export interface AttendanceData {
  match_id: number;
  player_id: string;
  status: 'attending' | 'not_attending' | 'pending';
  match_number?: number;
}

export interface AttendanceStatus {
  player_id: string;
  status: 'attending' | 'not_attending' | 'pending';
}


