import { useState, useEffect, useCallback, lazy, Suspense, type ReactNode } from "react";
import { EstimateProvider } from "@/app/contexts/EstimateContext";
import Navigation from "@/app/components/Navigation";
import Header from "@/app/components/Header";
import ServiceCards from "@/app/components/ServiceCards";
import Features from "@/app/components/Features";
import Process from "@/app/components/Process";
import FAQ, { FAQ_ITEMS } from "@/app/components/FAQ";
import Footer from "@/app/components/Footer";
import FloatingEstimateButton from "@/app/components/FloatingEstimateButton";
import WelcomeModal from "@/app/components/WelcomeModal";
import { isLegacyHashEntry, pageForLocation, routeForPage } from "@/app/constants/seo";
import { applyRouteMeta } from "@/app/lib/documentMeta";
import { navLinkProps } from "@/app/lib/navLink";
import type { PageType } from "@/app/types/navigation";

// 메인 페이지에서 안 보이는 무거운 컴포넌트는 lazy loading
const ServerCommission = lazy(() => import("@/app/components/ServerCommission"));
const BotCommission = lazy(() => import("@/app/components/BotCommission"));
const EstimatePage = lazy(() => import("@/app/components/EstimatePage"));
const OrderApp = lazy(() => import("@/app/components/order/OrderApp"));
const FaqPage = lazy(() => import("@/app/components/FaqPage"));
const GuidePage = lazy(() => import("@/app/components/GuidePage"));

/** 메인에 노출하는 대표 질문. 전체 목록은 /faq/ 에서 본다 */
const FEATURED_FAQ_ITEMS = FAQ_ITEMS.filter((item) => item.featured);

// 현재 URL 경로에 따라 초기 페이지 상태 결정 (SSR/프리렌더 시에는 initialPage 를 받는다)
const getInitialPage = (): PageType => {
  if (typeof window === 'undefined') return 'home';
  return pageForLocation(window.location.pathname, window.location.hash);
};

interface AppProps {
  /** 빌드 타임 프리렌더에서 렌더할 페이지를 지정한다 */
  initialPage?: PageType;
}

/** 메인 외 하위 페이지의 공통 껍데기 (상단 네비 + 본문 + 푸터) */
function SubPageLayout({ currentPage, onNavigate, children }: {
  currentPage: PageType;
  onNavigate: (page: string) => void;
  children: ReactNode;
}) {
  return (
    <>
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />
      <div className="pt-16">
        <Suspense fallback={<div className="min-h-screen" />}>
          {children}
        </Suspense>
        <Footer onNavigate={onNavigate} />
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
        {currentPage === 'terms' && <GuidePage onNavigate={handleNavigate} />}
        {currentPage === 'faq' && <FaqPage onNavigate={handleNavigate} />}
      </SubPageLayout>
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

        {/* 섹션 4: 대표 FAQ - 전체 목록은 /faq/ 로 분리 */}
        <div className="bg-gray-50">
          <div className="max-w-[1060px] mx-auto px-8 py-16">
            <FAQ
              items={FEATURED_FAQ_ITEMS}
              showSearch={false}
              footer={
                <a
                  {...navLinkProps('faq', handleNavigate)}
                  className="inline-flex items-center gap-2 text-[15px] text-[var(--brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
                >
                  전체 FAQ {FAQ_ITEMS.length}개 보기
                  <span className="text-[18px]">→</span>
                </a>
              }
            />
          </div>
        </div>

        {/* 섹션 5: 하단 CTA */}
        <div className="bg-white">
          <div className="max-w-[1060px] mx-auto px-8 py-20 text-center border-t border-border">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold mb-4">
              준비되셨나요?
            </h2>
            <p className="text-[16px] leading-[1.8] text-foreground/60 mb-8 max-w-[560px] mx-auto">
              원하는 옵션을 골라 예상 금액을 확인해 보세요.<br />
              견적을 담아두면 신청서에 그대로 이어집니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                {...navLinkProps('server', handleNavigate)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--brand-primary)] text-white rounded-full font-semibold text-[16px] shadow-sm hover:shadow-md hover:brightness-95 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
              >
                서버 커미션 견적 내기
                <span className="text-[18px]">→</span>
              </a>
              <a
                {...navLinkProps('bot', handleNavigate)}
                className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-full font-semibold text-[16px] hover:bg-[var(--brand-bg)] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
              >
                자동봇 커미션 견적 내기
                <span className="text-[18px]">→</span>
              </a>
            </div>
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
