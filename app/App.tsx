import { useState, useEffect, useRef } from "react";
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
  const faqRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (page: string) => {
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
  };

  // URL hash 변경 처리
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['home', 'server', 'bot', 'estimate', 'faq', 'terms'].includes(hash)) {
        handleNavigate(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 페이지 변경 시 hash 업데이트
  useEffect(() => {
    if (currentPage !== 'home' || window.location.hash !== '') {
      window.location.hash = currentPage === 'home' ? '' : currentPage;
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