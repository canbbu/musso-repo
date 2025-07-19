-- match_attendance 테이블에 타임스탬프 컬럼 추가
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. created_at 컬럼 추가 (기본값: 현재 시간)
ALTER TABLE match_attendance 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. modified_at 컬럼 추가 (기본값: 현재 시간)
ALTER TABLE match_attendance 
ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 기존 데이터의 created_at을 현재 시간으로 설정
UPDATE match_attendance 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 4. 기존 데이터의 modified_at을 현재 시간으로 설정
UPDATE match_attendance 
SET modified_at = NOW() 
WHERE modified_at IS NULL;

-- 5. modified_at 컬럼이 자동으로 업데이트되도록 트리거 생성
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. match_attendance 테이블에 트리거 적용
CREATE TRIGGER update_match_attendance_modified_at 
    BEFORE UPDATE ON match_attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_at_column();

-- 7. 새 레코드 삽입 시 created_at이 자동으로 설정되도록 트리거 생성
CREATE OR REPLACE FUNCTION set_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. match_attendance 테이블에 INSERT 트리거 적용
CREATE TRIGGER set_match_attendance_created_at 
    BEFORE INSERT ON match_attendance 
    FOR EACH ROW 
    EXECUTE FUNCTION set_created_at_column(); 