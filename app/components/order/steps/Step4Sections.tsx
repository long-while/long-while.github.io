/**
 * STEP4 최종 확인 화면 조각 — 시안 '신청서 - STEP04' (286:2988, file.json 실측). 문구·조건은 기존 Step4Review 그대로.
 *  확인 묶음 3개(ds ReviewSection) → 최종 견적 줄 + 총 합계 상자 → 질문 정책 안내(회색 접기 상자 + 동의 체크) → 커뮤니티 구글 계정(2열).
 */
import { useId, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { Checkbox, EstimateTotal, FieldLabel, Icon, ReviewSection } from '@/app/components/ds';
import type { OrderFormData, PriceEstimate } from '@/app/types/order';
import { botPeriodWithYears, getBotAccountLines, monthDayWithYear } from '@/app/utils/orderUtils';
import { PRICING_CONFIG, ACCOUNT_LIST_CONFIG, SERVER_INFRA_FEE_ITEM } from '@/app/constants/form';
import { Pill } from '../fields';
import { RUSH_LABEL, THEME_CHOICE_LABEL } from '@/app/components/server/serverContent';
import { ServerFeeNote } from '@/app/components/server/ServerFeeNote';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';

type Edit = (step: 1 | 2 | 3) => void;


const MAIN_BOT_LABEL = { basic: '기본', basicShop: '기본&상점', basicShopStat: '기본&상점&스탯' } as const;
const MAIN_BOT_PRICE_LABEL = { basic: '기본봇', basicShop: '기본&상점봇', basicShopStat: '기본&상점&스탯봇' } as const;
const transferLabel = (o: OrderFormData['step3']['transferOption']) => (o === 'itemOnly' ? '아이템만' : o === 'currencyOnly' ? '재화만' : '모두');
const won = (n: number) => `${n.toLocaleString()}원`;

export function ApplicantReview({ data, onEdit }: { data: OrderFormData; onEdit: Edit }) {
  const { step1 } = data;
  return (
    <ReviewSection
      title="신청자 및 커뮤니티 정보"
      onEdit={() => onEdit(1)}
      rows={[
        { label: '신청자 닉네임', value: step1.applicantNickname || '-' },
        // 입력칸이 이 화면 맨 아래라 들어오자마자 빨간 '미입력'으로 혼내지 않는다 (24번 리뷰)
        {
          label: '구글 계정',
          value: step1.googleEmail || step1.googlePassword
            ? `${step1.googleEmail || '이메일 미입력'} / ${step1.googlePassword ? '비밀번호 입력됨' : '비밀번호 미입력'}`
            : <span className="text-text-secondary">아래 '커뮤니티 구글 계정'에서 입력</span>,
        },
        { label: '커뮤니티', value: `${step1.communityKoreanName} / ${step1.communityEnglishName} (약칭 '${step1.communityShortName}')` },
        ...(step1.isLongTermCommunity ? [] : [{ label: '합격자 발표일', value: step1.resultAnnouncementDate || '-' }]),
        { label: '커뮤 운영 일정 (개장~폐장)', value: step1.isLongTermCommunity ? '장기 소규모 서버' : `${step1.openingDate} ~ ${step1.closingDate} (${step1.operationWeeks}주)` },
      ]}
    />
  );
}

/** 마감일(MM/DD)에 연도를 붙여서 (10번 리뷰) */
const withYear = (mmdd: string) => monthDayWithYear(mmdd) ?? mmdd;

/** 서버비 계산기에서 고른 값 (4번 리뷰: 복사문에는 있는데 확인 화면에 없었다) */
function serverSpecRows(calc: ServerCalcResult | null): { label: string; value: ReactNode }[] {
  if (!calc || calc.type === 'warn') return [];
  const machine = [calc.mastodon?.split(' (')[0], calc.elastic && `검색 ${calc.elastic.split(' (')[0]}`].filter(Boolean).join(' + ');
  return [
    { label: '서버 운영 기간', value: calc.monthsLabel },
    { label: '평균 동시접속자', value: calc.usersLabel },
    { label: '서버 사양', value: `${calc.tierLabel ? `${calc.tierLabel} · ` : ''}${machine}${serverFeeText(calc)}` },
  ];
}

/** ' (서버비: 3개월까지 무료, 이후 월 11만원)' — 무료 기간이 없으면(Vultr) ' (서버비: 월 1.5만원)' */
function serverFeeText(calc: ServerCalcResult): string {
  if (!calc.monthlyKrw) return '';
  return calc.freeMonths > 0
    ? ` (서버비: ${calc.freeMonths}개월까지 무료, 이후 월 ${calc.monthlyKrw})`
    : ` (서버비: 월 ${calc.monthlyKrw})`;
}

export function ServerReview({ data, onEdit, serverCalc }: { data: OrderFormData; onEdit: Edit; serverCalc: ServerCalcResult | null }) {
  const { step2 } = data;
  const rows: { label: string; value: ReactNode }[] = [{ label: '신청 여부', value: step2.applyServerInstall === 'yes' ? '예' : '아니오' }];
  if (step2.applyServerInstall === 'yes') {
    rows.push(...serverSpecRows(serverCalc));
    if (step2.desiredDeadline) rows.push({ label: '희망 마감일', value: withYear(step2.desiredDeadline) });
    if (step2.additionalOption) rows.push({ label: '커스텀 옵션', value: THEME_CHOICE_LABEL[step2.additionalOption] });
    if (step2.changeCharacterLimit || step2.searchOption || step2.mastoHostMigration || step2.fastDeadline) {
      rows.push({
        label: '추가 옵션',
        value: [
          step2.changeCharacterLimit && `툿 글자수 제한 변경 (${step2.characterLimitValue}자)`,
          step2.searchOption && '검색 기능',
          step2.mastoHostMigration && 'masto.host 에서 서버 데이터 이전',
          step2.fastDeadline && (step2.fastDeadlineOption ? RUSH_LABEL[step2.fastDeadlineOption] : '빠른마감'),
        ].filter(Boolean).join(', ') || '-',
      });
    }
    if (step2.adminAccountId) rows.push({ label: '총괄 계정', value: step2.adminAccountId });
  }
  return <ReviewSection title="서버 설치 옵션" onEdit={() => onEdit(2)} rows={rows} />;
}

function botAddonText(step3: OrderFormData['step3']) {
  return [
    step3.cocBot && 'D100 룰 대응 TRPG봇',
    step3.trpg2d6Bot && '2D6 룰 대응 TRPG봇 3종',
    step3.investigationBot && step3.mainBot !== null && '조사 자동봇',
    step3.investigationDailyLimit && step3.investigationBot && step3.mainBot !== null &&
    `일일 조사 횟수 제한${step3.investigationDailyLimitCount > 0 ? ` (${step3.investigationDailyLimitCount}회)` : ''}`,
    step3.customCommandUpgrade && '키워드 답변에 이름 · 주사위 넣기',
    step3.keywordReplyImage && '키워드 답변 시 이미지 전송',
    step3.reservationToot && '예약 툿',
    step3.autoProfileImage && '스토리 자동 진행',
    step3.tootCurrencyLink && '툿수-재화 자동반영',
    step3.transferFeature && `재화, 아이템 양도 기능 (${transferLabel(step3.transferOption)})`,
    step3.attendanceSystem && (step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat') &&
    `출석 시스템 (${step3.attendanceCommand || '[출석]'} / +${step3.attendanceCurrencyAmount || 0})`,
    step3.randomBox && (step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat') && `랜덤박스 기능 (${step3.randomBoxCommand})`,
    step3.omakaseBot && '오마카세',
  ].filter(Boolean).join(', ');
}

function botExtraSettings(data: OrderFormData): ReactNode | null {
  const { step2, step3 } = data;
  const accountListActive = step3.reservationToot || step3.autoProfileImage;
  const accounts = accountListActive
    ? [...(step2.adminAccountId.trim() ? [step2.adminAccountId.trim()] : []), ...step3.accountList.map((a) => a.trim()).filter(Boolean)]
    : [];
  if (!step3.currencyUnit && !step3.statList && !step3.tootPerCurrency && accounts.length === 0) return null;
  return (
    <span className="flex flex-col gap-1">
      {step3.currencyUnit && <span>재화 단위: {step3.currencyUnit}</span>}
      {step3.statList && <span>스탯: {step3.statList}</span>}
      {step3.tootPerCurrency && <span>툿-재화 비율: {step3.tootPerCurrency}</span>}
      {accounts.length > 0 && <span>계정 목록: {accounts.join(', ')}</span>}
    </span>
  );
}

export function BotReview({ data, onEdit }: { data: OrderFormData; onEdit: Edit }) {
  const { step3 } = data;
  const rows: { label: string; value: ReactNode }[] = [{ label: '신청 여부', value: step3.applyBot === 'yes' ? '예' : '아니오' }];
  if (step3.applyBot === 'yes') {
    rows.push({
      label: '자동봇 가동 기간',
      value: step3.operationWeeksOption === 'longterm'
        ? `12개월 이상 장기 소규모 자동봇 (세팅비 ${PRICING_CONFIG.bot.longTermSetupFee.toLocaleString()}원)`
        : step3.botStartDate && step3.botEndDate
          ? `${botPeriodWithYears(step3.botStartDate, step3.botEndDate, data.step1.closingDate) ?? `${step3.botStartDate} ~ ${step3.botEndDate}`} (${step3.manualWeeks}주)`
          : `${step3.manualWeeks}주`,
    });
    if (step3.mainBot) rows.push({ label: '메인 봇', value: MAIN_BOT_LABEL[step3.mainBot] });
    const addons = botAddonText(step3);
    if (addons) rows.push({ label: '추가 옵션', value: addons });
    const accountLines = getBotAccountLines(step3);
    if (accountLines.length === 1) rows.push({ label: accountLines[0].label, value: accountLines[0].value });
    if (accountLines.length > 1) {
      rows.push({ label: '봇 계정 (분리)', value: <span className="flex flex-col gap-1">{accountLines.map(({ label, value }) => <span key={label}>{label}: {value}</span>)}</span> });
    }
    if (step3.botSymbol) rows.push({ label: '봇 기호', value: step3.botSymbol });
    if (step3.setupDeadline) rows.push({ label: '세팅 마감일', value: withYear(step3.setupDeadline) });
    const extra = botExtraSettings(data);
    if (extra) rows.push({ label: '기타 설정', value: extra });
  }
  return <ReviewSection title="자동봇 커미션" onEdit={() => onEdit(3)} rows={rows} />;
}

function PriceLines({ title, lines }: { title: string; lines: { label: ReactNode; price: ReactNode }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-title5 text-text-primary">{title}</p>
      <ul className="flex flex-col gap-2 border-t border-border-100 pt-3">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start justify-between gap-4 text-body3">
            <span className="text-text-secondary">{line.label}</span>
            <span className="shrink-0 text-text-primary">{line.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function serverPriceLines(data: OrderFormData, infraFeeApplied: boolean) {
  const { step2 } = data;
  const lines: { label: ReactNode; price: ReactNode }[] = [{ label: '서버 설치', price: won(PRICING_CONFIG.server.base) }];
  if (infraFeeApplied) lines.push({ label: <span className="inline-flex items-center gap-1.5">{SERVER_INFRA_FEE_ITEM.name}<Pill tone="brand">필수 포함</Pill></span>, price: won(PRICING_CONFIG.server.infraFee) });
  if (step2.additionalOption) lines.push({ label: THEME_CHOICE_LABEL[step2.additionalOption], price: won(PRICING_CONFIG.server.options[step2.additionalOption]) });
  if (step2.changeCharacterLimit && step2.characterLimitValue > 0) lines.push({ label: `글자수 변경 (${step2.characterLimitValue}자)`, price: won(PRICING_CONFIG.server.addons.characterLimit) });
  if (step2.searchOption) lines.push({ label: '검색 옵션', price: won(PRICING_CONFIG.server.addons.search) });
  if (step2.mastoHostMigration) lines.push({ label: 'masto.host 데이터 이전', price: won(PRICING_CONFIG.server.addons.mastoHostMigration) });
  if (step2.fastDeadline && step2.fastDeadlineOption) {
    lines.push({ label: `빠른마감: ${RUSH_LABEL[step2.fastDeadlineOption]}`, price: won(PRICING_CONFIG.server.addons.fastDeadline[step2.fastDeadlineOption]) });
  }
  return lines;
}

function botPriceLines(data: OrderFormData, estimate: PriceEstimate) {
  const { step3 } = data;
  const a = PRICING_CONFIG.bot.addons;
  const shopOrStat = step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat';
  const tiers = Math.min(ACCOUNT_LIST_CONFIG.maxTiers, step3.extraAccountTiers);
  const lines: ({ label: ReactNode; price: ReactNode } | false)[] = [
    { label: step3.operationWeeksOption === 'longterm' ? '장기 자동봇 세팅비' : `가동 비용 (${step3.manualWeeks}주)`, price: won(estimate.operationCost) },
    !!step3.mainBot && { label: MAIN_BOT_PRICE_LABEL[step3.mainBot!], price: won(PRICING_CONFIG.bot.mainTypes[step3.mainBot!]) },
    step3.cocBot && { label: 'D100 룰 대응 TRPG봇', price: won(a.cocBot) },
    step3.trpg2d6Bot && { label: '2D6 룰 대응 TRPG봇 3종', price: won(a.trpg2d6Bot) },
    step3.investigationBot && step3.mainBot !== null && { label: '조사 자동봇', price: won(a.investigationBot) },
    step3.investigationDailyLimit && step3.investigationBot && step3.mainBot !== null && {
      label: `일일 조사 횟수 제한${step3.investigationDailyLimitCount > 0 ? ` (${step3.investigationDailyLimitCount}회)` : ''}`, price: won(a.investigationDailyLimit),
    },
    step3.customCommandUpgrade && { label: '키워드 답변에 이름 · 주사위 넣기', price: won(a.customCommandUpgrade) },
    step3.keywordReplyImage && { label: '키워드 답변 시 이미지 전송', price: won(a.keywordReplyImage) },
    step3.reservationToot && { label: '예약 툿', price: won(a.reservationToot) },
    step3.autoProfileImage && { label: '스토리 자동 진행', price: won(a.autoProfileImage) },
    (step3.reservationToot || step3.autoProfileImage) && step3.extraAccountTiers > 0 && {
      label: `추가 계정 ${tiers * ACCOUNT_LIST_CONFIG.slotsPerTier}칸`, price: won(tiers * a.extraAccountTier),
    },
    step3.tootCurrencyLink && { label: '툿수-재화 자동반영', price: won(a.tootCurrencyLink) },
    step3.transferFeature && { label: `재화, 아이템 양도 기능 (${transferLabel(step3.transferOption)})`, price: won(a.transferFeature) },
    step3.attendanceSystem && shopOrStat && { label: `출석 시스템 (${step3.attendanceCommand || '[출석]'} / +${step3.attendanceCurrencyAmount || 0})`, price: won(a.attendanceSystem) },
    step3.randomBox && shopOrStat && { label: `랜덤박스 기능 (${step3.randomBoxCommand})`, price: won(a.randomBox) },
    step3.omakaseBot && { label: '오마카세', price: <span className="text-text-secondary">별도 협의</span> },
  ];
  return lines.filter((l): l is { label: ReactNode; price: ReactNode } => Boolean(l));
}

export function EstimateReview({ data, estimate, infraFeeApplied, serverCalc }: { data: OrderFormData; estimate: PriceEstimate; infraFeeApplied: boolean; serverCalc: ServerCalcResult | null }) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="border-b border-border-strong pb-4 text-headline2 text-text-primary lg:pb-5">최종 견적</h3>
      {data.step2.applyServerInstall === 'yes' && <PriceLines title="서버 관련" lines={serverPriceLines(data, infraFeeApplied)} />}
      {data.step3.applyBot === 'yes' && <PriceLines title="자동봇 관련" lines={botPriceLines(data, estimate)} />}
      <div className="flex flex-col gap-2">
        <EstimateTotal label="총 합계" amount={won(estimate.grandTotal)} />
        {estimate.hasVariablePrice && (
          <p className="text-body3 text-text-secondary">* {estimate.variableItems.join(', ')} 비용은 별도 협의됩니다.</p>
        )}
        {data.step2.applyServerInstall === 'yes' && <ServerFeeNote result={serverCalc} />}
      </div>
    </section>
  );
}

export function PolicyBox({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: (v: boolean) => void }) {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  return (
    <section className="flex flex-col gap-4 rounded-card bg-background-100 p-5 lg:p-6">
      <h3>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={panelId}
          className="flex w-full items-center justify-between gap-3 text-left text-title5 text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
          <span className="flex items-center gap-1"><Icon name="info" className="shrink-0 text-text-disabled" />질문 정책 안내</span>
          <Icon name="chevron-up" className={clsx('shrink-0 text-text-disabled transition-transform', !open && 'rotate-180')} />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="flex flex-col gap-4 text-body3 text-text-secondary">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-text-primary">무료 질문 횟수</p>
          <p>
            첫 메시지부터 최종 작업물 확인 완료까지 <strong className="font-medium text-brand">최대 3회</strong>입니다. (하나의 메시지에 여러 질문을 작성해 전송하면 1회로 간주)
          </p>
          <p>이후 질문 1개당 <strong className="font-medium text-brand">3,000원</strong>의 추가금이 발생합니다.</p>
        </div>
        {/* 이용안내 03(사용자 수정본)과 같게: 기준은 최종 작업물 확인 완료까지, 예외 문단은 이용안내에서 빠져 여기서도 뺌 */}
        <div className="flex flex-col gap-1">
          <p className="font-medium text-text-primary">복잡한 자동봇 / 요구사항이 많은 경우</p>
          <p>
            구현을 원하시는 내용을 자세히 기재한 문서를 전달해 주시면, 추가로 필요한 정보를 정리해서 안내드립니다. 미리 문의하지 마세요!
          </p>
        </div>
      </div>
      <Checkbox appearance="outline" labelSize="lg" checked={confirmed} onChange={(e) => onConfirm(e.target.checked)}
        label={<>위 질문 정책 안내를 읽고 이해했습니다. <span className="text-brand" aria-hidden="true">*</span></>} />
    </section>
  );
}

interface GoogleFieldsProps {
  email: string;
  password: string;
  onChange: (data: { googleEmail?: string; googlePassword?: string }) => void;
  errorFor: (field: string) => string | null;
  passwordNeedsReentry: boolean;
}

function GoogleError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="field-error">
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </p>
  );
}

function GooglePasswordField({ password, onChange, errorFor, passwordNeedsReentry }: Omit<GoogleFieldsProps, 'email'>) {
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor="googlePassword" required>구글 비밀번호</FieldLabel>
      <div>
        {passwordNeedsReentry && (
          <p role="alert" className="mb-2 flex items-start gap-1.5 rounded-input border border-error-500 bg-background-white p-3 text-body3 text-error-500">
            <span aria-hidden="true">⚠</span>
            <span>비밀번호는 <strong className="font-medium">다시 입력</strong>해 주세요.</span>
          </p>
        )}
        <input id="googlePassword" type="password" value={password} onChange={(e) => onChange({ googlePassword: e.target.value })} placeholder="비밀번호 입력"
          aria-required="true" aria-invalid={Boolean(errorFor('googlePassword'))} aria-describedby={errorFor('googlePassword') ? 'googlePassword-error' : 'googlePassword-help'}
          autoComplete="new-password" className="form-input" />
        <GoogleError id="googlePassword-error" message={errorFor('googlePassword')} />
        {/* '저장되지 않는다'만 쓰면 안전하다고 오해할 수 있어 복사문에 들어간다는 것도 밝힌다 (리뷰 5번) */}
        <p id="googlePassword-help" className="mt-2 text-body3 text-text-secondary">
          ※ 비밀번호는 브라우저에 저장되지 않지만, 복사되는 신청서에는 그대로 들어가요. 작업이 끝나면 꼭 비밀번호를 바꿔 주세요.
        </p>
      </div>
    </div>
  );
}

export function GoogleAccountFields({ email, password, onChange, errorFor, passwordNeedsReentry }: GoogleFieldsProps) {
  return (
    <section id="googleAccount" className="flex scroll-mt-header flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-headline2 text-text-primary">커뮤니티 구글 계정 <span className="text-brand" aria-hidden="true">*</span></h3>
        <p className="text-body3 text-text-secondary">
          서버와 자동봇 세팅 시 사용됩니다. 구글 클라우드 플랫폼 무료 체험을 이용하지 않은 계정만 사용할 수 있습니다.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <FieldLabel htmlFor="googleEmail" required>구글 이메일 주소</FieldLabel>
          <div>
            <input id="googleEmail" type="email" value={email} onChange={(e) => onChange({ googleEmail: e.target.value })} placeholder="example@gmail.com"
              aria-required="true" aria-invalid={Boolean(errorFor('googleEmail'))} aria-describedby={errorFor('googleEmail') ? 'googleEmail-error' : undefined} className="form-input" />
            <GoogleError id="googleEmail-error" message={errorFor('googleEmail')} />
          </div>
        </div>
        <GooglePasswordField password={password} onChange={onChange} errorFor={errorFor} passwordNeedsReentry={passwordNeedsReentry} />
      </div>
    </section>
  );
}
