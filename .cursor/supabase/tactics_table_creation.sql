-- tactics 테이블 생성
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. tactics 테이블 생성
CREATE TABLE IF NOT EXISTS tactics (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    match_number INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    team_a_strategy TEXT,
    team_b_strategy TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 복합 유니크 제약조건: 같은 경기의 같은 경기 번호는 하나의 작전판만 가질 수 있음
    UNIQUE(match_id, match_number)
);

-- 2. 외래 키 제약조건 추가 (matches 테이블과 연결)
ALTER TABLE tactics 
ADD CONSTRAINT tactics_match_id_fkey 
FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

-- 3. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_tactics_match_id ON tactics(match_id);
CREATE INDEX IF NOT EXISTS idx_tactics_match_number ON tactics(match_number);
CREATE INDEX IF NOT EXISTS idx_tactics_created_by ON tactics(created_by);

-- 4. updated_at 컬럼이 자동으로 업데이트되도록 트리거 생성
CREATE OR REPLACE FUNCTION update_tactics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. tactics 테이블에 트리거 적용
CREATE TRIGGER update_tactics_updated_at 
    BEFORE UPDATE ON tactics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_tactics_updated_at();

-- 6. RLS (Row Level Security) 활성화
ALTER TABLE tactics ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 생성 (모든 사용자가 읽기 가능, 인증된 사용자만 쓰기 가능)
CREATE POLICY "tactics_select_policy" ON tactics
    FOR SELECT USING (true);

CREATE POLICY "tactics_insert_policy" ON tactics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tactics_update_policy" ON tactics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "tactics_delete_policy" ON tactics
    FOR DELETE USING (auth.uid() IS NOT NULL); 