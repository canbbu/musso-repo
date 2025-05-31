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
        
        // 기본 매치 데이터 가져오기
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .gte('date', today)
          .order('date');

        if (matchesError) throw matchesError;
        
        // 각 매치에 대한 참석 정보 가져오기
        const matchesWithAttendance = await Promise.all(
          (matchesData || []).map(async match => {
            // 참석 상태별 플레이어 정보 가져오기
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select(`
                status,
                player:players(id, name)
              `)
              .eq('match_id', match.id);
              
            if (attendanceError) throw attendanceError;
            
            // 참석 상태별 플레이어 분류
            const attending: Player[] = [];
            const notAttending: Player[] = [];
            const pending: Player[] = [];
            
            attendanceData?.forEach(item => {
              const player = item.player as Player;
              
              if (item.status === 'attending') {
                attending.push(player);
              } else if (item.status === 'not_attending') {
                notAttending.push(player);
              } else if (item.status === 'pending') {
                pending.push(player);
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
        fetchMatches
      )
      .subscribe();
    
    const attendanceSubscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'match_attendance' }, 
        fetchMatches
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
        
      if (checkError) throw checkError;
      
      if (existingData) {
        // 기존 참석 정보 업데이트
        const { error: updateError } = await supabase
          .from('match_attendance')
          .update({ status })
          .eq('id', existingData.id);
          
        if (updateError) throw updateError;
      } else {
        // 새 참석 정보 추가
        const { error: insertError } = await supabase
          .from('match_attendance')
          .insert({
            match_id: matchId,
            player_id: playerId,
            status
          });
          
        if (insertError) throw insertError;
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