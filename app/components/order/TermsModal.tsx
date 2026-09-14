import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Terms from '@/app/components/Terms';

/** 모달 안에서 Tab 으로 순회할 수 있는 요소 */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 신청서 안에서 이용안내를 띄우는 모달.
 * 작성 중인 내용을 잃지 않도록 새 탭으로 내보내지 않고 같은 화면 위에 얹는다.
 */
export default function TermsModal({ open, onClose }: TermsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** 모달을 연 요소. 닫을 때 여기로 포커스를 돌려준다 */
  const triggerRef = useRef<Element | null>(null);

  // onClose 가 매 렌더 새 함수로 와도 effect 가 재실행되지 않도록 붙잡아 둔다
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /** Tab 이 모달 밖으로 새지 않도록 첫/끝 요소를 순환시킨다 */
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusables || focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  // 열려 있는 동안 ESC 로 닫고, 포커스를 가두고, 뒤 배경은 스크롤되지 않게 한다
  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key === 'Tab') handleTabKey(event);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // 모달을 연 버튼으로 포커스를 돌려준다
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, handleTabKey]);

  // 신청서 Step 카드에는 translate 가 걸려 있어 fixed 자손의 기준이 뷰포트가 아니게 된다.
  // 포털로 body 에 붙여야 화면 전체를 덮고 z-index 도 제대로 먹는다.
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="이용안내"
        className="relative w-full max-w-[820px] max-h-[85vh] bg-white rounded-lg shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-[18px] font-semibold">이용안내</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-foreground/50 hover:text-foreground rounded-full hover:bg-black/5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
            aria-label="이용안내 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6">
          {/* 제목은 위 헤더가 대신하므로 본문 제목은 끈다 */}
          <Terms showTitle={false} showToc />
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--brand-primary)] text-white rounded-md text-[14px] font-medium hover:brightness-95 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
