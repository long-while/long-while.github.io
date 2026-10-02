/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import '@/styles/index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// 개발 모드 전용 컴포넌트 확인 페이지. 프로덕션 빌드에서는 import.meta.env.DEV 가 false 라
// 이 분기와 동적 import 가 통째로 빠진다 (dist 에 포함되지 않음).
if (import.meta.env.DEV && window.location.pathname.replace(/\/+$/, '') === '/__components') {
  import('@/app/dev/ComponentsPage').then(({ ComponentsPage }) => {
    root.render(
      <React.StrictMode>
        <ComponentsPage />
      </React.StrictMode>,
    )
  })
} else {
  // App.tsx 가 경로 기반으로 모든 페이지 처리 (/server/, /order/ 등)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
