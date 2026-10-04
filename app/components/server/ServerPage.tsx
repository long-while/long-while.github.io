/**
 * 서버 커미션 (/server/) — 시안 '서버 커미션' (154:265, file.json 실측). 문구는 기존 사이트 그대로 (Q9).
 *  배너 600 (헤더가 위에 뜸, P1) → 80 → 섹션 간격 100: 서버비 미리보기 · 기본 옵션 · 테마 선택 · 추가 옵션 · 빠른마감 → 120 → 푸터. (공지·FAQ 는 4단계 사용자 요청으로 뺌)
 *  견적 담기·빼기·택1·검색 차단·수정 강조 동작은 기존 ServerCommission 과 같다 (로직 그대로 옮김).
 *  하단 고정 바: 견적이 있으면 StickyEstimateBar (P8, 이 페이지에서는 플로팅 버튼 숨김).
 */
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  InfoBox, OptionCard, PageHero, StickyEstimateBar, TitledSection, buttonClassName,
} from '@/app/components/ds';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { useEditTargetHighlight } from '@/app/hooks/useEditTargetHighlight';
import { IMAGES } from '@/app/constants/images';
import { SERVER_INFRA_FEE_ITEM } from '@/app/constants/form';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';
import { ServerCostPreview } from './ServerCostPreview';
import { ADDITIONAL_OPTIONS, INSTALL, RUSH_OPTIONS, SEARCH_ITEM_NAME, THEME_OPTIONS } from './serverContent';

interface ServerPageProps {
  onBack?: () => void;
  onNavigate: NavigateFunction;
}

const won = (n: number) => `₩${n.toLocaleString()}`;

type RushFit = (typeof RUSH_OPTIONS)[number]['fits'];

/** 견적함 '수정'으로 넘어왔을 때 잠시 표시하는 테두리 (기존과 같은 동작) */
const highlightRing = (on: boolean) => (on ? 'outline outline-[3px] outline-brand outline-offset-2' : '');

function useServerEstimate() {
  const { addItem, removeItem, items, serverCalcResult } = useEstimate();
  const has = (name: string) => items.some((item) => item.name === name);
  const searchBlocked = serverCalcResult?.type === 'vultr';

  // Vultr 판정으로 바뀌면 이미 담긴 검색 기능 항목을 제거해 견적과 정책을 일치시킨다.
  useEffect(() => {
    if (!searchBlocked) return;
    const searchItem = items.find((item) => item.name === SEARCH_ITEM_NAME);
    if (searchItem) removeItem(searchItem.id);
  }, [searchBlocked, items, removeItem]);

  // 서버비 미리보기의 '검색 기능 추가 여부'를 바꾸면 견적의 '검색 기능'도 같이 담기·빼기 (신청서 STEP2 와 같은 연결, 4단계 리뷰).
  // 페이지를 열 때 이미 정해져 있던 값으로는 건드리지 않고, 바뀔 때만 따라간다
  const calcSearch = serverCalcResult?.search ?? null;
  const shownCalcSearch = useRef(calcSearch);
  useEffect(() => {
    if (shownCalcSearch.current === calcSearch) return;
    shownCalcSearch.current = calcSearch;
    const searchItem = items.find((item) => item.name === SEARCH_ITEM_NAME);
    const option = ADDITIONAL_OPTIONS.find((o) => o.name === SEARCH_ITEM_NAME);
    if (calcSearch === 'yes' && !searchItem && !searchBlocked && option) {
      addItem({ name: option.name, price: option.price, category: 'server', description: option.description });
    } else if (calcSearch === 'no' && searchItem) {
      removeItem(searchItem.id);
    }
  }, [calcSearch, items, searchBlocked, addItem, removeItem]);
  const searchDecidedByCalc = calcSearch === 'yes' || calcSearch === 'no';

  const toggle = (name: string, price: number, description?: string) => {
    const existing = items.find((item) => item.name === name);
    if (existing) removeItem(existing.id);
    else addItem({ name, price, category: 'server', description });
  };

  // 빠른마감이 맞아야 하는 테마 종류: 테마 없음 none / 로고만 logo / 테마 커스텀 theme (신청서 마감 임박 규칙과 같다)
  const themeKind = (THEME_OPTIONS.find((o) => has(o.name))?.kind ?? 'none') as RushFit;
  const [rushNotice, setRushNotice] = useState<string | null>(null);

  const removeRush = (keep?: string) => {
    RUSH_OPTIONS.forEach((o) => {
      const existing = items.find((item) => item.name === o.estimateName);
      if (existing && o.estimateName !== keep) removeItem(existing.id);
    });
  };

  // 테마는 택1: 기존 테마를 모두 빼고, 같은 것을 다시 누르면 해제만. 새 테마에 맞지 않는 빠른마감은 함께 뺀다 (4단계 리뷰)
  const selectTheme = (name: string, price: number, description: string) => {
    const selected = THEME_OPTIONS.find((o) => has(o.name))?.name;
    THEME_OPTIONS.forEach((o) => {
      const existing = items.find((item) => item.name === o.name);
      if (existing) removeItem(existing.id);
    });
    const nextKind: RushFit = selected === name ? 'none' : THEME_OPTIONS.find((o) => o.name === name)?.kind ?? 'none';
    const misfit = RUSH_OPTIONS.find((o) => has(o.estimateName) && o.fits !== nextKind);
    if (misfit) {
      removeRush();
      setRushNotice(`테마 선택이 바뀌어 '${misfit.displayName}'을 견적에서 뺐어요. 아래에서 맞는 빠른마감을 다시 골라 주세요.`);
    }
    if (selected === name) return;
    addItem({ name, price, category: 'server', description });
  };

  // 빠른마감은 택1 (48시간·24시간을 함께 담지 않게, 4단계 리뷰). 같은 것을 다시 누르면 해제
  const selectRush = (option: (typeof RUSH_OPTIONS)[number]) => {
    setRushNotice(null);
    if (has(option.estimateName)) {
      removeRush();
      return;
    }
    removeRush();
    addItem({ name: option.estimateName, price: option.price, category: 'server' });
  };

  return { items, has, toggle, selectTheme, selectRush, themeKind, rushNotice, searchBlocked, searchDecidedByCalc };
}

