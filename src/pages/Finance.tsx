
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CircleDollarSign, CreditCard, Clock, LayoutDashboard } from "lucide-react";
import { useFinanceData } from '@/hooks/use-finance-data';
import TransactionTable from '@/components/finance/TransactionTable';

const Finance = () => {
  const { canManageFinance } = useAuth();
  const navigate = useNavigate();
  
  const {
    paginatedTransactions,
    transactionPage,
    setTransactionPage,
    totalTransactionPages,
    balance,
    totalIncome,
    totalExpense,
    paidDuesCount,
    totalDuesCount,
    duesCompletionPercent,
    currentMonthTransactionsCount
  } = useFinanceData();

  const handleManageFinance = () => {
    navigate('/finance-management');
  };

  return (
    <div className="finance-container">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">팀 재정 현황</h1>
          <p className="text-gray-600">팀의 재정 상태와 최근 거래 내역입니다</p>
        </div>
        
        {canManageFinance() && (
          <Button onClick={handleManageFinance} className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            재정 관리
          </Button>
        )}
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
              이번 달 회비
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
            <p className="text-3xl font-bold">{currentMonthTransactionsCount}건</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="transaction-history mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">최근 거래내역</h2>
        </div>
        
        <TransactionTable 
          transactions={paginatedTransactions}
          currentPage={transactionPage}
          totalPages={totalTransactionPages}
          onPageChange={setTransactionPage}
        />
      </div>
      
      {canManageFinance() && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleManageFinance} size="lg" className="w-full max-w-md">
            재정 및 회비 관리 페이지로 이동
          </Button>
        </div>
      )}
    </div>
  );
};

export default Finance;
