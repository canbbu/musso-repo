import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/shared/lib/supabase/client';
import { insertPlayerSportAccess } from '@/features/sport-access/api/sport-access.api';

/** 풋살 전용 회원가입: 풋살 권한만 부여 */
export default function FutsalRegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name?.trim() || !username?.trim() || !password) {
      toast({
        title: '회원가입 실패',
        description: '이름, 아이디, 비밀번호를 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data: existingUser, error: checkError } = await supabase
        .from('players')
        .select('id')
        .eq('username', username.trim())
        .maybeSingle();
      if (checkError) throw new Error('사용자 확인 중 오류가 발생했습니다.');
      if (existingUser) {
        toast({
          title: '회원가입 실패',
          description: '이미 사용 중인 아이디입니다.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .insert({
          name: name.trim(),
          username: username.trim(),
          password,
          role: 'player',
          is_deleted: false,
        })
        .select('id')
        .single();
      if (error) throw new Error('회원등록 처리 중 오류가 발생했습니다.');

      await insertPlayerSportAccess(data.id, name.trim(), false, true);

      toast({
        title: '회원가입 완료',
        description: '풋살 회원으로 가입되었습니다. 로그인 후 이용해 주세요.',
      });
      navigate('/futsal/login');
    } catch (err) {
      toast({
        title: '회원가입 실패',
        description: err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl">풋살 회원가입</CardTitle>
          <CardDescription>풋살 페이지 이용을 위한 회원가입입니다. 풋살 권한만 부여됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                placeholder="로그인에 사용할 아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link to="/futsal/login" className="text-primary font-medium underline">
              로그인
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
