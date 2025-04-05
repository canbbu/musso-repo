
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus } from "lucide-react";
import TransactionTable from './TransactionTable';
import { Transaction } from '@/types/finance';

interface TransactionsTabProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canManage: boolean;
}

const TransactionsTab = ({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  canManage
}: TransactionsTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>거래 내역</CardTitle>
          <CardDescription>모든 수입 및 지출 내역을 관리합니다.</CardDescription>
        </div>
        {canManage && (
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            새 거래
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <TransactionTable 
          transactions={transactions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
};

export default TransactionsTab;
