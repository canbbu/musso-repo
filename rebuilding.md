# 프로젝트 리빌딩 계획

## 현재 프로젝트 구조 분석

### 기술 스택
- **프레임워크**: React 18 + TypeScript + Vite
- **UI 라이브러리**: shadcn/ui (Radix UI 기반)
- **스타일링**: Tailwind CSS
- **백엔드**: Supabase
- **상태 관리**: React Context (Auth), React Query (설치되어 있으나 미사용)
- **라우팅**: React Router v6

### 현재 구조의 문제점

1. **API 레이어 부재**
   - Supabase 호출이 hooks에 직접 구현되어 있음
   - 재사용성과 테스트 가능성 낮음
   - React Query가 설치되어 있으나 사용되지 않음

2. **폴더 구조 일관성 부족**
   - `pages/Index.tsx`와 `pages/index.ts` 중복 존재
   - `styles/` 폴더와 개별 CSS 파일 혼재
   - `lib/database.types.ts`와 `types/` 폴더 분리

3. **컴포넌트 구조**
   - 기능별로 분리되어 있으나 일관성 부족
   - 일부 컴포넌트가 루트에 위치 (FlipPlayerCard, PlayerCard 등)

4. **Hooks 구조**
   - 17개의 hooks가 평면적으로 나열됨
   - 도메인별 그룹화 부재
   - 비즈니스 로직과 데이터 fetching이 혼재

5. **타입 관리**
   - `types/` 폴더에 일부 타입만 존재
   - hooks 내부에 타입 정의가 산재
   - `lib/database.types.ts`와 분리되어 있음

6. **유틸리티 함수**
   - `utils/date-helpers.ts`만 존재
   - 다른 유틸리티 함수들이 어디에 있는지 불명확

## 개선된 프로젝트 구조

```
src/
├── app/                          # 앱 진입점 및 라우팅
│   ├── App.tsx
│   ├── routes.tsx               # 라우트 정의
│   └── providers.tsx            # Context/QueryClient 등 프로바이더
│
├── features/                     # 기능별 모듈 (Feature-based 구조)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.tsx
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   │
│   ├── matches/
│   │   ├── components/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchForm.tsx
│   │   │   ├── MatchStatsCard.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── use-match-data.tsx
│   │   │   ├── use-match-tactics.tsx
│   │   │   └── use-upcoming-matches.tsx
│   │   ├── api/
│   │   │   └── matches.api.ts
│   │   ├── types/
│   │   │   └── match.types.ts
│   │   └── index.ts
│   │
│   ├── stats/
│   │   ├── components/
│   │   │   ├── PlayerStatsTable.tsx
│   │   │   ├── RankingTable.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── use-player-stats.tsx
│   │   │   ├── use-player-rankings.tsx
│   │   │   └── use-entire-players.tsx
│   │   ├── api/
│   │   │   └── stats.api.ts
│   │   ├── types/
│   │   │   └── stats.types.ts
│   │   └── index.ts
│   │
│   ├── finance/
│   │   ├── components/
│   │   │   ├── FinanceSummary.tsx
│   │   │   ├── TransactionTable.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── use-finance-data.tsx
│   │   ├── api/
│   │   │   └── finance.api.ts
│   │   ├── types/
│   │   │   └── finance.types.ts
│   │   └── index.ts
│   │
│   ├── announcements/
│   │   ├── components/
│   │   │   ├── AnnouncementForm.tsx
│   │   │   └── AnnouncementList.tsx
│   │   ├── hooks/
│   │   │   ├── use-announcements.tsx
│   │   │   └── use-announcement-data.tsx
│   │   ├── api/
│   │   │   └── announcements.api.ts
│   │   ├── types/
│   │   │   └── announcement.types.ts
│   │   └── index.ts
│   │
│   ├── tactics/
│   │   ├── components/
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── use-tactics.tsx
│   │   ├── api/
│   │   │   └── tactics.api.ts
│   │   ├── types/
│   │   │   └── tactics.types.ts
│   │   └── index.ts
│   │
│   └── attendance/
│       ├── components/
│       │   └── ...
│       ├── hooks/
│       │   └── use-attendance.tsx
│       ├── api/
│       │   └── attendance.api.ts
│       ├── types/
│       │   └── attendance.types.ts
│       └── index.ts
│
├── pages/                        # 페이지 컴포넌트ㅇㅇ
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── matches/
│   │   ├── MatchManagementPage.tsx
│   │   ├── MatchHistoryPage.tsx
│   │   └── TacticsPage.tsx
│   ├── stats/
│   │   ├── PlayerStatsPage.tsx
│   │   ├── MyStatsPage.tsx
│   │   └── SeasonRankingsPage.tsx
│   ├── finance/
│   │   └── FinancePage.tsx
│   └── ...
│
├── shared/                       # 공유 리소스
│   ├── components/               # 공통 컴포넌트
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── MobileNavigation.tsx
│   │   ├── cards/
│   │   │   ├── PlayerCard.tsx
│   │   │   └── FlipPlayerCard.tsx
│   │   └── ui/                  # shadcn/ui 컴포넌트
│   │       └── ...
│   │
│   ├── hooks/                   # 공통 hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/                     # 라이브러리 설정
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase 클라이언트
│   │   │   └── types.ts         # Database types
│   │   ├── query-client.ts      # React Query 설정
│   │   └── utils.ts             # 공통 유틸리티
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   ├── date-helpers.ts
│   │   ├── format-helpers.ts
│   │   └── validation-helpers.ts
│   │
│   └── types/                   # 공통 타입
│       └── common.types.ts
│
└── styles/                      # 전역 스타일
    ├── globals.css
    └── variables.css
```

