export default function Terms() {
  const sections = [
    {
      title: "견적비",
      content: "복잡한 오마카세 봇은 신청 이전에 문의를 넣어주셔야 합니다. 문서를 간단히 살펴본 후 제가 일정에 따라 진행 가능할지, 불가능할지를 말씀드립니다. 가능한 경우, 간단한 견적을 안내드립니다. 이 견적을 받아보시고 신청을 확정하신다면 제가 상세한 기획서를 작성해 전달드리며, 기획서 수령 이후 커미션을 취소하시게 된다면 2만원의 견적비가 청구됩니다."
    },
    {
      title: "오류 유지보수",
      content: "커미션주는 다양한 사용 환경 및 경우의 수에 대응 가능한 자동봇을 구축하기 위해 최선을 다합니다. 다만, 실제 사용자의 행동 패턴은 매우 광범위하고 예측이 어렵기에, 개발 과정에서 예상치 못한 오류가 실제 가동 중 발생할 수 있음을 미리 알려드립니다. 오류 발생 시, 커미션주는 제보 시점으로부터 최대한 빠른 시일 내(통상 12시간에서 48시간 이내)에 문제를 해결하고자 노력합니다. 오류 문제를 미연에 방지하고자 본 커미션은 개장 전, 운영진이 출력 문구 및 미처 발견치 못한 오류를 파악할 수 있는 테스트 기간을 제공합니다. 운영진은 이 테스트 기간 동안 가능한 모든 경우의 수를 테스트해야 하며, 오류를 보고해주실 의무가 있습니다. 테스트 기간 이후 가동 중 발생하는 예측하지 못한 오류에도 커미션주는 신속하게 대응할 것입니다. 다만, 이는 서비스 제공을 위한 최선의 노력에 대한 부분이므로, 오류 해결에 시간이 소비된다고 해서 환불은 불가합니다."
    },
    {
      title: "질문",
      content: "무료 질문 전송 횟수는 \"첫 메시지~자동봇 세팅 완료 시점\"까지 최대 3회입니다. (하나의 메시지에 5가지 질문을 작성해서 전송할 시 1회로 간주) 그 후부터는 질문 한 개당 3천원의 추가금이 발생합니다. 질문하지 않으셔도, 코딩과 자동봇을 하나도 모르셔도 이해할 수 있는 정도의 상세한 안내를 제공합니다. 안내를 받아보신 후에도 질문이 발생한다면 그때 말씀해주세요."
    },
    {
      title: "테마 이미지",
      content: "신청자가 이미지 소스를 잘못 전달해서 or 변심해서 or 누락해서 등의 이유로 교체 요청 시 1회당 5천원 추가금이 발생합니다. (이미지 1장 당 1회가 아님. 서버 업데이트 횟수를 카운트합니다.) 반드시 신청 시 전달해드리는 추천 이미지 소스와 목록을 꼼꼼히 확인하시고 제가 여러 번 일하는 일이 없도록 협조해 주세요."
    },
    {
      title: "환불",
      content: "커뮤니티 개장이 취소되었다고 해서 작업이 완료된 커미션을 환불해드리지 않습니다. 만약 작업 중 취소되었을 경우 현재까지 작업한 금액을 청구합니다. (예: 테마 작업, 서버 설치 비용은 청구하되 자동봇 구동 일수에 따른 금액은 청구하지 않음) 그 외 환불은 커미션주가 개장일까지 커미션 작업을 마무리하지 못했을 경우에만 진행합니다."
    },
    {
      title: "빠른마감",
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
      <div className="mb-16 border-b-2 border-black pb-4">
        <h2 className="text-[32px] tracking-[-0.01em] font-semibold">
          약관 및 기타 안내
        </h2>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="pb-6 border-b border-black/10 last:border-0 last:pb-0">
            <div className="max-w-4xl">
              <div className="flex gap-6 mb-2">
                <div className="text-[12px] font-mono text-[#ff7b00] shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-[20px]">
                  {section.title}
                </h3>
              </div>
              <p className="text-[15px] leading-[1.9] text-foreground/70 pl-[calc(12px+1.5rem)]">
                {section.content}
              </p>
              
              {/* 빠른마감 섹션에만 예시 추가 */}
              {section.hasExamples && (
                <div className="mt-8 pl-[calc(12px+1.5rem)]">
                  <h4 className="text-[16px] mb-4 text-foreground/80">빠른마감 적용 예시</h4>
                  <div className="space-y-3">
                    {examples.map((example, exampleIndex) => (
                      <div
                        key={exampleIndex}
                        className={`border-2 p-5 ${
                          example.isPositive
                            ? 'border-black/10'
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
        ))}
      </div>
    </section>
  );
}