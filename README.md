# MAS Commission - GitHub Page

커미션 작업을 소개하는 정적 웹사이트입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router (기존)
- CSS3

## 설치 및 실행

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 미리보기

```bash
npm run preview
```

## GitHub Pages 배포

이 프로젝트는 `longwhile.github.io` 저장소에 배포됩니다.

1. 빌드 후 `dist` 폴더의 내용을 GitHub Pages에 배포하세요.
2. 또는 GitHub Actions를 설정하여 자동 배포할 수 있습니다.

## 프로젝트 구조

```
├── public/          # 정적 파일
├── app/             # Figma에서 생성된 메인 앱
│   ├── components/  # 재사용 가능한 컴포넌트
│   └── contexts/    # React 컨텍스트
├── src/             # 기존 소스 코드 (레거시)
│   ├── components/  # 재사용 가능한 컴포넌트
│   │   ├── Header.tsx
│   │   └── Header.css
│   ├── pages/       # 페이지 컴포넌트
│   │   ├── Home.tsx
│   │   ├── CommissionGuide.tsx
│   │   ├── Portfolio.tsx
│   │   └── Contact.tsx
│   ├── App.tsx      # 메인 앱 컴포넌트
│   ├── App.css
│   ├── main.tsx     # React 엔트리 포인트
│   └── index.css    # 전역 스타일
├── styles/          # 전역 스타일 (Tailwind CSS 포함)
├── imports/         # Figma에서 import된 컴포넌트
├── index.html       # HTML 엔트리 포인트
├── package.json
├── tsconfig.json
└── vite.config.ts
```
