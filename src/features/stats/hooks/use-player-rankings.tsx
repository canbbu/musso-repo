import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import type { Player } from '@/features/stats/types/stats.types';

type RankingTab = 'power' | 'goals' | 'assists' | 'attendance' | 'cleansheet';

// Supabase 클라이언트 직접 생성하는 부분 제거
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseKey);

/** 기간 필터: start/end는 ISO 날짜 문자열 (예: '2025-01-01', '2025-09-30') */
export type DateRangeFilter = { start: string; end: string };

// 한 기간(연도·월 또는 사용자 지정 기간) 기준 선수 통계 조회
async function fetchPeriodPlayers(
  year: number | undefined,
  month: number | undefined,
  playersData: { id: string; name: string; username?: string; role?: string; position: string; birthday?: string; fav_club?: string; boots_brand?: string }[],
  playerStatsMap: Map<string, { pac?: number; sho?: number; pas?: number; dri?: number; def?: number; phy?: number }>,
  dateRangeOverride?: DateRangeFilter
): Promise<Player[]> {
  let matchesQuery = supabase
    .from('matches')
    .select('id, date')
    .eq('status', 'completed');

  let startDate: string;
  let endDate: string;
  if (dateRangeOverride) {
    startDate = dateRangeOverride.start;
    endDate = dateRangeOverride.end;
    matchesQuery = matchesQuery.gte('date', startDate).lte('date', endDate);
  } else if (year) {
    // 로컬 날짜 문자열 사용 (toISOString()은 UTC 변환으로 한국에서 말일이 하루 빠짐 → 통계에 해당 월이 누락되는 문제 방지)
    if (month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
      endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    } else {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }
    matchesQuery = matchesQuery.gte('date', startDate).lte('date', endDate);
  }

  const { data: completedMatches, error: matchesError } = await matchesQuery;
  if (matchesError) throw matchesError;
  const totalCompletedMatches = completedMatches?.length || 0;
  const completedMatchIds = (completedMatches ?? []).map((m: { id: number }) => m.id);

  const playerStats = await Promise.all(
    playersData.map(async (player) => {
      // 하루 참석 = 1경기 (match_number 1만 출석으로 인정)
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select('*')
        .eq('player_id', player.id)
        .eq('status', 'attending')
        .eq('match_number', 1)
        .in('match_id', completedMatchIds.length > 0 ? completedMatchIds : [0]);
      if (attendanceError) throw attendanceError;

      let statsData: { goals?: number; assists?: number; cleansheet?: number }[] = [];
      try {
        const { data, error: statsError } = await supabase
          .from('match_attendance')
          .select('goals, assists, cleansheet')
          .eq('player_id', player.id)
          .not('is_opponent_team', 'eq', true)
          .in('match_id', completedMatchIds.length > 0 ? completedMatchIds : [0]);
        if (statsError?.message?.includes('cleansheet')) {
          const { data: fd, error: fe } = await supabase
            .from('match_attendance')
            .select('goals, assists')
            .eq('player_id', player.id)
            .not('is_opponent_team', 'eq', true)
            .in('match_id', completedMatchIds.length > 0 ? completedMatchIds : [0]);
          if (fe) throw fe;
          statsData = (fd || []).map((item: { goals?: number; assists?: number }) => ({ ...item, cleansheet: 0 }));
        } else if (statsError) {
          throw statsError;
        } else {
          statsData = data || [];
        }
      } catch (err) {
        console.error(`[오류] 선수 ${player.id} 통계 조회 실패:`, err);
      }

      let mvpQuery = supabase.from('mvp').select('mvp_type').eq('player_id', player.id);
      if (year) mvpQuery = mvpQuery.eq('year', year);
      const { data: mvpData, error: mvpError } = await mvpQuery;
      if (mvpError) throw mvpError;
      const weeklyMvpCount = (mvpData ?? []).filter((m: { mvp_type: string }) => m.mvp_type === 'weekly').length;
      const monthlyMvpCount = (mvpData ?? []).filter((m: { mvp_type: string }) => m.mvp_type === 'monthly').length;
      const yearlyMvpCount = (mvpData ?? []).filter((m: { mvp_type: string }) => m.mvp_type === 'yearly').length;

      const totalGoals = statsData.reduce((s, m) => s + (m.goals || 0), 0);
      const totalAssists = statsData.reduce((s, m) => s + (m.assists || 0), 0);
      const totalCleansheet = statsData.reduce((s, m) => s + (m.cleansheet || 0), 0);
      const matchesWithRating = attendanceData.filter((m: { rating?: number }) => (m.rating || 0) > 0);
      const averageRating = matchesWithRating.length > 0
        ? matchesWithRating.reduce((s: number, m: { rating?: number }) => s + (m.rating || 0), 0) / matchesWithRating.length
        : 0;
      const attendance = totalCompletedMatches > 0
        ? Math.round((attendanceData.length / totalCompletedMatches) * 100)
        : 0;
      const cleansheet = totalCleansheet;
      const powerScore = attendanceData.length * 2 + totalGoals + totalAssists + cleansheet;
      const playerStatData = playerStatsMap.get(player.id);
      let averageStat = 0;
      if (playerStatData) {
        const { pac, sho, pas, dri, def, phy } = playerStatData;
        const sum = (pac || 0) + (sho || 0) + (pas || 0) + (dri || 0) + (def || 0) + (phy || 0);
        const count = [pac, sho, pas, dri, def, phy].filter((v) => v != null).length;
        averageStat = count > 0 ? Math.round(sum / count) : 0;
      }

      return {
        id: player.id,
        name: player.name,
        username: player.username ?? '',
        role: player.role ?? '',
        position: player.position,
        birthday: player.birthday,
        favorite_team: player.fav_club,
        boots_brand: player.boots_brand ?? '',
        weekly_mvp_count: weeklyMvpCount,
        monthly_mvp_count: monthlyMvpCount,
        yearly_mvp_count: yearlyMvpCount,
        games: attendanceData.length,
        goals: totalGoals,
        assists: totalAssists,
        attendance,
        rating: parseFloat(averageRating.toFixed(1)),
        cleansheet,
        powerScore: parseFloat(powerScore.toFixed(2)),
        avr_stat: averageStat,
        pac: playerStatData?.pac,
        sho: playerStatData?.sho,
        pas: playerStatData?.pas,
        dri: playerStatData?.dri,
        def: playerStatData?.def,
        phy: playerStatData?.phy
      };
    })
  );

  return playerStats;
}

