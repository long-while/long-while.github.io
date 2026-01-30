import { ArrowDownIcon } from '@/app/components/icons';

// Hero 섹션만 담당하는 컴포넌트
export default function Header() {
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // fallback: 화면 높이만큼 스크롤
      window.scrollTo({ top: window.innerHeight - 64, behavior: 'smooth' });
    }
  };

  return (
    <header>
      {/* 히어로 섹션 - 완전히 full width */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 그라데이션 배경 */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'var(--hero-gradient)'
          }}
        />
        
        {/* 블러 효과를 위한 추가 레이어 */}
        <div className="absolute inset-0 backdrop-blur-[80px]" style={{ 
          background: 'radial-gradient(circle at 25% 50%, rgba(220, 227, 232, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255, 119, 34, 0.3) 0%, transparent 50%)'
        }} />

        {/* 컨텐츠 */}
        <div className="relative z-10 text-center px-8 py-15">
          <div className="mb-8">
            <div className="text-[11px] tracking-[0.3em] uppercase text-white/80 mb-6">
              LONGWHILE COMMISSION
            </div>
            <h1 className="text-[72px] md:text-[96px] leading-[0.95] tracking-[-0.03em] text-white mb-6" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>
              한참 커미션
            </h1>
            <p className="text-[16px] md:text-[20px] text-white/90 leading-[1.6] max-w-[800px] mx-auto mb-4">
              마스토돈 자캐커뮤를 위한 최고의 커미션<br/>
              서버 설치부터 자동봇까지 한번에
            </p>
            
            {/* 신뢰 배지 */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-[13px] border border-white/20">
                3개월 무료 서버비
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-[13px] border border-white/20">
                무료 유지보수
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-[13px] border border-white/20">
                1:1 맞춤 설정
              </span>
            </div>
          </div>

          {/* 스크롤 버튼 */}
          <button
            onClick={scrollToServices}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 animate-bounce cursor-pointer"
            aria-label="아래로 스크롤"
          >
            <ArrowDownIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </section>
    </header>
  );
}