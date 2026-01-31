-- player_sport_access: (player_id, sport, can_access) 2행/인 → (player_id, name, soccer_access, futsal_access) 1행/인
-- 이미 새 구조(soccer_access)이면 name 컬럼만 추가·백필, 구 구조(sport)이면 전체 마이그레이션

DO $$
BEGIN
  -- 이미 새 구조인 경우: name 컬럼만 추가 후 players에서 백필
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'player_sport_access' AND column_name = 'soccer_access'
  ) THEN
    ALTER TABLE player_sport_access ADD COLUMN IF NOT EXISTS name TEXT;
    UPDATE player_sport_access psa SET name = p.name FROM players p WHERE psa.player_id = p.id;
    RETURN;
  END IF;

  -- 구 구조인 경우: 아래는 별도로 실행 불가하므로, name 추가용 스크립트는 별도 파일로 제공
  RAISE NOTICE 'Table has old schema (sport/can_access). Run 05-from-old-schema.sql to migrate.';
END $$;
