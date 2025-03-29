
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, BarChart2, AlertCircle, PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface FinanceTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface MemberDue {
  id: number;
  name: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
  dueDate: string;
  paidDate?: string;
  confirmedBy?: string;
}

const Finance = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([
    {
      id: 1,
      date: '2023-11-20',
      description: '11월 회비 수입',
      amount: 500000,
      type: 'income',
      category: '회비',
      createdBy: '이회계',
      createdAt: '2023-11-20 14:30'
    },
    {
      id: 2,
      date: '2023-11-15',
      description: '운동장 대여비',
      amount: 200000,
      type: 'expense',
      category: '시설비',
      createdBy: '김운영',
      createdAt: '2023-11-15 09:45',
      updatedBy: '이회계',
      updatedAt: '2023-11-15 10:20'
    },
    {
      id: 3,
      date: '2023-11-10',
      description: '유니폼 구매',
      amount: 300000,
      type: 'expense',
      category: '장비',
      createdBy: '이회계',
      createdAt: '2023-11-10 16:05'
    },
    {
      id: 4,
      date: '2023-11-05',
      description: '후원금',
      amount: 200000,
      type: 'income',
      category: '후원',
      createdBy: '김운영',
      createdAt: '2023-11-05 11:30'
    }
  ]);

  const [memberDues, setMemberDues] = useState<MemberDue[]>([
    {
      id: 1,
      name: '김민수',
      status: 'paid',
      amount: 30000,
      dueDate: '2023-11-10',
      paidDate: '2023-11-08',
      confirmedBy: '이회계'
    },
    {
      id: 2,
      name: '이지훈',
      status: 'paid',
      amount: 30000,
      dueDate: '2023-11-10',
      paidDate: '2023-11-05',
      confirmedBy: '김운영'
    },
    {
      id: 3,
      name: '박세준',
      status: 'pending',
      amount: 30000,
      dueDate: '2023-11-10'
    },
    {
      id: 4,
      name: '정우진',
      status: 'overdue',
      amount: 30000,
      dueDate: '2023-11-10'
    },
    {
      id: 5,
      name: '오현우',
      status: 'paid',
      amount: 30000,
      dueDate: '2023-11-10',
      paidDate: '2023-11-09',
      confirmedBy: '이회계'
    }
  ]);
  
  useEffect(() => {
    // Check authentication and permissions
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (role !== 'executive' && role !== 'accountant') {
      navigate('/dashboard');
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserId(id);
  }, [navigate]);

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  const duesCollected = memberDues
    .filter(m => m.status === 'paid')
    .reduce((sum, m) => sum + m.amount, 0);
  
  const duesPending = memberDues
    .filter(m => m.status === 'pending' || m.status === 'overdue')
    .reduce((sum, m) => sum + m.amount, 0);
    
  const handleConfirmPayment = (id: number) => {
    if (!userName) return;
    
    setMemberDues(memberDues.map(member => {
      if (member.id === id) {
        return {
          ...member,
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0],
          confirmedBy: userName
        };
      }
      return member;
    }));
  };
  
  const handleAddTransaction = () => {
    // In a real app, this would open a modal or navigate to a form
    console.log("Add transaction clicked - would open form");
    // For demo, we'll just add a dummy transaction
    if (!userName) return;
    
    const newTransaction: FinanceTransaction = {
      id: transactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      description: '새로운 거래 내역',
      amount: 50000,
      type: 'income',
      category: '기타',
      createdBy: userName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    
    setTransactions([newTransaction, ...transactions]);
  };

  return (
    <div className="finance-container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Finance Management</h1>
        <p className="text-gray-600">Track team finances, dues, and expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Current Balance
            </CardTitle>
            <CardDescription>Available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{balance.toLocaleString()}원</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
              Dues Collected
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{duesCollected.toLocaleString()}원</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-amber-600" />
              Total Expenses
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalExpenses.toLocaleString()}원</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
              Pending Dues
            </CardTitle>
            <CardDescription>Outstanding amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{duesPending.toLocaleString()}원</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="member-dues">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">회비 납부 현황</h2>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
              납부 알림 보내기
            </button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마감일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">확인자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberDues.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.amount.toLocaleString()}원</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.dueDate}</div>
                          {member.paidDate && (
                            <div className="text-xs text-green-600">납부일: {member.paidDate}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.status === 'paid' ? 'bg-green-100 text-green-800' :
                            member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {member.status === 'paid' ? '납부 완료' :
                             member.status === 'pending' ? '대기 중' : '기한 초과'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {member.confirmedBy || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.status !== 'paid' && (
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleConfirmPayment(member.id)}
                            >
                              납부 확인
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="recent-transactions">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">최근 거래 내역</h2>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
              onClick={handleAddTransaction}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              새 거래 등록
            </button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록자</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.date}</div>
                          <div className="text-xs text-gray-500">
                            등록: {transaction.createdAt}
                          </div>
                          {transaction.updatedAt && (
                            <div className="text-xs text-gray-500">
                              수정: {transaction.updatedAt}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}원
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {transaction.createdBy}
                            {transaction.updatedBy && (
                              <div className="text-xs text-gray-500">
                                수정: {transaction.updatedBy}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">지출 분석</h2>
        <Card className="h-80">
          <CardContent className="p-6">
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">차트 및 지출 분석 데이터가 여기에 표시됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Finance;
