import { useState } from 'react';
import { ArrowRightIcon, ArrowDownIcon, ChevronDownIcon, WarningIcon } from '@/app/components/icons';
import { useEstimate } from '@/app/contexts/EstimateContext';

export default function Header() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items } = useEstimate();

  // 핵심 특징 4개
  const highlightFeatures = [
    { title: "다중계정 로그인 & 계정 전환", description: "웹 마스토돈에서도 웹트처럼 여러 계정 간 원활한 전환 가능! 총괄계에서 NPC 계정으로의 빠른 전환을 지원합니다." },
    { title: "익숙한 UI", description: "트위터 기반 인터페이스로 마스토돈이 처음인 러너도 편히 사용 가능" },
    { title: "비공개 서버", description: "로그인하지 않은 사용자 / 서버에 가입하지 않은 사용자에게 툿이 노출되지 않음" },
    { title: "DM 관리기능", description: "운영계가 서버 내 모든 DM을 하나의 페이지에서 확인 가능 (계정 DM창과 별개 페이지)" },
  ];

  // 추가 특징 (접이식)
  const moreFeatures = [
    { title: "깔끔한 폰트", description: "코펍돋움 ttf 적용으로 PC 웹에서도 눈이 피로하지 않은 답멘" },
    { title: "바이오 표시", description: "팔로잉/팔로워 목록에서 바이오 확인 가능" },
    { title: "마크다운 기능", description: "별표와 물결표를 이용한 기울임꼴, 볼드, 취소선 적용" },
    { title: "알림창 분리", description: "알림창이 모든 알림/멘션/DM 3가지 탭으로 구성됨" },
    { title: "DM과 팔로워 공개 툿에도 답글 수 표시", description: "모든 유형의 툿에서 답글 수를 확인할 수 있습니다" },
    { title: "스크롤 오류 수정", description: "답멘을 위해 타래의 최하단 멘션 선택 시 스크롤이 맨 위로 올라가는 오류 해결" },
  ];

  // 주의사항 (분리)
  const warning = {
    title: "주의사항",
    description: "호환성 문제로 고급 인터페이스/커스텀 이모지를 지원하지 않습니다."
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
            <p className="text-[16px] md:text-[20px] text-white/90 leading-[1.6] max-w-[800px] mx-auto mb-8">
              마스토돈 자캐커뮤를 위한 최고의 커미션<br/>
              서버 설치부터 자동봇까지 한번에
            </p>
            
            {/* CTA 버튼 - 견적 유무에 따라 동적 변경 */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
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

      {/* 기존 컨텐츠 - 이제 max-width 적용 */}
      <div className="max-w-[1200px] mx-auto px-8 pt-20">
        {/* 공지 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">공지</h2>
          </div>

          <div className="max-w-4xl space-y-6">
            <p className="text-[17px] leading-[1.9]">
              전공생이 진행해드리는 코딩 커미션.
            </p>
            
            <p className="text-[17px] leading-[1.9]">
              마스토돈 서버 설치, 커스텀 테마, 다양한 자동봇 코딩을 진행합니다.
            </p>
            
            <p className="text-[17px] leading-[1.9] text-foreground/70">
              마스토돈 커뮤니티를 원활하게 진행하고 싶으신 운영러 분들을 위한 커미션입니다.<br />
              코딩을 하나도 모르시는 분들도 쉽게 도와드립니다.<br />
              3개월까지는 구글에서 제공하는 무료 크레딧을 사용해, 별도의 서버비 없이 서버를 운영할 수 있습니다.
            </p>
            
            <p className="text-[17px] leading-[1.9] text-foreground/70">
              무료 체험 기간 후에도 서버를 유지하실 경우, 지출하실 서버비는 매달 4만원입니다.<br />
              3개월 이상의 장기 커뮤니티 진행 시 별도로 문의해 주세요!
            </p>

            <div className="pt-6 space-y-4 border-t-2 border-black/10 mt-10">
              <p className="text-[17px] leading-[1.9] font-bold text-[var(--brand-primary)]">
                문의하시기 전에 최하단에 위치한 <span className="font-extrabold">자주 묻는 질문</span>을 확인해 주세요!
              </p>
              <p className="text-[17px] leading-[1.9] font-bold text-[var(--brand-primary)]">
                신청서는 아무때나 접수해주셔도 괜찮습니다! 결제 요청은 작업 일자가 가까워지면 보내드립니다 ^_^
              </p>
            </div>
          </div>
        </section>

        {/* 한참 에디션 특징 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">한참 마스토돈만의 특징</h2>
          </div>

          {/* 핵심 특징 4개 - 카드 형태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {highlightFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 border-2 border-black/10 hover:border-[var(--brand-primary)] transition-colors bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="text-[24px] font-mono text-[var(--brand-primary)] shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold mb-2">{feature.title}</h3>
                    <p className="text-[15px] leading-[1.7] text-foreground/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 더 많은 특징 (접이식) */}
          <div className="border-2 border-black/10 mb-10 overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
            >
              <span className="text-[16px] font-medium">
                더 많은 특징 보기 ({moreFeatures.length}개)
              </span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`border-t border-black/10 transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
              }`}
            >
              <div className="px-6 py-6 space-y-6">
                {moreFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="text-[12px] font-mono text-[var(--brand-primary)] shrink-0 mt-1">
                      {String(index + 5).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-medium mb-1">{feature.title}</h3>
                      <p className="text-[15px] leading-[1.7] text-foreground/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주의사항 (분리) */}
          <div className="p-6 border-2 border-amber-500/50 bg-amber-50">
            <div className="flex items-start gap-4">
              <WarningIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[17px] font-semibold mb-2 text-amber-800">{warning.title}</h3>
                <p className="text-[15px] leading-[1.7] text-amber-700">
                  {warning.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </header>
  );
}