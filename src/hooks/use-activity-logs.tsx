import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ActivityLogData {
  user_id?: string;
  user_name: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
}

interface ActivitySession {
  id: number;
  session_id: string;
  login_time: string;
  logout_time?: string;
  duration_minutes?: number;
  page_views: number;
}

export function useActivityLogs() {
  const [currentSession, setCurrentSession] = useState<ActivitySession | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false); // 로그인 여부 추적

  // 디바이스 타입 감지
  const detectDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|phone|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  };

  // IP 주소 가져오기 (간단한 방법)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // 세션 ID 생성
  const generateSessionId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // 접속 로그 기록 (중복 방지 강화)
  const logUserLogin = useCallback(async (userData: Omit<ActivityLogData, 'session_id' | 'device_type' | 'ip_address' | 'user_agent'>) => {
    // 브라우저 세션 내 중복 로그인 방지
    const sessionKey = `musso_session_${userData.user_name}`;
    const existingSession = localStorage.getItem(sessionKey);
    
    // 이미 로그인했거나 로깅 중이면 리턴
    if (isLogging || currentSession || hasLoggedIn || existingSession) {
      console.log('[활동로그] 중복 로그인 시도 방지:', { 
        isLogging, 
        currentSession: !!currentSession, 
        hasLoggedIn,
        existingSession: !!existingSession 
      });
      return currentSession;
    }
    
    setIsLogging(true);
    
    try {
      const sessionId = generateSessionId();
      const deviceType = detectDeviceType();
      const ipAddress = await getClientIP();
      const userAgent = navigator.userAgent;

      const logData = {
        user_id: userData.user_id || null,
        user_name: userData.user_name,
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        page_views: 1
      };

      console.log('[활동로그] 새 세션 생성 시도:', { sessionId, userName: userData.user_name });

      const { data, error } = await supabase
        .from('user_activity_logs')
        .insert([logData])
        .select('id, session_id, login_time, logout_time, duration_minutes, page_views')
        .single();

      if (error) {
        console.error('[활동로그] 접속 로그 기록 실패:', error);
        return null;
      }

      const session: ActivitySession = {
        id: data.id,
        session_id: data.session_id,
        login_time: data.login_time,
        logout_time: data.logout_time,
        duration_minutes: data.duration_minutes,
        page_views: data.page_views
      };

      // 세션 정보를 localStorage에 저장
      localStorage.setItem(sessionKey, JSON.stringify(session));

      setCurrentSession(session);
      setHasLoggedIn(true);
      console.log('[활동로그] 접속 로그 기록 성공:', session);
      
      return session;
    } catch (err) {
      console.error('[활동로그] 접속 로그 기록 중 오류:', err);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, []); // 의존성 배열을 비워서 함수 재생성 방지

  // 페이지 뷰 업데이트
  const updatePageView = useCallback(async () => {
    if (!currentSession) return;

    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .update({ 
          page_views: currentSession.page_views + 1,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (error) {
        console.error('[활동로그] 페이지 뷰 업데이트 실패:', error);
      } else {
        setCurrentSession(prev => prev ? { ...prev, page_views: prev.page_views + 1 } : null);
      }
    } catch (err) {
      console.error('[활동로그] 페이지 뷰 업데이트 중 오류:', err);
    }
  }, [currentSession]);

  // 접속 종료 로그 기록
  const logUserLogout = useCallback(async () => {
    if (!currentSession) return;

    // 현재 세션의 사용자명 찾기 위해 localStorage 확인
    const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('musso_session_'));
    
    try {
      const logoutTime = new Date().toISOString();
      const loginTime = new Date(currentSession.login_time);
      const logoutTimeDate = new Date(logoutTime);
      const durationMinutes = Math.round((logoutTimeDate.getTime() - loginTime.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('user_activity_logs')
        .update({ 
          logout_time: logoutTime,
          duration_minutes: durationMinutes,
          updated_at: logoutTime
        })
        .eq('id', currentSession.id);

      if (error) {
        console.error('[활동로그] 접속 종료 로그 기록 실패:', error);
      } else {
        console.log('[활동로그] 접속 종료 로그 기록 성공:', { sessionId: currentSession.session_id, durationMinutes });
      }
    } catch (err) {
      console.error('[활동로그] 접속 종료 로그 기록 중 오류:', err);
    } finally {
      // localStorage에서 세션 정보 제거
      sessionKeys.forEach(key => localStorage.removeItem(key));
      
      // 상태 초기화 (성공/실패 관계없이)
      setCurrentSession(null);
      setHasLoggedIn(false);
    }
  }, [currentSession]);

  // 활동 통계 조회
  const getActivityStats = useCallback(async (days: number = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('user_name, login_time, logout_time, duration_minutes, device_type, page_views')
        .gte('login_time', startDate.toISOString())
        .order('login_time', { ascending: false });

      if (error) {
        console.error('[활동로그] 통계 조회 실패:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('[활동로그] 통계 조회 중 오류:', err);
      return null;
    }
  }, []);

  // 중복 로그 정리 (관리자용)
  const cleanupDuplicateLogs = useCallback(async () => {
    try {
      console.log('[활동로그] 중복 로그 정리 시작...');
      
      // 같은 시간(분 단위)에 생성된 중복 로그들을 찾아서 정리
      const { data: duplicateLogs, error: selectError } = await supabase
        .from('user_activity_logs')
        .select('id, user_name, login_time, logout_time')
        .is('logout_time', null) // 로그아웃하지 않은 세션들
        .order('login_time', { ascending: false });

      if (selectError) {
        console.error('[활동로그] 중복 로그 조회 실패:', selectError);
        return false;
      }

      if (!duplicateLogs || duplicateLogs.length === 0) {
        console.log('[활동로그] 정리할 중복 로그가 없습니다.');
        return true;
      }

      // 사용자별로 그룹화하여 가장 최신 로그만 남기고 나머지 삭제
      const groupedLogs = duplicateLogs.reduce((acc, log) => {
        const key = `${log.user_name}_${log.login_time.substring(0, 16)}`; // 분 단위로 그룹화
        if (!acc[key]) acc[key] = [];
        acc[key].push(log);
        return acc;
      }, {} as Record<string, typeof duplicateLogs>);

      const logsToDelete: number[] = [];
      
      Object.values(groupedLogs).forEach(logs => {
        if (logs.length > 1) {
          // 첫 번째 로그(최신)만 남기고 나머지 삭제 대상에 추가
          logs.slice(1).forEach(log => logsToDelete.push(log.id));
        }
      });

      if (logsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_activity_logs')
          .delete()
          .in('id', logsToDelete);

        if (deleteError) {
          console.error('[활동로그] 중복 로그 삭제 실패:', deleteError);
          return false;
        }

        console.log(`[활동로그] ${logsToDelete.length}개의 중복 로그를 정리했습니다.`);
      }

      return true;
    } catch (err) {
      console.error('[활동로그] 중복 로그 정리 중 오류:', err);
      return false;
    }
  }, []);

  // 브라우저 종료 시 자동 로그아웃
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        // 동기적으로 로그아웃 처리 (navigator.sendBeacon 사용)
        const logoutTime = new Date().toISOString();
        const loginTime = new Date(currentSession.login_time);
        const logoutTimeDate = new Date(logoutTime);
        const durationMinutes = Math.round((logoutTimeDate.getTime() - loginTime.getTime()) / (1000 * 60));

        const payload = JSON.stringify({
          logout_time: logoutTime,
          duration_minutes: durationMinutes,
          updated_at: logoutTime
        });

        // Supabase REST API URL 구성
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey) {
          navigator.sendBeacon(
            `${supabaseUrl}/rest/v1/user_activity_logs?id=eq.${currentSession.id}`,
            new Blob([payload], { type: 'application/json' })
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSession]);

  return {
    currentSession,
    isLogging,
    logUserLogin,
    logUserLogout,
    updatePageView,
    getActivityStats,
    cleanupDuplicateLogs
  };
} 