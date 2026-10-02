/**
 * 플로팅 견적 버튼 (P8: 서버·자동봇 커미션·견적함·신청서 외 페이지).
 * 시안에 플로팅 버튼 자체는 없어서, 시안 하단 고정 바(StickyEstimateBar, Frame 1707486790)의 모양을 작게 옮김:
 *  블루 22% 반투명 + 흰 선 1px + 배경 흐림 12 + 모서리 8 + 그림자, 오른쪽 금액 칩(#3376E7, 흰 글자).
 *  모바일은 56px 원형(같은 블루) + 개수 배지.
 */
import { Icon } from '@/app/components/ds';
import { useEstimate } from '@/app/contexts/EstimateContext';
import type { NavigateFunction, PageType } from '@/app/types/navigation';

interface FloatingEstimateButtonProps {
  onNavigate: NavigateFunction;
  currentPage: PageType;
}

const HIDDEN_ON: ReadonlySet<PageType> = new Set<PageType>(['estimate', 'order', 'server', 'bot']);
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export default function FloatingEstimateButton({ onNavigate, currentPage }: FloatingEstimateButtonProps) {
  const { items, getTotalPrice } = useEstimate();

  // 견적·주문 페이지에서는 표시하지 않음. 서버·자동봇 커미션은 하단 고정 바(StickyEstimateBar)를 쓰므로 숨김 (P8)
  if (HIDDEN_ON.has(currentPage) || items.length === 0) return null;

  const total = getTotalPrice().toLocaleString();
  return (
    <>
      {/* 모바일: 아이콘 버튼 */}
      <button
        type="button"
        onClick={() => onNavigate('estimate')}
        className={`fixed right-4 z-40 flex size-14 items-center justify-center rounded-pill border border-background-white bg-brand text-text-inverse shadow-modal transition-colors hover:bg-brand-hover md:hidden ${focus}`}
        style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        aria-label={`견적 보기 - ${items.length}개 항목, 총 ${total}원`}
      >
        <Icon name="cart" />
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-pill bg-background-inverse text-caption2 text-text-inverse" role="status" aria-live="polite">
          {items.length}
        </span>
      </button>

      {/* 데스크톱: 시안 고정 바 모양의 작은 버튼 */}
      <button
        type="button"
        onClick={() => onNavigate('estimate')}
        className={`group fixed bottom-8 right-8 z-40 hidden items-center gap-4 rounded-input border border-background-white bg-brand/22 py-2 pl-5 pr-2 shadow-modal backdrop-blur-[12px] md:flex ${focus}`}
        aria-label={`견적 확인하기 - ${items.length}개 항목`}
      >
        <span className="flex items-center gap-2 text-title5 text-text-primary">
          <Icon name="cart" size={20} className="text-brand" />
          견적 확인 ({items.length}개)
        </span>
        <span className="flex min-h-11 items-center rounded-input bg-brand px-4 text-title5 text-text-inverse transition-colors group-hover:bg-brand-hover">
          ₩{total}
        </span>
      </button>
    </>
  );
}
