/**
 * STEP3 추가 기능 — 고르는 곳과 입력하는 곳을 나눈다 (사용자 요청: 고르면 가로 전체 회색 상자가 카드 사이에 끼어 복잡했다).
 *  추가 기능 선택: 자동봇 페이지와 같은 묶음(공통 / 상점 이상 전용 / 자동조사 / 기타), PC 한 줄 3칸 카드(가격은 이름 아래). 카드 위치는 고르는 동안 움직이지 않는다.
 *   아직 고를 수 없는 카드는 숨기지 않고 흐리게 둔다 (순서가 바뀌지 않게).
 *  선택한 기능 설정: 고른 기능의 입력만 모은다. 작은 입력은 PC 3칸, 계정 목록·오마카세만 가로 전체.
 * 선택 규칙·초기화·검사는 useStep3Bot 그대로.
 */
import { useState, type ReactNode } from 'react';
import { FieldLabel, FormSection, Icon, OptionCard, Radio } from '@/app/components/ds';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { INPUT_LIMITS } from '@/app/types/order';
import { PRICING_CONFIG, ACCOUNT_LIST_CONFIG } from '@/app/constants/form';
import { OMAKASE_FORM_URL } from '@/app/components/bot/botContent';
import { FromCartBadge } from '../fields';
import { CardTitle } from './Step3Sections';
import { SLOTS_PER_TIER, type Step3State } from './useStep3Bot';
import { atInputProps, bracketInputProps } from '../fixedAffix';
import { ConfirmDialog } from '../ConfirmDialog';

type S = { s: Step3State };

const A = PRICING_CONFIG.bot.addons;
const won = (n: number) => `+${n.toLocaleString()}원`;
const cardGrid = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4';

function AddonGroup({ title, note, children }: { title: string; note?: string | false; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex flex-wrap items-baseline gap-x-2 text-title5 text-text-secondary">
        {title}
        {note && <span className="text-body3 text-text-disabled">{note}</span>}
      </h3>
      <div className={cardGrid}>{children}</div>
    </div>
  );
}

interface AddonCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  badge?: ReactNode;
  price: ReactNode;
  disabled?: boolean;
}

function AddonCard({ checked, onChange, title, badge, price, disabled }: AddonCardProps) {
  return (
    <OptionCard type="checkbox" layout="compact" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)}
      title={<CardTitle badge={badge}>{title}</CardTitle>} price={price} />
  );
}

function CommonAddons({ s }: S) {
  const { step3, updateStep3, fromCart } = s;
  return (
    <AddonGroup title="기본 / 기본&상점 / 기본&상점&스탯 공통">
      <AddonCard checked={step3.customCommandUpgrade} onChange={(v) => updateStep3({ customCommandUpgrade: v })} title="키워드 답변에 이름 · 주사위 넣기"
        badge={fromCart.customCommandUpgrade && step3.customCommandUpgrade && <FromCartBadge />} price={won(A.customCommandUpgrade)} />
      <AddonCard checked={step3.keywordReplyImage} onChange={(v) => updateStep3({ keywordReplyImage: v })} title="키워드 답변 시 이미지 전송"
        badge={fromCart.keywordReplyImage && step3.keywordReplyImage && <FromCartBadge />} price={won(A.keywordReplyImage)} />
      <AddonCard checked={step3.reservationToot} onChange={s.handleReservationTootChange} title="예약 툿"
        badge={fromCart.reservation && step3.reservationToot && <FromCartBadge />} price={won(A.reservationToot)} />
      <AddonCard checked={step3.autoProfileImage} onChange={s.handleAutoProfileImageChange} title="스토리 자동 진행"
        badge={fromCart.autoProfile && step3.autoProfileImage && <FromCartBadge />} price={won(A.autoProfileImage)} />
    </AddonGroup>
  );
}

