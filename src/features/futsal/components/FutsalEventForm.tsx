import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { format } from 'date-fns';
import type { FutsalEventFormData, FutsalEventWithAttendance } from '../types/futsal.types';

const statusOptions = [
  { value: 'upcoming', label: '예정' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
];

interface FutsalEventFormProps {
  editMode?: boolean;
  event?: FutsalEventWithAttendance | null;
  onSubmit: (data: FutsalEventFormData) => Promise<void>;
  onCancel: () => void;
}

export function FutsalEventForm({ editMode = false, event, onSubmit, onCancel }: FutsalEventFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FutsalEventFormData>({
    defaultValues: {
      title: event?.title ?? '',
      date: event?.date ? format(new Date(event.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: event?.time ?? undefined,
      location: event?.location ?? '',
      description: event?.description ?? undefined,
      status: event?.status ?? 'upcoming',
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        date: format(new Date(event.date), 'yyyy-MM-dd'),
        time: event.time ?? undefined,
        location: event.location,
        description: event.description ?? undefined,
        status: event.status,
      });
    }
  }, [event, form]);

  const handleSubmit = async (data: FutsalEventFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: '제목을 입력하세요' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input {...field} placeholder="이벤트 제목" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            rules={{ required: '날짜를 선택하세요' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>날짜</FormLabel>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>시간 (선택)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="location"
          rules={{ required: '장소를 입력하세요' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input {...field} placeholder="장소" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="설명" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상태</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '처리 중...' : editMode ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
