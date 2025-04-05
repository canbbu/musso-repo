
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { AnnouncementFormData } from '@/types/announcement';
import { useAnnouncementData } from '@/hooks/use-announcement-data';
import AnnouncementList from '@/components/announcement/AnnouncementList';
import AnnouncementForm from '@/components/announcement/AnnouncementForm';

const AnnouncementManagement = () => {
  const { canManageAnnouncements, userName } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncementData();
  
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [formType, setFormType] = useState<'notice' | 'match'>('notice');
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    type: 'notice',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    author: userName || '',
    attendanceTracking: false
  });
  const [editMode, setEditMode] = useState(false);

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

  const handleEditItem = (item: AnnouncementFormData) => {
    setEditMode(true);
    setFormType(item.type || 'notice');
    setFormData(item);
    setActiveTab('create');
  };

  const handleSubmit = (data: AnnouncementFormData) => {
    if (editMode) {
      updateAnnouncement(data);
    } else {
      createAnnouncement(data);
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
              <AnnouncementList 
                announcements={announcements}
                onEdit={handleEditItem}
                onDelete={deleteAnnouncement}
              />
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
              <AnnouncementForm
                initialData={formData}
                onSubmit={handleSubmit}
                onCancel={() => setActiveTab('list')}
                editMode={editMode}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnnouncementManagement;
