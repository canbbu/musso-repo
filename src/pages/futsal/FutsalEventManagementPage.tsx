import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';
import { useFutsalEvents } from '@/features/futsal/hooks/use-futsal-events';
import { FutsalEventForm } from '@/features/futsal/components/FutsalEventForm';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { FutsalEventFormData, FutsalEventWithAttendance } from '@/features/futsal/types/futsal.types';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Calendar, MapPin } from 'lucide-react';

export default function FutsalEventManagementPage() {
  const navigate = useNavigate();
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useFutsalEvents();
  const { canManageFutsal } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FutsalEventWithAttendance | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsCreate(true);
    setDialogOpen(true);
  };

  const handleEdit = (ev: FutsalEventWithAttendance) => {
    setEditingEvent(ev);
    setIsCreate(false);
    setDialogOpen(true);
  };

  const handleDeleteClick = (eventId: number) => {
    setDeleteTargetId(eventId);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId == null) return;
    await deleteEvent(deleteTargetId);
    setDeleteTargetId(null);
  };

  const handleFormSubmit = async (data: FutsalEventFormData) => {
    if (isCreate) {
      await createEvent(data);
      setDialogOpen(false);
    } else if (editingEvent) {
      await updateEvent(editingEvent.id, data);
      setDialogOpen(false);
      setEditingEvent(null);
    }
  };

  const handleFormCancel = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    setIsCreate(false);
  };

  if (!canManageFutsal?.()) {
    return (
      <Layout>
        <div className="text-destructive">이벤트 관리 권한이 없습니다.</div>
      </Layout>
    );
  }

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">풋살 이벤트 관리</h1>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            이벤트 추가
          </Button>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              등록된 이벤트가 없습니다. 이벤트 추가 버튼으로 등록하세요.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Card key={ev.id}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {ev.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {ev.location}
                  </div>
                  <div className="text-sm">{format(new Date(ev.date), 'yyyy.MM.dd')}</div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      수정
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(ev.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreate ? '이벤트 추가' : '이벤트 수정'}</DialogTitle>
          </DialogHeader>
          <FutsalEventForm
            editMode={!isCreate}
            event={editingEvent ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTargetId != null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 이벤트와 관련된 참가·댓글 정보가 모두 삭제됩니다. 정말 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
