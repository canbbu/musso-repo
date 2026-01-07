import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireAdmin } from '@/features/auth/components/AuthContext';
import { Dashboard, Finance, FinanceManagement, AnnouncementManagement, PlayerStats, StatsManagement, NotFound, MyStats, EntirePlayerStats, SeasonRankings } from '@/pages';
import DataTestPage from '@/pages/DataTestPage';
import AttendanceStatus from '@/pages/AttendanceStatus';
import HallOfFame from '@/pages/HallOfFame';
// Matches pages
import MatchManagementPage from '@/pages/matches/MatchManagementPage';
import MatchHistoryPage from '@/pages/matches/MatchHistoryPage';
import TacticsPage from '@/pages/matches/TacticsPage';
import TacticsListPage from '@/pages/matches/TacticsListPage';
import AttendanceCheckPage from '@/pages/matches/AttendanceCheckPage';
// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ProfilePage from '@/pages/auth/ProfilePage';

export function AppRoutes() {
  return (
    <Routes>
      {/* 인증이 필요하지 않은 페이지들 */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFound />} />
      
      {/* 인증이 필요한 페이지들 */}
      <Route element={<RequireAuth />}>
        {/* 일반 회원과 관리자 모두 접근 가능한 페이지 (시즌 종료) */}
        <Route path="/stats" element={<PlayerStats />} />
        <Route path="/attendance-status" element={<AttendanceStatus />} />
        <Route path="/season-rankings" element={<SeasonRankings />} />
        
        {/* 관리자만 접근 가능한 페이지 (시즌 종료) */}
        <Route element={<RequireAdmin />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/data-test" element={<DataTestPage />} />
          <Route path="/matches" element={<MatchManagementPage />} />
          <Route path="/match-history" element={<MatchHistoryPage />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/my-stats" element={<MyStats />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/tactics" element={<TacticsListPage />} />
          <Route path="/tactics/:matchId/:matchNumber" element={<TacticsPage />} />
          <Route path="/stats-management" element={<StatsManagement />} />
          <Route path="/announcement-management" element={<AnnouncementManagement />} />
          <Route path="/entire-player-stats" element={<EntirePlayerStats />} />
          <Route path="/attendance/:matchId" element={<AttendanceCheckPage />} />
          {/* <Route path="/finance-management" element={<FinanceManagement />} /> */}
        </Route>
        
        {/* 프로필 변경은 모든 인증된 사용자에게 허용 */}
        <Route path="/change-profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

