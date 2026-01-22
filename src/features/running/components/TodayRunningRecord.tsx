import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Activity } from 'lucide-react';
import { getRunningRecordByDate } from '@/features/running/api/running.api';
import { RunningRecord } from '@/features/running/types/running.types';
import { useAuth } from '@/features/auth/hooks/use-auth';

const TodayRunningRecord: React.FC = () => {
  const { userId } = useAuth();
  const [record, setRecord] = useState<RunningRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // 오늘 날짜 가져오기 (YYYY-MM-DD 형식)
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // 당일이 끝나기 전인지 확인
  const isToday = (): boolean => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return now >= today && now < tomorrow;
  };

  useEffect(() => {
    const fetchTodayRecord = async () => {
      if (!userId || !isToday()) {
        setRecord(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const todayRecord = await getRunningRecordByDate(userId, todayDate);
        setRecord(todayRecord);
      } catch (error) {
        console.error('오늘의 런닝 기록 불러오기 실패:', error);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayRecord();

    // 1분마다 체크 (자정이 지났는지 확인)
    const interval = setInterval(() => {
      if (!isToday()) {
        setRecord(null);
      } else {
        fetchTodayRecord();
      }
    }, 60000); // 1분

    return () => clearInterval(interval);
  }, [userId, todayDate]);

  if (!isToday() || !userId) {
    return null; // 당일이 아니거나 로그인하지 않았으면 표시하지 않음
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!record) {
    return null; // 기록이 없으면 표시하지 않음
  }

  // duration을 분:초 형식으로 변환
  const formatDuration = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}분 ${seconds}초`;
  };

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-green-600" />
          오늘의 런닝 기록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">거리</p>
            <p className="text-xl font-bold text-green-700">{record.distance}km</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">시간</p>
            <p className="text-xl font-bold text-green-700">{formatDuration(record.duration)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">페이스</p>
            <p className="text-xl font-bold text-green-700">
              {record.pace ? `${record.pace} 분/km` : '-'}
            </p>
          </div>
        </div>
        {record.notes && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-gray-600">메모</p>
            <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayRunningRecord;
