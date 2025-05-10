# 무쏘(Musso) 프로젝트 데이터 흐름 시각화

## 데이터 구조 및 흐름

```mermaid
graph TD
    subgraph 데이터_타입
        types_dashboard["src/types/dashboard.ts"]
        types_announcement["src/types/announcement.ts"]
        types_finance["src/types/finance.ts"]
    end

    subgraph 데이터_소스
        mock["src/utils/mock-data.ts"]
    end

    subgraph 데이터_훅
        use_dashboard["useDashboardData"]
        use_announcements["useAnnouncements"]
        use_upcoming_matches["useUpcomingMatches"]
        use_calendar_events["useCalendarEvents"]
        use_finance_data["useFinanceData"]
    end

    subgraph 페이지
        dashboard_page["Dashboard.tsx"]
        finance_page["Finance.tsx"]
        announcement_management["AnnouncementManagement.tsx"]
        finance_management["FinanceManagement.tsx"]
    end

    subgraph 컴포넌트
        subgraph 대시보드_컴포넌트
            announcements_card["AnnouncementsCard.tsx"]
            upcoming_matches_card["UpcomingMatchesCardWrapper.tsx"]
            calendar_view["CalendarView.tsx"]
            mvp_voting_card["MvpVotingCard.tsx"]
        end

        subgraph 재정_컴포넌트
            finance_summary["FinanceSummary.tsx"]
            transaction_table["TransactionTable.tsx"]
            member_dues_table["MemberDuesTable.tsx"]
        end
    end

    %% 데이터 타입 연결
    types_dashboard --> use_dashboard
    types_dashboard --> use_announcements
    types_dashboard --> use_upcoming_matches
    types_dashboard --> use_calendar_events
    types_finance --> use_finance_data

    %% 모크 데이터 연결
    mock --> use_announcements
    mock --> use_upcoming_matches
    mock --> use_finance_data

    %% 훅 연결
    use_announcements --> use_dashboard
    use_upcoming_matches --> use_dashboard
    use_calendar_events --> use_dashboard
    
    %% 페이지와 훅 연결
    use_dashboard --> dashboard_page
    use_finance_data --> finance_page

    %% 페이지와 컴포넌트 연결
    dashboard_page --> announcements_card
    dashboard_page --> upcoming_matches_card
    dashboard_page --> calendar_view
    dashboard_page --> mvp_voting_card
    
    finance_page --> finance_summary
    finance_page --> transaction_table
    finance_page --> member_dues_table
```

## 컴포넌트별 데이터 출력 방식

### 대시보드 페이지
- **AnnouncementsCard**: 공지사항(Announcement[]) 목록을 표시
- **UpcomingMatchesCardWrapper**: 다가오는 경기(UpcomingMatch[]) 정보 표시
- **CalendarView**: 월별 캘린더에 이벤트(CalendarEvent[]) 표시
- **MvpVotingCard**: 당일 경기 후 MVP 투표를 위한 컴포넌트

### 재정 페이지
- **FinanceSummary**: 재정 총 잔액, 수입/지출 요약 표시
- **TransactionTable**: 거래 내역(Transaction[]) 테이블로 표시
- **MemberDuesTable**: 회원 회비 납부 상태(MemberDues[]) 표시

## 데이터 타입 구조

### Dashboard 관련 타입 (src/types/dashboard.ts)
```typescript
interface Player { id: string; name: string; }

interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  date: string;
  content: string;
  author: string;
  updatedAt?: string;
}

interface UpcomingMatch {
  id: number;
  date: string;
  location: string;
  opponent?: string;
  attending?: number;
  notAttending?: number;
  pending?: number;
  status?: 'scheduled' | 'cancelled';
  attendingPlayers?: Player[];
  notAttendingPlayers?: Player[];
  pendingPlayers?: Player[];
}

interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'scheduled' | 'cancelled';
}

interface DashboardData {
  announcements: Announcement[];
  upcomingMatches: UpcomingMatch[];
  calendarEvents: Record<string, CalendarEvent[]>;
}
```

### Finance 관련 타입 (src/types/finance.ts)
```typescript
interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  member?: string;
}

interface MemberDues {
  id: number;
  name: string;
  paid: boolean;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paidAmount?: number;
}
```

### Announcement 관련 타입 (src/types/announcement.ts)
```typescript
interface Announcement {
  id: number;
  title: string;
  type: 'notice' | 'match';
  content: string;
  date: string;
  author: string;
  location?: string;
  opponent?: string;
  matchTime?: string;
  attendanceTracking?: boolean;
}

interface AnnouncementFormData extends Partial<Announcement> {}
```

## 데이터 흐름 과정

1. 현재는 모든 데이터가 `src/utils/mock-data.ts`에서 정적으로 생성됨
2. 각 데이터 타입에 맞는 커스텀 훅(`useAnnouncements`, `useUpcomingMatches`, `useFinanceData` 등)에서 데이터를 가져옴
3. 페이지 컴포넌트에서 필요한 훅을 호출하여 데이터를 가져옴
4. 페이지 컴포넌트는 데이터를 하위 컴포넌트에 props로 전달하여 렌더링

## 향후 Supabase 통합 방안

현재 모든 데이터는 모의 데이터를 사용하고 있으며, 실제 Supabase 통합 시 아래와 같은 변경이 필요합니다:

1. 각 훅에서 `getMockData()` 호출을 Supabase 쿼리로 대체
2. 데이터 변경 함수(예: `togglePaymentStatus`)를 Supabase 업데이트 쿼리로 구현
3. 실시간 업데이트가 필요한 경우 Supabase의 실시간 구독 기능 활용 