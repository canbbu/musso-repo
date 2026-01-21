-- match_attendance 테이블에 cleansheet 컬럼 추가
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. cleansheet 컬럼 추가 (INTEGER 타입, 기본값: 0)
-- 무실점 경기인 경우 1, 실점이 있는 경우 0
-- 철벽지수는 경기당 1점씩 누적됩니다
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE match_attendance ADD COLUMN cleansheet INTEGER DEFAULT 0;
        RAISE NOTICE 'cleansheet 컬럼이 추가되었습니다.';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'cleansheet 컬럼이 이미 존재합니다.';
    END;
END $$;

-- 2. 기존 데이터의 cleansheet를 0으로 설정 (기본값)
UPDATE match_attendance 
SET cleansheet = 0 
WHERE cleansheet IS NULL;

-- 3. cleansheet 컬럼에 NOT NULL 제약 조건 추가 (이미 NOT NULL이 아닌 경우에만)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE match_attendance ALTER COLUMN cleansheet SET NOT NULL;
        RAISE NOTICE 'cleansheet 컬럼에 NOT NULL 제약 조건이 추가되었습니다.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'cleansheet 컬럼에 NOT NULL 제약 조건 추가 중 오류: %', SQLERRM;
    END;
END $$;

-- 4. cleansheet 컬럼에 기본값 설정
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE match_attendance ALTER COLUMN cleansheet SET DEFAULT 0;
        RAISE NOTICE 'cleansheet 컬럼의 기본값이 설정되었습니다.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'cleansheet 컬럼 기본값 설정 중 오류: %', SQLERRM;
    END;
END $$;

-- 5. cleansheet 값이 0 또는 1만 허용되도록 체크 제약 조건 추가 (선택사항)
-- ALTER TABLE match_attendance 
-- ADD CONSTRAINT cleansheet_check CHECK (cleansheet IN (0, 1));

-- 참고: 
-- - 철벽지수는 골키퍼뿐만 아니라 수비수들도 무실점 경기를 하면 포인트를 얻습니다
-- - 경기 결과에 따라 관리자가 수동으로 cleansheet 값을 0 또는 1로 설정할 수 있습니다
-- - 철벽지수 랭킹은 모든 포지션의 선수들이 표시됩니다
-- - 철벽지수는 경기당 1점씩 누적되므로 INTEGER 타입을 사용합니다

