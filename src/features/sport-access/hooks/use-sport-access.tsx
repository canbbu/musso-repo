import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import * as sportAccessApi from '../api/sport-access.api';
import type { SportType, PlayerWithAllSportAccess } from '../api/sport-access.api';

export interface SportAccessState {
  canAccessSoccer: boolean;
  canAccessFutsal: boolean;
  /** 풋살 참석/불참/댓글 가능 여부. 축구 회원(soccer_access) 또는 풋살 권한(futsal_access) 있으면 true */
  canParticipateInFutsal: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSportAccess(): SportAccessState {
  const { userId, isAuthenticated } = useAuth();
  const [canAccessSoccer, setCanAccessSoccer] = useState(true);
  const [canAccessFutsal, setCanAccessFutsal] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setCanAccessSoccer(false);
      setCanAccessFutsal(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { soccer, futsal } = await sportAccessApi.getMySportAccess(userId);
      setCanAccessSoccer(soccer);
      setCanAccessFutsal(futsal);
    } catch (e) {
      console.error('[useSportAccess] refresh error', e);
      setCanAccessSoccer(false);
      setCanAccessFutsal(false);
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    canAccessSoccer,
    canAccessFutsal,
    canParticipateInFutsal: canAccessFutsal || canAccessSoccer,
    loading,
    refresh,
  };
}

export interface PlayerWithAccess {
  id: string;
  name: string;
  username?: string;
  can_access: boolean;
}

export function usePlayersWithSportAccess(sport: SportType) {
  const [players, setPlayers] = useState<PlayerWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sportAccessApi.getPlayersWithSportAccess(sport);
      setPlayers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setAccess = useCallback(
    async (playerId: string, canAccess: boolean) => {
      await sportAccessApi.setPlayerSportAccess(playerId, sport, canAccess);
      await refresh();
    },
    [sport, refresh]
  );

  return { players, loading, error, refresh, setAccess };
}

/** 전체 회원 + 축구/풋살 권한 (한 row에서 둘 다 관리) */
export function usePlayersWithAllSportAccess() {
  const [players, setPlayers] = useState<PlayerWithAllSportAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sportAccessApi.getPlayersWithAllSportAccess();
      setPlayers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSoccerAccess = useCallback(
    async (playerId: string, canAccess: boolean) => {
      await sportAccessApi.setPlayerSportAccess(playerId, 'soccer', canAccess);
      await refresh();
    },
    [refresh]
  );

  const setFutsalAccess = useCallback(
    async (playerId: string, canAccess: boolean) => {
      await sportAccessApi.setPlayerSportAccess(playerId, 'futsal', canAccess);
      await refresh();
    },
    [refresh]
  );

  return { players, loading, error, refresh, setSoccerAccess, setFutsalAccess };
}
