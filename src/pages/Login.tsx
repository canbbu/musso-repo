import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if already logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      toast({
        title: "로그인 실패",
        description: "닉네임과 비밀번호를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // players 테이블에서 사용자 조회
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .eq('is_deleted', false)
        .single();
      
      if (error) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      // 비밀번호 검증 (실제로는 bcrypt 등의 라이브러리로 해시 비교)
      if (data.password !== password) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      
      // 로그인 성공
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', data.id);
      localStorage.setItem('userName', data.name || data.username);
      localStorage.setItem('userRole', data.role || 'player'); // 역할 저장
      
      toast({
        title: "로그인 성공",
        description: `${data.name || data.username}님, 환영합니다!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "로그인 실패",
        description: error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl">축구회 로그인</CardTitle>
          <CardDescription>계정에 로그인하여 시스템을 이용하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">유저네임</Label>
              <Input 
                id="username" 
                placeholder="유저네임을 입력하세요" 
                value={username} 
                onChange={(e) => setusername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="비밀번호를 입력하세요" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
            © 2024 축구회 관리 시스템
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
