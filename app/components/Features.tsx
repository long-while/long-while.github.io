import { useState } from 'react';
import { ChevronDownIcon, WarningIcon } from '@/app/components/icons';

export default function Features() {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // 주의사항
  const warning = {
    title: "주의사항",
    description: "호환성 문제로 고급 인터페이스/커스텀 이모지를 지원하지 않습니다."
  };

  return (
    <section className="py-16">
      <div className="mb-10 border-b border-border pb-4">
        <h2 className="text-[29px] tracking-[-0.01em] font-semibold">한참 마스토돈만의 특징</h2>
      </div>

      {/* 핵심 특징 4개 - 카드 형태 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {highlightFeatures.map((feature, index) => (
          <div 
            key={index} 
            className="p-6 border border-border shadow-sm hover:border-[var(--brand-primary)] hover:shadow-md transition-all bg-white"
          >
            <div className="flex items-baseline gap-6">
              <div className="text-[12px] font-mono leading-normal text-[var(--brand-primary)] shrink-0">
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
      <div className="border border-border mb-10 overflow-hidden bg-white">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors min-h-[44px]"
        >
          <span className="text-[16px] font-medium">
            더 많은 특징 보기 ({moreFeatures.length}개)
          </span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div 
          className={`border-t border-border transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="px-6 py-6 space-y-6">
            {moreFeatures.map((feature, index) => (
              <div key={index} className="flex items-baseline gap-6">
                <div className="text-[12px] font-mono leading-normal text-[var(--brand-primary)] shrink-0">
                  {String(index + 5).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold mb-1">{feature.title}</h3>
                  <p className="text-[15px] leading-[1.7] text-foreground/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="p-6 border border-amber-500/50 bg-[#fff1e3]">
        <div className="flex items-center gap-4">
          <WarningIcon className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h3 className="text-[17px] font-semibold mb-2 text-amber-800">{warning.title}</h3>
            <p className="text-[15px] leading-[1.7] text-amber-700">
              {warning.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
