/**
 * STEP2 서버 설치 옵션 — 시안 '신청서 - STEP02-편집 상태' / '-아니오' (269:5181, 257:3848, file.json 실측).
 *  STEP 01 설치 여부(라디오, 기본 비용) → 서버비 계산기(서버 페이지와 같은 useServerCalculator + ds 입력, 2열)
 *  → 커스텀 옵션(OptionRow 택1) → 기타 옵션(OptionRow) → 노션 가이드 안내 → STEP 02 기타 정보(희망 마감일·총괄 계정 2열).
 *  Q6: 견적함에서 넘어와 값이 채워졌으면 커스텀·기타 옵션 대신 요약('선택하신 서버 사양' + 수정)으로 시작 (stepMode).
 *  검색 연동·Vultr 검색 차단·마감 임박 빠른 마감 강제·글자수 검증·'아니오' 초기화 동작은 기존 그대로.
 */
import { useState, useEffect, useMemo } from 'react';
import { Checkbox, FieldLabel, FormSection, Icon, OptionRow, Radio, SelectionSummary } from '@/app/components/ds';
import { ServerCalculator } from '@/app/components/server/ServerCostPreview';
import { useOrder } from '@/app/contexts/OrderContext';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { calculateTotalEstimate, validateCharacterLimit, computeRequiredFastDeadline, getDeadlineBlackoutError, validateAccountId, DEADLINE_BLACKOUT_LABEL } from '@/app/utils/orderUtils';
import { SERVER_INFRA_FEE_ITEM } from '@/app/constants/form';
import type { FastDeadlineOption, Step2Data } from '@/app/types/order';
import { FieldErrorText, FromCartBadge, Pill, useFromCart } from '../fields';
import { serverSummaryRows, useStepMode } from '../stepMode';

const CUSTOM_OPTIONS: { value: Step2Data['additionalOption']; title: string; price?: string; description?: string }[] = [
  { value: null, title: '기본', description: '무료 — 기본 트위터 테마' },
  { value: 'logo', title: '로고 변경', price: '+5,000원' },
  { value: 'dayTheme', title: '낮 테마', price: '+20,000원' },
  { value: 'nightTheme', title: '밤 테마', price: '+20,000원' },
  { value: 'bothTheme', title: '커스텀 테마 2종', price: '+30,000원' },
];

const FAST_OPTIONS: { value: FastDeadlineOption; title: string; price: string }[] = [
  { value: 'basic48h', title: '48시간 내 기본 서버 설치 마감', price: '+5,000원' },
  { value: 'basic24h', title: '24시간 내 기본 서버 설치 마감', price: '+10,000원' },
  { value: 'logo48h', title: '48시간 내 로고 변경된 서버 설치 마감', price: '+15,000원' },
  { value: 'theme48h', title: '48시간 내 테마 커스텀된 서버 설치 마감', price: '+20,000원' },
];

/** 검색 연동·Vultr 차단·빠른 마감 강제 등 STEP2 규칙 (기존과 같은 효과들) */
function useStep2Rules() {
  const { formData, updateStep2 } = useOrder();
  const { serverCalcResult } = useEstimate();
  const step2 = formData.step2;
  // 장기 소규모 서버 선택 시: 검색 기능(검색 서버) 추가 불가 (저렴한 월 서버비 유지)
  const isLongTermServer = formData.step1.isLongTermCommunity;
  const hostingIsVultr = serverCalcResult?.type === 'vultr';
  const searchBlockedByVultr = isLongTermServer || hostingIsVultr;
  // 계산기에서 검색 여부가 결정되었거나, Vultr 서버라 검색이 아예 막힌 경우
  const searchDecidedByCalc = serverCalcResult?.search === 'yes' || serverCalcResult?.search === 'no';
  const searchLocked = searchDecidedByCalc || searchBlockedByVultr;

  // 계산기 검색 여부와 검색 옵션을 양방향 동기화 (기존 동작 그대로: 계산기 값이 바뀔 때만 따라간다)
  useEffect(() => {
    if (searchBlockedByVultr) return; // Vultr 서버는 아래 효과에서 검색을 강제로 끔
    if (serverCalcResult?.search === 'yes' && !step2.searchOption) {
      updateStep2({ searchOption: true });
    } else if (serverCalcResult?.search === 'no' && step2.searchOption) {
      updateStep2({ searchOption: false });
    }
  }, [serverCalcResult?.search, searchBlockedByVultr]);

  // Vultr(장기·소규모) 서버 선택 시 검색 옵션 강제 해제
  useEffect(() => {
    if (searchBlockedByVultr && step2.searchOption) updateStep2({ searchOption: false });
  }, [searchBlockedByVultr, step2.searchOption, updateStep2]);

  // 마감일이 임박했을 때 강제 적용되는 빠른 마감 옵션 (선택한 커스텀 옵션 기준)
  const requiredFastDeadline = useMemo(
    () => computeRequiredFastDeadline(step2.desiredDeadline, step2.additionalOption),
    [step2.desiredDeadline, step2.additionalOption],
  );
  useEffect(() => {
    if (!requiredFastDeadline) return;
    if (step2.fastDeadline && step2.fastDeadlineOption === requiredFastDeadline) return;
    updateStep2({ fastDeadline: true, fastDeadlineOption: requiredFastDeadline });
  }, [requiredFastDeadline, step2.fastDeadline, step2.fastDeadlineOption, updateStep2]);

  return { serverCalcResult, isLongTermServer, searchBlockedByVultr, searchLocked, requiredFastDeadline };
}

