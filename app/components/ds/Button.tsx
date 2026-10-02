/**
 * Button — 시안 '버튼' 컴포넌트 (component-1 Button Default / Hover, file.json 실측).
 *  - primary: #3376E7 / hover #1551B7, 흰 글자
 *  - gray:    #F6F7F8 / hover #EDEDED, #767676 글자
 *  - white:   흰 배경 + #DDDDDD 선 / hover #F6F7F8, #767676 글자
 *  - outline: 흰 배경 + 파란 선·파란 글자 / hover 연한 파랑 (4단계: '견적에서 제거'처럼 선택을 되돌리는 버튼. 흰 버튼은 꺼진 것처럼 보였다)
 *  - dark:    #111111 (푸터 'DM 바로가기'), #000 (헤더 '신청하기', '수정하기')
 * 크기: lg 64px(패딩 20), md 44px(패딩 12·28), sm 42px(패딩 10·20). pill 모양은 헤더 '신청하기'(패딩 12·32).
 * href 를 주면 <a>, 아니면 <button> 으로 그린다.
 */
import clsx from 'clsx';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { focusRing, focusRingInverse } from './shared';

export type ButtonVariant = 'primary' | 'gray' | 'white' | 'outline' | 'dark' | 'black';
export type ButtonSize = 'lg' | 'md' | 'sm';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 알약 모양 (헤더 '신청하기') */
  pill?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-text-inverse hover:bg-brand-hover',
  gray: 'bg-background-100 text-text-secondary hover:bg-background-200',
  white: 'bg-background-white text-text-secondary border border-border-100 hover:bg-background-100',
  outline: 'bg-background-white text-brand border border-brand hover:bg-brand-50',
  dark: 'bg-background-inverse-raised text-text-inverse hover:bg-background-inverse',
  black: 'bg-background-inverse text-text-inverse hover:bg-background-inverse-raised',
};

const SIZE: Record<ButtonSize, string> = {
  lg: 'min-h-16 px-5 py-5 text-caption1',
  md: 'min-h-11 px-7 py-3 text-caption2',
  sm: 'min-h-[42px] px-5 py-2.5 text-caption2',
};

const DISABLED =
  'disabled:bg-background-200 disabled:text-text-disabled disabled:border-transparent disabled:cursor-not-allowed ' +
  'aria-disabled:bg-background-200 aria-disabled:text-text-disabled aria-disabled:pointer-events-none';

interface ClassOptions extends Pick<CommonProps, 'variant' | 'size' | 'pill' | 'fullWidth'> {
  /** 어두운 바탕 위에 놓일 때 흰 포커스 표시 */
  onDark?: boolean;
}

/**
 * 버튼 모양 클래스. 같은 속성을 덮어쓰는 클래스를 뒤에 붙이면 CSS 순서에 따라 결과가 달라지므로
 * 모양 차이는 여기 옵션으로만 고른다.
 */
export function buttonClassName({ variant = 'primary', size = 'lg', pill = false, fullWidth = false, onDark = false }: ClassOptions) {
  return clsx(
    'inline-flex items-center justify-center gap-2.5 text-center transition-colors duration-200',
    pill ? 'rounded-pill' : 'rounded-button',
    fullWidth && 'w-full',
    VARIANT[variant],
    // 알약 중간 크기는 시안 '신청하기' 패딩 12·32
    pill && size === 'md' ? 'min-h-11 px-8 py-3 text-caption2' : SIZE[size],
    DISABLED,
    onDark ? focusRingInverse : focusRing,
  );
}

export function Button(props: ButtonProps | LinkProps) {
  const { variant, size, pill, fullWidth, leadingIcon, trailingIcon, children, className, ...rest } = props;
  const classes = clsx(buttonClassName({ variant, size, pill, fullWidth }), className);
  const content = (
    <>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </>
  );
  if (typeof rest.href === 'string') {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }
  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
