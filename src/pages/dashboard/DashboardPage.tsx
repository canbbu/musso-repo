import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import '../../styles/Dashboard.css';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import Layout from '@/shared/components/layout/Layout';

import MobileNavigation from '@/features/dashboard/components/dashboard/MobileNavigation';
import CalendarView from '@/features/dashboard/components/dashboard/CalendarView';
// import AnnouncementsCard from '@/features/dashboard/components/dashboard/AnnouncementsCard';
import MatchSection from '@/features/matches/components/match/MatchSection';
// import UpcomingMatchesCardWrapper from '@/features/dashboard/components/dashboard/UpcomingMatchesCardWrapper';
import MvpVotingCard from '@/features/dashboard/components/dashboard/MvpVotingCard';
import AttendanceChart from '@/features/dashboard/components/dashboard/AttendanceChart';
import RunningChart from '@/features/dashboard/components/dashboard/RunningChart';
import DailyRunningRecordForm from '@/features/running/components/DailyRunningRecordForm';
import TodayRunningRecord from '@/features/running/components/TodayRunningRecord';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import { useMatchData, Match } from '@/features/matches/hooks/use-match-data';
import { useActivityLogs } from '@/hooks/use-activity-logs';
import ActivityStatsModal from '@/components/admin/ActivityStatsModal';
import { supabase } from '@/shared/lib/supabase/client';

