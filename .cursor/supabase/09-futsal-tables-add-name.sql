-- futsal_ 테이블에 이름(회원명) 컬럼 추가 (players 조인 없이 표시용)

-- 1. 풋살 이벤트 참가/불참
ALTER TABLE futsal_event_participation ADD COLUMN IF NOT EXISTS player_name TEXT;

-- 2. 풋살 이벤트 댓글
ALTER TABLE futsal_event_comments ADD COLUMN IF NOT EXISTS player_name TEXT;

-- 3. 풋살 권한 요청
ALTER TABLE futsal_access_requests ADD COLUMN IF NOT EXISTS player_name TEXT;

-- 기존 데이터 백필 (players.name)
UPDATE futsal_event_participation p
SET player_name = pl.name
FROM players pl
WHERE p.player_id = pl.id AND (p.player_name IS NULL OR p.player_name = '');

UPDATE futsal_event_comments c
SET player_name = pl.name
FROM players pl
WHERE c.player_id = pl.id AND (c.player_name IS NULL OR c.player_name = '');

UPDATE futsal_access_requests r
SET player_name = pl.name
FROM players pl
WHERE r.player_id = pl.id AND (r.player_name IS NULL OR r.player_name = '');