function ShopAddons({ s }: S) {
  const { step3, updateStep3, fromCart, showTransferFeature: shop } = s;
  return (
    <AddonGroup title="기본&상점 이상 전용" note={!shop && '기본&상점 또는 기본&상점&스탯을 고르면 선택할 수 있어요.'}>
      <AddonCard disabled={!shop} checked={step3.tootCurrencyLink} onChange={(v) => updateStep3({ tootCurrencyLink: v })} title="툿수-재화 자동반영"
        badge={fromCart.tootCurrency && step3.tootCurrencyLink && <FromCartBadge />} price={won(A.tootCurrencyLink)} />
      <AddonCard disabled={!shop} checked={step3.attendanceSystem} onChange={(v) => updateStep3({ attendanceSystem: v })} title="출석 시스템"
        badge={fromCart.attendance && step3.attendanceSystem && <FromCartBadge />} price={won(A.attendanceSystem)} />
      <AddonCard disabled={!shop} checked={step3.randomBox} onChange={(v) => updateStep3({ randomBox: v })} title="랜덤박스 기능"
        badge={fromCart.randomBox && step3.randomBox && <FromCartBadge />} price={won(A.randomBox)} />
      <AddonCard disabled={!shop} checked={step3.transferFeature} onChange={(v) => updateStep3({ transferFeature: v })} title="재화, 아이템 양도 기능"
        badge={fromCart.transfer && step3.transferFeature && <FromCartBadge />} price={won(A.transferFeature)} />
    </AddonGroup>
  );
}

function InvestigationAddons({ s }: S) {
  const { step3, updateStep3, fromCart, canHaveInvestigationBot, handleInvestigationBotChange } = s;
  return (
    <AddonGroup title="자동조사" note={!canHaveInvestigationBot && '메인 봇을 먼저 골라 주세요.'}>
      <AddonCard disabled={!canHaveInvestigationBot} checked={step3.investigationBot} onChange={handleInvestigationBotChange} title="조사 자동봇"
        badge={fromCart.investigation && step3.investigationBot && <FromCartBadge />} price={won(A.investigationBot)} />
      <AddonCard disabled={!step3.investigationBot} checked={step3.investigationDailyLimit} title="일일 조사 횟수 제한" price={won(A.investigationDailyLimit)}
        onChange={(v) => updateStep3(v ? { investigationDailyLimit: true } : { investigationDailyLimit: false, investigationDailyLimitCount: 0 })} />
    </AddonGroup>
  );
}

function AddonCards({ s }: S) {
  const { step3, updateStep3, fromCart } = s;
  return (
    <FormSection title="추가 기능 선택">
      <div className="flex flex-col gap-8">
        <CommonAddons s={s} />
        <ShopAddons s={s} />
        <InvestigationAddons s={s} />
        <AddonGroup title="기타">
          <AddonCard checked={step3.omakaseBot} onChange={(v) => updateStep3({ omakaseBot: v })} title="오마카세 봇"
            badge={fromCart.omakase && step3.omakaseBot && <FromCartBadge />}
            price={<span className="inline-flex items-center gap-1"><Icon name="warning" size={14} /> 가격 협의</span>} />
        </AddonGroup>
      </div>
    </FormSection>
  );
}

// ── 선택한 기능 설정 ─────────────────────────────────────

/** 설정 상자 하나 (흰 바탕 + 선). 가로 전체가 필요한 것만 wide */
/** 작은 상자는 제목 없이 입력 라벨만 (사용자 요청: 옵션 이름이 라벨과 겹쳐 보였다) */
function SettingBox({ title, aside, wide, children }: { title?: string; aside?: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-3 rounded-card border border-border-100 bg-background-white p-4 lg:p-5 ${wide ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-title5 text-text-primary">{title}</h3>
          {aside}
        </div>
      )}
      {children}
    </div>
  );
}

