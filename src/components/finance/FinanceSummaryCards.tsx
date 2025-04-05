
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CircleDollarSign, CreditCard, Clock } from "lucide-react";

interface FinanceSummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  paidDuesCount: number;
  totalDuesCount: number;
  duesCompletionPercent: number;
  currentMonthTransactionsCount: number;
}

const FinanceSummaryCards = ({
  balance,
  totalIncome,
  totalExpense,
  paidDuesCount,
  totalDuesCount,
  duesCompletionPercent,
  currentMonthTransactionsCount
}: FinanceSummaryCardsProps) => {
  return (
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
  );
};

export default FinanceSummaryCards;
