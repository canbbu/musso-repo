import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  DollarSign, 
  Calendar, 
  ArrowRightLeft, 
  ChevronRight 
} from "lucide-react";
import { useFinanceData } from '@/hooks/use-finance-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import TransactionTable from '@/components/finance/TransactionTable';
import FinanceSummary from '@/components/finance/FinanceSummary';
import MemberDuesTable from '@/components/finance/MemberDuesTable';
import Layout from '@/components/Layout';

const Finance = () => {
  const { canManageFinance } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'dues' | 'transactions'>('summary');
  
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

  const handleManageFinance = () => {
    navigate('/finance-management');
  };

  return (
    <Layout>
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
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>재정 관리 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab as any}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="summary" className="flex-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  재정 요약
                </TabsTrigger>
                <TabsTrigger value="dues" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  회비 현황
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  거래 내역
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <FinanceSummary 
                  balance={balance}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  paidDuesCount={paidDuesCount}
                  totalDuesCount={totalDuesCount}
                  duesCompletionPercent={duesCompletionPercent}
                  currentMonthTransactionsCount={currentMonthTransactionsCount}
                />
              </TabsContent>

              <TabsContent value="dues">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">이번 달 회비 납부 현황</CardTitle>
                    <CardDescription>
                      현재 {paidDuesCount}/{totalDuesCount} 회원이 납부를 완료했습니다 ({duesCompletionPercent}%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemberDuesTable 
                      memberDues={memberDues} 
                      onTogglePayment={canManageFinance() ? togglePaymentStatus : undefined}
                      canManage={canManageFinance()}
                    />
                  </CardContent>
                  {canManageFinance() && (
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={handleManageFinance}>
                        회비 관리 페이지로 이동
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">최근 거래 내역</CardTitle>
                    <CardDescription>
                      이번 달 총 {currentMonthTransactionsCount}건의 거래가 있었습니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionTable 
                      transactions={paginatedTransactions}
                      currentPage={transactionPage}
                      totalPages={totalTransactionPages}
                      onPageChange={setTransactionPage}
                    />
                  </CardContent>
                  {canManageFinance() && (
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={handleManageFinance}>
                        거래 내역 관리 페이지로 이동
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {canManageFinance() && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleManageFinance} size="lg" className="w-full max-w-md">
              재정 및 회비 관리 페이지로 이동
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Finance;
