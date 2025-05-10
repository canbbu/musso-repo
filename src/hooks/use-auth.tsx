import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface UserInfo {
  userId: string | null;
  userName: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    // Initialize user info from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole') || 'player';

    return {
      userId,
      userName,
      role,
      isAuthenticated
    };
  });

  // 세션 유효성 검증 및 정보 갱신
  useEffect(() => {
    const validateSession = async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) return;
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        // 로그인 정보가 없으면 세션 초기화
        logout();
        return;
      }
      
      try {
        // players 테이블에서 사용자 정보 확인
        const { data, error } = await supabase
          .from('players')
          .select('id, name, nickname, role, is_deleted')
          .eq('id', userId)
          .single();
          
        if (error || (data && data.is_deleted)) {
          console.error('사용자 정보 검증 실패:', error || '계정이 비활성화되었습니다.');
          logout();
          return;
        }
        
        // 사용자 정보 갱신
        if (data) {
          const userRole = data.role || 'player'; // 기본값은 일반회원
          localStorage.setItem('userRole', userRole);
          
          setUserInfo(prev => ({
            ...prev,
            userId: data.id,
            userName: data.name || data.nickname,
            role: userRole,
            isAuthenticated: true
          }));
        }
      } catch (err) {
        console.error('세션 검증 중 오류:', err);
      }
    };
    
    validateSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시에만 실행되도록 수정

  const logout = useCallback(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    setUserInfo({
      userId: null,
      userName: null,
      role: null,
      isAuthenticated: false
    });
    
    navigate('/login');
  }, [navigate]);

  const hasPermission = useCallback((allowedRoles: string[]) => {
    return allowedRoles.includes(userInfo.role || '');
  }, [userInfo.role]);

  // 경기관리 권한 (감독에게만 부여)
  const canManageMatches = useCallback(() => {
    return hasPermission(['coach']) 
    // || process.env.NODE_ENV !== 'production';
  }, [hasPermission]);

  // 공지사항 및 일정 관리 권한 (회장, 부회장에게만 부여)
  const canManageAnnouncements = useCallback(() => {
    return hasPermission(['president', 'vice_president']) 
    // || process.env.NODE_ENV !== 'production';
  }, [hasPermission]);

  // 재정 관리 권한 (회계에게만 부여)
  const canManageFinance = useCallback(() => {
    return hasPermission(['treasurer']) 
    // || process.env.NODE_ENV !== 'production';
  }, [hasPermission]);

  // 선수 기록 관리 권한 (감독, 코치에게만 부여)
  const canManagePlayerStats = useCallback(() => {
    return hasPermission(['coach', 'assistant_coach']) 
    // || process.env.NODE_ENV !== 'production';
  }, [hasPermission]);

  // 일반 사용자 권한 (모든 사용자에게 부여 - 참석, 불참석, 투표, 갤러리 접근)
  const canAccessBasicFeatures = useCallback(() => {
    return userInfo.isAuthenticated 
    // || process.env.NODE_ENV !== 'production';
  }, [userInfo.isAuthenticated]);

  // 관리자 여부 체크
  const isAdmin = useCallback(() => {
    return hasPermission(['president', 'vice_president', 'coach']) 
    // || process.env.NODE_ENV !== 'production';
  }, [hasPermission]);

  return {
    ...userInfo,
    logout,
    hasPermission,
    canManageMatches,
    canManageAnnouncements,
    canManageFinance,
    canManagePlayerStats,
    canAccessBasicFeatures,
    isAdmin
  };
}
