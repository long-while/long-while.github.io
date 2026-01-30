import { useEstimate } from '@/app/contexts/EstimateContext';
import { ShoppingCartIcon } from '@/app/components/icons';
import type { NavigateFunction, PageType } from '@/app/types/navigation';

interface FloatingEstimateButtonProps {
  onNavigate: NavigateFunction;
  currentPage: PageType;
}

export default function FloatingEstimateButton({ onNavigate, currentPage }: FloatingEstimateButtonProps) {
  const { items, getTotalPrice } = useEstimate();

  // 견적 페이지나 주문 페이지에서는 표시하지 않음
  if (currentPage === 'estimate' || currentPage === 'order') {
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
        className="fixed z-40 w-14 h-14 min-w-[44px] min-h-[44px] rounded-full bg-[var(--brand-primary)] shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 md:hidden"
        style={{ bottom: 'calc(24px + env(safe-area-inset-bottom))', right: '24px' }}
        aria-label={`견적 보기 - ${items.length}개 항목, 총 ${getTotalPrice().toLocaleString()}원`}
      >
        <ShoppingCartIcon className="w-6 h-6 text-white" />
        <span 
          className="absolute -top-1 -right-1 w-6 h-6 bg-black text-white text-[12px] font-mono rounded-full flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          {items.length}
        </span>
      </button>

      {/* 데스크톱: 텍스트 포함 버튼 */}
      <button
        onClick={() => onNavigate('estimate')}
        className="hidden md:flex fixed z-40 items-center gap-3 bg-[var(--brand-primary)] text-white px-6 py-4 rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        style={{ bottom: '32px', right: '32px' }}
        aria-label={`견적 확인하기 - ${items.length}개 항목`}
      >
        <ShoppingCartIcon className="w-5 h-5" />
        <span className="font-medium">
          견적 확인 ({items.length}개 · ₩{getTotalPrice().toLocaleString()})
        </span>
      </button>
    </>
  );
}
