/**
 * OptionCard — 시안 테마 선택 카드 (Component 47~49: 424×236, 패딩 28, 간격 16, 모서리 8).
 *  기본: 흰 바탕 + #DDDDDD 선 1px / 선택: #F1F6FD 바탕 + #3376E7 선 2px, 제목 #3376E7.
 *  비활성(component-2 Disabled): #F6F7F8 바탕 + #DDDDDD 선, 글자 모두 #A6A6A6.
 *  내용: 라디오 28px(가운데) → 제목 title3 + 설명 body2 #767676 (간격 4) → 가격 title4 (간격 24).
 * layout="row" 는 component-2 의 가로형 (Component 55·56: 패딩 28, 간격 20, 제목 title4, 설명 body3, 가격 title5 #3376E7, 글·가격 간격 60).
 * 실제 <input type=radio|checkbox> 를 감싼 <label> 이라 키보드·폼 동작은 브라우저 기본.
 */
import clsx from 'clsx';
import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface OptionCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  type?: 'radio' | 'checkbox';
  title: ReactNode;
  description?: ReactNode;
  price?: ReactNode;
  /** card: 세로(가운데) / row: 가로 / responsive: 모바일 row, 데스크톱 card */
  layout?: 'card' | 'row' | 'responsive';
}

function Indicator({ type, checked }: { type: 'radio' | 'checkbox'; checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex size-7 shrink-0 items-center justify-center rounded-pill',
        checked ? 'bg-brand' : 'bg-border-100',
        'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand',
      )}
    >
      {type === 'radio' ? (
        <span className="size-3.5 rounded-pill bg-background-white" />
      ) : (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-text-inverse">
          <path d="M8.91 14L12.73 17.82L19.09 10.18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

/** 레이아웃별 클래스. responsive = 1024px 미만은 row, 이상은 card (모바일에서 세로 카드가 너무 길어서) */
const LAYOUT = {
  card: {
    root: 'flex-col items-center gap-4 p-5 text-center lg:p-7',
    body: 'flex-col gap-6',
    title: 'text-title3',
    desc: 'text-body2',
    // 카드를 한 줄에 여러 개 둘 때 설명 길이가 달라도 금액은 카드 맨 아래 같은 높이에 (4단계 리뷰)
    price: 'mt-auto text-title4',
    priceColor: 'text-text-primary',
  },
  row: {
    root: 'items-center gap-5 p-5 lg:p-7',
    body: 'flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-[60px]',
    title: 'text-title4',
    desc: 'text-body3',
    price: 'text-title5',
    priceColor: 'text-brand',
  },
  responsive: {
    root: 'items-center gap-4 p-5 text-left lg:flex-col lg:gap-4 lg:p-7 lg:text-center',
    body: 'flex-col gap-2 lg:gap-6',
    title: 'text-title4 lg:text-title3',
    desc: 'text-body3 lg:text-body2',
    price: 'text-title5 lg:mt-auto lg:text-title4',
    priceColor: 'text-brand lg:text-text-primary',
  },
} as const;

export function OptionCard({
  type = 'radio', title, description, price, layout = 'card', checked = false, disabled, id, className, ...rest
}: OptionCardProps) {
  const autoId = useId();
  const inputId = id ?? `option-${autoId}`;
  const l = LAYOUT[layout];
  return (
    <label
      htmlFor={inputId}
      className={clsx(
        'relative flex rounded-input transition-colors duration-150',
        l.root,
        disabled
          ? 'cursor-not-allowed border border-border-100 bg-background-100'
          : checked
            ? 'cursor-pointer border-2 border-brand bg-brand-50'
            : 'cursor-pointer border border-border-100 bg-background-white hover:border-border-200',
        className,
      )}
    >
      <input id={inputId} type={type} checked={checked} disabled={disabled} className="peer sr-only" {...rest} />
      <Indicator type={type} checked={checked} />
      <span className={clsx('flex min-w-0 flex-1', l.body)}>
        <span className="flex flex-col gap-1">
          <span className={clsx(l.title, disabled ? 'text-text-disabled' : checked ? 'text-brand' : 'text-text-primary')}>{title}</span>
          {description && <span className={clsx(l.desc, disabled ? 'text-text-disabled' : 'text-text-secondary')}>{description}</span>}
        </span>
        {price && <span className={clsx('shrink-0', l.price, disabled ? 'text-text-disabled' : l.priceColor)}>{price}</span>}
      </span>
    </label>
  );
}
