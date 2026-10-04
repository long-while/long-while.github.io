/**
 * STEP3 자동봇 화면 조각 — 시안 '신청서 - STEP03-편집상태' / '-아니오' (280:1868, 280:2850, file.json 실측).
 *  신청 여부 → 운영 기간 설정(카드 2개) → 커뮤니티 봇 선택·TRPG 봇 선택(작은 카드) → 추가 기능(Step3Addons: 선택 카드 + 선택한 기능 설정)
 *  → 봇 설정 정보 → 기타 정보(2열). 카드는 ds OptionCard(row).
 *  문구·동작은 기존 Step3Bot 그대로 (상태·규칙은 useStep3Bot).
 */
import { useState, type ReactNode } from 'react';
import { FieldLabel, FormSection, Icon, OptionCard, Radio } from '@/app/components/ds';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { DEADLINE_BLACKOUT_LABEL, botPeriodWithYears } from '@/app/utils/orderUtils';
import { PRICING_CONFIG, botOperationFee } from '@/app/constants/form';
import { DeadlineYearHint, FieldErrorText, FromCartBadge, Pill, SubPanel } from '../fields';
import { formatManwon, ymdToMonthDay, type Step3State } from './useStep3Bot';
import { atInputProps } from '../fixedAffix';
import { ConfirmDialog } from '../ConfirmDialog';

type S = { s: Step3State };

const won = (n: number) => `+${n.toLocaleString()}원`;

