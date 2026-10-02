/**
 * 자동봇 커미션 (/bot/) — 시안 '자동봇 커미션' (183:760, file.json 실측). 문구는 기존 사이트 그대로 (Q9).
 *  배너 600 (헤더가 위에 뜸, P1) → 80 → 섹션 간격 100: 기본 안내 · 시트 미리보기 · 가동 기간 · 타입 비교 ·
 *  커스텀 명령어 · 타입 상세 · 추가 옵션 → 120 → 푸터.
 *  견적 담기·빼기·택1·충돌 토스트·선행 조건·수정 강조 동작은 기존 BotCommission 과 같다 (useBotEstimate).
 *  하단 고정 바: 견적이 있으면 StickyEstimateBar (P8, 이 페이지에서는 플로팅 버튼 숨김).
 */
import clsx from 'clsx';
import { BulletList, Icon, OptionCard, PageHero, StickyEstimateBar, TitledSection } from '@/app/components/ds';
import { useEditTargetHighlight } from '@/app/hooks/useEditTargetHighlight';
import { IMAGES } from '@/app/constants/images';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';
import { ADDITIONAL_OPTIONS, BOT_TYPES, OPERATION_FEE_PREFIX, OPERATION_NOTES, SHEET_LINKS, WEEKLY_FEE } from './botContent';
import { BotTypeCards } from './BotTypeCards';
import { CommandTable, CompareTable } from './BotTables';
import { useBotEstimate, type BotEstimate } from './useBotEstimate';
import { eulReul } from '@/app/utils/josa';

interface BotPageProps {
  onBack?: () => void;
  onNavigate: NavigateFunction;
}

const won = (n: number) => `₩${n.toLocaleString()}`;
const highlightRing = (on: boolean) => (on ? 'outline outline-[3px] outline-brand outline-offset-2' : '');

function WarningToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div role="alert" aria-live="polite"
      className="fixed right-4 top-below-header z-50 flex max-w-[calc(100%-32px)] items-start gap-3 rounded-button bg-warning-700 px-5 py-4 text-text-inverse shadow-modal animate-slideInRight sm:max-w-sm">
      <Icon name="warning" size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-body3 font-bold">선택할 수 없는 옵션이에요</p>
        <p className="mt-0.5 text-caption1">{message}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="알림 닫기"
        className="flex size-6 shrink-0 items-center justify-center text-text-inverse/80 hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-text-inverse">
        <Icon name="close" />
      </button>
    </div>
  );
}

function BasicInfo({ onNavigate }: { onNavigate: NavigateFunction }) {
  const server = navLinkProps('server', onNavigate);
  return (
    <TitledSection title="기본 안내">
      <BulletList
        items={[
          '마스토돈 자동봇 커미션입니다. 타입에 따라 가격이 달라집니다.',
          '타입 내에 기재되지 않은 기능도 대부분 구현할 수 있습니다.',
          '기본 개발 기간은 한달이며, 원하시는 일정과 구현 난이도에 따라 빠르게 마감할 수 있습니다.',
          <span key="rush"><span className="font-medium text-brand">48시간 내 마감 +200%, 일주일 내 마감 +100%</span> 추가금을 받습니다.</span>,
          '개발 중에 요청 기능이 늘어나거나 구현 방식이 변경될 경우 추가금이 발생하거나 마감일이 변경될 수 있습니다.',
          '봇 가동 중 사전에 발견하지 못한 오류가 발생할 경우 무료로 유지보수를 진행합니다.',
          <span key="server">서버 설치도 함께 필요하시다면{' '}
            <a {...server} className="text-brand underline-offset-2 hover:underline">서버 설치 커미션 페이지</a>를 확인해주세요.
          </span>,
        ]}
      />
    </TitledSection>
  );
}

