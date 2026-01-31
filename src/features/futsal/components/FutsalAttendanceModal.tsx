import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { UserCheck, UserX, Clock } from 'lucide-react';
import * as participationApi from '../api/futsal-participation.api';
import type { FutsalParticipationListItem, ParticipationStatus } from '../types/futsal.types';

export interface FutsalAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
  eventTitle?: string;
}

const statusLabel: Record<ParticipationStatus, string> = {
  attending: '참가',
  not_attending: '불참',
  pending: '미정',
};

export function FutsalAttendanceModal({
  open,
  onOpenChange,
  eventId,
  eventTitle = '이벤트',
}: FutsalAttendanceModalProps) {
  const [list, setList] = useState<FutsalParticipationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && eventId != null) {
      setLoading(true);
      setError(null);
      participationApi
        .getFutsalEventParticipationList(eventId)
        .then(setList)
        .catch((e) => setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.'))
        .finally(() => setLoading(false));
    } else {
      setList([]);
    }
  }, [open, eventId]);

  const attending = list.filter((p) => p.status === 'attending');
  const notAttending = list.filter((p) => p.status === 'not_attending');
  const pendingList = list.filter((p) => p.status === 'pending');

  const renderSection = (
    items: FutsalParticipationListItem[],
    emptyMessage: string
  ) => {
    if (loading) {
      return <div className="py-6 text-center text-muted-foreground">로딩 중...</div>;
    }
    if (error) {
      return <div className="py-6 text-center text-destructive">{error}</div>;
    }
    if (items.length === 0) {
      return <div className="py-6 text-center text-muted-foreground">{emptyMessage}</div>;
    }
    return (
      <ScrollArea className="h-[200px]">
        <ul className="space-y-2 pr-2">
          {items.map((p) => (
            <li
              key={p.player_id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="font-medium">{p.player_name ?? '이름 없음'}</span>
              <Badge variant="secondary" className="text-xs">
                {statusLabel[p.status]}
              </Badge>
            </li>
          ))}
        </ul>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            참석현황 · {eventTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 py-2">
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            참가 {attending.length}명
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            <UserX className="h-3 w-3 mr-1" />
            불참 {notAttending.length}명
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            미정 {pendingList.length}명
          </Badge>
        </div>
        <Tabs defaultValue="attending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attending">참가 ({attending.length})</TabsTrigger>
            <TabsTrigger value="notAttending">불참 ({notAttending.length})</TabsTrigger>
            <TabsTrigger value="pending">미정 ({pendingList.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="attending" className="mt-3">
            {renderSection(attending, '참가한 인원이 없습니다.')}
          </TabsContent>
          <TabsContent value="notAttending" className="mt-3">
            {renderSection(notAttending, '불참한 인원이 없습니다.')}
          </TabsContent>
          <TabsContent value="pending" className="mt-3">
            {renderSection(pendingList, '미정인 인원이 없습니다.')}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
