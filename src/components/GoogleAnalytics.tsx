import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 타입 선언
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string | Date,
      config?: {
        page_path?: string;
        page_title?: string;
        [key: string]: unknown;
      }
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * 경로에 따른 페이지 제목 매핑
 */
const getPageTitle = (pathname: string): string => {
  const titleMap: Record<string, string> = {
    '/': '대시보드 - 무쏘 관리 페이지',
    '/dashboard': '대시보드 - 무쏘 관리 페이지',
    '/login': '로그인 - 무쏘 관리 페이지',
    '/stats': '선수 통계 - 무쏘 관리 페이지',
    '/attendance-status': '출석 현황 - 무쏘 관리 페이지',
    '/season-rankings': '시즌 랭킹 - 무쏘 관리 페이지',
    '/register': '회원 등록 - 무쏘 관리 페이지',
    '/data-test': '데이터 테스트 - 무쏘 관리 페이지',
    '/matches': '경기 관리 - 무쏘 관리 페이지',
    '/match-history': '경기 기록 - 무쏘 관리 페이지',
    '/finance': '재정 관리 - 무쏘 관리 페이지',
    '/my-stats': '내 통계 - 무쏘 관리 페이지',
    '/hall-of-fame': '명예의 전당 - 무쏘 관리 페이지',
    '/tactics': '전술 목록 - 무쏘 관리 페이지',
    '/stats-management': '통계 관리 - 무쏘 관리 페이지',
    '/announcement-management': '공지사항 관리 - 무쏘 관리 페이지',
    '/entire-player-stats': '전체 선수 통계 - 무쏘 관리 페이지',
    '/change-profile': '프로필 변경 - 무쏘 관리 페이지',
  };

  // 동적 경로 처리
  if (pathname.startsWith('/tactics/')) {
    return '전술 - 무쏘 관리 페이지';
  }
  if (pathname.startsWith('/attendance/')) {
    return '출석 체크 - 무쏘 관리 페이지';
  }

  return titleMap[pathname] || '무쏘 관리 페이지';
};

/**
 * Google Analytics 페이지 뷰 추적 컴포넌트
 * React Router의 페이지 이동을 자동으로 추적합니다.
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // 페이지 제목 설정
    const pageTitle = getPageTitle(location.pathname);
    document.title = pageTitle;

    // gtag가 로드되었는지 확인
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-27PG5RQP0Y', {
        page_path: location.pathname + location.search,
        page_title: pageTitle,
      });
    }
  }, [location]);

  return null;
}




