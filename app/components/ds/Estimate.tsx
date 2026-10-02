/**
 * 견적함 블록 (시안 '나의 견적함-채워있음' 242:3405, file.json 실측).
 *
 * EstimateGroup — 묶음 제목(28/38 Medium #000) ↔ 오른쪽 보조 글(소계), 간격 20 → 위 #000 1px 선, 위 패딩 24, 행 간격 12.
 * EstimateItemRow — 'Component 53' 1320×108: #F6F7F8, 모서리 12, 패딩 28, 양 끝 정렬.
 *   왼쪽 700: 이름 title4 + 배지 / 설명 body3 #767676 (간격 4) · 가운데 가격 body2 #000 · 오른쪽 연필·휴지통 28px #AAAAAA, 간격 12.
 *   잠긴 항목(자동 포함)은 연필·휴지통 대신 자물쇠.
 * EstimateTotal — 'Frame 1707484723' 1320×118: 흰 바탕, #DDDDDD 선, 모서리 10(→ card 12), 패딩 40·28.
 *   '총 견적 금액' title3 #222 ↔ 금액 headline2(24/36 Bold) #3376E7.
 */
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { focusRing } from './shared';

export function EstimateGroup({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-title1 text-text-primary">{title}</h2>
        {aside && <span className="text-body3 text-text-secondary">{aside}</span>}
      </div>
      <div className="flex flex-col gap-3 border-t border-border-strong pt-4 lg:pt-6">{children}</div>
    </section>
  );
}

interface EstimateItemRowProps {
  name: ReactNode;
  description?: ReactNode;
  price: ReactNode;
  /** 이름 옆 작은 배지 (예: 필수 포함) */
  badge?: ReactNode;
  /** 자동 포함 항목: 수정·삭제 대신 자물쇠와 안내 */
  locked?: boolean;
  lockedLabel?: string;
  lockedTitle?: string;
  editLabel?: string;
  removeLabel?: string;
  editTitle?: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

const iconButton = clsx(
  'flex size-11 items-center justify-center rounded-button text-border-200 transition-colors lg:size-9',
  focusRing,
);

const actionsArea = '-mr-2 flex w-[92px] shrink-0 items-center justify-end gap-1 lg:w-[78px] lg:gap-1.5';

export function EstimateItemRow({
  name, description, price, badge, locked, lockedLabel, lockedTitle, editLabel, removeLabel, editTitle, onEdit, onRemove,
}: EstimateItemRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-background-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:p-7">
      <div className="flex min-w-0 flex-col gap-1 sm:w-[700px] sm:max-w-[60%]">
        <h3 className="flex flex-wrap items-center gap-2 break-words text-title4 text-text-primary">
          {name}
          {badge}
        </h3>
        {description && <p className="break-words text-body3 text-text-secondary">{description}</p>}
      </div>
      <div className="flex items-center justify-between gap-4 sm:contents">
        <span className="shrink-0 text-body2 text-text-primary">{price}</span>
        {/* 잠긴 줄도 버튼 두 개 자리만큼 비워 금액 열이 다른 줄과 맞게 (4단계 리뷰) */}
        {locked ? (
          <span className={actionsArea}>
            <span className="flex size-11 items-center justify-center text-border-200 lg:size-9" title={lockedTitle}>
              <Icon name="lock" size={20} />
              {lockedLabel && <span className="sr-only">{lockedLabel}</span>}
            </span>
          </span>
        ) : (
          <span className={actionsArea}>
            <button type="button" onClick={onEdit} aria-label={editLabel} title={editTitle} className={clsx(iconButton, 'hover:text-brand')}>
              <Icon name="pencil" />
            </button>
            <button type="button" onClick={onRemove} aria-label={removeLabel} className={clsx(iconButton, 'hover:text-error-500')}>
              <Icon name="trash" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

export function EstimateTotal({ label, amount }: { label: ReactNode; amount: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-border-100 bg-background-white px-5 py-6 lg:px-7 lg:py-10">
      <span className="text-title3 text-text-primary">{label}</span>
      <span className="text-headline2 text-brand">{amount}</span>
    </div>
  );
}