## 주요 개선 사항

### 1. Feature-based 구조 도입
- **장점**: 기능별로 모든 관련 코드를 한 곳에 모아 유지보수성 향상
- **구조**: 각 feature는 `components`, `hooks`, `api`, `types`를 포함
- **예시**: `features/matches/` 폴더에 매치 관련 모든 코드 집중

### 2. API 레이어 분리
- **현재**: hooks에서 직접 Supabase 호출
- **개선**: `api/` 폴더에 데이터 fetching 로직 분리
- **이점**: 
  - React Query 활용 가능
  - 테스트 용이성 향상
  - 재사용성 증가

### 3. React Query 도입
- **설정**: `shared/lib/query-client.ts`에 QueryClient 설정
- **사용**: 각 feature의 `api/` 파일에서 React Query hooks 사용
- **장점**:
  - 캐싱 및 동기화 자동화
  - 로딩/에러 상태 관리 간소화
  - Optimistic updates 지원

### 4. 타입 관리 통합
- **현재**: `types/`, `lib/database.types.ts`, hooks 내부에 분산
- **개선**: 
  - 각 feature의 `types/` 폴더에 도메인 타입 정의
  - `shared/lib/supabase/types.ts`에 Database types 통합
  - `shared/types/`에 공통 타입 정의

### 5. 컴포넌트 구조 정리
- **공통 컴포넌트**: `shared/components/`로 이동
  - `layout/`: 레이아웃 관련
  - `cards/`: 카드 컴포넌트
  - `ui/`: shadcn/ui 컴포넌트
- **기능 컴포넌트**: 각 feature의 `components/`에 위치

### 6. 스타일 관리 통합
- **현재**: `styles/` 폴더와 개별 CSS 파일 혼재
- **개선**: 
  - 전역 스타일은 `styles/` 폴더에 통합
  - 컴포넌트 스타일은 Tailwind CSS로 통일 (CSS-in-JS 제거)

### 7. Pages 구조 개선
- **현재**: 모든 페이지가 `pages/` 루트에 평면적으로 위치
- **개선**: 기능별로 폴더 구조화
  - `pages/auth/`
  - `pages/dashboard/`
  - `pages/matches/`
  - 등등