function InstallQuestion() {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  // "아니오" 선택 시 모든 하위 필드 초기화
  const handleServerInstallChange = (value: 'yes' | 'no') => {
    updateStep2({ applyServerInstall: value });
    if (value === 'no') {
      updateStep2({
        additionalOption: null, changeCharacterLimit: false, characterLimitValue: 0, searchOption: false, mastoHostMigration: false,
        fastDeadline: false, fastDeadlineOption: null, desiredDeadline: '', adminAccountId: '',
      });
    }
  };
  return (
    <FormSection
      eyebrow="STEP 01"
      title={<>서버 설치를 신청하시나요? <span className="text-brand" aria-hidden="true">*</span></>}
      titleAside={fromCart('마스토돈 서버 설치') && step2.applyServerInstall === 'yes' && <FromCartBadge />}
      description={<>서버 설치 기본 비용: <span className="text-brand">20,000원</span></>}
    >
      <FieldGroupError field="applyServerInstall">
        <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="서버 설치 신청 여부">
          <Radio id="applyServerInstall" name="applyServerInstall" label="예" checked={step2.applyServerInstall === 'yes'} onChange={() => handleServerInstallChange('yes')} />
          <Radio name="applyServerInstall" label="아니오" checked={step2.applyServerInstall === 'no'} onChange={() => handleServerInstallChange('no')} />
        </div>
      </FieldGroupError>
    </FormSection>
  );
}

function InfraFeeNotice() {
  return (
    <div className="flex items-start gap-3 rounded-card bg-background-brand p-5 lg:p-6">
      <Checkbox checked disabled readOnly aria-label={`${SERVER_INFRA_FEE_ITEM.name} (해제 불가)`} label="" className="shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-center gap-2 text-title5 text-text-primary">
          {SERVER_INFRA_FEE_ITEM.name}
          <Pill tone="brand">필수 포함</Pill>
          <span className="text-brand">+{SERVER_INFRA_FEE_ITEM.price.toLocaleString()}원</span>
        </p>
        <p className="text-body3 text-text-secondary">{SERVER_INFRA_FEE_ITEM.description}</p>
      </div>
    </div>
  );
}

function CustomOptions() {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const themeFromCart = fromCart('테마') || fromCart('로고');
  const handleChange = (option: Step2Data['additionalOption']) => {
    // 같은 옵션 재선택 시 선택 해제 (기본은 항상 null 로)
    if (option === null) updateStep2({ additionalOption: null });
    else updateStep2({ additionalOption: step2.additionalOption === option ? null : option });
  };
  return (
    <FormSection
      title="커스텀 옵션 선택"
      titleAside={themeFromCart && step2.additionalOption && <FromCartBadge />}
      description="테마 옵션은 전부 로고 변경 옵션이 포함되어 있습니다."
    >
      <div className="flex flex-col gap-1" role="radiogroup" aria-label="커스텀 옵션">
        {CUSTOM_OPTIONS.map((o) => (
          <OptionRow key={o.title} type="radio" name="additionalOption" checked={step2.additionalOption === o.value}
            onChange={() => handleChange(o.value)} title={o.title} description={o.description} price={o.price} />
        ))}
      </div>
    </FormSection>
  );
}

