import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RequireFutsalAccess } from '@/features/auth/components/AuthContext';
import LoginPage from '@/pages/auth/LoginPage';
import FutsalRegisterPage from './FutsalRegisterPage';
import FutsalDashboardPage from './FutsalDashboardPage';
import FutsalEventManagementPage from './FutsalEventManagementPage';
import FutsalMembersPage from './FutsalMembersPage';

/** 풋살: 대시보드는 로그인 없이 접근, 이벤트/회원은 풋살 권한 필요 */
export default function FutsalPage() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage fromFutsal />} />
      <Route path="register" element={<FutsalRegisterPage />} />
      <Route index element={<FutsalDashboardPage />} />
      <Route path="events" element={<RequireFutsalAccess><FutsalEventManagementPage /></RequireFutsalAccess>} />
      <Route path="members" element={<RequireFutsalAccess><FutsalMembersPage /></RequireFutsalAccess>} />
    </Routes>
  );
}
