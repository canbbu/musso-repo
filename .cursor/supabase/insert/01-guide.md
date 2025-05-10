# Supabase 데이터 입력 컴포넌트 연결 가이드

이 문서는 현재 프로젝트의 데이터 입력 컴포넌트를 Supabase와 연결하는 방법을 설명합니다.

## 1. 주요 데이터 입력 컴포넌트

프로젝트 분석 결과, 다음 3개의 주요 데이터 입력 기능을 가진 컴포넌트를 발견했습니다:

1. **공지사항 관리** - `AnnouncementManagement.tsx` 및 `useAnnouncementData.tsx`
2. **경기 관리** - `MatchManagement.tsx` 및 `useMatchData.tsx`
3. **재정 관리** - `FinanceManagement.tsx` 및 `useFinanceData.tsx`

## 2. 연결 단계별 가이드

### 2.1 공지사항 (Announcements) 연결

1. `useAnnouncementData.tsx` 훅을 다음과 같이 수정:

```typescript
import { useState, useEffect } from 'react';
import { Announcement, AnnouncementFormData } from '@/types/announcement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function useAnnouncementData() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 공지사항 불러오기
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) throw error;
        setAnnouncements(data || []);
      } catch (err) {
        console.error('공지사항 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '공지사항을 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnnouncements();
  }, []);
  
  // 공지사항 생성
  const handleCreateAnnouncement = async (formData: AnnouncementFormData) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          title: formData.title!,
          type: formData.type as 'notice' | 'match',
          content: formData.content!,
          date: formData.date!,
          author: formData.author!,
          attendance_tracking: formData.attendanceTracking,
          location: formData.location,
          opponent: formData.opponent,
          match_time: formData.matchTime
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newItem: Announcement = {
        id: data.id,
        title: data.title,
        type: data.type,
        content: data.content,
        date: data.date,
        author: data.author,
        attendanceTracking: data.attendance_tracking,
        location: data.location,
        opponent: data.opponent,
        matchTime: data.match_time
      };
      
      setAnnouncements(prev => [...prev, newItem]);
      
      toast({
        title: "등록 완료",
        description: `새 ${formData.type === 'notice' ? '공지사항' : '경기 일정'}이 등록되었습니다.`,
      });
      
      return newItem;
    } catch (err) {
      toast({
        title: "등록 실패",
        description: err instanceof Error ? err.message : '공지사항 등록 중 오류가 발생했습니다',
        variant: "destructive"
      });
      throw err;
    }
  };

  // 공지사항 수정
  const handleUpdateAnnouncement = async (formData: AnnouncementFormData) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: formData.title,
          type: formData.type,
          content: formData.content,
          date: formData.date,
          author: formData.author,
          attendance_tracking: formData.attendanceTracking,
          location: formData.location,
          opponent: formData.opponent,
          match_time: formData.matchTime
        })
        .eq('id', formData.id);
      
      if (error) throw error;
      
      setAnnouncements(prev => 
        prev.map(item => 
          item.id === formData.id ? { ...item, ...formData as Announcement } : item
        )
      );
      
      toast({
        title: "수정 완료",
        description: "항목이 성공적으로 수정되었습니다.",
      });
    } catch (err) {
      toast({
        title: "수정 실패",
        description: err instanceof Error ? err.message : '공지사항 수정 중 오류가 발생했습니다',
        variant: "destructive"
      });
      throw err;
    }
  };

  // 공지사항 삭제
  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "항목 삭제 완료",
        description: "선택한 항목이 삭제되었습니다.",
      });
    } catch (err) {
      toast({
        title: "삭제 실패",
        description: err instanceof Error ? err.message : '공지사항 삭제 중 오류가 발생했습니다',
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    announcements,
    loading,
    error,
    createAnnouncement: handleCreateAnnouncement,
    updateAnnouncement: handleUpdateAnnouncement,
    deleteAnnouncement: handleDeleteAnnouncement
  };
}
```

### 2.2 경기 (Matches) 연결

1. `useMatchData.tsx` 훅을 다음과 같이 수정:

