import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/shared/lib/supabase/client';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
  redirectPath?: string;
}

export function LoginModal({ 
  open, 
  onOpenChange, 
  onLoginSuccess,
  redirectPath 
}: LoginModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .eq('is_deleted', false)
        .single();
      
      if (error) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      if (data.password !== password) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      
      await Promise.all([
        localStorage.setItem('isAuthenticated', 'true'),
        localStorage.setItem('userId', data.id),
        localStorage.setItem('userName', data.name || data.username),
        localStorage.setItem('userRole', data.role || 'player')
      ]);

      toast({
        title: "로그인 성공",
        description: `${data.name || data.username}님, 환영합니다!`,
      });
      
      onOpenChange(false);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      if (redirectPath) {
        setTimeout(() => {
          navigate(redirectPath);
        }, 300);
      } else {
        window.location.reload();
      }
      
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            계정에 로그인하여 이 기능을 이용하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="modal-username">유저네임</Label>
            <Input 
              id="modal-username" 
              placeholder="유저네임을 입력하세요" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-password">비밀번호</Label>
            <Input 
              id="modal-password" 
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
      </DialogContent>
    </Dialog>
  );
}
