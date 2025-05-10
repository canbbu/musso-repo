// src/lib/database.types.ts
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
          player_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          match_id: number
          player_id: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          player_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}