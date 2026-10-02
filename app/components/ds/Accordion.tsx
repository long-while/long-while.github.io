/**
 * Accordion — 시안 '자주묻는질문' (default / active, file.json 실측).
 * 항목: 위아래 패딩 40(모바일 24), 아래 선 #DDDDDD. 질문 'Q1.'(#3376E7) + 질문(#000) title3, 간격 12.
 * 화살표 30px #A6A6A6, 열리면 위를 향함. 답변 상자: #F6F7F8, 모서리 12, 패딩 32·24, 'A1.' + 답변 title4 #767676.
 * 버튼(aria-expanded/aria-controls) + region 패턴. 닫힌 답변도 DOM 에 남겨 프리렌더 HTML 에 내용이 들어간다.
 */
import clsx from 'clsx';
import { useId, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { focusRing } from './shared';

interface AccordionItemProps {
  /** 'Q1.' 같은 번호 표시 */
  index?: number;
  question: ReactNode;
  answer: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  headingLevel?: 2 | 3 | 4;
}

export function AccordionItem({ index, question, answer, defaultOpen = false, open, onOpenChange, headingLevel = 3 }: AccordionItemProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = open ?? innerOpen;
  const baseId = useId();
  const buttonId = `acc-btn-${baseId}`;
  const panelId = `acc-panel-${baseId}`;
  const Heading = `h${headingLevel}` as const;

  const toggle = () => {
    setInnerOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  return (
    <div className="border-b border-border-100 py-6 lg:py-10">
      <Heading className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
          className={clsx('flex w-full items-center justify-between gap-4 text-left text-title3', focusRing)}
        >
          <span className="flex gap-3">
            {index !== undefined && <span className="shrink-0 text-brand">Q{index}.</span>}
            <span className="text-text-primary">{question}</span>
          </span>
          <Icon
            name="chevron-up"
            className={clsx('shrink-0 text-text-disabled transition-transform duration-200', !isOpen && 'rotate-180')}
          />
        </button>
      </Heading>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="mt-7">
        <div className="flex gap-3 rounded-card bg-background-100 px-6 py-8 text-title4">
          {index !== undefined && <span className="shrink-0 text-brand">A{index}.</span>}
          <div className="text-text-secondary">{answer}</div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
