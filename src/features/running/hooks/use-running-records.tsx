import { useState, useEffect } from 'react';
import { getRunningRecordsByPlayer } from '@/features/running/api/running.api';
import { RunningRecord } from '@/features/running/types/running.types';

export function useRunningRecords(playerId: string | null, year?: number) {
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!playerId) {
        setRecords([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getRunningRecordsByPlayer(playerId, year);
        setRecords(data);
      } catch (err) {
        console.error('런닝 기록 로드 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [playerId, year]);

  return { records, loading, error };
}
