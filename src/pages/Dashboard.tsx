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
  const { announcements, matchAnnouncements, upcomingMatches, calendarEvents } = useDashboardData();
  const { checkForTodaysMatch, handleAttendanceChange } = useMatchData();
  const [todaysCompletedMatch, setTodaysCompletedMatch] = useState<Match | null>(null);
  
  useEffect(() => {
    const match = checkForTodaysMatch();
    if (match) {
      setTodaysCompletedMatch(match);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시에만 실행되도록 수정

  // Convert UpcomingMatch[] to Match[] by adding required properties
  const convertedUpcomingMatches: Match[] = upcomingMatches.map(match => ({
    id: match.id,
    date: match.date,
    location: match.location,
    opponent: match.opponent || '',
    status: match.status,
    attendance: {
      attending: match.attending,
      notAttending: match.notAttending,
      pending: match.pending
    },
    userResponse: null
  }));
  

  return (
    <Layout>
      <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600">안녕하세요, {userName}님! 무쏘 홈페이지에 오신 것을 환영합니다.</p>
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
          canManageAnnouncements={canManageAnnouncements} 
        />
      </div>
      
      {/* Upcoming Match Card */}
      <div className="mt-6">
        <UpcomingMatchesCardWrapper 
          upcomingMatches={convertedUpcomingMatches} 
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
