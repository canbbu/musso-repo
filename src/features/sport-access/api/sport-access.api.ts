import { supabase } from '@/shared/lib/supabase/client';

export type SportType = 'soccer' | 'futsal';

export interface PlayerSportAccessRow {
  id: number;
  player_id: string;
  name: string | null;
  soccer_access: boolean;
  futsal_access: boolean;
  created_at: string;
  updated_at: string;
}

/** 현재 유저의 스포츠별 접근 권한 조회 */
export async function getMySportAccess(userId: string | null): Promise<{ soccer: boolean; futsal: boolean }> {
  if (!userId) {
    return { soccer: false, futsal: false };
  }

  try {
    const { data, error } = await supabase
      .from('player_sport_access')
      .select('soccer_access, futsal_access')
      .eq('player_id', userId)
      .maybeSingle();

    if (error) throw error;

    return {
      soccer: data?.soccer_access ?? true,
      futsal: data?.futsal_access ?? false,
    };
  } catch (e) {
    console.error('[SportAccess] getMySportAccess error', e);
    throw e;
  }
}

/** 특정 스포츠에 등록된 회원 목록 (players + can_access, 한 행 기준) */
export async function getPlayersWithSportAccess(sport: SportType): Promise<
  { id: string; name: string; username?: string; can_access: boolean }[]
> {
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, name, username')
    .order('name');

  if (playersError) throw playersError;
  if (!players?.length) return [];

  const { data: accessRows, error: accessError } = await supabase
    .from('player_sport_access')
    .select('player_id, soccer_access, futsal_access');

  if (accessError) throw accessError;

  const accessMap = new Map<string, { soccer: boolean; futsal: boolean }>();
  accessRows?.forEach((r) => {
    accessMap.set(r.player_id, { soccer: r.soccer_access, futsal: r.futsal_access });
  });

  const defaultSoccer = true;
  const defaultFutsal = false;

  return players.map((p) => {
    const acc = accessMap.get(p.id);
    const can_access =
      sport === 'soccer'
        ? (acc?.soccer ?? defaultSoccer)
        : (acc?.futsal ?? defaultFutsal);
    return {
      id: p.id,
      name: p.name,
      username: p.username,
      can_access,
    };
  });
}

/** 전체 회원 + 축구/풋살 권한 한 번에 조회 (한 row에서 둘 다 관리용) */
export interface PlayerWithAllSportAccess {
  id: string;
  name: string;
  username?: string;
  soccer_access: boolean;
  futsal_access: boolean;
}

export async function getPlayersWithAllSportAccess(): Promise<PlayerWithAllSportAccess[]> {
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, name, username')
    .order('name');

  if (playersError) throw playersError;
  if (!players?.length) return [];

  const { data: accessRows, error: accessError } = await supabase
    .from('player_sport_access')
    .select('player_id, soccer_access, futsal_access');

  if (accessError) throw accessError;

  const accessMap = new Map<string, { soccer_access: boolean; futsal_access: boolean }>();
  accessRows?.forEach((r) => {
    accessMap.set(r.player_id, { soccer_access: r.soccer_access, futsal_access: r.futsal_access });
  });

  return players.map((p) => {
    const acc = accessMap.get(p.id);
    return {
      id: p.id,
      name: p.name,
      username: p.username,
      soccer_access: acc?.soccer_access ?? true,
      futsal_access: acc?.futsal_access ?? false,
    };
  });
}

/** 회원가입 시 초기 스포츠 권한 한 번에 설정 (축구만 / 풋살만) */
export async function insertPlayerSportAccess(
  playerId: string,
  playerName: string | null,
  soccer_access: boolean,
  futsal_access: boolean
): Promise<void> {
  const { error } = await supabase.from('player_sport_access').insert({
    player_id: playerId,
    name: playerName ?? null,
    soccer_access,
    futsal_access,
  });
  if (error) throw error;
}

/** 스포츠 접근 권한 설정(토글) - 단일 행 기준 soccer_access / futsal_access */
export async function setPlayerSportAccess(
  playerId: string,
  sport: SportType,
  canAccess: boolean
): Promise<void> {
  const { data: existing } = await supabase
    .from('player_sport_access')
    .select('id, soccer_access, futsal_access')
    .eq('player_id', playerId)
    .maybeSingle();

  const updates: { soccer_access?: boolean; futsal_access?: boolean; name?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (sport === 'soccer') updates.soccer_access = canAccess;
  else updates.futsal_access = canAccess;

  if (existing) {
    const { error } = await supabase
      .from('player_sport_access')
      .update(updates)
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { data: player } = await supabase.from('players').select('name').eq('id', playerId).maybeSingle();
    const { error } = await supabase.from('player_sport_access').insert({
      player_id: playerId,
      name: player?.name ?? null,
      soccer_access: sport === 'soccer' ? canAccess : true,
      futsal_access: sport === 'futsal' ? canAccess : false,
    });
    if (error) throw error;
  }
}
