
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

  // Check if user can manage player stats (coaches only)
  const canManagePlayerStats = useCallback(() => {
    return hasPermission(['coach', 'assistant_coach']);
  }, [hasPermission]);

  // 모든 사용자에게 공지사항 및 일정 관리 권한 부여
  const canManageAnnouncements = useCallback(() => {
    // 모든 역할에 대해 true 반환
    return true;
  }, []);

  // Check if user can manage finances (treasurer only)
  const canManageFinance = useCallback(() => {
    return hasPermission(['treasurer']);
  }, [hasPermission]);

  // Check if the user is an admin
  const isAdmin = useCallback(() => {
    // In a real app, this would check the user's role from a database
    // For this demo, we'll consider users who can manage announcements as admins
    return canManageAnnouncements();
  }, [canManageAnnouncements]);

  return {
    ...userInfo,
    logout,
    hasPermission,
    canManagePlayerStats,
    canManageAnnouncements,
    canManageFinance,
    isAdmin
  };
}
