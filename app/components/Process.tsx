export default function Process() {
  const steps = [
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
        "원하시는 추가 기능이 있다면 이때 꼭! 말씀해주셔야 합니다! 이 시기 이후에 추가로 말씀하시는 경우 마감기한이 조정될 수 있습니다."
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
      <div className="mb-16 border-b-2 border-black pb-4">
        <h2 className="text-[32px] tracking-[-0.01em] font-semibold">
          커미션 진행 순서
        </h2>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-6">
            <div className="text-[12px] font-mono text-[#ff7b00] shrink-0 mt-1">
              {step.number}
            </div>
            <div>
              <h3 className="text-[18px] mb-2">{step.title}</h3>
              {step.details && (
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="text-[16px] leading-[1.8] text-foreground/70 flex gap-3">
                      <span className="text-[#ff7b00] shrink-0">—</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}