const usePlayerRankings = (year?: number, month?: number, dateRange?: DateRangeFilter | null) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [prevPlayers, setPrevPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<RankingTab>('power');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, name, username, role, position, birthday, fav_club, boots_brand')
          .eq('is_deleted', false)
          .neq('role', 'futsal-guest');
        if (playersError) throw playersError;

        const { data: playerStatsData, error: playerStatsError } = await supabase
          .from('player_stats')
          .select('id, pac, sho, pas, dri, def, phy');
        if (playerStatsError) throw playerStatsError;
        const playerStatsMap = new Map<string, { pac?: number; sho?: number; pas?: number; dri?: number; def?: number; phy?: number }>();
        (playerStatsData ?? []).forEach((s: { id: string; pac?: number; sho?: number; pas?: number; dri?: number; def?: number; phy?: number }) => {
          playerStatsMap.set(s.id, s);
        });

        const list = playersData ?? [];

        // 사용자 지정 기간 필터가 있으면 해당 기간만 조회 (전달 대비 없음)
        if (dateRange?.start && dateRange?.end) {
          const current = await fetchPeriodPlayers(year, month, list, playerStatsMap, dateRange);
          setPlayers(current);
          setPrevPlayers([]);
        } else {
          // 전달 대비: (1) 연도 전체 → 같은 해 1월 랭킹 vs 연간 랭킹, (2) 월 선택(2~12) → 1월 랭킹 vs 현재 달 랭킹. 1월 선택 시에는 전달 없음.
          const isFullYear = year !== undefined && month === undefined;
          const isMonthWithPrev = year !== undefined && month !== undefined && month >= 2;

          if (isFullYear) {
            const [current, prev] = await Promise.all([
              fetchPeriodPlayers(year, undefined, list, playerStatsMap),
              fetchPeriodPlayers(year, 1, list, playerStatsMap) // 1월 마지막 경기까지 = 1월 랭킹
            ]);
            setPlayers(current);
            setPrevPlayers(prev);
          } else if (isMonthWithPrev) {
            const [current, prev] = await Promise.all([
              fetchPeriodPlayers(year, month, list, playerStatsMap),
              fetchPeriodPlayers(year, 1, list, playerStatsMap) // 1월 마지막 경기까지 = 1월 데이터
            ]);
            setPlayers(current);
            setPrevPlayers(prev);
          } else {
            const current = await fetchPeriodPlayers(year, month, list, playerStatsMap);
            setPlayers(current);
            setPrevPlayers([]);
          }
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
        setPrevPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [year, month, dateRange?.start, dateRange?.end]);
  
  // 카테고리별: 해당 데이터가 있는 선수만 표시. 출석률은 전체 회원 표시
  const hasGoals = (p: Player) => (Number(p.goals) || 0) > 0;
  const hasAssists = (p: Player) => (Number(p.assists) || 0) > 0;
  const hasCleansheet = (p: Player) => (Number(p.cleansheet) || 0) > 0;

  const goalRanking = [...players].filter(hasGoals).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.games - b.games;
  });
  const assistRanking = [...players].filter(hasAssists).sort((a, b) => {
    if (b.assists !== a.assists) return b.assists - a.assists;
    return a.games - b.games;
  });
  // 출석률: 모든 회원 표시 (필터 없음)
  const attendanceRanking = [...players].sort((a, b) => {
    if (b.attendance !== a.attendance) return b.attendance - a.attendance;
    return b.games - a.games;
  });
  const cleansheetRanking = [...players].filter(hasCleansheet).sort((a, b) => {
    if (b.cleansheet !== a.cleansheet) return b.cleansheet - a.cleansheet;
    return b.games - a.games;
  });

  // 파워랭킹: 포인트 있는 선수만, powerScore 높은 순
  const powerRanking = [...players]
    .filter((p) => (p.powerScore ?? 0) > 0)
    .sort((a, b) => {
      const scoreA = a.powerScore ?? 0;
      const scoreB = b.powerScore ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.games - a.games;
    });

  // 전달 기간 랭킹 (동일 정렬 규칙)
  const prevGoalRanking = [...prevPlayers].filter(hasGoals).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.games - b.games;
  });
  const prevAssistRanking = [...prevPlayers].filter(hasAssists).sort((a, b) => {
    if (b.assists !== a.assists) return b.assists - a.assists;
    return a.games - b.games;
  });
  const prevAttendanceRanking = [...prevPlayers].sort((a, b) => {
    if (b.attendance !== a.attendance) return b.attendance - a.attendance;
    return b.games - a.games;
  });
  const prevCleansheetRanking = [...prevPlayers].filter(hasCleansheet).sort((a, b) => {
    if (b.cleansheet !== a.cleansheet) return b.cleansheet - a.cleansheet;
    return b.games - a.games;
  });
  const prevPowerRanking = [...prevPlayers]
    .filter((p) => (p.powerScore ?? 0) > 0)
    .sort((a, b) => {
      const scoreA = a.powerScore ?? 0;
      const scoreB = b.powerScore ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.games - a.games;
    });

  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'power':
        return powerRanking;
      case 'goals':
        return goalRanking;
      case 'assists':
        return assistRanking;
      case 'attendance':
        return attendanceRanking;
      case 'cleansheet':
        return cleansheetRanking;
      default:
        return powerRanking;
    }
  };

  const getPrevRanking = (): Player[] => {
    switch (activeTab) {
      case 'power':
        return prevPowerRanking;
      case 'goals':
        return prevGoalRanking;
      case 'assists':
        return prevAssistRanking;
      case 'attendance':
        return prevAttendanceRanking;
      case 'cleansheet':
        return prevCleansheetRanking;
      default:
        return prevPowerRanking;
    }
  };

  const hasPrevPeriod = prevPlayers.length > 0;

  return {
    players,
    loading,
    activeTab,
    setActiveTab,
    powerRanking,
    goalRanking,
    assistRanking,
    attendanceRanking,
    cleansheetRanking,
    getCurrentRanking,
    getPrevRanking,
    hasPrevPeriod,
  };
};

export { usePlayerRankings };
export type { RankingTab, Player };