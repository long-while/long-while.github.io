import { useState } from 'react';
import { ArrowRightIcon, ChevronDownIcon } from '@/app/components/icons';

export default function Process() {
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);

  // 간소화된 3단계 요약
  const simpleSteps = [
    { 
      number: "01", 
      title: "서비스 선택 & 신청서 작성", 
      description: "원하는 옵션을 견적에 담고, 온라인 신청서를 작성해주세요.",
      icon: "📝"
    },
    { 
      number: "02", 
      title: "조율 & 견적서 확인", 
      description: "마감일, 추가 요청사항을 조율하고 최종 견적서를 확인합니다.",
      icon: "💬"
    },
    { 
      number: "03", 
      title: "결제 & 작업 진행", 
      description: "작업 일자가 가까워지면 결제 요청을 보내드리고, 완료 후 전달드립니다.",
      icon: "🚀"
    },
  ];

  // 상세 단계 (펼쳤을 때 표시)
  const detailedSteps = [
    {
      number: "01",
      title: "신청서 작성",
      details: [
        "테마 신청 시 필요한 이미지 소스 목록과 안내는 신청서 접수 후에 전달드립니다.",
        "이미지 소스는 서버 설치 마감일 1주~2주 전까지 전달해주시면 됩니다. 신청 시점에 준비할 필요 X",
        "서버 설치 이후에도 테마 추가 가능합니다."
      ]
    },
    {
      number: "02",
      title: "조율 진행",
      details: [
        "원하는 마감일, 견적, 주의사항을 확인 및 전달합니다.",
        "타입 외 기능 구현을 원하실 경우 가격과 구현 방식을 상담합니다.",
        "원하시는 추가 기능이 있다면 이때 꼭! 말씀해주셔야 합니다!"
      ]
    },
    {
      number: "03",
      title: "견적서 전달"
    },
    {
      number: "04",
      title: "작업 일자가 가까워지면 결제 요청"
    },
    {
      number: "05",
      title: "개발"
    },
    {
      number: "06",
      title: "자동봇 가동 테스트"
    },
    {
      number: "07",
      title: "크레페 내 작업 완료, 최종 작업물 전달"
    },
    {
      number: "08",
      title: "실 사용 기간 중 유지보수",
      details: [
        "이 시기의 소통은 오픈채팅으로 진행합니다."
      ]
    }
  ];

  return (
    <section className="py-15">
      <div className="mb-16 border-b border-border pb-4">
        <h2 className="text-[32px] tracking-[-0.01em] font-semibold">
          커미션 진행 순서
        </h2>
      </div>

      {/* 간소화된 3단계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {simpleSteps.map((step, index) => (
          <div 
            key={index} 
            className="relative p-6 border border-border bg-white shadow-sm"
          >
            {/* 연결선 (마지막 아이템 제외, 데스크톱에서만) */}
            {index < simpleSteps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-black/20" />
            )}
            
            <div className="text-[32px] mb-4">{step.icon}</div>
            <div className="text-[12px] font-mono text-[var(--brand-primary)] mb-2">
              STEP {step.number}
            </div>
            <h3 className="text-[17px] font-semibold mb-2">{step.title}</h3>
            <p className="text-[14px] leading-[1.7] text-foreground/70">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* 신청서 작성 CTA */}
      <div className="text-center mb-10">
        <a 
          href="#order"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--brand-primary)] text-white rounded-full font-semibold text-[16px] shadow-sm hover:shadow-md hover:brightness-95 active:scale-[0.98] transition-all"
        >
          신청서 작성하기
          <ArrowRightIcon className="w-5 h-5" />
        </a>
      </div>

      {/* 상세 진행 과정 토글 */}
      <div className="border border-border overflow-hidden">
        <button
          onClick={() => setShowDetailedSteps(!showDetailedSteps)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
        >
          <span className="text-[16px] font-medium">
            자세한 진행 과정 보기 (8단계)
          </span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${showDetailedSteps ? 'rotate-180' : ''}`} />
        </button>
        
        <div 
          className={`border-t border-border transition-all duration-300 ease-in-out ${
            showDetailedSteps ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="px-6 py-6 space-y-6">
            {detailedSteps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="text-[12px] font-mono text-[var(--brand-primary)] shrink-0 mt-1">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-[17px] font-medium mb-2">{step.title}</h3>
                  {step.details && (
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-[15px] leading-[1.7] text-foreground/70 flex gap-3">
                          <span className="text-[var(--brand-primary)] shrink-0">—</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}