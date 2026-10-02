/**
 * 서브페이지 본문용 블록 (file.json 실측, 서버·자동봇 커미션).
 *
 * TitledSection — 왼쪽 정렬 제목(headline1) + 설명(body1 #767676), 간격 12 → (32) → 내용 상자.
 *   내용 상자: 위쪽 #000 1px 선, 위아래 패딩 40, 안쪽 간격 28 (Frame 2095589800).
 * InfoBox — 안내 박스 Type-1/2 (Frame 2095589767): #F6F7F8, 모서리 12, 패딩 24, 간격 12.
 *   제목 줄: 원형 느낌표 30px(시안 #BFBFBF → Q15 text-disabled) + 제목 title5, 간격 4. 본문 body3 #767676 (문단 또는 목록).
 * NoticeBox — '공지' 강조 상자 (Frame 2095589798): #F1F6FD, 모서리 12, 패딩 28.
 * BulletList — 공지 목록: 점 6px #A6A6A6 + body1 #767676, 점·글 간격 8, 줄 간격 12.
 */
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface TitledSectionProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** 내용 상자 아래(밖)에 붙는 영역. 예: 기본 옵션의 가격·추가 버튼 */
  footer?: ReactNode;
  className?: string;
}

export function TitledSection({ id, title, description, children, footer, className }: TitledSectionProps) {
  return (
    <section id={id} className={clsx('scroll-mt-header flex flex-col gap-7', className)}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-headline1 text-text-primary">{title}</h2>
          {description && <div className="text-body1 text-text-secondary">{description}</div>}
        </div>
        <div className="flex flex-col gap-7 border-t border-border-strong py-6 lg:py-10">{children}</div>
      </div>
      {footer}
    </section>
  );
}

interface InfoBoxProps {
  title: ReactNode;
  /** Type-1: 문단 */
  children?: ReactNode;
  /** Type-2: 글머리표 목록 */
  items?: ReactNode[];
  className?: string;
}

export function InfoBox({ title, children, items, className }: InfoBoxProps) {
  return (
    <div className={clsx('flex flex-col gap-3 rounded-card bg-background-100 p-5 lg:p-6', className)}>
      <p className="flex items-center gap-1 text-title5 text-text-primary">
        <Icon name="info" className="shrink-0 text-text-disabled" />
        {title}
      </p>
      {children && <div className="flex flex-col gap-1 text-body3 text-text-secondary">{children}</div>}
      {items && (
        <ul className="flex flex-col gap-1 text-body3 text-text-secondary">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NoticeBox({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('flex flex-col gap-3 rounded-card bg-background-brand p-5 lg:p-7', className)}>{children}</div>;
}

export function BulletList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={clsx('flex flex-col gap-3', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-body1 text-text-secondary">
          <span className="mt-[10px] size-1.5 shrink-0 rounded-pill bg-text-disabled" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
