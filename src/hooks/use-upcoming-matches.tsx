// src/hooks/use-upcoming-matches.tsx
import { useState, useEffect } from 'react';
import { UpcomingMatch, Player } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';

export function useUpcomingMatches() {
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        
        // 모든 매치 데이터 가져오기 (날짜 제한 없음)
        const { data: allMatches, error: allMatchesError } = await supabase
          .from('matches')
          .select('*')
          .order('date', { ascending: false }); // 최신 순으로 정렬

        if (allMatchesError) {
          console.error('[DB 오류] 매치 조회 실패:', allMatchesError);
          throw allMatchesError;
        }

        // 각 매치에 대한 참석 정보 가져오기
        const matchesWithAttendance = await Promise.all(
          (allMatches || []).map(async match => {
            try {
              // 날짜 파싱
              const matchDate = new Date(match.date);
              if (isNaN(matchDate.getTime())) {
                console.error(`[날짜 오류] 유효하지 않은 날짜 형식: ${match.date}`);
                return null;
              }

              // 참석 상태별 플레이어 정보 가져오기
              const { data: attendanceData, error: attendanceError } = await supabase
                .from('match_attendance')
                .select(`
                  status,
                  player:players(id, name)
                `)
                .eq('match_id', match.id);
                
              if (attendanceError) {
                console.error(`[DB 오류] 매치 ID ${match.id}에 대한 참석 정보 조회 실패:`, attendanceError);
                throw attendanceError;
              }

              // 참석 상태별 플레이어 분류
              const attending: Player[] = [];
              const notAttending: Player[] = [];
              const pending: Player[] = [];
              
              attendanceData?.forEach(item => {
                const player = Array.isArray(item.player) ? item.player[0] as Player : item.player as Player;
                if (item.status === 'attending') {
                  attending.push(player);
                } else if (item.status === 'not_attending') {
                  notAttending.push(player);
                } else {
                  pending.push(player);
                }
              });

              // 날짜 포맷팅
              const formattedDate = matchDate.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
              
              // UpcomingMatch 형식으로 변환
              const upcomingMatch: UpcomingMatch = {
                id: match.id,
                date: formattedDate,
                location: match.location,
                opponent: match.opponent,
                status: match.status as 'upcoming' | 'cancelled',
                attending: attending.length,
                notAttending: notAttending.length,
                pending: pending.length,
                attendingPlayers: attending,
                notAttendingPlayers: notAttending,
                pendingPlayers: pending,
                isPast: new Date() > matchDate // 과거 이벤트 여부 추가
              };
              
              return upcomingMatch;
            } catch (err) {
              console.error(`[매치 처리 오류] 매치 ID ${match.id}:`, err);
              return null;
            }
          })
        );
        
        // null 값 필터링 및 유효한 매치만 설정
        const validMatches = matchesWithAttendance.filter((match): match is UpcomingMatch => match !== null);
        setUpcomingMatches(validMatches);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '이벤트 정보를 불러오는 중 오류가 발생했습니다');
        console.error('이벤트 정보를 불러오는 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
    
    // 실시간 업데이트를 위한 구독 설정
    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches' }, 
        () => {
          fetchMatches();
        }
      )
      .subscribe();
    
    const attendanceSubscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'match_attendance' }, 
        () => {
          fetchMatches();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(matchesSubscription);
      supabase.removeChannel(attendanceSubscription);
    };
  }, []);

  // 참석 상태 업데이트 함수
  const updateAttendance = async (matchId: number, playerId: string, status: 'attending' | 'not_attending' | 'pending') => {
    try {
      // 기존 참석 정보 확인
      const { data: existingData, error: checkError } = await supabase
        .from('match_attendance')
        .select('*')
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .maybeSingle();
        
      if (checkError) {
        console.error('[DB 오류] 기존 참석 정보 확인 실패:', checkError);
        throw checkError;
      }
      
      if (existingData) {
        // 기존 참석 정보 업데이트
        const { error: updateError } = await supabase
          .from('match_attendance')
          .update({ status })
          .eq('id', existingData.id);
          
        if (updateError) {
          console.error('[DB 오류] 참석 정보 업데이트 실패:', updateError);
          throw updateError;
        }
      } else {
        // 새 참석 정보 추가
        const { error: insertError } = await supabase
          .from('match_attendance')
          .insert({
            match_id: matchId,
            player_id: playerId,
            status
          });
          
        if (insertError) {
          console.error('[DB 오류] 새 참석 정보 추가 실패:', insertError);
          throw insertError;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '참석 상태를 업데이트하는 중 오류가 발생했습니다');
      throw err;
    }
  };

  return { 
    upcomingMatches, 
    loading, 
    error,
    updateAttendance 
  };
}