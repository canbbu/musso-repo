
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFinanceData } from '@/hooks/use-finance-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinanceSummaryCards from '@/components/finance/FinanceSummaryCards';
import MemberDuesTable from '@/components/finance/MemberDuesTable';
import TransactionTable from '@/components/finance/TransactionTable';

const FinanceManagement = () => {
  const { canManageFinance } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'summary' | 'dues' | 'transactions'>('summary');
  const [saveChanges, setSaveChanges] = useState(false);
  
  const {
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
        </TabsContent>
        
        <TabsContent value="dues">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>회비 관리</CardTitle>
                <CardDescription>회원별 회비 납부 상태를 관리합니다.</CardDescription>
              </div>
              {canManageFinance() && (
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  새 회비
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <MemberDuesTable 
                memberDues={memberDues}
                onTogglePayment={handleDuesChange}
                canManage={canManageFinance()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>거래 내역</CardTitle>
                <CardDescription>모든 수입 및 지출 내역을 관리합니다.</CardDescription>
              </div>
              {canManageFinance() && (
                <Button className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  새 거래
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <TransactionTable 
                transactions={paginatedTransactions}
                currentPage={transactionPage}
                totalPages={totalTransactionPages}
                onPageChange={setTransactionPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManagement;
