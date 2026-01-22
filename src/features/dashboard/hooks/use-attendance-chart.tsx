import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

export interface DailyAttendanceData {
  date: string; // YYYY-MM-DD 형식
  dateLabel: string; // 표시용 날짜 레이블 (예: "1/15")
  attendanceCount: number; // 해당 날짜의 출석 인원수
  matchCount: number; // 해당 날짜의 경기 수
}

export interface UseAttendanceChartProps {
  year: number;
  month?: number; // undefined면 해당 년도의 전체 월
}

export function useAttendanceChart({ year, month }: UseAttendanceChartProps) {
  const [data, setData] = useState<DailyAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 해당 년도의 완료된 경기 가져오기
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        let matchesQuery = supabase
          .from('matches')
          .select('id, date')
          .eq('status', 'completed')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        const { data: matches, error: matchesError } = await matchesQuery;

        if (matchesError) throw matchesError;
        if (!matches || matches.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        // 날짜별로 그룹화
        const dailyData: Record<string, {
          date: string;
          matchIds: number[];
        }> = {};

        matches.forEach((match) => {
          const matchDate = new Date(match.date);
          const matchYear = matchDate.getFullYear();
          const matchMonth = matchDate.getMonth() + 1;
          const dateStr = match.date; // YYYY-MM-DD 형식

          // 월 필터가 있으면 해당 월만 포함
          if (month && matchMonth !== month) {
            return;
          }

          if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
              date: dateStr,
              matchIds: [],
            };
          }
          dailyData[dateStr].matchIds.push(match.id);
        });

        // 각 날짜별 출석 인원수 계산
        const attendanceData = await Promise.all(
          Object.values(dailyData).map(async (dayInfo) => {
            const matchIds = dayInfo.matchIds;
            const matchCount = matchIds.length;

            if (matchCount === 0) {
              const dateObj = new Date(dayInfo.date);
              return {
                date: dayInfo.date,
                dateLabel: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
                attendanceCount: 0,
                matchCount: 0,
              };
            }

            // 해당 날짜의 모든 경기에서 출석한 선수들 가져오기
            // match_number를 포함해서 조회
            // player_id가 null이 아닌 경우만 조회 (상대팀 선수 제외)
            const { data: attendanceRecords, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('match_id, player_id, status, match_number')
              .in('match_id', matchIds)
              .eq('status', 'attending')
              .not('player_id', 'is', null) // player_id가 null이 아닌 경우만
              .order('match_number', { ascending: true }); // match_number = 1을 먼저 가져오기 위해 정렬

            if (attendanceError) throw attendanceError;

            // 디버깅: 원본 데이터 로그
            if (dayInfo.date === '2026-01-18') {
              console.log(`[${dayInfo.date}] 원본 출석 데이터:`, attendanceRecords);
              console.log(`[${dayInfo.date}] 경기 ID들:`, matchIds);
            }

            // 고유 선수 수 계산
            // 1단계: 같은 match_id와 player_id 조합이 여러 match_number에 있을 수 있으므로
            //        match_id와 player_id 조합으로 먼저 중복 제거 (match_number = 1 우선)
            const matchPlayerMap = new Map<string, number>(); // key: `${match_id}_${player_id}`, value: match_number
            
            attendanceRecords?.forEach(record => {
              // player_id가 null이거나 "null" 문자열인 경우 제외
              if (!record.player_id || record.player_id === 'null' || record.player_id === null) {
                return;
              }
              
              const key = `${record.match_id}_${record.player_id}`;
              // match_number가 1이거나 아직 없는 경우만 추가/업데이트
              if (!matchPlayerMap.has(key) || record.match_number === 1) {
                matchPlayerMap.set(key, record.match_number || 1);
              }
            });

            // 2단계: 같은 날짜에 여러 경기가 있을 수 있으므로, player_id만으로 최종 중복 제거
            const uniquePlayerIds = new Set<string>();
            matchPlayerMap.forEach((matchNumber, key) => {
              const playerId = key.split('_')[1]; // `${match_id}_${player_id}`에서 player_id 추출
              uniquePlayerIds.add(playerId);
            });

            // 디버깅: 중간 결과 로그
            if (dayInfo.date === '2026-01-18') {
              console.log(`[${dayInfo.date}] matchPlayerMap 크기:`, matchPlayerMap.size);
              console.log(`[${dayInfo.date}] matchPlayerMap 내용:`, Array.from(matchPlayerMap.entries()));
              console.log(`[${dayInfo.date}] uniquePlayerIds 크기:`, uniquePlayerIds.size);
              console.log(`[${dayInfo.date}] uniquePlayerIds 내용:`, Array.from(uniquePlayerIds));
              
              // 중복된 player_id 찾기
              const playerIdCounts = new Map<string, number>();
              matchPlayerMap.forEach((_, key) => {
                const playerId = key.split('_')[1];
                playerIdCounts.set(playerId, (playerIdCounts.get(playerId) || 0) + 1);
              });
              const duplicates = Array.from(playerIdCounts.entries()).filter(([_, count]) => count > 1);
              if (duplicates.length > 0) {
                console.log(`[${dayInfo.date}] ⚠️ 중복된 player_id 발견:`, duplicates);
              }
            }

            const attendanceCount = uniquePlayerIds.size;

            const dateObj = new Date(dayInfo.date);
            return {
              date: dayInfo.date,
              dateLabel: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
              attendanceCount,
              matchCount,
            };
          })
        );

        // 날짜 순서대로 정렬
        attendanceData.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setData(attendanceData);
      } catch (err) {
        console.error('출석 데이터 로드 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [year, month]);

  return { data, loading, error };
}
