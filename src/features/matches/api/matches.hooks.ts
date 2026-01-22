// Matches React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMatches, getMatchById, createMatch, updateMatch, deleteMatch, updateAttendance, getUpcomingMatches } from './matches.api';
import { getTactics, saveTactics, getTacticsList, getMatchPlayers } from './tactics.api';
import { MatchFormData, TacticsFormData } from '../types/match.types';

// 모든 매치 가져오기
export function useMatches(userId?: string | null) {
  return useQuery({
    queryKey: ['matches', userId],
    queryFn: () => getMatches(userId),
    staleTime: 1000 * 60 * 2, // 2분
  });
}

// 특정 매치 가져오기
export function useMatch(matchId: number, userId?: string | null) {
  return useQuery({
    queryKey: ['match', matchId, userId],
    queryFn: () => getMatchById(matchId, userId),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2,
  });
}

// 매치 생성
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchData, created_by }: { matchData: MatchFormData; created_by: string }) =>
      createMatch(matchData, created_by),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// 매치 업데이트
export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, matchData, updated_by }: { matchId: number; matchData: MatchFormData; updated_by: string }) =>
      updateMatch(matchId, matchData, updated_by),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', variables.matchId] });
    },
  });
}

// 매치 삭제
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// 출석 상태 업데이트
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, playerId, status }: { matchId: number; playerId: string; status: 'attending' | 'notAttending' | 'pending' }) =>
      updateAttendance(matchId, playerId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['upcomingMatches'] });
    },
  });
}

// 다가오는 매치 가져오기
export function useUpcomingMatches() {
  return useQuery({
    queryKey: ['upcomingMatches'],
    queryFn: getUpcomingMatches,
    staleTime: 1000 * 60 * 2,
  });
}

// 작전판 가져오기
export function useTactics(matchId: number, matchNumber: number = 1) {
  return useQuery({
    queryKey: ['tactics', matchId, matchNumber],
    queryFn: () => getTactics(matchId, matchNumber),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2,
  });
}

// 작전판 저장
export function useSaveTactics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveTactics,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tactics', variables.match_id, variables.match_number] });
      queryClient.invalidateQueries({ queryKey: ['tacticsList', variables.match_id] });
    },
  });
}

// 작전판 목록 가져오기
export function useTacticsList(matchId: number) {
  return useQuery({
    queryKey: ['tacticsList', matchId],
    queryFn: () => getTacticsList(matchId),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2,
  });
}

// 경기별 참석 선수 목록 가져오기
export function useMatchPlayers(matchId: number, matchNumber: number) {
  return useQuery({
    queryKey: ['matchPlayers', matchId, matchNumber],
    queryFn: () => getMatchPlayers(matchId, matchNumber),
    enabled: !!matchId && !!matchNumber,
    staleTime: 1000 * 60 * 2,
  });
}




