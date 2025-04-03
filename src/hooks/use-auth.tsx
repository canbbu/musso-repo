
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  userId: string | null;
  userName: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userId: null,
    userName: null,
    role: null,
    isAuthenticated: false
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');

    setUserInfo({
      userId,
      userName,
      role,
      isAuthenticated
    });
  }, []);

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const hasPermission = (allowedRoles: string[]) => {
    return allowedRoles.includes(userInfo.role || '');
  };

  // Check if user can manage player stats (coaches only)
  const canManagePlayerStats = () => {
    return hasPermission(['coach', 'assistant_coach']);
  };

  // 모든 사용자에게 공지사항 및 일정 관리 권한 부여
  const canManageAnnouncements = () => {
    // 모든 역할에 대해 true 반환
    return true;
  };

  // Check if user can manage finances (treasurer only)
  const canManageFinance = () => {
    return hasPermission(['treasurer']);
  };

  return {
    ...userInfo,
    logout,
    hasPermission,
    canManagePlayerStats,
    canManageAnnouncements,
    canManageFinance
  };
}
