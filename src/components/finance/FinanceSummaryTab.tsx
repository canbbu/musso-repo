
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import FinanceSummaryCards from './FinanceSummaryCards';
import TransactionTable from './TransactionTable';
import { Transaction, MemberDues } from '@/types/finance';

interface FinanceSummaryTabProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  paidDuesCount: number;
  totalDuesCount: number;
  duesCompletionPercent: number;
  currentMonthTransactionsCount: number;
  paginatedTransactions: Transaction[];
  memberDues?: MemberDues[];
  allTransactions?: Transaction[];
  setActiveTab: (tab: 'summary' | 'dues' | 'transactions') => void;
}

const FinanceSummaryTab = ({
  balance,
  totalIncome,
  totalExpense,
  paidDuesCount,
  totalDuesCount,
  duesCompletionPercent,
  currentMonthTransactionsCount,
  paginatedTransactions,
  memberDues = [],
  allTransactions = [],
  setActiveTab
}: FinanceSummaryTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>재정 현황 요약</CardTitle>
        <CardDescription>현재 팀의 재정 상태와 회비 납부 현황을 보여줍니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <FinanceSummaryCards 
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          paidDuesCount={paidDuesCount}
          totalDuesCount={totalDuesCount}
          duesCompletionPercent={duesCompletionPercent}
          currentMonthTransactionsCount={currentMonthTransactionsCount}
          memberDues={memberDues}
          transactions={allTransactions}
          setActiveTab={setActiveTab}
        />
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">최근 거래 내역</h3>
          <TransactionTable 
            transactions={paginatedTransactions.slice(0, 5)}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setActiveTab('transactions')}>
              모든 거래 내역 보기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceSummaryTab;
