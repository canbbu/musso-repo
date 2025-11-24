import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/components/auth/AuthContext';
import { Dashboard, Finance, FinanceManagement, AnnouncementManagement, Login, MatchManagement, PlayerStats, StatsManagement, NotFound, MatchHistory, MyStats, EntirePlayerStats, TacticsList, AttendanceCheck } from './pages';
import DataTestPage from './pages/DataTestPage';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AttendanceStatus from './pages/AttendanceStatus';
import HallOfFame from './pages/HallOfFame';
import Tactics from './pages/Tactics';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <GoogleAnalytics />
        <AuthProvider>
          <Routes>
            {/* 인증이 필요하지 않은 페이지들 */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
            
            {/* 인증이 필요한 페이지들 */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/data-test" element={<DataTestPage />} />
              <Route path="/matches" element={<MatchManagement />} />
              <Route path="/match-history" element={<MatchHistory />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/stats" element={<PlayerStats />} />
              <Route path="/my-stats" element={<MyStats />} />
              <Route path="/hall-of-fame" element={<HallOfFame />} />
              <Route path="/tactics" element={<TacticsList />} />
              <Route path="/tactics/:matchId/:matchNumber" element={<Tactics />} />
              <Route path="/stats-management" element={<StatsManagement />} />
              <Route path="/announcement-management" element={<AnnouncementManagement />} />
              <Route path="/entire-player-stats" element={<EntirePlayerStats />} />
              <Route path="/change-profile" element={<Profile />} />
              <Route path="/attendance-status" element={<AttendanceStatus />} />
              <Route path="/attendance/:matchId" element={<AttendanceCheck />} />
              {/* <Route path="/finance-management" element={<FinanceManagement />} /> */}
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;
