// src/features/matches/hooks/use-upcoming-matches.tsx
import { useState, useEffect } from 'react';
import { UpcomingMatch, Player } from '@/types/dashboard';
import { supabase } from '@/shared/lib/supabase/client';

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
              // player_id가 null인 경우(상대팀 등)를 대비해 필터링
              const { data: attendanceData, error: attendanceError } = await supabase
                .from('match_attendance')
                .select(`
                  status,
                  player_id,
                  player:players(id, name)
                `)
                .eq('match_id', match.id)
                .not('player_id', 'is', null); // player_id가 null이 아닌 경우만 조회
                
              if (attendanceError) {
                console.error(`[DB 오류] 매치 ID ${match.id}에 대한 참석 정보 조회 실패:`, attendanceError);
                // 오류가 발생해도 빈 배열로 처리하여 계속 진행
                const emptyAttendanceData: any[] = [];
                return null; // 이 매치는 건너뛰기
              }

              

              // 참석 상태별 플레이어 분류
              const attending: Player[] = [];
              const notAttending: Player[] = [];
              const pending: Player[] = [];
              
              // player_id 기준으로 상태를 통합하기 위한 맵
              type StatusType = 'attending' | 'not_attending' | 'pending';
              const playerStatusMap = new Map<string, { status: StatusType; player: Player }>();
              
              attendanceData?.forEach(item => {
                // player가 null이거나 undefined인 경우 건너뛰기
                if (!item.player) {
                  console.warn(`[경고] 매치 ID ${match.id}: player 정보가 없습니다.`);
                  return;
                }
                
                const player = Array.isArray(item.player) ? (item.player[0] as Player) : (item.player as Player);
                
                // player 객체가 유효한지 확인
                if (!player || !player.id) {
                  console.warn(`[경고] 매치 ID ${match.id}: 유효하지 않은 player 객체입니다.`, player);
                  return;
                }
                
                const playerId = player.id;
                const newStatus = (item.status as StatusType) || 'pending';
                const existing = playerStatusMap.get(playerId);
                
                if (!existing) {
                  playerStatusMap.set(playerId, { status: newStatus, player });
                } else {
                  // 상태 우선순위: attending > not_attending > pending
                  const priority = (s: StatusType) => (s === 'attending' ? 3 : s === 'not_attending' ? 2 : 1);
                  if (priority(newStatus) > priority(existing.status)) {
                    playerStatusMap.set(playerId, { status: newStatus, player });
                  }
                }
              });
              
              // 통합된 상태 맵을 기반으로 최종 배열 구성
              playerStatusMap.forEach(({ status, player }) => {
                if (status === 'attending') {
                  attending.push(player);
                } else if (status === 'not_attending') {
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
        console.error('[ERROR] 이벤트 정보를 불러오는 중 오류 발생:', err);
        setError(err instanceof Error ? err.message : '이벤트 정보를 불러오는 중 오류가 발생했습니다');
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