import { useEstimate } from '@/app/contexts/EstimateContext';
import { Trash2 } from 'lucide-react';

interface EstimatePageProps {
  onBack: () => void;
}

// 설명에서 [대괄호] 안의 명령어만 추출하는 함수
function extractCommands(description: string): string {
  const regex = /\[([^\]]+)\]/g;
  const matches = description.match(regex);
  if (!matches || matches.length === 0) {
    return description; // 대괄호가 없으면 원본 반환
  }
  return matches.join(', ');
}

export default function EstimatePage({ onBack }: EstimatePageProps) {
  const { items, removeItem, clearItems, getTotalPrice } = useEstimate();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-16">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="mb-16 flex items-center gap-3 text-[14px] hover:text-[#ff7b00] transition-colors text-foreground/60"
        >
          <span className="text-[18px]">←</span>
          메인으로 돌아가기
        </button>

        {/* 타이틀 */}
        <div className="mb-16">
          <div className="pb-2 mb-8">
            <h1 className="text-[48px] leading-[0.95] tracking-[-0.03em] font-bold text-[#ff7b00]">
              내 견적 확인하기
            </h1>
          </div>
          <div>
            <span className="text-[20px] font-mono">
              총 {items.length}개 항목
            </span>
          </div>
        </div>

        {/* 견적 내용 */}
        {items.length === 0 ? (
          <div className="py-32 text-center">
            <h2 className="text-[24px] mb-4 text-foreground/40">
              견적에 담긴 항목이 없습니다
            </h2>
            <p className="text-[16px] text-foreground/60 mb-8">
              서버 설치 커미션 또는 자동봇 커미션 페이지에서<br />
              원하시는 옵션을 선택해주세요.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.hash = '#server'}
                className="w-[200px] h-[60px] border-2 border-black/20 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px]"
              >
                서버 설치 커미션
              </button>
              <button
                onClick={() => window.location.hash = '#bot'}
                className="w-[200px] h-[60px] border-2 border-black/20 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px]"
              >
                자동봇 커미션
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 항목 리스트 */}
            <section className="mb-16">
              <div className="mb-12 border-b-2 border-black pb-4">
                <h2 className="text-[32px] tracking-[-0.01em]">선택한 항목</h2>
              </div>

              <div className="space-y-0 border-t border-black/10">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-b border-black/10 p-5 hover:bg-black/[0.01] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 mb-4">
                          <h3 className="text-[17px] text-black font-semibold break-words">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-[14px] leading-[1.6] text-foreground/60 break-words">
                              {extractCommands(item.description)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[17px] font-mono text-[#ff7b00] shrink-0">
                            ₩{item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-10 h-10 rounded-full bg-[#ff7b00] hover:bg-[#ff7b00]/80 text-white flex items-center justify-center transition-all shrink-0"
                            aria-label="삭제"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 총액 */}
            <section className="mb-16">
              <div className="border-2 border-[#ff7b00] bg-[#fff5eb] p-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[24px]">총 견적 금액</span>
                  <span className="text-[36px] font-mono text-[#ff7b00]">
                    ₩{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <p className="text-[15px] text-foreground/70">
                  • 최종 견적은 작업 난이도와 일정에 따라 달라질 수 있습니다.<br />
                  • 정확한 견적은 신청서 제출 후 확인해드립니다.
                </p>
              </div>
            </section>

            {/* 안내사항 */}
            <section className="mb-16">
              <div className="bg-black/[0.02] border-2 border-black/10 p-8">
                <h3 className="text-[18px] mb-4">
                  안내사항
                </h3>
                <ul className="space-y-2 text-[15px] leading-[1.8] text-foreground/70">
                  <li className="flex gap-3">
                    <span className="text-[#ff7b00]">•</span>
                    <span>자동봇 구동비는 일주일에 5천원이며, 테스트 기간을 제외한 구동 기간을 주 단위로 반올림하여 청구합니다.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ff7b00]">•</span>
                    <span>빠른 마감이 필요한 경우 추가금이 발생할 수 있습니다.</span>
                  </li>
                </ul>
              </div>
            </section>

          </>
        )}
      </div>
    </div>
  );
}