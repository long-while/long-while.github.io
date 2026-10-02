import { useState, useEffect, useCallback, lazy, Suspense, type ReactNode } from "react";
import { EstimateProvider } from "@/app/contexts/EstimateContext";
import { SiteFooter, SiteHeader } from "@/app/components/ds";
import { HomePage } from "@/app/components/home/HomePage";
import FloatingEstimateButton from "@/app/components/FloatingEstimateButton";
import { isLegacyHashEntry, pageForLocation, routeForPage } from "@/app/constants/seo";
import { applyRouteMeta } from "@/app/lib/documentMeta";
import type { PageType } from "@/app/types/navigation";

// 메인 페이지에서 안 보이는 무거운 컴포넌트는 lazy loading
const ServerCommission = lazy(() => import("@/app/components/server/ServerPage"));
const BotCommission = lazy(() => import("@/app/components/bot/BotPage"));
const EstimatePage = lazy(() => import("@/app/components/EstimatePage"));
const OrderApp = lazy(() => import("@/app/components/order/OrderApp"));
const FaqPage = lazy(() => import("@/app/components/faq/FaqPage"));
const TermsPage = lazy(() => import("@/app/components/terms/TermsPage"));

// 현재 URL 경로에 따라 초기 페이지 상태 결정 (SSR/프리렌더 시에는 initialPage 를 받는다)
const getInitialPage = (): PageType => {
  if (typeof window === 'undefined') return 'home';
  return pageForLocation(window.location.pathname, window.location.hash);
};

interface AppProps {
  /** 빌드 타임 프리렌더에서 렌더할 페이지를 지정한다 */
  initialPage?: PageType;
}

/** 시안 배너가 있어 화면 맨 위부터 시작하고 헤더가 그 위에 뜨는 페이지 (P1). 나머지는 헤더 높이만큼 비운다 */
const BANNER_PAGES: ReadonlySet<PageType> = new Set<PageType>(['server', 'bot', 'faq', 'terms']);

/** 메인 외 하위 페이지의 공통 껍데기 (상단 네비 + 본문 + 푸터) */
function SubPageLayout({ currentPage, onNavigate, children }: {
  currentPage: PageType;
  onNavigate: (page: string) => void;
  children: ReactNode;
}) {
  const hasBanner = BANNER_PAGES.has(currentPage);
  return (
    <>
      <SiteHeader currentPage={currentPage} onNavigate={onNavigate} />
      <div className={hasBanner ? undefined : 'pt-header'}>
        <Suspense fallback={<div className="min-h-screen" />}>
          {children}
        </Suspense>
        <SiteFooter onNavigate={onNavigate} flush={hasBanner} />
      </div>
      <FloatingEstimateButton onNavigate={onNavigate} currentPage={currentPage} />
    </>
  );
}

function AppContent({ initialPage }: AppProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(() => initialPage ?? getInitialPage());

  const handleNavigate = useCallback((page: string) => {
    const route = routeForPage(page as PageType);
    setCurrentPage(route.page);
    if (window.location.pathname + window.location.hash !== route.path) {
      window.history.pushState(null, '', route.path);
    }
    // 페이지 이동 시 즉시 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 최초 진입 처리: 구버전 해시 링크(#server, #faq 등)를 새 경로로 1회 치환한다 (색인/공유 링크 호환)
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    if (!isLegacyHashEntry(pathname, hash)) return;

    const route = routeForPage(pageForLocation(pathname, hash));
    window.history.replaceState(null, '', route.path + search);
    // 최초 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 브라우저 뒤로/앞으로 가기 처리
  useEffect(() => {
    const handlePopState = () => {
      const { pathname, hash } = window.location;
      const page = pageForLocation(pathname, hash);
      setCurrentPage(page);

      // 세션 도중 구버전 해시 링크를 타고 들어온 경우에도 주소를 새 경로로 맞춰 준다
      // (최초 진입 처리와 동일하게 쿼리스트링은 보존한다)
      if (isLegacyHashEntry(pathname, hash)) {
        window.history.replaceState(null, '', routeForPage(page).path + window.location.search);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 첫 방문 환영 모달은 리디자인(Q8)으로 삭제했다. 예전에 저장된 '이미 봤음' 값만 한 번 정리한다.
  useEffect(() => {
    try {
      window.localStorage.removeItem('longwhile_welcome_shown');
    } catch {
      // 저장소 접근이 막힌 환경(사생활 보호 모드 등)에서는 정리할 것이 없다
    }
  }, []);

  // 페이지가 바뀌면 title/description/canonical 도 함께 갱신
  useEffect(() => {
    applyRouteMeta(routeForPage(currentPage));
  }, [currentPage]);

  if (currentPage === 'order') {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <OrderApp onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (currentPage !== 'home') {
    return (
      <SubPageLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === 'server' && (
          <ServerCommission onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}
        {currentPage === 'bot' && (
          <BotCommission onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}
        {currentPage === 'estimate' && (
          <EstimatePage onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}
        {currentPage === 'terms' && <TermsPage onNavigate={handleNavigate} />}
        {currentPage === 'faq' && <FaqPage onNavigate={handleNavigate} />}
      </SubPageLayout>
    );
  }

  // 메인: 히어로가 화면 맨 위부터 깔리고 헤더가 그 위에 뜬다 (P1)
  return (
    <>
      <SiteHeader currentPage={currentPage} onNavigate={handleNavigate} />
      <HomePage onNavigate={handleNavigate} />
      <SiteFooter onNavigate={handleNavigate} flush />
      <FloatingEstimateButton onNavigate={handleNavigate} currentPage={currentPage} />
    </>
  );
}

export default function App({ initialPage }: AppProps = {}) {
  return (
    <EstimateProvider>
      <AppContent initialPage={initialPage} />
    </EstimateProvider>
  );
}
