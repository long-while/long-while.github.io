/**
 * 플로팅 견적 버튼 (P8: 서버·자동봇 커미션 외 페이지). 시안에 없는 요소라 토큰으로 다시 입힘: 브랜드 알약 + shadow-modal.
 */
import { useEstimate } from '@/app/contexts/EstimateContext';
import { ShoppingCartIcon } from '@/app/components/icons';
import type { NavigateFunction, PageType } from '@/app/types/navigation';

interface FloatingEstimateButtonProps {
  onNavigate: NavigateFunction;
  currentPage: PageType;
}

export default function FloatingEstimateButton({ onNavigate, currentPage }: FloatingEstimateButtonProps) {
  const { items, getTotalPrice } = useEstimate();

  // 견적·주문 페이지에서는 표시하지 않음. 서버·자동봇 커미션은 하단 고정 바(StickyEstimateBar)를 쓰므로 숨김 (P8)
  if (currentPage === 'estimate' || currentPage === 'order' || currentPage === 'server' || currentPage === 'bot') {
    return null;
  }

  // 견적 아이템이 없으면 표시하지 않음
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* 모바일: 아이콘 버튼 */}
      <button
        onClick={() => onNavigate('estimate')}
        className="fixed z-40 flex size-14 items-center justify-center rounded-pill bg-brand text-text-inverse shadow-modal transition-colors hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:hidden"
        style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))', right: '24px' }}
        aria-label={`견적 보기 - ${items.length}개 항목, 총 ${getTotalPrice().toLocaleString()}원`}
      >
        <ShoppingCartIcon className="w-6 h-6 text-text-inverse" />
        <span
          className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-pill bg-background-inverse text-caption2 text-text-inverse"
          role="status"
          aria-live="polite"
        >
          {items.length}
        </span>
      </button>

      {/* 데스크톱: 텍스트 포함 버튼 */}
      <button
        onClick={() => onNavigate('estimate')}
        className="fixed z-40 hidden min-h-[60px] items-center gap-3 rounded-pill bg-brand px-7 py-4 text-caption1 text-text-inverse shadow-modal transition-colors hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:flex"
        style={{ bottom: '32px', right: '32px' }}
        aria-label={`견적 확인하기 - ${items.length}개 항목`}
      >
        <ShoppingCartIcon className="w-5 h-5" />
        <span>
          견적 확인 ({items.length}개 · ₩{getTotalPrice().toLocaleString()})
        </span>
      </button>
    </>
  );
}
