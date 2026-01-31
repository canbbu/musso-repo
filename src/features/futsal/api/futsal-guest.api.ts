import { supabase } from '@/shared/lib/supabase/client';
import { insertPlayerSportAccess } from '@/features/sport-access/api/sport-access.api';

/** 이름 + 비밀번호로 풋살 참여용 회원 생성 (player 등록 + 풋살 권한만 부여) */
export async function createFutsalGuestPlayer(
  name: string,
  password: string
): Promise<{ id: string; name: string }> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('이름을 입력해 주세요.');
  if (!password || !password.trim()) throw new Error('비밀번호를 입력해 주세요.');

  const { data: existing } = await supabase
    .from('players')
    .select('id')
    .eq('name', trimmed)
    .maybeSingle();
  if (existing) {
    throw new Error('이미 존재하는 이름입니다. 다른 이름을 입력해 주세요.');
  }

  const username = `futsal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const { data, error } = await supabase
    .from('players')
    .insert({
      name: trimmed,
      username,
      password: password.trim(),
      role: 'futsal-guest',
      is_deleted: false,
    })
    .select('id, name')
    .single();

  if (error) throw error;

  await insertPlayerSportAccess(data.id, data.name, false, true);
  return { id: data.id, name: data.name };
}
