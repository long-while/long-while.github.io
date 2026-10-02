/**
 * STEP3 자동봇 화면 조각 — 시안 '신청서 - STEP03-편집상태' / '-아니오' (280:1868, 280:2850, file.json 실측).
 *  STEP 01 신청 여부 → 운영 기간 설정(카드 2개) → 메인 봇 종류(작은 카드) → 추가 기능 선택(2열 카드)
 *  → 봇 설정 정보 → STEP 03 기타 정보(2열). 카드는 ds OptionCard(row), 고른 카드 아래에 입력 상자(SubPanel)가 펼쳐진다.
 *  문구·동작은 기존 Step3Bot 그대로 (상태·규칙은 useStep3Bot).
 */
import type { ReactNode } from 'react';
import { FieldLabel, FormSection, Icon, OptionCard, Radio } from '@/app/components/ds';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { INPUT_LIMITS } from '@/app/types/order';
import { DEADLINE_BLACKOUT_LABEL } from '@/app/utils/orderUtils';
import { PRICING_CONFIG, ACCOUNT_LIST_CONFIG } from '@/app/constants/form';
import { FieldErrorText, FromCartBadge, Pill, SubPanel } from '../fields';
import { SLOTS_PER_TIER, formatManwon, normalizeMonthDayInput, type Step3State } from './useStep3Bot';

type S = { s: Step3State };

const won = (n: number) => `+${n.toLocaleString()}원`;