/** 명령어 입력: 누르면 [ ] 가 들어가 있고 지워지지 않는다 (글자는 그 사이에만). emptyValue: 비운 채 나갈 때 값 */
function CommandField({ id, label, value, placeholder, emptyValue, onChange }: {
  id: string; label: string; value: string; placeholder: string; emptyValue: string; onChange: (value: string) => void;
}) {
  const fieldAria = useFieldAria();
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} {...fieldAria(id)} type="text" placeholder={placeholder} className="form-input" {...bracketInputProps(value, onChange, emptyValue)} />
      <FieldError field={id} />
    </div>
  );
}

function AttendanceSetting({ s }: S) {
  const { step3, updateStep3 } = s;
  const fieldAria = useFieldAria();
  return (
    <SettingBox>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="attendanceCurrencyAmount">출석 시 받는 재화</FieldLabel>
          <input id="attendanceCurrencyAmount" {...fieldAria('attendanceCurrencyAmount')} type="number" min="1" step="1"
            value={step3.attendanceCurrencyAmount || ''} placeholder="예: 10" className="form-input"
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') { updateStep3({ attendanceCurrencyAmount: 0 }); return; }
              const parsed = parseInt(raw, 10);
              if (Number.isFinite(parsed) && parsed >= 0) updateStep3({ attendanceCurrencyAmount: parsed });
            }} />
          <FieldError field="attendanceCurrencyAmount" />
        </div>
        {/* 비운 채 나가면 기본 [출석] */}
        <CommandField id="attendanceCommand" label="출석 명령어" placeholder="[출석]" value={step3.attendanceCommand} emptyValue="[출석]"
          onChange={(value) => updateStep3({ attendanceCommand: value })} />
      </div>
    </SettingBox>
  );
}

function RandomBoxSetting({ s }: S) {
  const { step3, updateStep3 } = s;
  // 기본값 없음: 신청자가 꼭 정한다 (비우면 검사에서 막힘)
  return (
    <SettingBox>
      <CommandField id="randomBoxCommand" label="랜덤박스 명령어 (예: [랜덤박스] [가챠] [뽑기])" placeholder="명령어를 입력해 주세요" value={step3.randomBoxCommand} emptyValue=""
        onChange={(value) => updateStep3({ randomBoxCommand: value })} />
    </SettingBox>
  );
}

function TransferSetting({ s }: S) {
  const { step3, updateStep3 } = s;
  const options = [
    { value: 'itemOnly' as const, label: '아이템만' },
    { value: 'currencyOnly' as const, label: '재화만' },
    { value: 'all' as const, label: '모두' },
  ];
  return (
    <SettingBox title="양도 가능한 것">
      <FieldGroupError field="transferOption">
        <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="양도 가능한 것">
          {options.map((o) => (
            <Radio key={o.value} name="transferOption" label={o.label} checked={step3.transferOption === o.value} onChange={() => updateStep3({ transferOption: o.value })} />
          ))}
        </div>
      </FieldGroupError>
    </SettingBox>
  );
}

function TootCurrencySetting({ s }: S) {
  const { step3, updateStep3 } = s;
  const fieldAria = useFieldAria();
  return (
    <SettingBox>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="tootPerCurrency">몇 툿당 소지금에 얼마가 추가되나요?</FieldLabel>
        <input id="tootPerCurrency" {...fieldAria('tootPerCurrency')} type="text" value={step3.tootPerCurrency} onChange={(e) => updateStep3({ tootPerCurrency: e.target.value })}
          placeholder="예: 50툿당 1갈레온" className="form-input" />
        <FieldError field="tootPerCurrency" />
      </div>
    </SettingBox>
  );
}

function DailyLimitSetting({ s }: S) {
  const { step3, updateStep3 } = s;
  const fieldAria = useFieldAria();
  return (
    <SettingBox>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="investigationDailyLimitCount">하루에 조사할 수 있는 횟수</FieldLabel>
        <input id="investigationDailyLimitCount" {...fieldAria('investigationDailyLimitCount')} type="number" min="1" value={step3.investigationDailyLimitCount || ''}
          onChange={(e) => updateStep3({ investigationDailyLimitCount: parseInt(e.target.value) || 0 })} placeholder="예: 3" className="form-input" />
        <FieldError field="investigationDailyLimitCount" />
      </div>
    </SettingBox>
  );
}

