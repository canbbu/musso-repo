import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem
} from '@/shared/components/ui/sidebar';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { useSport } from '@/app/sport-context';
import { Home, Calendar, Trophy, Image, CreditCard, LogOut, User, Database, UserPlus, Key, Users, Crown, Clipboard, Award, Footprints, Circle } from 'lucide-react';
// import UserProfileButton from './profile/UserProfileButton';

// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = ['/dashboard', '/stats'];

const AppSidebar = () => {
  const { 
    logout, 
    userName,
    isAuthenticated,
    canManage, 
    canManageMatches, 
    canManageAnnouncements, 
    canManageFinance, 
    canManagePlayerStats 
  } = useAuth();
  const { linkTo, isActivePath, sport } = useSport();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // 메뉴 클릭 핸들러 - 로그인 체크 (현재 스포츠 모드의 경로로 이동)
  const handleMenuClick = (path: string) => {
    const targetPath = linkTo(path);
    // 공개 경로는 바로 이동
    if (PUBLIC_PATHS.includes(path)) {
      navigate(targetPath);
      return;
    }
    
    // 로그인 필요 경로는 인증 체크
    if (!isAuthenticated) {
      setPendingPath(targetPath);
      setLoginModalOpen(true);
    } else {
      navigate(targetPath);
    }
  };

  // 로그인 성공 후 처리
  const handleLoginSuccess = () => {
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  };

  // Define navigation items - 로그인하지 않아도 모든 메뉴 표시
  const getNavItems = () => {
    // 로그인하지 않아도 모든 메뉴를 보여주되, requiresAuth로 구분
    const baseItems = [
      // 로그인 없이 접근 가능한 메뉴
      { title: '대시보드', path: '/dashboard', icon: Home, show: true, requiresAuth: false },
      { title: '선수 통계', path: '/stats', icon: Trophy, show: true, requiresAuth: false },
      
      // 로그인 필요 메뉴들 (로그인하지 않아도 표시)
      { title: '이벤트 관리', path: '/matches', icon: Calendar, show: true, requiresAuth: true },
      { title: '내 기록', path: '/my-stats', icon: User, show: true, requiresAuth: true },
      { title: '명예의 전당', path: '/hall-of-fame', icon: Crown, show: true, requiresAuth: true, color: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' },
      { title: '작전판', path: '/tactics', icon: Clipboard, show: true, requiresAuth: true, color: 'text-green-600 hover:text-green-700 hover:bg-green-50' },
      { title: '회원 등록', path: '/register', icon: UserPlus, show: true, requiresAuth: true },
      { title: '선수 전체 통계', path: '/entire-player-stats', icon: Database, show: true, requiresAuth: true },
    ];
    
    return baseItems.filter(item => item.show);
  };

  const navItems = getNavItems();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3">
        <div className="flex flex-col items-center p-2">
          {!isAuthenticated ? (
            // 로그인하지 않은 경우 로그인 버튼 표시
            <SidebarMenuButton
              className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 mb-2"
              onClick={() => setLoginModalOpen(true)}
            >
              <User className="h-5 w-5 mr-3" />
              <span>로그인</span>
            </SidebarMenuButton>
          ) : (
            // 로그인한 경우 사용자 정보 표시
            <>
              <div className="mb-2">
                <div className="h-16 w-16">
                  {/* <UserProfileButton large={true} /> */}
                </div>
              </div>
              {userName && (
                <div className="text-sm font-medium text-center mt-2">
                  {userName}님
                </div>
              )}
            </>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* 축구 ↔ 풋살 페이지 전환 */}
            <SidebarMenuItem>
              <SidebarMenuButton
                className="py-4 px-3 text-base font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 hover:text-sky-800 border border-sky-200/60 rounded-lg"
                onClick={() => navigate(sport === 'futsal' ? '/' : '/futsal')}
              >
                {sport === 'futsal' ? (
                  <>
                    <Circle className="h-6 w-6 mr-3 shrink-0" />
                    <span>축구 페이지로</span>
                  </>
                ) : (
                  <>
                    <Footprints className="h-6 w-6 mr-3 shrink-0" />
                    <span>풋살 페이지로</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* 풋살 페이지에서는 축구 메뉴 숨김 (네비게이션은 축구/풋살 따로) */}
            {sport === 'soccer' && (
              <>
                <SidebarSeparator />
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={`${isActivePath(item.path) ? "bg-primary/10" : ""} ${item.color || ""} ${!isAuthenticated && item.requiresAuth ? "opacity-70" : ""}`}
                      onClick={() => handleMenuClick(item.path)}
                    >
                      <item.icon className={`h-5 w-5 mr-3 ${item.color ? item.color.split(' ')[0] : 'text-primary'}`} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarSeparator />
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={`text-green-500 hover:text-green-600 hover:bg-green-50 ${!isAuthenticated ? "opacity-70" : ""}`}
                    onClick={() => handleMenuClick('/attendance-status')}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    <span>출석현황</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAuthenticated && (
                  <>
                    <SidebarSeparator />
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleMenuClick('/change-profile')}
                      >
                        <Key className="h-5 w-5 mr-3" />
                        <span>프로필 변경</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>로그아웃</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </>
            )}
            {/* 풋살: 축구 페이지로만 표시, 로그아웃/프로필은 공통 */}
            {sport === 'futsal' && isAuthenticated && (
              <>
                <SidebarSeparator />
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate('/change-profile')}
                  >
                    <Key className="h-5 w-5 mr-3" />
                    <span>프로필 변경</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>로그아웃</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        redirectPath={pendingPath || undefined}
      />
    </Sidebar>
  );
};

export default AppSidebar;
