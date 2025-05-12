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
        
        // 오늘 이후의 이벤트만 가져오기
        const today = new Date().toISOString().split('T')[0];
        
        console.log('[DB 요청] 오늘 이후 매치 조회:', today);
        
        // 기본 매치 데이터 가져오기
        const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          match_attendance (
            id,
            match_id,
            player_id,
            status
          )
        `)
        .gte('date', today)
        .order('date');

        if (matchesError) {
          console.error('[DB 오류] 매치 조회 실패:', matchesError);
          throw matchesError;
        }
        
        console.log('[DB 응답] 매치 조회 결과:', matchesData);
        
        // 각 매치에 대한 참석 정보 가져오기
        const matchesWithAttendance = await Promise.all(
          (matchesData || []).map(async match => {
            console.log(`[DB 요청] 매치 ID ${match.id}에 대한 참석 정보 조회`);
            
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
            
            console.log(`[DB 응답] 매치 ID ${match.id}에 대한 참석 정보:`, attendanceData);
            
            // 참석 상태별 플레이어 분류
            const attending: Player[] = [];
            const notAttending: Player[] = [];
            const pending: Player[] = [];
            
            attendanceData?.forEach(item => {
              const player = Array.isArray(item.player) ? item.player[0] as Player : item.player as Player;
            
              if (item.status === 'attending') {
                attending.push(player);
                console.log('attending에 추가:', player);
              } else if (item.status === 'not_attending') {
                notAttending.push(player);
                console.log('notAttending에 추가:', player);
              }
            });
            
            // UpcomingMatch 형식으로 변환
            const upcomingMatch: UpcomingMatch = {
              id: match.id,
              date: new Date(match.date).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(/\. /g, '-').replace(/\./, ''),
              location: match.location,
              opponent: match.opponent,
              status: match.status as 'upcoming' | 'cancelled',
              attending: attending.length,
              notAttending: notAttending.length,
              pending: pending.length,
              attendingPlayers: attending,
              notAttendingPlayers: notAttending,
              pendingPlayers: pending
            };
            
            return upcomingMatch;
          })
        );
        
        setUpcomingMatches(matchesWithAttendance);
      } catch (err) {
        setError(err instanceof Error ? err.message : '이벤트 정보를 불러오는 중 오류가 발생했습니다');
        console.error('이벤트 정보를 불러오는 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
    
    // 실시간 업데이트를 위한 구독 설정 (선택 사항)
    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches' }, 
        (payload) => {
          console.log('[DB 실시간] matches 테이블 변경 감지:', payload);
          fetchMatches();
        }
      )
      .subscribe();
    
    const attendanceSubscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'match_attendance' }, 
        (payload) => {
          console.log('[DB 실시간] match_attendance 테이블 변경 감지:', payload);
          fetchMatches();
        }
      )
      .subscribe();
    
    return () => {
      console.log('[DB 채널] matches_changes 채널 제거 시도');
      supabase.removeChannel(matchesSubscription);
      console.log('[DB 채널] attendance_changes 채널 제거 시도');
      supabase.removeChannel(attendanceSubscription);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행되도록 수정

  // 참석 상태 업데이트 함수
  const updateAttendance = async (matchId: number, playerId: string, status: 'attending' | 'not_attending' | 'pending') => {
    try {
      console.log('[DB 요청] 참석 상태 업데이트 매개변수:', { matchId, playerId, status });
      
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
      
      console.log('[DB 응답] 기존 참석 정보 확인 결과:', existingData);
      
      if (existingData) {
        console.log('[DB 요청] 기존 참석 정보 업데이트:', { id: existingData.id, status });
        
        // 기존 참석 정보 업데이트
        const { error: updateError } = await supabase
          .from('match_attendance')
          .update({ status })
          .eq('id', existingData.id);
          
        if (updateError) {
          console.error('[DB 오류] 참석 정보 업데이트 실패:', updateError);
          throw updateError;
        }
        
        console.log('[DB 응답] 참석 정보 업데이트 성공');
      } else {
        console.log('[DB 요청] 새 참석 정보 추가:', { match_id: matchId, player_id: playerId, status });
        
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
        
        console.log('[DB 응답] 새 참석 정보 추가 성공');
      }
      
      // 실시간 업데이트로 상태가 자동으로 갱신되므로 별도의 상태 업데이트는 필요 없음
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