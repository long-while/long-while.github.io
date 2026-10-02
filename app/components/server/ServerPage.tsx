/**
 * 서버 커미션 (/server/) — 시안 '서버 커미션' (154:265, file.json 실측). 문구는 기존 사이트 그대로 (Q9).
 *  배너 600 (헤더가 위에 뜸, P1) → 80 → 섹션 간격 100: 서버비 미리보기 · 기본 옵션 · 테마 선택 · 추가 옵션 · 빠른마감 · 공지 · FAQ → 120 → 푸터.
 *  견적 담기·빼기·택1·검색 차단·수정 강조 동작은 기존 ServerCommission 과 같다 (로직 그대로 옮김).
 *  하단 고정 바: 견적이 있으면 StickyEstimateBar (P8, 이 페이지에서는 플로팅 버튼 숨김).
 */
import { useEffect } from 'react';
import clsx from 'clsx';
import {
  AccordionItem, BulletList, InfoBox, NoticeBox, OptionCard, PageHero, SectionTitle, StickyEstimateBar, TitledSection, buttonClassName,
} from '@/app/components/ds';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { useEditTargetHighlight } from '@/app/hooks/useEditTargetHighlight';
import { IMAGES } from '@/app/constants/images';
import { SERVER_INFRA_FEE_ITEM } from '@/app/constants/form';
import { navLinkProps } from '@/app/lib/navLink';
import { DEADLINE_BLACKOUT_LABEL } from '@/app/utils/orderUtils';
import type { NavigateFunction } from '@/app/types/navigation';
import { ServerCostPreview } from './ServerCostPreview';
import { ADDITIONAL_OPTIONS, INSTALL, RUSH_OPTIONS, SEARCH_ITEM_NAME, THEME_OPTIONS } from './serverContent';

interface ServerPageProps {
  onBack?: () => void;
  onNavigate: NavigateFunction;
}

