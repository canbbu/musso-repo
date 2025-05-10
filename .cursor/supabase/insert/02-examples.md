# Supabase 데이터 입력 컴포넌트 변환 예시

이 문서는 각 데이터 입력 컴포넌트가 어떻게 Supabase와 연동되는지 구체적인 예시를 제공합니다.

## 1. 공지사항 폼 컴포넌트 (AnnouncementForm)

### 변환 전 (mock 데이터)
```tsx
// AnnouncementForm.tsx 일부
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onSubmit(formData);
};
```

### 변환 후 (Supabase 연동)
```tsx
// AnnouncementForm.tsx 일부
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    await onSubmit(formData);
  } catch (error) {
    console.error('공지사항 저장 오류:', error);
  } finally {
    setSubmitting(false);
  }
};

// 폼 내부에 로딩 상태 표시 추가
<Button type="submit" className="w-full" disabled={submitting}>
  {submitting ? (
    <>
      <span className="animate-spin mr-2">⟳</span>
      저장 중...
    </>
  ) : (
    '저장하기'
  )}
</Button>
```

## 2. 경기 참석 관리 컴포넌트 (PlayerAttendanceForm)

### 변환 전 (mock 데이터)
```tsx
// PlayerAttendanceForm.tsx 일부
const handleAttendanceChange = (playerId: string, status: 'attending' | 'not_attending') => {
  // 로컬 상태 업데이트만 수행
  setPlayerResponses(prev => ({
    ...prev,
    [playerId]: status
  }));
};
```

### 변환 후 (Supabase 연동)
```tsx
// PlayerAttendanceForm.tsx 일부
const handleAttendanceChange = async (playerId: string, status: 'attending' | 'not_attending') => {
  // 변경 중인 플레이어 ID 저장
  setChangingPlayerId(playerId);
  
  try {
    // Supabase 연동 함수 호출
    await onAttendanceChange(matchId, playerId, status);
    
    // 로컬 상태 업데이트
    setPlayerResponses(prev => ({
      ...prev,
      [playerId]: status
    }));
  } catch (error) {
    console.error('참석 상태 변경 오류:', error);
  } finally {
    setChangingPlayerId(null);
  }
};

// 각 플레이어 버튼에 로딩 상태 표시 추가
<Button 
  variant={playerResponses[player.id] === 'attending' ? 'default' : 'outline'}
  className="flex-1"
  onClick={() => handleAttendanceChange(player.id, 'attending')}
  disabled={changingPlayerId === player.id}
>
  {changingPlayerId === player.id ? (
    <span className="animate-spin">⟳</span>
  ) : (
    '참석'
  )}
</Button>
```

## 3. 재정 관리 컴포넌트 (DuesManagementTab)

### 변환 전 (mock 데이터)
```tsx
// DuesManagementTab.tsx 일부
const handleTogglePayment = (memberId: number) => {
  togglePaymentStatus(memberId);
};
```

### 변환 후 (Supabase 연동)
```tsx
// DuesManagementTab.tsx 일부
const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);

const handleTogglePayment = async (memberId: number) => {
  setUpdatingMemberId(memberId);
  
  try {
    await togglePaymentStatus(memberId);
  } catch (error) {
    console.error('회비 납부 상태 변경 오류:', error);
  } finally {
    setUpdatingMemberId(null);
  }
};

// 납부 상태 토글 버튼에 로딩 상태 표시 추가
<Button
  variant={memberDue.paid ? "destructive" : "default"}
  size="sm"
  onClick={() => handleTogglePayment(memberDue.id)}
  disabled={updatingMemberId === memberDue.id}
>
  {updatingMemberId === memberDue.id ? (
    <span className="animate-spin">⟳</span>
  ) : memberDue.paid ? (
    "납부 취소"
  ) : (
    "납부 확인"
  )}
</Button>
```

## 4. 거래 추가 컴포넌트 (AddTransactionForm)

