import React, { useState, useEffect, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [position, setPosition] = useState('');
  const [bootsBrand, setBootsBrand] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const leagueOptions = [
    { value: 'premier_league', label: '영국 프리미어리그' },
    { value: 'ligue1', label: '프랑스 리그앙' },
    { value: 'laliga', label: '스페인 라리가' },
    { value: 'bundesliga', label: '독일 분데스리가' },
    { value: 'serie_a', label: '이탈리아 세리에 A' },
  ];

  const clubsByLeague = {
    premier_league: [
      { value: '맨체스터유나이티드', label: '맨체스터유나이티드' },
      { value: '맨체스터시티', label: '맨체스터시티' },
      { value: '아스날', label: '아스날' },
      { value: '리버풀', label: '리버풀' },
      { value: '첼시', label: '첼시' },
      { value: '토트넘', label: '토트넘' },
    ],
    ligue1: [
      { value: '파리생제르망', label: '파리생제르망' },
      { value: '마르세유', label: '마르세유' },
    ],
    laliga: [
      { value: '바르셀로나', label: '바르셀로나' },
      { value: '레알마드리드', label: '레알마드리드' },
      { value: '아틀레티코마드리드', label: '아틀레티코마드리드' },
      { value: '발렌시아', label: '발렌시아' },
    ],
    bundesliga: [
      { value: '바이에른뮌헨', label: '바이에른뮌헨' },
      { value: '도르트문트', label: '도르트문트' },
      { value: '레버쿠젠', label: '레버쿠젠' },
    ],
    serie_a: [
      { value: '유벤투스', label: '유벤투스' },
      { value: 'AC밀란', label: 'AC밀란' },
      { value: '인터밀란', label: '인터밀란' },
      { value: 'AS로마', label: 'AS로마' },
    ],
  };

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
    { value: 'MIZUNO', label: 'MIZUNO' },
  ];

  const availableClubs = useMemo(() => {
    return selectedLeague ? clubsByLeague[selectedLeague] : [];
  }, [selectedLeague]);

  const handleLeagueChange = (value: string) => {
    setSelectedLeague(value);
    setSelectedClub('');
  };

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const { data: userData, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (userData) {
          setName(userData.name);
          setUsername(userData.username);
          setBirthday(userData.birthday || '');
          setPosition(userData.position || '');
          setBootsBrand(userData.boots_brand || '');
          setSelectedClub(userData.fav_club || '');
          setAddress(userData.address || '');
          setPhoneNumber(userData.phone_number || '');

          // 선호 구단에 맞는 리그 찾기
          for (const [league, clubs] of Object.entries(clubsByLeague)) {
            if (clubs.some(club => club.value === userData.fav_club)) {
              setSelectedLeague(league);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: '오류 발생',
          description: '사용자 정보를 불러오는데 실패했습니다.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: '인증 오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // 현재 비밀번호 확인이 필요한 경우
      if (changePassword) {
        const { data: userData, error: userError } = await supabase
          .from('players')
          .select('password')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        if (userData.password !== currentPassword) {
          toast({
            title: '비밀번호 오류',
            description: '현재 비밀번호가 올바르지 않습니다.',
            variant: 'destructive'
          });
          return;
        }
      }

      // 프로필 업데이트
      const updateData: any = {
        birthday: birthday || null,
        position: position || null,
        boots_brand: bootsBrand || null,
        fav_club: selectedClub || null,
        address: address || null,
        phone_number: phoneNumber || null,
      };

      // 비밀번호 변경이 필요한 경우
      if (changePassword && newPassword) {
        updateData.password = newPassword;
      }

      const { error: updateError } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: '성공',
        description: '프로필이 성공적으로 업데이트되었습니다.'
      });

      // 비밀번호 변경 관련 상태 초기화
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');

    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: '업데이트 실패',
        description: error.message || '프로필 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
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

        <h1 className="text-3xl font-bold mb-6">프로필 수정</h1>
        <p className="text-gray-600 mb-8">회원 정보를 수정할 수 있습니다.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>회원 정보 수정</CardTitle>
              <CardDescription>수정할 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input 
                    id="name" 
                    value={name}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <Input 
                    id="username" 
                    value={username}
                    disabled={true}
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
                  <Label htmlFor="address">주소</Label>
                  <Input 
                    id="address" 
                    placeholder="예) 사이타마현 카와구치시 와라비역"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">연락처</Label>
                  <Input 
                    id="phone_number" 
                    placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="league">선호 리그</Label>
                    <Select value={selectedLeague} onValueChange={handleLeagueChange} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="리그를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {leagueOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="club">선호 구단</Label>
                    <Select value={selectedClub} onValueChange={setSelectedClub} disabled={loading || !selectedLeague}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedLeague ? "구단을 선택하세요" : "리그를 먼저 선택하세요"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClubs.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="change-password"
                      checked={changePassword}
                      onCheckedChange={(checked: boolean) => {
                        setChangePassword(checked);
                        if (!checked) {
                          setCurrentPassword('');
                          setNewPassword('');
                        }
                      }}
                    />
                    <Label htmlFor="change-password">비밀번호 변경</Label>
                  </div>
                  {changePassword && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="current-password">현재 비밀번호</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={!changePassword}
                          required={changePassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">새 비밀번호</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={!changePassword}
                          required={changePassword}
                        />
                      </div>
                    </>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? '업데이트 중...' : '프로필 수정'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>프로필 수정 안내</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>이름과 아이디는 변경할 수 없습니다.</p>
                  <p>비밀번호를 변경하려면 체크박스를 선택하고 현재 비밀번호를 입력해주세요.</p>
                  <p>모든 정보는 신중하게 입력해주세요.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 