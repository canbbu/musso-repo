// Stats React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlayerStatsByMatch,
  getAllPlayerStats,
  getPlayerRankings,
  getSeasonRankings,
  getMatchesForStats,
  getPlayers
} from './stats.api';
import { StatsFilters, RankingTab } from '../types/stats.types';

// 특정 매치의 선수 통계 가져오기
export function usePlayerStatsByMatch(matchId: number | null, matchNumber: number = 1) {
  return useQuery({
    queryKey: ['playerStats', matchId, matchNumber],
    queryFn: () => getPlayerStatsByMatch(matchId!, matchNumber),
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2, // 2분
  });
}

// 모든 선수 통계 가져오기
export function useAllPlayerStats(filters?: StatsFilters) {
  return useQuery({
    queryKey: ['allPlayerStats', filters],
    queryFn: () => getAllPlayerStats(filters),
    staleTime: 1000 * 60 * 2,
  });
}

// 선수 랭킹 가져오기
export function usePlayerRankings(
  type: RankingTab,
  year?: number,
  month?: number
) {
  return useQuery({
    queryKey: ['playerRankings', type, year, month],
    queryFn: () => getPlayerRankings(type, year, month),
    staleTime: 1000 * 60 * 2,
  });
}

// 시즌 랭킹 가져오기
export function useSeasonRankings(year: number) {
  return useQuery({
    queryKey: ['seasonRankings', year],
    queryFn: () => getSeasonRankings(year),
    staleTime: 1000 * 60 * 2,
  });
}

// 매치 목록 가져오기 (선수 통계용)
export function useMatchesForStats() {
  return useQuery({
    queryKey: ['matchesForStats'],
    queryFn: getMatchesForStats,
    staleTime: 1000 * 60 * 5,
  });
}

// 선수 목록 가져오기
export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: getPlayers,
    staleTime: 1000 * 60 * 5,
  });
}



