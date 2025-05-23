
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus, Save } from "lucide-react";
import MemberDuesTable from './MemberDuesTable';
import { MemberDues } from '@/types/finance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface DuesManagementTabProps {
  memberDues: MemberDues[];
  onTogglePayment: (memberId: number) => void;
  canManage: boolean;
}

const DuesManagementTab = ({
  memberDues,
  onTogglePayment,
  canManage
}: DuesManagementTabProps) => {
  const { toast } = useToast();
  const [newDuesDialogOpen, setNewDuesDialogOpen] = useState(false);
  const [newDues, setNewDues] = useState({
    name: '',
    amount: 50000,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleNewDuesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would add to the database
    
    toast({
      title: "회비 추가 완료",
      description: `${newDues.name}님의 회비가 추가되었습니다.`,
    });
    
    setNewDuesDialogOpen(false);
    setNewDues({
      name: '',
      amount: 50000,
      dueDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>회비 관리</CardTitle>
          <CardDescription>회원별 회비 납부 상태를 관리합니다.</CardDescription>
        </div>
        {canManage && (
          <Dialog open={newDuesDialogOpen} onOpenChange={setNewDuesDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                새 회비
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 회비 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewDuesSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">회원 이름</Label>
                  <Input 
                    id="name" 
                    value={newDues.name} 
                    onChange={(e) => setNewDues({...newDues, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={newDues.amount} 
                    onChange={(e) => setNewDues({...newDues, amount: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">납부 기한</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={newDues.dueDate} 
                    onChange={(e) => setNewDues({...newDues, dueDate: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="flex items-center gap-1">
                    <Save className="h-4 w-4" />
                    저장
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <MemberDuesTable 
          memberDues={memberDues}
          onTogglePayment={onTogglePayment}
          canManage={canManage}
        />
      </CardContent>
    </Card>
  );
};

export default DuesManagementTab;
