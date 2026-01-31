import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

interface PlayerStats {
  id: string;
  name: string;
  matchId: number;
  matchDate: string;
  attendanceStatus: 'attending' | 'not_attending' | 'pending';
  goals: number;
  assists: number;
  rating: number;
  cleansheet?: number;
}

interface Match {
  id: number;
  date: string;
  opponent: string;
}

interface Player {
  id: string;
  name: string;
  username: string;
  role: string;
}

export const usePlayerStats = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // matches 불러오기
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        console.error('이벤트 목록을 불러오는 중 오류 발생:', error);
        return;
      }
      // date를 ISO string으로 변환
      setMatches(
        data.map((m: any) => ({
          ...m,
          date: m.date ? new Date(m.date).toISOString().slice(0, 16) : '',
        }))
      );
    };
    fetchMatches();
  }, []);

  // players 불러오기
  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('is_deleted', false)
        .neq('role', 'futsal-guest');
      if (error) {
        console.error('선수 목록을 불러오는 중 오류 발생:', error);
        return;
      }
      setPlayers(data);
    };
    fetchPlayers();
  }, []);
  
  // 출석 현황 및 playerStats 생성
  useEffect(() => {
    const fetchAttendanceAndStats = async () => {
      if (!selectedMatch) {
        setPlayerStats([]);
        return;
      }
      setIsLoading(true);

      // 출석 현황 불러오기
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select('*')
        .eq('match_id', selectedMatch)
        .eq('match_number', 1); // 기본값으로 1경기 설정

      if (attendanceError) {
        console.error('출석 현황을 불러오는 중 오류 발생:', attendanceError);
        setIsLoading(false);
        return;
      }

      // 해당 경기의 모든 경기 수에서의 득점/어시스트/철벽지수 합계 불러오기
      const { data: matchStatsData, error: matchStatsError } = await supabase
        .from('match_attendance')
        .select('player_id, goals, assists, cleansheet')
        .eq('match_id', selectedMatch)
        .not('is_opponent_team', 'eq', true); // 상대팀 제외

      if (matchStatsError) {
        console.error('경기 통계를 불러오는 중 오류 발생:', matchStatsError);
        setIsLoading(false);
        return;
      }

      // 선수별 해당 경기의 모든 경기 수 득점/어시스트/철벽지수 합계 계산
      const matchStatsMap: Record<string, { totalGoals: number; totalAssists: number; totalCleansheet: number }> = {};
      matchStatsData?.forEach((row: any) => {
        if (!matchStatsMap[row.player_id]) {
          matchStatsMap[row.player_id] = { totalGoals: 0, totalAssists: 0, totalCleansheet: 0 };
        }
        matchStatsMap[row.player_id].totalGoals += row.goals || 0;
        matchStatsMap[row.player_id].totalAssists += row.assists || 0;
        matchStatsMap[row.player_id].totalCleansheet += row.cleansheet || 0;
      });

      // 선수별 출석 상태 매핑
      const attendanceMap: Record<string, {
        status: 'attending' | 'not_attending' | 'pending';
        goals?: number;
        assists?: number;
        rating?: number;
        cleansheet?: number;
      }> = {};
      
      attendanceData?.forEach((row: any) => {
        attendanceMap[row.player_id] = {
          status: row.status,
          goals: row.goals || 0,
          assists: row.assists || 0,
          rating: row.rating || 0,
          cleansheet: row.cleansheet || 0
        };
      });      

      // 선수별 playerStats 생성
      const selectedMatchData = matches.find(m => m.id === selectedMatch);
      const stats: PlayerStats[] = players.map(player => ({
        id: player.id,
        name: player.name,
        matchId: selectedMatch,
        matchDate: selectedMatchData?.date || '',
        attendanceStatus: attendanceMap[player.id]?.status || 'pending',
        goals: matchStatsMap[player.id]?.totalGoals || 0, // 해당 경기 득점 합계
        assists: matchStatsMap[player.id]?.totalAssists || 0, // 해당 경기 어시스트 합계
        rating: attendanceMap[player.id]?.rating || 0, // 평점은 현재 경기만
        cleansheet: matchStatsMap[player.id]?.totalCleansheet || 0, // 철벽지수는 모든 경기 수 합계
      }));

      // 먼저 이름순으로 정렬 후, 출석 상태별로 정렬
      stats.sort((a, b) => {
        // 1차: 출석 상태로 정렬
        const order = { attending: 0, not_attending: 1, pending: 2 };
        const statusDiff = order[a.attendanceStatus] - order[b.attendanceStatus];
        
        // 같은 출석 상태인 경우 이름순으로 정렬
        if (statusDiff === 0) {
          return a.name.localeCompare(b.name, 'ko');
        }
        return statusDiff;
      });

      setPlayerStats(stats);
      setIsLoading(false);
    };

    fetchAttendanceAndStats();
  }, [selectedMatch, players, matches]);

  // 출석 상태 변경 및 정렬
  const handleAttendanceChange = async (playerId: string, newStatus: 'attending' | 'not_attending' | 'pending') => {
    // UI 즉시 업데이트
    setPlayerStats(prev =>
      prev
        .map(stat =>
          stat.id === playerId
            ? { ...stat, attendanceStatus: newStatus }
            : stat
        )
        .sort((a, b) => {
          const order = { attending: 0, not_attending: 1, pending: 2 };
          return order[a.attendanceStatus] - order[b.attendanceStatus];
        })
    );
    
    // DB 업데이트
    try {
      if (!selectedMatch) return;
      
      const { error } = await supabase
        .from('match_attendance')
        .upsert({
          match_id: selectedMatch,
          match_number: 1, // 기본값으로 1경기 설정
          player_id: playerId, 
          status: newStatus
        }, { 
          onConflict: 'match_id,match_number,player_id' // 올바른 복합 유니크 키
        });
        
      if (error) {
        console.error('출석 상태 업데이트 중 오류 발생:', error);
      }
    } catch (error) {
      console.error('출석 상태 업데이트 중 예외 발생:', error);
    }
  };
  
  const handleStatChange = async (playerId: string, field: keyof PlayerStats, value: any) => {
    // UI 업데이트
    setPlayerStats(prev => 
      prev.map(stat => 
        stat.id === playerId 
          ? { ...stat, [field]: value } 
          : stat
      )
    );
    
    // DB 업데이트
    try {
      if (!selectedMatch) return;
      
      // field가 attendanceStatus가 아닐 때만 업데이트 (attendanceStatus는 별도 함수에서 처리)
      if (field !== 'attendanceStatus') {
        // 철벽지수의 경우: 입력한 값만큼 각 경기에 1씩 분배 (작전판과 연동)
        if (field === 'cleansheet') {
          // 해당 이벤트의 모든 경기 수 가져오기
          const { data: matchNumbersData, error: matchNumbersError } = await supabase
            .from('match_attendance')
            .select('match_number')
            .eq('match_id', selectedMatch)
            .eq('player_id', playerId)
            .order('match_number', { ascending: true });
          
          if (matchNumbersError) {
            console.error('경기 수 조회 중 오류 발생:', matchNumbersError);
            return;
          }
          
          const matchNumbers = Array.from(new Set(matchNumbersData?.map(m => m.match_number) || [])).sort((a, b) => a - b);
          const cleansheetValue = Number(value) || 0;
          
          // 모든 경기의 cleansheet를 0으로 초기화
          for (const matchNumber of matchNumbers) {
            await supabase
              .from('match_attendance')
              .update({ cleansheet: 0 })
              .eq('match_id', selectedMatch)
              .eq('match_number', matchNumber)
              .eq('player_id', playerId);
          }
          
          // 입력한 값만큼 각 경기에 1씩 설정 (예: 3 입력 시 1, 2, 3경기에 각각 1)
          // 이렇게 하면 작전판에서도 같은 데이터를 볼 수 있음
          for (let i = 0; i < Math.min(cleansheetValue, matchNumbers.length); i++) {
            const matchNumber = matchNumbers[i];
            await supabase
              .from('match_attendance')
              .update({ cleansheet: 1 })
              .eq('match_id', selectedMatch)
              .eq('match_number', matchNumber)
              .eq('player_id', playerId);
          }
        } else {
          // 철벽지수가 아닌 경우 기존 로직 유지
          const { error } = await supabase
            .from('match_attendance')
            .update({ [field]: value })
            .match({ 
              match_id: selectedMatch,
              match_number: 1, // 기본값으로 1경기 설정
              player_id: playerId
            });
            
          if (error) {
            console.error(`${field} 업데이트 중 오류 발생:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`${field} 업데이트 중 예외 발생:`, error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    matches,
    players,
    selectedMatch,
    setSelectedMatch,
    playerStats,
    isLoading,
    handleStatChange,
    handleAttendanceChange,
    formatDate
  };
};
