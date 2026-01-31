// Auth 관련 타입 정의

export interface UserInfo {
  userId: string | null;
  userName: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

export interface AuthState extends UserInfo {
  logout: () => void;
  hasPermission: (allowedRoles: string[]) => boolean;
  canManage: () => boolean;
  canManageMatches: () => boolean;
  canManageAnnouncements: () => boolean;
  canManageFinance: () => boolean;
  canManagePlayerStats: () => boolean;
  canManageFutsal: () => boolean;
  canAccessBasicFeatures: () => boolean;
  isAdmin: () => boolean;
  isSystemManager: () => boolean;
  canManageSystem: () => boolean;
  canManageWithSystemAdmin: () => boolean;
  canManageMatchesWithSystemAdmin: () => boolean;
  canManageAnnouncementsWithSystemAdmin: () => boolean;
  canManageFinanceWithSystemAdmin: () => boolean;
  canManagePlayerStatsWithSystemAdmin: () => boolean;
  isAdminWithSystemAdmin: () => boolean;
  isFutsalGuest: () => boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignUpData {
  username: string;
  password: string;
  name: string;
  email?: string;
  role?: string;
}
