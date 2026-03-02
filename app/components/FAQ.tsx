import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  
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
    },
    {
      question: "서버에 렉이 걸려요. 왜 그런 건가요?",
      answer: "서버 비용과 성능은 비례합니다. 쉽게 말하면 원룸이랑 같아요. 월세 30만원짜리 5평 원룸에 5명이 사는 건 괜찮은데, 25명이 들어오면 움직이기 힘들잖아요. 서버도 똑같습니다. 저렴한 서버에 사람이 몰리면 느려질 수밖에 없어요. 20인 이상의 커뮤인데 스토리 진행 중에도 완전히 렉이 없는 서버를 원하시면 월 10만원 이상 나오게 됩니다. 비용을 줄였을 때 렉이 생기는 건 어쩔 수 없는 부분입니다."
    },
    {
      question: "기본 세팅 서버 사양은 어떻게 되나요?",
      answer: "GCP 설치 시, 기본 사양은 20~30인이 스토리 진행 시간대에 접속했을 때 진행이 가능한 정도로 세팅해드립니다. (서버비 월 8만원, 무료체험 진행 시 첫 3달 서버비 무료) 장기 서버를 위해 Vultr로 설치 시, 별도의 요청이 없었다면 5인이 스토리 진행 시간대에 접속했을 때 약간의 렉이 걸리더라도 진행 가능할 정도로 세팅해드립니다. (서버비 월 2~3만원)"
    },
    {
      question: "렉이 걸리면 어떻게 해야 하나요?",
      answer: "30인 이상, 3개월 이내의 커뮤니티이며 스토리 진행이 잦아서 렉이 걸리는 경우, 따로 문의하시면 서버 증설을 도와드립니다. 장기서버 유지를 위해 저렴한 서버를 선택하셨는데 렉이 발생하는 경우, 서버 예산을 올리시는 게 아니라면 제가 해드릴 수 있는 부분은 없습니다. 서버비는 곧 성능이기 때문에, 더 원활한 환경을 원하시면 서버 업그레이드를 고려해 주세요."
    }
  ];

  // 검색 필터링
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 검색어 하이라이트 함수
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  return (
    <section>
      <div className="mb-10 border-b border-border pb-4">
        <h2 className="text-[29px] tracking-[-0.01em] font-semibold">
          자주 묻는 질문
        </h2>
      </div>

      {/* 검색 입력란 */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="질문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7b00] focus:ring-2 focus:ring-[#ff7b00]/20 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-[13px] text-foreground/60">
            {filteredFaqs.length}개의 결과
          </p>
        )}
      </div>

      {/* FAQ 목록 */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-6">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="pb-6 border-b border-border last:border-0 last:pb-0">
              <div className="max-w-4xl flex items-baseline gap-6">
                <div className="text-[12px] font-mono leading-normal text-[#ff7b00] shrink-0">
                  {String(faqs.indexOf(faq) + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-[18px] mb-2">
                    {highlightText(faq.question, searchQuery)}
                  </h3>
                  <p className="text-[16px] leading-[1.8] text-foreground/70">
                    {highlightText(faq.answer, searchQuery)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-[16px] text-foreground/60 mb-2">
            "{searchQuery}"에 대한 검색 결과가 없습니다.
          </p>
          <p className="text-[14px] text-foreground/40">
            다른 키워드로 검색하거나{' '}
            <a 
              href="https://crepe.moe/@longwhile" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#ff7b00] hover:underline"
            >
              직접 문의
            </a>
            해 주세요.
          </p>
        </div>
      )}
    </section>
  );
}