### 8. Hooks 구조 개선
- **도메인 hooks**: 각 feature의 `hooks/` 폴더에 위치
- **공통 hooks**: `shared/hooks/`에 위치
- **명명 규칙**: `use-{feature}-{action}.tsx` 형식 유지

## 마이그레이션 전략

### Phase 1: 기반 구조 설정
1. 새로운 폴더 구조 생성
2. React Query 설정 및 QueryClient 구성
3. API 레이어 기본 구조 생성
4. 타입 정의 통합

### Phase 2: Feature별 마이그레이션
각 feature를 순차적으로 마이그레이션:
1. **auth** → 가장 기본적인 기능
2. **matches** → 핵심 비즈니스 로직
3. **stats** → 복잡한 데이터 처리
4. **finance**, **announcements**, **tactics**, **attendance**

각 feature 마이그레이션 단계:
1. 타입 정의 이동 및 통합
2. API 함수 추출 및 React Query hooks 생성
3. 컴포넌트 이동 및 import 경로 수정
4. 기존 hooks를 새로운 API hooks로 대체
5. 페이지 컴포넌트 업데이트

### Phase 3: 정리 및 최적화
1. 사용하지 않는 파일 제거
2. Import 경로 alias 검증 (`@/` 사용)
3. 스타일 파일 통합
4. 문서화 업데이트

## 상세 작업 단계

### Step 1: 기반 구조 생성 및 설정 (Phase 1)

#### 1.1 폴더 구조 생성
- [ ] `src/app/` 폴더 생성
- [ ] `src/features/` 폴더 생성 (auth, matches, stats, finance, announcements, tactics, attendance)
- [ ] `src/shared/` 폴더 생성 (components, hooks, lib, utils, types)
- [ ] 각 feature 폴더에 기본 구조 생성 (components, hooks, api, types, index.ts)

**검증**: 폴더 구조가 rebuilding.md의 구조와 일치하는지 확인

#### 1.2 React Query 설정
- [ ] `src/shared/lib/query-client.ts` 생성
  - QueryClient 인스턴스 생성
  - 기본 옵션 설정 (staleTime, cacheTime 등)
- [ ] `src/app/providers.tsx` 생성
  - QueryClientProvider 추가
  - AuthProvider와 함께 래핑
- [ ] `src/App.tsx`에서 providers 적용

**검증**: 앱이 정상 실행되고 React Query DevTools에서 QueryClient가 보이는지 확인

#### 1.3 Supabase 클라이언트 재구성
- [ ] `src/lib/supabase.ts` → `src/shared/lib/supabase/client.ts`로 이동
- [ ] `src/lib/database.types.ts` → `src/shared/lib/supabase/types.ts`로 이동
- [ ] import 경로 업데이트 (기존 코드에서 임시로 유지)

**검증**: 기존 기능이 정상 동작하는지 확인

#### 1.4 공통 리소스 이동
- [ ] `src/components/ui/` → `src/shared/components/ui/`로 이동
- [ ] `src/lib/utils.ts` → `src/shared/lib/utils.ts`로 이동
- [ ] `src/utils/date-helpers.ts` → `src/shared/utils/date-helpers.ts`로 이동
- [ ] `src/hooks/use-mobile.tsx` → `src/shared/hooks/use-mobile.tsx`로 이동
- [ ] `src/hooks/use-toast.ts` → `src/shared/hooks/use-toast.ts`로 이동 (이미 ui 폴더에 있을 수 있음)

**검증**: import 경로 수정 후 앱이 정상 실행되는지 확인

#### 1.5 공통 컴포넌트 이동
- [ ] `src/components/Layout.tsx` → `src/shared/components/layout/Layout.tsx`
- [ ] `src/components/AppSidebar.tsx` → `src/shared/components/layout/AppSidebar.tsx`
- [ ] `src/components/PlayerCard.tsx` → `src/shared/components/cards/PlayerCard.tsx`
- [ ] `src/components/FlipPlayerCard.tsx` → `src/shared/components/cards/FlipPlayerCard.tsx`
- [ ] `src/components/GoogleAnalytics.tsx` → `src/shared/components/GoogleAnalytics.tsx`

