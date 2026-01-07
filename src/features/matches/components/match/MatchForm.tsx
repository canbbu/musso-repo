import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMatchData } from '@/hooks/use-match-data';
import { format } from 'date-fns';

interface MatchFormProps {
  editMode?: boolean;
  matchId?: number | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const MatchForm = ({ editMode = false, matchId, onSubmit, onCancel }: MatchFormProps) => {
  const { matches } = useMatchData();
  const [loading, setLoading] = useState(false);
  
  // 수정 모드일 경우 기존 데이터 가져오기
  const selectedMatch = matchId ? matches.find(m => m.id === matchId) : null;
  
  // 사용 가능한 상태 옵션 추가
  const statusOptions = [
    { value: 'upcoming', label: '예정됨' },
    { value: 'completed', label: '완료됨' },
    { value: 'cancelled', label: '취소됨' }
  ];
  
  // form 초기화 시 status 관련 로깅 추가
  const form = useForm({
    defaultValues: {
      date: selectedMatch?.date ? format(new Date(selectedMatch.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: selectedMatch?.time ? selectedMatch.time.substring(0, 5) : '',
      location: selectedMatch?.location || '',
      opponent: selectedMatch?.opponent || '',
      status: selectedMatch?.status || 'upcoming' // 기본값을 'upcoming'으로 설정
    }
  });

  // 선택된 이벤트가 바뀌면 폼 값도 업데이트
  useEffect(() => {
    if (selectedMatch) {
      const matchDate = new Date(selectedMatch.date);
      form.reset({
        date: format(matchDate, 'yyyy-MM-dd'),
        time: selectedMatch.time ? selectedMatch.time.substring(0, 5) : '',
        location: selectedMatch.location,
        opponent: selectedMatch.opponent,
        status: selectedMatch.status
      });
    }
  }, [selectedMatch, form]);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // 날짜와 시간 합치기
      const dateTime = `${data.date}T${data.time}`;
      
      // 제출할 데이터 구성
      const submitData = {
        date: dateTime,
        location: data.location,
        opponent: data.opponent,
        status: data.status,
        time: data.time
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('폼 제출 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이벤트 날짜</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>이벤트 시간</FormLabel>
                  <FormControl>
                    <Input 
                      type="time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이벤트 장소</FormLabel>
              <FormControl>
                <Input {...field} placeholder="이벤트 장소를 입력하세요" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="opponent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상대팀</FormLabel>
              <FormControl>
                <Input {...field} placeholder="상대팀 이름을 입력하세요" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '처리 중...' : editMode ? '이벤트 수정' : '이벤트 등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MatchForm; 