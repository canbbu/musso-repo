
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BadgeCent, CircleDollarSign, Clock, CreditCard, Plus, RefreshCw, MoreHorizontal, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  member?: string;
}

interface MemberDues {
  id: number;
  name: string;
  paid: boolean;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paidAmount?: number;
}

const Finance = () => {
  const { canManageFinance } = useAuth();
  const { toast } = useToast();
  
  // Mock transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, date: '2023-11-25', description: '11월 회비 납부 - 김선수', amount: 50000, type: 'income', category: '회비', member: '김선수' },
    { id: 2, date: '2023-11-25', description: '11월 회비 납부 - 이공격수', amount: 50000, type: 'income', category: '회비', member: '이공격수' },
    { id: 3, date: '2023-11-24', description: '11월 회비 납부 - 박수비', amount: 50000, type: 'income', category: '회비', member: '박수비' },
    { id: 4, date: '2023-11-22', description: '풋살장 대여비', amount: 120000, type: 'expense', category: '장소 대여' },
    { id: 5, date: '2023-11-20', description: '유니폼 구매', amount: 250000, type: 'expense', category: '장비' },
    { id: 6, date: '2023-11-18', description: '10월 회비 납부 - 정미드필더', amount: 50000, type: 'income', category: '회비', member: '정미드필더' },
    { id: 7, date: '2023-11-15', description: '음료 구매', amount: 35000, type: 'expense', category: '물품' },
    { id: 8, date: '2023-11-10', description: '10월 회비 납부 - 최골키퍼', amount: 50000, type: 'income', category: '회비', member: '최골키퍼' },
    { id: 9, date: '2023-11-08', description: '경기 후 식사비', amount: 150000, type: 'expense', category: '식비' },
    { id: 10, date: '2023-11-05', description: '10월 회비 납부 - 강수비수', amount: 50000, type: 'income', category: '회비', member: '강수비수' },
    { id: 11, date: '2023-11-03', description: '공 구매', amount: 45000, type: 'expense', category: '장비' },
    { id: 12, date: '2023-10-30', description: '10월 회비 납부 - 장미드필더', amount: 50000, type: 'income', category: '회비', member: '장미드필더' },
    { id: 13, date: '2023-10-28', description: '풋살장 대여비', amount: 120000, type: 'expense', category: '장소 대여' },
    { id: 14, date: '2023-10-25', description: '9월 회비 납부 - 김선수', amount: 50000, type: 'income', category: '회비', member: '김선수' },
    { id: 15, date: '2023-10-25', description: '9월 회비 납부 - 이공격수', amount: 50000, type: 'income', category: '회비', member: '이공격수' },
    { id: 16, date: '2023-10-20', description: '음료 구매', amount: 30000, type: 'expense', category: '물품' },
    { id: 17, date: '2023-10-15', description: '경기 후 식사비', amount: 140000, type: 'expense', category: '식비' },
    { id: 18, date: '2023-10-10', description: '9월 회비 납부 - 박수비', amount: 50000, type: 'income', category: '회비', member: '박수비' },
    { id: 19, date: '2023-10-05', description: '9월 회비 납부 - 정미드필더', amount: 50000, type: 'income', category: '회비', member: '정미드필더' },
    { id: 20, date: '2023-10-01', description: '유니폼 세탁비', amount: 30000, type: 'expense', category: '기타' },
  ]);
  
  // Mock member dues data
  const [memberDues, setMemberDues] = useState<MemberDues[]>([
    { id: 1, name: '김선수', paid: true, dueDate: '2023-11-30', amount: 50000, paidDate: '2023-11-25', paidAmount: 50000 },
    { id: 2, name: '이공격수', paid: true, dueDate: '2023-11-30', amount: 50000, paidDate: '2023-11-25', paidAmount: 50000 },
    { id: 3, name: '박수비', paid: true, dueDate: '2023-11-30', amount: 50000, paidDate: '2023-11-24', paidAmount: 50000 },
    { id: 4, name: '정미드필더', paid: false, dueDate: '2023-11-30', amount: 50000 },
    { id: 5, name: '최골키퍼', paid: false, dueDate: '2023-11-30', amount: 50000 },
    { id: 6, name: '강수비수', paid: false, dueDate: '2023-11-30', amount: 50000 },
    { id: 7, name: '장미드필더', paid: false, dueDate: '2023-11-30', amount: 50000 },
  ]);
  
  // Transaction pagination
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 10;
  const totalTransactionPages = Math.ceil(transactions.length / transactionsPerPage);
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage
  );
  
  const togglePaymentStatus = (memberId: number) => {
    setMemberDues(dues => dues.map(due => {
      if (due.id === memberId) {
        // If already paid, mark as unpaid
        if (due.paid) {
          toast({
            title: "납부 취소",
            description: `${due.name}님의 회비 납부가 취소되었습니다.`,
          });
          return {
            ...due,
            paid: false,
            paidDate: undefined,
            paidAmount: undefined
          };
        } 
        // If unpaid, mark as paid
        else {
          const now = new Date();
          toast({
            title: "납부 확인",
            description: `${due.name}님의 회비 납부가 확인되었습니다.`,
          });
          return {
            ...due,
            paid: true,
            paidDate: now.toISOString().split('T')[0],
            paidAmount: due.amount
          };
        }
      }
      return due;
    }));
  };
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;
  
  const paidDuesCount = memberDues.filter(d => d.paid).length;
  const totalDuesCount = memberDues.length;
  const duesCompletionPercent = Math.round((paidDuesCount / totalDuesCount) * 100);

  return (
    <div className="finance-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">재정 관리</h1>
        <p className="text-gray-600">팀 재정 정보, 회비 납부 및 지출 관리</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <CircleDollarSign className="mr-2 h-5 w-5 text-blue-600" />
              총 잔액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{balance.toLocaleString()}원</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600">수입: {totalIncome.toLocaleString()}원</span>
              <span className="text-red-600">지출: {totalExpense.toLocaleString()}원</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="mr-2 h-5 w-5 text-green-600" />
              11월 회비
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{paidDuesCount}/{totalDuesCount} 명</p>
            <p className="text-sm text-green-700 mt-2">완료율: {duesCompletionPercent}%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-2 h-5 w-5 text-purple-600" />
              이번달 거래
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactions.filter(t => {
              const date = new Date(t.date);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}건</p>
          </CardContent>
        </Card>
      </div>
      
      {canManageFinance() && (
        <div className="dues-management mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">회비 납부 현황</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                갱신
              </Button>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                새 회비
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회원명</TableHead>
                  <TableHead>납부기한</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>납부일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberDues.map((due) => (
                  <TableRow key={due.id}>
                    <TableCell className="font-medium">{due.name}</TableCell>
                    <TableCell>{due.dueDate}</TableCell>
                    <TableCell>{due.amount.toLocaleString()}원</TableCell>
                    <TableCell>
                      {due.paid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          납부 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          미납
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{due.paidDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={due.paid ? "destructive" : "default"} 
                        size="sm" 
                        onClick={() => togglePaymentStatus(due.id)}
                      >
                        {due.paid ? '납부 취소' : '납부 확인'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      <div className="transaction-history">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">최근 거래내역</h2>
          {canManageFinance() && (
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              새 거래
            </Button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>분류</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} 
                    {transaction.amount.toLocaleString()}원
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalTransactionPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                    className={transactionPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalTransactionPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={transactionPage === i + 1}
                      onClick={() => setTransactionPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setTransactionPage(p => Math.min(totalTransactionPages, p + 1))}
                    className={transactionPage === totalTransactionPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
