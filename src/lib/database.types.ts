// src/lib/database.types.ts
// 이 파일은 하위 호환성을 위해 유지됩니다.
// 새로운 코드는 @/shared/lib/supabase/types를 사용하세요.
export * from '@/shared/lib/supabase/types';
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: number
          type: string
          title: string
          date: string
          content: string
          author: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: number
          type: string
          title: string
          date: string
          content: string
          author: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          type?: string
          title?: string
          date?: string
          content?: string
          author?: string
          updated_at?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          date: string
          location: string
          opponent: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date: string
          location: string
          opponent?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date?: string
          location?: string
          opponent?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      match_attendance: {
        Row: {
          id: number
          match_id: number
          match_number: number
          player_id: string
          status: string
          goals: number | null
          assists: number | null
          goal_timestamp: string | null
          assist_timestamp: string | null
          rating: number | null
          substitutions: number | null
          is_substituted: boolean | null
          tactics_position_x: number | null
          tactics_position_y: number | null
          tactics_team: string | null
          is_opponent_team: boolean | null
          opponent_team_name: string | null
          created_at: string
          modified_at: string
        }
        Insert: {
          id?: number
          match_id: number
          match_number?: number
          player_id: string
          status: string
          goals?: number | null
          assists?: number | null
          goal_timestamp?: string | null
          assist_timestamp?: string | null
          rating?: number | null
          substitutions?: number | null
          is_substituted?: boolean | null
          tactics_position_x?: number | null
          tactics_position_y?: number | null
          tactics_team?: string | null
          is_opponent_team?: boolean | null
          opponent_team_name?: string | null
          created_at?: string
          modified_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          match_number?: number
          player_id?: string
          status?: string
          goals?: number | null
          assists?: number | null
          goal_timestamp?: string | null
          assist_timestamp?: string | null
          rating?: number | null
          substitutions?: number | null
          is_substituted?: boolean | null
          tactics_position_x?: number | null
          tactics_position_y?: number | null
          tactics_team?: string | null
          is_opponent_team?: boolean | null
          opponent_team_name?: string | null
          created_at?: string
          modified_at?: string
        }
      }
      tactics: {
        Row: {
          id: number
          match_id: number
          match_number: number
          name: string
          team_a_strategy: string | null
          team_b_strategy: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          match_id: number
          match_number?: number
          name: string
          team_a_strategy?: string | null
          team_b_strategy?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          match_number?: number
          name?: string
          team_a_strategy?: string | null
          team_b_strategy?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}