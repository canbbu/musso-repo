-- 이름만 등록한 풋살 전용 회원 구분용 역할 추가 (축구 페이지 권한 없음)
DO $$
BEGIN
  ALTER TABLE players DROP CONSTRAINT IF EXISTS players_role_check;
  ALTER TABLE players ADD CONSTRAINT players_role_check
    CHECK (role IN (
      'player', 'president', 'vice_president', 'coach', 'assistant_coach',
      'treasurer', 'system-manager', 'futsal-manager', 'futsal-guest'
    ));
EXCEPTION
  WHEN undefined_object THEN
    ALTER TABLE players ADD CONSTRAINT players_role_check
      CHECK (role IN (
        'player', 'president', 'vice_president', 'coach', 'assistant_coach',
        'treasurer', 'system-manager', 'futsal-manager', 'futsal-guest'
      ));
END $$;
