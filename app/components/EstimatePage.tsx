import { useCallback, useEffect } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { Trash2, Server, Bot, Lock, Pencil, X } from 'lucide-react';
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
    return description;
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

/** 삭제 알림이 저절로 사라지기까지의 시간 */
const UNDO_TIMEOUT_MS = 8000;

/** 삭제 직후 뜨는 되돌리기 알림 */
function UndoToast({ itemId, name, onUndo, onDismiss }: {
  itemId: string;
  name: string;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
    // 삭제 건마다 타이머를 새로 시작한다 (이름은 중복될 수 있어 id 를 쓴다)
  }, [itemId, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-4 bg-black text-white rounded-lg shadow-lg max-w-[calc(100vw-32px)]"
    >
      <span className="text-[14px] break-keep">
        '{name}'을(를) 삭제했습니다.
      </span>
      <button
        onClick={onUndo}
        className="text-[14px] font-semibold text-[#ffab5e] hover:text-[#ffc890] underline shrink-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded"
      >
        실행 취소
      </button>
      <button
        onClick={onDismiss}
        className="p-1 text-white/50 hover:text-white shrink-0 rounded focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        aria-label="알림 닫기"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// 아이템 행 컴포넌트
function ItemRow({ item, onRemove, onEdit }: {
  item: EstimateItem;
  onRemove: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-black/[0.01] transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] text-black font-semibold break-words">
          {item.name}
          {item.locked && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle px-2 py-0.5 bg-[#fff5eb] text-[#ff7b00] text-[11px] font-medium rounded-full">
              <Lock size={10} aria-hidden />
              필수 포함
            </span>
          )}
        </h4>
        {item.description && (
          <p className="text-[13px] leading-[1.6] text-foreground/50 break-words mt-0.5">
            {extractCommands(item.description)}
          </p>
        )}
      </div>
      <span className="text-[15px] font-mono leading-normal text-[#ff7b00] shrink-0">
        {item.price === 0 ? '협의' : `₩${item.price.toLocaleString()}`}
      </span>
      {item.locked ? (
        <span
          className="p-1.5 text-foreground/25 shrink-0"
          title="서버 설치에 자동으로 포함되는 항목이라 삭제하실 수 없어요."
        >
          <Lock size={16} aria-hidden />
          <span className="sr-only">{item.name}은(는) 삭제할 수 없는 필수 항목입니다</span>
        </span>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-foreground/30 hover:text-[#ff7b00] transition-colors rounded focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
            aria-label={`${item.name} 수정하러 가기`}
            title="상품 페이지에서 이 항목을 다시 고릅니다"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-foreground/30 hover:text-red-500 transition-colors rounded focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
            aria-label={`${item.name} 삭제`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function EstimatePage({ onBack, onNavigate }: EstimatePageProps) {
  const {
    items,
    removeItem,
    getTotalPrice,
    proceedToOrder,
    lastRemoved,
    undoRemove,
    dismissLastRemoved,
    setEditTargetName,
  } = useEstimate();

  // 견적함을 떠나면 삭제 알림도 함께 정리한다 (다음에 들어왔을 때 묵은 알림이 뜨지 않도록)
  useEffect(() => dismissLastRemoved, [dismissLastRemoved]);

  const handleProceedToOrder = () => {
    proceedToOrder();
    onNavigate('order');
  };

  /**
   * 항목 수정: 해당 상품 페이지로 이동하면서 어떤 옵션을 고치려는지 넘긴다.
   * 상품 페이지가 그 옵션으로 스크롤해 강조해 준다.
   */
  const handleEdit = useCallback((item: EstimateItem) => {
    setEditTargetName(item.name);
    onNavigate(item.category === 'bot' ? 'bot' : 'server');
  }, [onNavigate, setEditTargetName]);

  return (
    <div className="min-h-screen bg-white">
      {lastRemoved && (
        <UndoToast
          itemId={lastRemoved.item.id}
          name={lastRemoved.item.name}
          onUndo={undoRemove}
          onDismiss={dismissLastRemoved}
        />
      )}

      <div className="max-w-[1060px] mx-auto px-8 py-16">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-3 text-[14px] min-h-[44px] hover:text-[#ff7b00] transition-colors text-foreground/70 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2 rounded"
        >
          <span className="text-[18px]">←</span>
          메인으로 돌아가기
        </button>

        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-[40px] leading-[0.95] tracking-[-0.03em] font-bold text-[#ff7b00]">
            내 견적 확인하기
          </h1>
        </div>

        {/* 견적 내용 */}
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#fff5eb] flex items-center justify-center">
                <svg className="w-12 h-12 text-[#ff7b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-[24px] mb-4 text-foreground/70 font-semibold">
              견적에 담긴 항목이 없습니다
            </h2>
            <p className="text-[16px] text-foreground/60 mb-8 leading-relaxed">
              서버 설치 커미션 또는 자동봇 커미션 페이지에서<br />
              원하시는 옵션을 선택해주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('server')}
                className="min-h-[60px] px-8 py-4 border border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px] rounded-lg flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
              >
                <Server className="w-5 h-5" />
                서버 설치 커미션
              </button>
              <button
                onClick={() => onNavigate('bot')}
                className="min-h-[60px] px-8 py-4 border border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px] rounded-lg flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
              >
                <Bot className="w-5 h-5" />
                자동봇 커미션
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 항목 카운트 */}
            <p className="text-[15px] text-foreground/60 mb-10">
              총 {items.length}개 항목
            </p>

            {/* 항목 리스트 */}
            <section className="mb-4">
              <div className="mb-6 border-b border-border pb-4">
                <h2 className="text-[29px] tracking-[-0.01em]">선택한 항목</h2>
              </div>

              {(() => {
                const { serverItems, botItems, otherItems } = groupItemsByCategory(items);

                return (
                  <div className="space-y-4">
                    {/* 서버 설치 옵션 */}
                    {serverItems.length > 0 && (
                      <div className="border border-border overflow-hidden">
                        <div className="bg-black/[0.02] px-5 py-3 border-b border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Server className="w-4 h-4 text-[#ff7b00]" />
                            <h3 className="text-[15px] font-semibold">서버 설치</h3>
                          </div>
                          <span className="text-[14px] font-mono leading-normal text-foreground/50">
                            소계 ₩{calculateSubtotal(serverItems).toLocaleString()}
                          </span>
                        </div>
                        <div className="divide-y divide-border">
                          {serverItems.map((item) => (
                            <ItemRow key={item.id} item={item} onRemove={() => removeItem(item.id, { trackUndo: true })} onEdit={() => handleEdit(item)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 자동봇 옵션 */}
                    {botItems.length > 0 && (
                      <div className="border border-border overflow-hidden">
                        <div className="bg-black/[0.02] px-5 py-3 border-b border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bot className="w-4 h-4 text-[#ff7b00]" />
                            <h3 className="text-[15px] font-semibold">자동봇</h3>
                          </div>
                          <span className="text-[14px] font-mono leading-normal text-foreground/50">
                            소계 ₩{calculateSubtotal(botItems).toLocaleString()}
                          </span>
                        </div>
                        <div className="divide-y divide-border">
                          {botItems.map((item) => (
                            <ItemRow key={item.id} item={item} onRemove={() => removeItem(item.id, { trackUndo: true })} onEdit={() => handleEdit(item)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 기타 항목 */}
                    {otherItems.length > 0 && (
                      <div className="border border-border overflow-hidden">
                        <div className="bg-black/[0.02] px-5 py-3 border-b border-border flex items-center justify-between">
                          <h3 className="text-[15px] font-semibold">기타</h3>
                          <span className="text-[14px] font-mono leading-normal text-foreground/50">
                            소계 ₩{calculateSubtotal(otherItems).toLocaleString()}
                          </span>
                        </div>
                        <div className="divide-y divide-border">
                          {otherItems.map((item) => (
                            <ItemRow key={item.id} item={item} onRemove={() => removeItem(item.id, { trackUndo: true })} onEdit={() => handleEdit(item)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* 총 견적 금액 + 안내사항 통합 */}
            <section className="mb-4">
              <div className="border border-[#ff7b00] p-6">
                <div className="flex justify-between items-center">
                  <span className="text-[18px] leading-normal font-semibold">총 견적 금액</span>
                  <span className="text-[28px] font-mono leading-normal text-[#ff7b00]">
                    ₩{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#ff7b00]/20 space-y-1 text-[13px] text-foreground/50">
                  <p>• 최종 견적은 작업 난이도와 일정에 따라 달라질 수 있습니다.</p>
                  <p>• 정확한 견적은 신청서 제출 후 확인해드립니다.</p>
                  <p>• 자동봇 구동비는 1주 5천원이며, 테스트 기간 제외 후 주 단위로 청구합니다.</p>
                </div>
              </div>
            </section>

            {/* 신청서 작성 CTA */}
            <section className="pt-6 pb-8">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleProceedToOrder}
                  className="inline-flex items-center gap-3 bg-[var(--brand-primary)] text-white px-10 py-4 rounded-full font-semibold text-[16px] shadow-sm hover:shadow-md hover:brightness-95 active:scale-[0.98] transition-all duration-200"
                >
                  신청서 작성하기
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                <p className="text-[13px] text-foreground/40">
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
