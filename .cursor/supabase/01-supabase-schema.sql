-- Players 테이블
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'president', 'vice_president', 'coach', 'assistant_coach', 'treasurer', 'system-manager'))
);

-- Announcements 테이블
CREATE TABLE announcements (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('notice', 'match')),
  content TEXT NOT NULL,
  date DATE NOT NULL,
  author TEXT NOT NULL,
  location TEXT,
  opponent TEXT,
  match_time TIMESTAMP,
  attendance_tracking BOOLEAN,
  is_match BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Matches 테이블
CREATE TABLE matches (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  opponent TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed', 'cancelled'))
);

ALTER TABLE matches 
ADD COLUMN created_by TEXT NOT NULL DEFAULT '장미드필더',
ADD COLUMN updated_by TEXT,
ADD COLUMN deleted_by TEXT;

-- Match_Attendance 테이블
CREATE TABLE match_attendance (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'pending')),
  UNIQUE(match_id, player_id)
);

ALTER TABLE match_attendance 
ADD COLUMN goals INTEGER DEFAULT 0,
ADD COLUMN assists INTEGER DEFAULT 0,
ADD COLUMN rating DECIMAL(3, 1) DEFAULT 0;

-- Calendar_Events 테이블
CREATE TABLE calendar_events (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('match', 'notice')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'cancelled'))
);

-- Transactions 테이블
CREATE TABLE transactions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  member TEXT
);

-- Member_Dues 테이블
CREATE TABLE member_dues (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  due_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_date DATE,
  paid_amount DECIMAL(10, 2)
);

-- MVP 타입 구분을 위해 ENUM 타입 생성 (PostgreSQL 기준)
CREATE TYPE mvp_type AS ENUM ('weekly', 'monthly', 'yearly');

-- MVP 테이블 생성 (주간/월간/년간 통합)
CREATE TABLE mvp (
  id UUID PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  mvp_type mvp_type NOT NULL,
  year INTEGER NOT NULL,
  week INTEGER,   -- 주간 MVP에만 사용
  month INTEGER   -- 월간 MVP에만 사용
);

