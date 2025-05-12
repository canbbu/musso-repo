import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Player {
  id: string;
  name: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  attendance: number;
  rating: number;
  daily_mvp: string;
  monthly_mvp: string;
  yearly_mvp: string;
}

type RankingTab = 'goals' | 'assists' | 'attendance' | 'rating';

// Supabase 클라이언트 생성

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const usePlayerRankings = () => {
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
          .select('id, name, position, boots_brand, fav_club, birthday, daily_mvp, monthly_mvp, yearly_mvp');
        console.log('usePlayerRankings playersData:', playersData);
        
        if (playersError) throw playersError;
        
        // 완료된 이벤트 수 가져오기
        const { data: completedMatches, error: matchesError } = await supabase
          .from('matches')
          .select('id')
          .eq('status', 'completed');
        console.log('usePlayerRankings completedMatches:', completedMatches);
        
        if (matchesError) throw matchesError;
        
        // 스키마에 'completed' 상태가 없는 경우를 위한 대비책
        // matches 테이블의 status는 현재 'upcoming'과 'cancelled'만 있음
        // 향후 'completed' 상태를 추가할 예정이므로, 임시로 전체 이벤트 수를 계산
        const totalCompletedMatches = completedMatches?.length || 0;
        console.log('usePlayerRankings totalCompletedMatches:', totalCompletedMatches);
        
        // 완료된 이벤트 id 배열 추출
        const completedMatchIds = (completedMatches ?? []).map(m => m.id);
        
        // 각 선수별 참석 정보 가져오기
        const playerStats = await Promise.all(
          playersData.map(async (player) => {
            // 'completed' 이벤트만 필터링
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('*')
              .eq('player_id', player.id)
              .eq('status', 'attending')
              .in('match_id', completedMatchIds);
            console.log(`usePlayerRankings attendanceData for ${player.name}:`, attendanceData);
            
            if (attendanceError) throw attendanceError;
            
            // 골, 어시스트, 평점 합계 계산
            const totalGoals = attendanceData.reduce((sum, match) => sum + (match.goals || 0), 0);
            const totalAssists = attendanceData.reduce((sum, match) => sum + (match.assists || 0), 0);
            
            // 평균 평점 계산 (평점이 있는 이벤트만 계산)
            const matchesWithRating = attendanceData.filter(match => match.rating > 0);
            const averageRating = matchesWithRating.length > 0
              ? matchesWithRating.reduce((sum, match) => sum + match.rating, 0) / matchesWithRating.length
              : 0;
            
            // 포지션은 임시로 설정 (실제로는 데이터베이스에서 가져와야 함)
            const positions = player.position;
            
            // 출석률 계산 (완료된 이벤트 대비 참석 이벤트 비율)
            // 완료된 이벤트가 없으면 0으로 설정
            const attendance = totalCompletedMatches > 0
              ? Math.round((attendanceData.length / totalCompletedMatches) * 100)
              : 0;
            
            const stat = {
              id: player.id,
              name: player.name,
              position: player.position,
              boots_brand: player.boots_brand,
              fav_club: player.fav_club,
              birthday: player.birthday,
              daily_mvp: player.daily_mvp,
              monthly_mvp: player.monthly_mvp,
              yearly_mvp: player.yearly_mvp,
              games: attendanceData.length,
              goals: totalGoals,
              assists: totalAssists,
              attendance,
              rating: parseFloat(averageRating.toFixed(1))
            };
            console.log(`usePlayerRankings stat for ${player.name}:`, stat);
            return stat;
          })
        );
        console.log('usePlayerRankings 최종 playerStats:', playerStats);
        
        setPlayers(playerStats);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, []);
  
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
