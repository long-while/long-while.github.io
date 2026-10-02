/**
 * SectionTitle — 시안 'Section-title' (메인 SERVICE·POINT 등, file.json 실측).
 *  영문 소제목 Inter 500 20/30 대문자 #3376E7 → (간격 20) → 제목 headline1 #000 → (간격 12) → 설명 body1 #767676.
 *  가운데 정렬이 기본.
 */
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface SectionTitleProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function SectionTitle({ eyebrow, title, description, align = 'center', as: Heading = 'h2', className }: SectionTitleProps) {
  return (
    <div className={clsx('flex flex-col gap-4 lg:gap-5', align === 'center' ? 'items-center text-center' : 'items-start text-left', className)}>
      {eyebrow && <p className="font-inter text-eyebrow uppercase text-brand">{eyebrow}</p>}
      <div className="flex flex-col gap-3">
        <Heading className="text-headline1 text-text-primary">{title}</Heading>
        {description && <p className="text-body1 text-text-secondary">{description}</p>}
      </div>
    </div>
  );
}
