# Supabase 마이그레이션 가이드

이 문서는 mock-data.ts에서 Supabase로 데이터 소스를 마이그레이션하는 단계별 가이드입니다.

## 1. 프로젝트 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 계정 생성 및 로그인
2. 새 프로젝트 생성
3. SQL 에디터에서 테이블 생성 쿼리 실행 (`01-supabase-schema.sql` 파일 참조)
4. 프로젝트의 URL과 API 키(anon key) 복사
URL : https://nnieuiiisxecakiecjyp.supabase.co
API : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWV1aWlpc3hlY2FraWVjanlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDg4NTYsImV4cCI6MjA2MDAyNDg1Nn0.41jXCY2aj241ESJyJtRlUp11X37eK_9ArKF93r_HZrE

4단계: Supabase 클라이언트 설정
src/lib 폴더 생성
supabase.ts와 database.types.ts 파일 추가
5단계: 훅 변경
useAnnouncements.tsx와 useUpcomingMatches.tsx 파일을 Supabase 버전으로 교체
6단계: 모든 컴포넌트가 새 훅과 호환되는지 확인
필요한 경우 컴포넌트 내에서 loading 및 error 상태 처리 추가
7단계: 테스트
애플리케이션이 Supabase에서 데이터를 올바르게 가져오는지 확인
실시간 업데이트가 제대로 작동하는지 확인

### 1.2 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용 추가: