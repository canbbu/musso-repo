
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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { title: '대시보드', path: '/dashboard', icon: Home },
    { title: '경기 관리', path: '/matches', icon: Calendar },
    { title: '선수 통계', path: '/stats', icon: Trophy },
    { title: '내 기록', path: '/my-stats', icon: User },
    { title: '갤러리', path: '/gallery', icon: Image },
    { title: '재정 관리', path: '/finance', icon: CreditCard },
  ];

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
