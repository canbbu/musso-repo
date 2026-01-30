import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase/client';

export interface MonthlyRunningData {
  month: string;
  monthNumber: number;
  year: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
}

/** 차트에서 공통으로 쓰는 형태 (월별/주별 모두 periodLabel, totalDistance, averagePace 사용) */
export interface RunningChartDataItem {
  periodLabel: string;
  totalDistance: number;
  averagePace: number;
  /** 월별일 때만 (정렬용) */
  monthNumber?: number;
  year?: number;
  /** 주별일 때만 (정렬용) */
  weekStart?: string;
}

/** 해당 날짜가 속한 주의 월요일 (YYYY-MM-DD) 반환 */
function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0=일, 1=월, ...
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return monday.toISOString().slice(0, 10);
}

/** 주의 월요일 날짜로 라벨 생성 (예: "1/1~1/7") */
function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()}~${end.getMonth() + 1}/${end.getDate()}`;
}

export interface UseRunningChartProps {
  year: number;
  month?: number;
  /** 'month' = 월별, 'week' = 주별 */
  groupBy?: 'month' | 'week';
}

export function useRunningChart({ year, month, groupBy = 'month' }: UseRunningChartProps) {
  const [data, setData] = useState<RunningChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRunningData = async () => {
      try {
        setLoading(true);
        setError(null);

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

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

        if (groupBy === 'week') {
          // 주별 그룹화 (해당 년도 내 주만, 월 필터 무시)
          const weekData: Record<string, { records: Array<{ distance: number; duration: number }> }> = {};

          runningRecords.forEach((record) => {
            const recordDate = new Date(record.date);
            if (recordDate.getFullYear() !== year) return;
            const weekStart = getWeekStart(record.date);

            if (!weekData[weekStart]) {
              weekData[weekStart] = { records: [] };
            }
            weekData[weekStart].records.push({
              distance: record.distance,
              duration: record.duration,
            });
          });

          const chartData: RunningChartDataItem[] = Object.entries(weekData).map(([weekStart, info]) => {
            const totalDistance = info.records.reduce((sum, r) => sum + r.distance, 0);
            const totalDuration = info.records.reduce((sum, r) => sum + r.duration, 0);
            const averagePace = totalDistance > 0
              ? Math.round((totalDuration / totalDistance / 60) * 100) / 100
              : 0;
            return {
              periodLabel: formatWeekLabel(weekStart),
              totalDistance: Math.round(totalDistance * 100) / 100,
              averagePace,
              weekStart,
            };
          });

          chartData.sort((a, b) => (a.weekStart!).localeCompare(b.weekStart!));
          setData(chartData);
          setLoading(false);
          return;
        }

        // 월별 그룹화 (기존 로직)
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

          if (month && recordMonth !== month) return;

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

        const chartData: RunningChartDataItem[] = Object.values(monthlyData).map((monthInfo) => {
          const totalDistance = monthInfo.records.reduce((sum, r) => sum + r.distance, 0);
          const totalDuration = monthInfo.records.reduce((sum, r) => sum + r.duration, 0);
          const averagePace = totalDistance > 0
            ? Math.round((totalDuration / totalDistance / 60) * 100) / 100
            : 0;
          return {
            periodLabel: monthInfo.month,
            totalDistance: Math.round(totalDistance * 100) / 100,
            averagePace,
            monthNumber: monthInfo.monthNumber,
            year: monthInfo.year,
          };
        });

        chartData.sort((a, b) => {
          if (a.year !== b.year) return a.year! - b.year!;
          return a.monthNumber! - b.monthNumber!;
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
  }, [year, month, groupBy]);

  return { data, loading, error };
}
