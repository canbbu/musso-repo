import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type SportMode = 'soccer' | 'futsal';

const FUTSAL_PREFIX = '/futsal';

interface SportContextValue {
  /** 현재 스포츠 모드: 축구 | 풋살 */
  sport: SportMode;
  /** URL 접두어. 축구: '', 풋살: '/futsal' */
  basePath: string;
  /** 경로에 basePath를 붙인 전체 경로 반환 (네비게이션용) */
  linkTo: (path: string) => string;
  /** 현재 경로가 해당 path와 일치하는지 (basePath 반영) */
  isActivePath: (path: string) => boolean;
}

const SportContext = createContext<SportContextValue | null>(null);

export function SportProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const value = useMemo<SportContextValue>(() => {
    const isFutsal = location.pathname.startsWith(FUTSAL_PREFIX);
    const sport: SportMode = isFutsal ? 'futsal' : 'soccer';
    const basePath = isFutsal ? FUTSAL_PREFIX : '';

    return {
      sport,
      basePath,
      linkTo: (path: string) => (basePath + path) || '/',
      isActivePath: (path: string) => {
        const full = basePath + path;
        if (path === '/') return location.pathname === basePath || location.pathname === basePath + '/';
        return location.pathname === full || location.pathname.startsWith(full + '/');
      },
    };
  }, [location.pathname]);

  return (
    <SportContext.Provider value={value}>
      {children}
    </SportContext.Provider>
  );
}

export function useSport(): SportContextValue {
  const ctx = useContext(SportContext);
  if (!ctx) {
    return {
      sport: 'soccer',
      basePath: '',
      linkTo: (path: string) => path || '/',
      isActivePath: (path: string) => {
        // Provider 밖에서는 location 기반으로 단순 비교
        return path === '/' ? path === '/' : false;
      },
    };
  }
  return ctx;
}
