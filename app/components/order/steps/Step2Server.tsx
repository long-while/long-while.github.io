/**
 * STEP2 서버 설치 옵션 — 시안 '신청서 - STEP02-편집 상태' / '-아니오' (269:5181, 257:3848, file.json 실측).
 *  설치 여부(라디오, 기본 비용) → 서버비 계산기(기간·인원·등급만. 결과·지불 방식은 숨김, 검색은 아래 기타 옵션 체크가 정함)
 *  → 커스텀 옵션(드롭다운) → 추가 옵션(체크박스 카드) → 빠른마감 추가(라디오 카드 4개) → 기타 정보(희망 마감일·총괄 계정 2열).
 *  Q6: 견적함에서 넘어와 값이 채워졌으면 기타 옵션 대신 요약('선택하신 서버 사양' + 수정)으로 시작 (stepMode). 커스텀 옵션 드롭다운은 늘 보임.
 *  검색 연동·Vultr 검색 차단·마감 임박 빠른 마감 강제·글자수 검증·'아니오' 초기화 동작은 기존 그대로.
 */
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { FieldLabel, FormSection, Icon, OptionCard, Radio, Select, SelectionSummary } from '@/app/components/ds';
import { ServerCalculator } from '@/app/components/server/ServerCostPreview';
import { useOrder } from '@/app/contexts/OrderContext';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { calculateTotalEstimate, validateCharacterLimit, computeRequiredFastDeadline, rushFitsCustomOption, getDeadlineBlackoutError, validateAccountId, DEADLINE_BLACKOUT_LABEL } from '@/app/utils/orderUtils';
import { PRICING_CONFIG } from '@/app/constants/form';
import type { FastDeadlineOption, Step2Data } from '@/app/types/order';
import { DeadlineYearHint, FieldErrorText, FromCartBadge, Pill, useFromCart } from '../fields';
import { serverSummaryRows, useStepMode } from '../stepMode';
import { atInputProps } from '../fixedAffix';
import { ConfirmDialog } from '../ConfirmDialog';
import { RUSH_OPTIONS, THEME_CHOICE_LABEL } from '@/app/components/server/serverContent';

const plus = (price: number) => `+${price.toLocaleString()}원`;
const THEME_PRICE = PRICING_CONFIG.server.options;

// 이름·가격은 서버 커미션 페이지와 같은 곳(serverContent·PRICING_CONFIG)에서 가져온다 (4단계 리뷰)
const NO_CUSTOM = 'none';
const CUSTOM_OPTIONS: { value: Step2Data['additionalOption']; title: string; price?: string; description?: string }[] = [
  { value: null, title: '기본', description: '트위터 테마 2종' },
  ...(['logo', 'dayTheme', 'nightTheme', 'bothTheme'] as const).map((value) => ({ value, title: THEME_CHOICE_LABEL[value], price: plus(THEME_PRICE[value]) })),
];

/** 신청서 카드용 짧은 이름 (한 줄 4칸에 들어가게, 사용자 요청). 견적함·복사문 이름은 RUSH_OPTIONS 그대로 */
const FAST_SHORT_TITLE: Record<NonNullable<FastDeadlineOption>, string> = {
  basic24h: '24시간 + 기본', basic48h: '48시간 + 기본', logo48h: '48시간 + 로고', theme48h: '48시간 + 테마',
};
/** 막힌 빠른마감 카드에 보여 줄 이유 (21번 리뷰: 회색으로 막힌 이유가 안 보였다) */
const FITS_LABEL = { none: '테마 ‘기본’일 때만', logo: '‘로고만 변경’일 때만', theme: '테마 커스텀일 때만' } as const;
const FAST_OPTIONS = RUSH_OPTIONS.map((o) => ({
  value: o.orderValue, title: FAST_SHORT_TITLE[o.orderValue], fullTitle: o.displayName, price: plus(o.price), fitsLabel: FITS_LABEL[o.fits],
}));

