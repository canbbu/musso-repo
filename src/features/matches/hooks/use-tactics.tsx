import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { Tactics, TacticsPlayer, TacticsFormData, TacticsWithMatch } from '../types/match.types';

export const useTactics = (matchId: number, matchNumber: number = 1) => {
  const [tactics, setTactics] = useState<Tactics | null>(null);
  const [players, setPlayers] = useState<TacticsPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 작전판 데이터 가져오기
  const fetchTactics = async () => {
    try {
      setLoading(true);
      setError(null);

      // tactics 테이블에서 작전판 데이터 가져오기
      const { data: tacticsData, error: tacticsError } = await supabase
        .from('tactics')
        .select('*')
        .eq('match_id', matchId)
        .eq('match_number', matchNumber)
        .maybeSingle();

      if (tacticsError && tacticsError.code !== 'PGRST116') {
        console.error('tactics 테이블 조회 에러:', tacticsError);
        throw tacticsError;
      }

      if (tacticsData) {
        setTactics({
          id: tacticsData.id,
          match_id: tacticsData.match_id,
          match_number: tacticsData.match_number,
          name: tacticsData.name,
          team_a_strategy: tacticsData.team_a_strategy || '',
          team_b_strategy: tacticsData.team_b_strategy || '',
          created_by: tacticsData.created_by || '',
          created_at: tacticsData.created_at,
          updated_at: tacticsData.updated_at
        });
      } else {
        // tactics 테이블에 데이터가 없으면 기본값 설정
        setTactics({
          id: null,
          match_id: matchId,
          match_number: matchNumber,
          name: `경기 #${matchId} - ${matchNumber}경기 작전판`,
          team_a_strategy: '',
          team_b_strategy: '',
          created_by: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // match_attendance 테이블에서 선수 데이터 가져오기
      const { data: playersData, error: playersError } = await supabase
        .from('match_attendance')
        .select(`
          id,
          match_id,
          match_number,
          player_id,
          status,
          goals,
          assists,
          rating,
          tactics_position_x,
          tactics_position_y,
          tactics_team,
          substitutions,
          is_substituted,
          goal_timestamp,
          assist_timestamp,
          is_opponent_team,
          opponent_team_name
        `)
        .eq('match_id', matchId)
        .eq('match_number', matchNumber);

      if (playersError) {
        throw playersError;
      }

      // 선수 정보를 별도로 가져오기
      const playerIds = playersData?.map(p => p.player_id).filter(id => id) || [];
      let playersInfo: any[] = [];
      
      if (playerIds.length > 0) {
        const { data: playersInfoData, error: playersInfoError } = await supabase
          .from('players')
          .select('id, name, position')
          .in('id', playerIds);
        
        if (playersInfoError) {
          console.error('선수 정보 조회 에러:', playersInfoError);
        } else {
          playersInfo = playersInfoData || [];
        }
      }

      if (playersError) {
        throw playersError;
      }

      if (playersData) {
        // 위치 정보가 있는 선수만 필터링
        const playersWithPosition = playersData.filter(player => 
          player.tactics_position_x !== null && 
          player.tactics_position_y !== null
        );
        
        const formattedPlayers = playersWithPosition.map(player => {
          const playerInfo = playersInfo.find(p => p.id === player.player_id);
          return {
            id: player.id,
            match_id: player.match_id,
            match_number: player.match_number,
            player_id: player.player_id,
            status: player.status,
            goals: player.goals || 0,
            assists: player.assists || 0,
            rating: player.rating || 0,
            tactics_position_x: player.tactics_position_x,
            tactics_position_y: player.tactics_position_y,
            tactics_team: player.tactics_team,
            substitutions: player.substitutions || 0,
            is_substituted: player.is_substituted || false,
            player_name: playerInfo?.name || 'Unknown'
          };
        });
        setPlayers(formattedPlayers);
      } else {
        setPlayers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '작전판 데이터를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 작전판 저장/업데이트
  const saveTactics = async (formData: TacticsFormData) => {
    try {
      setError(null);

      // tactics 테이블에 전략 정보만 저장/업데이트
      const tacticsData = {
        match_id: formData.match_id,
        match_number: formData.match_number,
        name: formData.name,
        team_a_strategy: formData.team_a_strategy,
        team_b_strategy: formData.team_b_strategy,
        created_by: null, // UUID 필드이므로 null로 설정
        updated_at: new Date().toISOString()
      };

      // 기존 tactics 데이터가 있는지 확인
      const { data: existingTactics, error: fetchError } = await supabase
        .from('tactics')
        .select('id')
        .eq('match_id', formData.match_id)
        .eq('match_number', formData.match_number)
        .maybeSingle();

      let tacticsResult;
      if (existingTactics) {
        // 기존 데이터 업데이트
        const { data, error } = await supabase
          .from('tactics')
          .update(tacticsData)
          .eq('id', existingTactics.id)
          .select('*');

        if (error) {
          console.error('tactics 업데이트 에러:', error);
          throw error;
        }
        tacticsResult = data;
      } else {
        // 새 데이터 삽입
        const { data, error } = await supabase
          .from('tactics')
          .insert(tacticsData)
          .select('*');

        if (error) {
          console.error('tactics 삽입 에러:', error);
          throw error;
        }
        tacticsResult = data;
      }

      // match_attendance 테이블에 선수별 상세 정보 저장 (포지션, 골, 어시스트 등)
      for (const player of formData.players) {
        // 상대팀인지 확인
        const isOpponentTeam = player.player_id && player.player_id.startsWith('opponent_');
        
        if (isOpponentTeam) {
          // 상대팀인 경우 건너뛰기 (상대팀은 위치 정보를 저장하지 않음)
          continue;
        }

        // 기존 데이터 조회
        const { data: existingData, error: fetchError } = await supabase
          .from('match_attendance')
          .select('*')
          .eq('match_id', formData.match_id)
          .eq('match_number', formData.match_number)
          .eq('player_id', player.player_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116는 데이터가 없는 경우
          console.error('기존 데이터 조회 에러:', fetchError);
        }

        // 기존 데이터와 새 데이터 병합 (기존 골, 어시스트, 타임스탬프 보존)
        const updateData = {
          match_id: formData.match_id,
          match_number: formData.match_number,
          player_id: player.player_id,
          status: 'attending',
          goals: player.goals || existingData?.goals || 0,
          assists: player.assists || existingData?.assists || 0,
          rating: existingData?.rating || 0,
          tactics_position_x: player.tactics_position_x,
          tactics_position_y: player.tactics_position_y,
          tactics_team: player.tactics_team,
          substitutions: player.substitutions || existingData?.substitutions || 0,
          is_substituted: player.is_substituted || existingData?.is_substituted || false,
          goal_timestamp: existingData?.goal_timestamp,
          assist_timestamp: existingData?.assist_timestamp
        };

        // UPSERT 방식으로 처리
        const { data, error: upsertError } = await supabase
          .from('match_attendance')
          .upsert(updateData, {
            onConflict: 'match_id,match_number,player_id'
          })
          .select('*');

        if (upsertError) {
          console.error('match_attendance upsert error:', upsertError, player);
        }
      }

      // 저장 후 데이터 다시 가져오기
      await fetchTactics();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작전판 저장에 실패했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 경기별 작전판 목록 가져오기
  const fetchTacticsList = async () => {
    try {
      const { data, error } = await supabase
        .from('tactics')
        .select('*')
        .eq('match_id', matchId)
        .order('match_number', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : '작전판 목록을 가져오는데 실패했습니다.');
      return [];
    }
  };

  // 경기별 참석 선수 목록 가져오기 (작전판 편집용)
  const fetchMatchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('match_attendance')
        .select(`
          *,
          players:player_id (
            id,
            name,
            position
          )
        `)
        .eq('match_id', matchId)
        .eq('match_number', matchNumber)
        .eq('status', 'attending');

      if (error) {
        throw error;
      }

      return data.map(player => ({
        id: player.id,
        match_id: player.match_id,
        match_number: player.match_number,
        player_id: player.player_id,
        status: player.status,
        goals: player.goals || 0,
        assists: player.assists || 0,
        rating: player.rating || 0,
        tactics_position_x: player.tactics_position_x,
        tactics_position_y: player.tactics_position_y,
        tactics_team: player.tactics_team,
        substitutions: player.substitutions || 0,
        is_substituted: player.is_substituted || false,
        player_name: player.players?.name
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '경기 선수 목록을 가져오는데 실패했습니다.');
      return [];
    }
  };

  // 특정 경기의 모든 경기 번호 가져오기 (match_attendance 테이블만 확인)
  const fetchMatchNumbers = async () => {
    try {
      // match_attendance 테이블에서 경기 번호 가져오기
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('match_attendance')
        .select('match_number')
        .eq('match_id', matchId)
        .order('match_number', { ascending: true });

      if (attendanceError) {
        console.error('match_attendance 테이블 조회 에러:', attendanceError);
      }

      // 경기 번호 중복 제거
      const allMatchNumbers = new Set<number>();
      
      if (attendanceData) {
        attendanceData.forEach(item => allMatchNumbers.add(item.match_number));
      }

      const matchNumbers = Array.from(allMatchNumbers).sort((a, b) => a - b);
      
      // 데이터가 없으면 기본값으로 1경기만 반환
      if (matchNumbers.length === 0) {
        return [1];
      }
      
      return matchNumbers;
    } catch (err) {
      console.error('경기 번호 가져오기 에러:', err);
      return [1]; // 기본값으로 1경기만 반환
    }
  };

  // 작전판 삭제 함수
  const deleteTactics = async () => {
    try {
      setError(null);

      // tactics 테이블에서 해당 경기의 작전판 데이터 삭제
      const { error: tacticsError } = await supabase
        .from('tactics')
        .delete()
        .eq('match_id', matchId)
        .eq('match_number', matchNumber);

      if (tacticsError) {
        console.error('tactics 삭제 에러:', tacticsError);
        return { success: false, error: tacticsError.message };
      }

      // match_attendance 테이블에서 해당 경기의 선수 위치 정보만 초기화
      const { data: existingPlayers, error: fetchError } = await supabase
        .from('match_attendance')
        .select('player_id')
        .eq('match_id', matchId)
        .eq('match_number', matchNumber);

      if (fetchError) {
        console.error('기존 선수 조회 에러:', fetchError);
        return { success: false, error: fetchError.message };
      }

      if (existingPlayers && existingPlayers.length > 0) {
        for (const player of existingPlayers) {
          const { error: updateError } = await supabase
            .from('match_attendance')
            .update({
              tactics_position_x: null,
              tactics_position_y: null,
              tactics_team: null
            })
            .eq('match_id', matchId)
            .eq('match_number', matchNumber)
            .eq('player_id', player.player_id);

          if (updateError) {
            console.error('선수 위치 초기화 에러:', updateError);
          }
        }
      }

      // 로컬 상태 초기화
      setTactics(null);
      setPlayers([]);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '작전판 삭제에 실패했습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (matchId) {
      // 경기 변경 시 즉시 상태 초기화
      setPlayers([]);
      setTactics(null);
      
      fetchTactics();
    }
  }, [matchId, matchNumber]);

  return {
    tactics,
    players,
    loading,
    error,
    fetchTactics,
    saveTactics,
    deleteTactics,
    fetchTacticsList,
    fetchMatchPlayers,
    fetchMatchNumbers
  };
}; 