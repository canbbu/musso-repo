
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/components/auth/AuthContext';
import { Dashboard, Finance, FinanceManagement, AnnouncementManagement, Gallery, Login, MatchManagement, PlayerStats, StatsManagement, NotFound, Index, MatchHistory } from './pages';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/matches" element={<MatchManagement />} />
              <Route path="/match-history" element={<MatchHistory />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/stats" element={<PlayerStats />} />
              <Route path="/stats-management" element={<StatsManagement />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/announcement-management" element={<AnnouncementManagement />} />
              <Route path="/finance-management" element={<FinanceManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
