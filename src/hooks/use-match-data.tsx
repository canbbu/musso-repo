import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface Attendance {
  attending: number;
  notAttending: number;
  pending: number;
}

export interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendance: Attendance;
  userResponse?: 'attending' | 'notAttending' | 'pending' | null;
  score?: string;
  result?: 'win' | 'loss' | 'draw';
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  notes?: string;
  mvp?: string;
  review?: string;
  time?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

interface MatchFormData {
  date: string;
  location: string;
  opponent: string;
  status: string;
  time?: string;
}

export function useMatchData() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  const refreshMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. 이벤트 목록 가져오기
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: true });

      if (matchesError) throw matchesError;
      
      
      if (!matchesData) {
        setMatches([]);
        return;
      }

      // 2. 각 이벤트에 대한 출석 정보 가져오기
      const matchesWithAttendance = await Promise.all(
        matchesData.map(async (match) => {
          // 출석 정보 가져오기
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('match_attendance')
            .select('player_id, status')
            .eq('match_id', match.id);

          if (attendanceError) throw attendanceError;
          

          // 출석 상태별 카운트
          const attendance = {
            attending: 0,
            notAttending: 0,
            pending: 0
          };
          
          // 사용자 본인의 응답 상태
          let userResponse: 'attending' | 'notAttending' | 'pending' | undefined = undefined;

          attendanceData?.forEach(item => {
            // 출석 상태에 따라 카운트 증가
            if (item.status === 'attending') {
              attendance.attending++;
            } else if (item.status === 'not_attending') {
              attendance.notAttending++;
            } else {
              attendance.pending++;
            }
            
            // 현재 사용자의 응답 확인
            if (userId && item.player_id === userId) {
              if (item.status === 'attending') {
                userResponse = 'attending';
              } else if (item.status === 'not_attending') {
                userResponse = 'notAttending';
              } else {
                userResponse = 'pending';
              }
            }
          });

          // 이벤트 상태 처리 (날짜 기준으로 완료/예정 구분)
          const matchDate = new Date(match.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시간으로 설정
          
          // 기본 상태는 DB에 저장된 상태 사용
          let status = match.status as Match['status'];
          
          // cancelled 상태가 아니면서, 날짜가 지난 경우에만 'completed'로 변경
          // cancelled 상태는 날짜와 관계없이 유지
          if (status !== 'cancelled' && matchDate < today) {
            status = 'completed';
          } else if (status !== 'cancelled' && matchDate >= today) {
            // cancelled가 아니고 미래 날짜면 upcoming으로 설정
            status = 'upcoming';
          }
          // cancelled 상태는 그대로 유지
          return {
            id: match.id,
            date: match.date,
            location: match.location,
            opponent: match.opponent,
            status,
            time: match.time,
            attendance,
            userResponse,
            created_by: match.created_by,
            updated_by: match.updated_by,
            deleted_by: match.deleted_by,
          };
        })
      );

      // 날짜 기준으로 정렬 (과거 이벤트는 내림차순, 미래 이벤트는 오름차순)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pastMatches = matchesWithAttendance
        .filter(match => new Date(match.date) < today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
      const futureMatches = matchesWithAttendance
        .filter(match => new Date(match.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
      setMatches([...futureMatches, ...pastMatches]);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : '이벤트 정보를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMatches();

    // 실시간 업데이트 구독
    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        refreshMatches();
      })
      .subscribe();

    const attendanceSubscription = supabase
      .channel('match_attendance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_attendance' }, (payload) => {
        refreshMatches();
      })
      .subscribe();

    return () => {
      matchesSubscription.unsubscribe();
      attendanceSubscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // userId 의존성 제거, 컴포넌트 마운트 시에만 실행되도록 수정

  const handleAttendanceChange = async (matchId: number, status: string, userId: string) => {
    try {
      setError(null);
      
      if (!matchId || !userId) {
        console.error('매치 ID 또는 사용자 ID가 없습니다', { matchId, userId });
        setError('출석 상태를 변경하는데 필요한 정보가 부족합니다');
        return;
      }

      
      // 먼저 기존 응답이 있는지 확인
      const { data: existingResponse, error: fetchError } = await supabase
        .from('match_attendance')
        .select('id, status')
        .eq('match_id', matchId)
        .eq('player_id', userId)
        .maybeSingle();
        
      if (fetchError) {
        console.error('[DB 오류] 기존 응답 확인 실패:', fetchError);
        setError(fetchError.message || '출석 상태를 확인하는 중 오류가 발생했습니다');
        return;
      }

      // 응답 상태를 supabase 형식으로 변환
      const statusValue = status === 'notAttending' ? 'not_attending' : status;

      if (existingResponse) {
        // 기존 응답이 있으면 업데이트
        const { error: updateError } = await supabase
          .from('match_attendance')
          .update({ status: statusValue })
          .eq('id', existingResponse.id);

        if (updateError) {
          console.error('출석 상태 업데이트 오류:', updateError);
          setError(updateError.message || '출석 상태를 업데이트하는 중 오류가 발생했습니다');
          return;
        }
      } else {
        // 없으면 새로 생성
        const { error: insertError } = await supabase
          .from('match_attendance')
          .insert({
            match_id: matchId,
            player_id: userId,
            status: statusValue
          });

        if (insertError) {
          console.error('출석 상태 생성 오류:', insertError);
          setError(insertError.message || '출석 상태를 생성하는 중 오류가 발생했습니다');
          return;
        }
      }

      // 상태 새로고침
      refreshMatches();
    } catch (err) {
      console.error('출석 상태 변경 중 예외 발생:', err);
      setError(err instanceof Error ? err.message : '출석 상태를 변경하는 중 알 수 없는 오류가 발생했습니다');
    }
  };

  // 날짜 형식 정규화 (데이터베이스용)
  const normalizeDate = (dateString: string): string => {
    try {
      // 다양한 형식의 날짜 문자열 처리
      if (!dateString) return '';
      
      // 이미 YYYY-MM-DD 형식이면 그대로 반환
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // T가 포함된 ISO 형식이거나 다른 형식이면 처리
      const parts = dateString.split('T')[0].split(' ')[0];
      
      return parts;
    } catch (err) {
      console.error('[날짜 정규화] 오류:', err, '원본:', dateString);
      // 오류 발생 시 원본 반환 (데이터베이스에서 처리 실패할 수 있음)
      return dateString;
    }
  };

  // 이벤트 상태 값을 데이터베이스가 허용하는 값으로 변환
  const normalizeStatus = (status: string): string => {
    // 허용되는 상태: upcoming, completed, cancelled
    if (['upcoming', 'completed', 'cancelled'].includes(status)) {
      return status; // 허용된 상태는 그대로 유지
    }
    // 허용되지 않는 상태는 기본값 'upcoming'으로 설정
    return 'upcoming';
  };

  const createMatch = async (matchData: MatchFormData, created_by: string) => {
    try {
      
      
      // 날짜 및 상태 정규화
      const formattedDate = normalizeDate(matchData.date);
      const formattedStatus = normalizeStatus(matchData.status);

      
      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            date: formattedDate,
            location: matchData.location,
            opponent: matchData.opponent,
            status: formattedStatus,
            created_by: created_by,
          }
        ])
        .select();

      if (error) {
        console.error('[DB 오류] 이벤트 생성 실패:', error);
        throw error;
      }
      
      
      // 상태 새로고침
      refreshMatches();
      return data;
    } catch (err) {
      console.error('이벤트 생성 중 예외 발생:', err);
      setError(err instanceof Error ? err.message : '이벤트를 생성하는 중 알 수 없는 오류가 발생했습니다');
      throw err;
    }
  };

  const updateMatch = async (matchId: number, matchData: MatchFormData, updated_by: string) => {
    try {
      
      // 날짜 및 상태 정규화
      const formattedDate = normalizeDate(matchData.date);
      const formattedStatus = normalizeStatus(matchData.status);
      
      const { data, error } = await supabase
        .from('matches')
        .update({
          date: formattedDate,
          location: matchData.location,
          opponent: matchData.opponent,
          status: formattedStatus,
          time: matchData.time,
          updated_by: updated_by
        })
        .eq('id', matchId)
        .select();

      if (error) {
        console.error('[DB 오류] 이벤트 업데이트 실패:', error);
        throw error;
      }
      
      
      
      // 상태 새로고침
      refreshMatches();
    } catch (err) {
      console.error('이벤트 업데이트 중 예외 발생:', err);
      setError(err instanceof Error ? err.message : '이벤트를 수정하는 중 알 수 없는 오류가 발생했습니다');
      throw err;
    }
  };

  const deleteMatch = async (matchId: number) => {
    try {
      
      
      // 먼저 이 이벤트에 대한 모든 출석 정보 삭제
      const { error: attendanceError } = await supabase
        .from('match_attendance')
        .delete()
        .eq('match_id', matchId);

      if (attendanceError) {
        console.error('[DB 오류] 이벤트 관련 출석 정보 삭제 실패:', attendanceError);
        throw attendanceError;
      }
      
      

      // 이제 이벤트 자체 삭제
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (matchError) {
        console.error('[DB 오류] 이벤트 삭제 실패:', matchError);
        throw matchError;
      }
      
      
      // 상태 새로고침
      refreshMatches();
    } catch (err) {
      console.error('이벤트 삭제 중 예외 발생:', err);
      setError(err instanceof Error ? err.message : '이벤트를 삭제하는 중 알 수 없는 오류가 발생했습니다');
      throw err;
    }
  };

  // 오늘 이벤트 확인
  const checkForTodaysMatch = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTodaysMatch = matches.find(match => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() === today.getTime() && match.status === 'completed';
    });
    
    if (completedTodaysMatch) {
      setSelectedMatchId(completedTodaysMatch.id);
    }
    
    return completedTodaysMatch;
  };
  
  // 오늘 이벤트 자동 확인
  useEffect(() => {
    if (matches.length > 0) {
    checkForTodaysMatch();
    }
  }, [matches]);

  // 현재 연도 이벤트 수
  const currentYearMatches = matches.filter(
    match => new Date(match.date).getFullYear() === new Date().getFullYear()
  ).length;
  
  return {
    matches,
    loading,
    selectedMatchId,
    setSelectedMatchId,
    handleAttendanceChange,
    createMatch,
    updateMatch,
    deleteMatch,
    currentYearMatches,
    checkForTodaysMatch,
    refreshMatches,
    error
  };
}
