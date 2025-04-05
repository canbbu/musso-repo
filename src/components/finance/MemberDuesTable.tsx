
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { MemberDues } from '@/types/finance';

interface MemberDuesTableProps {
  memberDues: MemberDues[];
  onTogglePayment: (memberId: number) => void;
  canManage: boolean;
}

const MemberDuesTable = ({ memberDues, onTogglePayment, canManage }: MemberDuesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회원명</TableHead>
            <TableHead>납부기한</TableHead>
            <TableHead>금액</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>납부일</TableHead>
            {canManage && <TableHead className="text-right">관리</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberDues.map((due) => (
            <TableRow key={due.id}>
              <TableCell className="font-medium">{due.name}</TableCell>
              <TableCell>{due.dueDate}</TableCell>
              <TableCell>{due.amount.toLocaleString()}원</TableCell>
              <TableCell>
                {due.paid ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    납부 완료
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <X className="h-3 w-3 mr-1" />
                    미납
                  </span>
                )}
              </TableCell>
              <TableCell>{due.paidDate || '-'}</TableCell>
              {canManage && (
                <TableCell className="text-right">
                  <Button 
                    variant={due.paid ? "destructive" : "default"} 
                    size="sm" 
                    onClick={() => onTogglePayment(due.id)}
                  >
                    {due.paid ? '납부 취소' : '납부 확인'}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}

          {memberDues.length === 0 && (
            <TableRow>
              <TableCell colSpan={canManage ? 6 : 5} className="text-center py-4">
                회비 정보가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MemberDuesTable;
