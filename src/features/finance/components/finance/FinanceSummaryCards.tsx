import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { CircleDollarSign, CreditCard, Clock, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { MemberDues, Transaction } from '@/features/finance/types/finance.types';

interface FinanceSummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  paidDuesCount: number;
  totalDuesCount: number;
  duesCompletionPercent: number;
  currentMonthTransactionsCount: number;
  memberDues?: MemberDues[];
  transactions?: Transaction[];
  setActiveTab?: (tab: 'summary' | 'dues' | 'transactions') => void;
}

const FinanceSummaryCards = ({
  balance,
  totalIncome,
  totalExpense,
  paidDuesCount,
  totalDuesCount,
  duesCompletionPercent,
  currentMonthTransactionsCount,
  memberDues = [],
  transactions = [],
  setActiveTab
}: FinanceSummaryCardsProps) => {
  const { canManageFinance } = useAuth();
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [duesDialogOpen, setDuesDialogOpen] = useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);

  const currentMonthName = new Date().toLocaleString('ko-KR', { month: 'long' });
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const handleCardClick = (type: 'balance' | 'dues' | 'transactions') => {
    if (setActiveTab) {
      if (type === 'balance') setActiveTab('summary');
      if (type === 'dues') setActiveTab('dues');
      if (type === 'transactions') setActiveTab('transactions');
      return;
    }

    if (type === 'balance') setBalanceDialogOpen(true);
    if (type === 'dues') setDuesDialogOpen(true);
    if (type === 'transactions') setTransactionsDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('balance')}
        >
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
        
        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('dues')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="mr-2 h-5 w-5 text-green-600" />
              이번 달 회비
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{paidDuesCount}/{totalDuesCount} 명</p>
            <p className="text-sm text-green-700 mt-2">완료율: {duesCompletionPercent}%</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('transactions')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-2 h-5 w-5 text-purple-600" />
              이번달 거래
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentMonthTransactionsCount}건</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>총 잔액 상세 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{balance.toLocaleString()}원</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600">총 수입</p>
                  <p className="text-xl font-semibold text-green-600">{totalIncome.toLocaleString()}원</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600">총 지출</p>
                  <p className="text-xl font-semibold text-red-600">{totalExpense.toLocaleString()}원</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Info className="h-4 w-4 text-blue-600 mr-2" />
              <p className="text-sm text-gray-600">
                이번 달 예상 수입: {(totalDuesCount * 50000).toLocaleString()}원 (회비 기준)
              </p>
            </div>
            
            <div className="flex items-center">
              <Info className="h-4 w-4 text-blue-600 mr-2" />
              <p className="text-sm text-gray-600">
                남은 회비 잔액: {((totalDuesCount * 50000) - totalExpense).toLocaleString()}원
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={duesDialogOpen} onOpenChange={setDuesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentMonthName} 회비 납부 현황</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">완료율</p>
                <p className="text-xl font-bold">{duesCompletionPercent}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">납부 인원</p>
                <p className="text-xl font-bold">{paidDuesCount}/{totalDuesCount}명</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">미납 인원</p>
                <p className="text-xl font-bold">{totalDuesCount - paidDuesCount}명</p>
              </div>
            </div>
            
            {memberDues.length > 0 && (
              <div className="overflow-y-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회원명</TableHead>
                      <TableHead>납부 상태</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>납부일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberDues.map((dues) => (
                      <TableRow key={dues.id}>
                        <TableCell className="font-medium">{dues.name}</TableCell>
                        <TableCell>
                          {dues.paid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              납부 완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              미납
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{dues.amount.toLocaleString()}원</TableCell>
                        <TableCell>{dues.paidDate || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={transactionsDialogOpen} onOpenChange={setTransactionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentMonthName} 거래 내역</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">총 거래</p>
                <p className="text-xl font-bold">{currentMonthTransactionsCount}건</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">수입</p>
                <p className="text-xl font-bold text-green-600">
                  {currentMonthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}원
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">지출</p>
                <p className="text-xl font-bold text-red-600">
                  {currentMonthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}원
                </p>
              </div>
            </div>
            
            {currentMonthTransactions.length > 0 ? (
              <div className="overflow-y-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>내용</TableHead>
                      <TableHead>분류</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMonthTransactions.map((transaction) => (
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
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded">
                <p>이번 달 거래 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinanceSummaryCards;
