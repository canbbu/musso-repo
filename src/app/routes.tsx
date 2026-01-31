import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireAdmin, RequireSoccerAccess } from '@/features/auth/components/AuthContext';
import { NotFound } from '@/pages';
import FutsalPage from '@/pages/futsal/FutsalPage';
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
// Sport members (축구/풋살 권한 한 row에서 관리)
import SportAccessManagementPage from '@/pages/members/SportAccessManagementPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/futsal/*" element={<FutsalPage />} />

      {/* 축구: 대시보드·스탯은 비로그인도 접근 가능, 나머지는 로그인+축구 권한 필요 */}
      <Route path="/" element={<Outlet />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="stats" element={<PlayerStatsPage />} />
        <Route element={<RequireSoccerAccess />}>
          <Route element={<RequireAuth />}>
            <Route path="attendance-status" element={<AttendanceStatusPage />} />
            <Route path="season-rankings" element={<SeasonRankingsPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="register" element={<RegisterPage />} />
              <Route path="data-test" element={<DataTestPage />} />
              <Route path="matches" element={<MatchManagementPage />} />
              <Route path="match-history" element={<MatchHistoryPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="my-stats" element={<MyStatsPage />} />
              <Route path="hall-of-fame" element={<HallOfFame />} />
              <Route path="tactics" element={<TacticsListPage />} />
              <Route path="tactics/:matchId/:matchNumber" element={<TacticsPage />} />
              <Route path="stats-management" element={<StatsManagementPage />} />
              <Route path="announcement-management" element={<AnnouncementManagementPage />} />
              <Route path="entire-player-stats" element={<EntirePlayerStatsPage />} />
              <Route path="attendance/:matchId" element={<AttendanceCheckPage />} />
              <Route path="sport-members" element={<SportAccessManagementPage />} />
              <Route path="soccer-members" element={<Navigate to="/sport-members" replace />} />
            </Route>
            <Route path="change-profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

