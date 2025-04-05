
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFinanceData } from '@/hooks/use-finance-data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from "lucide-react";
import FinanceManagementTabs from '@/components/finance/FinanceManagementTabs';

const FinanceManagement = () => {
  const { canManageFinance } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'summary' | 'dues' | 'transactions'>('summary');
  const [saveChanges, setSaveChanges] = useState(false);
  
  const {
    transactions,
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
    currentMonthTransactionsCount
  } = useFinanceData();

  const handleSaveChanges = () => {
    toast({
      title: "변경사항 저장 완료",
      description: "모든 변경사항이 저장되었습니다.",
    });
    setSaveChanges(false);
  };

  const handleRefresh = () => {
    toast({
      title: "데이터 갱신 완료",
      description: "최신 데이터로 갱신되었습니다.",
    });
  };

  const handleDuesChange = (memberId: number) => {
    togglePaymentStatus(memberId);
    setSaveChanges(true);
  };

  return (
    <div className="finance-management-container">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">재정 관리</h1>
          <p className="text-gray-600">팀 재정 정보, 회비 납부 및 지출 관리</p>
        </div>
        {saveChanges && (
          <Button onClick={handleSaveChanges} className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            변경사항 저장
          </Button>
        )}
      </div>
      
      <FinanceManagementTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paginatedTransactions={paginatedTransactions}
        transactionPage={transactionPage}
        setTransactionPage={setTransactionPage}
        totalTransactionPages={totalTransactionPages}
        memberDues={memberDues}
        togglePaymentStatus={handleDuesChange}
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        paidDuesCount={paidDuesCount}
        totalDuesCount={totalDuesCount}
        duesCompletionPercent={duesCompletionPercent}
        currentMonthTransactionsCount={currentMonthTransactionsCount}
        canManageFinance={canManageFinance}
        handleRefresh={handleRefresh}
        saveChanges={saveChanges}
        allTransactions={transactions}
      />
    </div>
  );
};

export default FinanceManagement;
