import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { Match } from '../types/match.types';

interface MatchWithTactics extends Match {
  hasTactics?: boolean;
  tacticsCount?: number;
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

      // 각 경기에 대해 작전판 존재 여부 확인 (match_attendance 테이블에서 포지션 정보 또는 득점 기록 확인)
      const matchesWithTactics = await Promise.all(
        (matchesData || []).map(async (match) => {
          // match_attendance 테이블에서 모든 데이터를 가져와서 필터링
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('match_attendance')
            .select('match_number, tactics_position_x, tactics_position_y, goals, assists')
            .eq('match_id', match.id);

          if (attendanceError) {
            console.error('Error fetching attendance for match:', match.id, attendanceError);
            return { ...match, hasTactics: false, tacticsCount: 0 };
          }

          // 포지션 정보가 있거나 득점 기록이 있는 경기 번호만 필터링
          const tacticsMatchNumbers = new Set();
          attendanceData?.forEach(record => {
            const hasPosition = record.tactics_position_x !== null && record.tactics_position_y !== null;
            const hasGoals = record.goals && record.goals > 0;
            const hasAssists = record.assists && record.assists > 0;
            
            if (hasPosition || hasGoals || hasAssists) {
              tacticsMatchNumbers.add(record.match_number);
            }
          });

          return {
            ...match,
            hasTactics: tacticsMatchNumbers.size > 0,
            tacticsCount: tacticsMatchNumbers.size
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

  // 특정 경기의 작전판 존재 여부 확인
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

      // 포지션 정보가 있거나 득점 기록이 있는지 확인
      let hasExistingTactics = false;
      attendanceData?.forEach(record => {
        const hasPosition = record.tactics_position_x !== null && record.tactics_position_y !== null;
        const hasGoals = record.goals && record.goals > 0;
        const hasAssists = record.assists && record.assists > 0;
        
        if (hasPosition || hasGoals || hasAssists) {
          hasExistingTactics = true;
        }
      });

      return hasExistingTactics;
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