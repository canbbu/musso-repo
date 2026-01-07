
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from '@/shared/components/ui/button';
import { Plus, Save } from "lucide-react";
import TransactionTable from './TransactionTable';
import { Transaction } from '@/features/finance/types/finance.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from '@/shared/hooks/use-toast';

interface TransactionsTabProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canManage: boolean;
}

const TransactionsTab = ({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  canManage
}: TransactionsTabProps) => {
  const { toast } = useToast();
  const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '기타',
    member: ''
  });

  const categories = [
    '회비', '장소 대여', '장비', '물품', '식비', '교통비', '기타'
  ];

  const handleNewTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "거래 추가 완료",
      description: `새 ${newTransaction.type === 'income' ? '수입' : '지출'} 항목이 추가되었습니다.`,
    });
    
    setNewTransactionDialogOpen(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'expense',
      category: '기타',
      member: ''
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>거래 내역</CardTitle>
          <CardDescription>모든 수입 및 지출 내역을 관리합니다.</CardDescription>
        </div>
        {canManage && (
          <Dialog open={newTransactionDialogOpen} onOpenChange={setNewTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                새 거래
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 거래 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewTransactionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">날짜</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={newTransaction.date} 
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">거래 유형</Label>
                  <Select 
                    value={newTransaction.type} 
                    onValueChange={(value: 'income' | 'expense') => setNewTransaction({...newTransaction, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">수입</SelectItem>
                      <SelectItem value="expense">지출</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Input 
                    id="description" 
                    value={newTransaction.description} 
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={newTransaction.amount} 
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">분류</Label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="분류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newTransaction.type === 'income' && newTransaction.category === '회비' && (
                  <div className="space-y-2">
                    <Label htmlFor="member">회원명</Label>
                    <Input 
                      id="member" 
                      value={newTransaction.member} 
                      onChange={(e) => setNewTransaction({...newTransaction, member: e.target.value})}
                    />
                  </div>
                )}
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
        <TransactionTable 
          transactions={transactions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
};

export default TransactionsTab;
