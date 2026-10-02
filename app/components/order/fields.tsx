/**
 * 신청서 STEP2·3 이 같이 쓰는 작은 조각 (시안 신청서 실측 기준 토큰).
 *  FromCartBadge — '견적에서 선택됨' 작은 배지 / Pill — 회색·파랑 상태 배지
 *  FieldErrorText — 입력 중 즉시 검증 오류 문구(필드 오류와 같은 모양) / SubPanel — 고른 옵션 아래 펼쳐지는 회색 입력 상자
 *  useFromCart — 견적에서 넘어온 항목인지 (기존 규칙: 이름이 서로 포함되면 같은 항목)
 */
import type { ReactNode } from 'react';
import { Icon } from '@/app/components/ds';
import { useOrder } from '@/app/contexts/OrderContext';

export function FromCartBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-background-brand px-2 py-0.5 text-caption2 text-brand">
      <Icon name="cart" size={14} />
      견적에서 선택됨
    </span>
  );
}

export function Pill({ tone = 'gray', children }: { tone?: 'gray' | 'brand'; children: ReactNode }) {
  return (
    <span className={tone === 'brand' ? 'rounded-pill bg-background-brand px-2 py-0.5 text-caption2 text-brand' : 'rounded-pill bg-background-100 px-2 py-0.5 text-caption2 text-text-secondary'}>
      {children}
    </span>
  );
}

export function FieldErrorText({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="field-error">
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </p>
  );
}

export function SubPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 rounded-card bg-background-100 p-5 lg:p-6 ${className}`}>{children}</div>;
}

export function useFromCart() {
  const { cartSyncState } = useOrder();
  return (itemName: string) =>
    cartSyncState?.syncedItems?.some((name) => name.includes(itemName) || itemName.includes(name)) ?? false;
}
