/**
 * 신청서 안에서 이용안내를 띄우는 모달 — 시안 '신청서 - STEP01-이용안내-팝업' (286:3751).
 * R6: 6개 항목을 한 번에 펼쳐 보여주는 방식은 그대로, 겉모양만 ds Modal(1320)로.
 *  항목 글은 이용안내 페이지와 같은 블록(TermsSectionText: '01. 견적비' → 본문 → 추가금 상자), 항목 간격 60.
 * 작성 중인 내용을 잃지 않도록 새 탭으로 내보내지 않고 같은 화면 위에 얹는다.
 * 위쪽 목차 이동은 주소의 해시를 바꾸지 않고 모달 안에서 스크롤만 한다(`/order/#refund` 처럼 주소가 바뀌지 않게).
 */
import type { MouseEvent } from 'react';
import { Button, Modal } from '@/app/components/ds';
import { TermsSectionText } from '@/app/components/terms/TermsBlocks';
import { TERMS_SECTIONS } from '@/app/components/terms/termsContent';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const anchorId = (id: string) => `terms-modal-${id}`;

function handleTocClick(event: MouseEvent<HTMLAnchorElement>) {
  // 새 탭으로 여는 조작은 브라우저에 맡긴다
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const id = event.currentTarget.getAttribute('href')?.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TermsModal({ open, onClose }: TermsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="이용안내"
      actions={
        <div className="flex justify-center">
          <Button size="lg" onClick={onClose} className="w-full sm:w-[220px]">확인했습니다</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-10 lg:gap-[60px]">
        <nav aria-label="이용안내 목차">
          <ol className="flex flex-wrap gap-2">
            {TERMS_SECTIONS.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${anchorId(section.id)}`}
                  onClick={handleTocClick}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-background-100 px-3 text-body3 text-text-primary hover:bg-background-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {String(index + 1).padStart(2, '0')}. {section.title}
                  {section.fee && <span className="text-brand">· 추가금</span>}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {TERMS_SECTIONS.map((section, index) => (
          <TermsSectionText key={section.id} id={anchorId(section.id)} section={section} index={index} headingLevel={3} />
        ))}
      </div>
    </Modal>
  );
}
