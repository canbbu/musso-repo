import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { createRunningRecord, getRunningRecordByDate, updateRunningRecord } from '@/features/running/api/running.api';
import { RunningRecord } from '@/features/running/types/running.types';
import { Activity, Save, Edit } from 'lucide-react';

interface RunningRecordFormProps {
  matchDate: string; // YYYY-MM-DD 형식
  playerId: string;
  onSuccess?: () => void;
}

const RunningRecordForm: React.FC<RunningRecordFormProps> = ({
  matchDate,
  playerId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [existingRecord, setExistingRecord] = useState<RunningRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 날짜에서 YYYY-MM-DD 부분만 추출
  const extractDate = (dateString: string): string => {
    if (!dateString) return '';
    const match = dateString.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : dateString.substring(0, 10);
  };

  const cleanDate = extractDate(matchDate);

  // 기존 기록 불러오기
  useEffect(() => {
    const fetchExistingRecord = async () => {
      try {
        const record = await getRunningRecordByDate(playerId, cleanDate);
        if (record) {
          setExistingRecord(record);
          setDistance(record.distance.toString());
          setDuration(record.duration.toString());
          setNotes(record.notes || '');
          setIsEditing(true);
        }
      } catch (error) {
        console.error('기존 기록 불러오기 실패:', error);
      }
    };

    if (playerId && cleanDate) {
      fetchExistingRecord();
    }
  }, [playerId, cleanDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!distance || !duration) {
      toast({
        title: '입력 오류',
        description: '거리와 시간을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const distanceNum = parseFloat(distance);
    const durationNum = parseInt(duration);

    if (distanceNum <= 0 || durationNum <= 0) {
      toast({
        title: '입력 오류',
        description: '거리와 시간은 0보다 큰 값이어야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && existingRecord) {
        // 업데이트
        await updateRunningRecord(existingRecord.id, {
          date: cleanDate,
          distance: distanceNum,
          duration: durationNum,
          notes: notes || undefined,
        });
        toast({
          title: '성공',
          description: '런닝 기록이 수정되었습니다.',
        });
      } else {
        // 생성
        await createRunningRecord(playerId, {
          date: cleanDate,
          distance: distanceNum,
          duration: durationNum,
          notes: notes || undefined,
        });
        toast({
          title: '성공',
          description: '런닝 기록이 저장되었습니다.',
        });
      }

      // 기존 기록 다시 불러오기
      const record = await getRunningRecordByDate(playerId, cleanDate);
      if (record) {
        setExistingRecord(record);
        setIsEditing(true);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('런닝 기록 저장 실패:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '런닝 기록 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pace = distance && duration
    ? (parseFloat(duration) / parseFloat(distance)).toFixed(2)
    : '0.00';

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-green-600" />
        <h4 className="font-semibold text-sm">런닝 기록</h4>
        {isEditing && (
          <span className="text-xs text-gray-500">(기존 기록 수정 중)</span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="distance" className="text-xs">거리 (km)</Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              min="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0.0"
              className="h-8 text-sm"
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="duration" className="text-xs">시간 (분)</Label>
            <Input
              id="duration"
              type="number"
              step="1"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              className="h-8 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {distance && duration && parseFloat(distance) > 0 && parseInt(duration) > 0 && (
          <div className="text-xs text-gray-600">
            평균 페이스: <span className="font-semibold">{pace} 분/km</span>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="notes" className="text-xs">메모 (선택)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="메모를 입력하세요..."
            className="text-sm min-h-[60px]"
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          size="sm"
          className="w-full"
          disabled={loading || !distance || !duration}
        >
          {loading ? (
            '저장 중...'
          ) : isEditing ? (
            <>
              <Edit className="h-3 w-3 mr-1" />
              수정
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              저장
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default RunningRecordForm;
