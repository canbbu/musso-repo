
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import '../styles/Dashboard.css';
import { useIsMobile } from '@/hooks/use-mobile';
import Layout from '@/components/Layout';

import MobileNavigation from '@/components/dashboard/MobileNavigation';
import CalendarView from '@/components/dashboard/CalendarView';
import AnnouncementsCard from '@/components/dashboard/AnnouncementsCard';
import UpcomingMatchesCardWrapper from '@/components/dashboard/UpcomingMatchesCardWrapper';
import MvpVotingCard from '@/components/dashboard/MvpVotingCard';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useMatchData, Match } from '@/hooks/use-match-data';

const Dashboard = () => {
  const { userName, canManageAnnouncements } = useAuth();
  const isMobile = useIsMobile();
  const { announcements, upcomingMatches, calendarEvents } = useDashboardData();
  const { checkForTodaysMatch } = useMatchData();
  const [todaysCompletedMatch, setTodaysCompletedMatch] = useState<Match | null>(null);
  
  useEffect(() => {
    const match = checkForTodaysMatch();
    if (match) {
      setTodaysCompletedMatch(match);
    }
  }, [checkForTodaysMatch]);

  return (
    <Layout>
      <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600">안녕하세요, {userName}님! 축구회 관리 시스템에 오신 것을 환영합니다.</p>
      </div>
      
      {/* MVP Voting Card - Show only when there's a completed match today */}
      {todaysCompletedMatch && (
        <div className="mb-6">
          <MvpVotingCard 
            matchId={todaysCompletedMatch.id}
            matchDate={todaysCompletedMatch.date}
            opponent={todaysCompletedMatch.opponent}
            result={todaysCompletedMatch.result}
            score={todaysCompletedMatch.score}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <CalendarView calendarEvents={calendarEvents} />

        {/* Announcements */}
        <AnnouncementsCard 
          announcements={announcements} 
          canManageAnnouncements={canManageAnnouncements()} 
        />
      </div>
      
      {/* Upcoming Match Card */}
      <div className="mt-6">
        <UpcomingMatchesCardWrapper upcomingMatches={upcomingMatches} />
      </div>
    </Layout>
  );
};

export default Dashboard;
