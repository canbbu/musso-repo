import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 싱글톤 인스턴스 임포트
import { useToast } from '@/hooks/use-toast';
import { Player, Mvp, MvpStatus, MvpType } from '@/types/dashboard';

// 직접 Supabase 클라이언트 생성하는 부분 제거
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseKey);

export const useEntirePlayers = () => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentWeek = getWeekNumber(new Date());

  // 상태 관리
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCompletedMatches, setTotalCompletedMatches] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);

  // MVP 관련 상태
  const [mvpDialogOpen, setMvpDialogOpen] = useState(false);
  const [mvpType, setMvpType] = useState<MvpType>('monthly');
  const [mvpYear, setMvpYear] = useState<number>(currentYear);
  const [mvpMonth, setMvpMonth] = useState<number>(currentMonth);
  const [mvpWeek, setMvpWeek] = useState<number>(currentWeek);
  const [selectedMvpPlayer, setSelectedMvpPlayer] = useState<string>("");
  const [mvpReason, setMvpReason] = useState<string>("");
  const [isMvpSelected, setIsMvpSelected] = useState(false);
  const [mvpStatus, setMvpStatus] = useState<MvpStatus>({
    type: 'monthly',
    exists: false,
    player_id: null,
    player_name: null,
    reason: null,
    period: {
      year: currentYear,
      month: currentMonth
    }
  });

  // 주차 계산 함수
  function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // 연도 옵션 (최근 3년)
  const yearOptions = [
    { value: currentYear.toString(), label: `${currentYear}년` },
    { value: (currentYear - 1).toString(), label: `${currentYear - 1}년` },
    { value: (currentYear - 2).toString(), label: `${currentYear - 2}년` }
  ];

  // 월 옵션
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}월`
  }));

  // 주 옵션 (1주~52주)
  const weekOptions = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}주`
  }));

  // MVP 타입 옵션
  const mvpTypeOptions = [
    { value: 'weekly', label: '주간 MVP' },
    { value: 'monthly', label: '월간 MVP' },
    { value: 'yearly', label: '연간 MVP' }
  ];

  // 선수 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      
      setLoading(true);
      try {
        // 기본 선수 정보 가져오기
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('is_deleted', false);
        
        if (error) throw error;
        
        
        
        // 완료된 이벤트 가져오기
        const { data: completedMatches, error: matchesError } = await supabase
          .from('matches')
          .select('id, date')
          .eq('status', 'completed');
          
        if (matchesError) throw matchesError;
        
        const totalCompletedMatches = completedMatches?.length || 0;
        
        setTotalCompletedMatches(totalCompletedMatches);
        
        // 완료된 이벤트 id 배열 추출
        const completedMatchIds = (completedMatches ?? []).map(m => m.id);
        
        
        // 각 선수별 통계 정보 추가
        const playersWithStats = await Promise.all(
          data.map(async (player) => {
            // 선수의 참석 기록 가져오기
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('*')
              .eq('player_id', player.id)
              .eq('status', 'attending')
              .in('match_id', completedMatchIds.length > 0 ? completedMatchIds : [0]); // 빈 배열 대신 [0] 사용하여 쿼리 오류 방지
            
            if (attendanceError) throw attendanceError;
            
            // 골, 어시스트 합계 계산
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
            
            return {
              ...player,
              games: attendanceData.length,
              goals: totalGoals,
              assists: totalAssists,
              attendance_rate: attendance,
              rating: parseFloat(averageRating.toFixed(1)),
              attendances: attendanceData // 원본 참석 데이터도 저장
            };
          })
        );
        
        // 이름순으로 정렬
        const sortedPlayers = playersWithStats.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB, 'ko');
        });
        
        setPlayers(sortedPlayers || []);
        // 초기 필터링된 데이터 설정 (전체 데이터)
        setFilteredPlayers(sortedPlayers || []);
      } catch (error) {
        console.error('[에러] 선수 데이터 로드 실패:', error);
        toast({
          title: "데이터 로드 실패",
          description: "선수 정보를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        
      }
    };
    fetchData();
    checkMvpStatus(mvpType, mvpYear, mvpMonth, mvpWeek);
    // eslint-disable-next-line
  }, []);

  // 필터 적용
  useEffect(() => {
    let result = [...players];
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(player => {
          const playerValue = player[key as keyof Player];
          return playerValue && playerValue.toString().toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    
    setFilteredPlayers(result);
  }, [filters, players]);

  // MVP 상태 확인
  const checkMvpStatus = async (
    type: MvpType, 
    year: number, 
    month?: number, 
    week?: number
  ): Promise<boolean> => {
    try {
      
      
      // 타입에 따라 다른 조건으로 쿼리
      let query = supabase
        .from('mvp')
        .select('*, players!inner(name)')
        .eq('mvp_type', type)
        .eq('year', year);
      
      if (type === 'weekly' && week) {
        query = query.eq('week', week);
      } else if (type === 'monthly' && month) {
        query = query.eq('month', month);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('MVP 상태 확인 쿼리 오류:', error);
        throw error;
      }
      
      
      
      setMvpStatus({
        type,
        exists: !!data,
        player_id: data?.player_id || null,
        player_name: data?.players?.name || null,
        reason: data?.reason || null,
        period: {
          year,
          month,
          week
        }
      });
      
      setIsMvpSelected(!!data);
      return !!data;
    } catch (error) {
      console.error('MVP 상태 확인 중 오류 발생:', error);
      setIsMvpSelected(false);
      return false;
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  // 필터 설정 함수
  const setYearWithLog = (year: number | undefined) => {
    
    setSelectedYear(year);
  };

  const setMonthWithLog = (month: number | undefined) => {
    
    setSelectedMonth(month);
  };

  // 필터 초기화
  const resetFilters = () => {
    
    setFilters({});
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
    setFilteredPlayers(players);
  };

  // 선수 삭제 확인
  const confirmDelete = async () => {
    if (!playerToDelete) return;
    try {
      
      
      const { error } = await supabase
        .from('players')
        .update({ is_deleted: true })
        .eq('id', playerToDelete);
      if (error) throw error;
      
      
      
      toast({
        title: "선수 삭제 완료",
        description: "선수 정보가 성공적으로 삭제되었습니다.",
      });
      setPlayers(players.filter(p => p.id !== playerToDelete));
      setFilteredPlayers(filteredPlayers.filter(p => p.id !== playerToDelete));
    } catch (error) {
      console.error('선수 삭제 중 오류 발생:', error);
      toast({
        title: "삭제 실패",
        description: "선수 정보를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setPlayerToDelete(null);
    }
  };

  // MVP 선정 핸들러
  const handleMvpSelect = async () => {
    if (!selectedMvpPlayer || !mvpReason) {
      toast({
        title: "입력 필요",
        description: "선수와 선정 이유를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      
      let success = false;
      
      switch (mvpType) {
        case 'weekly':
          success = await selectWeeklyMvp(selectedMvpPlayer, mvpYear, mvpWeek, mvpReason);
          break;
        case 'monthly':
          success = await selectMonthlyMvp(selectedMvpPlayer, mvpYear, mvpMonth, mvpReason);
          break;
        case 'yearly':
          success = await selectYearlyMvp(selectedMvpPlayer, mvpYear, mvpReason);
          break;
      }
      
      
      
      if (success) {
        setMvpDialogOpen(false);
      }
    } catch (error) {
      console.error('MVP 선정 중 오류 발생:', error);
      toast({
        title: "MVP 선정 실패",
        description: "MVP를 선정하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // MVP 타입, 연도, 월, 주 변경 시 상태 확인
  useEffect(() => {
    checkMvpStatus(mvpType, mvpYear, mvpMonth, mvpWeek);
    // eslint-disable-next-line
  }, [mvpType, mvpYear, mvpMonth, mvpWeek]);

  // 주간 MVP 선정
  const selectWeeklyMvp = async (playerId: string, year: number, week: number, reason: string) => {
    try {
      // 이미 존재하는지 확인
      const existingMvp = await checkMvpStatus('weekly', year, undefined, week);
      
      if (existingMvp) {
        toast({
          title: "MVP 선정 실패",
          description: "이미 해당 주의 MVP가 선정되어 있습니다.",
          variant: "destructive"
        });
        return false;
      }
      
      // 선수 이름 조회
      const { data: playerData, error: playerQueryError } = await supabase
        .from('players')
        .select('name')
        .eq('id', playerId)
        .single();
      
      if (playerQueryError) throw playerQueryError;
      
      // 새 주간 MVP 선정 (통합 테이블 사용)
      const { error } = await supabase
        .from('mvp')
        .insert([{ 
          player_id: playerId, 
          mvp_type: 'weekly',
          year, 
          week, 
          reason, 
          created_at: new Date().toISOString() 
        }]);
      
      if (error) throw error;
      
      toast({
        title: "주간 MVP 선정 완료",
        description: `${year}년 ${week}주차 MVP 선정이 완료되었습니다.`,
      });
      
      // 상태 업데이트
      await checkMvpStatus('weekly', year, undefined, week);
      
      // 플레이어 목록 새로고침
      const { data: updatedPlayers, error: refreshError } = await supabase
        .from('players')
        .select('*')
        .eq('is_deleted', false);
      
      if (!refreshError && updatedPlayers) {
        setPlayers(updatedPlayers);
        setFilteredPlayers(updatedPlayers);
      }
      
      return true;
    } catch (error) {
      console.error('주간 MVP 선정 중 오류 발생:', error);
      toast({
        title: "MVP 선정 실패",
        description: "주간 MVP를 선정하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    }
  };

  // 월간 MVP 선정
  const selectMonthlyMvp = async (playerId: string, year: number, month: number, reason: string) => {
    try {
      // 이미 존재하는지 확인
      const existingMvp = await checkMvpStatus('monthly', year, month);
      
      if (existingMvp) {
        toast({
          title: "MVP 선정 실패",
          description: "이미 해당 월의 MVP가 선정되어 있습니다.",
          variant: "destructive"
        });
        return false;
      }
      
      // 선수 이름 조회
      const { data: playerData, error: playerQueryError } = await supabase
        .from('players')
        .select('name')
        .eq('id', playerId)
        .single();
      
      if (playerQueryError) throw playerQueryError;
      
      // 새 월간 MVP 선정 (통합 mvp 테이블 사용)
      const { error } = await supabase
        .from('mvp')
        .insert([{ 
          player_id: playerId, 
          mvp_type: 'monthly',
          year, 
          month, 
          reason, 
          created_at: new Date().toISOString() 
        }]);
      
      if (error) throw error;
      
      toast({
        title: "월간 MVP 선정 완료",
        description: `${year}년 ${month}월 MVP 선정이 완료되었습니다.`,
      });
      
      // 상태 업데이트
      await checkMvpStatus('monthly', year, month);
      
      // 플레이어 목록 새로고침
      const { data: updatedPlayers, error: refreshError } = await supabase
        .from('players')
        .select('*')
        .eq('is_deleted', false);
      
      if (!refreshError && updatedPlayers) {
        setPlayers(updatedPlayers);
        setFilteredPlayers(updatedPlayers);
      }
      
      return true;
    } catch (error) {
      console.error('월간 MVP 선정 중 오류 발생:', error);
      toast({
        title: "MVP 선정 실패",
        description: "월간 MVP를 선정하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    }
  };

  // 연간 MVP 선정
  const selectYearlyMvp = async (playerId: string, year: number, reason: string) => {
    try {
      // 이미 존재하는지 확인
      const existingMvp = await checkMvpStatus('yearly', year);
      
      if (existingMvp) {
        toast({
          title: "MVP 선정 실패",
          description: "이미 해당 연도의 MVP가 선정되어 있습니다.",
          variant: "destructive"
        });
        return false;
      }
      
      // 선수 이름 조회
      const { data: playerData, error: playerQueryError } = await supabase
        .from('players')
        .select('name')
        .eq('id', playerId)
        .single();
      
      if (playerQueryError) throw playerQueryError;
      
      // 새 연간 MVP 선정 (통합 mvp 테이블 사용)
      const { error } = await supabase
        .from('mvp')
        .insert([{ 
          player_id: playerId, 
          mvp_type: 'yearly',
          year, 
          reason, 
          created_at: new Date().toISOString() 
        }]);
      
      if (error) throw error;
      
      toast({
        title: "연간 MVP 선정 완료",
        description: `${year}년 MVP 선정이 완료되었습니다.`,
      });
      
      // 상태 업데이트
      await checkMvpStatus('yearly', year);
      
      // 플레이어 목록 새로고침
      const { data: updatedPlayers, error: refreshError } = await supabase
        .from('players')
        .select('*')
        .eq('is_deleted', false);
      
      if (!refreshError && updatedPlayers) {
        setPlayers(updatedPlayers);
        setFilteredPlayers(updatedPlayers);
      }
      
      return true;
    } catch (error) {
      console.error('연간 MVP 선정 중 오류 발생:', error);
      toast({
        title: "MVP 선정 실패",
        description: "연간 MVP를 선정하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    }
  };

  // 기간 필터 적용을 위한 useEffect
  useEffect(() => {
    if (!players.length) return;
    
    
    
    
    setLoading(true);
    
    try {
      // 선택된 연도나 월이 없으면 모든 데이터 표시
      if (!selectedYear && !selectedMonth) {
        
        setFilteredPlayers(players);
        setLoading(false);
        return;
      }
      
      // 필터링된 경기 가져오기
      const fetchFilteredMatches = async () => {
        // 선택된 연도와 월에 해당하는 기간 설정
        let startDate, endDate;
        
        if (selectedYear && selectedMonth) {
          startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
          endDate = new Date(selectedYear, selectedMonth, 0).toISOString();
          
          
        } else if (selectedYear) {
          startDate = new Date(selectedYear, 0, 1).toISOString();
          endDate = new Date(selectedYear, 11, 31).toISOString();
          
          
        } else if (selectedMonth) {
          const currentYear = new Date().getFullYear();
          startDate = new Date(currentYear, selectedMonth - 1, 1).toISOString();
          endDate = new Date(currentYear, selectedMonth, 0).toISOString();
          
          
        }
        
        // 선택된 기간의 경기 가져오기
        const { data: filteredMatches, error } = await supabase
          .from('matches')
          .select('id, date')
          .eq('status', 'completed')
          .gte('date', startDate)
          .lte('date', endDate);
        
        if (error) throw error;
        
        const filteredTotalMatches = filteredMatches?.length || 0;
        
        
        setTotalCompletedMatches(filteredTotalMatches);
        
        const filteredMatchIds = filteredMatches.map(m => m.id);
        
        // 각 선수별로 해당 기간의 참석 데이터만 DB에서 쿼리
        const updatedPlayersData = await Promise.all(
          players.map(async (player) => {
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('*')
              .eq('player_id', player.id)
              .eq('status', 'attending')
              .in('match_id', filteredMatchIds.length > 0 ? filteredMatchIds : [0]);
            if (attendanceError) throw attendanceError;
            
            const totalGoals = attendanceData.reduce((sum, match) => sum + (match.goals || 0), 0);
            const totalAssists = attendanceData.reduce((sum, match) => sum + (match.assists || 0), 0);
            const matchesWithRating = attendanceData.filter(match => match.rating > 0);
            const averageRating = matchesWithRating.length > 0
              ? matchesWithRating.reduce((sum, match) => sum + match.rating, 0) / matchesWithRating.length
              : 0;
            const attendance = filteredTotalMatches > 0
              ? Math.round((attendanceData.length / filteredTotalMatches) * 100)
              : 0;
            
            return {
              ...player,
              games: attendanceData.length,
              goals: totalGoals,
              assists: totalAssists,
              attendance_rate: attendance,
              rating: parseFloat(averageRating.toFixed(1))
            };
          })
        );
        
        
        setFilteredPlayers(updatedPlayersData);
        setLoading(false);
      };
      
      fetchFilteredMatches();
    } catch (error) {
      console.error('[에러] 필터링 중 오류 발생:', error);
      toast({
        title: "필터링 실패",
        description: "데이터 필터링 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setLoading(false);
    }
    
  }, [selectedYear, selectedMonth, players]);

  return {
    players,
    setPlayers,
    filteredPlayers,
    setFilteredPlayers,
    loading,
    setLoading,
    totalCompletedMatches,
    selectedYear,
    setSelectedYear: setYearWithLog,
    selectedMonth,
    setSelectedMonth: setMonthWithLog,
    selectedWeek,
    setSelectedWeek,
    filters,
    setFilters,
    deleteDialogOpen,
    setDeleteDialogOpen,
    playerToDelete,
    setPlayerToDelete,
    mvpDialogOpen,
    setMvpDialogOpen,
    mvpType,
    setMvpType,
    mvpYear,
    setMvpYear,
    mvpMonth,
    setMvpMonth,
    mvpWeek,
    setMvpWeek,
    selectedMvpPlayer,
    setSelectedMvpPlayer,
    mvpReason,
    setMvpReason,
    isMvpSelected,
    setIsMvpSelected,
    mvpStatus,
    setMvpStatus,
    yearOptions,
    monthOptions,
    weekOptions,
    mvpTypeOptions,
    handleFilterChange,
    resetFilters,
    confirmDelete,
    handleMvpSelect,
    checkMvpStatus,
    selectWeeklyMvp,
    selectMonthlyMvp,
    selectYearlyMvp,
  };
};
