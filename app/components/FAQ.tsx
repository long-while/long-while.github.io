import { useState, useMemo, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { ChevronDownIcon } from '@/app/components/icons';
import { CONTACT_URL } from '@/app/constants/seo';

/** FAQ 페이지에서 항목을 묶는 분류. 배열 순서대로 노출된다. */
export const FAQ_CATEGORIES = ['신청과 일정', '서비스 범위', '서버와 비용'] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export interface FaqItem {
  question: string;
  answer: string;
  /** 링크 등 마크업이 필요한 답변. 구조화 데이터에는 answer 문자열만 쓴다. */
  answerNode?: ReactNode;
  category: FaqCategory;
  /** 메인 페이지에 대표 질문으로 노출할지 여부 */
  featured?: boolean;
}

/**
 * FAQ 항목.
 * FAQ 페이지·메인 대표 질문 렌더링과 빌드 타임 FAQPage 구조화 데이터(scripts/prerender.mjs)
 * 양쪽에서 사용하므로 컴포넌트 밖에 두고 내보낸다. 구조화 데이터는 question/answer 문자열만 사용한다.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "신청서는 언제 접수해야 하나요?",
    category: "신청과 일정",
    featured: true,
    answer: "아무때나 접수해주시면 됩니다! 1년 후에 진행해야 하는 작업건이어도 신청서 내용이 준비되는 대로 보내주세요! 마감일 확인 후 결제 요청을 보내드릴 날짜를 말씀드리고, 적절한 일정에 맞추어 진행합니다. 결제 요청은 주로 마감일 3~7일 전으로 설정해두고 있어요."
  },
  {
    question: "자관 역극 혹은 TRPG 용으로 장기 소규모 서버 설치도 가능한가요?",
    category: "서비스 범위",
    featured: true,
    answer: "네, 가능합니다. 서버 설치 커미션 페이지를 참조해 주세요.",
    answerNode: (
      <>
        네, 가능합니다.{' '}
        <a href="/server/" className="text-[#ff7b00] font-semibold hover:underline">
          서버 설치 커미션 페이지
        </a>
        를 참조해 주세요.
      </>
    ),
  },
  {
    question: "마스토돈 가이드는 따로 신청해야 하나요? 비용이 있나요?",
    category: "서비스 범위",
    answer: "아니요. 마스토돈 가이드는 서버 설치 커미션을 신청하시면 무료로 제공됩니다. 별도로 신청하지 않으셔도 서버를 설치해드릴 때 노션 페이지 링크로 함께 전달드려요. 다만 가이드는 기본 트위터 블루 테마가 적용된 캡처 화면으로 제작되며, 각 서버의 테마가 적용된 가이드는 제공하지 않습니다."
  },
  {
    question: "신청 시점에 테마 이미지를 준비해야 할까요?",
    category: "신청과 일정",
    featured: true,
    answer: "아니요. 로고 변경 또는 테마 작업에 필요한 이미지 소스 목록은 신청서 접수 후에 전달드리며, 테마는 서버 설치 이후에도 추가 가능합니다."
  },
  {
    question: "디자인 커미션을 넣을 건데 마감일은 언제로 할까요?",
    category: "신청과 일정",
    answer: "서버 커미션 넣어주시면 제가 이미지 전달 마감일도 지정해서 보내드립니다."
  },
  {
    question: "테마 작업을 위해서는 어떤 이미지를 준비해야 하나요? / 규격은 어떻게 되나요?",
    category: "신청과 일정",
    answer: "필요한 이미지 목록은 신청서를 접수 후에 전달드립니다! 자세하고 상세하게 안내드리겠습니다."
  },
  {
    question: "자동봇/서버 사용이 어렵지는 않을까요?",
    category: "서비스 범위",
    featured: true,
    answer: "세팅해 드리는 자동봇 시트에 상세한 안내가 적혀 있습니다. 서버에 추가한 기능 또한 서버를 설치해드리며 안내해드리고 있어요."
  },
  {
    question: "장기 소규모 서버를 유지하고 싶어요. 서버비는 어떻게 되나요?",
    category: "서버와 비용",
    answer: "서버를 사용하는 인원수에 따라 달라지지만, 5인 미만의 장기 소규모 서버는 월 2만원 정도가 지출됩니다. 마스토돈은 중국집입니다. 중국집을 운영하기 위해서는 건물주에게 자리를 임대해야 하죠. 손님을 받을 곳이 필요하니까요. 우리는 건물주(업체)에게 임대료(서버비)를 지불하고 24시간 사용 가능한 방(서버 컴퓨터)을 한 자리 빌릴 겁니다. 보통은 3개월 무료 방을 주는 GCP라는 건물주에게 방을 한 자리 빌리는데, 장기커는 무료 이벤트는 없어도 대신 매달 임대료가 싼 곳을 쓰는 거죠."
  },
  {
    question: "중국집을 매달, 30일, 24시간 사용하지 않는데도 이만큼의 돈을 내야 해요?",
    category: "서버와 비용",
    answer: "네, 우리는 항상 한달분의 임대료를 내야 해요. 운영시간이 아닐 때도 계속 방을 빌리고 있는 건 마찬가지니까요."
  },
  {
    question: "그럼 서버비는 커미션주님께 내면 되나요?",
    category: "서버와 비용",
    answer: "저는 인테리어/시공 업체입니다. 제가 받는 건 시공료뿐이며, 임대료(서버비)는 제가 아니라 건물주에게 직접 결제하시게 됩니다."
  },
  {
    question: "masto.host로 설치해주실 수 있나요?",
    category: "서버와 비용",
    answer: "불가합니다. masto.host는 순정 마스토돈 설치만 지원합니다. 만약 장기 커뮤라서 GCP 서버비가 부담되신다면 가상 컴퓨터를 대여해주는 타 업체를 이용해 설치해드리게 됩니다. 위 답변 참고."
  },
  {
    question: "자동봇의 출력을 제가 직접 지정할 수 있나요?",
    category: "서비스 범위",
    answer: "커스텀 명령어가 아니라 시스템 봇이 처리하는 명령어인 경우, 사전 지정은 어렵습니다. 다만 테스트 기간 중 출력되는 문구를 확인하시고 '이 문구를 이런 식으로 변경해주실 수 있나요?' 식으로 예시 출력을 제공해주시면 최대한 반영하겠습니다."
  },
  {
    question: "서버에 렉이 걸려요. 왜 그런 건가요?",
    category: "서버와 비용",
    answer: "서버 비용과 성능은 비례합니다. 쉽게 말하면 원룸이랑 같아요. 월세 30만원짜리 5평 원룸에 5명이 사는 건 괜찮은데, 25명이 들어오면 움직이기 힘들잖아요. 서버도 똑같습니다. 저렴한 서버에 사람이 몰리면 느려질 수밖에 없어요. 20인 이상의 커뮤인데 스토리 진행 중에도 완전히 렉이 없는 서버를 원하시면 월 10만원 이상 나오게 됩니다. 비용을 줄였을 때 렉이 생기는 건 어쩔 수 없는 부분입니다."
  },
  {
    question: "기본 세팅 서버 사양은 어떻게 되나요?",
    category: "서버와 비용",
    answer: "서버 사용 기간과 인원수에 따라 달라집니다. 서버비와 사양 확인을 위해서는 서버 커미션 페이지를 방문해 주세요.",
    answerNode: (
      <>
        서버 사용 기간과 인원수에 따라 달라집니다. 서버비와 사양 확인을 위해서는{' '}
        <a href="/server/" className="text-[#ff7b00] font-semibold hover:underline">
          서버 커미션 페이지
        </a>
        를 방문해 주세요.
      </>
    ),
  },
  {
    question: "렉이 걸리면 어떻게 해야 하나요?",
    category: "서버와 비용",
    answer: "30인 이상, 3개월 이내의 커뮤니티이며 스토리 진행이 잦아서 렉이 걸리는 경우, 따로 문의하시면 서버 증설을 도와드립니다. 장기서버 유지를 위해 저렴한 서버를 선택하셨는데 렉이 발생하는 경우, 서버 예산을 올리시는 게 아니라면 제가 해드릴 수 있는 부분은 없습니다. 서버비는 곧 성능이기 때문에, 더 원활한 환경을 원하시면 서버 업그레이드를 고려해 주세요."
  }
];

/** 정규식 메타문자가 섞인 검색어(예: "(")로도 하이라이트가 깨지지 않게 이스케이프한다 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 검색어와 일치하는 구간을 표시한다 */
function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      : part
  );
}

