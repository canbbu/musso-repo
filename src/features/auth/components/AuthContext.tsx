import React, { createContext, useContext, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';

// Create a context for authentication with a default undefined value
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export function AuthProvider({ children }: { children: ReactNode }) {
  // Get auth state and re-render when it changes
  const auth = useAuth();
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Hook for child components to get the auth object and re-render when it changes
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Component to protect routes
export function RequireAuth() {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  console.log('[DEBUG] RequireAuth 체크:', {
    isAuthenticated,
    currentPath: location.pathname
  });

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 인증된 경우 자식 라우트 렌더링
  return <Outlet />;
}

// 시즌 종료: 관리자만 접근 가능한 라우트 보호
export function RequireAdmin() {
  const { isAuthenticated, canManage } = useAuthContext();
  const location = useLocation();

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 관리자가 아닌 경우 선수 통계 페이지로 리다이렉트
  if (!canManage()) {
    return <Navigate to="/stats" replace />;
  }

  return <Outlet />;
}
