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

interface FormSectionProps {
  /** 'STEP 01' 같은 작은 파란 소제목 */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** 제목 옆 보조 표시 (예: 필수 *, 견적에서 선택됨) */
  titleAside?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * FormSection — 신청서 단계 안의 묶음 (시안 신청서 'Frame 2095589955' 등, file.json 실측).
 *  소제목 body2 #3376E7 → 8 → 제목 headline2(24/36 Bold) → 24 → 내용. 묶음 사이 간격은 쓰는 쪽(70).
 */
export function FormSection({ eyebrow, title, titleAside, description, children, id, className }: FormSectionProps) {
  return (
    <section id={id} className={clsx('flex scroll-mt-header flex-col gap-5 lg:gap-6', className)}>
      <div className="flex flex-col gap-2">
        {eyebrow && <p className="text-body2 text-brand">{eyebrow}</p>}
        <h3 className="flex flex-wrap items-center gap-2 text-headline2 text-text-primary">
          {title}
          {titleAside}
        </h3>
        {description && <div className="text-body3 text-text-secondary">{description}</div>}
      </div>
      {children}
    </section>
  );
}

interface SelectionSummaryProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** 제목 오른쪽 작은 안내 (예: ※ 견적에서 선택됨) */
  note?: ReactNode;
  rows: { label: ReactNode; value: ReactNode }[];
  total?: { label: ReactNode; amount: ReactNode };
  editLabel?: string;
  onEdit: () => void;
  /** 펼쳐질 영역 id (수정 버튼의 aria-controls) */
  controls?: string;
}

/**
 * SelectionSummary — 신청서 STEP2·3 요약 상태 (시안 '신청서 - STEP02-요약 상태' 269:6009, 'STEP03-요약 상태' 315:2488).
 *  소제목·제목(headline2) ↔ 검정 '수정' 버튼(모서리 4) → 24 → 회색 상자(#F6F7F8, 모서리 12, 패딩 24): 항목 body3 #767676 ↔ 값 body3 #000, 줄 간격 8
 *  → 12 → 합계 상자(흰 바탕, #DDDDDD 선, 모서리 12, 패딩 28·24): 라벨 title5 ↔ 금액 title3 #3376E7.
 */
export function SelectionSummary({ eyebrow, title, note, rows, total, editLabel = '수정', onEdit, controls }: SelectionSummaryProps) {
  return (
    <section className="flex flex-col gap-5 lg:gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          {eyebrow && <p className="text-body2 text-brand">{eyebrow}</p>}
          <h3 className="text-headline2 text-text-primary">{title}</h3>
          {note && <p className="text-body3 text-text-secondary">{note}</p>}
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-expanded={false}
          aria-controls={controls}
          className="min-h-11 shrink-0 rounded-button bg-background-inverse px-5 text-body3 text-text-inverse hover:bg-background-inverse-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {editLabel}
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <dl className="flex flex-col gap-2 rounded-card bg-background-100 p-5 lg:p-6">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <dt className="shrink-0 text-body3 text-text-secondary">{row.label}</dt>
              <dd className="text-body3 font-medium text-text-primary sm:text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
        {total && (
          <div className="flex items-center justify-between gap-4 rounded-card border border-border-100 bg-background-white px-5 py-6 lg:px-6 lg:py-7">
            <span className="text-title5 text-text-primary">{total.label}</span>
            <span className="text-title3 text-brand">{total.amount}</span>
          </div>
        )}
      </div>
    </section>
  );
}

interface ReviewSectionProps {
  title: ReactNode;
  rows: { label: ReactNode; value: ReactNode }[];
  editLabel?: string;
  onEdit?: () => void;
  children?: ReactNode;
}

/**
 * ReviewSection — 신청서 STEP4 확인 묶음 (시안 '신청서 - STEP04' 286:2988, file.json 실측).
 *  제목 headline2 ↔ 검정 '수정' 버튼(모서리 4) → 아래 #000 1px 선 → 줄(이름 body3 #767676 150px ↔ 값 body3 #000), 줄 간격 16.
 */
export function ReviewSection({ title, rows, editLabel = '수정', onEdit, children }: ReviewSectionProps) {
  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border-strong pb-4 lg:pb-5">
        <h3 className="text-headline2 text-text-primary">{title}</h3>
        {onEdit && (
          <button type="button" onClick={onEdit}
            className="min-h-11 shrink-0 rounded-button bg-background-inverse px-5 text-body3 text-text-inverse hover:bg-background-inverse-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            {editLabel}
          </button>
        )}
      </div>
      <dl className="flex flex-col gap-3 pt-5 lg:gap-4 lg:pt-6">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-0.5 sm:flex-row sm:gap-6">
            <dt className="shrink-0 text-body3 text-text-secondary sm:w-[150px]">{row.label}</dt>
            <dd className="min-w-0 break-words text-body3 font-medium text-text-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
      {children}
    </section>
  );
}
