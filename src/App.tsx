import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/components/auth/AuthContext';
import { Dashboard, Finance, FinanceManagement, AnnouncementManagement, Gallery, Login, MatchManagement, PlayerStats, StatsManagement, NotFound, Index, MatchHistory, MyStats } from './pages';
import DataTestPage from './pages/DataTestPage';
import Register from './pages/Register';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
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
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/announcement-management" element={<AnnouncementManagement />} />
              <Route path="/finance-management" element={<FinanceManagement />} />
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