### 변환 전 (mock 데이터)
```tsx
// AddTransactionForm.tsx 일부
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onAddTransaction(transactionData);
  resetForm();
};
```

### 변환 후 (Supabase 연동)
```tsx
// AddTransactionForm.tsx 일부
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    await onAddTransaction(transactionData);
    resetForm();
  } catch (error) {
    console.error('거래 추가 오류:', error);
  } finally {
    setSubmitting(false);
  }
};

// 폼 버튼에 로딩 상태 추가
<Button type="submit" className="w-full" disabled={submitting}>
  {submitting ? (
    <>
      <span className="animate-spin mr-2">⟳</span>
      추가 중...
    </>
  ) : (
    '거래 추가'
  )}
</Button>
```

## 5. 데이터 업데이트 후 실시간 반영 예시

### Supabase 실시간 구독 설정
```tsx
// useFinanceData.tsx 일부
useEffect(() => {
  // ... 기존 데이터 불러오기 코드 ...
  
  // 실시간 구독 설정
  const transactionsSubscription = supabase
    .channel('public:transactions')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'transactions' }, 
      (payload) => {
        // 변경 이벤트에 따라 처리
        if (payload.eventType === 'INSERT') {
          // 새 거래 추가
          const newTransaction = payload.new as any;
          setTransactions(prev => [
            {
              id: newTransaction.id,
              date: newTransaction.date,
              description: newTransaction.description,
              amount: newTransaction.amount,
              type: newTransaction.type,
              category: newTransaction.category,
              member: newTransaction.member
            },
            ...prev
          ]);
        } else if (payload.eventType === 'UPDATE') {
          // 거래 업데이트
          const updatedTransaction = payload.new as any;
          setTransactions(prev => prev.map(t => 
            t.id === updatedTransaction.id 
              ? {
                  id: updatedTransaction.id,
                  date: updatedTransaction.date,
                  description: updatedTransaction.description,
                  amount: updatedTransaction.amount,
                  type: updatedTransaction.type,
                  category: updatedTransaction.category,
                  member: updatedTransaction.member
                }
              : t
          ));
        } else if (payload.eventType === 'DELETE') {
          // 거래 삭제
          const deletedId = payload.old.id;
          setTransactions(prev => prev.filter(t => t.id !== deletedId));
        }
      }
    )
    .subscribe();
  
  // 회비 상태 구독
  const duesSubscription = supabase
    .channel('public:member_dues')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'member_dues' }, 
      () => {
        // 변경이 있을 때 회비 데이터 다시 로드
        fetchDuesData();
      }
    )
    .subscribe();
  
  // 클린업 함수
  return () => {
    supabase.removeChannel(transactionsSubscription);
    supabase.removeChannel(duesSubscription);
  };
}, []);
```

## 6. 권한 체크 기능 추가 예시

### Supabase RLS 정책과 함께 사용하는 권한 체크
```tsx
// useAuth.tsx 일부 (Supabase Auth 사용)
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          
          // 사용자 역할 가져오기
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUserRole(data?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // 권한 체크 함수
  const canManageAnnouncements = () => {
    return userRole === 'admin' || userRole === 'president' || userRole === 'vice_president';
  };
  
  const canManageFinance = () => {
    return userRole === 'admin' || userRole === 'treasurer';
  };
  
  const canManageMatches = () => {
    return userRole === 'admin' || userRole === 'coach';
  };
  
  return {
    user,
    userRole,
    canManageAnnouncements,
    canManageFinance,
    canManageMatches
  };
}
```

## 7. 이미지 업로드 기능 추가 예시

### Supabase Storage 활용한 이미지 업로드
```tsx
// useImageUpload.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const uploadImage = async (file: File, bucket: string, folder: string) => {
    if (!file) return null;
    
    try {
      setUploading(true);
      setError(null);
      
      // 파일 이름 생성 (고유성 보장)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // 공개 URL 가져오기
      const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setError(err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다');
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  return {
    uploadImage,
    uploading,
    error
  };
}
``` 