/** 검색 연동·Vultr 차단·빠른 마감 강제 등 STEP2 규칙 (기존과 같은 효과들) */
function useStep2Rules() {
  const { formData, updateStep2 } = useOrder();
  const { serverCalcResult } = useEstimate();
  const step2 = formData.step2;
  // 장기 소규모 서버 선택 시: 검색 기능(검색 서버) 추가 불가 (저렴한 월 서버비 유지)
  const isLongTermServer = formData.step1.isLongTermCommunity;
  const hostingIsVultr = serverCalcResult?.type === 'vultr';
  const searchBlockedByVultr = isLongTermServer || hostingIsVultr;
  // 검색 여부는 기타 옵션 '검색 기능' 체크가 정하고, 계산기는 그 값을 따른다 (계산기 안 질문은 뺌, 사용자 요청).
  // Vultr(장기·소규모) 서버라 검색이 아예 막힌 경우만 잠근다
  const searchLocked = searchBlockedByVultr;

  // Vultr(장기·소규모) 서버 선택 시 검색 옵션 강제 해제
  useEffect(() => {
    if (searchBlockedByVultr && step2.searchOption) updateStep2({ searchOption: false });
  }, [searchBlockedByVultr, step2.searchOption, updateStep2]);

  // 마감일이 임박했을 때 강제 적용되는 빠른 마감 옵션 (선택한 커스텀 옵션 기준)
  const requiredFastDeadline = useMemo(
    () => computeRequiredFastDeadline(step2.desiredDeadline, step2.additionalOption),
    [step2.desiredDeadline, step2.additionalOption],
  );
  // 자동으로 붙인 빠른마감은 기억해 두었다가, 마감일을 고쳐 더 이상 필요 없어지면 다시 뺀다.
  // 예전에는 '10/25'를 치는 도중 '10/2'(오늘)에서 붙은 유료 옵션이 그대로 남았다 (4단계 검토). 직접 고른 빠른마감은 건드리지 않는다
  const autoRushRef = useRef<FastDeadlineOption>(null);
  useEffect(() => {
    if (requiredFastDeadline) {
      if (step2.fastDeadline && step2.fastDeadlineOption === requiredFastDeadline) return;
      autoRushRef.current = requiredFastDeadline;
      updateStep2({ fastDeadline: true, fastDeadlineOption: requiredFastDeadline });
      return;
    }
    if (autoRushRef.current && step2.fastDeadline && step2.fastDeadlineOption === autoRushRef.current) {
      updateStep2({ fastDeadline: false, fastDeadlineOption: null });
    }
    autoRushRef.current = null;
  }, [requiredFastDeadline, step2.fastDeadline, step2.fastDeadlineOption, updateStep2]);

  return { serverCalcResult, isLongTermServer, searchBlockedByVultr, searchLocked, requiredFastDeadline };
}

/** '아니오'로 바꾸면 지워지는 입력이 있는지 (있으면 먼저 묻는다) */
const hasServerInput = (s: Step2Data) =>
  s.additionalOption !== null || s.changeCharacterLimit || s.searchOption || s.mastoHostMigration || s.fastDeadline ||
  s.desiredDeadline.trim() !== '' || s.adminAccountId.replace(/^@+/, '').trim() !== '';