-- User_Activity_Logs 테이블 (사용자 접속 로그)
CREATE TABLE user_activity_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES players(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  page_views INTEGER DEFAULT 1,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_login_time ON user_activity_logs(login_time);
CREATE INDEX idx_user_activity_logs_session_id ON user_activity_logs(session_id);

-- 5. 샘플 데이터 추가: 플레이어 추가
INSERT INTO players (id, name, username, password, role) VALUES
  ('player1', '김선수', 'kimplayer', 'pass123', 'player'),
  ('player2', '이공격수', 'leetriker', 'pass123', 'player'),
  ('player3', '박수비', 'parkdefense', 'pass123', 'player'),
  ('player4', '정미드필더', 'jungmid', 'pass123', 'player'),
  ('player5', '최골키퍼', 'choikeeper', 'pass123', 'player'),
  ('player6', '강수비수', 'kangcoach', 'pass123', 'coach'),
  ('player7', '장미드필더', 'jangpresident', 'pass123', 'president'),
  ('system-manager-id', '시스템 관리자', 'admin', 'admin123', 'system-manager');

-- 6. 샘플 데이터 추가: 공지사항 추가
INSERT INTO announcements (type, title, date, content, author, updated_at, location, opponent, match_time, attendance_tracking, is_match) VALUES
  ('notice', '이번 주 이벤트 공지', '2023-11-20', '이번 주 이벤트는 비로 인해 취소되었습니다. 다음 일정을 확인해주세요.', '김운영', '2023-11-20 14:30:00+00', NULL, NULL, NULL, NULL, FALSE),
  ('notice', '연말 모임 안내', '2023-11-18', '12월 23일 연말 모임이 있을 예정입니다. 참석 여부를 알려주세요.', '박감독', '2023-11-18 10:15:00+00', NULL, NULL, NULL, NULL, FALSE),
  ('match', 'FC 서울과의 이벤트', '2023-11-25', '이번 이벤트는 중요한 라이벌전입니다. 많은 참여 부탁드립니다.', '박감독', NOW(), '서울 마포구 풋살장', 'FC 서울', '2023-11-25 19:00:00', TRUE, TRUE);

-- 7. 샘플 데이터 추가: 이벤트 추가
INSERT INTO matches (date, location, opponent, status) VALUES
  (CURRENT_DATE, '서울 마포구 풋살장', 'FC 서울', 'upcoming'),
  (CURRENT_DATE + 1, '강남 체육공원', '강남 유나이티드', 'cancelled');

-- 8. 샘플 데이터 추가: 참석 현황 추가 (첫 번째 이벤트)
INSERT INTO match_attendance (match_id, player_id, status) VALUES
  (1, 'player1', 'attending'),
  (1, 'player2', 'attending'),
  (1, 'player3', 'attending'),
  (1, 'player4', 'not_attending'),
  (1, 'player5', 'not_attending'),
  (1, 'player6', 'pending'),
  (1, 'player7', 'pending');

-- 9. 샘플 데이터 추가: 참석 현황 추가 (두 번째 이벤트)
INSERT INTO match_attendance (match_id, player_id, status) VALUES
  (2, 'player1', 'attending'),
  (2, 'player6', 'attending'),
  (2, 'player2', 'not_attending'),
  (2, 'player3', 'not_attending'),
  (2, 'player4', 'not_attending'),
  (2, 'player5', 'pending'),
  (2, 'player7', 'pending');

-- 10. 샘플 데이터 추가: 캘린더 이벤트 추가
INSERT INTO calendar_events (type, title, date, status) VALUES
  ('match', 'FC 서울과의 이벤트', CURRENT_DATE, 'upcoming'),
  ('match', '강남 유나이티드와의 이벤트', CURRENT_DATE + 1, 'cancelled'),
  ('notice', '연말 모임', '2023-12-23', NULL);

-- 11. 샘플 데이터 추가: 거래 내역 추가
INSERT INTO transactions (date, description, amount, type, category, member) VALUES
  (CURRENT_DATE - 10, '회비 납부', 50000.00, 'income', '회비', '김선수'),
  (CURRENT_DATE - 7, '풋살장 대여료', 100000.00, 'expense', '시설', NULL),
  (CURRENT_DATE - 5, '유니폼 구매', 150000.00, 'expense', '장비', NULL),
  (CURRENT_DATE - 2, '음료 구매', 25000.00, 'expense', '기타', NULL);

-- 12. 샘플 데이터 추가: 회비 납부 상태 추가
INSERT INTO member_dues (name, paid, due_date, amount, paid_date, paid_amount) VALUES
  ('김선수', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 10, 50000.00),
  ('이공격수', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 12, 50000.00),
  ('박수비', FALSE, CURRENT_DATE - 15, 50000.00, NULL, NULL),
  ('정미드필더', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 8, 50000.00),
  ('최골키퍼', FALSE, CURRENT_DATE - 15, 50000.00, NULL, NULL),
  ('강수비수', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 5, 50000.00),
  ('장미드필더', FALSE, CURRENT_DATE - 15, 50000.00, NULL, NULL);

-- 13. 기존 사용자 역할 업데이트 (기존 데이터가 있는 경우)
-- 만약 '경기관리자'라는 사용자가 있다면 system-manager로 업데이트
UPDATE players SET role = 'system-manager' WHERE name = '경기관리자';
UPDATE players SET role = 'system-manager' WHERE name = 'admin';
UPDATE players SET role = 'system-manager' WHERE name = 'administrator';
UPDATE players SET role = 'system-manager' WHERE name = '관리자';

-- role 컬럼이 없는 기존 테이블에 컬럼 추가 (이미 있다면 무시)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE players ADD COLUMN role TEXT DEFAULT 'player' CHECK (role IN ('player', 'president', 'vice_president', 'coach', 'assistant_coach', 'treasurer', 'system-manager'));
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'role 컬럼이 이미 존재합니다.';
    END;
END $$;