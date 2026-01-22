export interface RunningRecord {
  id: number;
  player_id: string;
  date: string; // YYYY-MM-DD 형식
  distance: number; // km
  duration: number; // 분
  pace?: number; // 분/km
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RunningRecordFormData {
  date: string;
  distance: number;
  duration: number;
  notes?: string;
}
