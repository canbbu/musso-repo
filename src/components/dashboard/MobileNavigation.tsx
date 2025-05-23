import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, Trophy, Image, CreditCard, LogOut, User, Database,UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/hooks/use-auth';
import UserProfileButton from '../profile/UserProfileButton';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    logout, 
    userName, 
    canManage,
    canManageMatches, 
    canManageAnnouncements, 
    canManageFinance, 
    canManagePlayerStats 
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Define navigation items with permission checks
  const getNavItems = () => {
    const baseItems = [
      { title: '대시보드', path: '/dashboard', icon: Home, alwaysShow: true },
      { title: '이벤트 관리', path: '/matches', icon: Calendar, show: true }, // Show to everyone
      { title: '선수 통계', path: '/stats', icon: Trophy, show: true },
      { title: '내 기록', path: '/my-stats', icon: User, show: true },
      // { title: '재정 관리', path: '/finance', icon: CreditCard, show: canManageFinance() },
      { title: '회원 등록', path: '/register', icon: UserPlus, show: canManageAnnouncements() },
      // { title: '데이터 테스트', path: '/data-test', icon: Database, alwaysShow: true },
      { title: '선수 전체 통계', path: '/entire-player-stats', icon: Database, alwaysShow: canManage() },
    ];
    
    return baseItems.filter(item => item.alwaysShow || item.show);
  };
  
  const navItems = getNavItems();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm py-2 px-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">축구회 관리</h1>
      <div className="flex items-center gap-2">
        <UserProfileButton />
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <SheetHeader className="pb-4">
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <div className="border-b pb-4 mb-4">
              <p className="text-sm text-gray-500">안녕하세요, {userName}님</p>
            </div>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Button
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </Button>
                  </li>
                ))}
                <li className="pt-4 border-t mt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNavigation;
