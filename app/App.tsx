import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { EstimateProvider } from "@/app/contexts/EstimateContext";
import Navigation from "@/app/components/Navigation";
import Header from "@/app/components/Header";
import ServiceCards from "@/app/components/ServiceCards";
import Features from "@/app/components/Features";
import Process from "@/app/components/Process";
import FAQ from "@/app/components/FAQ";
import Terms from "@/app/components/Terms";
import Footer from "@/app/components/Footer";
import FloatingEstimateButton from "@/app/components/FloatingEstimateButton";
import WelcomeModal from "@/app/components/WelcomeModal";
import { isLegacyHashEntry, pageForLocation, routeForPage } from "@/app/constants/seo";
import { applyRouteMeta } from "@/app/lib/documentMeta";
import type { PageType } from "@/app/types/navigation";

// 메인 페이지에서 안 보이는 무거운 컴포넌트는 lazy loading
const ServerCommission = lazy(() => import("@/app/components/ServerCommission"));
const BotCommission = lazy(() => import("@/app/components/BotCommission"));
const EstimatePage = lazy(() => import("@/app/components/EstimatePage"));
const OrderApp = lazy(() => import("@/app/components/order/OrderApp"));

// 현재 URL 경로에 따라 초기 페이지 상태 결정 (SSR/프리렌더 시에는 initialPage 를 받는다)
const getInitialPage = (): PageType => {
  if (typeof window === 'undefined') return 'home';
  return pageForLocation(window.location.pathname, window.location.hash);
};

interface AppProps {
  /** 빌드 타임 프리렌더에서 렌더할 페이지를 지정한다 */
  initialPage?: PageType;
}

function AppContent({ initialPage }: AppProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(() => initialPage ?? getInitialPage());
  const faqRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  // 홈 내 섹션(FAQ/약관)으로 스크롤
  const scrollToSection = useCallback((section: 'faq' | 'terms') => {
    setTimeout(() => {
      const target = section === 'faq' ? faqRef.current : termsRef.current;
      target?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    // faq/terms 는 별도 페이지가 아니라 홈의 섹션이므로 앵커로 이동한다
    if (page === 'faq' || page === 'terms') {
      setCurrentPage('home');
      window.history.pushState(null, '', `/#${page}`);
      scrollToSection(page);
      return;
    }

    const route = routeForPage(page as PageType);
    setCurrentPage(route.page);
    if (window.location.pathname + window.location.hash !== route.path) {
      window.history.pushState(null, '', route.path);
    }
    // 페이지 이동 시 즉시 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [scrollToSection]);

  // 최초 진입 처리: 구버전 해시 링크(#server 등) 경로 치환 + 앵커 스크롤
  useEffect(() => {
    const { pathname, hash, search } = window.location;

    // 예전에 공유된 #server 형태의 링크는 새 경로로 1회 치환한다 (색인/공유 링크 호환)
    if (isLegacyHashEntry(pathname, hash)) {
      const route = routeForPage(pageForLocation(pathname, hash));
      window.history.replaceState(null, '', route.path + search);
      return;
    }

    const anchor = hash.replace(/^#/, '');
    if (anchor === 'faq' || anchor === 'terms') {
      scrollToSection(anchor);
    }
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
      if (isLegacyHashEntry(pathname, hash)) {
        window.history.replaceState(null, '', routeForPage(page).path);
        return;
      }

      const anchor = window.location.hash.replace(/^#/, '');
      if (page === 'home' && (anchor === 'faq' || anchor === 'terms')) {
        scrollToSection(anchor);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollToSection]);

  // 페이지가 바뀌면 title/description/canonical 도 함께 갱신
  useEffect(() => {
    applyRouteMeta(routeForPage(currentPage));
  }, [currentPage]);

  if (currentPage === 'server') {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <Suspense fallback={<div className="min-h-screen" />}>
            <ServerCommission onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />
          </Suspense>
          <Footer onNavigate={handleNavigate} />
        </div>
        <FloatingEstimateButton onNavigate={handleNavigate} currentPage={currentPage} />
      </>
    );
  }

  if (currentPage === 'bot') {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <Suspense fallback={<div className="min-h-screen" />}>
            <BotCommission onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />
          </Suspense>
          <Footer onNavigate={handleNavigate} />
        </div>
        <FloatingEstimateButton onNavigate={handleNavigate} currentPage={currentPage} />
      </>
    );
  }

  if (currentPage === 'estimate') {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <Suspense fallback={<div className="min-h-screen" />}>
            <EstimatePage onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />
          </Suspense>
          <Footer onNavigate={handleNavigate} />
        </div>
      </>
    );
  }

  if (currentPage === 'order') {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <OrderApp onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  return (
    <>
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="min-h-screen bg-white text-foreground pt-16">
        {/* Hero 섹션 - 풀 width */}
        <Header />

        {/* 섹션 1: 서비스 카드 (뭘 파는지 명확히) */}
        <div id="services-section" className="bg-white">
          <div className="max-w-[1060px] mx-auto px-8 py-16">
            <ServiceCards onNavigate={handleNavigate} />
          </div>
        </div>

        {/* 섹션 2: 특징 하이라이트 (왜 우리를 선택해야 하는지) - 배경색 다변화 */}
        <div className="bg-gray-50">
          <div className="max-w-[1060px] mx-auto px-8">
            <Features />
          </div>
        </div>

        {/* 섹션 3: 진행 순서 */}
        <div className="bg-white">
          <div className="max-w-[1060px] mx-auto px-8 py-16">
            <Process />
          </div>
        </div>

        {/* 섹션 4: FAQ - 배경색 다변화 */}
        <div className="bg-gray-50">
          <div id="faq" className="max-w-[1060px] mx-auto px-8 py-16 scroll-mt-16" ref={faqRef}>
            <FAQ />
          </div>
        </div>

        {/* 섹션 5: 약관 */}
        <div className="bg-white">
          <div id="terms" className="max-w-[1060px] mx-auto px-8 py-16 scroll-mt-16" ref={termsRef}>
            <Terms />
          </div>
        </div>

        <Footer onNavigate={handleNavigate} />
      </div>
      <FloatingEstimateButton onNavigate={handleNavigate} currentPage={currentPage} />
      <WelcomeModal onNavigate={handleNavigate} />
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
