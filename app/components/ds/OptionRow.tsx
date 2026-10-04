/**
 * OptionRow — 신청서 STEP2 옵션 목록 한 줄 (시안 '신청서 - STEP02-편집 상태' 기타 옵션, file.json 실측).
 *  왼쪽에 체크박스(라디오면 동그라미) → 이름 title5 + 설명 body3 #767676 ↔ 가격.
 *   (예전 '선택하기' 칩은 무엇을 고르는지 잘 안 보인다는 사용자 요청으로 Checkbox·Radio 와 같은 모양으로 바꿈)
 *  고름: #F6F7F8 바탕, 모서리 12, 패딩 28·24, 가격 body2 #000.
 *  못 고름(disabled): 흐리게. 실제 <input type=radio|checkbox> 를 감싼 <label> 이라 키보드·폼 동작은 브라우저 기본.
 *  children: 고른 뒤에 펼쳐지는 추가 입력(예: 원하는 글자수, 빠른 마감 세부 옵션).
 */
import clsx from 'clsx';
import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface OptionRowProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  type?: 'radio' | 'checkbox';
  title: ReactNode;
  /** 이름 옆 작은 표시 (예: 견적에서 선택됨, 마감 임박 필수) */
  badge?: ReactNode;
  description?: ReactNode;
  price?: ReactNode;
  children?: ReactNode;
}

const focusRing = 'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand';

/** Checkbox·Radio(ds/Choice) 와 같은 28px 동그라미 */
function Indicator({ type, checked }: { type: 'radio' | 'checkbox'; checked: boolean }) {
  if (type === 'radio') {
    return (
      <span aria-hidden="true" className={clsx('flex size-7 shrink-0 items-center justify-center rounded-pill border-2 transition-colors duration-150', focusRing,
        checked ? 'border-brand bg-brand' : 'border-border-200 bg-background-white group-hover:border-brand')}>
        <span className="size-3 rounded-pill bg-background-white" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={clsx('flex size-7 shrink-0 items-center justify-center rounded-pill transition-colors duration-150', focusRing,
      checked ? 'bg-brand' : 'bg-border-100')}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-text-inverse">
        <path d="M8.91 14L12.73 17.82L19.09 10.18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function OptionRow({
  type = 'checkbox', title, badge, description, price, checked = false, disabled, id, className, children, ...rest
}: OptionRowProps) {
  const autoId = useId();
  const inputId = id ?? `option-row-${autoId}`;
  return (
    <div className={clsx('flex flex-col gap-3', className)}>
      <label
        htmlFor={inputId}
        className={clsx(
          'group flex items-center gap-4 rounded-card px-5 py-4 transition-colors duration-150 lg:px-7',
          checked ? 'bg-background-100' : !disabled && 'hover:bg-background-100/60',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <input id={inputId} type={type} checked={checked} disabled={disabled} className="peer sr-only" {...rest} />
        <Indicator type={type} checked={checked} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2 text-title5 text-text-primary">
            {title}
            {badge}
          </span>
          {description && <span className="text-body3 text-text-secondary">{description}</span>}
        </span>
        {price && <span className={clsx('shrink-0 text-right', checked ? 'text-body2 text-text-primary' : 'text-body3 text-text-secondary')}>{price}</span>}
      </label>
      {checked && children && <div className="flex flex-col gap-3 pl-0 lg:pl-7">{children}</div>}
    </div>
  );
}
