/**
 * 이용안내 (/terms/) — 시안 '이용안내-견적비 / 오류 유지보수 / 질문 / 테마 이미지 / 환불 / 빠른마감' (205:2935 등, file.json 실측).
 *  배너 600 (헤더가 위에 뜸, P1) → 100 → 밑줄형 탭(전체 폭, 아래 선 #DDDDDD, 탭 220×70, '추가금' 배지) → 40 →
 *  내용 줄 1320: 글 627 ↔ 그림 588×340(모서리 12), 양 끝 정렬·세로 가운데 → 120 → 푸터.
 *  글: '01. 견적비' title2 → 16 → 본문 body2 #767676 → 32 → 추가금 상자(#F1F6FD, 모서리 12, 패딩 24: '추가금' | 조건).
 *  탭 패널 6개를 모두 그려 두고 고르지 않은 것은 hidden (프리렌더 HTML 에 모든 항목이 들어가게). 그림은 고른 탭만 (R5).
 *  예전 목차 주소(/terms/#refund 등)로 들어오면 그 탭을 연다 (화면에 붙은 뒤 effect 에서만 주소를 읽음).
 */
import { useEffect, useState } from 'react';
import { PageHero, Tabs, tabId, tabPanelId } from '@/app/components/ds';
import { IMAGES } from '@/app/constants/images';
import { CONTACT_URL } from '@/app/constants/seo';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';
import { TERMS_SECTIONS, type TermsSection } from './termsContent';
import { TermsSectionText } from './TermsBlocks';

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

function TermsPanel({ section, index, active }: { section: TermsSection; index: number; active: boolean }) {
  const image = SECTION_IMAGES[section.id];
  return (
    <div role="tabpanel" id={tabPanelId(TAB_PREFIX, section.id)} aria-labelledby={tabId(TAB_PREFIX, section.id)} hidden={!active}
      className="container-ds">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        {/* 1320 안에서 글 627 · 그림 588. 그보다 좁은 PC 창(1024~1280)에서는 둘 다 비율대로 줄어 가로로 넘치지 않음 */}
        <TermsSectionText section={section} index={index} className="lg:min-w-0 lg:basis-[627px]" />
        {/* R5: 고른 탭의 그림만 받는다. width·height·비율을 지정해 그림이 오기 전에도 자리가 잡혀 레이아웃이 흔들리지 않음 */}
        {image && active && (
          <img src={image.src} width={image.width} height={image.height} alt="" loading="lazy"
            className="aspect-[588/340] w-full rounded-card object-cover lg:w-auto lg:min-w-0 lg:basis-[588px]" />
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
    <main id="main" tabIndex={-1} className="bg-background-white outline-none">
      <PageHero image={IMAGES.termsHero.src} srcSet={IMAGES.termsHero.srcSet} eyebrow="GUIDE" title="이용안내" />
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