interface FaqEntry {
  item: FaqItem;
  /** 화면에 표시되는 순번 (검색 결과에서도 유지된다) */
  number: number;
}

function FaqRow({ item, number, query }: FaqEntry & { query: string }) {
  return (
    <div className="pb-6 border-b border-border last:border-0 last:pb-0">
      <div className="max-w-4xl flex items-baseline gap-6">
        <div className="text-[12px] font-mono leading-normal text-[#ff7b00] shrink-0">
          {String(number).padStart(2, '0')}
        </div>
        <div>
          <h3 className="text-[18px] mb-2">
            {highlightText(item.question, query)}
          </h3>
          <p className="text-[16px] leading-[1.8] text-foreground/70">
            {item.answerNode ?? highlightText(item.answer, query)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 접었다 펴는 FAQ 항목.
 * Radix Accordion 대신 네이티브 <details> 를 쓰는 이유: 닫힌 상태에서도 답변 텍스트가
 * DOM 에 남아 있어야 빌드 타임 프리렌더 HTML 에 본문이 실린다 (검색 노출용).
 *
 * open 을 React 로 제어하지 않는다. React 는 사용자의 네이티브 토글을 추적하지 않아서,
 * 강제로 펼쳤다 놓으면 사용자가 직접 열어둔 항목까지 도로 접혀 버린다.
 * 검색 중에는 아예 펼쳐진 FaqRow 로 갈아끼운다(FAQ 컴포넌트의 Row 선택 참고).
 */
function FaqAccordionRow({ item, number, query }: FaqEntry & { query: string }) {
  return (
    <details className="group pb-6 border-b border-border last:border-0 last:pb-0">
      <summary className="max-w-4xl flex items-baseline gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-4 rounded">
        <span className="inline-block w-6 text-[12px] font-mono leading-normal text-[#ff7b00] shrink-0">
          {String(number).padStart(2, '0')}
        </span>
        <h3 className="text-[18px] flex-1 group-hover:text-[#ff7b00] transition-colors">
          {highlightText(item.question, query)}
        </h3>
        <ChevronDownIcon className="w-5 h-5 shrink-0 text-foreground/40 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="max-w-4xl flex gap-6 mt-3">
        <div className="w-6 shrink-0" aria-hidden="true" />
        <p className="text-[16px] leading-[1.8] text-foreground/70">
          {item.answerNode ?? highlightText(item.answer, query)}
        </p>
      </div>
    </details>
  );
}

function FaqSearchField({ value, onChange, resultCount }: {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}) {
  return (
    <div className="mb-8">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="질문 검색..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7b00] focus:ring-2 focus:ring-[#ff7b00]/20 transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      {value && (
        <p className="mt-2 text-[13px] text-foreground/60">
          {resultCount}개의 결과
        </p>
      )}
    </div>
  );
}

function FaqEmptyResult({ query }: { query: string }) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <p className="text-[16px] text-foreground/60 mb-2">
        "{query}"에 대한 검색 결과가 없습니다.
      </p>
      <p className="text-[14px] text-foreground/40">
        다른 키워드로 검색하거나{' '}
        <a
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ff7b00] hover:underline"
        >
          직접 문의
        </a>
        해 주세요.
      </p>
    </div>
  );
}

