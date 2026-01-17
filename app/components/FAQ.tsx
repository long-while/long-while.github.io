export default function FAQ() {
  const faqs = [
    {
      question: "신청서는 언제 접수해야 하나요?",
      answer: "아무때나 접수해주시면 됩니다! 1년 후에 진행해야 하는 작업건이어도 신청서 내용이 준비되는 대로 보내주세요! 마감일 확인 후 결제 요청을 보내드릴 날짜를 말씀드리고, 적절한 일정에 맞추어 진행합니다. 결제 요청은 주로 마감일 3~7일 전으로 설정해두고 있어요."
    },
    {
      question: "신청 시점에 테마 이미지를 준비해야 할까요?",
      answer: "아니요. 로고 변경 또는 테마 작업에 필요한 이미지 소스 목록은 신청서 접수 후에 전달드리며, 테마는 서버 설치 이후에도 추가 가능합니다."
    },
    {
      question: "디자인 커미션을 넣을 건데 마감일은 언제로 할까요?",
      answer: "서버 커미션 넣어주시면 제가 이미지 전달 마감일도 지정해서 보내드립니다."
    },
    {
      question: "테마 작업을 위해서는 어떤 이미지를 준비해야 하나요? / 규격은 어떻게 되나요?",
      answer: "필요한 이미지 목록은 신청서를 접수 후에 전달드립니다! 자세하고 상세하게 안내드리겠습니다."
    },
    {
      question: "자동봇/서버 사용이 어렵지는 않을까요?",
      answer: "세팅해 드리는 자동봇 시트에 상세한 안내가 적혀 있습니다. 서버에 추가한 기능 또한 서버를 설치해드리며 안내해드리고 있어요."
    },
    {
      question: "장기 소규모 서버를 유지하고 싶어요. 서버비는 어떻게 되나요?",
      answer: "규모에 따라 월 1~2만원 정도를 생각해 주세요. 마스토돈은 중국집입니다. 중국집을 운영하기 위해서는 건물주에게 자리를 임대해야 하죠. 손님을 받을 곳이 필요하니까요. 우리는 건물주(업체)에게 임대료(서버비)를 지불하고 24시간 사용 가능한 방(서버 컴퓨터)을 한 자리 빌릴 겁니다. 보통은 3개월 무료 방을 주는 GCP라는 건물주에게 방을 한 자리 빌리는데, 장기커는 무료 이벤트는 없어도 대신 매달 임대료가 싼 곳을 쓰는 거죠."
    },
    {
      question: "중국집을 매달, 30일, 24시간 사용하지 않는데도 이만큼의 돈을 내야 해요?",
      answer: "네, 우리는 항상 한달분의 임대료를 내야 해요. 운영시간이 아닐 때도 계속 방을 빌리고 있는 건 마찬가지니까요."
    },
    {
      question: "그럼 서버비는 커미션주님께 내면 되나요?",
      answer: "저는 인테리어/시공 업체입니다. 제가 받는 건 시공료뿐이며, 임대료(서버비)는 제가 아니라 건물주에게 직접 결제하시게 됩니다."
    },
    {
      question: "masto.host로 설치해주실 수 있나요?",
      answer: "불가합니다. masto.host는 순정 마스토돈 설치만 지원합니다. 만약 장기 커뮤라서 GCP 서버비가 부담되신다면 가상 컴퓨터를 대여해주는 타 업체를 이용해 설치해드리게 됩니다. 위 답변 참고."
    },
    {
      question: "자동봇의 출력을 제가 직접 지정할 수 있나요?",
      answer: "커스텀 명령어가 아니라 시스템 봇이 처리하는 명령어인 경우, 사전 지정은 어렵습니다. 다만 테스트 기간 중 출력되는 문구를 확인하시고 '이 문구를 이런 식으로 변경해주실 수 있나요?' 식으로 예시 출력을 제공해주시면 최대한 반영하겠습니다."
    }
  ];

  return (
    <section className="py-15">
      <div className="mb-16 border-b-2 border-black pb-4">
        <h2 className="text-[32px] tracking-[-0.01em] font-semibold">
          자주 묻는 질문
        </h2>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="pb-6 border-b border-black/10 last:border-0 last:pb-0">
            <div className="max-w-4xl">
              <div className="flex gap-6 mb-2">
                <div className="text-[12px] font-mono text-[#ff7b00] shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-[18px]">
                  {faq.question}
                </h3>
              </div>
              <p className="text-[16px] leading-[1.8] text-foreground/70 pl-[calc(12px+1.5rem)]">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}