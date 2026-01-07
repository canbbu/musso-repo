
import { useState, useEffect } from 'react';
import { Transaction, MemberDues } from '../types/finance.types';
import { useToast } from '@/shared/hooks/use-toast';

export const useFinanceData = () => {
  const { toast } = useToast();
  
  // Mock transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, date: '2023-11-25', description: '11월 회비 납부 - 김선수', amount: 50000, type: 'income', category: '회비', member: '김선수' },
    { id: 2, date: '2023-11-25', description: '11월 회비 납부 - 이공격수', amount: 50000, type: 'income', category: '회비', member: '이공격수' },
    { id: 3, date: '2023-11-24', description: '11월 회비 납부 - 박수비', amount: 50000, type: 'income', category: '회비', member: '박수비' },
    { id: 4, date: '2023-11-22', description: '풋살장 대여비', amount: 120000, type: 'expense', category: '장소 대여' },
    { id: 5, date: '2023-11-20', description: '유니폼 구매', amount: 250000, type: 'expense', category: '장비' },
    { id: 6, date: '2023-11-18', description: '10월 회비 납부 - 정미드필더', amount: 50000, type: 'income', category: '회비', member: '정미드필더' },
    { id: 7, date: '2023-11-15', description: '음료 구매', amount: 35000, type: 'expense', category: '물품' },
    { id: 8, date: '2023-11-10', description: '10월 회비 납부 - 최골키퍼', amount: 50000, type: 'income', category: '회비', member: '최골키퍼' },
    { id: 9, date: '2023-11-08', description: '이벤트 후 식사비', amount: 150000, type: 'expense', category: '식비' },
    { id: 10, date: '2023-11-05', description: '10월 회비 납부 - 강수비수', amount: 50000, type: 'income', category: '회비', member: '강수비수' },
    { id: 11, date: '2023-11-03', description: '공 구매', amount: 45000, type: 'expense', category: '장비' },
    { id: 12, date: '2023-10-30', description: '10월 회비 납부 - 장미드필더', amount: 50000, type: 'income', category: '회비', member: '장미드필더' },
    { id: 13, date: '2023-10-28', description: '풋살장 대여비', amount: 120000, type: 'expense', category: '장소 대여' },
    { id: 14, date: '2023-10-25', description: '9월 회비 납부 - 김선수', amount: 50000, type: 'income', category: '회비', member: '김선수' },
    { id: 15, date: '2023-10-25', description: '9월 회비 납부 - 이공격수', amount: 50000, type: 'income', category: '회비', member: '이공격수' },
    { id: 16, date: '2023-10-20', description: '음료 구매', amount: 30000, type: 'expense', category: '물품' },
    { id: 17, date: '2023-10-15', description: '이벤트 후 식사비', amount: 140000, type: 'expense', category: '식비' },
    { id: 18, date: '2023-10-10', description: '9월 회비 납부 - 박수비', amount: 50000, type: 'income', category: '회비', member: '박수비' },
    { id: 19, date: '2023-10-05', description: '9월 회비 납부 - 정미드필더', amount: 50000, type: 'income', category: '회비', member: '정미드필더' },
    { id: 20, date: '2023-10-01', description: '유니폼 세탁비', amount: 30000, type: 'expense', category: '기타' },
  ]);
  
  // Mock member dues data
  const [memberDues, setMemberDues] = useState<MemberDues[]>([
    { id: 1, name: '김선수', paid: true, dueDate: '2023-11-30', amount: 50000, paidDate: '2023-11-25', paidAmount: 50000 },
    { id: 2, name: '이공격수', paid: true, dueDate: '2023-11-30', amount: 50000, paidDate: '2023-11-25', paidAmount: 50000 },
    { id: 3, name: '박수비', paid: true, dueDate: '2023-11-30', amount: 50000, paidDate: '2023-11-24', paidAmount: 50000 },
    { id: 4, name: '정미드필더', paid: false, dueDate: '2023-11-30', amount: 50000 },
    { id: 5, name: '최골키퍼', paid: false, dueDate: '2023-11-30', amount: 50000 },
    { id: 6, name: '강수비수', paid: false, dueDate: '2023-11-30', amount: 50000 },
    { id: 7, name: '장미드필더', paid: false, dueDate: '2023-11-30', amount: 50000 },
  ]);
  
  // Transaction pagination
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 10;
  const totalTransactionPages = Math.ceil(transactions.length / transactionsPerPage);
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage
  );

  // Get current month transactions count
  const currentMonthTransactionsCount = transactions.filter(t => {
    const date = new Date(t.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  
  // Toggle payment status
  const togglePaymentStatus = (memberId: number) => {
    setMemberDues(dues => dues.map(due => {
      if (due.id === memberId) {
        // If already paid, mark as unpaid
        if (due.paid) {
          toast({
            title: "납부 취소",
            description: `${due.name}님의 회비 납부가 취소되었습니다.`,
          });
          return {
            ...due,
            paid: false,
            paidDate: undefined,
            paidAmount: undefined
          };
        } 
        // If unpaid, mark as paid
        else {
          const now = new Date();
          toast({
            title: "납부 확인",
            description: `${due.name}님의 회비 납부가 확인되었습니다.`,
          });
          return {
            ...due,
            paid: true,
            paidDate: now.toISOString().split('T')[0],
            paidAmount: due.amount
          };
        }
      }
      return due;
    }));
  };
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;
  
  const paidDuesCount = memberDues.filter(d => d.paid).length;
  const totalDuesCount = memberDues.length;
  const duesCompletionPercent = Math.round((paidDuesCount / totalDuesCount) * 100);

  return {
    transactions,
    setTransactions,
    memberDues,
    setMemberDues,
    paginatedTransactions,
    transactionPage,
    setTransactionPage,
    totalTransactionPages,
    togglePaymentStatus,
    balance,
    totalIncome,
    totalExpense,
    paidDuesCount,
    totalDuesCount,
    duesCompletionPercent,
    currentMonthTransactionsCount
  };
};
