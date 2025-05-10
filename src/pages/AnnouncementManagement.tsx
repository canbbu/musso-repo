import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/Layout';
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
  const { 
    announcements, 
    loading,
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement,
    refreshAnnouncements 
  } = useAnnouncementData();
  
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
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
    // 권한 체크 (회장, 부회장만 접근 가능)
    if (!canManageAnnouncements()) {
      toast({
        title: "접근 권한이 없습니다",
        description: "공지사항 관리는 회장, 부회장만 가능합니다.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [canManageAnnouncements, navigate, toast]);

  // 데이터 로드 시 새로고침 방지
  useEffect(() => {
    refreshAnnouncements();
  }, []);

  const handleCreateNew = () => {
    setEditMode(false);
    setFormData({
      title: '',
      type: 'notice',
      content: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      author: userName || '',
      attendanceTracking: false
    });
    setActiveTab('create');
  };

  const handleEditItem = (item: AnnouncementFormData) => {
    setEditMode(true);
    setFormData(item);
    setActiveTab('create');
  };

  const handleSubmit = async (data: AnnouncementFormData) => {
    if (editMode) {
      await updateAnnouncement(data);
    } else {
      await createAnnouncement(data);
    }
    setActiveTab('list');
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>데이터 로딩 중...</p>
        </div>
      </Layout>
    );
  }

  const noticeAnnouncements = announcements.filter(a => a.type === 'notice');
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">공지사항 관리</h1>
        <p className="text-gray-600">공지사항을 등록하고 관리합니다.</p>
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
              <CardTitle>공지사항 목록</CardTitle>
              <CardDescription>전체 공지사항 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementList 
                announcements={noticeAnnouncements}
                onEdit={handleEditItem}
                onDelete={deleteAnnouncement}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{editMode ? '공지사항 수정' : '새 공지사항 등록'}</CardTitle>
              <CardDescription>
                {editMode ? '내용을 수정한 후 저장하세요.' : '새 공지사항의 정보를 입력하세요.'}
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
    </Layout>
  );
};

export default AnnouncementManagement;
