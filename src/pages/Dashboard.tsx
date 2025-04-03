
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import '../styles/Dashboard.css';
import { useIsMobile } from '@/hooks/use-mobile';

import MobileNavigation from '@/components/dashboard/MobileNavigation';
import CalendarView from '@/components/dashboard/CalendarView';
import AnnouncementsCard from '@/components/dashboard/AnnouncementsCard';
import UpcomingMatchesCard from '@/components/dashboard/UpcomingMatchesCard';
import { useDashboardData } from '@/hooks/use-dashboard-data';

const Dashboard = () => {
  const { userName, canManageAnnouncements } = useAuth();
  const isMobile = useIsMobile();
  const { announcements, upcomingMatches, calendarEvents, navItems } = useDashboardData();

  return (
    <div className="dashboard-content relative">
      {/* Mobile Navigation - Always show on mobile */}
      {isMobile && <MobileNavigation navItems={navItems} />}

      <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600">안녕하세요, {userName}님! 축구회 관리 시스템에 오신 것을 환영합니다.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <CalendarView calendarEvents={calendarEvents} />

        {/* Announcements */}
        <AnnouncementsCard 
          announcements={announcements} 
          canManageAnnouncements={canManageAnnouncements} 
        />
      </div>
      
      {/* Upcoming Match Card */}
      <div className="mt-6">
        <UpcomingMatchesCard upcomingMatches={upcomingMatches} />
      </div>
    </div>
  );
};

export default Dashboard;
