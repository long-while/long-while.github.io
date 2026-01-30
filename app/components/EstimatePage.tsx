import { useEstimate } from '@/app/contexts/EstimateContext';
import { Trash2, Server, Bot } from 'lucide-react';
import { ArrowRightIcon } from '@/app/components/icons';
import type { NavigateFunction } from '@/app/types/navigation';
import type { EstimateItem } from '@/app/contexts/EstimateContext';

interface EstimatePageProps {
  onBack: () => void;
  onNavigate: NavigateFunction;
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

// 카테고리별 아이템 그룹핑
function groupItemsByCategory(items: EstimateItem[]) {
  const serverItems = items.filter(item => item.category === 'server');
  const botItems = items.filter(item => item.category === 'bot');
  const otherItems = items.filter(item => item.category !== 'server' && item.category !== 'bot');
  return { serverItems, botItems, otherItems };
}

// 카테고리별 소계 계산
function calculateSubtotal(items: EstimateItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export default function EstimatePage({ onBack, onNavigate }: EstimatePageProps) {
  const { items, removeItem, getTotalPrice, proceedToOrder } = useEstimate();

  const handleProceedToOrder = () => {
    proceedToOrder(); // 동기화 상태 저장
    onNavigate('order');
  };

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
          <div className="py-24 text-center">
            {/* 빈 상태 일러스트 */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#fff5eb] flex items-center justify-center">
                <svg className="w-12 h-12 text-[#ff7b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-[24px] mb-4 text-foreground/70 font-medium">
              견적에 담긴 항목이 없습니다
            </h2>
            <p className="text-[16px] text-foreground/60 mb-8 leading-relaxed">
              서버 설치 커미션 또는 자동봇 커미션 페이지에서<br />
              원하시는 옵션을 선택해주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('server')}
                className="min-h-[60px] px-8 py-4 border-2 border-black/20 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px] rounded-lg flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
              >
                <Server className="w-5 h-5" />
                서버 설치 커미션
              </button>
              <button
                onClick={() => onNavigate('bot')}
                className="min-h-[60px] px-8 py-4 border-2 border-black/20 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px] rounded-lg flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
              >
                <Bot className="w-5 h-5" />
                자동봇 커미션
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 항목 리스트 - 카테고리별 그룹핑 */}
            <section className="mb-16">
              <div className="mb-12 border-b-2 border-black pb-4">
                <h2 className="text-[32px] tracking-[-0.01em]">선택한 항목</h2>
              </div>

              {(() => {
                const { serverItems, botItems, otherItems } = groupItemsByCategory(items);
                
                return (
                  <div className="space-y-8">
                    {/* 서버 설치 옵션 */}
                    {serverItems.length > 0 && (
                      <div className="border-2 border-black/10 rounded-lg overflow-hidden">
                        <div className="bg-black/[0.02] px-5 py-4 border-b border-black/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Server className="w-5 h-5 text-[#ff7b00]" />
                            <h3 className="text-[18px] font-semibold">서버 설치</h3>
                          </div>
                          <span className="text-[15px] font-mono text-foreground/60">
                            소계: ₩{calculateSubtotal(serverItems).toLocaleString()}
                          </span>
                        </div>
                        <div className="divide-y divide-black/10">
                          {serverItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-5 hover:bg-black/[0.01] transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col gap-2 mb-4">
                                    <h4 className="text-[16px] text-black font-medium break-words">
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p className="text-[14px] leading-[1.6] text-foreground/60 break-words">
                                        {extractCommands(item.description)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[16px] font-mono text-[#ff7b00] shrink-0">
                                      {item.price === 0 ? '협의' : `₩${item.price.toLocaleString()}`}
                                    </span>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-[#ff7b00] hover:bg-[#ff7b00]/80 text-white flex items-center justify-center transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                                      aria-label={`${item.name} 삭제`}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 자동봇 옵션 */}
                    {botItems.length > 0 && (
                      <div className="border-2 border-black/10 rounded-lg overflow-hidden">
                        <div className="bg-black/[0.02] px-5 py-4 border-b border-black/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5 text-[#ff7b00]" />
                            <h3 className="text-[18px] font-semibold">자동봇</h3>
                          </div>
                          <span className="text-[15px] font-mono text-foreground/60">
                            소계: ₩{calculateSubtotal(botItems).toLocaleString()}
                          </span>
                        </div>
                        <div className="divide-y divide-black/10">
                          {botItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-5 hover:bg-black/[0.01] transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col gap-2 mb-4">
                                    <h4 className="text-[16px] text-black font-medium break-words">
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p className="text-[14px] leading-[1.6] text-foreground/60 break-words">
                                        {extractCommands(item.description)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[16px] font-mono text-[#ff7b00] shrink-0">
                                      {item.price === 0 ? '협의' : `₩${item.price.toLocaleString()}`}
                                    </span>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-[#ff7b00] hover:bg-[#ff7b00]/80 text-white flex items-center justify-center transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                                      aria-label={`${item.name} 삭제`}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 기타 항목 */}
                    {otherItems.length > 0 && (
                      <div className="border-2 border-black/10 rounded-lg overflow-hidden">
                        <div className="bg-black/[0.02] px-5 py-4 border-b border-black/10 flex items-center justify-between">
                          <h3 className="text-[18px] font-semibold">기타</h3>
                          <span className="text-[15px] font-mono text-foreground/60">
                            소계: ₩{calculateSubtotal(otherItems).toLocaleString()}
                          </span>
                        </div>
                        <div className="divide-y divide-black/10">
                          {otherItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-5 hover:bg-black/[0.01] transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col gap-2 mb-4">
                                    <h4 className="text-[16px] text-black font-medium break-words">
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p className="text-[14px] leading-[1.6] text-foreground/60 break-words">
                                        {extractCommands(item.description)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[16px] font-mono text-[#ff7b00] shrink-0">
                                      {item.price === 0 ? '협의' : `₩${item.price.toLocaleString()}`}
                                    </span>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-[#ff7b00] hover:bg-[#ff7b00]/80 text-white flex items-center justify-center transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                                      aria-label={`${item.name} 삭제`}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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

            {/* 신청서 작성 CTA */}
            <section className="mb-16">
              <div className="text-center">
                <p className="text-[16px] text-foreground/70 mb-6">
                  견적 확인이 완료되셨나요? 이제 신청서를 작성해주세요!
                </p>
                <button
                  onClick={handleProceedToOrder}
                  className="inline-flex items-center gap-3 bg-[var(--brand-primary)] text-white px-10 py-5 rounded-full font-semibold text-[18px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                >
                  신청서 작성하기
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                <p className="text-[14px] text-foreground/50 mt-4">
                  견적 항목이 신청서에 자동으로 반영됩니다
                </p>
              </div>
            </section>

          </>
        )}
      </div>
    </div>
  );
}