function CardTitle({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return <span className="flex flex-wrap items-center gap-2">{children}{badge}</span>;
}

export function ApplyBotQuestion({ s }: S) {
  const { step3, fromCart, handleBotApplyChange } = s;
  const anyFromCart = fromCart.basicBot || fromCart.basicShopBot || fromCart.basicShopStatBot || fromCart.cocBot || fromCart.trpg2d6Bot || fromCart.omakase || fromCart.investigation;
  return (
    <FormSection
      eyebrow="STEP 01"
      title={<>자동봇을 신청하시나요? <span className="text-brand" aria-hidden="true">*</span></>}
      titleAside={step3.applyBot === 'yes' && anyFromCart && <FromCartBadge />}
    >
      <FieldGroupError field="applyBot">
        <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="자동봇 신청 여부">
          <Radio id="applyBot" name="applyBot" label="예" checked={step3.applyBot === 'yes'} onChange={() => handleBotApplyChange('yes')} />
          <Radio name="applyBot" label="아니오" checked={step3.applyBot === 'no'} onChange={() => handleBotApplyChange('no')} />
        </div>
      </FieldGroupError>
    </FormSection>
  );
}

function BotPeriodInputs({ s }: S) {
  const { step3, updateStep3 } = s;
  const box = 'form-input max-w-28 text-center';
  return (
    <SubPanel>
      <p className="text-body3 text-text-secondary">
        기본적으로 합격자 발표일 ~ 폐장일을 기재해 주세요. 애프터 기간에도 자동봇 사용을 원하신다면 종료 일정을 늘리시거나, 이후 가동 기간을 추가하실 수 있습니다.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input type="text" inputMode="numeric" value={step3.botStartDate} placeholder="MM/DD" aria-label="가동 시작일" className={box}
          onChange={(e) => updateStep3({ botStartDate: normalizeMonthDayInput(e.target.value) })} />
        <span className="text-body2 text-text-secondary">~</span>
        <input type="text" inputMode="numeric" value={step3.botEndDate} placeholder="MM/DD" aria-label="가동 종료일" className={box}
          onChange={(e) => updateStep3({ botEndDate: normalizeMonthDayInput(e.target.value) })} />
        <span className="text-body2 text-text-primary">({step3.manualWeeks}주, {formatManwon(step3.manualWeeks * 5000)})</span>
      </div>
    </SubPanel>
  );
}

export function OperationSection({ s }: S) {
  const { step3, updateStep3 } = s;
  return (
    <FormSection title={<>운영 기간 설정 <span className="text-brand" aria-hidden="true">*</span></>}>
      <FieldGroupError field="operationWeeksOption">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6" role="radiogroup" aria-label="운영 기간">
          <OptionCard id="operationWeeksOption" name="operationWeeksOption" layout="row" checked={step3.operationWeeksOption === 'longterm'}
            onChange={() => updateStep3({ operationWeeksOption: 'longterm', manualWeeks: 0 })}
            title="6개월 이상 장기 소규모 서버를 위한 자동봇이에요." price="1만원"
            description={step3.operationWeeksOption === 'longterm' ? '자동봇이 마스토돈과 동일한 머신에 설치됩니다. 가동 주수에 따른 비용이 없는 대신, 초기 세팅 비용 1만원이 청구됩니다.' : undefined} />
          <OptionCard name="operationWeeksOption" layout="row" checked={step3.operationWeeksOption === 'manual'}
            onChange={() => updateStep3({ operationWeeksOption: 'manual' })}
            title="자캐 커뮤니티를 위한 자동봇이에요." price="주당 5천원" />
        </div>
        {step3.operationWeeksOption === 'manual' && <div className="mt-4"><BotPeriodInputs s={s} /></div>}
      </FieldGroupError>
    </FormSection>
  );
}

export function MainBotSection({ s }: S) {
  const { step3, updateStep3, fromCart, handleMainBotChange, basicBotBlockedByCoc, blockingTrpgBotNames } = s;
  // 같은 메인 봇을 다시 누르면 선택 해제 (기존 동작)
  const mainBotCard = (value: 'basic' | 'basicShop' | 'basicShopStat', title: string, price: string, badge: ReactNode, extra?: { id?: string; disabled?: boolean }) => (
    <OptionCard key={value} id={extra?.id} name="mainBot" layout="row" checked={step3.mainBot === value} disabled={extra?.disabled}
      onChange={() => handleMainBotChange(value)} onClick={() => { if (step3.mainBot === value) handleMainBotChange(null); }}
      title={<CardTitle badge={badge}>{title}</CardTitle>} price={price} />
  );
  return (
    <FormSection
      title={<>메인 봇 종류 <span className="text-brand" aria-hidden="true">*</span></>}
      description={<>
        기본 계열 봇은 중복 선택할 수 없으며, D100 타입과 2D6 3종세트 타입은 기본+상점 이상 봇과 함께 선택하거나 단독으로 신청할 수 있습니다.
        <br />
        <strong className="font-medium text-text-primary">기본 봇은 D100 타입, 2D6 3종세트 타입과 기능이 겹쳐 함께 선택할 수 없습니다.</strong>
      </>}
    >
      <FieldGroupError field="mainBot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mainBotCard('basic', '기본', '15,000원', <>
            {fromCart.basicBot && step3.mainBot === 'basic' && <FromCartBadge />}
            {basicBotBlockedByCoc && <Pill>{blockingTrpgBotNames}과 중복 불가</Pill>}
          </>, { id: 'mainBot', disabled: basicBotBlockedByCoc })}
          {mainBotCard('basicShop', '기본+상점', '35,000원', fromCart.basicShopBot && step3.mainBot === 'basicShop' && <FromCartBadge />)}
          {mainBotCard('basicShopStat', '기본+상점+스탯', '45,000원', fromCart.basicShopStatBot && step3.mainBot === 'basicShopStat' && <FromCartBadge />)}
          <OptionCard type="checkbox" layout="row" checked={step3.cocBot} onChange={(e) => updateStep3({ cocBot: e.target.checked })}
            title={<CardTitle badge={fromCart.cocBot && step3.cocBot && <FromCartBadge />}>D100 타입</CardTitle>} price={won(PRICING_CONFIG.bot.addons.cocBot)} />
          <OptionCard type="checkbox" layout="row" checked={step3.trpg2d6Bot} onChange={(e) => updateStep3({ trpg2d6Bot: e.target.checked })}
            title={<CardTitle badge={fromCart.trpg2d6Bot && step3.trpg2d6Bot && <FromCartBadge />}>2D6 3종세트 타입</CardTitle>} price={won(PRICING_CONFIG.bot.addons.trpg2d6Bot)} />
        </div>
        {/* TRPG 봇 선택 시 기본 봇 잠금 안내 */}
        {basicBotBlockedByCoc && (
          <p className="mt-4 rounded-input bg-background-brand px-5 py-4 text-body3 text-text-primary">
            {blockingTrpgBotNames}을 선택하셔서 <strong className="font-medium">기본 봇</strong>은 선택할 수 없습니다. 기능이 겹쳐 함께 신청하실 필요가 없어요.
            기본 봇 단독으로 신청하시려면 {blockingTrpgBotNames} 선택을 해제해 주세요. (기본+상점, 기본+상점+스탯은 함께 선택하실 수 있습니다.)
          </p>
        )}
      </FieldGroupError>
    </FormSection>
  );
}

