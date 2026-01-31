import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Calendar, Trophy, Image, CreditCard, LogOut, User, Database, UserPlus, Crown, Key, Users, Clipboard, Footprints, Circle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useSport } from '@/app/sport-context';
// import UserProfileButton from '../profile/UserProfileButton';

export default function MobileNavigation() {
  const navigate = useNavigate();
  const { linkTo, isActivePath, sport } = useSport();
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
  
  // Define navigation items with permission checks (PC AppSidebar와 동일한 순서)
  const getNavItems = () => {
    const isAdmin = canManage();
    
    const baseItems = [
      { title: '대시보드', path: '/dashboard', icon: Home, show: isAdmin },
      { title: '선수 통계', path: '/stats', icon: Trophy, show: true },
      { title: '이벤트 관리', path: '/matches', icon: Calendar, show: isAdmin },
      { title: '내 기록', path: '/my-stats', icon: User, show: isAdmin },
      { title: '명예의 전당', path: '/hall-of-fame', icon: Crown, show: isAdmin },
      { title: '작전판', path: '/tactics', icon: Clipboard, show: isAdmin },
      { title: '회원 등록', path: '/register', icon: UserPlus, show: canManageAnnouncements() },
      { title: '선수 전체 통계', path: '/entire-player-stats', icon: Database, show: isAdmin },
    ];
    
    return baseItems.filter(item => item.show);
  };
  
  const navItems = getNavItems();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm py-2 px-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">{sport === 'futsal' ? '풋살 관리' : '축구회 관리'}</h1>
      <div className="flex items-center gap-2">
        {/* <UserProfileButton /> */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px] flex flex-col">
            <SheetHeader className="pb-4 flex-shrink-0">
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <div className="border-b pb-4 mb-4 flex-shrink-0">
              <p className="text-sm text-gray-500">안녕하세요, {userName}님</p>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-2 pb-4">
                {/* 축구 ↔ 풋살 페이지 전환 */}
                <li>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left text-sky-600 hover:text-sky-700 hover:bg-sky-50 border-sky-200"
                    onClick={() => {
                      navigate(sport === 'futsal' ? '/' : '/futsal');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {sport === 'futsal' ? (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        축구 페이지로 이동
                      </>
                    ) : (
                      <>
                        <Footprints className="h-4 w-4 mr-2" />
                        풋살 페이지로 이동
                      </>
                    )}
                  </Button>
                </li>
                {/* 풋살 페이지에서는 축구 메뉴 숨김 (네비게이션은 축구/풋살 따로) */}
                {sport === 'soccer' && (
                  <>
                    <li className="border-t pt-2 mt-2" />
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <Button
                          variant={isActivePath(item.path) ? "default" : "ghost"}
                          className={`w-full justify-start text-left ${
                            item.path === '/hall-of-fame'
                              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              : item.path === '/tactics'
                              ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              : ''
                          }`}
                          onClick={() => {
                            navigate(linkTo(item.path));
                            setMobileMenuOpen(false);
                          }}
                        >
                          <item.icon className={`h-4 w-4 mr-2 ${
                            item.path === '/hall-of-fame'
                              ? 'text-yellow-600'
                              : item.path === '/tactics'
                              ? 'text-green-600'
                              : ''
                          }`} />
                          {item.title}
                        </Button>
                      </li>
                    ))}
                    <li className="pt-4 border-t mt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-green-500 hover:text-green-600 hover:bg-green-50"
                        onClick={() => {
                          navigate(linkTo('/attendance-status'));
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        출석현황
                      </Button>
                    </li>
                  </>
                )}
                {/* 프로필 변경 · 로그아웃 (축구/풋살 공통) */}
                <li className="border-t pt-2 mt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      navigate(sport === 'futsal' ? '/change-profile' : linkTo('/change-profile'));
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    프로필 변경
                  </Button>
                </li>
                <li>
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
}
