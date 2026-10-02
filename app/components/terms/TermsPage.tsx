/**
 * 이용안내 (/terms/) — 시안 '이용안내-견적비 / 오류 유지보수 / 질문 / 테마 이미지 / 환불 / 빠른마감' (205:2935 등, file.json 실측).
 *  배너 600 (헤더가 위에 뜸, P1) → 100 → 밑줄형 탭(전체 폭, 아래 선 #DDDDDD, 탭 220×70, '추가금' 배지) → 40 →
 *  내용 줄 1320: 글 627 ↔ 그림 588×340(모서리 12), 양 끝 정렬·세로 가운데 → 120 → 푸터.
 *  글: '01. 견적비' title2 → 16 → 본문 body2 #767676 → 32 → 추가금 상자(#F1F6FD, 모서리 12, 패딩 24: '추가금' | 조건).
 *  탭 패널 6개를 모두 그려 두고 고르지 않은 것은 hidden (프리렌더 HTML 에 모든 항목이 들어가게).
 *  예전 목차 주소(/terms/#refund 등)로 들어오면 그 탭을 연다 (화면에 붙은 뒤 effect 에서만 주소를 읽음).
 */
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { PageHero, Tabs, tabId, tabPanelId } from '@/app/components/ds';
import { IMAGES } from '@/app/constants/images';
import { CONTACT_URL } from '@/app/constants/seo';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';
import { FAST_DEADLINE_EXAMPLES, TERMS_SECTIONS, type TermsSection } from './termsContent';

interface TermsPageProps {
  onNavigate: NavigateFunction;
}

const TAB_PREFIX = 'terms';

const SECTION_IMAGES: Record<string, (typeof IMAGES)[keyof typeof IMAGES]> = {
  'estimate-fee': IMAGES.termsFee,
  maintenance: IMAGES.termsMaintenance,
  questions: IMAGES.termsQuestion,
  'theme-image': IMAGES.termsTheme,
  refund: IMAGES.termsRefund,
  'fast-deadline': IMAGES.termsFast,
};

const TAB_ITEMS = TERMS_SECTIONS.map((s) => ({ id: s.id, label: s.title, badge: s.fee ? '추가금' : undefined }));

function FeeBox({ fee }: { fee: string }) {
  return (
    <p className="flex flex-col gap-1 rounded-card bg-background-brand p-5 sm:flex-row sm:items-center sm:gap-3 lg:p-6">
      <span className="shrink-0 text-title5 text-brand">추가금</span>
      <span className="hidden h-4 w-px shrink-0 bg-border-100 sm:block" aria-hidden="true" />
      <span className="text-body2 text-text-secondary">{fee}</span>
    </p>
  );
}

/** 빠른마감 예시 (Frame 2095589889): 가운데 정렬 상자 2개, 간격 12, 패딩 24, 모서리 8. 추가금 O 는 파란 바탕·선·글자 */
function FastDeadlineExamples() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title5 text-text-primary">빠른마감 적용 예시</h3>
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

function TermsPanel({ section, index, active }: { section: TermsSection; index: number; active: boolean }) {
  const image = SECTION_IMAGES[section.id];
  return (
    <div role="tabpanel" id={tabPanelId(TAB_PREFIX, section.id)} aria-labelledby={tabId(TAB_PREFIX, section.id)} hidden={!active}
      className="container-ds">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex flex-col gap-8 lg:w-[627px] lg:shrink-0">
          <div className="flex flex-col gap-4">
            <h2 className="text-title2 text-text-primary">{String(index + 1).padStart(2, '0')}. {section.title}</h2>
            <p className="text-body2 text-text-secondary">{section.content}</p>
          </div>
          {section.fee && <FeeBox fee={section.fee} />}
          {section.hasExamples && <FastDeadlineExamples />}
        </div>
        {image && (
          <img src={image.src} width={image.width} height={image.height} alt="" loading="lazy"
            className="aspect-[588/340] w-full rounded-card object-cover lg:w-[588px] lg:shrink-0" />
        )}
      </div>
    </div>
  );
}

function RelatedLinks({ onNavigate }: TermsPageProps) {
  const link = 'text-body2 text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
  return (
    <nav aria-label="관련 페이지" className="container-ds flex flex-wrap justify-center gap-x-8 gap-y-3">
      <a {...navLinkProps('faq', onNavigate)} className={link}>자주 묻는 질문 보기 →</a>
      <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className={link}>크레페 DM 문의 →</a>
    </nav>
  );
}

export default function TermsPage({ onNavigate }: TermsPageProps) {
  const [active, setActive] = useState(TERMS_SECTIONS[0].id);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (TERMS_SECTIONS.some((s) => s.id === hash)) setActive(hash);
  }, []);

  return (
    <main className="bg-background-white">
      <PageHero image={IMAGES.termsHero.src} eyebrow="GUIDE" title="이용안내"
        description="커미션 진행에 적용되는 안내 사항입니다. 추가금이 발생하는 조건이 포함되어 있으니 신청 전에 한 번 읽어 주세요." />
      <div className="flex flex-col gap-10 pb-[60px] pt-[60px] lg:pb-[120px] lg:pt-[100px]">
        <Tabs items={TAB_ITEMS} value={active} onChange={setActive} variant="line" idPrefix={TAB_PREFIX} aria-label="이용안내 항목" />
        {TERMS_SECTIONS.map((section, index) => (
          <TermsPanel key={section.id} section={section} index={index} active={section.id === active} />
        ))}
        <RelatedLinks onNavigate={onNavigate} />
      </div>
    </main>
  );
}