**검증**: 각 컴포넌트 import 경로 수정 후 앱이 정상 실행되는지 확인

#### 1.6 라우팅 구조 개선
- [ ] `src/app/routes.tsx` 생성 (라우트 정의 분리)
- [ ] `src/App.tsx` 간소화 (routes.tsx 사용)

**검증**: 모든 라우트가 정상 동작하는지 확인

**커밋**: "chore: 기반 구조 생성 및 공통 리소스 이동"

---

### Step 2: Auth Feature 마이그레이션

#### 2.1 타입 정의
- [ ] `src/features/auth/types/auth.types.ts` 생성
- [ ] AuthContext에서 사용하는 타입 추출 및 이동
- [ ] 기존 타입 import 경로 업데이트

#### 2.2 API 레이어 생성
- [ ] `src/features/auth/api/auth.api.ts` 생성
- [ ] Supabase auth 관련 함수 추출:
  - `signIn(email, password)`
  - `signUp(email, password, userData)`
  - `signOut()`
  - `getCurrentUser()`
  - `updateUser(userData)`
- [ ] React Query hooks 생성:
  - `useSignIn()`
  - `useSignUp()`
  - `useSignOut()`
  - `useCurrentUser()`

#### 2.3 컴포넌트 이동
- [ ] `src/components/auth/AuthContext.tsx` → `src/features/auth/components/AuthContext.tsx`
- [ ] AuthContext를 React Query hooks 사용하도록 리팩토링

#### 2.4 Hooks 이동
- [ ] `src/hooks/use-auth.tsx` → `src/features/auth/hooks/use-auth.tsx`
- [ ] 새로운 API hooks 사용하도록 업데이트

#### 2.5 Pages 이동 및 업데이트
- [ ] `src/pages/Login.tsx` → `src/pages/auth/LoginPage.tsx`
- [ ] `src/pages/Register.tsx` → `src/pages/auth/RegisterPage.tsx`
- [ ] `src/pages/Profile.tsx` → `src/pages/auth/ProfilePage.tsx` (또는 별도 위치)
- [ ] `src/pages/ChangePassword.tsx` → `src/pages/auth/ChangePasswordPage.tsx`
- [ ] import 경로 업데이트

#### 2.6 Export 및 정리
- [ ] `src/features/auth/index.ts` 생성 (public API export)
- [ ] `src/App.tsx`에서 import 경로 업데이트

**검증**: 
- 로그인/로그아웃/회원가입이 정상 동작하는지 확인
- 인증 상태가 올바르게 관리되는지 확인

**커밋**: "refactor: auth feature 마이그레이션"

---

### Step 3: Matches Feature 마이그레이션

#### 3.1 타입 정의
- [ ] `src/features/matches/types/match.types.ts` 생성
- [ ] hooks에서 사용하는 Match 관련 타입 추출
- [ ] `src/types/tactics.ts` → `src/features/matches/types/tactics.types.ts`로 이동 (또는 별도 tactics feature로)

#### 3.2 API 레이어 생성
- [ ] `src/features/matches/api/matches.api.ts` 생성
- [ ] Supabase matches 관련 함수 추출:
  - `getMatches()`
  - `getMatchById(id)`
  - `getUpcomingMatches()`
  - `createMatch(data)`
  - `updateMatch(id, data)`
  - `deleteMatch(id)`
  - `getMatchAttendance(matchId)`
  - `getMatchStats(matchId)`
- [ ] React Query hooks 생성

#### 3.3 Tactics API (별도 또는 matches 내부)
- [ ] `src/features/matches/api/tactics.api.ts` 생성
- [ ] `getTactics(matchId, matchNumber)`
- [ ] `createTactics(data)`
- [ ] `updateTactics(id, data)`

