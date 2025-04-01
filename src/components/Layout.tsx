
import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Calendar, Image, Award, DollarSign, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerStats {
  games: number;
  goals: number;
  assists: number;
  rating: number;
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName] = React.useState('방문자');
  const [playerStats] = React.useState<PlayerStats>({
    games: 12,
    goals: 5,
    assists: 3,
    rating: 7.8
  });
  
  const menuItems = [
    { path: '/dashboard', label: '홈', icon: <Home className="w-5 h-5" /> },
    { path: '/matches', label: '경기', icon: <Calendar className="w-5 h-5" /> },
    { path: '/gallery', label: '갤러리', icon: <Image className="w-5 h-5" /> },
    { path: '/stats', label: '전체 순위', icon: <Award className="w-5 h-5" /> },
    { path: '/finance', label: '회계', icon: <DollarSign className="w-5 h-5" /> },
  ];
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        <Sidebar variant="floating" className="border-r border-gray-200">
          <SidebarHeader className="flex flex-col items-center p-4 border-b">
            <Avatar className="w-24 h-24 mb-3">
              <AvatarImage src="/placeholder.svg" alt={userName} />
              <AvatarFallback className="bg-green-500 text-white text-xl">
                {userName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{userName}</h2>
              <p className="text-sm text-gray-500">회원</p>
            </div>
            
            <Card className="w-full mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span>경기:</span>
                  </div>
                  <div className="text-right font-semibold">{playerStats.games}경기</div>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full text-xs">G</span>
                    <span>득점:</span>
                  </div>
                  <div className="text-right font-semibold">{playerStats.goals}골</div>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-4 h-4 bg-blue-500 text-white rounded-full text-xs">A</span>
                    <span>어시스트:</span>
                  </div>
                  <div className="text-right font-semibold">{playerStats.assists}</div>
                  
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>평점:</span>
                  </div>
                  <div className="text-right font-semibold">{playerStats.rating}</div>
                </div>
              </CardContent>
            </Card>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.label}
                  >
                    <a 
                      href={item.path}
                      className="flex items-center gap-3"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
