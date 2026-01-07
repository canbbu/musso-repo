
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from '@/shared/components/ui/button';
import { RefreshCw } from "lucide-react";
import FinanceSummaryTab from './FinanceSummaryTab';
import DuesManagementTab from './DuesManagementTab';
import TransactionsTab from './TransactionsTab';
import { Transaction, MemberDues } from '@/features/finance/types/finance.types';

interface FinanceManagementTabsProps {
  activeTab: 'summary' | 'dues' | 'transactions';
  setActiveTab: (tab: 'summary' | 'dues' | 'transactions') => void;
  paginatedTransactions: Transaction[];
  transactionPage: number;
  setTransactionPage: (page: number) => void;
  totalTransactionPages: number;
  memberDues: MemberDues[];
  togglePaymentStatus: (memberId: number) => void;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  paidDuesCount: number;
  totalDuesCount: number;
  duesCompletionPercent: number;
  currentMonthTransactionsCount: number;
  canManageFinance: () => boolean;
  handleRefresh: () => void;
  saveChanges: boolean;
  allTransactions?: Transaction[];
}

const FinanceManagementTabs = ({
  activeTab,
  setActiveTab,
  paginatedTransactions,
  transactionPage,
  setTransactionPage,
  totalTransactionPages,
  memberDues,
  togglePaymentStatus,
  balance,
  totalIncome,
  totalExpense,
  paidDuesCount,
  totalDuesCount,
  duesCompletionPercent,
  currentMonthTransactionsCount,
  canManageFinance,
  handleRefresh,
  saveChanges,
  allTransactions = []
}: FinanceManagementTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'summary' | 'dues' | 'transactions')}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="dues">회비 관리</TabsTrigger>
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
        </TabsList>
        
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          데이터 갱신
        </Button>
      </div>
      
      <TabsContent value="summary">
        <FinanceSummaryTab 
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          paidDuesCount={paidDuesCount}
          totalDuesCount={totalDuesCount}
          duesCompletionPercent={duesCompletionPercent}
          currentMonthTransactionsCount={currentMonthTransactionsCount}
          paginatedTransactions={paginatedTransactions}
          memberDues={memberDues}
          allTransactions={allTransactions}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="dues">
        <DuesManagementTab 
          memberDues={memberDues}
          onTogglePayment={togglePaymentStatus}
          canManage={canManageFinance()}
        />
      </TabsContent>
      
      <TabsContent value="transactions">
        <TransactionsTab 
          transactions={paginatedTransactions}
          currentPage={transactionPage}
          totalPages={totalTransactionPages}
          onPageChange={setTransactionPage}
          canManage={canManageFinance()}
        />
      </TabsContent>
    </Tabs>
  );
};

export default FinanceManagementTabs;
