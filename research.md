# 무쏘 프로젝트 구조 분석

## 🏗️ 프로젝트 구조 시각화

### 📁 폴더 구조
```
무쏘 프로젝트/
├── 📂 src/
│   ├── 📂 components/          # UI 컴포넌트
│   │   ├── 🧩 SupabaseDataTester.tsx
│   │   ├── 🧩 AppSidebar.tsx
│   │   ├── 🧩 Layout.tsx
│   │   ├── 🃏 PlayerCard.tsx
│   │   ├── 🔄 FlipPlayerCard.tsx
│   │   ├── 📂 dashboard/       # 대시보드 컴포넌트
│   │   ├── 📂 auth/           # 인증 컴포넌트
│   │   ├── 📂 admin/          # 관리자 컴포넌트
│   │   ├── 📂 finance/        # 재정 컴포넌트
│   │   ├── 📂 match/          # 경기 컴포넌트
│   │   ├── 📂 stats/          # 통계 컴포넌트
│   │   ├── 📂 announcement/   # 공지사항 컴포넌트
│   │   └── 📂 ui/             # 기본 UI 컴포넌트
│   │
│   ├── 📂 hooks/              # 커스텀 훅
│   │   ├── 🎣 use-activity-logs.tsx
│   │   ├── 🎣 use-auth.tsx
│   │   ├── 🎣 use-entire-players.tsx
│   │   ├── 🎣 use-match-data.tsx
│   │   ├── 🎣 use-finance-data.tsx
│   │   └── 🎣 ... (기타 훅들)
│   │
│   ├── 📂 pages/              # 페이지 컴포넌트
│   │   ├── 🏠 Dashboard.tsx
│   │   ├── 🔐 Login.tsx
│   │   ├── 📊 EntirePlayerStats.tsx
│   │   ├── ⚽ MatchManagement.tsx
│   │   └── 📄 ... (기타 페이지들)
│   │
│   ├── 📂 utils/              # 유틸리티 함수
│   │   └── 📅 date-helpers.ts
│   │
│   └── 📂 lib/                # 외부 라이브러리 설정
│       ├── 🗄️ supabase.ts
│       └── 📝 database.types.ts
│
├── 📄 package.json            # 의존성 관리
└── 📄 vite.config.ts         # 빌드 설정
```

### 🏛️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 사용자 인터페이스                        │
├─────────────────────────────────────────────────────────────┤
│  📱 모바일 UI        │        💻 데스크톱 UI                   │
│  ─────────────      │        ─────────────                   │
│  • MobileNav        │        • AppSidebar                    │
│  • Touch Interface  │        • Full Layout                   │
└─────────────────────┴─────────────────────────────────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────┐
│                    📄 페이지 레이어                           │
├─────────────┬─────────────┬─────────────┬─────────────┐
│ 🏠 Dashboard │ ⚽ Matches  │ 📊 Stats    │ 💰 Finance  │
│ 📢 Announce │ 👤 Profile  │ 🔐 Auth     │ ⚙️ Admin    │
└─────────────┴─────────────┴─────────────┴─────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────┐
│                   🧩 컴포넌트 레이어                          │
├─────────────┬─────────────┬─────────────┬─────────────┐
│ 🃏 PlayerCard│ 📅 Calendar │ 📊 Charts   │ 📋 Tables   │
│ 🔄 FlipCard  │ 📝 Forms    │ 🎯 Buttons  │ 💬 Modals   │
└─────────────┴─────────────┴─────────────┴─────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────┐
│                    🎣 비즈니스 로직 (Hooks)                   │
├─────────────┬─────────────┬─────────────┬─────────────┐
│ 👤 Auth     │ ⚽ Matches  │ 📊 Stats    │ 💰 Finance  │
│ 📢 Announce │ 🔍 Search   │ 📱 Mobile   │ 🔔 Toast    │
└─────────────┴─────────────┴─────────────┴─────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────┐
│                   🗄️ 데이터 레이어 (Supabase)                │
├─────────────┬─────────────┬─────────────┬─────────────┐
│ 👥 players  │ ⚽ matches  │ 📢 announce │ 💰 finance  │
│ 📊 stats    │ 🔐 auth     │ 📝 logs     │ 🎯 attendance│
└─────────────┴─────────────┴─────────────┴─────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────┐
│                    ☁️ Supabase 클라우드                      │
│  • PostgreSQL Database    • Real-time Subscriptions        │
│  • Authentication         • Row Level Security             │
│  • Storage                • Edge Functions                 │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 데이터 플로우

```
사용자 액션 → 페이지 → 커스텀 훅 → Supabase → 실시간 업데이트
    ⬆️                                              ⬇️
UI 업데이트 ← 상태 관리 ← 데이터 변환 ← 데이터베이스 응답
```

### 🎯 주요 기능 모듈

```
🏠 대시보드 모듈
├── 📊 통계 위젯
├── 📅 캘린더
├── 📢 공지사항
└── ⚽ 예정 경기

👤 사용자 관리 모듈
├── 🔐 인증 시스템
├── 👥 선수 정보
├── 📊 개인 통계
└── ⚙️ 프로필 설정

⚽ 경기 관리 모듈
├── 📅 경기 일정
├── ✅ 출석 체크
├── 📊 경기 통계
└── 🏆 MVP 투표

💰 재정 관리 모듈
├── 💳 거래 내역
├── 💵 회비 관리
├── 📊 재정 현황
└── 📈 통계 분석

📢 공지사항 모듈
├── 📝 작성/수정
├── 📋 목록 조회
├── 🔔 알림 시스템
└── 📂 카테고리별 분류
```

## 📂 src/components (컴포넌트)

