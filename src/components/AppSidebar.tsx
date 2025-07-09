import React from 'react';
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
  SidebarSeparator
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Home, Calendar, Trophy, Image, CreditCard, LogOut, User, Database, UserPlus, Key, Users, Crown } from 'lucide-react';
// import UserProfileButton from './profile/UserProfileButton';

const AppSidebar = () => {
  const { 
    logout, 
    userName,
    canManage, 
    canManageMatches, 
    canManageAnnouncements, 
    canManageFinance, 
    canManagePlayerStats 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation items with permission checks
  const getNavItems = () => {
    const baseItems = [
      { title: '대시보드', path: '/dashboard', icon: Home, alwaysShow: true },
      { title: '이벤트 관리', path: '/matches', icon: Calendar, show: true }, // Show to everyone
      { title: '선수 통계', path: '/stats', icon: Trophy, show: true },
      { title: '내 기록', path: '/my-stats', icon: User, show: true },
      { title: '명예의 전당', path: '/hall-of-fame', icon: Crown, show: true, color: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' },
      // { title: '재정 관리', path: '/finance', icon: CreditCard, show: canManageFinance() },
      // { title: '회원 등록', path: '/register', icon: UserPlus, show: canManageAnnouncements() },
      // { title: '데이터 테스트', path: '/data-test', icon: Database, alwaysShow: true },
      // { title: '선수 전체 통계', path: '/entire-player-stats', icon: Database, alwaysShow: canManage() },
    ];
    
    return baseItems.filter(item => item.alwaysShow || item.show);
  };

  const navItems = getNavItems();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3">
        <div className="flex flex-col items-center p-2">
          <div className="mb-2">
            {/* Increased the size by making the parent div larger */}
            <div className="h-16 w-16">
              {/* <UserProfileButton large={true} /> */}
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  className={`${location.pathname === item.path ? "bg-primary/10" : ""} ${item.color || ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${item.color ? item.color.split(' ')[0] : 'text-primary'}`} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>로그아웃</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => navigate('/change-profile')}
              >
                <Key className="h-5 w-5 mr-3" />
                <span>프로필 변경</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator />
            {canManage() && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-green-500 hover:text-green-600 hover:bg-green-50"
                    onClick={() => navigate('/attendance-status')}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    <span>출석현황</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                    onClick={() => navigate('/entire-player-stats')}
                  >
                    <Database className="h-5 w-5 mr-3" />
                    <span>선수 전체 통계</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {canManageAnnouncements() && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => navigate('/register')}
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  <span>회원 등록</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
