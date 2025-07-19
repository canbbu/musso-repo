-- 상대팀 기록을 위한 간단한 마이그레이션
-- match_attendance 테이블에 상대팀 구분 컬럼 추가

DO $$ 
BEGIN
    -- is_opponent_team 컬럼 추가 (상대팀 여부 구분)
    BEGIN
        ALTER TABLE match_attendance ADD COLUMN is_opponent_team BOOLEAN DEFAULT FALSE;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'is_opponent_team 컬럼이 이미 존재합니다.';
    END;
    
    -- opponent_team_name 컬럼 추가 (상대팀 이름)
    BEGIN
        ALTER TABLE match_attendance ADD COLUMN opponent_team_name TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'opponent_team_name 컬럼이 이미 존재합니다.';
    END;
    
    -- 상대팀의 경우 player_id는 null이 될 수 있도록 제약조건 수정
    -- (기존 제약조건이 있다면 제거하고 새로 생성)
    BEGIN
        ALTER TABLE match_attendance DROP CONSTRAINT IF EXISTS match_attendance_player_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'player_id 외래키 제약조건이 존재하지 않습니다.';
    END;
    
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_match_attendance_opponent ON match_attendance(match_id, match_number, is_opponent_team);

-- 완료 메시지
SELECT '상대팀 기록 기능이 추가되었습니다.' as message; 