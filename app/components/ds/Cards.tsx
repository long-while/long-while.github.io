/**
 * 메인·서브페이지 카드 (file.json 실측).
 * PageHero   — 서브페이지 상단 배너: 1920×600 배경 이미지, 내용 y=382 부터 (영문 소제목 → 24 → display(FAQ 는 hero-xl) 제목 → 16 → body1).
 * ServiceCard — '커미션 서비스' 648 폭: 이미지 648×360(모서리 12) → 20 → 가운데 정렬 글(title2, body2 #767676, 가격 headline2 #3376E7) → 28 → 흰 버튼.
 * FeatureCard — '특징 카드' 264×264, #DDDDDD 선, 패딩 24, 간격 24: 아이콘 80 → 제목 title4 + 설명 body3 #767676 (가운데).
 * ProcessStep — '스텝 카드' 312×312, 흰 바탕, 모서리 12, 패딩 8, 그림자: 그림 칸 296×160(모서리 8, gradientSoft, 아이콘 140)
 *               → 패딩 16 글(STEP caption2 #3376E7 → 12 → 제목 title4 + 설명 body3, 간격 4).
 * StickyEstimateBar — 서버 페이지 하단 고정 바 680×100: 블루 22% 반투명 + 흰 선 + 배경 흐림 12, 모서리 8, 패딩 20.
 */
import clsx from 'clsx';
import type { MouseEventHandler, ReactNode } from 'react';
import { buttonClassName } from './Button';
import { Icon } from './Icon';
import { focusRing } from './shared';

interface PageHeroProps {
  image: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** 제목 크기: display 48/62 (서버·자동봇·이용안내) / hero-xl 56/68 (FAQ 시안) */
  titleSize?: 'display' | 'hero-xl';
  className?: string;
}

const HERO_TITLE_SIZE = { display: 'text-display', 'hero-xl': 'text-hero-xl' } as const;

