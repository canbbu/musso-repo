import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToast } from '@/shared/hooks/use-toast';
import { createRunningRecord, getRunningRecordByDate, updateRunningRecord, deleteRunningRecord } from '@/features/running/api/running.api';
import { RunningRecord } from '@/features/running/types/running.types';
import { Activity, Save, Edit, Lock, Trash2 } from 'lucide-react';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

const DailyRunningRecordForm: React.FC = () => {
  const { toast } = useToast();
  const { userId, userName } = useAuth();
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [existingRecord, setExistingRecord] = useState<RunningRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 오늘 날짜 가져오기 (YYYY-MM-DD 형식)
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // 당일이 끝나기 전인지 확인 (자정 전까지)
  const isToday = (): boolean => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return now >= today && now < tomorrow;
  };

  const canRecord = isToday();

  // 기존 기록 불러오기
  useEffect(() => {
    const fetchExistingRecord = async () => {
      if (!userId || !canRecord) return;

      try {
        const record = await getRunningRecordByDate(userId, todayDate);
        if (record) {
          setExistingRecord(record);
          setDistance(record.distance.toString());
          setDuration(record.duration.toString());
          setNotes(record.notes || '');
          setIsEditing(true);
        } else {
          setExistingRecord(null);
          setDistance('');
          setDuration('');
          setNotes('');
          setIsEditing(false);
        }
      } catch (error) {
        console.error('기존 기록 불러오기 실패:', error);
      }
    };

    if (userId && canRecord) {
      fetchExistingRecord();
    }
  }, [userId, todayDate, canRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 체크
    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    // 당일 체크
    if (!canRecord) {
      toast({
        title: '입력 불가',
        description: '당일이 끝나기 전에만 기록할 수 있습니다.',
        variant: 'destructive',
      });
      return;
    }

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
          date: todayDate,
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
        await createRunningRecord(userId, {
          date: todayDate,
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
      const record = await getRunningRecordByDate(userId, todayDate);
      if (record) {
        setExistingRecord(record);
        setIsEditing(true);
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

  // 거리 입력 핸들러 - 소수점 2자리 제한
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 빈 값이면 그대로 설정
    if (value === '') {
      setDistance('');
      return;
    }

    // 숫자와 소수점만 허용
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // 소수점이 여러 개인 경우 첫 번째만 허용
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      const firstPart = parts[0];
      const secondPart = parts.slice(1).join('');
      const limitedValue = `${firstPart}.${secondPart}`;
      
      // 소수점 2자리 초과 체크
      if (secondPart.length > 2) {
        toast({
          title: '입력 제한',
          description: '거리는 소수점 2자리까지만 입력할 수 있습니다.',
          variant: 'destructive',
        });
        // 소수점 2자리까지만 유지
        setDistance(`${firstPart}.${secondPart.substring(0, 2)}`);
        return;
      }
      setDistance(limitedValue);
      return;
    }

    // 소수점 2자리 초과 체크
    if (parts.length === 2 && parts[1].length > 2) {
      toast({
        title: '입력 제한',
        description: '거리는 소수점 2자리까지만 입력할 수 있습니다.',
        variant: 'destructive',
      });
      // 소수점 2자리까지만 유지
      setDistance(`${parts[0]}.${parts[1].substring(0, 2)}`);
      return;
    }

    setDistance(numericValue);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!existingRecord || !userId) return;

    setLoading(true);
    try {
      await deleteRunningRecord(existingRecord.id);
      toast({
        title: '삭제 완료',
        description: '런닝 기록이 삭제되었습니다.',
      });
      
      // 상태 초기화
      setExistingRecord(null);
      setDistance('');
      setDuration('');
      setNotes('');
      setIsEditing(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('런닝 기록 삭제 실패:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '런닝 기록 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pace = distance && duration
    ? (parseFloat(duration) / parseFloat(distance)).toFixed(2)
    : '0.00';

  const todayFormatted = new Date(todayDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            오늘의 런닝 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!canRecord ? (
            <div className="text-center py-6 text-gray-500">
              <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">당일이 끝나기 전에만 기록할 수 있습니다.</p>
              <p className="text-xs mt-1">다음 날에 다시 시도해주세요.</p>
            </div>
          ) : !userId ? (
            <div className="text-center py-6">
              <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-4">런닝 기록을 입력하려면 로그인이 필요합니다.</p>
              <Button onClick={() => setShowLoginModal(true)}>
                로그인
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                <p>날짜: <span className="font-medium">{todayFormatted}</span></p>
                {existingRecord && (
                  <p className="text-xs text-green-600 mt-1">✓ 오늘의 기록이 저장되어 있습니다.</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="distance" className="text-xs">
                      거리 (km) <span className="text-gray-400 font-normal">(소수점 2자리까지)</span>
                    </Label>
                    <Input
                      id="distance"
                      type="text"
                      inputMode="decimal"
                      value={distance}
                      onChange={handleDistanceChange}
                      placeholder="0.00"
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

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
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
                  {isEditing && existingRecord && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>런닝 기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              오늘의 런닝 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // 로그인 성공 후 기록 다시 불러오기
          if (userId) {
            getRunningRecordByDate(userId, todayDate).then(record => {
              if (record) {
                setExistingRecord(record);
                setDistance(record.distance.toString());
                setDuration(record.duration.toString());
                setNotes(record.notes || '');
                setIsEditing(true);
              }
            });
          }
        }}
      />
    </>
  );
};

export default DailyRunningRecordForm;
