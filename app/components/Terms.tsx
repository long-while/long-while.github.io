import type { MouseEvent } from 'react';

interface TermsSection {
  id: string;
  title: string;
  content: string;
  /** 추가금이 발생하는 조건 요약. 본문 위에 강조해서 먼저 보여준다 */
  fee?: string;
  hasExamples?: boolean;
}

export interface TermsProps {
  title?: string;
  /** 이용안내 페이지에서는 h1 으로 렌더한다 */
  headingLevel?: 'h1' | 'h2';
  /** 항목이 6개라 페이지로 볼 때는 상단 목차를 붙인다 */
  showToc?: boolean;
  /** 모달처럼 바깥에서 이미 제목을 보여주는 경우 false 로 끈다 */
  showTitle?: boolean;
}

export default function Terms({
  title = '약관 및 기타 안내',
  headingLevel: Heading = 'h2',
  showToc = false,
  showTitle = true,
}: TermsProps) {
  // 문서 제목이 h1 이면 각 항목은 h2, 섹션으로 얹힐 때는 h3 이 되도록 맞춘다
  const SectionHeading = Heading === 'h1' ? 'h2' : 'h3';
  // 항목 안의 예시 제목도 한 단계 아래로 — 레벨을 건너뛰지 않게 한다
  const ExampleHeading = Heading === 'h1' ? 'h3' : 'h4';

  /**
   * 목차 이동은 주소의 해시를 바꾸지 않고 스크롤만 한다.
   * 신청서 안에서 모달로 띄웠을 때 `/order/#estimate-fee` 처럼 주소가 바뀌는 걸 막기 위함.
   * href 는 그대로 두어 링크 복사·키보드 사용에는 영향이 없다.
   */
  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // 새 탭으로 여는 조작은 브라우저에 맡긴다
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    const id = event.currentTarget.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections: TermsSection[] = [
    {
      title: "견적비",
      id: "estimate-fee",
      fee: "기획서 수령 후 취소 시 2만원",
      content: "복잡한 오마카세 봇은 신청 이전에 문의를 넣어주셔야 합니다. 문서를 간단히 살펴본 후 제가 일정에 따라 진행 가능할지, 불가능할지를 말씀드립니다. 가능한 경우, 간단한 견적을 안내드립니다. 이 견적을 받아보시고 신청을 확정하신다면 제가 상세한 기획서를 작성해 전달드리며, 기획서 수령 이후 커미션을 취소하시게 된다면 2만원의 견적비가 청구됩니다."
    },
    {
      title: "오류 유지보수",
      id: "maintenance",
      content: "커미션주는 다양한 사용 환경 및 경우의 수에 대응 가능한 자동봇을 구축하기 위해 최선을 다합니다. 다만, 실제 사용자의 행동 패턴은 매우 광범위하고 예측이 어렵기에, 개발 과정에서 예상치 못한 오류가 실제 가동 중 발생할 수 있음을 미리 알려드립니다. 오류 발생 시, 커미션주는 제보 시점으로부터 최대한 빠른 시일 내(통상 12시간에서 48시간 이내)에 문제를 해결하고자 노력합니다. 오류 문제를 미연에 방지하고자 본 커미션은 개장 전, 운영진이 출력 문구 및 미처 발견치 못한 오류를 파악할 수 있는 테스트 기간을 제공합니다. 운영진은 이 테스트 기간 동안 가능한 모든 경우의 수를 테스트해야 하며, 오류를 보고해주실 의무가 있습니다. 테스트 기간 이후 가동 중 발생하는 예측하지 못한 오류에도 커미션주는 신속하게 대응할 것입니다. 다만, 이는 서비스 제공을 위한 최선의 노력에 대한 부분이므로, 오류 해결에 시간이 소비된다고 해서 환불은 불가합니다."
    },
    {
      title: "질문",
      id: "questions",
      fee: "무료 3회 초과 시 질문 1개당 3천원",
      content: "무료 질문 전송 횟수는 \"첫 메시지~자동봇 세팅 완료 시점\"까지 최대 3회입니다. (하나의 메시지에 5가지 질문을 작성해서 전송할 시 1회로 간주) 그 후부터는 질문 한 개당 3천원의 추가금이 발생합니다. 질문하지 않으셔도, 코딩과 자동봇을 하나도 모르셔도 이해할 수 있는 정도의 상세한 안내를 제공합니다. 안내를 받아보신 후에도 질문이 발생한다면 그때 말씀해주세요."
    },
    {
      title: "테마 이미지",
      id: "theme-image",
      fee: "이미지 교체 1회당 5천원",
      content: "신청자가 이미지 소스를 잘못 전달해서 or 변심해서 or 누락해서 등의 이유로 교체 요청 시 1회당 5천원 추가금이 발생합니다. (이미지 1장 당 1회가 아님. 서버 업데이트 횟수를 카운트합니다.) 반드시 신청 시 전달해드리는 추천 이미지 소스와 목록을 꼼꼼히 확인하시고 제가 여러 번 일하는 일이 없도록 협조해 주세요."
    },
    {
      title: "환불",
      id: "refund",
      content: "커뮤니티 개장이 취소되었다고 해서 작업이 완료된 커미션을 환불해드리지 않습니다. 만약 작업 중 취소되었을 경우 현재까지 작업한 금액을 청구합니다. (예: 테마 작업, 서버 설치 비용은 청구하되 자동봇 구동 일수에 따른 금액은 청구하지 않음) 그 외 환불은 커미션주가 개장일까지 커미션 작업을 마무리하지 못했을 경우에만 진행합니다."
    },
    {
      title: "빠른마감",
      id: "fast-deadline",
      fee: "커스텀 없음 24시간 내 1만원 · 로고 48시간 내 1.5만원 · 테마 48시간 내 2만원",
      content: "서버 설치 커미션은 아무 커스텀 없는 서버를 신청서 접수 시각으로부터 24시간 내에 설치해야 하는 경우, 1만원의 추가금이 발생합니다. 로고 커스텀이 포함된 서버를 이미지 전달 시점으로부터 48시간 내에 설치해야 하는 경우, 1.5만원의 추가금이 발생합니다. (로고 변경가 5천원과 별개의 추가금입니다.) 테마 전체 커스텀이 포함된 서버를 이미지 전달 시점으로부터 48시간 내에 설치해야 하는 경우, 2만원의 추가금이 발생합니다. (테마 커스텀 금액 3만원과 별개의 추가금입니다. 커스텀을 1종만 하셔도 동일하게 2만원의 추가금이 발생합니다.) 커미션주 또한 일정을 관리해야 하는데, 급한 작업일 경우 현생을 제쳐두고 작업에 착수해야 합니다. 당연하지만 이미지 전달 마감일을 준수해주신 경우, 언제 설치하든 추가금이 발생하지 않습니다!",
      hasExamples: true
    }
  ];

  const examples = [
    {
      case: "커미션주가 \"이미지를 17일에 주시면 제가 18일중에 테마까지 해서 설치해 드릴게요\" 라고 해서 이미지를 17일에 주셨다면",
      result: "추가금 X",
      isPositive: true
    },
    {
      case: "커미션주가 \"이미지를 17일에 주시면 제가 21일중에 테마까지 해서 설치해 드릴게요\"라고 했는데, 이미지를 연락 없이 미루다가 20일에 주셨다면",
      result: "추가금 O",
      isPositive: false
    }
  ];

  return (
    <section className="py-15">
      {showTitle && (
        <div className="mb-16 border-b border-border pb-4">
          <Heading className="text-[29px] tracking-[-0.01em] font-semibold">
            {title}
          </Heading>
        </div>
      )}

      {showToc && (
        <nav aria-label="이용안내 목차" className="mb-12 border border-border bg-black/[0.02] p-6">
          <p className="text-[12px] font-mono text-foreground/50 uppercase tracking-widest mb-4">목차</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {sections.map((section, index) => (
              <li key={section.id} className="flex items-baseline gap-3">
                <span className="text-[12px] font-mono text-[#ff7b00] shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <a
                  href={`#${section.id}`}
                  onClick={handleTocClick}
                  className="text-[15px] hover:text-[#ff7b00] hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                >
                  {section.title}
                </a>
                {section.fee && (
                  <span className="text-[11px] text-[#cc5500] shrink-0">추가금</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} id={section.id} className="pb-6 border-b border-border last:border-0 last:pb-0 scroll-mt-24">
            <div className="max-w-4xl flex items-baseline gap-6">
              <div className="text-[12px] font-mono leading-normal text-[#ff7b00] shrink-0">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <SectionHeading className="text-[20px] mb-2">
                  {section.title}
                </SectionHeading>

                {/* 추가금이 발생하는 조건은 본문보다 먼저 눈에 띄어야 한다 */}
                {section.fee && (
                  <p className="mb-3 inline-flex items-start gap-2 border border-[#ff7b00]/40 bg-[#fff5eb] px-3 py-2 text-[13px] leading-[1.6] text-[#cc5500]">
                    <span className="font-semibold shrink-0">추가금</span>
                    <span>{section.fee}</span>
                  </p>
                )}

                <p className="text-[15px] leading-[1.9] text-foreground/70">
                  {section.content}
                </p>

                {/* 빠른마감 섹션에만 예시 추가 */}
                {section.hasExamples && (
                  <div className="mt-8">
                  <ExampleHeading className="text-[16px] mb-4 text-foreground/80">빠른마감 적용 예시</ExampleHeading>
                  <div className="space-y-3">
                    {examples.map((example, exampleIndex) => (
                      <div
                        key={exampleIndex}
                        className={`border p-5 ${
                          example.isPositive
                            ? 'border-border'
                            : 'border-[#ff7b00]/30 bg-[#fff5eb]'
                        }`}
                      >
                        <p className="text-[14px] leading-[1.8] mb-2">{example.case}</p>
                        <div className={`text-[13px] font-mono flex items-center gap-2 ${
                          example.isPositive ? 'text-foreground/60' : 'text-[#ff7b00]'
                        }`}>
                          <span>→</span>
                          <span>{example.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}