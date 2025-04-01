
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('member');
  
  useEffect(() => {
    // Check if already logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!userId || !password) {
      toast({
        title: "로그인 실패",
        description: "아이디와 비밀번호를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // For demo purposes, we'll just accept any credentials
    // and store the selected role
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', `사용자(${userRole})`);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', userId);
    
    toast({
      title: "로그인 성공",
      description: `${userRole} 권한으로 로그인되었습니다.`,
    });
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  // Role options with Korean labels
  const roleOptions = [
    { value: 'president', label: '회장' },
    { value: 'vice_president', label: '부회장' },
    { value: 'coach', label: '감독' },
    { value: 'assistant_coach', label: '코치' },
    { value: 'treasurer', label: '회계' },
    { value: 'member', label: '일반회원' },
  ];

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
              <Label htmlFor="userId">아이디</Label>
              <Input 
                id="userId" 
                placeholder="아이디를 입력하세요" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">권한 선택 (데모용)</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="권한을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                * 데모 목적으로 권한을 직접 선택할 수 있습니다.
              </p>
            </div>
            <Button type="submit" className="w-full">로그인</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            © 2024 축구회 관리 시스템
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
