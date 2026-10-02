/**
 * OptionRow — 신청서 STEP2·3 옵션 목록 한 줄 (시안 '신청서 - STEP02-편집 상태' 커스텀·기타 옵션, file.json 실측).
 *  고르지 않음: 바탕 없음, 이름 title5 + 설명 body3 #767676 ↔ 가격 body3 #767676 + '선택하기' 칩(흰 바탕, #DDDDDD 선, 모서리 4).
 *  고름: #F6F7F8 바탕, 모서리 12, 패딩 28·24, 가격 body2 #000, 오른쪽 파란 체크.
 *   (시안은 고른 줄 오른쪽에 연필을 그렸지만, 이 줄을 누르면 선택이 풀리는 동작이라 체크로 표시함)
 *  못 고름(disabled): 흐리게. 실제 <input type=radio|checkbox> 를 감싼 <label> 이라 키보드·폼 동작은 브라우저 기본.
 *  children: 고른 뒤에 펼쳐지는 추가 입력(예: 원하는 글자수, 빠른 마감 세부 옵션).
 */
import clsx from 'clsx';
import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';

interface OptionRowProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  type?: 'radio' | 'checkbox';
  title: ReactNode;
  /** 이름 옆 작은 표시 (예: 견적에서 선택됨, 마감 임박 필수) */
  badge?: ReactNode;
  description?: ReactNode;
  price?: ReactNode;
  actionLabel?: string;
  children?: ReactNode;
}

export function OptionRow({
  type = 'checkbox', title, badge, description, price, actionLabel = '선택하기', checked = false, disabled, id, className, children, ...rest
}: OptionRowProps) {
  const autoId = useId();
  const inputId = id ?? `option-row-${autoId}`;
  return (
    <div className={clsx('flex flex-col gap-3', className)}>
      <label
        htmlFor={inputId}
        className={clsx(
          'group flex items-center gap-4 rounded-card transition-colors duration-150',
          checked ? 'bg-background-100 px-5 py-5 lg:px-7 lg:py-6' : 'px-0 py-2',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <input id={inputId} type={type} checked={checked} disabled={disabled} className="peer sr-only" {...rest} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2 text-title5 text-text-primary">
            {title}
            {badge}
          </span>
          {description && <span className="text-body3 text-text-secondary">{description}</span>}
        </span>
        {price && <span className={clsx('shrink-0 text-right', checked ? 'text-body2 text-text-primary' : 'text-body3 text-text-secondary')}>{price}</span>}
        <span
          className={clsx(
            'flex h-9 shrink-0 items-center justify-center rounded-button text-body3',
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand',
            checked ? 'w-9 text-brand' : 'border border-border-100 bg-background-white px-3 text-text-primary group-hover:border-border-strong',
          )}
          aria-hidden="true"
        >
          {checked ? <Icon name="check" size={24} /> : actionLabel}
        </span>
      </label>
      {checked && children && <div className="flex flex-col gap-3 pl-0 lg:pl-7">{children}</div>}
    </div>
  );
}