function AccountRows({ s }: S) {
  const { step2, accounts, hasAdminAccount, updateAccountSlot, removeAccountSlot } = s;
  return (
    // 아이디는 짧아서 PC 3칸씩 (예전에는 한 줄에 하나씩 가로 전체였다)
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {hasAdminAccount && (
        <div className="flex items-center gap-2">
          <input type="text" value={step2.adminAccountId.trim()} readOnly aria-label="총괄 계정 (자동 입력)" title="총괄 계정 (자동 입력)" className="form-input min-w-0 flex-1 cursor-not-allowed" />
          <span className="w-9 shrink-0" aria-hidden="true" />
        </div>
      )}
      {accounts.map((account, index) => {
        const slotNumber = hasAdminAccount ? index + 2 : index + 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <input type="text" maxLength={INPUT_LIMITS.accountList} {...atInputProps(account, (value) => updateAccountSlot(index, value))}
              placeholder="아이디 입력 (예: STORY)" aria-label={`계정 ${slotNumber}`} className="form-input min-w-0 flex-1" />
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
  // 유료 칸 추가는 결제 같은 동작이라 한 번 묻는다 (13번 리뷰: 누르자마자 +5,000원이 붙었다)
  const [confirmBuy, setConfirmBuy] = useState(false);
  const outline = 'inline-flex min-h-11 items-center gap-1 rounded-button border border-brand px-4 text-body3 text-brand hover:bg-background-brand focus-visible:outline-2 focus-visible:outline-brand';
  return (
    <>
      <FieldGroupError field="extraAccountTiers">
        <div className="flex flex-wrap items-center gap-2">
          {canAddAccountSlot ? (
            <button type="button" onClick={addAccountSlot} className={outline}><Icon name="plus" /> 계정 추가</button>
          ) : canBuyAccountTier ? (
            <>
              <button type="button" onClick={() => setConfirmBuy(true)} className="inline-flex min-h-11 items-center gap-1 rounded-button bg-brand px-4 text-body3 text-text-inverse hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <Icon name="plus" /> 계정 {SLOTS_PER_TIER}칸 더 등록 (+{A.extraAccountTier.toLocaleString()}원)
              </button>
            </>
          ) : (
            <span className="text-body3 text-text-secondary">최대 {ACCOUNT_LIST_CONFIG.maxTotalAccounts}개까지 등록하셨어요.</span>
          )}
        </div>
      </FieldGroupError>
      {accountTiers > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-body3">
          <span className="text-brand">추가 계정 {accountTiers * SLOTS_PER_TIER}칸 구매됨 (+{(accountTiers * A.extraAccountTier).toLocaleString()}원)</span>
          {canRefundAccountTier && (
            <button type="button" onClick={refundAccountTier} className="text-text-secondary underline hover:text-error-500">마지막 추가 구매 취소</button>
          )}
        </div>
      )}
      <ConfirmDialog open={confirmBuy} title={`계정 ${SLOTS_PER_TIER}칸을 더 등록할까요?`} confirmLabel={`+${A.extraAccountTier.toLocaleString()}원 추가하기`}
        onConfirm={() => { setConfirmBuy(false); buyAccountTier(); }} onCancel={() => setConfirmBuy(false)}>
        견적에 {A.extraAccountTier.toLocaleString()}원이 더해져요. 칸을 다 쓰지 않아도 금액은 그대로이니, 정말 필요할 때만 추가해 주세요.
      </ConfirmDialog>
    </>
  );
}

function AccountListSetting({ s }: S) {
  const { hasAdminAccount, isOverCapacity, totalRegistered, totalMaxAccounts } = s;
  const count = (
    <span className={isOverCapacity ? 'text-body3 text-error-500' : 'text-body3 text-text-secondary'}>
      등록 {totalRegistered} / {totalMaxAccounts}개 (최대 {ACCOUNT_LIST_CONFIG.maxTotalAccounts}개)
    </span>
  );
  return (
    <SettingBox wide title="예약 툿 · 스토리 진행 계정 목록" aside={count}>
      {isOverCapacity && (
        <p role="alert" className="rounded-input border border-error-500 bg-background-white p-3 text-body3 text-error-500">
          무료 등록 한도를 초과했어요. 추가 계정을 구매하거나 칸을 줄여 주세요.
        </p>
      )}
      <p className="text-body3 text-text-secondary">
        예약 툿을 보내거나 스토리 진행에 나올 계정 아이디를 적어 주세요. 전체 대문자로 캐릭터 계정과 구분하는 걸 추천해요.{' '}
        {hasAdminAccount ? '총괄 계정을 포함해 3개까지 무료' : '3개까지 무료'}, 더 필요하면 {SLOTS_PER_TIER}칸당 +{A.extraAccountTier.toLocaleString()}원이에요.
      </p>
      <FieldGroupError field="accountList"><AccountRows s={s} /></FieldGroupError>
      <AccountTierActions s={s} />
      <details className="group border-t border-border-100 pt-4 text-body3 text-text-primary">
        <summary className="cursor-pointer text-text-secondary hover:text-text-primary">자주 묻는 질문</summary>
        <div className="mt-3 flex flex-col gap-2">
          <p><span className="font-medium">Q.</span> 예약 툿도 안 보내고 스진에도 안 나오는 NPC·시스템 계정은요?<br /><span className="font-medium">A.</span> 빼고 적으시면 됩니다.</p>
        </div>
      </details>
    </SettingBox>
  );
}

function OmakaseSetting({ s }: S) {
  const { step3, updateStep3 } = s;
  const fieldAria = useFieldAria();
  return (
    <SettingBox wide title="오마카세 봇">
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="omakaseDetails">구현할 시스템을 정리한 문서 링크</FieldLabel>
        <p className="text-body3 text-text-secondary">
          커뮤 시스템 문서와는 따로 만든 문서여야 해요. 한 번에 이해하기 어려우면 신청이 거절될 수 있어요.{' '}
          <a href={OMAKASE_FORM_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-2 hover:underline">예시 신청서 보기 →</a>
        </p>
        <textarea id="omakaseDetails" {...fieldAria('omakaseDetails')} value={step3.omakaseDetails} onChange={(e) => updateStep3({ omakaseDetails: e.target.value })}
          placeholder="https://로 시작하는 문서 링크" rows={2} className="form-input resize-none" />
        <FieldError field="omakaseDetails" />
      </div>
    </SettingBox>
  );
}

function AddonSettings({ s }: S) {
  const { step3, showTransferFeature: shop, showAccountList } = s;
  const boxes = [
    shop && step3.attendanceSystem && <AttendanceSetting key="attendance" s={s} />,
    shop && step3.randomBox && <RandomBoxSetting key="randomBox" s={s} />,
    shop && step3.transferFeature && <TransferSetting key="transfer" s={s} />,
    shop && step3.tootCurrencyLink && <TootCurrencySetting key="tootCurrency" s={s} />,
    step3.investigationBot && step3.investigationDailyLimit && <DailyLimitSetting key="dailyLimit" s={s} />,
    showAccountList && <AccountListSetting key="accounts" s={s} />,
    step3.omakaseBot && <OmakaseSetting key="omakase" s={s} />,
  ].filter(Boolean);
  if (boxes.length === 0) return null;
  return (
    <FormSection title="선택한 기능 설정">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{boxes}</div>
    </FormSection>
  );
}

export function AddonSection({ s }: S) {
  return (
    <>
      <AddonCards s={s} />
      <AddonSettings s={s} />
    </>
  );
}