#### 3.4 컴포넌트 이동
- [ ] `src/components/match/*` → `src/features/matches/components/`
- [ ] import 경로 업데이트

#### 3.5 Hooks 이동 및 리팩토링
- [ ] `src/hooks/use-match-data.tsx` → `src/features/matches/hooks/use-match-data.tsx`
- [ ] `src/hooks/use-match-tactics.tsx` → `src/features/matches/hooks/use-match-tactics.tsx`
- [ ] `src/hooks/use-upcoming-matches.tsx` → `src/features/matches/hooks/use-upcoming-matches.tsx`
- [ ] 새로운 API hooks 사용하도록 업데이트

#### 3.6 Pages 이동 및 업데이트
- [ ] `src/pages/MatchManagement.tsx` → `src/pages/matches/MatchManagementPage.tsx`
- [ ] `src/pages/MatchHistory.tsx` → `src/pages/matches/MatchHistoryPage.tsx`
- [ ] `src/pages/Tactics.tsx` → `src/pages/matches/TacticsPage.tsx`
- [ ] `src/pages/TacticsList.tsx` → `src/pages/matches/TacticsListPage.tsx`
- [ ] `src/pages/AttendanceCheck.tsx` → `src/pages/matches/AttendanceCheckPage.tsx`
- [ ] import 경로 업데이트

#### 3.7 Export 및 정리
- [ ] `src/features/matches/index.ts` 생성

**검증**:
- 매치 목록 조회/생성/수정/삭제가 정상 동작하는지 확인
- 출석 체크 기능이 정상 동작하는지 확인
- 작전판 기능이 정상 동작하는지 확인

**커밋**: "refactor: matches feature 마이그레이션"

---

### Step 4: Stats Feature 마이그레이션

#### 4.1 타입 정의
- [ ] `src/features/stats/types/stats.types.ts` 생성
- [ ] hooks에서 사용하는 Stats 관련 타입 추출

#### 4.2 API 레이어 생성
- [ ] `src/features/stats/api/stats.api.ts` 생성
- [ ] Supabase stats 관련 함수 추출:
  - `getPlayerStats(playerId, filters)`
  - `getAllPlayerStats(filters)`
  - `getPlayerRankings(type, filters)`
  - `getSeasonRankings(year)`
  - `getMatchStats(matchId)`
- [ ] React Query hooks 생성

#### 4.3 컴포넌트 이동
- [ ] `src/components/stats/*` → `src/features/stats/components/`
- [ ] import 경로 업데이트

#### 4.4 Hooks 이동 및 리팩토링
- [ ] `src/hooks/use-player-stats.tsx` → `src/features/stats/hooks/use-player-stats.tsx`
- [ ] `src/hooks/use-player-rankings.tsx` → `src/features/stats/hooks/use-player-rankings.tsx`
- [ ] `src/hooks/use-entire-players.tsx` → `src/features/stats/hooks/use-entire-players.tsx`
- [ ] 새로운 API hooks 사용하도록 업데이트

#### 4.5 Pages 이동 및 업데이트
- [ ] `src/pages/PlayerStats.tsx` → `src/pages/stats/PlayerStatsPage.tsx`
- [ ] `src/pages/MyStats.tsx` → `src/pages/stats/MyStatsPage.tsx`
- [ ] `src/pages/EntirePlayerStats.tsx` → `src/pages/stats/EntirePlayerStatsPage.tsx`
- [ ] `src/pages/SeasonRankings.tsx` → `src/pages/stats/SeasonRankingsPage.tsx`
- [ ] `src/pages/StatsManagement.tsx` → `src/pages/stats/StatsManagementPage.tsx`
- [ ] import 경로 업데이트

#### 4.6 Export 및 정리
- [ ] `src/features/stats/index.ts` 생성

**검증**:
- 선수 통계 조회가 정상 동작하는지 확인
- 랭킹 조회가 정상 동작하는지 확인
- 시즌 랭킹이 정상 동작하는지 확인

