import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireAdmin } from '@/features/auth/components/AuthContext';
import { NotFound } from '@/pages';
// Finance pages
import FinancePage from '@/pages/finance/FinancePage';
import FinanceManagementPage from '@/pages/finance/FinanceManagementPage';
// Dashboard pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
// Announcements pages
import AnnouncementManagementPage from '@/pages/announcements/AnnouncementManagementPage';
// Stats pages
import PlayerStatsPage from '@/pages/stats/PlayerStatsPage';
import MyStatsPage from '@/pages/stats/MyStatsPage';
import EntirePlayerStatsPage from '@/pages/stats/EntirePlayerStatsPage';
import SeasonRankingsPage from '@/pages/stats/SeasonRankingsPage';
import StatsManagementPage from '@/pages/stats/StatsManagementPage';
import DataTestPage from '@/pages/DataTestPage';
// Attendance pages
import AttendanceStatusPage from '@/pages/attendance/AttendanceStatusPage';
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
      {/* 메인 페이지는 대시보드 */}
      <Route path="/" element={<DashboardPage />} />
      
      {/* 인증이 필요하지 않은 페이지들 */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 로그인 없이 접근 가능한 페이지들 */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/stats" element={<PlayerStatsPage />} />
      
      {/* 인증이 필요한 페이지들 */}
      <Route element={<RequireAuth />}>
        <Route path="/attendance-status" element={<AttendanceStatusPage />} />
        <Route path="/season-rankings" element={<SeasonRankingsPage />} />
        
        {/* 관리자만 접근 가능한 페이지 */}
        <Route element={<RequireAdmin />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/data-test" element={<DataTestPage />} />
          <Route path="/matches" element={<MatchManagementPage />} />
          <Route path="/match-history" element={<MatchHistoryPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/my-stats" element={<MyStatsPage />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/tactics" element={<TacticsListPage />} />
          <Route path="/tactics/:matchId/:matchNumber" element={<TacticsPage />} />
          <Route path="/stats-management" element={<StatsManagementPage />} />
          <Route path="/announcement-management" element={<AnnouncementManagementPage />} />
          <Route path="/entire-player-stats" element={<EntirePlayerStatsPage />} />
          <Route path="/attendance/:matchId" element={<AttendanceCheckPage />} />
        </Route>
        
        {/* 프로필 변경은 모든 인증된 사용자에게 허용 */}
        <Route path="/change-profile" element={<ProfilePage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

