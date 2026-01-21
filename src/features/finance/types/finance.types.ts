// Finance 관련 타입 정의

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  member?: string;
}

export interface MemberDues {
  id: number;
  name: string;
  paid: boolean;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paidAmount?: number;
}



