// src/shared/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Supabase 클라이언트를 싱글톤으로 관리하기 위한 변수
let supabaseInstance: ReturnType<typeof createCustomClient> | null = null;

// 커스텀 클라이언트 생성 함수
function createCustomClient() {
  const originalClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  });

  // 데이터베이스 작업 로깅을 위한 래퍼 함수들
  return {
    ...originalClient,
    storage: originalClient.storage,
    auth: originalClient.auth,
    realtime: originalClient.realtime,
    from: (table: string) => {
      const query = originalClient.from(table);
      
      // select 메서드 래핑
      const originalSelect = query.select.bind(query);
      query.select = function(...args: any[]) {
        return originalSelect(...args);
      };
      
      // insert 메서드 래핑
      const originalInsert = query.insert.bind(query);
      query.insert = function(values: any, options?: any) {
        return originalInsert(values, options);
      };
      
      // update 메서드 래핑
      const originalUpdate = query.update.bind(query);
      query.update = function(values: any, options?: any) {
        return originalUpdate(values, options);
      };
      
      // delete 메서드 래핑
      const originalDelete = query.delete.bind(query);
      query.delete = function(options?: any) {
        return originalDelete(options);
      };
      
      return query;
    },
    // realtime 구독을 위한 channel 메서드 추가
    channel: (channelName: string) => {
      return originalClient.channel(channelName);
    },
    // removeChannel 메서드 추가
    removeChannel: (channel: any) => {
      return originalClient.removeChannel(channel);
    }
  };
}

// 싱글톤 패턴으로 Supabase 클라이언트 인스턴스 가져오기
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createCustomClient();
  }
  return supabaseInstance;
})();