function InstallQuestion() {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const [confirmNo, setConfirmNo] = useState(false);
  // "아니오" 선택 시 모든 하위 필드 초기화 (입력한 게 있으면 확인창부터, 1번 리뷰: 실수로 한 번 눌러도 다 사라졌다)
  const applyNo = () => {
    setConfirmNo(false);
    updateStep2({
      applyServerInstall: 'no', additionalOption: null, changeCharacterLimit: false, characterLimitValue: 0, searchOption: false, mastoHostMigration: false,
      fastDeadline: false, fastDeadlineOption: null, desiredDeadline: '', adminAccountId: '',
    });
  };
  const handleServerInstallChange = (value: 'yes' | 'no') => {
    if (value === 'yes') { updateStep2({ applyServerInstall: 'yes' }); return; }
    if (step2.applyServerInstall === 'yes' && hasServerInput(step2)) setConfirmNo(true);
    else applyNo();
  };
  return (
    <FormSection
      title={<>서버 설치를 신청하시나요? <span className="text-brand" aria-hidden="true">*</span></>}
      titleAside={fromCart('마스토돈 서버 설치') && step2.applyServerInstall === 'yes' && <FromCartBadge />}
      description={<>서버 설치 기본 비용: <span className="text-brand">{PRICING_CONFIG.server.base.toLocaleString()}원</span></>}
    >
      <FieldGroupError field="applyServerInstall">
        <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="서버 설치 신청 여부">
          <Radio id="applyServerInstall" name="applyServerInstall" label="예" checked={step2.applyServerInstall === 'yes'} onChange={() => handleServerInstallChange('yes')} />
          <Radio name="applyServerInstall" label="아니오" checked={step2.applyServerInstall === 'no'} onChange={() => handleServerInstallChange('no')} />
        </div>
      </FieldGroupError>
      <ConfirmDialog open={confirmNo} title="입력한 내용이 사라져요" confirmLabel="아니오로 바꾸고 지우기" cancelLabel="계속 신청할게요"
        onConfirm={applyNo} onCancel={() => setConfirmNo(false)}>
        서버 설치를 신청하지 않으면 고르신 테마·추가 옵션·빠른마감과 희망 마감일·총괄 계정이 모두 지워져요. 다시 ‘예’를 눌러도 돌아오지 않아요.
      </ConfirmDialog>
    </FormSection>
  );
}

function CustomOptions() {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const themeFromCart = fromCart('테마') || fromCart('로고');
  // 드롭다운 값은 빈 문자열을 못 쓰므로 '기본'(null) 은 NO_CUSTOM 으로 주고받는다
  const options = CUSTOM_OPTIONS.map((o) => ({
    value: o.value ?? NO_CUSTOM,
    label: o.price ? `${o.title} (${o.price})` : `${o.title} (${o.description})`,
  }));
  return (
    <FormSection
      title="테마 커스텀 선택"
      titleAside={themeFromCart && step2.additionalOption && <FromCartBadge />}
      description="테마 옵션에는 로고 변경이 포함돼요."
    >
      <Select id="additionalOption" aria-label="커스텀 옵션" className="md:max-w-[480px]" options={options}
        value={step2.additionalOption ?? NO_CUSTOM}
        onValueChange={(value) => updateStep2({ additionalOption: value === NO_CUSTOM ? null : (value as NonNullable<Step2Data['additionalOption']>) })} />
    </FormSection>
  );
}

/** 카드 제목 옆 작은 표시(견적에서 선택됨 등). STEP3 메인 봇 카드와 같은 모양 */
function CardTitle({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return <span className="flex flex-wrap items-center gap-2">{children}{badge}</span>;
}

/** 옵션 카드 줄: STEP3 '커뮤니티 봇 선택'과 같은 가로형 카드 3칸 (사용자 요청) */
const cardGrid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

function CharacterLimitPanel() {
  const { formData, updateStep2 } = useOrder();
  const fieldAria = useFieldAria();
  const step2 = formData.step2;
  const characterLimitError = step2.characterLimitValue > 0 ? validateCharacterLimit(step2.characterLimitValue)?.message ?? null : null;
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-100 bg-background-white p-5 animate-slideDown lg:p-6">
      <FieldLabel htmlFor="characterLimitValue">원하는 글자수</FieldLabel>
      <div className="md:w-[280px]">
        <input id="characterLimitValue" {...fieldAria('characterLimitValue')} type="number" min="1"
          value={step2.characterLimitValue || ''} onChange={(e) => updateStep2({ characterLimitValue: parseInt(e.target.value) || 0 })}
          placeholder="예: 500, 1500, 2000" aria-invalid={characterLimitError ? true : undefined} className="form-input" />
        {!characterLimitError && <FieldError field="characterLimitValue" />}
        {characterLimitError && <FieldErrorText id="characterLimitValue-error" message={characterLimitError} />}
      </div>
    </div>
  );
}

