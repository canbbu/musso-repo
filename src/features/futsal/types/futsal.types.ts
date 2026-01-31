// 풋살 이벤트·참가·댓글 타입

export type FutsalEventStatus = 'upcoming' | 'completed' | 'cancelled';
export type ParticipationStatus = 'attending' | 'not_attending' | 'pending';

export interface FutsalEvent {
  id: number;
  title: string;
  date: string;
  time: string | null;
  location: string;
  description: string | null;
  status: FutsalEventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FutsalEventFormData {
  title: string;
  date: string;
  time?: string;
  location: string;
  description?: string;
  status: FutsalEventStatus;
}

export interface FutsalEventWithAttendance extends FutsalEvent {
  attendance: { attending: number; notAttending: number; pending: number };
  userResponse: ParticipationStatus | null;
}

export interface FutsalEventParticipation {
  id: number;
  event_id: number;
  player_id: string;
  status: ParticipationStatus;
  created_at: string;
  updated_at: string;
}

/** 참석현황 모달용: 참가자 이름 포함 */
export interface FutsalParticipationListItem {
  player_id: string;
  player_name: string | null;
  status: ParticipationStatus;
}

export interface FutsalEventComment {
  id: number;
  event_id: number;
  player_id: string;
  content: string;
  created_at: string;
  player_name?: string;
}