function CharacterLimitOption() {
  const { formData, updateStep2 } = useOrder();
  const fieldAria = useFieldAria();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const [characterLimitError, setCharacterLimitError] = useState<string | null>(null);
  // 글자수 값 검증
  useEffect(() => {
    if (step2.changeCharacterLimit && step2.characterLimitValue > 0) {
      setCharacterLimitError(validateCharacterLimit(step2.characterLimitValue)?.message || null);
    } else {
      setCharacterLimitError(null);
    }
  }, [step2.changeCharacterLimit, step2.characterLimitValue]);
  return (
    <OptionRow
      checked={step2.changeCharacterLimit}
      onChange={(e) => {
        updateStep2({ changeCharacterLimit: e.target.checked });
        if (!e.target.checked) {
          updateStep2({ characterLimitValue: 0 });
          setCharacterLimitError(null);
        }
      }}
      title="글자수 제한 변경"
      badge={fromCart('글자수') && step2.changeCharacterLimit && <FromCartBadge />}
      description="기본 공백 포함 1000자. 원하는 글자수 제한을 설정합니다."
      price="+5,000원"
    >
      <div className="flex flex-col gap-3 md:w-[280px]">
        <FieldLabel htmlFor="characterLimitValue">원하는 글자수</FieldLabel>
        <div>
          <input id="characterLimitValue" {...fieldAria('characterLimitValue')} type="number" min="1"
            value={step2.characterLimitValue || ''} onChange={(e) => updateStep2({ characterLimitValue: parseInt(e.target.value) || 0 })}
            placeholder="예: 500, 1500, 2000" aria-invalid={characterLimitError ? true : undefined} className="form-input" />
          {!characterLimitError && <FieldError field="characterLimitValue" />}
          {characterLimitError && <FieldErrorText id="characterLimitValue-error" message={characterLimitError} />}
        </div>
      </div>
    </OptionRow>
  );
}

function SearchOption({ rules }: { rules: ReturnType<typeof useStep2Rules> }) {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  const { searchLocked, searchBlockedByVultr, serverCalcResult, isLongTermServer } = rules;
  return (
    <div className="flex flex-col gap-3">
      <OptionRow
        checked={step2.searchOption}
        disabled={searchLocked}
        onChange={(e) => { if (!searchLocked) updateStep2({ searchOption: e.target.checked }); }}
        title="검색 옵션"
        badge={<>
          {fromCart('검색') && step2.searchOption && <FromCartBadge />}
          {searchBlockedByVultr && <Pill>장기·소규모(Vultr) 서버 선택 불가</Pill>}
          {!searchBlockedByVultr && serverCalcResult?.search === 'yes' && <Pill tone="brand">계산기에서 선택됨</Pill>}
          {!searchBlockedByVultr && serverCalcResult?.search === 'no' && <Pill>계산기에서 제외됨</Pill>}
        </>}
        description="서버에 검색 기능을 추가합니다. 위 계산기의 ‘검색 기능 추가 여부’와 연동됩니다."
        price="+15,000원"
      />
      {/* Vultr(장기·소규모) 서버: 검색 기능 추가 불가 안내 */}
      {searchBlockedByVultr && (
        <p className="rounded-input bg-background-brand px-5 py-4 text-body3 text-brand-700 animate-slideDown">
          {isLongTermServer
            ? '장기 소규모 서버(반영구)는 검색 서버가 별도로 필요해 월 서버비가 크게 오릅니다. 서버비 절약을 위해 검색 기능을 추가할 수 없어요. 검색이 필요하시면 Step 1에서 ‘장기 소규모 서버’ 체크를 해제해 주세요.'
            : '이 사양은 장기·소규모(Vultr) 서버라, 검색 서버 비용이 커서 검색 기능을 추가할 수 없습니다. 검색이 필요하시면 위 계산기에서 운영 기간을 12개월 미만(GCP 사양)으로 선택해 주세요.'}
        </p>
      )}
    </div>
  );
}

function FastDeadlineOption({ required }: { required: FastDeadlineOption | null }) {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  // 강제 적용 시 해당 옵션 외 다른 빠른 마감 옵션은 잠금
  const isLocked = (option: FastDeadlineOption) => required !== null && required !== option;
  return (
    <FieldGroupError field="fastDeadline">
      <OptionRow
        checked={step2.fastDeadline}
        disabled={!!required}
        onChange={(e) => {
          if (required) return;
          updateStep2({ fastDeadline: e.target.checked });
          if (!e.target.checked) updateStep2({ fastDeadlineOption: null });
        }}
        title="48시간 이내 빠른 마감"
        badge={<>
          {fromCart('빠른마감') && step2.fastDeadline && <FromCartBadge />}
          {required && <Pill tone="brand">마감 임박 필수</Pill>}
        </>}
      >
        {required ? (
          <p className="rounded-input bg-background-brand px-5 py-4 text-body3 text-brand-700">
            희망 마감일이 작성일로부터 2일 이내라, 선택하신 옵션에 맞는 빠른 마감이 필수로 적용됩니다.
          </p>
        ) : (
          <p className="text-body3 text-text-secondary">아래 옵션 중 하나를 선택해 주세요.</p>
        )}
        <div className="flex flex-col gap-1" role="radiogroup" aria-label="빠른 마감 옵션">
          {FAST_OPTIONS.map((o) => (
            <OptionRow key={o.value} type="radio" name="fastDeadlineOption" checked={step2.fastDeadlineOption === o.value}
              disabled={isLocked(o.value)} onChange={() => updateStep2({ fastDeadlineOption: o.value })} title={o.title} price={o.price} />
          ))}
        </div>
      </OptionRow>
    </FieldGroupError>
  );
}

