import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { Match } from '../types/match.types';

interface MatchWithTactics extends Match {
  hasTactics?: boolean;
  tacticsCount?: number;
  /** 1경기 출석체크가 되어 있는지 (match_attendance에 match_number=1 행 존재) */
  hasAttendance?: boolean;
  /** 득점/어시스트 등 득실점 기록이 있는지 */
  hasGoalAssistRecord?: boolean;
}

export const useMatchTactics = () => {
  const [matches, setMatches] = useState<MatchWithTactics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 경기 목록과 작전판 존재 여부 로드
  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 경기 조회
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: false });

      if (matchesError) {
        throw matchesError;
      }

      // 각 경기에 대해 작전판 존재 여부, 출석체크 여부, 득실점 기록 여부 확인
      const matchesWithTactics = await Promise.all(
        (matchesData || []).map(async (match) => {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('match_attendance')
            .select('match_number, tactics_position_x, tactics_position_y, goals, assists')
            .eq('match_id', match.id);

          if (attendanceError) {
            console.error('Error fetching attendance for match:', match.id, attendanceError);
            return { ...match, hasTactics: false, tacticsCount: 0, hasAttendance: false, hasGoalAssistRecord: false };
          }

          const tacticsMatchNumbers = new Set<number>();
          let hasGoalAssistRecord = false;
          attendanceData?.forEach(record => {
            const hasPosition = record.tactics_position_x !== null && record.tactics_position_y !== null;
            const hasGoals = record.goals != null && record.goals > 0;
            const hasAssists = record.assists != null && record.assists > 0;
            if (hasGoals || hasAssists) hasGoalAssistRecord = true;
            if (hasPosition || hasGoals || hasAssists) tacticsMatchNumbers.add(record.match_number);
          });

          const hasAttendance = attendanceData?.some(r => r.match_number === 1) ?? false;

          return {
            ...match,
            hasTactics: tacticsMatchNumbers.size > 0 || hasAttendance,
            tacticsCount: Math.max(tacticsMatchNumbers.size, hasAttendance ? 1 : 0),
            hasAttendance,
            hasGoalAssistRecord
          };
        })
      );

      setMatches(matchesWithTactics);
    } catch (err) {
      setError(err instanceof Error ? err.message : '경기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 특정 경기의 작전판/출석 존재 여부 확인 (출석만 있어도 작전판 진입 가능)
  const checkTacticsExistence = async (matchId: number) => {
    try {
      const { data: attendanceData, error } = await supabase
        .from('match_attendance')
        .select('match_number, tactics_position_x, tactics_position_y, goals, assists')
        .eq('match_id', matchId);

      if (error) {
        console.error('Error checking tactics existence:', error);
        return false;
      }

      let hasExistingTactics = false;
      const hasAttendanceForMatch1 = attendanceData?.some(r => r.match_number === 1) ?? false;
      attendanceData?.forEach(record => {
        const hasPosition = record.tactics_position_x !== null && record.tactics_position_y !== null;
        const hasGoals = record.goals != null && record.goals > 0;
        const hasAssists = record.assists != null && record.assists > 0;
        if (hasPosition || hasGoals || hasAssists) hasExistingTactics = true;
      });

      return hasExistingTactics || hasAttendanceForMatch1;
    } catch (error) {
      console.error('Error checking tactics existence:', error);
      return false;
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    loadMatches,
    checkTacticsExistence
  };
}; 