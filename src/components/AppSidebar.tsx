
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Home, Calendar, Trophy, Image, CreditCard, LogOut, User } from 'lucide-react';

const AppSidebar = () => {
  const { 
    logout, 
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
      { title: '경기 관리', path: '/matches', icon: Calendar, show: canManageMatches() },
      { title: '선수 통계', path: '/stats', icon: Trophy, show: true },
      { title: '내 기록', path: '/my-stats', icon: User, show: true },
      { title: '갤러리', path: '/gallery', icon: Image, show: true },
      { title: '재정 관리', path: '/finance', icon: CreditCard, show: canManageFinance() },
    ];
    
    return baseItems.filter(item => item.alwaysShow || item.show);
  };

  const navItems = getNavItems();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  className={location.pathname === item.path ? "bg-primary/10" : ""}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-3 text-primary" />
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
