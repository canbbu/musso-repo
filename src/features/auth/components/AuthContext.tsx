import React, { createContext, useContext, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useSportAccess } from '@/features/sport-access/hooks/use-sport-access';
import { FutsalAccessDenied } from '@/features/futsal/components/FutsalAccessDenied';
import { SoccerAccessDenied } from '@/features/sport-access/components/SoccerAccessDenied';
import Layout from '@/shared/components/layout/Layout';

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

// 관리자만 접근 가능한 라우트 보호
export function RequireAdmin() {
  const { isAuthenticated, canManage } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!canManage()) {
    return <Navigate to="/stats" replace />;
  }
  return <Outlet />;
}

// 축구 페이지 접근: 로그인 + 축구 권한(soccer_access) 필요. 풋살 이름만 등록(futsal-guest)은 비로그인처럼 로그인 페이지로
export function RequireSoccerAccess() {
  const { isAuthenticated, role, logout } = useAuthContext();
  const { canAccessSoccer, loading } = useSportAccess();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname || '/dashboard' }} replace />;
  }
  if (role === 'futsal-guest') {
    logout();
    return <Navigate to="/login" state={{ from: location.pathname || '/dashboard' }} replace />;
  }
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">로딩 중...</div>
      </Layout>
    );
  }
  if (!canAccessSoccer) {
    return <SoccerAccessDenied />;
  }
  return <Outlet />;
}

// 풋살 페이지 접근 권한 (로그인 + 풋살 권한 필요, 없으면 권한 요청 UI)
export function RequireFutsalAccess({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const { canAccessFutsal, loading } = useSportAccess();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">로딩 중...</div>
      </Layout>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/futsal/login" state={{ from: '/futsal' }} replace />;
  }
  if (!canAccessFutsal) {
    return <FutsalAccessDenied />;
  }
  return <>{children}</>;
}
