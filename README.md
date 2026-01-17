# MAS Commission - GitHub Page

커미션 작업을 소개하는 정적 웹사이트입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router
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

1. `vite.config.ts`에서 `base` 경로를 저장소 이름에 맞게 수정하세요.
2. 빌드 후 `dist` 폴더의 내용을 GitHub Pages에 배포하세요.

## 프로젝트 구조

```
├── public/          # 정적 파일
├── src/
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
├── index.html       # HTML 엔트리 포인트
├── package.json
├── tsconfig.json
└── vite.config.ts
```