export function PageHero({ image, eyebrow, title, description, titleSize = 'display', className }: PageHeroProps) {
  return (
    <section
      className={clsx('relative flex min-h-[360px] items-end overflow-hidden bg-background-brand bg-cover bg-center lg:min-h-[600px]', className)}
      style={{ backgroundImage: `url("${image}")` }}
    >
      {/* 모바일은 글이 그림 위에 크게 겹쳐서 아래쪽을 흰색으로 살짝 덮어 읽기 쉽게 */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,color-mix(in_srgb,var(--color-background-white)_85%,transparent)_100%)] lg:hidden" aria-hidden="true" />
      <div className="container-ds relative pb-12 pt-[calc(var(--ds-header-offset)+var(--ds-header-height)+24px)] lg:pb-[60px]">
        <div className="flex max-w-[540px] flex-col gap-6">
          {eyebrow && <p className="font-inter text-eyebrow uppercase text-brand">{eyebrow}</p>}
          <div className="flex flex-col gap-4">
            <h1 className={clsx(HERO_TITLE_SIZE[titleSize], 'text-text-primary')}>{title}</h1>
            {description && <p className="text-body1 text-text-secondary">{description}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  image: string;
  imageAlt?: string;
  title: ReactNode;
  description: ReactNode;
  /** 시안의 가격 줄. 사이트 문구에 가격이 없으면 생략 (Q9) */
  price?: ReactNode;
  ctaLabel: string;
  href: string;
  onCtaClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function ServiceCard({ image, imageAlt = '', title, description, price, ctaLabel, href, onCtaClick }: ServiceCardProps) {
  return (
    <article className="flex w-full max-w-[648px] flex-col items-center gap-5">
      <img src={image} alt={imageAlt} width={648} height={360} loading="lazy" className="aspect-[648/360] w-full rounded-card object-cover" />
      <div className="flex w-full max-w-[486px] flex-col items-center gap-7 text-center">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-title2 text-text-primary">{title}</h3>
            <p className="text-body2 text-text-secondary">{description}</p>
          </div>
          {price && <p className="text-headline2 text-brand">{price}</p>}
        </div>
        <a href={href} onClick={onCtaClick} className={clsx(buttonClassName({ variant: 'white', size: 'lg' }), 'w-[220px] max-w-full')}>
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  /** 선은 놓이는 그리드가 그린다 (시안: 5열×2줄 표 모양). 단독으로 쓸 때는 'border border-border-100' 을 넘긴다 */
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <article className={clsx('flex min-h-[264px] w-full flex-col items-center justify-center gap-6 p-6 text-center', className)}>
      <div className="flex size-20 items-center justify-center" aria-hidden="true">{icon}</div>
      <div className="flex flex-col gap-2">
        <h3 className="text-title4 text-text-primary">{title}</h3>
        <p className="text-body3 text-text-secondary">{description}</p>
      </div>
    </article>
  );
}

interface ProcessStepProps {
  step: string;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

export function ProcessStep({ step, icon, title, description }: ProcessStepProps) {
  return (
    <article className="flex w-full max-w-[312px] flex-col rounded-card bg-background-white p-2 shadow-modal">
      <div className="flex h-40 items-center justify-center rounded-input bg-gradient-brand-soft" aria-hidden="true">{icon}</div>
      <div className="flex flex-col gap-3 p-4">
        <p className="text-caption2 text-brand">{step}</p>
        <div className="flex flex-col gap-1">
          <h3 className="text-title4 text-text-primary">{title}</h3>
          <p className="text-body3 text-text-secondary">{description}</p>
        </div>
      </div>
    </article>
  );
}

interface StickyEstimateBarProps {
  message: ReactNode;
  amount: ReactNode;
  href: string;
  onAmountClick?: MouseEventHandler<HTMLAnchorElement>;
  /**
   * fixed: 화면 아래 가운데에 늘 고정 / sticky: 본문을 따라 내려오다 본문이 끝나는 곳에서 멈춤
   * (페이지 본문 마지막 자식으로 두면 푸터를 가리지 않음) / inline: 제자리
   */
  placement?: 'fixed' | 'sticky' | 'inline';
}

export function StickyEstimateBar({ message, amount, href, onAmountClick, placement = 'fixed' }: StickyEstimateBarProps) {
  const bar = (
    <div
      className={clsx(
        'pointer-events-auto flex w-full max-w-[680px] items-center justify-between gap-4 rounded-input border border-background-white bg-brand/22 p-4 shadow-modal backdrop-blur-[12px] lg:p-5',
        placement === 'fixed' && 'fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-32px)] -translate-x-1/2',
      )}
    >
      <p className="text-body2 font-medium text-text-primary lg:text-title4">{message}</p>
      <a
        href={href}
        onClick={onAmountClick}
        className={clsx(
          'inline-flex min-h-[60px] shrink-0 items-center justify-center rounded-input bg-brand px-5 py-4 text-title4 text-text-inverse transition-colors hover:bg-brand-hover lg:w-[180px]',
          focusRing,
        )}
      >
        {amount}
      </a>
    </div>
  );
  if (placement !== 'sticky') return bar;
  // 높이 0 인 sticky 기준점 위로 바를 띄운다: 자리를 차지하지 않고, 부모 영역 끝에서 멈춘다
  return (
    <div className="pointer-events-none sticky bottom-[calc(16px+env(safe-area-inset-bottom))] z-40 h-0">
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4">{bar}</div>
    </div>
  );
}

interface LinkCardProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * LinkCard — 메인 하단 CTA 카드 (Frame 2095589744: 648×228, 흰 바탕, 모서리 12, 패딩 40, 간격 32).
 *  위: 영문 소제목(16/24 Medium #000) + 제목(headline2 #3376E7), 간격 8 ↔ 오른쪽 52px 원형 화살표(#F6F7F8, 화살표 #A6A6A6).
 *  아래: 설명 body2 #767676 (없으면 생략). 카드 전체가 링크.
 */
export function LinkCard({ eyebrow, title, description, href, onClick }: LinkCardProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={clsx(
        'group flex w-full flex-col gap-8 rounded-card bg-background-white p-6 transition-shadow duration-200 hover:shadow-card lg:p-10',
        focusRing,
      )}
    >
      <span className="flex items-center justify-between gap-6">
        <span className="flex flex-col gap-2">
          <span className="text-caption1 uppercase text-text-primary">{eyebrow}</span>
          <span className="text-headline2 text-brand">{title}</span>
        </span>
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-pill bg-background-100 text-text-disabled transition-colors group-hover:bg-brand-50 group-hover:text-brand">
          <Icon name="chevron-right" />
        </span>
      </span>
      {description && <span className="text-body2 text-text-secondary">{description}</span>}
    </a>
  );
}