```typescript
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export interface Attendance {
  attending: number;
  notAttending: number;
  pending: number;
}

export interface Match {
  id: number;
  date: string;
  location: string;
  opponent: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  attendance: Attendance;
  userResponse?: 'attending' | 'notAttending' | null;
  score?: string;
  result?: 'win' | 'loss' | 'draw';
  notes?: string;
  mvp?: string;
  review?: string;
}

export const useMatchData = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  // 경기 데이터 불러오기
  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        
        // 경기 정보 가져오기
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .order('date', { ascending: false });
          
        if (matchesError) throw matchesError;
        
        // 각 경기별 참석 정보 불러오기
        const matchesWithAttendance = await Promise.all(
          (matchesData || []).map(async match => {
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('match_attendance')
              .select('status')
              .eq('match_id', match.id);
              
            if (attendanceError) throw attendanceError;
            
            const attending = attendanceData?.filter(a => a.status === 'attending').length || 0;
            const notAttending = attendanceData?.filter(a => a.status === 'not_attending').length || 0;
            const pending = attendanceData?.filter(a => a.status === 'pending').length || 0;
            
            return {
              id: match.id,
              date: match.date,
              location: match.location,
              opponent: match.opponent,
              status: match.status,
              attendance: { attending, notAttending, pending },
              score: match.score,
              result: match.result,
              notes: match.notes,
              mvp: match.mvp,
              review: match.review
            } as Match;
          })
        );
        
        setMatches(matchesWithAttendance);
      } catch (err) {
        console.error('경기 정보 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '경기 정보를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatches();
  }, []);

  // 참석 상태 변경
  const handleAttendanceChange = async (matchId: number, response: 'attending' | 'notAttending') => {
    try {
      const userId = '현재_로그인_사용자_ID'; // 실제 구현시 인증된 사용자 ID로 대체
      
      // 기존 참석 상태 확인
      const { data: existingData, error: checkError } = await supabase
        .from('match_attendance')
        .select('*')
        .eq('match_id', matchId)
        .eq('player_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingData) {
        // 기존 참석 상태 업데이트
        const { error: updateError } = await supabase
          .from('match_attendance')
          .update({ status: response === 'attending' ? 'attending' : 'not_attending' })
          .eq('id', existingData.id);
          
        if (updateError) throw updateError;
      } else {
        // 새 참석 상태 추가
        const { error: insertError } = await supabase
          .from('match_attendance')
          .insert({
            match_id: matchId,
            player_id: userId,
            status: response === 'attending' ? 'attending' : 'not_attending'
          });
          
        if (insertError) throw insertError;
      }
      
      // 경기 참석 상태 업데이트된 최신 데이터로 상태 업데이트
      const match = matches.find(m => m.id === matchId);
      if (match) {
        const oldResponse = match.userResponse;
        const newAttendance = { ...match.attendance };
        
        if (oldResponse === 'attending') newAttendance.attending--;
        if (oldResponse === 'notAttending') newAttendance.notAttending--;
        if (oldResponse === null) newAttendance.pending--;
        
        if (response === 'attending') newAttendance.attending++;
        if (response === 'notAttending') newAttendance.notAttending++;
        
        setMatches(matches.map(m => 
          m.id === matchId ? { 
            ...m, 
            attendance: newAttendance,
            userResponse: response 
          } : m
        ));
      }
      
      toast({
        title: response === 'attending' ? '참석 확인' : '불참 확인',
        description: `${match?.opponent}와의 경기에 ${response === 'attending' ? '참석' : '불참'}으로 표시되었습니다.`,
      });
    } catch (err) {
      toast({
        title: "상태 변경 실패",
        description: err instanceof Error ? err.message : '참석 상태 변경 중 오류가 발생했습니다',
        variant: "destructive"
      });
    }
  };

  // 오늘의 경기 확인
  const checkForTodaysMatch = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTodaysMatch = matches.find(match => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() === today.getTime() && match.status === 'completed';
    });
    
    if (completedTodaysMatch) {
      setSelectedMatchId(completedTodaysMatch.id);
    }
    
    return completedTodaysMatch;
  };

  const currentYearMatches = matches.filter(
    match => new Date(match.date).getFullYear() === new Date().getFullYear()
  ).length;
  
  return {
    matches,
    loading,
    error,
    selectedMatchId,
    setSelectedMatchId,
    handleAttendanceChange,
    currentYearMatches,
    checkForTodaysMatch
  };
};
```

### 2.3 재정 (Finance) 연결

1. `useFinanceData.tsx` 훅을 다음과 같이 수정:

