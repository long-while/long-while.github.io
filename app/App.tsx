import { useState, useEffect, useRef, useCallback } from "react";
import { EstimateProvider } from "@/app/contexts/EstimateContext";
import Navigation from "@/app/components/Navigation";
import Header from "@/app/components/Header";
import ServiceCards from "@/app/components/ServiceCards";
import ServerCommission from "@/app/components/ServerCommission";
import BotCommission from "@/app/components/BotCommission";
import EstimatePage from "@/app/components/EstimatePage";
import Process from "@/app/components/Process";
import FAQ from "@/app/components/FAQ";
import Terms from "@/app/components/Terms";
import Footer from "@/app/components/Footer";

type PageType = 'home' | 'server' | 'bot' | 'estimate' | 'faq' | 'terms';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const currentPageRef = useRef<PageType>('home');
  const faqRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);
  const isUpdatingHashRef = useRef(false);

  // currentPage가 변경될 때마다 ref 업데이트
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const handleNavigate = useCallback((page: string) => {
    if (page === 'faq') {
      setCurrentPage('home');
      setTimeout(() => {
        faqRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (page === 'terms') {
      setCurrentPage('home');
      setTimeout(() => {
        termsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setCurrentPage(page as PageType);
      // 페이지 이동 시 즉시 스크롤을 맨 위로 이동
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  // URL hash 변경 처리 (브라우저 뒤로가기/앞으로가기 포함)
  useEffect(() => {
    const handleHashChange = () => {
      // 무한 루프 방지: 프로그래밍 방식으로 hash를 변경할 때는 무시
      if (isUpdatingHashRef.current) {
        return;
      }

      const hash = window.location.hash.slice(1);
      
      // hash가 빈 문자열이거나 'home'인 경우 홈으로 이동
      if (!hash || hash === 'home') {
        if (currentPageRef.current !== 'home') {
          setCurrentPage('home');
        }
      } else if (['server', 'bot', 'estimate', 'faq', 'terms'].includes(hash)) {
        if (currentPageRef.current !== hash) {
          handleNavigate(hash);
        }
      }
    };

    // 초기 로드 시 hash 확인
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleNavigate]);

  // 페이지 변경 시 hash 업데이트 (무한 루프 방지)
  useEffect(() => {
    // hashchange 이벤트로 인한 변경은 무시
    if (isUpdatingHashRef.current) {
      return;
    }

    const currentHash = window.location.hash.slice(1);
    const expectedHash = currentPage === 'home' ? '' : currentPage;

    // hash와 currentPage가 동기화되어 있는지 확인
    if (currentHash !== expectedHash) {
      isUpdatingHashRef.current = true;
      
      if (currentPage === 'home') {
        // home 페이지일 때는 hash를 제거
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        // 다른 페이지일 때는 hash 설정
        window.location.hash = currentPage;
      }
      
      // 다음 이벤트 루프에서 플래그 리셋
      setTimeout(() => {
        isUpdatingHashRef.current = false;
      }, 0);
    }
  }, [currentPage]);

  if (currentPage === 'server') {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <ServerCommission onBack={() => setCurrentPage('home')} />
          <Footer onNavigate={handleNavigate} />
        </div>
      </>
    );
  }

  if (currentPage === 'bot') {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <BotCommission onBack={() => setCurrentPage('home')} />
          <Footer onNavigate={handleNavigate} />
        </div>
      </>
    );
  }

  if (currentPage === 'estimate') {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <EstimatePage onBack={() => setCurrentPage('home')} />
          <Footer onNavigate={handleNavigate} />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="min-h-screen bg-white text-foreground pt-16">
        {/* Header는 풀 width */}
        <Header />
        {/* 나머지 컨텐츠는 max-width 적용 */}
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <ServiceCards onNavigate={handleNavigate} />
          <Process />
          <div ref={faqRef}>
            <FAQ />
          </div>
          <div ref={termsRef}>
            <Terms />
          </div>
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <EstimateProvider>
      <AppContent />
    </EstimateProvider>
  );
}