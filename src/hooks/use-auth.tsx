
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const role = localStorage.getItem('userRole');

    return {
      userId,
      userName,
      role,
      isAuthenticated
    };
  });

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
    return hasPermission(['coach']);
  }, [hasPermission]);

  // 공지사항 및 일정 관리 권한 (회장, 부회장에게만 부여)
  const canManageAnnouncements = useCallback(() => {
    return hasPermission(['president', 'vice_president']);
  }, [hasPermission]);

  // 재정 관리 권한 (회계에게만 부여)
  const canManageFinance = useCallback(() => {
    return hasPermission(['treasurer']);
  }, [hasPermission]);

  // 선수 기록 관리 권한 (감독, 코치에게만 부여)
  const canManagePlayerStats = useCallback(() => {
    return hasPermission(['coach', 'assistant_coach']);
  }, [hasPermission]);

  // 일반 사용자 권한 (모든 사용자에게 부여 - 참석, 불참석, 투표, 갤러리 접근)
  const canAccessBasicFeatures = useCallback(() => {
    return true; // 모든 사용자가 기본 기능에 접근 가능
  }, []);

  // 관리자 여부 체크
  const isAdmin = useCallback(() => {
    return hasPermission(['president', 'vice_president', 'coach']);
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
