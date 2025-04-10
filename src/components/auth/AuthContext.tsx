
import React, { createContext, useContext, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

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
    // Redirect to login page but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}