/** 시트 미리보기 카드 (Group 1707481567): 245×244, #F4F6F9(Q15 → background-100), 모서리 16, 흰 원 95 + 그림 58, 이름 16/24 + '바로가기' 14/20 */
function SheetPreview() {
  return (
    <TitledSection title="자동봇 시트 미리보기">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
        {SHEET_LINKS.map((sheet) => (
          <li key={sheet.href}>
            <a href={sheet.href} target="_blank" rel="noopener noreferrer"
              className="group flex h-full flex-col items-center gap-5 rounded-[16px] bg-background-100 px-3 py-6 text-center transition-colors hover:bg-background-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:min-h-[244px] lg:gap-[26px] lg:pb-[44px] lg:pt-[35px]">
              <span className="flex size-[72px] items-center justify-center rounded-pill bg-background-white lg:size-[95px]" aria-hidden="true">
                <img src={sheet.image.src} width={sheet.image.width} height={sheet.image.height} alt="" loading="lazy" className="h-11 w-auto lg:h-[58px]" />
              </span>
              <span className="flex flex-col gap-2">
                <span className="text-body3 font-medium text-text-primary lg:text-body2">{sheet.title}</span>
                <span className="text-body3 font-medium text-brand underline underline-offset-2">바로가기</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </TitledSection>
  );
}

/** 가동 주수 줄 (Frame 1707484723): #F7F7FB(Q15 → background-100), 모서리 10, 패딩 32·24, 이름 title4 ↔ 금액 title3 #3376E7 + 카운터 */
function OperationWeeks({ est, highlighted }: { est: BotEstimate; highlighted: string | null }) {
  const weeks = est.operationWeeks;
  const stepBtn = 'flex size-9 items-center justify-center rounded-button text-text-disabled transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand';
  return (
    <TitledSection title="가동 기간에 따른 금액">
      <div className="flex flex-col gap-6">
        <BulletList items={OPERATION_NOTES} />
        <div data-option-name={OPERATION_FEE_PREFIX}
          className={clsx('flex flex-wrap items-center justify-between gap-4 rounded-card bg-background-100 px-5 py-6 lg:px-6 lg:py-8', highlightRing(!!highlighted?.startsWith(OPERATION_FEE_PREFIX)))}>
          <h3 className="text-title4 text-text-primary">가동 주수</h3>
          <div className="flex items-center gap-6">
            <span className="text-title3 text-brand">{won(weeks * WEEKLY_FEE)}</span>
            <div className="flex items-center">
              <button type="button" className={stepBtn} onClick={() => est.changeWeeks(Math.max(0, weeks - 1))} disabled={weeks === 0} aria-label="1주 감소">
                <Icon name="minus" />
              </button>
              <span className="w-[50px] text-center text-body2 font-medium text-text-primary" aria-live="polite">{weeks}주</span>
              <button type="button" className={stepBtn} onClick={() => est.changeWeeks(weeks + 1)} aria-label="1주 추가">
                <Icon name="plus" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TitledSection>
  );
}

function AdditionalOptions({ est, highlighted }: { est: BotEstimate; highlighted: string | null }) {
  return (
    <TitledSection title="추가 옵션">
      {/* PC 한 줄에 4개 (3단계 사용자 요청) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ADDITIONAL_OPTIONS.map((option) => {
          const { selected, disabled, requiresLabel } = est.optionState(option);
          return (
            // 선행 조건이 없으면 input 이 꺼져 있어 change 가 오지 않는다. 눌렀을 때 이유를 토스트로 알리려고 감싼 쪽에서 click 을 받는다.
            <div key={option.name} className="flex flex-col gap-2" onClick={() => disabled && est.toggleOption(option)}>
              <OptionCard
                type="checkbox" checked={selected} disabled={disabled} onChange={() => est.toggleOption(option)}
                data-option-name={option.name} data-option-aliases={option.aliases?.join('|')}
                aria-label={disabled ? `${option.label ?? option.name} — ${requiresLabel} 선택 필요` : undefined}
                layout="responsive" title={option.label ?? option.name} description={option.description}
                price={option.priceLabel ?? (option.price === 0 ? '협의' : won(option.price))}
                className={clsx('h-full', highlightRing(highlighted === option.name))}
              />
              {disabled && <p className="text-body3 text-text-secondary">* {requiresLabel}{eulReul(requiresLabel)} 먼저 선택해 주세요.</p>}
            </div>
          );
        })}
      </div>
    </TitledSection>
  );
}

export default function BotPage({ onNavigate }: BotPageProps) {
  const est = useBotEstimate();
  const highlighted = useEditTargetHighlight();
  const total = est.items.reduce((sum, item) => sum + item.price, 0);
  const estimate = navLinkProps('estimate', onNavigate);
  return (
    <main className="bg-background-white">
      {est.toastMessage && <WarningToast message={est.toastMessage} onClose={() => est.setToastMessage(null)} />}
      <PageHero image={IMAGES.botHero.src} eyebrow="SERVICE" title="자동봇 커미션" />
      <div className="container-ds flex flex-col gap-20 pb-[60px] pt-10 lg:gap-[100px] lg:pb-[120px] lg:pt-20">
        <BasicInfo onNavigate={onNavigate} />
        <SheetPreview />
        <OperationWeeks est={est} highlighted={highlighted} />
        <TitledSection title="봇 타입 비교"><CompareTable /></TitledSection>
        <TitledSection title="커스텀 명령어 업그레이드란?"><CommandTable /></TitledSection>
        <TitledSection title="봇 타입 상세">
          <p className="text-body3 text-text-secondary">
            * 기본 / 기본&상점 / 기본&상점&스탯 타입은 서로 포함 관계이므로 <span className="font-semibold text-text-primary">하나만</span> 선택할 수 있어요.
          </p>
          <BotTypeCards types={BOT_TYPES} est={est} highlighted={highlighted} />
        </TitledSection>
        <AdditionalOptions est={est} highlighted={highlighted} />
      </div>
      {est.items.length > 0 && (
        <StickyEstimateBar placement="sticky" message={`견적 확인 (${est.items.length}개)`} amount={won(total)} href={estimate.href} onAmountClick={estimate.onClick} />
      )}
    </main>
  );
}
