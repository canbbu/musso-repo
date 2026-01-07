// Auth React Query hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut, getCurrentUser, signUp, updateUser } from './auth.api';
import { LoginCredentials, SignUpData } from '../types/auth.types';

// 로그인 mutation
export function useSignIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      // 로그인 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// 로그아웃 mutation
export function useSignOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // 로그아웃 시 모든 쿼리 무효화
      queryClient.clear();
    },
  });
}

// 현재 사용자 정보 query
export function useCurrentUser(userId: string | null) {
  return useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => getCurrentUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 회원가입 mutation
export function useSignUp() {
  return useMutation({
    mutationFn: signUp,
  });
}

// 사용자 정보 업데이트 mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<SignUpData> }) =>
      updateUser(userId, updates),
    onSuccess: (_, variables) => {
      // 업데이트 성공 시 사용자 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['currentUser', variables.userId] });
    },
  });
}