function BaseOption({ est, highlighted, onNavigate }: { est: ReturnType<typeof useServerEstimate>; highlighted: string | null; onNavigate: NavigateFunction }) {
  const added = est.has(INSTALL.name);
  const bot = navLinkProps('bot', onNavigate);
  return (
    <TitledSection
      id="server-install-section"
      title="기본 옵션"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          {/* 금액은 버튼처럼 보이지 않게 상자 없이 글자로 (4단계 리뷰) */}
          <p className="flex min-h-[60px] items-center justify-center gap-2 text-title4 text-text-secondary sm:justify-end">
            합계 <span className="text-title3 text-brand">{won(INSTALL.price + SERVER_INFRA_FEE_ITEM.price)}</span>
          </p>
          <button
            type="button"
            data-option-name={INSTALL.name}
            onClick={() => est.toggle(INSTALL.name, INSTALL.price, INSTALL.description)}
            aria-pressed={added}
            className={clsx(buttonClassName({ variant: added ? 'outline' : 'primary', size: 'lgEmphasis' }), 'sm:w-[180px]', highlightRing(highlighted === INSTALL.name))}
          >
            {added ? '견적에서 제거' : '견적에 추가'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-title2 text-text-primary">{INSTALL.name}</h3>
              <p className="text-body2 text-text-secondary">{INSTALL.description}</p>
            </div>
            <span className="shrink-0 text-title3 text-brand">{won(INSTALL.price)}</span>
          </div>
          <div className="flex flex-col gap-2 rounded-input bg-background-100 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
            <div className="flex flex-col gap-2">
              <p className="flex flex-wrap gap-2 text-title4">
                <span className="text-brand">필수 포함</span>
                <span className="text-text-primary">{SERVER_INFRA_FEE_ITEM.name}</span>
              </p>
              <p className="text-body3 text-text-secondary lg:max-w-[473px]">{SERVER_INFRA_FEE_ITEM.description} 도메인은 커뮤 이름에 맞게 제가 사서 적용해 드려요. (장기 소규모 서버는 제외)</p>
            </div>
            <span className="shrink-0 text-title3 text-brand">{won(SERVER_INFRA_FEE_ITEM.price)}</span>
          </div>
        </div>
        <p className="text-body3 text-text-secondary">
          자동봇도 함께 필요하시다면{' '}
          <a {...bot} className="text-brand underline-offset-2 hover:underline">자동봇 커미션 페이지</a>
          를 확인해주세요.
        </p>
      </div>
    </TitledSection>
  );
}

function ThemeSection({ est, highlighted }: { est: ReturnType<typeof useServerEstimate>; highlighted: string | null }) {
  return (
    <TitledSection title="테마 선택">
      <InfoBox title="택1 옵션">
        <p>기본 트위터 테마를 쓰실 거면 고르지 않으셔도 돼요.</p>
      </InfoBox>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" role="radiogroup" aria-label="테마 선택">
        {THEME_OPTIONS.map((o) => (
          <OptionCard
            key={o.name} name="server-theme" value={o.name} checked={est.has(o.name)} data-option-name={o.name}
            // 다시 누르면 해제되도록 change 대신 click 으로 받는다 (택1 + 선택 해제, 기존 동작)
            onClick={() => est.selectTheme(o.name, o.price, o.description)} onChange={() => undefined}
            layout="responsive" title={o.name} description={o.description} price={won(o.price)} className={highlightRing(highlighted === o.name)}
          />
        ))}
      </div>
    </TitledSection>
  );
}

function AdditionalSection({ est, highlighted }: { est: ReturnType<typeof useServerEstimate>; highlighted: string | null }) {
  return (
    <TitledSection title="추가 옵션">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {ADDITIONAL_OPTIONS.map((o) => {
          const isSearch = o.name === SEARCH_ITEM_NAME;
          const blocked = isSearch && est.searchBlocked;
          // 계산기에서 검색 예/아니오를 정했으면 그 값을 따른다 (여기서 바꾸면 두 곳이 어긋나므로 잠금)
          const followsCalc = isSearch && !blocked && est.searchDecidedByCalc;
          return (
            <div key={o.name} className="flex flex-col gap-2">
              <OptionCard
                type="checkbox" checked={est.has(o.name)} disabled={blocked || followsCalc} data-option-name={o.name}
                onChange={() => !blocked && !followsCalc && est.toggle(o.name, o.price, o.description)}
                layout="responsive" title={o.name} description={o.description} price={won(o.price)} className={clsx('h-full', highlightRing(highlighted === o.name))}
              />
              {blocked && (
                <p className="text-body3 text-brand-700">
                  장기 소규모 서버는 검색을 넣을 수 없어요. 필요하시면 위에서 운영 기간을 12개월 미만으로 골라 주세요.
                </p>
              )}
              {followsCalc && (
                <p className="text-body3 text-text-secondary">위 서버비 미리보기에서 예/아니오로 바꿀 수 있어요.</p>
              )}
            </div>
          );
        })}
      </div>
    </TitledSection>
  );
}

function RushSection({ est, highlighted }: { est: ReturnType<typeof useServerEstimate>; highlighted: string | null }) {
  return (
    <TitledSection title="빠른마감 옵션">
      <InfoBox title="택1 옵션">
        <p>고르신 테마에 맞는 옵션만 선택할 수 있어요. 모든 빠른마감은 결제 요청 시각부터 계산해요.</p>
        <p>개장까지 48시간 이상 남은 시점에 문의하시면 추가금이 없어요. (옵션에 따라 다를 수 있음)</p>
      </InfoBox>
      {est.rushNotice && <p role="status" className="rounded-input bg-warning-50 px-5 py-4 text-body3 text-warning-700">{est.rushNotice}</p>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" role="radiogroup" aria-label="빠른마감 옵션">
        {RUSH_OPTIONS.map((o) => (
          <OptionCard
            key={o.estimateName} name="server-rush" value={o.estimateName} checked={est.has(o.estimateName)} data-option-name={o.estimateName}
            disabled={o.fits !== est.themeKind && !est.has(o.estimateName)}
            // 테마처럼 다시 누르면 해제되도록 click 으로 받는다
            onClick={() => est.selectRush(o)} onChange={() => undefined}
            layout="responsive" title={o.displayName} price={won(o.price)} className={highlightRing(highlighted === o.estimateName)}
          />
        ))}
      </div>
    </TitledSection>
  );
}

export default function ServerPage({ onNavigate }: ServerPageProps) {
  const est = useServerEstimate();
  const highlighted = useEditTargetHighlight();
  const total = est.items.reduce((sum, item) => sum + item.price, 0);
  const estimate = navLinkProps('estimate', onNavigate);
  return (
    <main id="main" tabIndex={-1} className="bg-background-white outline-none">
      <PageHero image={IMAGES.serverHero.src} srcSet={IMAGES.serverHero.srcSet} eyebrow="SERVICE" title="서버 설치 & 테마 커미션" />
      <div className="container-ds flex flex-col gap-20 pb-[120px] pt-10 lg:gap-[100px] lg:pt-20">
        <ServerCostPreview />
        <BaseOption est={est} highlighted={highlighted} onNavigate={onNavigate} />
        <ThemeSection est={est} highlighted={highlighted} />
        <AdditionalSection est={est} highlighted={highlighted} />
        <RushSection est={est} highlighted={highlighted} />
      </div>
      {est.items.length > 0 && (
        <StickyEstimateBar placement="sticky" message={`견적 확인 (${est.items.length}개)`} amount={won(total)} href={estimate.href} onClick={estimate.onClick} />
      )}
    </main>
  );
}
