import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null); // 세션 상태 저장
  const { toast } = useToast();
  const { isAuthenticated, userId, logout } = useAuth();
  const navigate = useNavigate();

  // 디버깅 로그: 컴포넌트 마운트 시 인증 상태
  useEffect(() => {
    // 한 번만 실행되도록 설정
    const checkInitialAuth = async () => {
      console.log('[ChangePassword] 컴포넌트 마운트 - 인증 상태:', { 
        isAuthenticated, 
        userId,
        localStorage: {
          isAuthenticated: localStorage.getItem('isAuthenticated'),
          userId: localStorage.getItem('userId'),
          userName: localStorage.getItem('userName')
        }
      });
      
      // 인증 세션 확인 (로그를 위한 확인만 수행, 자동 로그아웃 처리 안함)
      if (isAuthenticated && userId) {
        try {
          const { data } = await supabase.auth.getSession();
          const sessionExists = !!data.session;
          
          setHasSession(sessionExists);
        } catch (error) {
          console.error('[ChangePassword] 세션 확인 오류:', error);
        }
      } else {
        
        // 인증되지 않았을 때만 리다이렉트 - 무한 루프 방지를 위해 조건 체크
        if (!isAuthenticated && !window.location.pathname.includes('/login')) {
          navigate('/login', { state: { returnPath: '/change-password' } });
        }
      }
    };
    
    checkInitialAuth();
    // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행되도록 함
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (newPassword !== confirmPassword) {
      
      toast({
        title: '비밀번호 오류',
        description: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
        variant: 'destructive'
      });
      return;
    }

    if (!userId) {
      
      toast({
        title: '인증 오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive'
      });
      navigate('/login', { state: { returnPath: '/change-password' } });
      return;
    }

    try {
      setIsLoading(true);
      
      
      // Supabase 세션 상태를 다시 확인
      const { data: sessionData } = await supabase.auth.getSession();
      const hasActiveSession = !!sessionData.session;
      
      
      // 세션이 없으면 재로그인 시도
      if (!hasActiveSession) {
        if (!currentPassword) {
          toast({
            title: '인증 필요',
            description: '세션이 만료되었습니다. 현재 비밀번호를 입력하여 재인증해주세요.',
            variant: 'destructive'
          });
          return;
        }
        
        // players 테이블에서 사용자 정보 조회
        const { data: userData, error: userError } = await supabase
          .from('players')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError || !userData) {
          
          toast({
            title: '인증 오류',
            description: '사용자 정보를 찾을 수 없습니다. 로그인 페이지로 이동합니다.',
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }
        
        // 현재 비밀번호 확인
        if (userData.password !== currentPassword) {
          
          toast({
            title: '인증 실패',
            description: '현재 비밀번호가 올바르지 않습니다.',
            variant: 'destructive'
          });
          return;
        }
        
        
      }
      
      // players 테이블에서 현재 사용자가 존재하는지 확인
      
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('[ChangePassword] players 테이블 쿼리 결과', { 
        success: !playerError, 
        playerData, 
        error: playerError ? playerError.message : null
      });

      if (playerError || !playerData) {
        
        toast({
          title: '사용자 오류',
          description: '등록된 회원 정보를 찾을 수 없습니다.',
          variant: 'destructive'
        });
        return;
      }

      // 사용자가 삭제 처리되었는지 확인
      if (playerData.is_deleted) {
        
        toast({
          title: '계정 오류',
          description: '비활성화된 계정입니다. 관리자에게 문의하세요.',
          variant: 'destructive'
        });
        return;
      }

      // 비밀번호 변경 (players 테이블 직접 업데이트)
      
      const { error: updateError } = await supabase
        .from('players')
        .update({ password: newPassword })
        .eq('id', userId);

      if (updateError) {
        
        throw updateError;
      }

      
      toast({
        title: '성공',
        description: '비밀번호가 성공적으로 변경되었습니다.'
      });
      
      // 폼 초기화
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // 3초 후 대시보드로 이동
      setTimeout(() => {
        
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('[ChangePassword] 비밀번호 변경 중 오류 발생', error);
      toast({
        title: '오류 발생',
        description: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      console.log('[ChangePassword] 처리 완료');
    }
  };

  return (
    <div className="container max-w-md py-10">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          뒤로 가기
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
          <CardDescription>
            계정의 비밀번호를 변경합니다.
            {hasSession === false && (
              <p className="mt-2 text-red-500 text-sm">
                세션이 만료되었습니다. 현재 비밀번호를 정확히 입력하면 세션이 갱신됩니다.
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="current-password">
                현재 비밀번호
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-password">
                새 비밀번호
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirm-password">
                새 비밀번호 확인
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '비밀번호 변경'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword; 