function SearchBlockedNotice({ isLongTermServer }: { isLongTermServer: boolean }) {
  // 장기 소규모 서버: 검색 불가 안내는 STEP2 에서 여기 한 번만 (4단계 문구 정리)
  return (
    <p className="rounded-input bg-background-brand px-5 py-4 text-body3 text-brand-700 animate-slideDown">
      장기 소규모 서버는 검색을 넣을 수 없어요.{' '}
      {isLongTermServer
        ? '필요하시면 Step 1에서 ‘장기 소규모 서버’ 체크를 해제해 주세요.'
        : '필요하시면 위에서 운영 기간을 12개월 미만으로 골라 주세요.'}
    </p>
  );
}

/** 추가 옵션 (체크박스 카드, 설명 문구 없음 — 사용자 요청) */
function AddOptions({ rules }: { rules: ReturnType<typeof useStep2Rules> }) {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const card = { type: 'checkbox' as const, layout: 'row' as const };
  return (
    <FormSection title="추가 옵션 선택">
      <div className={cardGrid}>
        <OptionCard {...card} checked={step2.changeCharacterLimit} price={plus(PRICING_CONFIG.server.addons.characterLimit)}
          onChange={(e) => updateStep2(e.target.checked ? { changeCharacterLimit: true } : { changeCharacterLimit: false, characterLimitValue: 0 })}
          title={<CardTitle badge={fromCart('글자수') && step2.changeCharacterLimit && <FromCartBadge />}>툿 글자수 제한 변경</CardTitle>} />
        <OptionCard {...card} checked={step2.searchOption} disabled={rules.searchLocked} price={plus(PRICING_CONFIG.server.addons.search)}
          onChange={(e) => { if (!rules.searchLocked) updateStep2({ searchOption: e.target.checked }); }}
          title={<CardTitle badge={fromCart('검색') && step2.searchOption && <FromCartBadge />}>검색 기능</CardTitle>} />
        <OptionCard {...card} checked={step2.mastoHostMigration} price={plus(PRICING_CONFIG.server.addons.mastoHostMigration)}
          onChange={(e) => updateStep2({ mastoHostMigration: e.target.checked })}
          title={<CardTitle badge={fromCart('masto.host') && step2.mastoHostMigration && <FromCartBadge />}>masto.host 에서 서버 데이터 이전</CardTitle>} />
      </div>
      {/* 고른 카드에 딸린 입력은 카드 줄 아래에 펼친다 */}
      {step2.changeCharacterLimit && <CharacterLimitPanel />}
      {rules.searchBlockedByVultr && <SearchBlockedNotice isLongTermServer={rules.isLongTermServer} />}
    </FormSection>
  );
}

/**
 * 빠른마감 (라디오 카드 4개 중 하나, 같은 카드를 다시 누르면 해제 — STEP3 메인 봇과 같은 동작).
 * 마감 임박으로 필수가 되면 그 카드만 고정, 고른 커스텀 옵션에 맞지 않는 마감은 잠금 (서버 페이지와 같은 규칙).
 */
