import { useState, useEffect } from 'react';
import { Server, Bot, FileText, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  onNavigate: (page: string) => void;
}

const WELCOME_SHOWN_KEY = 'longwhile_welcome_shown';

export default function WelcomeModal({ onNavigate }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 첫 방문 여부 확인
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) {
      // 약간의 지연 후 모달 표시 (페이지 로드 후)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
  };

  const handleStart = () => {
    handleClose();
    // 홈 화면의 서비스 카드 섹션으로 스크롤
    setTimeout(() => {
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        // fallback: 히어로 섹션 높이만큼 스크롤
        window.scrollTo({ top: window.innerHeight - 64, behavior: 'smooth' });
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 - 클릭해도 닫히지 않음 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* 헤더 */}
        <div className="bg-gradient-to-br from-[#ff7b00] to-[#ff9d4d] p-6 text-white rounded-t-xl">
          <h2 className="text-[22px] font-bold mb-1">
            한참 커미션에 오신 것을 환영합니다!
          </h2>
          <p className="text-white/90 text-[13px]">
            마스토돈 서버 설치와 자동봇을 한번에 신청할 수 있어요.
          </p>
        </div>

        {/* 컨텐츠 */}
        <div className="p-5">
          {/* 진행 단계 */}
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-[#ff7b00] rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[14px] mb-0.5 flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#ff7b00]" />
                  서비스 살펴보기
                </h3>
                <p className="text-[12px] text-foreground/60">
                  서버 설치, 테마 커스텀, 자동봇 등 원하는 서비스를 확인해요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-[#ff7b00] rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[14px] mb-0.5 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-[#ff7b00]" />
                  원하는 옵션 견적에 담기
                </h3>
                <p className="text-[12px] text-foreground/60">
                  필요한 옵션을 견적에 담아 예상 비용을 확인해요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-[#ff7b00] rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[14px] mb-0.5 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#ff7b00]" />
                  신청서 작성하기
                </h3>
                <p className="text-[12px] text-foreground/60">
                  신청서를 작성하고 크레페를 통해 제출 및 신청해요.
                </p>
              </div>
            </div>
          </div>

          {/* 혜택 배지 */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[11px] rounded-full border border-orange-200">
              3개월 무료 서버비
            </span>
            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[11px] rounded-full border border-orange-200">
              무료 유지보수
            </span>
            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[11px] rounded-full border border-orange-200">
              일대일 맞춤 개발
            </span>
          </div>

          {/* CTA 버튼 - 하나만 */}
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 bg-[#ff7b00] text-white px-5 py-3 rounded-lg font-medium text-[14px] hover:bg-[#e66d00] transition-colors"
          >
            서비스 살펴보기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
