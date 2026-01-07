// Auth API 함수들
import { supabase } from '@/shared/lib/supabase/client';
import { LoginCredentials, SignUpData } from '../types/auth.types';

// 로그인
export async function signIn(credentials: LoginCredentials) {
  const { username, password } = credentials;
  
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
  
  // 로그인 성공 시 로컬 스토리지 업데이트
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userId', data.id);
  localStorage.setItem('userName', data.name || data.username);
  localStorage.setItem('userRole', data.role || 'player');
  
  return {
    id: data.id,
    name: data.name || data.username,
    username: data.username,
    role: data.role || 'player',
  };
}

// 로그아웃
export async function signOut() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(userId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || (data && data.is_deleted)) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }
  
  return data;
}

// 회원가입
export async function signUp(userData: SignUpData) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      username: userData.username,
      password: userData.password, // 실제로는 해시화 필요
      name: userData.name,
      email: userData.email,
      role: userData.role || 'player',
      is_deleted: false,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message || '회원가입에 실패했습니다.');
  }
  
  return data;
}

// 사용자 정보 업데이트
export async function updateUser(userId: string, updates: Partial<SignUpData>) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message || '사용자 정보 업데이트에 실패했습니다.');
  }
  
  return data;
}