const won = (n: number) => `₩${n.toLocaleString()}`;

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

  const toggle = (name: string, price: number, description?: string) => {
    const existing = items.find((item) => item.name === name);
    if (existing) removeItem(existing.id);
    else addItem({ name, price, category: 'server', description });
  };

  // 테마는 택1: 기존 테마를 모두 빼고, 같은 것을 다시 누르면 해제만
  const selectTheme = (name: string, price: number, description: string) => {
    const selected = THEME_OPTIONS.find((o) => has(o.name))?.name;
    THEME_OPTIONS.forEach((o) => {
      const existing = items.find((item) => item.name === o.name);
      if (existing) removeItem(existing.id);
    });
    if (selected === name) return;
    addItem({ name, price, category: 'server', description });
  };

  return { items, has, toggle, selectTheme, searchBlocked };
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
          <span className="flex min-h-[60px] items-center justify-center rounded-input bg-brand-100 px-5 text-title4 text-brand sm:w-[180px]">
            {won(INSTALL.price + SERVER_INFRA_FEE_ITEM.price)}
          </span>
          <button
            type="button"
            data-option-name={INSTALL.name}
            onClick={() => est.toggle(INSTALL.name, INSTALL.price, INSTALL.description)}
            aria-pressed={added}
            className={clsx(buttonClassName({ variant: added ? 'white' : 'primary', size: 'lg' }), 'rounded-input text-title4 sm:w-[180px]', highlightRing(highlighted === INSTALL.name))}
          >
            {added ? '견적에서 제거' : '견적에 추가'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className={clsx('flex flex-col gap-4', added && 'rounded-input')}>
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
              <p className="text-body3 text-text-secondary lg:max-w-[473px]">{SERVER_INFRA_FEE_ITEM.description} (장기 소규모 서버는 제외)</p>
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
        <p>아래 옵션 중 하나만 선택할 수 있습니다. 커스텀 없이 기본 트위터 테마를 원하시면 선택하지 않으셔도 됩니다.</p>
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
          const blocked = o.name === SEARCH_ITEM_NAME && est.searchBlocked;
          return (
            <div key={o.name} className="flex flex-col gap-2">
              <OptionCard
                type="checkbox" checked={est.has(o.name)} disabled={blocked} data-option-name={o.name}
                onChange={() => !blocked && est.toggle(o.name, o.price, o.description)}
                layout="responsive" title={o.name} description={o.description} price={won(o.price)} className={clsx('h-full', highlightRing(highlighted === o.name))}
              />
              {blocked && (
                <p className="text-body3 text-brand-700">
                  위 계산기에서 장기·소규모(Vultr) 서버로 판정되어 검색 기능을 추가할 수 없습니다. 검색이 필요하시면 운영 기간을 12개월 미만(GCP 사양)으로 선택해 주세요.
                </p>
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {RUSH_OPTIONS.map((o) => (
          <OptionCard
            key={o.estimateName} type="checkbox" checked={est.has(o.estimateName)} data-option-name={o.estimateName}
            onChange={() => est.toggle(o.estimateName, o.price)}
            layout="responsive" title={o.displayName} description={o.description} price={won(o.price)} className={highlightRing(highlighted === o.estimateName)}
          />
        ))}
      </div>
    </TitledSection>
  );
}

function NoticeSection() {
  return (
    <TitledSection title="공지">
      <NoticeBox>
        <p className="flex flex-wrap items-center gap-2 text-body1">
          <span className="text-text-secondary">기본 마감일</span>
          <span className="h-4 w-px bg-border-100" aria-hidden="true" />
          <span className="text-title4 text-brand">서버 개장 3~5일 전</span>
        </p>
      </NoticeBox>
      <BulletList
        items={[
          // 접수 불가 기간: 신청서 검증(orderUtils 의 getDeadlineBlackoutError)과 동일한 기간
          <span key="blackout" className="font-medium text-brand-700">{DEADLINE_BLACKOUT_LABEL} 은 마감이 불가능한 기간입니다. 해당 기간을 마감일로 신청하실 수 없어요.</span>,
          '개장으로부터 48시간 이상 남은 시점에 문의하실 경우 추가금 없음! (옵션에 따라 다를수도 있습니다)',
          '구글 클라우드 플랫폼의 가상 엔진을 사용하여 서버를 설치합니다.',
          '기본 옵션은 한참 인스턴스 마스토돈 + 트위터 UI 테마입니다.',
          '도메인(사이트명)의 경우, 커뮤니티명과 어울리는 도메인을 제가 구매해 적용해드립니다.',
          '서버 설치 커미션 신청 시, 첫 맛톤커 러너 분들을 위한 노션 가이드를 무료로 제공합니다. 합격자 가이드에 링크를 첨부하여 사용할 수 있습니다.',
        ]}
      />
    </TitledSection>
  );
}

function ServerFaq() {
  return (
    <section className="flex flex-col items-center gap-10">
      <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
      <div className="w-full border-t border-border-100">
        <AccordionItem
          index={1}
          defaultOpen
          question="TRPG 혹은 자관 역극용으로 장기 소규모 서버 설치가 가능할까요?"
          answer="네, 가능합니다. 서버에 가입된 계정의 수와 상관없이 평균 동시접속자가 10인 미만이라면 소규모 서버 설치가 가능해요. 서버비는 사양에 따라 8천원~3만원까지 상이하며, 매달 월초에 VM 대여 업체에 등록하신 결제 수단으로 자동 지불하시게 됩니다. (커미션주에게 내시는 게 아니에요!) 도메인과 서버를 포함하여 모든 정보와 데이터는 신청자님께 귀속되며, 커미션 진행을 돕도록 상세한 안내가 준비되어 있습니다. 만약 소규모 서버용 장기 자동봇을 가동하시게 된다면 동일한 VM에 세팅해드리므로 가동 주수에 따른 비용이 들지 않는 대신, 초기 세팅 비용이 1만원 청구됩니다."
        />
      </div>
    </section>
  );
}

export default function ServerPage({ onNavigate }: ServerPageProps) {
  const est = useServerEstimate();
  const highlighted = useEditTargetHighlight();
  const total = est.items.reduce((sum, item) => sum + item.price, 0);
  const estimate = navLinkProps('estimate', onNavigate);
  return (
    <main className="bg-background-white">
      <PageHero image={IMAGES.serverHero.src} eyebrow="SERVICE" title="서버 설치 & 테마 커미션" />
      <div className="container-ds flex flex-col gap-20 pb-[60px] pt-10 lg:gap-[100px] lg:pb-[120px] lg:pt-20">
        <ServerCostPreview />
        <BaseOption est={est} highlighted={highlighted} onNavigate={onNavigate} />
        <ThemeSection est={est} highlighted={highlighted} />
        <AdditionalSection est={est} highlighted={highlighted} />
        <RushSection est={est} highlighted={highlighted} />
        <NoticeSection />
        <ServerFaq />
      </div>
      {est.items.length > 0 && (
        <StickyEstimateBar placement="sticky" message={`견적 확인 (${est.items.length}개)`} amount={won(total)} href={estimate.href} onAmountClick={estimate.onClick} />
      )}
    </main>
  );
}
