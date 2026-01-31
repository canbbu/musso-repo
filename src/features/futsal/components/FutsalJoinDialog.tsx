import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { createFutsalGuestPlayer } from '../api/futsal-guest.api';

const AUTH_STATE_CHANGED = 'auth-state-changed';

export interface FutsalJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 이름으로 참여 완료 시 (userId 반환) */
  onGuestJoined?: (userId: string) => void;
  /** 액션 설명 (예: "참석/불참 또는 댓글") */
  actionLabel?: string;
}

/** 참석·댓글 등 시 로그인할지, 이름을 추가해 참여할지 선택하는 다이얼로그 */
export function FutsalJoinDialog({
  open,
  onOpenChange,
  onGuestJoined,
  actionLabel = '참석/불참 또는 댓글',
}: FutsalJoinDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'choose' | 'name'>('choose');

  const handleLogin = () => {
    onOpenChange(false);
    navigate('/futsal/login', { state: { from: '/futsal' } });
  };

  const handleAddName = async () => {
    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { id } = await createFutsalGuestPlayer(name.trim(), password);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', id);
      localStorage.setItem('userName', name.trim());
      localStorage.setItem('userRole', 'futsal-guest');
      window.dispatchEvent(new Event(AUTH_STATE_CHANGED));
      onGuestJoined?.(id);
      onOpenChange(false);
      setStep('choose');
      setName('');
      setPassword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep('choose');
      setName('');
      setPassword('');
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{step === 'choose' ? '참여하기' : '이름·비밀번호 입력'}</DialogTitle>
          <DialogDescription>
            {step === 'choose'
              ? `${actionLabel}을 하려면 로그인하거나 이름과 비밀번호를 입력해 참여할 수 있습니다.`
              : '이름과 비밀번호를 입력하면 풋살 회원으로 등록되며, 풋살 권한이 부여됩니다.'}
          </DialogDescription>
        </DialogHeader>
        {step === 'choose' ? (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleLogin}>
              로그인
            </Button>
            <Button onClick={() => setStep('name')}>이름으로 참여</Button>
          </DialogFooter>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="guest-name">이름</Label>
              <Input
                id="guest-name"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-password">비밀번호</Label>
              <Input
                id="guest-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('choose')} disabled={loading}>
                뒤로
              </Button>
              <Button onClick={handleAddName} disabled={loading}>
                {loading ? '등록 중...' : '참여하기'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
