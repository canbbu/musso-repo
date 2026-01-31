-- players 삭제 시 match_attendance에서 해당 player_id 참조 행도 함께 삭제되도록 ON DELETE CASCADE 설정
-- (opponent_team_simple 등에서 FK가 제거되었거나 ON DELETE가 없을 수 있음)

ALTER TABLE match_attendance DROP CONSTRAINT IF EXISTS match_attendance_player_id_fkey;

ALTER TABLE match_attendance
  ADD CONSTRAINT match_attendance_player_id_fkey
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
