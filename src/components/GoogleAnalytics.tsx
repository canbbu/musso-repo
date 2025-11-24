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
 * Google Analytics 페이지 뷰 추적 컴포넌트
 * React Router의 페이지 이동을 자동으로 추적합니다.
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // gtag가 로드되었는지 확인
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-27PG5RQP0Y', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
}