### 메인 컴포넌트
- **`SupabaseDataTester.tsx`** - Supabase 데이터베이스 테스트 도구, 모든 테이블의 CRUD 작업을 관리자가 직접 테스트할 수 있는 컴포넌트
- **`AppSidebar.tsx`** - 애플리케이션 사이드바 네비게이션, 사용자 권한에 따른 메뉴 표시
- **`Layout.tsx`** - 전체 레이아웃 래퍼, 모바일/데스크톱 반응형 구조 관리

### 선수 카드 컴포넌트
- **`PlayerCard.tsx`** - 기본 선수 카드 UI, FIFA 스타일 디자인으로 선수 정보 표시
- **`FlipPlayerCard.tsx`** - 뒤집을 수 있는 선수 카드, 앞면은 기본 정보, 뒷면은 상세 능력치 표시

### 폴더별 컴포넌트
- **`dashboard/`** - 대시보드 관련 컴포넌트들 (캘린더, 공지사항, 경기 일정 등)
- **`auth/`** - 인증 관련 컴포넌트들
- **`admin/`** - 관리자 전용 컴포넌트들
- **`finance/`** - 재정 관리 관련 컴포넌트들
- **`match/`** - 경기 관련 컴포넌트들
- **`stats/`** - 통계 관련 컴포넌트들
- **`announcement/`** - 공지사항 관련 컴포넌트들
- **`ui/`** - shadcn/ui 기반 재사용 가능한 UI 컴포넌트들

## 🎣 src/hooks (커스텀 훅)

### 데이터 관리 훅
- **`use-activity-logs.tsx`** - 사용자 활동 로그 관리, 로그인/로그아웃 추적, 세션 관리
- **`use-upcoming-matches.tsx`** - 예정된 경기 데이터 관리, 실시간 구독 포함
- **`use-announcement-data.tsx`** - 공지사항 데이터 CRUD 관리
- **`use-entire-players.tsx`** - 전체 선수 데이터 관리, 선수 통계 및 CRUD 작업
- **`use-auth.tsx`** - 사용자 인증 상태 관리, 권한 체크 함수들
- **`use-announcements.tsx`** - 공지사항 조회 전용 훅
- **`use-match-data.tsx`** - 경기 데이터 관리, 참석 상태 업데이트
- **`use-player-rankings.tsx`** - 선수 순위 계산 및 관리
- **`use-player-stats.tsx`** - 개별 선수 통계 관리
- **`use-finance-data.tsx`** - 재정 데이터 관리 (모의 데이터)

### 통합 및 유틸리티 훅
- **`use-dashboard-data.tsx`** - 대시보드에 필요한 모든 데이터를 통합 제공
- **`use-calendar-events.tsx`** - 캘린더 이벤트 데이터 변환 및 관리
- **`use-mobile.tsx`** - 모바일 화면 감지 유틸리티
- **`use-toast.ts`** - 토스트 알림 관리

## 📄 src/pages (페이지)

### 메인 페이지
- **`Dashboard.tsx`** - 메인 대시보드, 공지사항, 경기 일정, 캘린더 통합 화면
- **`Index.tsx`** - 랜딩 페이지, 자동으로 대시보드로 리다이렉트

### 인증 페이지
- **`Login.tsx`** - 로그인 페이지
- **`Register.tsx`** - 회원가입 페이지
- **`ChangePassword.tsx`** - 비밀번호 변경 페이지

### 사용자 프로필
- **`Profile.tsx`** - 사용자 프로필 수정 페이지, 개인정보 및 선호팀 설정

### 통계 관련 페이지
- **`EntirePlayerStats.tsx`** - 전체 선수 통계 관리 페이지
- **`MyStats.tsx`** - 개인 통계 조회 페이지
- **`PlayerStats.tsx`** - 특정 선수 통계 조회 페이지
- **`StatsManagement.tsx`** - 통계 관리 페이지

### 경기 관련 페이지
- **`MatchManagement.tsx`** - 경기 관리 페이지
- **`MatchHistory.tsx`** - 경기 이력 조회 페이지

### 관리 페이지
- **`AnnouncementManagement.tsx`** - 공지사항 관리 페이지
- **`Finance.tsx`** - 재정 현황 조회 페이지
- **`FinanceManagement.tsx`** - 재정 관리 페이지

### 기타 페이지
- **`DataTestPage.tsx`** - 데이터 테스트 페이지
- **`NotFound.tsx`** - 404 페이지
- **`index.ts`** - 페이지 컴포넌트 내보내기 파일

## 🛠️ src/utils (유틸리티)

- **`date-helpers.ts`** - 날짜 관련 유틸리티 함수들
  - `getCurrentDate()` - 현재 날짜 반환
  - `getTomorrowDate()` - 내일 날짜 반환
  - `formatDate()` - 안전한 날짜 형식 변환
  - `formatKoreanDate()` - 한글 날짜 형식 변환
  - `formatSimpleDate()` - 간단한 날짜 형식
  - `formatDateTime()` - 날짜+시간 형식

## 🔗 주요 특징

### Supabase 통합
- 모든 데이터 훅이 Supabase와 연동
- 실시간 구독 기능 구현 (경기, 공지사항)
- 타입 안전성을 위한 Database 타입 정의

### 권한 시스템
- 역할 기반 접근 제어 (관리자, 일반 사용자)
- 각 기능별 세분화된 권한 관리

### 반응형 디자인
- 모바일/데스크톱 대응
- shadcn/ui 컴포넌트 라이브러리 사용

### 사용자 활동 추적
- 로그인/로그아웃 기록
- 세션 관리 및 자동 정리
- 활동 통계 제공

### FIFA 스타일 선수 카드
- 3D 플립 애니메이션
- 선수 능력치 시각화
- 선호팀, 부츠 브랜드 등 상세 정보 