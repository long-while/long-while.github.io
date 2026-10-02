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
  /** 화면 아래에 고정 */
  floating?: boolean;
  /** floating 일 때 가로 위치: center(기본) / end(데스크톱에서 본문 오른쪽 끝에 맞춤, 견적함 시안) */
  floatAlign?: 'center' | 'end';
  className?: string;
}

const FLOAT_CLASS = {
  center: 'fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-32px)] -translate-x-1/2 lg:w-fit',
  end: 'fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-4 right-4 z-50 lg:left-auto lg:right-[max(32px,calc((100vw-1320px)/2))] lg:w-fit',
} as const;

export function Toast({ message, actionLabel, onAction, onClose, icon, floating = false, floatAlign = 'center', className }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex min-h-[60px] w-fit max-w-full items-center justify-between gap-4 rounded-button bg-background-inverse p-5 text-text-inverse lg:gap-10',
        floating && FLOAT_CLASS[floatAlign],
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
  /** brand: 안내 (기본) / warning: 확인이 필요한 상태 */
  tone?: 'brand' | 'warning';
  className?: string;
}

const BANNER_TONE = { brand: 'bg-background-brand', warning: 'border border-warning-200 bg-warning-50' } as const;

export function Banner({ title, description, actions, tone = 'brand', className }: BannerProps) {
  return (
    <div
      role="status"
      className={clsx(
        'flex flex-col gap-4 rounded-card px-5 py-5 lg:min-h-[104px] lg:flex-row lg:items-center lg:gap-5 lg:px-8',
        BANNER_TONE[tone],
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

interface ErrorSummaryProps {
  title: ReactNode;
  errors: { key: string; message: ReactNode; onSelect: () => void }[];
  className?: string;
}

/**
 * ErrorSummary — 신청서 상단 오류 목록 (시안에 없어 Input Guide 오류 상태(#DC0000)로 설계, Q8).
 *  흰 바탕 + #DC0000 선 1px, 모서리 12, 패딩 20·24. 제목 title5 + 경고 아이콘, 항목은 누르면 해당 입력칸으로 이동하는 링크형 버튼(body3).
 */
export function ErrorSummary({ title, errors, className }: ErrorSummaryProps) {
  return (
    <div role="alert" className={clsx('flex flex-col gap-3 rounded-card border border-error-500 bg-background-white px-5 py-5 lg:px-6', className)}>
      <p className="flex items-center gap-2 text-title5 text-error-500">
        <Icon name="warning" size={20} className="shrink-0" />
        {title}
      </p>
      <ul className="flex flex-col gap-1.5 pl-7">
        {errors.map((error) => (
          <li key={error.key} className="list-disc text-body3 text-error-500 marker:text-error-500">
            <button
              type="button"
              onClick={error.onSelect}
              className="text-left underline decoration-error-500/40 underline-offset-2 hover:decoration-error-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-500"
            >
              {error.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
