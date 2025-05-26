import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/components/auth/AuthContext';
import { Dashboard, Finance, FinanceManagement, AnnouncementManagement, Login, MatchManagement, PlayerStats, StatsManagement, NotFound, Index, MatchHistory, MyStats, EntirePlayerStats } from './pages';
import DataTestPage from './pages/DataTestPage';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/register" element={<Register />} />
              <Route path="/data-test" element={<DataTestPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/matches" element={<MatchManagement />} />
              <Route path="/match-history" element={<MatchHistory />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/stats" element={<PlayerStats />} />
              <Route path="/my-stats" element={<MyStats />} />
              <Route path="/stats-management" element={<StatsManagement />} />
              <Route path="/announcement-management" element={<AnnouncementManagement />} />
              <Route path="/entire-player-stats" element={<EntirePlayerStats />} />
              <Route path="/change-profile" element={<Profile />} />
              {/* <Route path="/finance-management" element={<FinanceManagement />} /> */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;
