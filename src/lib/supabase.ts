// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const originalClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 데이터베이스 작업 로깅을 위한 래퍼 함수들
export const supabase = {
  ...originalClient,
  from: (table: string) => {
    console.log(`[DB 요청] 테이블: ${table} - ${new Date().toISOString()}`);
    const query = originalClient.from(table);
    
    // select 메서드 래핑
    const originalSelect = query.select.bind(query);
    query.select = function(...args: any[]) {
      console.log(`[DB SELECT] 테이블: ${table}, 컬럼: ${args}`);
      return originalSelect(...args);
    };
    
    // insert 메서드 래핑
    const originalInsert = query.insert.bind(query);
    query.insert = function(values: any, options?: any) {
      console.log(`[DB INSERT] 테이블: ${table}, 데이터:`, values);
      return originalInsert(values, options);
    };
    
    // update 메서드 래핑
    const originalUpdate = query.update.bind(query);
    query.update = function(values: any, options?: any) {
      console.log(`[DB UPDATE] 테이블: ${table}, 데이터:`, values);
      return originalUpdate(values, options);
    };
    
    // delete 메서드 래핑
    const originalDelete = query.delete.bind(query);
    query.delete = function(options?: any) {
      console.log(`[DB DELETE] 테이블: ${table}`);
      return originalDelete(options);
    };
    
    return query;
  },
  // realtime 구독을 위한 channel 메서드 추가
  channel: (channelName: string) => {
    console.log(`[DB 채널] 채널 생성: ${channelName}`);
    return originalClient.channel(channelName);
  },
  // removeChannel 메서드 추가
  removeChannel: (channel: any) => {
    console.log(`[DB 채널] 채널 제거:`, channel.id);
    return originalClient.removeChannel(channel);
  }
};

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