**커밋**: "refactor: stats feature 마이그레이션"

---

### Step 5: Announcements Feature 마이그레이션

#### 5.1 타입 정의
- [ ] `src/types/announcement.ts` → `src/features/announcements/types/announcement.types.ts`로 이동
- [ ] 타입 정의 정리

#### 5.2 API 레이어 생성
- [ ] `src/features/announcements/api/announcements.api.ts` 생성
- [ ] Supabase announcements 관련 함수 추출:
  - `getAnnouncements(filters)`
  - `getAnnouncementById(id)`
  - `createAnnouncement(data)`
  - `updateAnnouncement(id, data)`
  - `deleteAnnouncement(id)`
- [ ] React Query hooks 생성

#### 5.3 컴포넌트 이동
- [ ] `src/components/announcement/*` → `src/features/announcements/components/`
- [ ] import 경로 업데이트

#### 5.4 Hooks 이동 및 리팩토링
- [ ] `src/hooks/use-announcements.tsx` → `src/features/announcements/hooks/use-announcements.tsx`
- [ ] `src/hooks/use-announcement-data.tsx` → `src/features/announcements/hooks/use-announcement-data.tsx`
- [ ] 새로운 API hooks 사용하도록 업데이트

#### 5.5 Pages 이동 및 업데이트
- [ ] `src/pages/AnnouncementManagement.tsx` → `src/pages/announcements/AnnouncementManagementPage.tsx`
- [ ] import 경로 업데이트

#### 5.6 Export 및 정리
- [ ] `src/features/announcements/index.ts` 생성

**검증**: 공지사항 조회/생성/수정/삭제가 정상 동작하는지 확인

**커밋**: "refactor: announcements feature 마이그레이션"

---

### Step 6: Finance Feature 마이그레이션

#### 6.1 타입 정의
- [ ] `src/types/finance.ts` → `src/features/finance/types/finance.types.ts`로 이동
- [ ] 타입 정의 정리

#### 6.2 API 레이어 생성
- [ ] `src/features/finance/api/finance.api.ts` 생성
- [ ] Supabase finance 관련 함수 추출:
  - `getFinanceSummary(filters)`
  - `getTransactions(filters)`
  - `getMemberDues(filters)`
  - `createTransaction(data)`
  - `updateTransaction(id, data)`
  - `deleteTransaction(id)`
- [ ] React Query hooks 생성

#### 6.3 컴포넌트 이동
- [ ] `src/components/finance/*` → `src/features/finance/components/`
- [ ] import 경로 업데이트

#### 6.4 Hooks 이동 및 리팩토링
- [ ] `src/hooks/use-finance-data.tsx` → `src/features/finance/hooks/use-finance-data.tsx`
- [ ] 새로운 API hooks 사용하도록 업데이트

#### 6.5 Pages 이동 및 업데이트
- [ ] `src/pages/Finance.tsx` → `src/pages/finance/FinancePage.tsx`
- [ ] `src/pages/FinanceManagement.tsx` → `src/pages/finance/FinanceManagementPage.tsx`
- [ ] import 경로 업데이트

#### 6.6 Export 및 정리
- [ ] `src/features/finance/index.ts` 생성

**검증**: 재정 관리 기능이 정상 동작하는지 확인

**커밋**: "refactor: finance feature 마이그레이션"

---

### Step 7: Attendance Feature 마이그레이션

#### 7.1 타입 정의
- [ ] `src/features/attendance/types/attendance.types.ts` 생성
- [ ] hooks에서 사용하는 Attendance 관련 타입 추출

#### 7.2 API 레이어 생성
- [ ] `src/features/attendance/api/attendance.api.ts` 생성
- [ ] Supabase attendance 관련 함수 추출:
  - `getAttendance(matchId)`
  - `getAttendanceStatus(userId, filters)`
  - `createAttendance(data)`
  - `updateAttendance(id, data)`
- [ ] React Query hooks 생성

