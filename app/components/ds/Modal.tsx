/**
 * Modal — 시안 모달 (복사 완료 / 복사 실패 / 견적 데이터 반영, file.json 실측).
 *  딤 배경 검정 50%, 상자 흰색·모서리 12·패딩 40(모바일 24)·폭 532(size=xl 1320), 간격 20.
 *  제목 headline2 #000, 부제 body2 #3376E7, 본문 슬롯, 버튼 영역(가로, 간격 12).
 * 동작: Esc 로 닫기, 바깥(딤) 클릭으로 닫기, Tab 포커스 가두기, 열릴 때 본문 스크롤 잠금,
 *       닫히면 열기 전 포커스로 되돌리기. 닫힌 상태에서는 아무것도 그리지 않아 SSR 에 안전하다.
 */
import clsx from 'clsx';
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { focusRing } from './shared';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** 딤 배경 클릭으로 닫기 (기본 true) */
  closeOnOverlay?: boolean;
  /** 오른쪽 위 닫기 버튼 (기본 true) */
  showClose?: boolean;
  /** 열릴 때 포커스: first(기본, 처음 누를 수 있는 요소) / last(마지막 = 오른쪽 주 버튼. 첫 버튼이 되돌릴 수 없는 동작일 때) */
  initialFocus?: 'first' | 'last';
  /** md: 532 (확인·선택 모달) / xl: 1320 (신청서 이용안내 전체 보기) */
  size?: 'md' | 'xl';
  className?: string;
}

const WIDTH = { md: 'max-w-[532px]', xl: 'max-w-[1320px]' } as const;

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Esc·Tab 처리, 스크롤 잠금, 포커스 복원 */
function useModalBehavior(open: boolean, onClose: () => void, dialogRef: RefObject<HTMLDivElement | null>, initialFocus: 'first' | 'last') {
  // onClose 가 매 렌더 새 함수여도 효과가 다시 실행되지 않게 ref 로 들고 있는다
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const focusables = dialogRef.current ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    const target = initialFocus === 'last' ? focusables[focusables.length - 1] : focusables[0];
    (target ?? dialogRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const [head, tail] = [nodes[0], nodes[nodes.length - 1]];
      if (event.shiftKey && document.activeElement === head) { event.preventDefault(); tail.focus(); }
      else if (!event.shiftKey && document.activeElement === tail) { event.preventDefault(); head.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previous?.focus?.();
    };
  }, [open, dialogRef, initialFocus]);
}

export function Modal({ open, onClose, title, subtitle, icon, children, actions, closeOnOverlay = true, showClose = true, initialFocus = 'first', size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  useEffect(() => setMounted(true), []);
  useModalBehavior(open, onClose, dialogRef, initialFocus);
  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-overlay" aria-hidden="true" onClick={closeOnOverlay ? onClose : undefined} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx('relative flex max-h-[calc(100dvh-32px)] w-full flex-col gap-5 overflow-y-auto rounded-modal bg-background-white p-6 outline-none lg:p-10', WIDTH[size], className)}
      >
        {showClose && (
          <button type="button" onClick={onClose} aria-label="닫기" className={clsx('absolute right-4 top-4 flex size-11 items-center justify-center rounded-button text-text-disabled hover:text-text-primary', focusRing)}>
            <Icon name="close" size={20} />
          </button>
        )}
        <div className="flex flex-col gap-1 pr-10">
          <h2 id={titleId} className="flex items-center gap-2 text-headline2 text-text-primary">
            {icon}
            {title}
          </h2>
          {subtitle && <p className="text-body2 text-brand">{subtitle}</p>}
        </div>
        {children && <div className="text-body3 text-text-secondary">{children}</div>}
        {actions && <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center [&>*]:flex-1">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
