
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, MessageSquare, Save, Plus, Trash2, Edit, Eye, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  content: string;
  date: string;
  author: string;
  location?: string;
  opponent?: string;
  matchTime?: string;
  attendanceTracking?: boolean;
}

const AnnouncementManagement = () => {
  const { canManageAnnouncements, userName, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1, 
      title: '이번 주 경기 공지', 
      type: 'notice',
      date: '2023-11-20', 
      content: '이번 주 경기는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.',
      author: '김운영'
    },
    {
      id: 2, 
      title: 'FC 서울과의 경기', 
      type: 'match',
      date: '2023-11-25', 
      content: '이번 경기는 중요한 라이벌전입니다. 많은 참여 부탁드립니다.',
      author: '박감독',
      location: '서울 마포구 풋살장',
      opponent: 'FC 서울',
      matchTime: '19:00',
      attendanceTracking: true
    },
    {
      id: 3, 
      title: '연말 모임 안내', 
      type: 'notice',
      date: '2023-11-18', 
      content: '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.',
      author: '박감독',
      attendanceTracking: true
    },
  ]);
  
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [formType, setFormType] = useState<'notice' | 'match'>('notice');
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    type: 'notice',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    author: userName || '',
    attendanceTracking: false
  });
  const [editMode, setEditMode] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // Redirect if no permissions
    if (!canManageAnnouncements()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "공지사항 및 경기 일정 관리는 회장, 부회장, 감독만 가능합니다.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [canManageAnnouncements, navigate, toast]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      author: userName || '',
      type: formType
    }));
  }, [userName, formType]);

  useEffect(() => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  }, [date]);

  const handleCreateNew = () => {
    setEditMode(false);
    setFormData({
      title: '',
      type: formType,
      content: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      author: userName || '',
      location: '',
      opponent: '',
      matchTime: '',
      attendanceTracking: false
    });
    setActiveTab('create');
  };

  const handleEditItem = (item: Announcement) => {
    setEditMode(true);
    setFormType(item.type);
    setFormData(item);
    setDate(new Date(item.date));
    setActiveTab('create');
  };

  const handleDeleteItem = (id: number) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
    toast({
      title: "항목 삭제 완료",
      description: "선택한 항목이 삭제되었습니다.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
    
    if (editMode) {
      setAnnouncements(prev => 
        prev.map(item => 
          item.id === formData.id ? { ...item, ...formData as Announcement } : item
        )
      );
      toast({
        title: "수정 완료",
        description: "항목이 성공적으로 수정되었습니다.",
      });
    } else {
      const newItem: Announcement = {
        id: Math.max(0, ...announcements.map(a => a.id)) + 1,
        title: formData.title!,
        type: formData.type as 'notice' | 'match',
        content: formData.content!,
        date: formData.date!,
        author: formData.author!,
        attendanceTracking: formData.attendanceTracking,
        ...(formData.type === 'match' && {
          location: formData.location,
          opponent: formData.opponent,
          matchTime: formData.matchTime
        })
      };
      
      setAnnouncements(prev => [...prev, newItem]);
      toast({
        title: "등록 완료",
        description: `새 ${formData.type === 'notice' ? '공지사항' : '경기 일정'}이 등록되었습니다.`,
      });
    }
    
    setActiveTab('list');
  };
  
  return (
    <div className="announcement-management-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">공지사항 및 경기 일정 관리</h1>
        <p className="text-gray-600">공지사항과 경기 일정을 등록하고 관리합니다.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'create')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="list">목록 보기</TabsTrigger>
            <TabsTrigger value="create">
              {editMode ? '수정하기' : '새로 작성'}
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'list' && (
            <Button onClick={handleCreateNew} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              새로 작성
            </Button>
          )}
        </div>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>관리 목록</CardTitle>
              <CardDescription>공지사항 및 경기 일정 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>유형</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>참석 확인</TableHead>
                    <TableHead className="w-[100px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.type === 'notice' ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            공지사항
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            경기 일정
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        {item.attendanceTracking ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            사용 중
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">미사용</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {announcements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        등록된 항목이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{editMode ? '항목 수정' : '새 항목 등록'}</CardTitle>
              <CardDescription>
                {editMode ? '내용을 수정한 후 저장하세요.' : '새 항목의 정보를 입력하세요.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <Button variant="outline" onClick={() => setActiveTab('list')}>
                    취소
                  </Button>
                  <Button onClick={handleSubmit} className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    {editMode ? '수정 저장' : '등록하기'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnnouncementManagement;
