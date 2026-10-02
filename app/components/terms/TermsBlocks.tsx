/**
 * 이용안내 항목 글 블록 — 이용안내 페이지(탭)와 신청서 이용안내 모달(전체 펼침)이 같이 쓴다.
 *  '01. 견적비' title2 → 16 → 본문 body2 #767676 → 32 → 추가금 상자(#F1F6FD, 모서리 12, 패딩 24: '추가금' | 조건) → 빠른마감 예시.
 */
import clsx from 'clsx';
import { FAST_DEADLINE_EXAMPLES, type TermsSection } from './termsContent';

export function FeeBox({ fee }: { fee: string }) {
  return (
    <p className="flex flex-col gap-1 rounded-card bg-background-brand p-5 sm:flex-row sm:items-center sm:gap-3 lg:p-6">
      <span className="shrink-0 text-title5 text-brand">추가금</span>
      <span className="hidden h-4 w-px shrink-0 bg-border-100 sm:block" aria-hidden="true" />
      <span className="text-body2 text-text-secondary">{fee}</span>
    </p>
  );
}

/** 빠른마감 예시 (Frame 2095589889): 가운데 정렬 상자 2개, 간격 12, 패딩 24, 모서리 8. 추가금 O 는 파란 바탕·선·글자 */
export function FastDeadlineExamples({ headingLevel = 3 }: { headingLevel?: 3 | 4 }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className="flex flex-col gap-3">
      <Heading className="text-title5 text-text-primary">빠른마감 적용 예시</Heading>
      {FAST_DEADLINE_EXAMPLES.map((example) => (
        <div key={example.case}
          className={clsx('flex flex-col gap-3 rounded-input border p-5 text-center lg:p-6',
            example.isPositive ? 'border-border-100 bg-background-100 text-text-secondary' : 'border-brand bg-background-brand text-brand')}>
          <p className="text-body2">{example.case}</p>
          <p className="text-body2 font-medium">{example.result}</p>
        </div>
      ))}
    </div>
  );
}

interface TermsSectionTextProps {
  section: TermsSection;
  index: number;
  /** 모달 안에서는 '이용안내'(h2) 아래라 항목 제목이 h3 */
  headingLevel?: 2 | 3;
  id?: string;
  className?: string;
}

export function TermsSectionText({ section, index, headingLevel = 2, id, className }: TermsSectionTextProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div id={id} className={clsx('flex flex-col gap-8 scroll-mt-6', className)}>
      <div className="flex flex-col gap-4">
        <Heading className="text-title2 text-text-primary">{String(index + 1).padStart(2, '0')}. {section.title}</Heading>
        <p className="text-body2 text-text-secondary">{section.content}</p>
      </div>
      {section.fee && <FeeBox fee={section.fee} />}
      {section.hasExamples && <FastDeadlineExamples headingLevel={headingLevel === 2 ? 3 : 4} />}
    </div>
  );
}
