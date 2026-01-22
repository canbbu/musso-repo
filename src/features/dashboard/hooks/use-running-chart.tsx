import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

export interface MonthlyRunningData {
  month: string;
  monthNumber: number;
  year: number;
  totalDistance: number; // 전체 회원의 총 거리 (km)
  totalDuration: number; // 전체 회원의 총 시간 (분)
  averagePace: number; // 평균 페이스 (분/km)
}

export interface UseRunningChartProps {
  year: number;
  month?: number; // undefined면 해당 년도의 전체 월
}

export function useRunningChart({ year, month }: UseRunningChartProps) {
  const [data, setData] = useState<MonthlyRunningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRunningData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 해당 년도의 시작일과 종료일
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // 런닝 기록 가져오기
        let runningQuery = supabase
          .from('running_records')
          .select('date, distance, duration, pace')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        const { data: runningRecords, error: runningError } = await runningQuery;

        if (runningError) throw runningError;
        if (!runningRecords || runningRecords.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        // 월별로 그룹화
        const monthlyData: Record<string, {
          month: string;
          monthNumber: number;
          year: number;
          records: Array<{ distance: number; duration: number; pace?: number }>;
        }> = {};

        runningRecords.forEach((record) => {
          const recordDate = new Date(record.date);
          const recordYear = recordDate.getFullYear();
          const recordMonth = recordDate.getMonth() + 1;
          const monthKey = `${recordYear}-${recordMonth.toString().padStart(2, '0')}`;

          // 월 필터가 있으면 해당 월만 포함
          if (month && recordMonth !== month) {
            return;
          }

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: `${recordMonth}월`,
              monthNumber: recordMonth,
              year: recordYear,
              records: [],
            };
          }
          monthlyData[monthKey].records.push({
            distance: record.distance,
            duration: record.duration,
            pace: record.pace || undefined,
          });
        });

        // 각 월별 통계 계산
        const chartData = Object.values(monthlyData).map((monthInfo) => {
          const totalDistance = monthInfo.records.reduce((sum, r) => sum + r.distance, 0);
          const totalDuration = monthInfo.records.reduce((sum, r) => sum + r.duration, 0);
          
          // 평균 페이스 계산: 총 시간 / 총 거리
          const averagePace = totalDistance > 0
            ? Math.round((totalDuration / totalDistance) * 100) / 100
            : 0;

          return {
            month: monthInfo.month,
            monthNumber: monthInfo.monthNumber,
            year: monthInfo.year,
            totalDistance: Math.round(totalDistance * 100) / 100, // 소수점 2자리
            totalDuration,
            averagePace,
          };
        });

        // 월 순서대로 정렬
        chartData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthNumber - b.monthNumber;
        });

        setData(chartData);
      } catch (err) {
        console.error('런닝 데이터 로드 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchRunningData();
  }, [year, month]);

  return { data, loading, error };
}
