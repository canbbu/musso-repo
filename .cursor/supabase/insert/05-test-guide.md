# Supabase 데이터 입력 테스트 가이드

이 문서는 Supabase 데이터 입력 기능을 테스트하기 위한 컴포넌트 사용법을 설명합니다.

## 테스트 컴포넌트 설치 및 사용

### 1. 파일 배치

`/04-test-component.tsx` 파일을 프로젝트의 적절한 위치에 배치합니다. 예를 들어:

```
pages/admin/supabase-tester.tsx
```

또는 컴포넌트로 사용하려면:

```
components/admin/SupabaseDataTester.tsx
```

### 2. 필요한 의존성 설치

이 컴포넌트는 다음 의존성이 필요합니다:
- React
- Supabase 클라이언트
- Tailwind CSS (스타일링)

### 3. 컴포넌트 사용하기

#### 페이지로 사용하는 경우

```tsx
// pages/admin/supabase-tester.tsx
import { SupabaseDataTester } from '@/components/admin/SupabaseDataTester';

export default function SupabaseTesterPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase 데이터 테스트</h1>
      <SupabaseDataTester />
    </div>
  );
}
```

#### 컴포넌트로 사용하는 경우

```tsx
import { SupabaseDataTester } from '@/components/admin/SupabaseDataTester';

export default function AdminPage() {
  return (
    <div>
      <h2>관리자 도구</h2>
      <SupabaseDataTester />
    </div>
  );
}
```

## 테스트 컴포넌트 기능

### 주요 기능

1. **테이블 선택**: 드롭다운 메뉴에서 테스트할 Supabase 테이블을 선택할 수 있습니다.
2. **실시간 업데이트**: 실시간 업데이트 기능을 켜거나 끌 수 있습니다.
3. **데이터 추가**: 선택한 테이블에 새 데이터를 추가할 수 있습니다.
4. **데이터 조회**: 선택한 테이블의 데이터를 조회하고 표시합니다.
5. **데이터 삭제**: 테이블에서 특정 항목을 삭제할 수 있습니다.

### 사용 방법

1. 테이블 선택 버튼 중 하나를 클릭하여 테스트할 테이블을 선택합니다.
2. 실시간 업데이트를 활성화하려면 체크박스를 선택합니다.
3. 데이터 새로고침 버튼을 클릭하여 최신 데이터를 불러옵니다.
4. 새 데이터 추가 섹션에서 필요한 필드를 작성하고 저장 버튼을 클릭합니다.
5. 테이블 데이터 섹션에서 현재 데이터를 확인하고 필요한 경우 삭제할 수 있습니다.

## 테스트 시나리오

다음 시나리오를 통해 Supabase 데이터 입력 기능을 테스트할 수 있습니다:

### 시나리오 1: 기본 데이터 작성 및 조회

1. 'announcements' 테이블을 선택합니다.
2. 새 데이터 추가 폼에서 필요한 필드를 작성합니다.
   - 제목, 내용, 타입 등을 입력합니다.
3. 저장 버튼을 클릭합니다.
4. 테이블 데이터 섹션에서 새로 추가된 항목이 표시되는지 확인합니다.

### 시나리오 2: 실시간 업데이트 테스트

1. 'announcements' 테이블을 선택합니다.
2. 실시간 업데이트 체크박스를 선택하여 실시간 기능을 활성화합니다.
3. 다른 브라우저 창이나 기기에서 동일한 페이지를 열고 데이터를 추가합니다.
4. 첫 번째 창에서 추가된 데이터가 실시간으로 표시되는지 확인합니다.

### 시나리오 3: 데이터 삭제 테스트

1. 테이블 데이터 섹션에서 삭제하려는 항목의 삭제 버튼을 클릭합니다.
2. 확인 메시지에 '확인'을 선택합니다.
3. 해당 항목이 목록에서 제거되는지 확인합니다.

## 커스터마이징

테스트 컴포넌트는 필요에 따라 다음과 같이 커스터마이징할 수 있습니다:

### 테이블 목록 수정

기본적으로 'announcements', 'matches', 'transactions', 'dues' 테이블이 포함되어 있습니다. 다른 테이블을 테스트하려면 `tables` 배열을 수정하세요:

```tsx
const tables = ['announcements', 'matches', 'transactions', 'dues', '내_테이블'];
```

### 필드 유형 커스터마이징

특정 필드의 입력 유형을 변경하려면 `handleInputChange` 함수 근처의 조건부 렌더링 로직을 수정하세요. 예를 들어:

```tsx
{['type', 'status', '내_필드'].includes(field) ? (
  <select>...</select>
) : ...}
```

## 문제 해결

### 오류: 테이블이 존재하지 않음

Supabase 프로젝트에 해당 테이블이 존재하는지 확인하세요. 테이블 이름은 대소문자를 구분합니다.

### 오류: 권한 부족

Supabase 프로젝트의 권한 설정을 확인하세요. 테이블에 대한 읽기/쓰기 권한이 필요합니다.

### 오류: 실시간 구독 실패

Supabase 프로젝트에서 실시간 구독 기능이 활성화되어 있는지 확인하세요.

## 보안 고려사항

이 테스트 컴포넌트는 개발 및 테스트 목적으로만 사용해야 합니다. 프로덕션 환경에서는 다음 사항을 고려하세요:

1. 관리자 전용 페이지로 설정하고 적절한 인증 및 권한 검사를 추가하세요.
2. 중요한 데이터를 다룰 때는 추가적인 유효성 검사와 확인 절차를 구현하세요.
3. 사용자 입력에 대한 적절한 검증과 이스케이핑을 적용하세요.

## 추가 리소스

- [Supabase 공식 문서](https://supabase.io/docs)
- [Supabase 실시간 기능 문서](https://supabase.io/docs/guides/realtime)
- [React와 Supabase 연동 가이드](https://supabase.io/docs/guides/with-react) 