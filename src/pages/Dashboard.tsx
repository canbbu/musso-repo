
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import '../styles/Dashboard.css';
import { Calendar as CalendarIcon, MessageSquare, ChevronRight, AlertCircle, Calendar as CalendarComponent, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
}

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'scheduled' | 'cancelled';
}

const Dashboard = () => {
  const { userName, canManageAnnouncements } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { 
      id: 1, 
      type: 'notice',
      title: '이번 주 경기 공지', 
      date: '2023-11-20', 
      content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
      author: '김운영',
      updatedAt: '2023-11-20 14:30'
    },
    { 
      id: 2, 
      type: 'notice',
      title: '연말 모임 안내', 
      date: '2023-11-18', 
      content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
      author: '박감독',
      updatedAt: '2023-11-18 10:15'
    },
    { 
      id: 3, 
      type: 'match',
      title: 'FC 서울과의 경기', 
      date: '2023-11-25', 
      content: '이번 경기는 중요한 라이벌전입니다. 많은 참여 부탁드립니다.',
      author: '박감독'
    },
  ]);

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([
    { 
      id: 1, 
      date: '2023-11-25 19:00', 
      location: '서울 마포구 풋살장', 
      opponent: 'FC 서울',
      attending: 8,
      notAttending: 3, 
      pending: 5,
      status: 'scheduled'
    },
    { 
      id: 2, 
      date: '2023-12-02 18:00', 
      location: '강남 체육공원', 
      opponent: '강남 유나이티드',
      attending: 6,
      notAttending: 2,
      pending: 8,
      status: 'cancelled'
    },
  ]);

  // Calculate events for the calendar
  const getCalendarEvents = () => {
    const events: Record<string, { type: 'match' | 'notice', title: string, status?: 'scheduled' | 'cancelled' }[]> = {};
    
    // Add matches to calendar
    upcomingMatches.forEach(match => {
      const matchDate = new Date(match.date);
      const dateStr = matchDate.toISOString().split('T')[0];
      
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ 
        type: 'match', 
        title: `vs ${match.opponent}`,
        status: match.status 
      });
    });
    
    // Add other announcements with dates to calendar
    announcements.filter(a => a.type === 'notice').forEach(announcement => {
      const dateStr = announcement.date;
      
      if (!events[dateStr]) events[dateStr] = [];
      events[dateStr].push({ type: 'notice', title: announcement.title });
    });
    
    return events;
  };
  
  const calendarEvents = getCalendarEvents();

  // Mobile navigation items
  const navItems = [
    { title: '대시보드', path: '/dashboard' },
    { title: '경기 일정', path: '/matches' },
    { title: '선수 통계', path: '/stats' },
    { title: '갤러리', path: '/gallery' },
    { title: '재정', path: '/finance' },
  ];

  return (
    <div className="dashboard-content relative">
      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm py-2 px-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">축구회 관리</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-4 px-2">메뉴</h2>
                <nav>
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            navigate(item.path);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item.title}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600">안녕하세요, {userName}님! 축구회 관리 시스템에 오신 것을 환영합니다.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
              팀 일정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="calendar-wrapper h-full w-full">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0 w-full"
                modifiersClassNames={{
                  selected: 'bg-blue-500 text-white hover:bg-blue-600',
                }}
                modifiersStyles={{
                  event: { border: '2px solid #16a34a' },
                  notice: { backgroundColor: '#e0f2fe' },
                  cancelled: { backgroundColor: '#fee2e2', textDecoration: 'line-through' },
                }}
                styles={{
                  day: {
                    height: '40px'
                  },
                  months: {
                    width: '100%'
                  },
                  month: {
                    width: '100%'
                  },
                  table: {
                    width: '100%'
                  }
                }}
                modifiers={{
                  event: (date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return !!calendarEvents[dateStr]?.find(e => e.type === 'match' && e.status !== 'cancelled');
                  },
                  notice: (date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return !!calendarEvents[dateStr]?.find(e => e.type === 'notice');
                  },
                  cancelled: (date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return !!calendarEvents[dateStr]?.find(e => e.type === 'match' && e.status === 'cancelled');
                  }
                }}
              />

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded border-2 border-green-500 mr-2"></div>
                  <span>경기 일정</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded bg-blue-100 mr-2"></div>
                  <span>공지사항</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded bg-red-100 mr-2"></div>
                  <span>취소된 경기</span>
                </div>
              </div>
            </div>

            {date && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                
                {calendarEvents[date.toISOString().split('T')[0]] ? (
                  <ul className="space-y-2">
                    {calendarEvents[date.toISOString().split('T')[0]].map((event, idx) => (
                      <li key={idx} className="flex items-center">
                        {event.type === 'match' ? (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            event.status === 'cancelled' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.status === 'cancelled' ? '취소된 경기' : '경기'}
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            공지
                          </div>
                        )}
                        <span className={`ml-2 ${event.status === 'cancelled' ? 'line-through text-red-500' : ''}`}>
                          {event.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">일정이 없습니다.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="bg-white h-fit">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" />
                공지사항
              </CardTitle>
              {canManageAnnouncements() && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/announcement-management')}
                  className="whitespace-nowrap"
                >
                  관리
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                      <h3 className="font-medium">{announcement.title}</h3>
                      {announcement.type === 'match' && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          경기
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-1">{announcement.content}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>{announcement.date}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>작성자: {announcement.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500">공지사항이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Match Card */}
      <div className="mt-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle className="flex items-center">
                <CalendarComponent className="mr-2 h-5 w-5 text-green-600" />
                다가오는 경기
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/matches')}
                className="whitespace-nowrap"
              >
                더 보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>상대팀</TableHead>
                      <TableHead className="hidden sm:table-cell">장소</TableHead>
                      <TableHead className="text-center">참석/불참/미정</TableHead>
                      <TableHead className="text-center">상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingMatches.map((match) => (
                      <TableRow key={match.id} className={match.status === 'cancelled' ? 'bg-red-50' : ''}>
                        <TableCell>
                          {new Date(match.date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className={`font-medium ${match.status === 'cancelled' ? 'line-through text-red-500' : ''}`}>
                          {match.opponent}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{match.location}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2 text-sm flex-wrap">
                            <span className="text-green-600">{match.attending}명</span>/
                            <span className="text-red-600">{match.notAttending}명</span>/
                            <span className="text-gray-600">{match.pending}명</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {match.status === 'cancelled' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              취소됨
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              예정됨
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500">예정된 경기가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
