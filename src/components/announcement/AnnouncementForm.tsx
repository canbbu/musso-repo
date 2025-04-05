
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AnnouncementFormData } from '@/types/announcement';
import { useToast } from '@/hooks/use-toast';

interface AnnouncementFormProps {
  initialData: AnnouncementFormData;
  onSubmit: (data: AnnouncementFormData) => void;
  onCancel: () => void;
  editMode: boolean;
}

const AnnouncementForm = ({ initialData, onSubmit, onCancel, editMode }: AnnouncementFormProps) => {
  const { toast } = useToast();
  const [formType, setFormType] = useState<'notice' | 'match'>(initialData.type || 'notice');
  const [formData, setFormData] = useState<AnnouncementFormData>(initialData);
  const [date, setDate] = useState<Date | undefined>(
    initialData.date ? new Date(initialData.date) : new Date()
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: formType
    }));
  }, [formType]);

  useEffect(() => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      attendanceTracking: checked
    }));
  };

  const handleSubmit = () => {
    const requiredFields = formType === 'notice' 
      ? ['title', 'content']
      : ['title', 'content', 'location', 'opponent', 'matchTime'];
      
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="type">유형</Label>
        <Select value={formType} onValueChange={(v) => setFormType(v as 'notice' | 'match')}>
          <SelectTrigger>
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="notice">공지사항</SelectItem>
            <SelectItem value="match">경기 일정</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="date">날짜</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "yyyy-MM-dd") : <span>날짜 선택</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {formType === 'match' && (
        <>
          <div className="space-y-1">
            <Label htmlFor="opponent">상대팀</Label>
            <Input 
              id="opponent" 
              name="opponent" 
              value={formData.opponent || ''} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="location">장소</Label>
            <Input 
              id="location" 
              name="location" 
              value={formData.location || ''} 
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="matchTime">시간</Label>
            <Input 
              id="matchTime" 
              name="matchTime" 
              type="time"
              value={formData.matchTime || ''} 
              onChange={handleInputChange} 
            />
          </div>
        </>
      )}
      
      <div className="space-y-1">
        <Label htmlFor="content">내용</Label>
        <Textarea 
          id="content" 
          name="content" 
          rows={5} 
          value={formData.content || ''} 
          onChange={handleInputChange} 
        />
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="attendanceTracking" 
          checked={formData.attendanceTracking || false}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor="attendanceTracking" className="cursor-pointer">참석 여부 확인 기능 사용</Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={handleSubmit} className="flex items-center">
          <Save className="mr-2 h-4 w-4" />
          {editMode ? '수정 저장' : '등록하기'}
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementForm;
