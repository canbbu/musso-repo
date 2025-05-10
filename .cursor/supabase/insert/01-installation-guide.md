# Supabase 데이터 테스터 컴포넌트 설치 가이드

이 가이드는 Supabase 데이터 테스트 컴포넌트를 설치하고 구성하는 방법을 설명합니다.

## 사전 요구사항

- Node.js(v14 이상)
- React 기반 프로젝트
- Supabase 프로젝트 및 API 키

## 설치 단계

### 1. 필수 패키지 설치

다음 명령어를 사용하여 필요한 패키지를 설치합니다:

```bash
npm install @supabase/supabase-js react-hook-form
# 또는
yarn add @supabase/supabase-js react-hook-form
```

### 2. 컴포넌트 파일 생성

프로젝트에서 다음 두 가지 방식 중 하나를 선택하여 컴포넌트를 설치할 수 있습니다:

#### 옵션 1: 독립 페이지로 사용

`pages/admin/supabase-tester.tsx` 파일을 생성합니다.

#### 옵션 2: 컴포넌트로 사용

`components/admin/SupabaseDataTester.tsx` 파일을 생성합니다.

### 3. Supabase 클라이언트 설정

프로젝트의 적절한 위치(예: `utils/supabaseClient.ts`)에 Supabase 클라이언트 설정 파일을 생성합니다:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 프로젝트의 URL과 익명 키를 추가합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. 테이블 목록 설정

컴포넌트에서 사용할 테이블 목록을 설정합니다. 기본 설정으로는 다음과 같은 일반적인 테이블이 포함되어 있습니다:

- profiles
- posts
- comments
- products
- categories
- orders
- users
- settings

프로젝트에 맞게 이 목록을 수정할 수 있습니다.

## 보안 고려사항

이 테스트 컴포넌트는 개발 및 테스트 목적으로만 사용해야 합니다. 프로덕션 환경에서는 다음 사항을 고려하세요:

1. 관리자 전용 경로에 배치하고 적절한 인증을 적용하세요.
2. 환경 변수가 노출되지 않도록 주의하세요.
3. 프로덕션 환경에서는 가능한 한 제한된 권한을 가진 서비스 키를 사용하세요.

## 다음 단계

설치가 완료되면 [사용 가이드](./02-usage-guide.md)를 참조하여 테스트 컴포넌트를 사용하는 방법을 알아보세요. 