import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { Player, MatchInfo } from '../types/attendance.types';

// Types are imported from '../types/attendance.types'

export const useAttendance = (matchId: string | undefined) => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [attendingPlayers, setAttendingPlayers] = useState<Set<string>>(new Set());
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchIdNum = matchId ? parseInt(matchId) : null;

  // 모든 선수 목록 로드
  const loadAllPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('players')
        .select('id, name, position')
        .order('name');

      if (error) {
        throw error;
      }

      setAllPlayers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '선수 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 경기 정보 로드
  const loadMatchInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchIdNum)
        .single();

      if (error) {
        console.error('경기 정보 로드 에러:', error);
        return;
      }

      setMatchInfo(data);
    } catch (error) {
      console.error('경기 정보 로드 에러:', error);
    }
  };

  // 기존 출석 데이터 로드
  const loadExistingAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('match_attendance')
        .select('player_id, status')
        .eq('match_id', matchIdNum)
        .eq('match_number', 1);

      if (error) {
        console.error('기존 출석 데이터 로드 에러:', error);
        return;
      }

      if (data && data.length > 0) {
        const attendingSet = new Set<string>();
        data.forEach(record => {
          // status가 'attending'인 경우만 출석으로 간주
          if (record.status === 'attending') {
            attendingSet.add(record.player_id);
          }
        });
        setAttendingPlayers(attendingSet);
      }
    } catch (error) {
      console.error('기존 출석 데이터 로드 에러:', error);
    }
  };

  // 출석 데이터 저장
  const saveAttendance = async () => {
    if (attendingPlayers.size === 0) {
      throw new Error('최소 한 명 이상의 선수를 선택해주세요.');
    }

    setSaving(true);
    try {
      // 기존 출석 데이터 조회 (포지션 정보 보존을 위해)
      const { data: existingData, error: fetchError } = await supabase
        .from('match_attendance')
        .select('*')
        .eq('match_id', matchIdNum)
        .eq('match_number', 1);

      if (fetchError) {
        console.error('기존 출석 데이터 조회 에러:', fetchError);
        throw new Error('기존 출석 데이터 조회에 실패했습니다.');
      }

      // 기존 데이터를 맵으로 변환 (player_id를 키로)
      const existingDataMap = new Map();
      existingData?.forEach(record => {
        existingDataMap.set(record.player_id, record);
      });

      // 출석한 사람만 새로운 출석 데이터 준비 (기존 포지션 정보 보존)
      const attendanceRecords = Array.from(attendingPlayers).map(playerId => {
        const existingRecord = existingDataMap.get(playerId);
        return {
          player_id: playerId,
          match_id: matchIdNum,
          match_number: 1,
          status: 'attending',
          goals: existingRecord?.goals || 0,
          assists: existingRecord?.assists || 0,
          substitutions: existingRecord?.substitutions || 0,
          is_substituted: existingRecord?.is_substituted || false,
          tactics_position_x: existingRecord?.tactics_position_x || null,
          tactics_position_y: existingRecord?.tactics_position_y || null,
          tactics_team: existingRecord?.tactics_team || null,
          goal_timestamp: existingRecord?.goal_timestamp || null,
          assist_timestamp: existingRecord?.assist_timestamp || null
        };
      });

      // 기존 출석 데이터 삭제
      const { error: deleteError } = await supabase
        .from('match_attendance')
        .delete()
        .eq('match_id', matchIdNum)
        .eq('match_number', 1);

      if (deleteError) {
        console.error('기존 출석 데이터 삭제 에러:', deleteError);
        throw new Error('기존 출석 데이터 삭제에 실패했습니다.');
      }

      // 새로운 출석 데이터 삽입
      const { error: insertError } = await supabase
        .from('match_attendance')
        .insert(attendanceRecords);

      if (insertError) {
        console.error('출석 데이터 저장 에러:', insertError);
        throw new Error('출석 데이터 저장에 실패했습니다.');
      }

      return { success: true, attendingCount: attendingPlayers.size };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '출석 데이터 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // 선수 출석 상태 토글
  const togglePlayerAttendance = (playerId: string) => {
    setAttendingPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const toggleAllPlayers = (selectAll: boolean) => {
    if (selectAll) {
      setAttendingPlayers(new Set(allPlayers.map(player => player.id)));
    } else {
      setAttendingPlayers(new Set());
    }
  };

  useEffect(() => {
    if (matchIdNum) {
      loadAllPlayers();
      loadMatchInfo();
    }
  }, [matchIdNum]);

  useEffect(() => {
    if (matchIdNum && !loading) {
      loadExistingAttendance();
    }
  }, [matchIdNum, loading]);

  return {
    allPlayers,
    attendingPlayers,
    matchInfo,
    loading,
    saving,
    error,
    togglePlayerAttendance,
    toggleAllPlayers,
    saveAttendance
  };
}; 