export function CardTitle({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return <span className="flex flex-wrap items-center gap-2">{children}{badge}</span>;
}

/** '아니오'로 바꾸면 지워지는 입력이 있는지 (있으면 먼저 묻는다, 1번 리뷰) */
const hasBotInput = (s: Step3State['step3']) =>
  s.mainBot !== null || s.cocBot || s.trpg2d6Bot || s.omakaseBot || s.investigationBot || s.customCommandUpgrade || s.keywordReplyImage ||
  s.reservationToot || s.autoProfileImage || s.tootCurrencyLink || s.transferFeature || s.attendanceSystem || s.randomBox ||
  s.botStartDate !== '' || s.setupDeadline.trim() !== '' || s.botAccountId.replace(/^@+/, '').trim() !== '';

export function ApplyBotQuestion({ s }: S) {
  const { step3, fromCart, handleBotApplyChange } = s;
  const [confirmNo, setConfirmNo] = useState(false);
  const anyFromCart = fromCart.basicBot || fromCart.basicShopBot || fromCart.basicShopStatBot || fromCart.cocBot || fromCart.trpg2d6Bot || fromCart.omakase || fromCart.investigation;
  const onChange = (value: 'yes' | 'no') => {
    if (value === 'no' && step3.applyBot === 'yes' && hasBotInput(step3)) setConfirmNo(true);
    else handleBotApplyChange(value);
  };
  return (
    <FormSection
      title={<>자동봇을 신청하시나요? <span className="text-brand" aria-hidden="true">*</span></>}
      titleAside={step3.applyBot === 'yes' && anyFromCart && <FromCartBadge />}
    >
      <FieldGroupError field="applyBot">
        <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="자동봇 신청 여부">
          <Radio id="applyBot" name="applyBot" label="예" checked={step3.applyBot === 'yes'} onChange={() => onChange('yes')} />
          <Radio name="applyBot" label="아니오" checked={step3.applyBot === 'no'} onChange={() => onChange('no')} />
        </div>
      </FieldGroupError>
      <ConfirmDialog open={confirmNo} title="입력한 내용이 사라져요" confirmLabel="아니오로 바꾸고 지우기" cancelLabel="계속 신청할게요"
        onConfirm={() => { setConfirmNo(false); handleBotApplyChange('no'); }} onCancel={() => setConfirmNo(false)}>
        자동봇을 신청하지 않으면 고르신 봇 종류·추가 기능과 가동 기간·계정·세팅 마감일이 모두 지워져요. 다시 ‘예’를 눌러도 돌아오지 않아요.
      </ConfirmDialog>
    </FormSection>
  );
}

/**
 * 달력에 보여 줄 YYYY-MM-DD. 저장은 예전처럼 MM/DD 라 연도는 폐장일 기준으로 맞춘다 (botPeriodWithYears 와 같은 규칙:
 * 시작일이 종료일보다 늦은 날짜면 시작은 전 해). 한쪽만 있으면 폐장일 해(없으면 올해).
 */
function periodYmd(start: string, end: string, closingDate: string): { start: string; end: string } {
  const both = botPeriodWithYears(start, end, closingDate);
  if (both) {
    const [s, e] = both.split(' ~ ');
    return { start: s, end: e };
  }
  const year = /^\d{4}-/.test(closingDate) ? closingDate.slice(0, 4) : String(new Date().getFullYear());
  const toYmd = (mmdd: string) => (/^\d{2}\/\d{2}$/.test(mmdd) ? `${year}-${mmdd.replace('/', '-')}` : '');
  return { start: toYmd(start), end: toYmd(end) };
}

function BotPeriodInputs({ s }: S) {
  const { step3, updateStep3 } = s;
  const dates = periodYmd(step3.botStartDate, step3.botEndDate, s.step1.closingDate);
  return (
    <SubPanel>
      <p className="text-body3 text-text-secondary">
        추천: 희망 테스트 시작일~폐장일 (애프터 사용 원할 시 고려하여 일정 추가)
      </p>
      {/* 커뮤니티 일정(STEP1)과 같은 달력 입력 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <FieldLabel htmlFor="botStartDate">가동 시작일</FieldLabel>
          <input id="botStartDate" type="date" value={dates.start} className="form-input"
            onChange={(e) => updateStep3({ botStartDate: ymdToMonthDay(e.target.value) })} />
        </div>
        <div className="flex flex-col gap-3">
          <FieldLabel htmlFor="botEndDate">가동 종료일</FieldLabel>
          <input id="botEndDate" type="date" value={dates.end} min={dates.start || undefined} className="form-input"
            onChange={(e) => updateStep3({ botEndDate: ymdToMonthDay(e.target.value) })} />
        </div>
      </div>
      {step3.manualWeeks > 0 && (
        <p className="rounded-input bg-background-brand px-5 py-4 text-title5 text-brand">
          자동봇 가동 기간: {step3.manualWeeks}주 · 가동비 {formatManwon(botOperationFee(step3.manualWeeks))}
        </p>
      )}
    </SubPanel>
  );
}

export function OperationSection({ s }: S) {
  const { step3, updateStep3 } = s;
  return (
    // '운영 기간'은 STEP4 의 커뮤 운영 일정(개장~폐장)과 헷갈려서 '자동봇 가동 기간'으로 (4단계 리뷰)
    <FormSection title={<>자동봇 가동 기간 설정 <span className="text-brand" aria-hidden="true">*</span></>}>
      <FieldGroupError field="operationWeeksOption">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6" role="radiogroup" aria-label="자동봇 가동 기간">
          {/* STEP1 '장기 소규모 서버' 체크가 있을 때만 (7번 리뷰: 체크 없이도 골라졌다) */}
          <OptionCard id="operationWeeksOption" name="operationWeeksOption" layout="row" checked={step3.operationWeeksOption === 'longterm'}
            disabled={!s.step1.isLongTermCommunity && step3.operationWeeksOption !== 'longterm'}
            onChange={() => updateStep3({ operationWeeksOption: 'longterm', manualWeeks: 0 })}
            title="장기 소규모 서버를 위한 자동봇" price={formatManwon(PRICING_CONFIG.bot.longTermSetupFee)}
            description={!s.step1.isLongTermCommunity ? 'Step 1에서 ‘장기 소규모 서버’를 체크하면 고를 수 있어요.' : undefined}
          />
          <OptionCard name="operationWeeksOption" layout="row" checked={step3.operationWeeksOption === 'manual'}
            onChange={() => updateStep3({ operationWeeksOption: 'manual' })}
            title="자캐 커뮤니티 자동봇" price={`주당 ${PRICING_CONFIG.bot.operationPerWeek.toLocaleString()}원 (최대 ${PRICING_CONFIG.bot.operationFeeCap.toLocaleString()}원)`} />
        </div>
        {step3.operationWeeksOption === 'manual' && <div className="mt-4"><BotPeriodInputs s={s} /></div>}
      </FieldGroupError>
    </FormSection>
  );
}

export function MainBotSection({ s }: S) {
  const { step3, fromCart, handleMainBotChange, handleTrpgChange, trpgNotice, basicBotBlockedByCoc } = s;
  // 같은 메인 봇을 다시 누르면 선택 해제 (기존 동작)
  const mainBotCard = (value: 'basic' | 'basicShop' | 'basicShopStat', title: string, price: string, badge: ReactNode, extra?: { id?: string; disabled?: boolean }) => (
    <OptionCard key={value} id={extra?.id} name="mainBot" layout="row" checked={step3.mainBot === value} disabled={extra?.disabled}
      onChange={() => handleMainBotChange(value)} onClick={() => { if (step3.mainBot === value) handleMainBotChange(null); }}
      title={<CardTitle badge={badge}>{title}</CardTitle>} price={price} />
  );
  // 커뮤니티 봇(기본 계열 택1)과 TRPG 봇을 섹션으로 나눈다 (사용자 요청). 둘 중 하나 이상이 필수라 제목 대신 설명에 적는다
  return (
    <>
      <FormSection title="커뮤니티 봇 선택"
        description="기본 / 기본&상점 / 기본&상점&스탯 중 하나만 고를 수 있어요. 커뮤니티 봇과 아래 TRPG 봇 중 하나는 꼭 골라 주세요.">
        <FieldGroupError field="mainBot">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mainBotCard('basic', '기본', won(PRICING_CONFIG.bot.mainTypes.basic).slice(1), <>
              {fromCart.basicBot && step3.mainBot === 'basic' && <FromCartBadge />}
              {basicBotBlockedByCoc && <Pill>TRPG 봇과 기능이 겹쳐 선택 불가</Pill>}
            </>, { id: 'mainBot', disabled: basicBotBlockedByCoc })}
            {mainBotCard('basicShop', '기본&상점', won(PRICING_CONFIG.bot.mainTypes.basicShop).slice(1), fromCart.basicShopBot && step3.mainBot === 'basicShop' && <FromCartBadge />)}
            {mainBotCard('basicShopStat', '기본&상점&스탯', won(PRICING_CONFIG.bot.mainTypes.basicShopStat).slice(1), fromCart.basicShopStatBot && step3.mainBot === 'basicShopStat' && <FromCartBadge />)}
          </div>
        </FieldGroupError>
      </FormSection>
      <FormSection title="TRPG 봇 선택" description="단독으로, 또는 기본&상점 이상과 함께 고를 수 있어요. 기본 봇과는 기능이 겹쳐 함께 고를 수 없어요.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OptionCard type="checkbox" layout="row" checked={step3.cocBot} onChange={(e) => handleTrpgChange('cocBot', e.target.checked)}
            title={<CardTitle badge={fromCart.cocBot && step3.cocBot && <FromCartBadge />}>D100 룰 대응 TRPG봇</CardTitle>} price={won(PRICING_CONFIG.bot.addons.cocBot)} />
          <OptionCard type="checkbox" layout="row" checked={step3.trpg2d6Bot} onChange={(e) => handleTrpgChange('trpg2d6Bot', e.target.checked)}
            title={<CardTitle badge={fromCart.trpg2d6Bot && step3.trpg2d6Bot && <FromCartBadge />}>2D6 룰 대응 TRPG봇 3종</CardTitle>} price={won(PRICING_CONFIG.bot.addons.trpg2d6Bot)} />
        </div>
        {trpgNotice && (
          <p role="status" className="rounded-input border border-warning-200 bg-warning-50 px-5 py-4 text-body3 text-warning-700">{trpgNotice}</p>
        )}
      </FormSection>
    </>
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
            <FieldLabel htmlFor="statList" required>스탯 목록</FieldLabel>
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
        <input id={id} {...fieldAria(id)} type="text" {...atInputProps(value, onChange)} placeholder={placeholder}
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
    <FormSection title={<>기타 정보 <span className="text-brand" aria-hidden="true">*</span></>}>
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
            {/* 봇 코드 RESPONSE_PREFIX: 모든 답멘 맨 앞에 붙는 기호 (19번 리뷰: 무엇인지 설명이 없었다) */}
            <p className="mt-2 text-body3 text-text-secondary">※ 봇 답멘 맨 앞에 붙는 기호예요. 예: ✶ 사과를 구매했습니다.</p>
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
          <FieldLabel htmlFor="setupDeadline" required>세팅 마감일</FieldLabel>
          <div>
            <input id="setupDeadline" {...fieldAria('setupDeadline')} type="text" value={step3.setupDeadline} onChange={(e) => updateStep3({ setupDeadline: e.target.value })}
              placeholder="MM/DD (예: 03/15)" aria-invalid={setupDeadlineBlackoutError ? true : undefined} className="form-input" />
            {!setupDeadlineBlackoutError && <FieldError field="setupDeadline" />}
            {!setupDeadlineBlackoutError && <DeadlineYearHint value={step3.setupDeadline} />}
            {setupDeadlineBlackoutError ? (
              <FieldErrorText id="setupDeadline-error" message={setupDeadlineBlackoutError.message} />
            ) : (
              <p className="mt-2 text-body3 text-text-secondary">
                ※ 월/일 형식으로 적어 주세요. 서버 설치 마감일보다 앞설 수 없어요. 오마카세처럼 테스트가 필요하면 테스트 기간까지 넣어서 정해 주세요.
                <br />
                <strong className="font-medium text-text-primary">{DEADLINE_BLACKOUT_LABEL}은 마감이 불가능한 기간입니다.</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
}
