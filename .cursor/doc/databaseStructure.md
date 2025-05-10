# 무쏘 FC 데이터베이스 구조

## 테이블 구조

### 1. players 테이블
선수 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | string | 선수의 고유 식별자 (Primary Key) |
| name | string | 선수 이름 |
| created_at | string | 생성 일시 |
| updated_at | string | 업데이트 일시 |

### 2. announcements 테이블
공지사항 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | number | 공지사항의 고유 식별자 (Primary Key) |
| type | string | 공지 유형 (notice, match 등) |
| title | string | 공지 제목 |
| date | string | 공지 일자 |
| content | string | 공지 내용 |
| author | string | 작성자 |
| updated_at | string | 업데이트 일시 |
| created_at | string | 생성 일시 |
| location | string | 장소 (경기 관련 공지의 경우) |
| opponent | string | 상대팀 (경기 관련 공지의 경우) |
| match_time | string | 경기 시간 (경기 관련 공지의 경우) |
| attendance_tracking | boolean | 출석 체크 여부 (경기 관련 공지의 경우) |
| is_match | boolean | 경기 관련 공지 여부 |

### 3. matches 테이블
경기 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | number | 경기의 고유 식별자 (Primary Key) |
| date | string | 경기 일자 |
| location | string | 경기 장소 |
| opponent | string | 상대팀 |
| status | string | 경기 상태 (upcoming, ongoing, completed, scheduled, cancelled) |
| created_at | string | 생성 일시 |
| updated_at | string | 업데이트 일시 |
| score | string | 경기 점수 (옵션) |
| result | string | 경기 결과 (win, loss, draw) (옵션) |
| notes | string | 경기 관련 메모 (옵션) |
| mvp | string | 경기 MVP (옵션) |
| review | string | 경기 리뷰 (옵션) |

### 4. match_attendance 테이블
경기 참석 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | number | 참석 정보의 고유 식별자 (Primary Key) |
| match_id | number | 경기 ID (Foreign Key → matches.id) |
| player_id | string | 선수 ID (Foreign Key → players.id) |
| status | string | 참석 상태 (attending, not_attending, pending) |
| created_at | string | 생성 일시 |
| updated_at | string | 업데이트 일시 |

## 테이블 관계도

players ────┐
            │
            v
matches ────┬───> match_attendance
            │
            v
announcements

## 페이지별 사용 테이블

### 1. 메인 대시보드
- **사용 테이블**: matches, match_attendance, announcements
- **관련 파일**: 
  - src/hooks/use-dashboard-data.tsx
  - src/hooks/use-upcoming-matches.tsx
  - src/hooks/use-announcements.tsx

### 2. 경기 관리 페이지
- **사용 테이블**: matches, match_attendance
- **관련 파일**: 
  - src/hooks/use-match-data.tsx
  - src/pages/matches.tsx

### 3. 공지사항 페이지
- **사용 테이블**: announcements
- **관련 파일**: 
  - src/hooks/use-announcements.tsx
  - src/hooks/use-announcement-data.tsx
  - src/pages/announcements.tsx

### 4. 선수 통계 페이지
- **사용 테이블**: players, match_attendance
- **관련 파일**: 
  - src/hooks/use-player-stats.tsx
  - src/hooks/use-player-rankings.tsx

## 데이터베이스 작업 예시

### 1. 경기 목록 조회
```typescript
const { data, error } = await supabase
  .from('matches')
  .select('*')
  .order('date', { ascending: true });
```

### 2. 특정 경기의 출석 정보 조회
```typescript
const { data, error } = await supabase
  .from('match_attendance')
  .select('player_id, status')
  .eq('match_id', matchId);
```

### 3. 공지사항 추가
```typescript
const { data, error } = await supabase
  .from('announcements')
  .insert([newAnnouncement])
  .select();
```

### 4. 경기 출석 상태 변경
```typescript
const { data, error } = await supabase
  .from('match_attendance')
  .update({ status: newStatus })
  .eq('match_id', matchId)
  .eq('player_id', playerId);
```

### 5. 경기 삭제
```typescript
// 먼저 관련 출석 정보 삭제
await supabase
  .from('match_attendance')
  .delete()
  .eq('match_id', matchId);

// 이후 경기 정보 삭제
await supabase
  .from('matches')
  .delete()
  .eq('id', matchId);
```
```

데이터베이스와 소통하는 부분에 콘솔 로깅을 추가하고, 데이터베이스 구조를 시각화한 문서를 추가했습니다. 이 변경사항들을 통해 데이터베이스 작업을 더 쉽게 모니터링하고 이해할 수 있을 것입니다.