```typescript
import { useState, useEffect } from 'react';
import { Transaction, MemberDues } from '@/types/finance';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

export const useFinanceData = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [memberDues, setMemberDues] = useState<MemberDues[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 거래 내역 페이지네이션
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 10;
  
  // 거래 내역 및 회비 데이터 불러오기
  useEffect(() => {
    async function fetchFinanceData() {
      try {
        setLoading(true);
        
        // 거래 내역 불러오기
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
          
        if (transactionsError) throw transactionsError;
        
        // 회비 납부 현황 불러오기
        const { data: duesData, error: duesError } = await supabase
          .from('member_dues')
          .select('*')
          .order('name');
          
        if (duesError) throw duesError;
        
        // 데이터 변환
        const formattedTransactions: Transaction[] = transactionsData.map(t => ({
          id: t.id,
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          member: t.member
        }));
        
        const formattedDues: MemberDues[] = duesData.map(d => ({
          id: d.id,
          name: d.name,
          paid: d.paid,
          dueDate: d.due_date,
          amount: d.amount,
          paidDate: d.paid_date,
          paidAmount: d.paid_amount
        }));
        
        setTransactions(formattedTransactions);
        setMemberDues(formattedDues);
      } catch (err) {
        console.error('재정 데이터 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '재정 정보를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFinanceData();
  }, []);
  
  // 회비 납부 상태 변경
  const togglePaymentStatus = async (memberId: number) => {
    try {
      const due = memberDues.find(d => d.id === memberId);
      if (!due) return;
      
      const newPaidState = !due.paid;
      const now = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('member_dues')
        .update({ 
          paid: newPaidState,
          paid_date: newPaidState ? now : null,
          paid_amount: newPaidState ? due.amount : null
        })
        .eq('id', memberId);
        
      if (error) throw error;
      
      // 상태 업데이트
      setMemberDues(dues => dues.map(d => {
        if (d.id === memberId) {
          return {
            ...d,
            paid: newPaidState,
            paidDate: newPaidState ? now : undefined,
            paidAmount: newPaidState ? d.amount : undefined
          };
        }
        return d;
      }));
      
      // 회비 납부시 거래 내역 자동 추가
      if (newPaidState) {
        // 거래 내역 추가
        const { data, error: txError } = await supabase
          .from('transactions')
          .insert({
            date: now,
            description: `회비 납부 - ${due.name}`,
            amount: due.amount,
            type: 'income',
            category: '회비',
            member: due.name
          })
          .select()
          .single();
          
        if (txError) throw txError;
        
        // 거래 내역 상태 업데이트
        setTransactions(prev => [
          {
            id: data.id,
            date: data.date,
            description: data.description,
            amount: data.amount,
            type: data.type,
            category: data.category,
            member: data.member
          },
          ...prev
        ]);
      }
      
      toast({
        title: newPaidState ? "납부 확인" : "납부 취소",
        description: `${due.name}님의 회비 납부가 ${newPaidState ? '확인' : '취소'}되었습니다.`,
      });
    } catch (err) {
      toast({
        title: "상태 변경 실패",
        description: err instanceof Error ? err.message : '회비 납부 상태 변경 중 오류가 발생했습니다',
        variant: "destructive"
      });
    }
  };
  
  // 계산된 값들
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;
  
  const paidDuesCount = memberDues.filter(d => d.paid).length;
  const totalDuesCount = memberDues.length;
  const duesCompletionPercent = totalDuesCount > 0 ? Math.round((paidDuesCount / totalDuesCount) * 100) : 0;
  
  // 현재 월 거래 내역 수
  const currentMonthTransactionsCount = transactions.filter(t => {
    const date = new Date(t.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  
  // 페이지네이션 처리된 거래 내역
  const totalTransactionPages = Math.ceil(transactions.length / transactionsPerPage);
  const paginatedTransactions = transactions.slice(
    (transactionPage - 1) * transactionsPerPage,
    transactionPage * transactionsPerPage
  );

  return {
    transactions,
    memberDues,
    loading,
    error,
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
```

## 3. 컴포넌트 수정사항

각 데이터 입력 컴포넌트에서는 로딩 상태와 오류 처리를 위한 UI를 추가해야 합니다:

### 3.1 AnnouncementManagement.tsx 수정

```tsx
// 로딩 상태 및 오류 표시 추가
const { announcements, loading, error, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncementData();

// TabsContent 내에 로딩/오류 처리 추가
<TabsContent value="list">
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>관리 목록</CardTitle>
      <CardDescription>공지사항 및 경기 일정 목록</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 text-center">
          <p>오류: {error}</p>
        </div>
      ) : (
        <AnnouncementList 
          announcements={announcements}
          onEdit={handleEditItem}
          onDelete={deleteAnnouncement}
        />
      )}
    </CardContent>
  </Card>
</TabsContent>
```

### 3.2 MatchManagement.tsx 및 FinanceManagement.tsx에도 동일한 방식으로 로딩 및 오류 처리 추가

## 4. 전체 연결 절차

1. Supabase 설정:
   - `.env` 파일에 Supabase URL과 API 키 설정
   - `supabase.ts` 클라이언트 설정

2. 데이터 훅 수정:
   - `useAnnouncementData.tsx`
   - `useMatchData.tsx`
   - `useFinanceData.tsx`

3. 컴포넌트 수정:
   - 각 관리 컴포넌트에 로딩 및 오류 UI 추가
   - 반응형 처리 추가

4. 테스트:
   - 각 데이터 작성 기능을 테스트하고 Supabase 데이터베이스에 올바르게 저장되는지 확인
   - 실시간 업데이트가 필요한 경우 Supabase 구독 설정 추가

## 5. 주의사항

1. **타입 변환**: Supabase에서 가져온 데이터의 필드명이 snake_case인 반면, 프론트엔드에서는 camelCase를 사용할 수 있습니다. 데이터 변환 시 일관된 변환 로직을 사용하세요.

2. **인증 연동**: 현재 가이드에서는 인증 기능을 다루지 않았습니다. Supabase Auth와 연동하여 사용자별 권한 관리를 구현해야 합니다.

3. **오류 처리**: 모든 Supabase 작업에서 오류 처리를 철저히 하고, 사용자에게 명확한 피드백을 제공하세요.

4. **실시간 기능**: 여러 사용자가 동시에 작업할 경우 실시간 업데이트가 필요한 경우 Supabase의 실시간 구독 기능을 활용하세요. 