function InvestigationAddon({ s }: S) {
  const { step3, updateStep3, fromCart, handleInvestigationBotChange } = s;
  return (
    <>
      <OptionCard type="checkbox" layout="row" checked={step3.investigationBot} onChange={(e) => handleInvestigationBotChange(e.target.checked)}
        title={<CardTitle badge={fromCart.investigation && step3.investigationBot && <FromCartBadge />}>조사 자동봇</CardTitle>}
        description="메인 봇(기본 / 기본+상점 / 기본+상점+스탯)과 함께 신청 시 추가 가능" price="+20,000원" />
      {/* 일일 조사 횟수 제한 (조사 자동봇 선택 시에만) */}
      {step3.investigationBot && (
        <SubPanel className="lg:col-span-2">
          <OptionCard type="checkbox" layout="row" checked={step3.investigationDailyLimit}
            onChange={(e) => {
              const checked = e.target.checked;
              updateStep3({ investigationDailyLimit: checked });
              if (!checked) updateStep3({ investigationDailyLimitCount: 0 });
            }}
            title="일일 조사 횟수 제한" description="[조사] 명령어 사용 시 1회 카운트" price="+5,000원" />
          {step3.investigationDailyLimit && (
            <div className="flex flex-col gap-3 md:w-[280px]">
              <FieldLabel htmlFor="investigationDailyLimitCount">일일 조사 횟수</FieldLabel>
              <input id="investigationDailyLimitCount" type="number" min="1" value={step3.investigationDailyLimitCount || ''}
                onChange={(e) => updateStep3({ investigationDailyLimitCount: parseInt(e.target.value) || 0 })} placeholder="예: 3" className="form-input" />
            </div>
          )}
        </SubPanel>
      )}
    </>
  );
}

