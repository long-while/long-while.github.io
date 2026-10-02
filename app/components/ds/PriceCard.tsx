/**
 * PriceCard — 시안 가격 카드 (Component 46 type-1 / Component 60 type-2, file.json 실측).
 *  왼쪽 로고 상자 162×162 (#F6F7F8, 모서리 12) + 오른쪽 내용 (간격 24).
 *  제목 title3 → 강조 줄(파란 caption2 | 1×12 선 | 회색 body3, 여러 쌍) → 아래 선 #DDDDDD, 패딩 16.
 *  사양 줄: 이름 body3 #767676 (100px) + 값 caption2 #000, 간격 32, 줄 간격 8.
 *  가격 상자 180×54, #3376E7, 모서리 8, 패딩 12·20, 흰 title3.
 * type-1 은 강조 한 쌍, type-2 는 두 쌍. 같은 컴포넌트에 highlights 개수만 다르게 넘긴다.
 */
import clsx from 'clsx';
import { Fragment, type ReactNode } from 'react';
import { GoogleLogo } from './Icon';

export interface PriceHighlight {
  strong: ReactNode;
  text: ReactNode;
}

interface PriceCardProps {
  title: ReactNode;
  highlights?: PriceHighlight[];
  specs: Array<{ label: ReactNode; value: ReactNode }>;
  price: ReactNode;
  logo?: ReactNode;
  logoLabel?: ReactNode;
  className?: string;
}

function LogoBox({ logo, label }: { logo?: ReactNode; label?: ReactNode }) {
  return (
    <div className="flex size-[120px] shrink-0 flex-col items-center justify-center gap-1 rounded-card bg-background-100 lg:size-[162px]">
      {logo ?? <GoogleLogo size={56} />}
      {label && <span className="text-center text-caption2 text-text-primary">{label}</span>}
    </div>
  );
}

export function PriceCard({ title, highlights = [], specs, price, logo, logoLabel = '구글 클라우드 플랫폼', className }: PriceCardProps) {
  return (
    <div className={clsx('flex flex-col gap-6 rounded-card sm:flex-row sm:items-stretch', className)}>
      <LogoBox logo={logo} label={logoLabel} />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-border-100 pb-4">
          <h3 className="text-title3 text-text-primary">{title}</h3>
          {highlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {highlights.map((h, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-caption2 text-brand">{h.strong}</span>
                  <span className="h-3 w-px bg-border-100" aria-hidden="true" />
                  <span className="text-body3 text-text-secondary">{h.text}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <dl className="grid grid-cols-[100px_1fr] gap-x-8 gap-y-2">
            {specs.map((s, i) => (
              <Fragment key={i}>
                <dt className="text-body3 text-text-secondary">{s.label}</dt>
                <dd className="text-caption2 text-text-primary">{s.value}</dd>
              </Fragment>
            ))}
          </dl>
          <div className="flex min-h-[54px] w-full items-center justify-center rounded-input bg-brand px-5 py-3 text-title3 text-text-inverse lg:w-[180px]">
            {price}
          </div>
        </div>
      </div>
    </div>
  );
}