const Dashboard = () => {
  const { userName, canManageAnnouncements, canManageSystem, isSystemManager, role, userId } = useAuth();
  const isMobile = useIsMobile();
  const { announcements, matchAnnouncements, upcomingMatches, calendarEvents, loading, error } = useDashboardData();
  const { checkForTodaysMatch, handleAttendanceChange, matches } = useMatchData();
  const { logUserLogin, logUserLogout, currentSession, updatePageView, cleanupStaleSessions, cleanupDuplicateLogs } = useActivityLogs();
  const [todaysCompletedMatch, setTodaysCompletedMatch] = useState<Match | null>(null);
  const [showActivityStats, setShowActivityStats] = useState(false);
  const [isCleaningLogs, setIsCleaningLogs] = useState(false);
  
  // 권한 디버깅 로그 추가
  useEffect(() => {
  }, [userName, role, canManageSystem, isSystemManager]);

  useEffect(() => {
    const match = checkForTodaysMatch();
    if (match) {
      setTodaysCompletedMatch(match);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시에만 실행되도록 수정


  
  // 사용자 접속 로그 기록
  useEffect(() => {
    const recordUserLogin = async () => {
      if (userName && !currentSession) {
        
        await logUserLogin({
          user_name: userName
        });
      }
    };

    recordUserLogin();
  }, [userName]); // logUserLogin과 currentSession을 의존성에서 제거

  // 페이지 이동 시 페이지 뷰 업데이트 (초기 접속 제외)
  useEffect(() => {
    // 세션이 있고, 이미 1회 이상 페이지뷰가 있는 경우만 업데이트
    if (currentSession && currentSession.page_views > 1) {
      updatePageView();
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 컴포넌트 언마운트 시 로그아웃 기록
  useEffect(() => {
    return () => {
      if (currentSession) {
        logUserLogout();
      }
    };
  }, []); // 빈 의존성 배열로 cleanup 함수만 설정

  // 세션 정리 함수
  const handleCleanupSessions = async () => {
    if (!canManageSystem()) return;
    
    setIsCleaningLogs(true);
    try {
      
      // 오래된 세션 정리
      const staleResult = await cleanupStaleSessions();
      
      // 잠시 대기 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 중복 로그 정리
      const duplicateResult = await cleanupDuplicateLogs();
      
      // 결과 종합
      const totalProcessed = (staleResult?.processed || 0) + (duplicateResult?.deleted || 0);
      
      if (staleResult?.success && duplicateResult?.success) {
        if (totalProcessed > 0) {
          alert(`✅ 세션 정리가 완료되었습니다!\n\n📊 정리된 항목:\n• 오래된 세션: ${staleResult.processed}개\n• 중복 로그: ${duplicateResult.deleted}개\n• 총 ${totalProcessed}개 정리`);
        } else {
          alert('✅ 세션 정리가 완료되었습니다!\n\n정리할 항목이 없었습니다.');
        }
      } else {
        const errorMessages = [];
        if (!staleResult?.success) errorMessages.push('오래된 세션 정리 실패');
        if (!duplicateResult?.success) errorMessages.push('중복 로그 정리 실패');
        
        alert(`⚠️ 세션 정리 중 일부 오류가 발생했습니다:\n\n${errorMessages.join('\n')}\n\n콘솔을 확인해주세요.`);
      }
    } catch (error) {
      alert(`❌ 세션 정리 중 오류가 발생했습니다.\n\n오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsCleaningLogs(false);
    }
  };
  
  // 로딩 상태 처리
  if (loading) {
    return (
      <Layout>
        <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
          <h1 className="text-3xl font-bold mb-2">대시보드</h1>
          <p className="text-gray-600">안녕하세요, {userName}님!</p>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 로딩 중입니다...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Layout>
        <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
          <h1 className="text-3xl font-bold mb-2">대시보드</h1>
          <p className="text-gray-600">안녕하세요, {userName}님!</p>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-2">데이터 로딩 중 오류가 발생했습니다</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`mb-6 ${isMobile ? "mt-16" : ""}`}>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <div className="flex items-center gap-2">
          <p className="text-gray-600">안녕하세요, {userName}님! 무쏘 홈페이지에 오신 것을 환영합니다.</p>
          {isSystemManager && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
              🔧 시스템관리자
            </span>
          )}
        </div>
        
        {/* 시스템 관리자 전용 - 사용자 활동 통계 및 세션 관리 */}
        {canManageSystem() && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setShowActivityStats(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-md"
            >
              📊 사용자 활동 통계
            </button>
            <button
              onClick={handleCleanupSessions}
              disabled={isCleaningLogs}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCleaningLogs ? '🔄 정리 중...' : '🧹 세션 정리'}
            </button>
          </div>
        )}
      </div>
      
      {/* 데이터 상태 디버깅 정보 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm">
          <p><strong>DEBUG:</strong> 공지사항: {announcements.length}개, 이벤트: {upcomingMatches.length}개</p>
          {currentSession && (
            <p><strong>세션:</strong> ID {currentSession.id}, 페이지뷰: {currentSession.page_views}회</p>
          )}
        </div>
      )}
      
      {/* 4분할 레이아웃 */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* 위 왼쪽: 다가오는 이벤트 */}
        <div className="min-w-0">
          <MatchSection 
            title="다가오는 이벤트"
            matches={matches.filter(m => m.status === 'upcoming')}
            onAttendanceChange={(matchId, status) => handleAttendanceChange(matchId, status, userId as string)}
            canManageAnnouncements={false}
            emptyMessage="예정된 이벤트가 없습니다."
            onViewMatch={() => {}}
            disableVoting={false}
            showOnlyVoting={false}
            hideManagementButton={true}
            collapseToCount={2}
          />
        </div>

        {/* 위 오른쪽: 오늘의 런닝 기록 */}
        <div className="space-y-4 min-w-0">
          <DailyRunningRecordForm />
          <TodayRunningRecord />
        </div>

        {/* 아래 왼쪽: 출석 그래프 */}
        <div className="min-w-0 overflow-hidden">
          <AttendanceChart />
        </div>

        {/* 아래 오른쪽: 런닝 통계 */}
        <div className="min-w-0 overflow-hidden">
          <RunningChart />
        </div>
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
      
      {/* 팀 일정 스케줄러 - 주석처리 */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CalendarView calendarEvents={calendarEvents || {}} />
        </div>
      </div> */}

      {/* 공지사항은 임시 비표시 (요청사항) */}
      {false && (
        <div className="mt-6">
          {/* <AnnouncementsCard announcements={announcements || []} canManageAnnouncements={canManageAnnouncements} /> */}
        </div>
      )}

      {/* 활동 통계 모달 */}
      <ActivityStatsModal 
        isOpen={showActivityStats}
        onClose={() => setShowActivityStats(false)}
      />
    </Layout>
  );
};

export default Dashboard;