#### 7.3 Hooks 이동 및 리팩토링
- [ ] `src/hooks/use-attendance.tsx` → `src/features/attendance/hooks/use-attendance.tsx`
- [ ] 새로운 API hooks 사용하도록 업데이트

#### 7.4 Pages 이동 및 업데이트
- [ ] `src/pages/AttendanceStatus.tsx` → `src/pages/attendance/AttendanceStatusPage.tsx`
- [ ] import 경로 업데이트

#### 7.5 Export 및 정리
- [ ] `src/features/attendance/index.ts` 생성

**검증**: 출석 현황 조회가 정상 동작하는지 확인

**커밋**: "refactor: attendance feature 마이그레이션"

---

### Step 8: Dashboard 및 기타 페이지 정리

#### 8.1 Dashboard 컴포넌트 이동
- [ ] `src/components/dashboard/*` → `src/shared/components/dashboard/` 또는 `src/features/dashboard/components/`
- [ ] Dashboard 관련 hooks 정리:
  - `src/hooks/use-dashboard-data.tsx` → `src/features/dashboard/hooks/use-dashboard-data.tsx`
  - `src/hooks/use-calendar-events.tsx` → `src/features/dashboard/hooks/use-calendar-events.tsx`
  - `src/hooks/use-activity-logs.tsx` → `src/features/dashboard/hooks/use-activity-logs.tsx`

#### 8.2 Dashboard API 생성
- [ ] `src/features/dashboard/api/dashboard.api.ts` 생성
- [ ] Dashboard 데이터 fetching 로직 추출

#### 8.3 Pages 이동
- [ ] `src/pages/Dashboard.tsx` → `src/pages/dashboard/DashboardPage.tsx`
- [ ] `src/pages/HallOfFame.tsx` → `src/pages/hall-of-fame/HallOfFamePage.tsx` (또는 stats에 포함)
- [ ] `src/pages/NotFound.tsx` → `src/pages/NotFoundPage.tsx`
- [ ] `src/pages/DataTestPage.tsx` → `src/pages/dev/DataTestPage.tsx` (개발용)

#### 8.4 중복 파일 정리
- [ ] `src/pages/Index.tsx` 삭제 (index.ts만 사용)
- [ ] `src/pages/index.ts` 업데이트

**검증**: 대시보드가 정상 동작하는지 확인

**커밋**: "refactor: dashboard 및 기타 페이지 정리"

---

### Step 9: 스타일 파일 통합

#### 9.1 CSS 파일 정리
- [ ] `src/styles/globals.css` 확인 및 통합
- [ ] `src/App.css` → `src/styles/App.css`로 이동 또는 내용 통합
- [ ] `src/index.css` → `src/styles/index.css`로 이동 또는 내용 통합
- [ ] `src/styles/Dashboard.css` → Tailwind로 변환 또는 `src/styles/dashboard.css`로 이동
- [ ] `src/styles/Login.css` → Tailwind로 변환 또는 `src/styles/login.css`로 이동
- [ ] `src/styles/Index.css` → Tailwind로 변환 또는 삭제

#### 9.2 Tailwind CSS 변환
- [ ] 가능한 모든 CSS를 Tailwind 클래스로 변환
- [ ] 전역 스타일만 `styles/` 폴더에 유지

**검증**: 스타일이 정상적으로 적용되는지 확인

**커밋**: "refactor: 스타일 파일 통합 및 Tailwind 변환"

---

### Step 10: 최종 정리 및 최적화 (Phase 3)

#### 10.1 사용하지 않는 파일 제거
- [ ] 빈 폴더 제거
- [ ] 사용하지 않는 import 제거
- [ ] 주석 처리된 코드 제거

#### 10.2 Import 경로 검증
- [ ] 모든 import가 `@/` alias를 사용하는지 확인
- [ ] 상대 경로 import를 절대 경로로 변경
- [ ] 순환 참조 확인 및 해결

