// Attendance React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlayers,
  getMatchInfo,
  getAttendanceData,
  saveAttendance,
  updateAttendanceStatus
} from './attendance.api';

// 모든 선수 목록 가져오기
export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: getPlayers,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 경기 정보 가져오기
export function useMatchInfo(matchId: number | null) {
  return useQuery({
    queryKey: ['matchInfo', matchId],
    queryFn: () => getMatchInfo(matchId!),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2,
  });
}

// 출석 데이터 가져오기
export function useAttendanceData(matchId: number | null, matchNumber: number = 1) {
  return useQuery({
    queryKey: ['attendance', matchId, matchNumber],
    queryFn: () => getAttendanceData(matchId!, matchNumber),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 1,
  });
}

// 출석 데이터 저장
export function useSaveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, playerIds, matchNumber }: { matchId: number; playerIds: string[]; matchNumber?: number }) =>
      saveAttendance(matchId, playerIds, matchNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.matchId] });
    },
  });
}

// 출석 상태 업데이트
export function useUpdateAttendanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, playerId, status, matchNumber }: { 
      matchId: number; 
      playerId: string; 
      status: 'attending' | 'not_attending' | 'pending'; 
      matchNumber?: number 
    }) =>
      updateAttendanceStatus(matchId, playerId, status, matchNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.matchId] });
    },
  });
}



