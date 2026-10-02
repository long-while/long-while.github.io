/**
 * FAQ (/faq/) — 시안 '자주묻는질문-신청과일정 / 서비스 범위 / 서버와 비용' (205:1228 등, file.json 실측). 문구는 기존 사이트 그대로 (Q9).
 *  배너 600 (헤더가 위에 뜸, P1) → 100 → 안내 문장 → 40 → 탭 상자 416×72 → 28 → 질문 목록(위 선 #DDDDDD) → 120 → 푸터.
 *  탭 = 분류 3개. 패널 3개를 모두 그려 두고 고르지 않은 것은 hidden (프리렌더 HTML 에 모든 답변이 들어가게).
 *  검색은 기존 기능 유지 (Q8): 모든 분류에서 찾고, 검색 중에는 탭 패널을 숨기고 결과를 펼쳐서 보여준다. 탭을 누르면 검색을 지운다.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { AccordionItem, Icon, PageHero, Tabs, tabId, tabPanelId } from '@/app/components/ds';
import { fieldBoxClassName } from '@/app/components/ds/TextField';
import { IMAGES } from '@/app/constants/images';
import { CONTACT_URL } from '@/app/constants/seo';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';
import { FAQ_CATEGORY_KEYS, FAQ_ITEMS } from './faqContent';
import { filterEntries, groupByCategory, splitByQuery, type FaqEntry } from './faqSearch';

interface FaqPageProps {
  onNavigate: NavigateFunction;
}

const TAB_PREFIX = 'faq';
const GROUPS = groupByCategory(FAQ_ITEMS);
const TAB_ITEMS = GROUPS.map((g) => ({ id: FAQ_CATEGORY_KEYS[g.category], label: g.category }));

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitByQuery(text, query).map((part, i) =>
        part.match ? <mark key={i} className="rounded-button bg-warning-200 px-0.5 text-inherit">{part.text}</mark> : part.text,
      )}
    </>
  );
}

function FaqList({ entries, query = '', open = false }: { entries: FaqEntry[]; query?: string; open?: boolean }) {
  return (
    <div className="w-full border-t border-border-100">
      {entries.map(({ item, number }) => (
        <AccordionItem
          key={`${open ? 'open' : 'closed'}-${item.question}`}
          index={number}
          defaultOpen={open}
          question={<Highlight text={item.question} query={query} />}
          answer={item.answerNode ?? <Highlight text={item.answer} query={query} />}
        />
      ))}
    </div>
  );
}

function SearchField({ value, onChange, resultCount }: { value: string; onChange: (v: string) => void; resultCount: number }) {
  return (
    <div className="flex w-full max-w-[416px] flex-col gap-2">
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" />
        <input type="text" placeholder="질문 검색..." aria-label="질문 검색" value={value} onChange={(e) => onChange(e.target.value)}
          className={fieldBoxClassName(false, { withIcons: true })} />
        {value && (
          <button type="button" onClick={() => onChange('')} aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-pill text-text-secondary hover:bg-background-200 focus-visible:outline-2 focus-visible:outline-brand">
            <Icon name="close" />
          </button>
        )}
      </div>
      {value && <p className="text-body3 text-text-secondary" aria-live="polite">{resultCount}개의 결과</p>}
    </div>
  );
}

function EmptyResult({ query }: { query: string }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-card border border-dashed border-border-100 bg-background-100 px-5 py-12 text-center">
      <p className="text-body2 text-text-secondary">"{query}"에 대한 검색 결과가 없습니다.</p>
      <p className="text-body3 text-text-disabled">
        다른 키워드로 검색하거나{' '}
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">직접 문의</a>
        해 주세요.
      </p>
    </div>
  );
}

function SearchResults({ query }: { query: string }) {
  const groups = GROUPS.map((g) => ({ ...g, entries: filterEntries(g.entries, query) })).filter((g) => g.entries.length > 0);
  if (groups.length === 0) return <EmptyResult query={query} />;
  return (
    <div className="flex w-full flex-col gap-12">
      {groups.map((g) => (
        <div key={g.category} className="flex flex-col gap-4">
          <h3 className="text-title5 text-brand">{g.category}</h3>
          <FaqList entries={g.entries} query={query} open />
        </div>
      ))}
    </div>
  );
}

function TabPanels({ active }: { active: string }) {
  return (
    <>
      {GROUPS.map((g) => {
        const id = FAQ_CATEGORY_KEYS[g.category];
        return (
          <div key={id} role="tabpanel" id={tabPanelId(TAB_PREFIX, id)} aria-labelledby={tabId(TAB_PREFIX, id)} hidden={id !== active} className="w-full">
            <FaqList entries={g.entries} />
          </div>
        );
      })}
    </>
  );
}

function RelatedLinks({ onNavigate }: FaqPageProps) {
  const links: { page: 'terms' | 'server' | 'bot'; label: ReactNode }[] = [
    { page: 'terms', label: '이용안내 보기 →' },
    { page: 'server', label: '서버 커미션 보기 →' },
    { page: 'bot', label: '자동봇 커미션 보기 →' },
  ];
  return (
    <nav aria-label="관련 페이지" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
      {links.map((l) => (
        <a key={l.page} {...navLinkProps(l.page, onNavigate)} className="text-body2 text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          {l.label}
        </a>
      ))}
    </nav>
  );
}

export default function FaqPage({ onNavigate }: FaqPageProps) {
  const [active, setActive] = useState(TAB_ITEMS[0].id);
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const resultCount = useMemo(() => filterEntries(GROUPS.flatMap((g) => g.entries), query).length, [query]);
  const selectTab = (id: string) => {
    setActive(id);
    setQuery('');
  };
  return (
    <main id="main" tabIndex={-1} className="bg-background-white outline-none">
      <PageHero
        image={IMAGES.faqHero.src} srcSet={IMAGES.faqHero.srcSet} eyebrow="FAQ" title="자주 묻는 질문" titleSize="hero-xl"
      />
      <div className="container-ds flex flex-col items-center gap-10 pb-[60px] pt-[60px] lg:pb-[120px] lg:pt-[100px]">
        {/* 히어로 제목과 같은 'FAQ / 자주 묻는 질문' 제목이 한 번 더 나와서 빼고 안내 문장만 (4단계 리뷰) */}
        <p className="text-center text-body1 text-text-secondary">
          찾는 내용이 없다면{' '}
          <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">크레페 DM</a>으로 문의해 주세요.
        </p>
        <div className="flex w-full flex-col items-center gap-7">
          <div className="flex w-full flex-col items-center gap-4">
            <Tabs items={TAB_ITEMS} value={active} onChange={selectTab} idPrefix={TAB_PREFIX} aria-label="질문 분류" />
            <SearchField value={query} onChange={setQuery} resultCount={resultCount} />
          </div>
          <TabPanels active={searching ? '' : active} />
          {searching && <SearchResults query={query} />}
        </div>
        <RelatedLinks onNavigate={onNavigate} />
      </div>
    </main>
  );
}
