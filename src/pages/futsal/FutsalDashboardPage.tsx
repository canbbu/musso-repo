import React, { useState, useCallback } from 'react';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useFutsalEvents } from '@/features/futsal/hooks/use-futsal-events';
import { useFutsalEventDetail } from '@/features/futsal/hooks/use-futsal-event-detail';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { FutsalJoinDialog } from '@/features/futsal/components/FutsalJoinDialog';
import { FutsalAttendanceModal } from '@/features/futsal/components/FutsalAttendanceModal';
import * as participationApi from '@/features/futsal/api/futsal-participation.api';
import * as commentsApi from '@/features/futsal/api/futsal-comments.api';
import type { FutsalEventWithAttendance } from '@/features/futsal/types/futsal.types';
import type { ParticipationStatus } from '@/features/futsal/types/futsal.types';
import { format } from 'date-fns';
import { Calendar, MapPin, MessageSquare, UserCheck, UserX, Clock, Users } from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useToast } from '@/shared/hooks/use-toast';

export default function FutsalDashboardPage() {
  const { toast } = useToast();
  const { events, loading, error } = useFutsalEvents();
  const { isAuthenticated, userId } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { type: 'participation'; status: ParticipationStatus } | { type: 'comment'; content: string } | null
  >(null);

  const {
    event: detailEvent,
    comments,
    loading: detailLoading,
    setParticipation,
    addComment,
    deleteComment,
    refreshEvent,
    refreshComments,
  } = useFutsalEventDetail(selectedEventId);

  const runPendingAction = useCallback(
    async (newUserId: string) => {
      if (!pendingAction || !selectedEventId) return;
      try {
        if (pendingAction.type === 'participation') {
          await participationApi.updateFutsalParticipation(
            selectedEventId,
            newUserId,
            pendingAction.status
          );
          await refreshEvent();
          toast({ title: '참석 상태가 반영되었습니다.' });
        } else {
          await commentsApi.addFutsalEventComment(
            selectedEventId,
            newUserId,
            pendingAction.content
          );
          setCommentText('');
          await refreshComments();
          toast({ title: '댓글이 등록되었습니다.' });
        }
      } catch (e) {
        toast({
          title: '오류',
          description: e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, selectedEventId, refreshEvent, refreshComments, toast]
  );

  const handleAddComment = async () => {
    if (!commentText.trim() || !detailEvent) return;
    if (!isAuthenticated || !userId) {
      setPendingAction({ type: 'comment', content: commentText.trim() });
      setJoinDialogOpen(true);
      return;
    }
    await addComment(commentText.trim());
    setCommentText('');
  };

  const handleParticipationClick = (status: ParticipationStatus) => {
    if (isAuthenticated && userId) {
      setParticipation(status);
      return;
    }
    setPendingAction({ type: 'participation', status });
    setJoinDialogOpen(true);
  };

  const statusLabel = (status: FutsalEventWithAttendance['userResponse']) => {
    if (status === 'attending') return '참가';
    if (status === 'not_attending') return '불참';
    return '미정';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">로딩 중...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-destructive">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">풋살 대시보드</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">이벤트 목록</h2>
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  등록된 풋살 이벤트가 없습니다.
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {events.map((ev) => (
                    <Card
                      key={ev.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedEventId === ev.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedEventId(ev.id)}
                    >
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {ev.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-0 pb-3 text-sm text-muted-foreground">
                        <div className="flex flex-wrap gap-2">
                          <span>{format(new Date(ev.date), 'yyyy.MM.dd')}</span>
                          {ev.time && <span>{ev.time}</span>}
                          <span>{ev.location}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="text-green-600">참가 {ev.attendance.attending}</span>
                          <span className="text-red-600">불참 {ev.attendance.notAttending}</span>
                          <span className="text-muted-foreground">미정 {ev.attendance.pending}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">이벤트 상세</h2>
            {!selectedEventId ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  왼쪽에서 이벤트를 선택하세요.
                </CardContent>
              </Card>
            ) : detailLoading ? (
              <Card>
                <CardContent className="py-8 text-center">로딩 중...</CardContent>
              </Card>
            ) : !detailEvent ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  이벤트를 불러올 수 없습니다.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {detailEvent.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {detailEvent.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      {format(new Date(detailEvent.date), 'yyyy.MM.dd')}
                      {detailEvent.time && ` ${detailEvent.time}`}
                    </div>
                    {detailEvent.description && (
                      <p className="text-muted-foreground pt-2">{detailEvent.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>참가 {detailEvent.attendance.attending}</span>
                      <UserX className="h-4 w-4 text-red-600 ml-2" />
                      <span>불참 {detailEvent.attendance.notAttending}</span>
                      <span className="text-muted-foreground ml-2">미정 {detailEvent.attendance.pending}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto shrink-0"
                        onClick={() => setAttendanceModalOpen(true)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        참석현황
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      참석 선택
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={detailEvent.userResponse === 'attending' ? 'default' : 'outline'}
                      onClick={() => handleParticipationClick('attending')}
                    >
                      참가
                    </Button>
                    <Button
                      size="sm"
                      variant={detailEvent.userResponse === 'not_attending' ? 'destructive' : 'outline'}
                      onClick={() => handleParticipationClick('not_attending')}
                    >
                      불참
                    </Button>
                    <Button
                      size="sm"
                      variant={detailEvent.userResponse === 'pending' ? 'secondary' : 'outline'}
                      onClick={() => handleParticipationClick('pending')}
                    >
                      미정
                    </Button>
                    <span className="text-sm text-muted-foreground self-center ml-2">
                      현재: {statusLabel(detailEvent.userResponse)}
                    </span>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      댓글 ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="댓글을 입력하세요"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                      />
                      <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                        등록
                      </Button>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <ul className="space-y-2">
                        {comments.length === 0 ? (
                          <li className="text-sm text-muted-foreground">댓글이 없습니다.</li>
                        ) : (
                          comments.map((c) => (
                            <li key={c.id} className="flex justify-between items-start gap-2 text-sm border-b pb-2">
                              <div>
                                <span className="font-medium">{c.player_name ?? '알 수 없음'}</span>
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {format(new Date(c.created_at), 'MM.dd HH:mm')}
                                </span>
                                <p className="mt-1">{c.content}</p>
                              </div>
                              {userId === c.player_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteComment(c.id)}
                                >
                                  삭제
                                </Button>
                              )}
                            </li>
                          ))
                        )}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <FutsalJoinDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        onGuestJoined={runPendingAction}
        actionLabel="참석/불참 또는 댓글"
      />
      {detailEvent && selectedEventId && (
        <FutsalAttendanceModal
          open={attendanceModalOpen}
          onOpenChange={setAttendanceModalOpen}
          eventId={selectedEventId}
          eventTitle={detailEvent.title}
        />
      )}
    </Layout>
  );
}