#### 10.3 타입 안정성 개선
- [ ] `tsconfig.json`의 strict 옵션 점진적 활성화 검토
- [ ] `any` 타입 제거
- [ ] 타입 정의 누락 확인

#### 10.4 상수 관리
- [ ] `src/shared/constants/` 폴더 생성
- [ ] 라우트 경로 상수화: `src/shared/constants/routes.ts`
- [ ] 권한/역할 상수화: `src/shared/constants/roles.ts`
- [ ] 설정 상수화: `src/shared/constants/config.ts`

#### 10.5 환경 변수 관리
- [ ] `.env.example` 파일 생성
- [ ] `src/env.d.ts` 생성 (환경 변수 타입 정의)

#### 10.6 문서화 업데이트
- [ ] `README.md` 업데이트 (새로운 구조 설명)
- [ ] 각 feature의 `README.md` 또는 주석 추가 (선택사항)

**검증**:
- 빌드가 성공하는지 확인: `npm run build`
- 린트 에러가 없는지 확인: `npm run lint`
- 모든 기능이 정상 동작하는지 E2E 테스트

**커밋**: "chore: 최종 정리 및 최적화"

---

## 작업 체크리스트 요약

### Phase 1: 기반 구조 (Step 1)
- [ ] 폴더 구조 생성
- [ ] React Query 설정
- [ ] Supabase 클라이언트 재구성
- [ ] 공통 리소스 이동
- [ ] 라우팅 구조 개선

### Phase 2: Feature 마이그레이션 (Step 2-7)
- [ ] Auth Feature
- [ ] Matches Feature
- [ ] Stats Feature
- [ ] Announcements Feature
- [ ] Finance Feature
- [ ] Attendance Feature

### Phase 3: 정리 및 최적화 (Step 8-10)
- [ ] Dashboard 및 기타 페이지 정리
- [ ] 스타일 파일 통합
- [ ] 최종 정리 및 최적화

## 작업 시 주의사항

1. **각 Step 완료 후 커밋**: 작은 단위로 커밋하여 롤백 용이하게
2. **기능 동작 확인**: 각 Step 완료 후 해당 기능이 정상 동작하는지 반드시 확인
3. **Import 경로 수정**: 파일 이동 시 관련된 모든 import 경로 수정
4. **타입 안정성**: 타입 에러가 발생하지 않도록 주의
5. **점진적 마이그레이션**: 한 번에 모든 것을 변경하지 말고 Step별로 진행

## 추가 개선 제안

### 1. 환경 변수 관리
- `.env.example` 파일 생성
- 환경 변수 타입 정의 (`src/env.d.ts`)

### 2. 에러 처리
- 전역 에러 바운더리 추가
- API 에러 타입 정의 및 처리

### 3. 테스트 구조
```
src/
├── __tests__/
│   ├── features/
│   └── shared/
```

### 4. 상수 관리
```
shared/
└── constants/
    ├── routes.ts
    ├── roles.ts
    └── config.ts
```

### 5. 검증 스키마
- Zod 스키마를 각 feature의 `schemas/` 폴더에 위치
- React Hook Form과 통합

## 예상 효과

1. **유지보수성 향상**: 기능별 코드 집중으로 변경 영향 범위 최소화
2. **재사용성 증가**: API 레이어 분리로 로직 재사용 용이
3. **성능 개선**: React Query 도입으로 불필요한 요청 감소
4. **개발 경험 향상**: 명확한 구조로 신규 개발자 온보딩 용이
5. **테스트 용이성**: API 레이어 분리로 단위 테스트 작성 용이

## 주의사항

1. **점진적 마이그레이션**: 한 번에 모든 것을 변경하지 말고 feature별로 진행
2. **기능 동작 보장**: 마이그레이션 중에도 기존 기능이 정상 동작해야 함
3. **팀 협의**: 구조 변경 전 팀원들과 논의 및 합의 필요
4. **백업**: 마이그레이션 전 현재 코드 상태 백업 필수

