// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Supabase 연결 확인 함수
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('players').select('count(*)');
    if (error) throw error;
    console.log('Supabase 연결 성공:', data);
    return true;
  } catch (error) {
    console.error('Supabase 연결 오류:', error);
    return false;
  }
}