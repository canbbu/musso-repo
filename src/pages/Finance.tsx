
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from "lucide-react";
import { useFinanceData } from '@/hooks/use-finance-data';
import TransactionTable from '@/components/finance/TransactionTable';
import FinanceSummary from '@/components/finance/FinanceSummary';

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
      
      <FinanceSummary 
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        paidDuesCount={paidDuesCount}
        totalDuesCount={totalDuesCount}
        duesCompletionPercent={duesCompletionPercent}
        currentMonthTransactionsCount={currentMonthTransactionsCount}
      />
      
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
