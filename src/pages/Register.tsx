import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canManageAnnouncements } = useAuth();
  const [name, setName] = useState('');
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [birthday, setBirthday] = useState('');
  const [position, setPosition] = useState('');
  const [bootsBrand, setBootsBrand] = useState('');
  const [favClub, setFavClub] = useState('');
  const [loading, setLoading] = useState(false);

  // 회장/부회장 권한 체크
  if (!canManageAnnouncements()) {
    return <Navigate to="/dashboard" />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!name || !username || !password || !birthday || !position || !bootsBrand || !favClub) {
      toast({
        title: "회원등록 실패",
        description: "이름, 아이디, 비밀번호, 생년월일, 포지션, 축구화 브랜드, 선호 구단을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 닉네임 중복 확인
      const { data: existingUser, error: checkError } = await supabase
        .from('players')
        .select('id')
        .eq('username', username)
        .single();
        
      if (existingUser) {
        toast({
          title: "회원등록 실패",
          description: "이미 사용 중인 닉네임입니다.",
          variant: "destructive"
        });
        return;
      }
      
      // 새 사용자 등록
      const { data, error } = await supabase
        .from('players')
        .insert({
          name: name,
          username: username,
          password: password, // 실제 구현에서는 암호화된 비밀번호 사용
          role: role,
          is_deleted: false,
          birthday: birthday || null,
          position: position || null,
          boots_brand: bootsBrand || null,
          fav_club: favClub || null
        })
        .select()
        .single();
        
      if (error) {
        throw new Error('회원등록 처리 중 오류가 발생했습니다.');
      }
      
      toast({
        title: "회원등록 성공",
        description: `${name} 회원이 축구회에 등록되었습니다.`,
      });
      
      // 입력 필드 초기화
      setName('');
      setusername('');
      setPassword('');
      setRole('player');
      setBirthday('');
      setPosition('');
      setBootsBrand('');
      setFavClub('');
    } catch (error) {
      toast({
        title: "회원등록 실패",
        description: error instanceof Error ? error.message : "회원등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 역할 옵션
  const roleOptions = [
    { value: 'president', label: '회장' },
    { value: 'vice_president', label: '부회장' },
    { value: 'coach', label: '감독' },
    { value: 'assistant_coach', label: '코치' },
    { value: 'treasurer', label: '회계' },
    { value: 'player', label: '일반회원' },
  ];

  const positionOptions = [
    { value: 'DF', label: 'DF' },
    { value: 'MF', label: 'MF' },
    { value: 'FW', label: 'FW' },
    { value: 'ST', label: 'ST' },
    { value: 'GK', label: 'GK' },
  ];

  const bootsBrandOptions = [
    { value: 'PUMA', label: 'PUMA' },
    { value: 'ADIDAS', label: 'ADIDAS' },
    { value: 'UNDERAMOUR', label: 'UNDERAMOUR' },
    { value: 'NIKE', label: 'NIKE' },
    { value: 'NEWBALANCE', label: 'NEWBALANCE' },
    { value: 'MIZNO', label: 'MIZNO' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">회원 등록</h1>
        <p className="text-gray-600 mb-8">새로운 회원 정보를 입력하여 등록하세요.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>회원 정보 입력</CardTitle>
              <CardDescription>새 회원의 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 (예시: 홍길동/91)</Label>
                  <Input 
                    id="name" 
                    placeholder="회원 이름을 입력하세요" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <Input 
                    id="username" 
                    placeholder="사용할 아이디 입력하세요" 
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
                    placeholder="초기 비밀번호를 설정하세요" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">생년월일</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={e => setBirthday(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">포지션</Label>
                  <Select value={position} onValueChange={setPosition} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="포지션을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boots_brand">축구화 브랜드</Label>
                  <Select value={bootsBrand} onValueChange={setBootsBrand} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="축구화 브랜드를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {bootsBrandOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fav_club">선호 구단</Label>
                  <Input
                    id="fav_club"
                    placeholder="선호하는 축구 구단을 입력하세요"
                    value={favClub}
                    onChange={e => setFavClub(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">역할</Label>
                  <Select value={role} onValueChange={setRole} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="회원 역할을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    * 역할에 따라 시스템 권한이 다르게 부여됩니다.
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? '등록 중...' : '회원 등록'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>회원 등록 안내</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>축구회 회원 등록은 회장과 부회장만 할 수 있습니다.</p>
                  <p>회원을 등록하면 초기 비밀번호를 반드시 알려주세요.</p>
                  <p>회원은 첫 로그인 후 비밀번호를 변경하도록 안내해주세요.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>역할별 권한</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-medium">회장/부회장:</span> 회원관리, 공지사항, 일정 관리</li>
                  <li><span className="font-medium">감독/코치:</span> 이벤트 관리, 기록 관리</li>
                  <li><span className="font-medium">회계:</span> 재정 관리</li>
                  <li><span className="font-medium">일반회원:</span> 이벤트 참석 확인, 투표 참여</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register; 