/** 분류 순서대로 정렬한 뒤 표시 순번을 매긴다 */
function buildEntries(items: FaqItem[], grouped: boolean): FaqEntry[] {
  const ordered = grouped
    ? FAQ_CATEGORIES.flatMap((category) => items.filter((item) => item.category === category))
    : items;
  return ordered.map((item, index) => ({ item, number: index + 1 }));
}

export interface FAQProps {
  /** 노출할 항목. 기본값은 전체 */
  items?: FaqItem[];
  /** 검색창 노출 여부 (메인의 대표 질문 4개에는 불필요) */
  showSearch?: boolean;
  /** 분류별 소제목으로 묶어서 보여줄지 여부 */
  grouped?: boolean;
  title?: string;
  /** FAQ 페이지에서는 h1 으로 렌더한다 */
  headingLevel?: 'h1' | 'h2';
  /** 답변을 접어 두고 클릭하면 펼친다 (항목이 많은 FAQ 페이지용) */
  collapsible?: boolean;
  /** 목록 아래에 붙일 영역 (예: 전체 FAQ 보기 링크) */
  footer?: ReactNode;
}

export default function FAQ({
  items = FAQ_ITEMS,
  showSearch = true,
  grouped = false,
  title = '자주 묻는 질문',
  headingLevel: Heading = 'h2',
  collapsible = false,
  footer,
}: FAQProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 중에는 결과가 바로 보이도록 아코디언을 쓰지 않고 펼쳐진 행으로 보여준다
  const isSearching = searchQuery.trim().length > 0;
  const Row = collapsible && !isSearching ? FaqAccordionRow : FaqRow;

  const entries = useMemo(() => buildEntries(items, grouped), [items, grouped]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return entries;

    return entries.filter(
      ({ item }) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  // 분류 모드에서는 소제목 단위로, 아니면 하나의 목록으로 렌더한다
  const sections = useMemo(() => {
    if (!grouped) return [{ title: null, entries: filtered }];

    return FAQ_CATEGORIES
      .map((category) => ({
        title: category,
        entries: filtered.filter(({ item }) => item.category === category),
      }))
      .filter((section) => section.entries.length > 0);
  }, [filtered, grouped]);

  return (
    <section>
      <div className="mb-10 border-b border-border pb-4">
        <Heading className="text-[29px] tracking-[-0.01em] font-semibold">
          {title}
        </Heading>
      </div>

      {showSearch && (
        <FaqSearchField
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filtered.length}
        />
      )}

      {filtered.length > 0 ? (
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title ?? 'all'}>
              {section.title && (
                <h2 className="text-[15px] font-mono text-[#ff7b00] mb-6">
                  {section.title}
                </h2>
              )}
              <div className="space-y-6">
                {section.entries.map((entry) => (
                  <Row key={entry.number} {...entry} query={searchQuery} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 검색 중이 아닌데 비었다면 보여줄 항목 자체가 없는 것이라 검색 안내를 띄우지 않는다
        isSearching ? <FaqEmptyResult query={searchQuery} /> : null
      )}

      {footer && <div className="mt-10">{footer}</div>}
    </section>
  );
}
