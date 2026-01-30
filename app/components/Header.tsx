import { ArrowRightIcon, ArrowDownIcon } from '@/app/components/icons';
import { useEstimate } from '@/app/contexts/EstimateContext';

// Hero 섹션만 담당하는 컴포넌트
export default function Header() {
  const { items } = useEstimate();

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
            
            {/* 신뢰 배지 추가 */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
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
            
            {/* CTA 버튼 - 견적 유무에 따라 동적 변경 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {items.length > 0 ? (
                <>
                  <a 
                    href="#estimate"
                    className="inline-flex items-center gap-2 bg-white text-[var(--brand-primary)] px-8 py-4 rounded-full font-semibold text-[16px] md:text-[18px] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    견적 확인하기 ({items.length}개)
                    <ArrowRightIcon className="w-5 h-5" />
                  </a>
                  <a 
                    href="#order"
                    className="inline-flex items-center gap-2 text-white/90 hover:text-white text-[14px] md:text-[16px] underline underline-offset-4 transition-colors"
                  >
                    바로 신청서 작성
                  </a>
                </>
              ) : (
                <>
                  <a 
                    href="#server"
                    className="inline-flex items-center gap-2 bg-white text-[var(--brand-primary)] px-8 py-4 rounded-full font-semibold text-[16px] md:text-[18px] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    서비스 살펴보기
                    <ArrowRightIcon className="w-5 h-5" />
                  </a>
                  <a 
                    href="#order"
                    className="inline-flex items-center gap-2 text-white/90 hover:text-white text-[14px] md:text-[16px] underline underline-offset-4 transition-colors"
                  >
                    바로 신청서 작성
                  </a>
                </>
              )}
            </div>
          </div>

          {/* 스크롤 힌트 */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ArrowDownIcon className="w-6 h-6 mx-auto text-white/60" />
          </div>
        </div>
      </section>
    </header>
  );
}