function AccountRows({ s }: S) {
  const { step2, accounts, hasAdminAccount, updateAccountSlot, removeAccountSlot } = s;
  return (
    <div className="flex flex-col gap-2">
      {/* 총괄 계정 (자동 입력, 삭제 불가) */}
      {hasAdminAccount && (
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-body3 text-text-primary">총괄 계정</span>
          <input type="text" value={step2.adminAccountId.trim()} readOnly aria-label="총괄 계정 (자동 입력)" className="form-input flex-1 cursor-not-allowed" />
          <span className="w-9 shrink-0 text-center text-caption2 text-text-disabled">자동</span>
        </div>
      )}
      {/* 추가 계정 칸 */}
      {accounts.map((account, index) => {
        const slotNumber = hasAdminAccount ? index + 2 : index + 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-body3 text-text-primary">계정 {slotNumber}</span>
            <input type="text" value={account} maxLength={INPUT_LIMITS.accountList} onChange={(e) => updateAccountSlot(index, e.target.value)}
              placeholder="@NOTICE" aria-label={`계정 ${slotNumber}`} className="form-input flex-1" />
            <button type="button" onClick={() => removeAccountSlot(index)} aria-label={`계정 ${slotNumber} 삭제`}
              className="flex size-9 shrink-0 items-center justify-center rounded-button text-text-disabled hover:text-error-500 focus-visible:outline-2 focus-visible:outline-brand">
              <Icon name="close" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AccountTierActions({ s }: S) {
  const { canAddAccountSlot, canBuyAccountTier, addAccountSlot, buyAccountTier, accountTiers, canRefundAccountTier, refundAccountTier } = s;
  const outline = 'inline-flex min-h-11 items-center gap-1 rounded-button border border-brand px-4 text-body3 text-brand hover:bg-background-brand focus-visible:outline-2 focus-visible:outline-brand';
  return (
    <>
      <FieldGroupError field="extraAccountTiers">
        <div className="flex flex-wrap items-center gap-2">
          {canAddAccountSlot ? (
            <button type="button" onClick={addAccountSlot} className={outline}><Icon name="plus" /> 계정 추가</button>
          ) : canBuyAccountTier ? (
            <>
              <span className="text-body3 text-text-secondary">무료 칸을 모두 사용하셨어요.</span>
              <button type="button" onClick={buyAccountTier} className="inline-flex min-h-11 items-center gap-1 rounded-button bg-brand px-4 text-body3 text-text-inverse hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <Icon name="plus" /> 계정 {SLOTS_PER_TIER}칸 더 등록 (+{PRICING_CONFIG.bot.addons.extraAccountTier.toLocaleString()}원)
              </button>
            </>
          ) : (
            <span className="text-body3 text-text-secondary">최대 {ACCOUNT_LIST_CONFIG.maxTotalAccounts}개까지 등록하셨어요.</span>
          )}
        </div>
      </FieldGroupError>
      {/* 추가 구매 현황 */}
      {accountTiers > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-body3">
          <span className="text-brand">
            추가 계정 {accountTiers * SLOTS_PER_TIER}칸 구매됨 (+{(accountTiers * PRICING_CONFIG.bot.addons.extraAccountTier).toLocaleString()}원)
          </span>
          {canRefundAccountTier && (
            <button type="button" onClick={refundAccountTier} className="text-text-secondary underline hover:text-error-500">마지막 추가 구매 취소</button>
          )}
        </div>
      )}
    </>
  );
}

function AccountListPanel({ s }: S) {
  const { hasAdminAccount, isOverCapacity, totalRegistered, totalMaxAccounts } = s;
  return (
    <SubPanel className="lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-title5 text-text-primary">예약 툿 혹은 스토리 진행에 사용할 계정 목록</p>
        <span className={isOverCapacity ? 'text-body3 text-error-500' : 'text-body3 text-text-secondary'}>
          등록 {totalRegistered} / {totalMaxAccounts}개 (최대 {ACCOUNT_LIST_CONFIG.maxTotalAccounts}개)
        </span>
      </div>
      {isOverCapacity && (
        <p role="alert" className="rounded-input border border-error-500 bg-background-white p-3 text-body3 text-error-500">
          무료 등록 한도를 초과했어요. 추가 계정을 구매하거나 칸을 줄여 주세요.
        </p>
      )}
      <p className="text-body3 text-text-secondary">
        예약 툿을 발송해야 하거나 자동 스토리 진행에 참여하기를 원하는 계정의 희망 아이디를 모두 적어주세요.<br />
        마스토돈 개인 서버는 아이디 겹침을 고려하지 않으셔도 됩니다.<br />
        최대한 간결한 이름, 특히 전체 대문자로 통일하여 캐릭터 계정과 차이를 두는 것을 추천드립니다.
      </p>
      <p className="text-body3 text-text-secondary">
        {hasAdminAccount ? '총괄 계정을 포함해 기본 3개까지 무료로 등록할 수 있어요.' : '기본 3개까지 무료로 등록할 수 있어요.'} 더 필요하시면 {SLOTS_PER_TIER}칸당 +{PRICING_CONFIG.bot.addons.extraAccountTier.toLocaleString()}원으로 최대 {ACCOUNT_LIST_CONFIG.maxTotalAccounts}개까지 추가할 수 있습니다.
      </p>
      <FieldGroupError field="accountList"><AccountRows s={s} /></FieldGroupError>
      <AccountTierActions s={s} />
      <div className="flex flex-col gap-2 border-t border-border-100 pt-4 text-body3 text-text-primary">
        <p><span className="font-medium">Q.</span> 저희는 NPC 계정을 만들 거긴 한데, 얘는 예약 툿 굳이 안보내도 되고 스진에도 등장하지 않아요.<br /><span className="font-medium">A.</span> 빼고 적으시면 됩니다.</p>
        <p><span className="font-medium">Q.</span> 저희는 시스템 계정이 굳이 예약 툿을 안 보내도 돼요.<br /><span className="font-medium">A.</span> 빼고 적으시면 됩니다.</p>
      </div>
    </SubPanel>
  );
}

function AttendancePanel({ s }: S) {
  const { step3, updateStep3 } = s;
  const fieldAria = useFieldAria();
  return (
    <SubPanel className="lg:col-span-2">
      <div className="flex flex-col gap-3 md:w-[280px]">
        <FieldLabel htmlFor="attendanceCurrencyAmount">출석 시 받을 재화의 수</FieldLabel>
        <div>
          <input id="attendanceCurrencyAmount" {...fieldAria('attendanceCurrencyAmount')} type="number" min="1" step="1"
            value={step3.attendanceCurrencyAmount || ''} placeholder="예: 10" className="form-input"
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') { updateStep3({ attendanceCurrencyAmount: 0 }); return; }
              const parsed = parseInt(raw, 10);
              if (Number.isFinite(parsed) && parsed >= 0) updateStep3({ attendanceCurrencyAmount: parsed });
            }} />
          <FieldError field="attendanceCurrencyAmount" />
          <p className="mt-2 text-body3 text-text-secondary">정수만 입력해 주세요. 기본값은 10입니다.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <FieldLabel htmlFor="attendanceCommand">출석 기능으로 사용할 명령어</FieldLabel>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-title4 text-text-primary" aria-hidden="true">[</span>
            <input id="attendanceCommand" {...fieldAria('attendanceCommand')} type="text" placeholder="출석" className="form-input md:max-w-[200px]"
              value={(step3.attendanceCommand || '[출석]').replace(/^\[|\]$/g, '')}
              onChange={(e) => updateStep3({ attendanceCommand: `[${e.target.value.replace(/[[\]]/g, '').trim()}]` })}
              onBlur={() => {
                const inner = (step3.attendanceCommand || '').replace(/[[\]]/g, '').trim();
                updateStep3({ attendanceCommand: `[${inner || '출석'}]` });
              }} />
            <span className="text-title4 text-text-primary" aria-hidden="true">]</span>
          </div>
          <FieldError field="attendanceCommand" />
          <p className="mt-2 text-body3 text-text-secondary">예: 출석, 보고, 기상 — 항상 대괄호로 감싸 사용됩니다.</p>
        </div>
      </div>
    </SubPanel>
  );
}

function TransferPanel({ s }: S) {
  const { step3, updateStep3 } = s;
  const options = [
    { value: 'itemOnly' as const, label: '아이템만' },
    { value: 'currencyOnly' as const, label: '재화만' },
    { value: 'all' as const, label: '모두' },
  ];
  return (
    <SubPanel className="lg:col-span-2">
      <p className="text-title5 text-text-primary">양도 대상</p>
      <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="양도 대상">
        {options.map((o) => (
          <Radio key={o.value} name="transferOption" label={o.label} checked={step3.transferOption === o.value} onChange={() => updateStep3({ transferOption: o.value })} />
        ))}
      </div>
    </SubPanel>
  );
}

function OmakasePanel({ s }: S) {
  const { step3, updateStep3 } = s;
  const fieldAria = useFieldAria();
  return (
    <SubPanel className="lg:col-span-2">
      <FieldLabel htmlFor="omakaseDetails">오마카세 기능 상세 설명</FieldLabel>
      <p className="text-body3 text-text-secondary">
        구현을 원하는 시스템을 정리한 <span className="font-medium text-text-primary">외부 문서 링크</span>를 전달해 주세요.<br />
        (시스템 문서와는 별도의 문서여야 합니다)
      </p>
      <div className="flex flex-col gap-3 rounded-input bg-background-white p-4 text-body3 text-text-primary">
        <div>
          <p className="mb-1 font-medium">문서에 포함되어야 할 내용:</p>
          <ul className="list-inside list-disc space-y-1 text-text-secondary">
            <li>러너가 입력할 명령어 (예: [사용/사과])</li>
            <li>명령어 입력 후 봇이 처리할 내용</li>
            <li>러너에게 보여줄 결과 메시지</li>
          </ul>
        </div>
        <div className="border-t border-border-100 pt-3">
          <p className="mb-2 font-medium">작성 예시:</p>
          <div className="flex flex-col gap-2 rounded-button bg-background-100 p-3">
            <p className="font-medium">"[사용/아이템명] 명령어를 추가하고 싶어요!"</p>
            <p>→ 러너가 [사용/사과]를 입력하면</p>
            <p>→ 봇이 러너의 소지품에서 사과를 삭제하고, 체력을 +10 해준 뒤</p>
            <p>→ "사과를 사용했습니다! 체력이 +10 되었습니다." 라고 답변해 주세요.</p>
          </div>
        </div>
        <a href="https://stellar-ground-601.notion.site/310d06ebad99807a99d1fbf4e8fc9ace" target="_blank" rel="noopener noreferrer"
          className="self-start border-t border-border-100 pt-3 text-brand hover:underline">
          예시 오마카세 신청서 보기 →
        </a>
        <div className="flex flex-col gap-1 border-t border-border-100 pt-3 text-text-secondary">
          <p>군더더기 없이 깔끔한 언어로 작성해 주세요. 불필요한 부사와 형용사는 사용하지 않습니다.</p>
          <p>구현을 원하는 시스템만 작성해 주세요.</p>
          <p className="font-medium text-warning-700">오마카세 신청서를 한번에 이해하기 어려울 시, 신청이 거절될 수 있습니다.</p>
        </div>
      </div>
      <div>
        <textarea id="omakaseDetails" {...fieldAria('omakaseDetails')} value={step3.omakaseDetails} onChange={(e) => updateStep3({ omakaseDetails: e.target.value })}
          placeholder="외부 문서 링크를 입력해 주세요." rows={3} className="form-input resize-none" />
        <FieldError field="omakaseDetails" />
      </div>
    </SubPanel>
  );
}

function TootCurrencyAddon({ s }: S) {
  const { step3, updateStep3, fromCart } = s;
  return (
    <>
      <OptionCard type="checkbox" layout="row" checked={step3.tootCurrencyLink} onChange={(e) => updateStep3({ tootCurrencyLink: e.target.checked })}
        title={<CardTitle badge={fromCart.tootCurrency && step3.tootCurrencyLink && <FromCartBadge />}>툿-재화 연동</CardTitle>} price="+10,000원" />
      {step3.tootCurrencyLink && (
        <SubPanel className="lg:col-span-2">
          <FieldLabel htmlFor="tootPerCurrency">몇 툿당 소지금에 얼마가 추가되어야 하나요?</FieldLabel>
          <input id="tootPerCurrency" type="text" value={step3.tootPerCurrency} onChange={(e) => updateStep3({ tootPerCurrency: e.target.value })}
            placeholder="예: 50툿당 1갈레온" className="form-input" />
        </SubPanel>
      )}
    </>
  );
}

export function AddonSection({ s }: S) {
  const { step3, updateStep3, fromCart, canHaveInvestigationBot, showAccountList, showTransferFeature, showAttendanceSystem } = s;
  return (
    <FormSection title="추가 기능 선택">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {canHaveInvestigationBot && <InvestigationAddon s={s} />}
        <OptionCard type="checkbox" layout="row" checked={step3.customCommandUpgrade} onChange={(e) => updateStep3({ customCommandUpgrade: e.target.checked })}
          title={<CardTitle badge={fromCart.customCommandUpgrade && step3.customCommandUpgrade && <FromCartBadge />}>커스텀 명령어 업그레이드</CardTitle>}
          description="유저 이름/은는맞춤/문구 내 다이스 기능 추가" price="+5,000원" />
        <OptionCard type="checkbox" layout="row" checked={step3.reservationToot} onChange={(e) => s.handleReservationTootChange(e.target.checked)}
          title={<CardTitle badge={fromCart.reservation && step3.reservationToot && <FromCartBadge />}>예약 툿</CardTitle>} price="+5,000원" />
        <OptionCard type="checkbox" layout="row" checked={step3.autoProfileImage} onChange={(e) => s.handleAutoProfileImageChange(e.target.checked)}
          title={<CardTitle badge={fromCart.autoProfile && step3.autoProfileImage && <FromCartBadge />}>자동 스진</CardTitle>} price="+5,000원" />
        {/* 예약 툿 또는 자동 스진 선택 시 계정 목록 입력 */}
        {showAccountList && <AccountListPanel s={s} />}
        {showTransferFeature && <TootCurrencyAddon s={s} />}
        {showAttendanceSystem && (
          <>
            <OptionCard type="checkbox" layout="row" checked={step3.attendanceSystem} onChange={(e) => updateStep3({ attendanceSystem: e.target.checked })}
              title={<CardTitle badge={fromCart.attendance && step3.attendanceSystem && <FromCartBadge />}>출석 시스템</CardTitle>}
              description="매일 [출석] 혹은 지정한 명령어 사용 시 1회 출석, 운영진이 지정한 재화 획득" price="+10,000원" />
            {step3.attendanceSystem && <AttendancePanel s={s} />}
          </>
        )}
        {showTransferFeature && (
          <>
            <OptionCard type="checkbox" layout="row" checked={step3.transferFeature} onChange={(e) => updateStep3({ transferFeature: e.target.checked })}
              title={<CardTitle badge={fromCart.transfer && step3.transferFeature && <FromCartBadge />}>양도 기능</CardTitle>} price="+10,000원" />
            {step3.transferFeature && <TransferPanel s={s} />}
          </>
        )}
        <OptionCard type="checkbox" layout="row" checked={step3.omakaseBot} onChange={(e) => updateStep3({ omakaseBot: e.target.checked })}
          title={<CardTitle badge={fromCart.omakase && step3.omakaseBot && <FromCartBadge />}>오마카세 봇</CardTitle>}
          price={<span className="inline-flex items-center gap-1"><Icon name="warning" size={14} /> 가격 상이 (별도 협의)</span>} />
        {step3.omakaseBot && <OmakasePanel s={s} />}
      </div>
    </FormSection>
  );
}

export function BotSettingsSection({ s }: S) {
  const { step3, updateStep3, showCurrencyUnit, showStatList } = s;
  const fieldAria = useFieldAria();
  if (!showCurrencyUnit && !showStatList) return null;
  return (
    <FormSection title="봇 설정 정보">
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        {showCurrencyUnit && (
          <div className="flex flex-col gap-3">
            <FieldLabel htmlFor="currencyUnit" required>재화 단위</FieldLabel>
            <div>
              <input id="currencyUnit" {...fieldAria('currencyUnit')} type="text" value={step3.currencyUnit} onChange={(e) => updateStep3({ currencyUnit: e.target.value })}
                placeholder="예: 갈레온, 코인, 골드" className="form-input" />
              <FieldError field="currencyUnit" />
            </div>
          </div>
        )}
        {showStatList && (
          <div className="flex flex-col gap-3">
            <FieldLabel htmlFor="statList">스탯 목록</FieldLabel>
            <div>
              <input id="statList" {...fieldAria('statList')} type="text" value={step3.statList} onChange={(e) => updateStep3({ statList: e.target.value })}
                placeholder="예: 체력, 정신력, 행운" className="form-input" />
              <FieldError field="statList" />
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}

function AccountIdField({ id, label, value, placeholder, error, onChange }: {
  id: 'botAccountId' | 'investigationBotAccountId'; label: string; value: string; placeholder: string; error: { message: string } | null; onChange: (v: string) => void;
}) {
  const fieldAria = useFieldAria();
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor={id} required>{label}</FieldLabel>
      <div>
        <input id={id} {...fieldAria(id)} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          aria-invalid={error ? true : undefined} className="form-input" />
        {!error && <FieldError field={id} />}
        {error
          ? <FieldErrorText id={`${id}-error`} message={error.message} />
          : <p className="mt-2 text-body3 text-text-secondary">※ 3자 이상, admin·owner·moderator 는 사용할 수 없습니다.</p>}
      </div>
    </div>
  );
}

export function ExtraInfoSection({ s }: S) {
  const { step3, updateStep3, showMainBotAccount, showInvestigationBotAccount, primaryAccountLabel, botAccountIdError, investigationBotAccountIdError, setupDeadlineBlackoutError } = s;
  const fieldAria = useFieldAria();
  return (
    <FormSection eyebrow="STEP 03" title={<>기타 정보 <span className="text-brand" aria-hidden="true">*</span></>}>
      {showInvestigationBotAccount && (
        <div className="flex items-start gap-2 rounded-card border border-warning-200 bg-warning-50 p-5 text-body3 text-warning-700">
          <Icon name="warning" size={18} className="mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">메인 봇 / 조사 자동봇은 각각 별도의 계정으로 운영됩니다.</p>
            <p>어떤 계정이 어떤 봇으로 사용될지 구분되도록 아이디를 따로 입력해 주세요. (예: @BOT / @SEARCH)</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <FieldLabel htmlFor="botSymbol">봇 기호</FieldLabel>
          <div>
            <input id="botSymbol" {...fieldAria('botSymbol')} type="text" value={step3.botSymbol} onChange={(e) => updateStep3({ botSymbol: e.target.value })}
              placeholder="기본값: ✶" className="form-input" />
            <FieldError field="botSymbol" />
          </div>
        </div>
        {showMainBotAccount && (
          <AccountIdField id="botAccountId" label={`${primaryAccountLabel} ID`} value={step3.botAccountId} placeholder="@BOT" error={botAccountIdError}
            onChange={(v) => updateStep3({ botAccountId: v })} />
        )}
        {showMainBotAccount && showInvestigationBotAccount && (
          <AccountIdField id="investigationBotAccountId" label="조사 자동봇 계정 ID" value={step3.investigationBotAccountId} placeholder="@SEARCH"
            error={investigationBotAccountIdError} onChange={(v) => updateStep3({ investigationBotAccountId: v })} />
        )}
        <div className="flex flex-col gap-3">
          <FieldLabel htmlFor="setupDeadline">세팅 마감일</FieldLabel>
          <div>
            <input id="setupDeadline" {...fieldAria('setupDeadline')} type="text" value={step3.setupDeadline} onChange={(e) => updateStep3({ setupDeadline: e.target.value })}
              placeholder="MM/DD (예: 03/15)" aria-invalid={setupDeadlineBlackoutError ? true : undefined} className="form-input" />
            {!setupDeadlineBlackoutError && <FieldError field="setupDeadline" />}
            {setupDeadlineBlackoutError ? (
              <FieldErrorText id="setupDeadline-error" message={setupDeadlineBlackoutError.message} />
            ) : (
              <p className="mt-2 text-body3 text-text-secondary">
                ※ 월/일 형식으로 입력해 주세요. 오마카세 자동봇 기능 등의 테스트가 필요한 경우, 테스트 기간까지 고려해서 작성합니다.
                <br />
                <strong className="font-medium text-text-primary">{DEADLINE_BLACKOUT_LABEL} 은 마감이 불가능한 기간입니다.</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
}
