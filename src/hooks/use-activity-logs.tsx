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
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());

  // 세션 타임아웃 설정 (30분)
  const SESSION_TIMEOUT_MINUTES = 30;

  // 날짜 비교 함수 (YYYY-MM-DD 형태로 비교)
  const isDifferentDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1).toDateString();
    const d2 = new Date(date2).toDateString();
    return d1 !== d2;
  };

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

  // 활동 시간 업데이트
  const updateActivity = useCallback(() => {
    setLastActivityTime(new Date());
  }, []);

  // 세션 만료 체크
  const checkSessionExpiry = useCallback(async () => {
    if (!currentSession) return;

    const now = new Date();
    const timeDiff = now.getTime() - lastActivityTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff > SESSION_TIMEOUT_MINUTES) {
      await logUserLogout();
    }
  }, [currentSession, lastActivityTime]);

  // 오래된 세션 정리
  const cleanupStaleSessions = useCallback(async () => {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      // 하루 이상 된 로그아웃하지 않은 세션들 찾기 (배치 처리: 50개씩)
      const { data: staleSessions, error: selectError } = await supabase
        .from('user_activity_logs')
        .select('id, login_time, last_activity')
        .is('logout_time', null)
        .lt('login_time', oneDayAgo.toISOString())
        .limit(50); // 배치 크기 제한

      if (selectError) {
        return { success: false, processed: 0 };
      }

      if (!staleSessions || staleSessions.length === 0) {
        return { success: true, processed: 0 };
      }

      

      // 세션을 10개씩 나누어 처리 (과부하 방지)
      const batchSize = 10;
      let totalProcessed = 0;
      
      for (let i = 0; i < staleSessions.length; i += batchSize) {
        const batch = staleSessions.slice(i, i + batchSize);
        
        // 배치 단위로 업데이트
        for (const session of batch) {
          try {
            const loginDate = new Date(session.login_time);
            const endOfDay = new Date(loginDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            const durationMinutes = Math.round((endOfDay.getTime() - loginDate.getTime()) / (1000 * 60));
            
            const { error: updateError } = await supabase
              .from('user_activity_logs')
              .update({
                logout_time: endOfDay.toISOString(),
                duration_minutes: durationMinutes,
                updated_at: new Date().toISOString()
              })
              .eq('id', session.id);

            if (!updateError) {
              totalProcessed++;
            } else {
              console.error(`[활동로그] 세션 ${session.id} 업데이트 실패:`, updateError);
            }
          } catch (err) {
            console.error(`[활동로그] 세션 ${session.id} 처리 중 오류:`, err);
          }
        }
        
        // 배치 간 딜레이 (서버 부하 방지)
        if (i + batchSize < staleSessions.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      
      return { success: true, processed: totalProcessed };
    } catch (err) {
      console.error('[활동로그] 오래된 세션 정리 중 오류:', err);
      return { success: false, processed: 0 };
    }
  }, []);

  // 접속 로그 기록 (일일 세션 구분 적용)
  const logUserLogin = useCallback(async (userData: Omit<ActivityLogData, 'session_id' | 'device_type' | 'ip_address' | 'user_agent'>) => {
    const sessionKey = `musso_session_${userData.user_name}`;
    const existingSessionData = localStorage.getItem(sessionKey);
    const today = new Date().toISOString();
    
    // 기존 세션이 있는 경우 날짜 체크
    if (existingSessionData) {
      try {
        const existingSession = JSON.parse(existingSessionData);
        
        if (isDifferentDay(existingSession.login_time, today)) {
          
          
          // 이전 세션을 전날 23:59:59로 종료 처리
          const loginDate = new Date(existingSession.login_time);
          const endOfPreviousDay = new Date(loginDate);
          endOfPreviousDay.setHours(23, 59, 59, 999);
          
          const durationMinutes = Math.round((endOfPreviousDay.getTime() - loginDate.getTime()) / (1000 * 60));
          
          await supabase
            .from('user_activity_logs')
            .update({ 
              logout_time: endOfPreviousDay.toISOString(),
              duration_minutes: durationMinutes,
              updated_at: today
            })
            .eq('id', existingSession.id);
          
          // localStorage 정리 후 새 세션 시작을 위해 상태 초기화
          localStorage.removeItem(sessionKey);
          setCurrentSession(null);
          setHasLoggedIn(false);
        } else {
          // 같은 날이면 기존 세션 복원
          
          setCurrentSession(existingSession);
          setHasLoggedIn(true);
          setLastActivityTime(new Date());
          return existingSession;
        }
      } catch (error) {
        console.error('[활동로그] 기존 세션 데이터 파싱 오류:', error);
        localStorage.removeItem(sessionKey);
      }
    }
    
    // 이미 로그인했거나 로깅 중이면 리턴
    if (isLogging || (currentSession && !isDifferentDay(currentSession.login_time, today))) {
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
        page_views: 1,
        last_activity: today
      };

      

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
      setLastActivityTime(new Date());
      
      
      return session;
    } catch (err) {
      console.error('[활동로그] 접속 로그 기록 중 오류:', err);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, [currentSession, hasLoggedIn, isLogging]); // 의존성 배열 추가

  // 페이지 뷰 업데이트
  const updatePageView = useCallback(async () => {
    if (!currentSession) return;

    // 날짜가 바뀐 경우 체크
    const today = new Date().toISOString();
    if (isDifferentDay(currentSession.login_time, today)) {
      
      return;
    }

    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .update({ 
          page_views: currentSession.page_views + 1,
          last_activity: today,
          updated_at: today
        })
        .eq('id', currentSession.id);

      if (error) {
        console.error('[활동로그] 페이지 뷰 업데이트 실패:', error);
      } else {
        setCurrentSession(prev => prev ? { ...prev, page_views: prev.page_views + 1 } : null);
        updateActivity();
      }
    } catch (err) {
      console.error('[활동로그] 페이지 뷰 업데이트 중 오류:', err);
    }
  }, [currentSession, updateActivity]);

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

  // 중복 로그 정리 (관리자용) - 일일 세션 기반으로 개선
  const cleanupDuplicateLogs = useCallback(async () => {
    try {
      
      
      // 로그아웃하지 않은 세션들 찾기 (배치 처리: 100개씩)
      const { data: duplicateLogs, error: selectError } = await supabase
        .from('user_activity_logs')
        .select('id, user_name, login_time, logout_time')
        .is('logout_time', null)
        .order('login_time', { ascending: false })
        .limit(100); // 배치 크기 제한

      if (selectError) {
        console.error('[활동로그] 중복 로그 조회 실패:', selectError);
        return { success: false, deleted: 0 };
      }

      if (!duplicateLogs || duplicateLogs.length === 0) {
        
        return { success: true, deleted: 0 };
      }

      // 사용자별, 날짜별로 그룹화
      const groupedLogs = duplicateLogs.reduce((acc, log) => {
        const loginDate = new Date(log.login_time).toDateString();
        const key = `${log.user_name}_${loginDate}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(log);
        return acc;
      }, {} as Record<string, typeof duplicateLogs>);

      const logsToDelete: number[] = [];
      
      Object.values(groupedLogs).forEach(logs => {
        if (logs.length > 1) {
          // 가장 최신 로그만 남기고 나머지 삭제 대상에 추가
          logs.slice(1).forEach(log => logsToDelete.push(log.id));
        }
      });

      if (logsToDelete.length === 0) {
        
        return { success: true, deleted: 0 };
      }

      // 삭제 작업을 10개씩 나누어 처리
      const batchSize = 10;
      let totalDeleted = 0;

      for (let i = 0; i < logsToDelete.length; i += batchSize) {
        const batch = logsToDelete.slice(i, i + batchSize);
        
        try {
          const { error: deleteError } = await supabase
            .from('user_activity_logs')
            .delete()
            .in('id', batch);

          if (!deleteError) {
            totalDeleted += batch.length;
          } else {
            console.error('[활동로그] 배치 삭제 실패:', deleteError);
          }
        } catch (err) {
          console.error('[활동로그] 배치 삭제 중 오류:', err);
        }

        // 배치 간 딜레이
        if (i + batchSize < logsToDelete.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      
      return { success: true, deleted: totalDeleted };
    } catch (err) {
      console.error('[활동로그] 중복 로그 정리 중 오류:', err);
      return { success: false, deleted: 0 };
    }
  }, []);

  // 주기적 세션 체크 (5분마다)
  useEffect(() => {
    if (!currentSession) return;

    const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000); // 5분
    return () => clearInterval(interval);
  }, [checkSessionExpiry, currentSession]);

  // 사용자 활동 감지 이벤트들
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  // Tab Visibility API 활용
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 탭이 숨겨짐 - 마지막 활동 시간 기록
        updateActivity();
      } else {
        // 탭이 다시 활성화됨 - 세션 유효성 체크
        checkSessionExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateActivity, checkSessionExpiry]);

  // 앱 시작 시 정리 작업 실행
  useEffect(() => {
    cleanupStaleSessions();
  }, [cleanupStaleSessions]);

  // 매일 자정에 세션 정리 (선택적)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      
      cleanupStaleSessions();
      
      // 24시간마다 반복
      const intervalId = setInterval(() => {
        cleanupStaleSessions();
      }, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, [cleanupStaleSessions]);

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
    cleanupDuplicateLogs,
    cleanupStaleSessions,
    SESSION_TIMEOUT_MINUTES // 설정값 노출
  };
} 