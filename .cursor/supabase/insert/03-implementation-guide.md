# Supabase 데이터 입력 구현 및 테스트 가이드

이 문서는 데이터 입력 컴포넌트를 Supabase와 연동하는 전체 프로세스 및 테스트 절차를 설명합니다.

## 1. 구현 흐름도

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  데이터 타입 정의  │────▶│   훅 함수 수정   │────▶│  컴포넌트 수정   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                      │
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Supabase 스키마 │     │  데이터 검증 로직 │     │   UI 반응성 개선 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │    통합 테스트   │
                       └─────────────────┘
```

## 2. 단계별 구현 가이드

### 2.1 환경 설정 및 준비

1. **환경 변수 설정**
   ```shell
   # .env 파일 생성
   echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co" > .env
   echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
   ```

2. **Supabase 패키지 설치**
   ```shell
   npm install @supabase/supabase-js
   ```

3. **Supabase 클라이언트 설정**
   ```shell
   mkdir -p src/lib
   touch src/lib/supabase.ts
   ```

   `src/lib/supabase.ts` 내용:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   
   if (!supabaseUrl || !supabaseAnonKey) {
     throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
   }
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

### 2.2 데이터 타입 확인 및 수정

프로젝트의 타입스크립트 인터페이스와 Supabase 테이블 구조를 비교하여 일관성을 유지해야 합니다.

1. **인터페이스 필드명 확인**
   - TypeScript 인터페이스는 camelCase 사용 (`updatedAt`)
   - Supabase 데이터베이스는 snake_case 사용 (`updated_at`)
   - 데이터 매핑 함수 구현을 통한 일관성 유지

2. **예시: 데이터 매핑 유틸리티 함수 구현**
   ```typescript
   // src/utils/data-mappers.ts
   import { Announcement } from '@/types/announcement';
   
   // Supabase DB 형식에서 프론트엔드 형식으로 변환
   export function mapAnnouncementFromDB(data: any): Announcement {
     return {
       id: data.id,
       title: data.title,
       type: data.type,
       content: data.content,
       date: data.date,
       author: data.author,
       location: data.location,
       opponent: data.opponent,
       matchTime: data.match_time,
       attendanceTracking: data.attendance_tracking,
       updatedAt: data.updated_at
     };
   }
   
   // 프론트엔드 형식에서 Supabase DB 형식으로 변환
   export function mapAnnouncementToDB(data: Announcement): any {
     return {
       id: data.id,
       title: data.title,
       type: data.type,
       content: data.content,
       date: data.date,
       author: data.author,
       location: data.location,
       opponent: data.opponent,
       match_time: data.matchTime,
       attendance_tracking: data.attendanceTracking,
       updated_at: data.updatedAt
     };
   }
   ```

### 2.3 데이터 훅 구현 순서

1. **Supabase 읽기(READ) 기능 구현**
   - 데이터 불러오기 코드 먼저 구현
   - 로딩 및 오류 상태 관리
   - 데이터 매핑 적용

2. **생성(CREATE) 기능 구현**
   - 폼 제출 시 Supabase 데이터 추가
   - 응답 데이터로 로컬 상태 업데이트

3. **수정(UPDATE) 기능 구현**
   - ID 기반 데이터 업데이트
   - 업데이트된 응답으로 로컬 상태 업데이트

4. **삭제(DELETE) 기능 구현**
   - ID 기반 데이터 삭제
   - 삭제 후 로컬 상태 업데이트

5. **실시간 구독 구현** (선택적)
   - 테이블 변경 이벤트에 대한 구독 설정
   - 이벤트 핸들러에서 로컬 상태 업데이트

### 2.4 컴포넌트 수정 순서

1. **로딩 상태 및 에러 표시 추가**
   - 스켈레톤 로더 또는 스피너 추가
   - 오류 메시지 표시 영역 구현

2. **데이터 입력 폼 기능 확장**
   - 입력값 검증 추가
   - 제출 중 로딩 상태 처리
   - 성공/실패 피드백 추가

3. **최적화**
   - 불필요한 리렌더링 방지
   - 지연 로딩(lazy loading) 적용
   - 캐싱 전략 수립

## 3. 테스트 절차

### 3.1 개별 컴포넌트 테스트

1. **공지사항 관리 테스트**
   - [x] 공지사항 목록이 올바르게 표시되는지 확인
   - [x] 새 공지사항 추가 기능 테스트
   - [x] 기존 공지사항 수정 기능 테스트
   - [x] 공지사항 삭제 기능 테스트
   - [x] 로딩 및 오류 상태가 올바르게 표시되는지 확인

2. **경기 관리 테스트**
   - [x] 경기 목록이 올바르게 표시되는지 확인
   - [x] 경기 참석 상태 변경 기능 테스트
   - [x] 참석 상태 변경 시 실시간 업데이트 확인
   - [x] 경기 상세 정보 표시 확인

3. **재정 관리 테스트**
   - [x] 거래 내역이 올바르게 표시되는지 확인
   - [x] 회비 납부 상태 변경 기능 테스트
   - [x] 회비 납부 변경 시 거래 내역 자동 추가 확인
   - [x] 재정 요약 정보가 올바르게 계산되는지 확인

### 3.2 통합 테스트

1. **데이터 흐름 테스트**
   - 한 컴포넌트의 데이터 변경이 다른 컴포넌트에 올바르게 반영되는지 확인
   - 예: 경기 일정 등록 시 대시보드 및 경기 관리 페이지에 모두 반영됨

2. **권한 테스트**
   - 사용자 역할에 따른 기능 제한이 올바르게 적용되는지 확인
   - Supabase RLS 정책이 프론트엔드 권한과 일치하는지 확인

3. **오류 시나리오 테스트**
   - 네트워크 끊김 상황에서의 동작 확인
   - 동시성 문제 테스트 (여러 사용자가 동시에 같은 데이터 수정)
   - 입력값 검증 우회 시도

## 4. 성능 최적화

### 4.1 쿼리 최적화

1. **필요한 컬럼만 선택**
   ```typescript
   // 좋은 예
   const { data } = await supabase
     .from('announcements')
     .select('id, title, date, author')
     .order('date', { ascending: false });
   
   // 나쁜 예
   const { data } = await supabase
     .from('announcements')
     .select('*')
     .order('date', { ascending: false });
   ```

2. **페이지네이션 활용**
   ```typescript
   const { data } = await supabase
     .from('transactions')
     .select('*')
     .order('date', { ascending: false })
     .range(0, 9); // 첫 10개 항목만 가져오기
   ```

### 4.2 캐싱 전략

1. **SWR 또는 React Query 활용**
   ```bash
   npm install @tanstack/react-query
   ```

2. **캐싱 적용 예시**
   ```typescript
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   
   // 데이터 조회
   const useAnnouncements = () => {
     return useQuery(['announcements'], async () => {
       const { data, error } = await supabase
         .from('announcements')
         .select('*')
         .order('date', { ascending: false });
       
       if (error) throw error;
       return data || [];
     });
   };
   
   // 데이터 추가
   const useAddAnnouncement = () => {
     const queryClient = useQueryClient();
     
     return useMutation(
       async (formData: AnnouncementFormData) => {
         const { data, error } = await supabase
           .from('announcements')
           .insert([{
             title: formData.title!,
             type: formData.type as 'notice' | 'match',
             // ... 나머지 필드
           }])
           .select()
           .single();
         
         if (error) throw error;
         return data;
       },
       {
         // 추가 성공 시 캐시 업데이트
         onSuccess: (newAnnouncement) => {
           queryClient.setQueryData(
             ['announcements'],
             (old: any[]) => [newAnnouncement, ...old]
           );
         }
       }
     );
   };
   ```

## 5. 배포 및 운영 고려사항

### 5.1 배포 전 확인사항

1. **환경 변수 설정**
   - 개발/운영 환경별 Supabase 프로젝트 분리
   - 운영 환경 API 키 보안 관리

2. **권한 설정 확인**
   - RLS 정책이 모든 경우를 포함하는지 검증
   - 민감한 데이터 접근 제한 확인

3. **에러 로깅 설정**
   - Sentry 등을 통한 프론트엔드 에러 모니터링
   - Supabase 로그 확인 방법 숙지

### 5.2 운영 이슈 대응

1. **데이터 불일치 문제**
   - 로컬 캐시와 서버 데이터 간 불일치 해결 방법
   - 실시간 구독 문제 발생 시 폴백 전략

2. **서비스 중단 대응**
   - Supabase 서비스 장애 시 사용자 안내 방법
   - 오프라인 모드 지원 고려

## 6. 관련 문서 및 참고 자료

- [Supabase 공식 문서](https://supabase.io/docs)
- [Supabase Javascript SDK](https://supabase.io/docs/reference/javascript/start)
- [Supabase RLS 권한 설정](https://supabase.io/docs/guides/auth/row-level-security) 