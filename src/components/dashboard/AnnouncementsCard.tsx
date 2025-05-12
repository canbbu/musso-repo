import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
  isMatch?: boolean;
}

interface AnnouncementsCardProps {
  announcements: Announcement[];
  canManageAnnouncements: () => boolean;
  title?: string;
  icon?: 'message' | 'calendar';
}

const AnnouncementsCard = ({ 
  announcements, 
  canManageAnnouncements, 
  title = "공지사항", 
  icon = "message" 
}: AnnouncementsCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white h-fit">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="flex items-center">
            {icon === "message" ? (
              <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" />
            ) : (
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
            )}
            {title}
          </CardTitle>
          {canManageAnnouncements && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/announcement-management')}
              className="whitespace-nowrap"
            >
              관리
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                  <h3 className="font-medium">{announcement.title}</h3>
                  {announcement.type === 'match' && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      이벤트
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 mb-1">{announcement.content}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>{announcement.date}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>작성자: {announcement.author}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <p className="text-gray-500">공지사항이 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsCard;