function FastDeadlineSection({ required }: { required: FastDeadlineOption | null }) {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const selected = step2.fastDeadline ? step2.fastDeadlineOption : null;
  const isLocked = (option: FastDeadlineOption) =>
    (required !== null && required !== option) ||
    (selected !== option && !rushFitsCustomOption(option, step2.additionalOption));
  return (
    <FormSection title="빠른마감 추가" description="희망 마감일이 2일 이내일 때 고르는 옵션이에요. 고른 테마 옵션에 맞는 것만 고를 수 있고, 고른 카드를 다시 누르면 선택이 풀려요.">
      {required && (
        <p className="rounded-input bg-background-brand px-5 py-4 text-body3 text-brand-700">
          희망 마감일이 작성일로부터 2일 이내라, 선택하신 옵션에 맞는 빠른 마감이 필수로 적용됩니다.
        </p>
      )}
      <FieldGroupError field="fastDeadline">
        {/* 짧은 이름으로 PC 한 줄 4칸 (화면 낭독기에는 전체 이름) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label="빠른마감 추가">
          {FAST_OPTIONS.map((o) => (
            <OptionCard key={o.value} type="radio" layout="compact" name="fastDeadlineOption" checked={selected === o.value} disabled={isLocked(o.value)}
              aria-label={`${o.fullTitle} ${o.price}`}
              onChange={() => updateStep2({ fastDeadline: true, fastDeadlineOption: o.value })}
              onClick={() => { if (selected === o.value && !required) updateStep2({ fastDeadline: false, fastDeadlineOption: null }); }}
              title={<CardTitle badge={<>
                {fromCart('빠른마감') && selected === o.value && <FromCartBadge />}
                {required === o.value && <Pill tone="brand">마감 임박 필수</Pill>}
              </>}>{o.title}</CardTitle>}
              price={o.price}
              description={isLocked(o.value) && required === null ? o.fitsLabel : undefined} />
          ))}
        </div>
      </FieldGroupError>
    </FormSection>
  );
}

function DeadlineField() {
  const { formData, updateStep2 } = useOrder();
  const fieldAria = useFieldAria();
  const step2 = formData.step2;
  // 마감일 접수 불가 기간(마감 중단/휴가) 안내
  const blackout = useMemo(() => getDeadlineBlackoutError(step2.desiredDeadline, 'desiredDeadline'), [step2.desiredDeadline]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <FieldLabel htmlFor="desiredDeadline" required>희망 마감일</FieldLabel>
        <span className="text-body3 text-text-secondary">(추천: 합격자 발표일로부터 최소 2일 전)</span>
      </div>
      <div>
        <input id="desiredDeadline" {...fieldAria('desiredDeadline')} type="text" value={step2.desiredDeadline}
          onChange={(e) => updateStep2({ desiredDeadline: e.target.value })} placeholder="MM/DD"
          aria-invalid={blackout ? true : undefined} className="form-input" />
        {!blackout && <FieldError field="desiredDeadline" />}
        {!blackout && <DeadlineYearHint value={step2.desiredDeadline} />}
        {blackout ? (
          <FieldErrorText id="desiredDeadline-error" message={blackout.message} />
        ) : (
          <p className="mt-2 text-body3 text-text-secondary">
            ※ 월/일 형식으로 입력해 주세요.
            <br />
            <strong className="font-medium text-text-primary">{DEADLINE_BLACKOUT_LABEL}은 마감이 불가능한 기간입니다.</strong>
          </p>
        )}
      </div>
    </div>
  );
}

function AdminAccountField() {
  const { formData, updateStep2 } = useOrder();
  const fieldAria = useFieldAria();
  const [adminAccountError, setAdminAccountError] = useState<string | null>(null);
  const onChange = (value: string) => {
    updateStep2({ adminAccountId: value });
    if (/[,/]/.test(value)) {
      setAdminAccountError('총괄 계정은 하나만 입력해 주세요.');
    } else if (value.replace(/^@/, '').trim() !== '') {
      // 3자 이상 + admin/owner/moderator 사용 불가 (대소문자 무관)
      const accountError = validateAccountId(value, 'adminAccountId', '총괄 계정 아이디');
      setAdminAccountError(accountError ? accountError.message : null);
    } else {
      setAdminAccountError(null);
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor="adminAccountId" required>총괄 계정 아이디</FieldLabel>
      <div>
        <input id="adminAccountId" {...fieldAria('adminAccountId')} type="text" {...atInputProps(formData.step2.adminAccountId, onChange)}
          placeholder="@NOTICE"
          aria-invalid={adminAccountError ? true : undefined} className="form-input" />
        {!adminAccountError && <FieldError field="adminAccountId" />}
        {adminAccountError
          ? <FieldErrorText id="adminAccountId-error" message={adminAccountError} />
          : <p className="mt-2 text-body3 text-text-secondary">※ 대문자 권장 / 3자 이상, admin·owner·moderator 는 사용할 수 없습니다.</p>}
      </div>
    </div>
  );
}

function ExtraInfo() {
  return (
    <FormSection title="기타 정보">
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        <DeadlineField />
        <AdminAccountField />
      </div>
      <p className="rounded-card bg-background-brand p-5 text-body3 text-text-secondary lg:p-6">
        <span className="text-title5 text-brand">로고나 테마 옵션을 고르셨다면,</span>{' '}
        접수 후 이미지 규격을 보내 드려요. 이미지(9종/12종/13종)는 마감일 <strong className="font-medium text-text-primary">최소 일주일 전</strong>까지 보내 주셔야 하니, 그 일정에 맞춰 마감일을 정해 주세요.
      </p>
    </FormSection>
  );
}

/** Q6 요약 상태: 커스텀·기타 옵션을 접고 고른 내용만 보여준다 */
function ServerSummary() {
  const { formData } = useOrder();
  const { expand } = useStepMode();
  return (
    <SelectionSummary
      title="선택하신 서버 사양"
      note="※ 견적에서 선택됨"
      rows={serverSummaryRows(formData.step2)}
      total={{ label: '서버 관련', amount: `${calculateTotalEstimate(formData).serverTotal.toLocaleString()}원` }}
      onEdit={() => expand(2)}
      controls="step2-options"
    />
  );
}

export default function Step2Server() {
  const { formData, updateStep2 } = useOrder();
  const rules = useStep2Rules();
  const { isSummary } = useStepMode();
  const summary = isSummary(2);
  const step2 = formData.step2;
  return (
    <div className="flex flex-col gap-12 lg:gap-[70px]">
      <div className="flex flex-col gap-8">
        <InstallQuestion />
        {step2.applyServerInstall === 'yes' && (
          <div className="flex flex-col gap-8 animate-slideDown">
            {/* 도메인·메일 부가비용 안내 상자는 뺐다 (금액에는 그대로 포함, 사용자 요청) */}
            <div className="flex flex-col gap-7">
              <ServerCalculator layout="grid" longTerm={rules.isLongTermServer} search={step2.searchOption ? 'yes' : 'no'}
                onSearchNo={() => updateStep2({ searchOption: false })} allowLongTerm={false} scheduleWeeks={formData.step1.operationWeeks} />
            </div>
          </div>
        )}
      </div>

      {step2.applyServerInstall === 'yes' && (
        <>
          {summary ? (
            // 커스텀 옵션 드롭다운은 견적에서 넘어온 요약 상태에서도 늘 보여 준다 (사용자 요청)
            <div className="flex flex-col gap-12 lg:gap-[70px]">
              <CustomOptions />
              <ServerSummary />
            </div>
          ) : (
            <div id="step2-options" className="flex flex-col gap-12 lg:gap-[70px]">
              <CustomOptions />
              <AddOptions rules={rules} />
              <FastDeadlineSection required={rules.requiredFastDeadline} />
            </div>
          )}
          <ExtraInfo />
        </>
      )}

      {/* "아니오" 선택 시 안내 메시지 */}
      {step2.applyServerInstall === 'no' && (
        <p className="flex items-center gap-2 rounded-card bg-background-100 p-5 text-body2 text-text-primary animate-slideDown lg:p-6">
          <Icon name="check" className="shrink-0 text-brand" />
          서버 설치를 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.
        </p>
      )}
    </div>
  );
}
