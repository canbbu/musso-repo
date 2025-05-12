
import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Announcement } from '@/types/announcement';

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: number) => void;
}

const AnnouncementList = ({ announcements, onEdit, onDelete }: AnnouncementListProps) => {
  return (
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
                  이벤트 일정
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
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
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
  );
};

export default AnnouncementList;
