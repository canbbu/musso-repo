import { QueryClient } from '@tanstack/react-query';

// React Query 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터가 stale로 간주되는 시간 (5분)
      staleTime: 1000 * 60 * 5,
      // 캐시에 유지되는 시간 (10분)
      gcTime: 1000 * 60 * 10,
      // 자동 refetch 비활성화 (필요시 컴포넌트에서 수동으로 설정)
      refetchOnWindowFocus: false,
      // 재시도 횟수
      retry: 1,
      // 에러 발생 시 재시도 지연 시간
      retryDelay: 1000,
    },
    mutations: {
      // mutation 실패 시 재시도 횟수
      retry: 1,
    },
  },
});