function OtherOptions({ rules }: { rules: ReturnType<typeof useStep2Rules> }) {
  const { formData, updateStep2 } = useOrder();
  const fromCart = useFromCart();
  const step2 = formData.step2;
  return (
    <FormSection title="기타 옵션 선택">
      <div className="flex flex-col gap-1">
        <CharacterLimitOption />
        <SearchOption rules={rules} />
        <OptionRow
          checked={step2.mastoHostMigration}
          onChange={(e) => updateStep2({ mastoHostMigration: e.target.checked })}
          title="masto.host 에서 서버 데이터 이전"
          badge={fromCart('masto.host') && step2.mastoHostMigration && <FromCartBadge />}
          description="팔로우 관계, 텍스트 데이터, 이미지 등 모든 정보를 기존 서버에서 새로운 서버로 옮겨드립니다."
          price="+20,000원"
        />
        <FastDeadlineOption required={rules.requiredFastDeadline} />
      </div>
      {/* 마스토돈 가이드: 서버 설치 신청 시 무료 제공 (선택 항목 아님) */}
      <div className="flex flex-col gap-1 rounded-card border border-border-100 p-5 lg:p-6">
        <p className="text-title5 text-text-primary">노션 마스토돈 가이드 무료 제공</p>
        <p className="text-body3 text-text-secondary">
          마스토돈 커뮤니티를 처음 러닝하는 러너를 위한 가이드입니다. 서버 설치 커미션을 신청하시면 별도 신청 없이 함께 전달드립니다. 기본 트위터 블루 테마 캡처 화면으로 제작되며, 각 서버 테마가 적용된 가이드는 제공하지 않습니다.
        </p>
      </div>
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
      <FieldLabel htmlFor="desiredDeadline" required>희망 마감일</FieldLabel>
      <div>
        <input id="desiredDeadline" {...fieldAria('desiredDeadline')} type="text" value={step2.desiredDeadline}
          onChange={(e) => updateStep2({ desiredDeadline: e.target.value })} placeholder="MM/DD"
          aria-invalid={blackout ? true : undefined} className="form-input" />
        {!blackout && <FieldError field="desiredDeadline" />}
        {blackout ? (
          <FieldErrorText id="desiredDeadline-error" message={blackout.message} />
        ) : (
          <p className="mt-2 text-body3 text-text-secondary">
            ※ 월/일 형식으로 입력해 주세요.
            <br />
            <strong className="font-medium text-text-primary">{DEADLINE_BLACKOUT_LABEL} 은 마감이 불가능한 기간입니다.</strong>
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
    } else if (value.trim() !== '') {
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
        <input id="adminAccountId" {...fieldAria('adminAccountId')} type="text" value={formData.step2.adminAccountId}
          onChange={(e) => onChange(e.target.value)} placeholder="@NOTICE"
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
    <FormSection eyebrow="STEP 02" title="기타 정보">
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
        <DeadlineField />
        <AdminAccountField />
      </div>
      <p className="rounded-card bg-background-brand p-5 text-body3 text-text-secondary lg:p-6">
        <span className="text-title5 text-brand">로고 혹은 테마 옵션을 신청하셨나요?</span>{' '}
        신청서를 접수하시면 테마와 로고 이미지 규격이 전달됩니다. 신청자님께서는 마감일로부터 <strong className="font-medium text-text-primary">최소 일주일 이전에 9종/12종/13종</strong>의 이미지를 전달해주셔야 합니다. 그때까지 디자인을 완성하고 이미지를 전달하실 수 있는지 생각해보고 마감일을 조정하세요.
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
  const { formData } = useOrder();
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
            {/* 자동 포함 실비 안내 (해제 불가 / 장기 소규모 서버 제외) */}
            {!rules.isLongTermServer && <InfraFeeNotice />}
            <div className="flex flex-col gap-7">
              <ServerCalculator layout="grid" longTerm={rules.isLongTermServer} />
            </div>
          </div>
        )}
      </div>

      {step2.applyServerInstall === 'yes' && (
        <>
          {summary ? (
            <ServerSummary />
          ) : (
            <div id="step2-options" className="flex flex-col gap-12 lg:gap-[70px]">
              <CustomOptions />
              <OtherOptions rules={rules} />
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
