import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 싱글톤 인스턴스 임포트

interface Player {
  id: string;
  name: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  attendance: number;
  rating: number;
  boots_brand: string;
  favorite_team: string;
  weekly_mvp_count: number;
  monthly_mvp_count: number;
  yearly_mvp_count: number;
  // 선수 능력치 필드
  avr_stat?: number; // 평균 능력치
  pac?: number; // 속력 (Pace)
  sho?: number; // 슛 (Shooting)
  pas?: number; // 패스 (Passing)
  dri?: number; // 드리블 (Dribbling)
  def?: number; // 수비 (Defense)
  phy?: number; // 피지컬 (Physical)
}

type RankingTab = 'goals' | 'assists' | 'attendance' | 'rating';

// Supabase 클라이언트 직접 생성하는 부분 제거
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseKey);

export const usePlayerRankings = (year?: number, month?: number) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<RankingTab>('goals');
  
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        
        // 선수 기본 정보 가져오기
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, name, position, birthday, fav_club, boots_brand');
        
        if (playersError) throw playersError;
        
        // player_stats 테이블에서 능력치 정보 가져오기
        const { data: playerStatsData, error: playerStatsError } = await supabase
          .from('player_stats')
          .select('id, pac, sho, pas, dri, def, phy');
          
        if (playerStatsError) throw playerStatsError;
        
        // 완료된 이벤트 쿼리 구성
        let matchesQuery = supabase
          .from('matches')
          .select('id, date')
          .eq('status', 'completed');
        
        // 연도와 월 필터 적용
        if (year) {
          const startDate = month 
            ? new Date(year, month - 1, 1).toISOString()
            : new Date(year, 0, 1).toISOString();
          
          const endDate = month
            ? new Date(year, month, 0).toISOString() // 해당 월의 마지막 날
            : new Date(year, 11, 31).toISOString();
          
          matchesQuery = matchesQuery
            .gte('date', startDate)
            .lte('date', endDate);
        }
        
        // 필터링된 이벤트 가져오기
        const { data: completedMatches, error: matchesError } = await matchesQuery;
        
        if (matchesError) throw matchesError;
        
        const totalCompletedMatches = completedMatches?.length || 0;
        
        // 완료된 이벤트 id 배열 추출
        const completedMatchIds = (completedMatches ?? []).map(m => m.id);
        
        // player_stats 데이터로 매핑 생성
        const playerStatsMap = new Map();
        playerStatsData?.forEach(stat => {
          playerStatsMap.set(stat.id, stat);
        });
        
        // 각 선수별 참석 정보 가져오기
        const playerStats = await Promise.all(
          playersData.map(async (player) => {
            // 필터링된 이벤트에 대한 참석 기록만 가져오기
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('*')
              .eq('player_id', player.id)
              .eq('status', 'attending')
              .in('match_id', completedMatchIds.length > 0 ? completedMatchIds : [0]); // 빈 배열 대신 [0] 사용하여 쿼리 오류 방지
            
            if (attendanceError) throw attendanceError;
            
            // 골, 어시스트, 평점 합계 계산
            const totalGoals = attendanceData.reduce((sum, match) => sum + (match.goals || 0), 0);
            const totalAssists = attendanceData.reduce((sum, match) => sum + (match.assists || 0), 0);
            
            // 평균 평점 계산 (평점이 있는 이벤트만 계산)
            const matchesWithRating = attendanceData.filter(match => match.rating > 0);
            const averageRating = matchesWithRating.length > 0
              ? matchesWithRating.reduce((sum, match) => sum + match.rating, 0) / matchesWithRating.length
              : 0;
            
            // 출석률 계산 (완료된 이벤트 대비 참석 이벤트 비율)
            const attendance = totalCompletedMatches > 0
              ? Math.round((attendanceData.length / totalCompletedMatches) * 100)
              : 0;
            
            // player_stats 데이터 가져오기
            const playerStatData = playerStatsMap.get(player.id);
            
            // 평균 스탯 계산 (소수점 없음)
            let averageStat = 0;
            if (playerStatData) {
              const { pac, sho, pas, dri, def, phy } = playerStatData;
              const sum = (pac || 0) + (sho || 0) + (pas || 0) + (dri || 0) + (def || 0) + (phy || 0);
              const count = [pac, sho, pas, dri, def, phy].filter(stat => stat !== undefined && stat !== null).length;
              averageStat = count > 0 ? Math.round(sum / count) : 0;
            }
            
            return {
              id: player.id,
              name: player.name,
              position: player.position,
              birthday: player.birthday,
              favorite_team: player.fav_club,
              boots_brand: player.boots_brand,
              weekly_mvp_count: 0,
              monthly_mvp_count: 0,
              yearly_mvp_count: 0,
              games: attendanceData.length,
              goals: totalGoals,
              assists: totalAssists,
              attendance,
              rating: parseFloat(averageRating.toFixed(1)),
              // 선수 능력치 데이터
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
        
        setPlayers(playerStats);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [year, month]); // 연도나 월이 변경되면 데이터 다시 불러오기
  
  // Get the top players in each category
  const goalRanking = [...players].sort((a, b) => b.goals - a.goals);
  const assistRanking = [...players].sort((a, b) => b.assists - a.assists);
  const attendanceRanking = [...players].sort((a, b) => b.attendance - a.attendance);
  const ratingRanking = [...players].sort((a, b) => b.rating - a.rating);
  
  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'goals':
        return goalRanking;
      case 'assists':
        return assistRanking;
      case 'attendance':
        return attendanceRanking;
      case 'rating':
        return ratingRanking;
      default:
        return goalRanking;
    }
  };
  
  return {
    players,
    loading,
    activeTab,
    setActiveTab,
    goalRanking,
    assistRanking,
    attendanceRanking,
    ratingRanking,
    getCurrentRanking,
  };
};

export type { RankingTab, Player };