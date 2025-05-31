-- 12. 샘플 데이터 추가: 회비 납부 상태 추가
INSERT INTO member_dues (name, paid, due_date, amount, paid_date, paid_amount) VALUES
  ('김선수', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 10, 50000.00),
  ('이공격수', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 12, 50000.00),
  ('박수비', FALSE, CURRENT_DATE - 15, 50000.00, NULL, NULL),
  ('정미드필더', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 8, 50000.00),
  ('최골키퍼', FALSE, CURRENT_DATE - 15, 50000.00, NULL, NULL),
  ('강수비수', TRUE, CURRENT_DATE - 15, 50000.00, CURRENT_DATE - 5, 50000.00),
  ('장미드필더', FALSE, CURRENT_DATE - 15, 50000.00, NULL, NULL);

-- 13. system-manager 역할 샘플 사용자 추가
INSERT INTO players (name, username, password, position, birth_date, phone, email, address, role, is_player_captain, is_coach, is_deleted) VALUES
  ('시스템 관리자', 'admin', 'admin123', '관리자', '1990-01-01', '010-1234-5678', 'admin@musso.com', '서울시 강남구', 'system-manager', FALSE, FALSE, FALSE);

-- 14. 선수 능력 초기 데이터 (새로 추가된 시스템 관리자는 제외)
INSERT INTO player_capabilities (player_id, offensive, defensive, passing, goalkeeping) VALUES
  ((SELECT id FROM players WHERE name = '김선수'), 8, 6, 7, 2),
  ((SELECT id FROM players WHERE name = '이공격수'), 9, 5, 6, 1),
  ((SELECT id FROM players WHERE name = '박수비'), 4, 9, 7, 3),
  ((SELECT id FROM players WHERE name = '정미드필더'), 7, 7, 9, 2),
  ((SELECT id FROM players WHERE name = '최골키퍼'), 2, 4, 5, 10),
  ((SELECT id FROM players WHERE name = '강수비수'), 5, 8, 6, 3),
  ((SELECT id FROM players WHERE name = '장미드필더'), 6, 6, 8, 2);

-- 15. 기존 사용자 역할 업데이트 (운영 중일 경우를 대비)
UPDATE players SET role = 'system-manager' WHERE name IN ('경기관리자', 'admin', 'administrator', '관리자', 'system-manager');

-- 16. 시스템 관리자에게 모든 권한 부여하기 위한 데이터 정리
-- (필요시 추가적인 권한 관련 테이블 업데이트) 