/**
 * Toast — 시안 견적함 삭제 알림 (Frame 2095589931, file.json 실측).
 *  408×60, 검정 바탕, 모서리 4, 패딩 20, 간격 40. 왼쪽 알림 종(20px, 흰 선 + 빨간 점) + 문구 13/18 흰색,
 *  오른쪽 '되돌리기' body3 흰색 + 닫기 16px #DDDDDD.
 * Banner — 시안 STEP04 '이동 후 안내띠' (1320×104, #F1F6FD(Q15), 모서리 12, 패딩 20·32, 간격 20).
 *  제목 16 SemiBold #000, 설명 body3 #767676, 오른쪽 버튼 영역(간격 8).
 */
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { focusRingInverse } from './shared';

interface ToastProps {
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  icon?: ReactNode;
  /** 화면 아래 가운데에 고정 */
  floating?: boolean;
  className?: string;
}

export function Toast({ message, actionLabel, onAction, onClose, icon, floating = false, className }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex min-h-[60px] w-fit max-w-full items-center justify-between gap-4 rounded-button bg-background-inverse p-5 text-text-inverse lg:gap-10',
        floating && 'fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-32px)] -translate-x-1/2 lg:w-fit',
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-1">
        {icon ?? <Icon name="bell" className="shrink-0 text-text-inverse" />}
        <span className="text-[13px] leading-[18px] lg:whitespace-nowrap">{message}</span>
      </span>
      <span className="flex shrink-0 items-center gap-5">
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className={clsx('text-body3 underline-offset-2 hover:underline', focusRingInverse)}>
            {actionLabel}
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} aria-label="알림 닫기" className={clsx('flex size-6 items-center justify-center text-border-100 hover:text-text-inverse', focusRingInverse)}>
            <Icon name="close" />
          </button>
        )}
      </span>
    </div>
  );
}

interface BannerProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Banner({ title, description, actions, className }: BannerProps) {
  return (
    <div
      role="status"
      className={clsx(
        'flex flex-col gap-4 rounded-card bg-background-brand px-5 py-5 lg:min-h-[104px] lg:flex-row lg:items-center lg:gap-5 lg:px-8',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-body2 font-semibold text-text-primary">{title}</p>
        {description && <p className="text-body3 text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{actions}</div>}
    </div>
  );
}
