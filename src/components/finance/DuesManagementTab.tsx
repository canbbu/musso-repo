
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus } from "lucide-react";
import MemberDuesTable from './MemberDuesTable';
import { MemberDues } from '@/types/finance';

interface DuesManagementTabProps {
  memberDues: MemberDues[];
  onTogglePayment: (memberId: number) => void;
  canManage: boolean;
}

const DuesManagementTab = ({
  memberDues,
  onTogglePayment,
  canManage
}: DuesManagementTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>회비 관리</CardTitle>
          <CardDescription>회원별 회비 납부 상태를 관리합니다.</CardDescription>
        </div>
        {canManage && (
          <Button size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            새 회비
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <MemberDuesTable 
          memberDues={memberDues}
          onTogglePayment={onTogglePayment}
          canManage={canManage}
        />
      </CardContent>
    </Card>
  );
};

export default DuesManagementTab;
