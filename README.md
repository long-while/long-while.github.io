# MAS Commission - 한참 코딩 커미션

Longwhile 코딩 커미션을 위한 공식 웹사이트입니다.

## 🎯 주요 기능

### 1. 메인 사이트
- **홈**: 서비스 소개 및 프로세스 안내
- **커미션 가이드**: 가격 정책, 주의사항
- **포트폴리오**: 작업물 소개
- **문의하기**: 일반 문의 폼

### 2. 스마트 신청서 시스템 (NEW! `/order`)
4단계 대화형 폼으로 구성된 Google Forms 스타일 신청서

#### Step 1: 신청자 및 커뮤니티 정보
- ✅ 약관 동의 검증
- ✅ 신청자/커뮤니티 정보 입력
- ✅ 날짜 자동 검증 (합발일 ≤ 개장일 < 폐장일)
- ✅ **N주 자동 계산** + 실시간 피드백

#### Step 2: 서버 설치 옵션
- ✅ 예/아니오 조건부 분기
- ✅ **배타적 선택** (로고 vs 테마)
- ✅ 글자수 1000 입력 차단
- ✅ 조건부 필드 노출

#### Step 3: 자동봇 커미션
- ✅ 자동봇 신청 분기
- ✅ Step 1 주수와 자동 동기화
- ✅ 메인 봇 선택 (기본/상점/스탯)
- ✅ **양도 기능 조건부 노출**
- ✅ 오마카세 textarea

#### Step 4: 최종 확인 및 견적
- ✅ 전체 입력 내용 요약 (섹션별 수정 버튼)
- ✅ **실시간 견적 계산**
- ✅ "예" 입력 검증
- ✅ **클립보드 복사** + 성공 피드백
- ✅ **자동 저장** (5초마다 + 페이지 이탈 시)

## 🎨 기술 스택

- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context API
- **Routing**: Hash-based (기존) + Path-based (`/order`)
- **Form**: Custom hooks + validation
- **Icons**: Lucide React
- **Date**: date-fns

## 📁 프로젝트 구조

```
├── public/              # 정적 파일
├── app/                 # Figma에서 생성된 메인 앱
│   ├── types/
│   │   └── order.ts                # 신청서 타입 정의
│   ├── contexts/
│   │   ├── EstimateContext.tsx     # 기존 견적 Context
│   │   └── OrderContext.tsx        # 신청서 상태 관리 (NEW)
│   ├── utils/
│   │   └── orderUtils.ts           # 검증·계산·텍스트 생성 (NEW)
│   └── components/
│       ├── order/                  # 신청서 시스템 (NEW)
│       │   ├── OrderApp.tsx        # /order 진입점
│       │   ├── OrderForm.tsx       # Step 전환 + 검증
│       │   └── steps/
│       │       ├── Step1Applicant.tsx
│       │       ├── Step2Server.tsx
│       │       ├── Step3Bot.tsx
│       │       └── Step4Review.tsx
│       ├── Navigation.tsx
│       ├── Footer.tsx
│       ├── ServerCommission.tsx
│       ├── BotCommission.tsx
│       ├── EstimatePage.tsx
│       └── ui/                     # shadcn/ui 컴포넌트
├── src/                 # 기존 소스 코드 (React Router 버전)
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx         # 경로 분기 로직 포함
├── docs/                # 문서 (NEW)
│   ├── 통합-구현-정리.md
│   ├── order-page-plan.md
│   └── CODE_REVIEW_IMPROVEMENTS.md
├── styles/              # 전역 스타일
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
# http://localhost:5173/mas-commission/
```

### 신청서 페이지 접근
```
http://localhost:5173/mas-commission/order
```

### 프로덕션 빌드
```bash
npm run build
# dist/ 폴더에 빌드 결과 생성
```

### 미리보기
```bash
npm run preview
```

## 🌐 GitHub Pages 배포

이 프로젝트는 GitHub Pages에 자동 배포됩니다.

- **Live URL**: `https://long-while.github.io/mas-commission/`
- **신청서**: `https://long-while.github.io/mas-commission/order`
- **자동 배포**: `.github/workflows/deploy.yml`
- **Base Path**: `/mas-commission/`

Push to `main` 브랜치 시 자동으로 배포됩니다.

## ✨ 주요 기능 상세

### 🔄 자동 저장 기능
- ✅ 5초마다 자동 저장 (localStorage)
- ✅ 페이지 떠날 때 자동 저장
- ✅ 재방문 시 복원 다이얼로그
- ✅ "이어서 작성" vs "새로 작성" 선택

### ✅ 실시간 검증
- ✅ 날짜 포맷 및 순서 검증
- ✅ Gmail 정규식 검증
- ✅ 글자수 1000 차단
- ✅ 비밀번호 최소 길이 (8자)
- ✅ 글자수 범위 (1~10,000)

### 💰 견적 계산
- ✅ 서버 설치 옵션별 금액
- ✅ 봇 기능별 금액
- ✅ 가동 비용 (주수 × 5,000원)
- ✅ 변동 금액 안내 (빠른 마감, 오마카세)

### ♿ 접근성 (A11y)
- ✅ ARIA 레이블 완벽 지원
- ✅ 키보드 네비게이션
- ✅ 스크린 리더 호환
- ✅ WCAG 2.1 AA 준수

### 🎨 UI/UX
- ✅ 네오브루탈리즘 디자인
- ✅ 프로그레스 바 (클릭 가능)
- ✅ 반응형 레이아웃
- ✅ 로딩 인디케이터
- ✅ 에러 Fallback

## 📊 코드 품질

- **TypeScript**: 100% strict mode ✅
- **에러 처리**: Try-catch + Fallback ✅
- **성능**: useCallback/useMemo 최적화 ✅
- **번들 크기**: 207KB (gzipped: 61KB)
- **빌드 시간**: ~380ms
- **린트**: 0 errors, 0 warnings

## 🧪 테스트 (계획)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📖 문서

- **구현 정리**: [`docs/통합-구현-정리.md`](./docs/통합-구현-정리.md)
- **상세 계획**: [`docs/order-page-plan.md`](./docs/order-page-plan.md)
- **코드 리뷰**: [`docs/CODE_REVIEW_IMPROVEMENTS.md`](./docs/CODE_REVIEW_IMPROVEMENTS.md)

## 🔧 개발 가이드

### 새로운 Step 추가
1. `app/types/order.ts`에 타입 추가
2. `app/components/order/steps/` 에 컴포넌트 생성
3. `OrderForm.tsx`에 Step 추가
4. `orderUtils.ts`에 검증/계산 로직 추가

### 검증 로직 추가
```typescript
// app/utils/orderUtils.ts
export function validateCustomField(value: string): ValidationError | null {
  if (!value) {
    return { field: 'customField', message: '필수 입력입니다.' };
  }
  return null;
}
```

### Context 사용
```typescript
import { useOrder } from '@/app/contexts/OrderContext';

const { formData, updateStep1, setCurrentStep } = useOrder();
```

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 개인 커미션 용도로 제작되었습니다.

## 👤 제작자

**한참 (Longwhile)**
- 크레페: [@longwhile](https://crepe.cm/@longwhile/lw5w0ofg)

---

Made with ❤️ by Longwhile
