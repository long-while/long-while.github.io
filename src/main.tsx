/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'
import '@/styles/index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// 새로 배포한 뒤 예전 페이지를 열어 둔 사용자는 지워진 코드 조각(chunk)을 불러오다 실패한다.
// 한 번만 새로고침해 최신 파일을 받는다 (무한 새로고침 방지로 세션당 1회, 4단계 검토)
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('mas_reloaded_after_deploy')) return
    sessionStorage.setItem('mas_reloaded_after_deploy', '1')
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

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
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
