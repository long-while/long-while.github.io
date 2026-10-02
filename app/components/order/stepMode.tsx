/**
 * STEP2·3 요약/편집 전환 (Q6).
 *  - 견적함에서 넘어와 그 단계 값이 실제로 채워졌을 때만(OrderContext.cartApplied) 요약 상태로 시작한다. 직접 들어오면 편집 상태.
 *  - '수정'을 누르면 그 단계는 편집 상태로 펼쳐지고, 다시 접히지 않는다 (새로 견적을 반영하면 처음부터).
 *  - 다음 단계 검증은 요약 상태에서도 그대로 돈다. 요약에 숨겨진 칸에 오류가 나면 그 단계를 자동으로 펼쳐 오류 칸이 보이게 한다.
 * 요약 줄의 문구는 STEP4 최종 확인 화면과 같은 이름을 쓴다.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import type { Step2Data, Step3Data, ValidationError } from '@/app/types/order';
import { RUSH_LABEL, THEME_CHOICE_LABEL } from '@/app/components/server/serverContent';
import { botPeriodWithYears } from '@/app/utils/orderUtils';

type SummaryStep = 2 | 3;

/** 요약 상태에서 접혀 보이지 않는 입력칸 (이 칸에 오류가 나면 펼친다) */
const HIDDEN_FIELDS: Record<SummaryStep, string[]> = {
  2: ['additionalOption', 'changeCharacterLimit', 'characterLimitValue', 'searchOption', 'mastoHostMigration', 'fastDeadline'],
  3: ['operationWeeksOption', 'mainBot', 'accountList', 'extraAccountTiers', 'attendanceCurrencyAmount', 'attendanceCommand',
    'omakaseDetails', 'investigationDailyLimitCount', 'tootPerCurrency'],
};

interface StepModeValue {
  isSummary: (step: SummaryStep) => boolean;
  /** 편집 상태로 펼치고 첫 입력칸에 포커스 */
  expand: (step: SummaryStep) => void;
}

const StepModeContext = createContext<StepModeValue>({ isSummary: () => false, expand: () => undefined });

export function StepModeProvider({ errors, currentStep, children }: { errors: ValidationError[]; currentStep: number; children: ReactNode }) {
  const { cartApplied, formData } = useOrder();
  const [expanded, setExpanded] = useState<Record<SummaryStep, boolean>>({ 2: false, 3: false });

  // 견적을 새로 반영하면 다시 요약 상태로 시작
  useEffect(() => setExpanded({ 2: false, 3: false }), [cartApplied]);

  const expand = useCallback((step: SummaryStep) => setExpanded((prev) => ({ ...prev, [step]: true })), []);

  /** '수정' 버튼: 펼친 뒤 펼쳐진 첫 입력칸으로 포커스를 옮긴다 (버튼이 사라져 포커스를 잃지 않게) */
  const expandAndFocus = useCallback((step: SummaryStep) => {
    expand(step);
    requestAnimationFrame(() => {
      document.getElementById(`step${step}-options`)?.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled])')?.focus();
    });
  }, [expand]);

  // 요약에 숨긴 칸에 오류가 나면 그 단계를 펼친다 (오류 목록에서 눌렀을 때 칸으로 이동할 수 있게)
  useEffect(() => {
    if (currentStep !== 2 && currentStep !== 3) return;
    if (errors.some((e) => HIDDEN_FIELDS[currentStep].includes(e.field))) expand(currentStep);
  }, [errors, currentStep, expand]);

  const value = useMemo<StepModeValue>(() => ({
    isSummary: (step) => {
      if (!cartApplied || expanded[step]) return false;
      if (step === 2) return cartApplied.step2 && formData.step2.applyServerInstall === 'yes';
      return cartApplied.step3 && formData.step3.applyBot === 'yes';
    },
    expand: expandAndFocus,
  }), [cartApplied, expanded, expandAndFocus, formData.step2.applyServerInstall, formData.step3.applyBot]);

  return <StepModeContext.Provider value={value}>{children}</StepModeContext.Provider>;
}

export const useStepMode = () => useContext(StepModeContext);


/** STEP2 요약 줄 (STEP4 '서버 설치 옵션' 과 같은 이름) */
export function serverSummaryRows(step2: Step2Data) {
  const extras = [
    step2.changeCharacterLimit && `툿 글자수 제한 변경 (${step2.characterLimitValue}자)`,
    step2.searchOption && '검색 기능',
    step2.mastoHostMigration && 'masto.host 에서 서버 데이터 이전',
    step2.fastDeadline && (step2.fastDeadlineOption ? RUSH_LABEL[step2.fastDeadlineOption] : '빠른마감'),
  ].filter(Boolean).join(', ');
  return [
    { label: '커스텀 옵션', value: step2.additionalOption ? THEME_CHOICE_LABEL[step2.additionalOption] : '기본' },
    { label: '추가 옵션', value: extras || '-' },
  ];
}

const MAIN_BOT_LABEL: Record<NonNullable<Step3Data['mainBot']>, string> = { basic: '기본', basicShop: '기본&상점', basicShopStat: '기본&상점&스탯' };

/** STEP3 요약 줄 (STEP4 '자동봇 커미션' 과 같은 이름) */
export function botSummaryRows(step3: Step3Data, closingDate: string) {
  const schedule = step3.operationWeeksOption === 'longterm'
    ? '12개월 이상 장기 소규모 자동봇 (세팅비 10,000원)'
    : step3.botStartDate && step3.botEndDate
      ? `${botPeriodWithYears(step3.botStartDate, step3.botEndDate, closingDate) ?? `${step3.botStartDate} ~ ${step3.botEndDate}`} (${step3.manualWeeks}주)`
      : `${step3.manualWeeks}주`;
  const addons = [
    step3.cocBot && 'D100 룰 대응 TRPG봇',
    step3.trpg2d6Bot && '2D6 룰 대응 TRPG봇 3종',
    step3.investigationBot && step3.mainBot !== null && '조사 자동봇',
    step3.customCommandUpgrade && '커스텀 명령어 업그레이드',
    step3.reservationToot && '예약 툿',
    step3.autoProfileImage && '자동 스진',
    step3.tootCurrencyLink && '툿수-재화 자동반영',
    step3.transferFeature && '재화, 아이템 양도 기능',
    step3.attendanceSystem && (step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat') && '출석 시스템',
    step3.omakaseBot && '오마카세',
  ].filter(Boolean).join(', ');
  return [
    { label: '자동봇 가동 기간', value: step3.operationWeeksOption ? schedule : '-' },
    { label: '메인 봇', value: step3.mainBot ? MAIN_BOT_LABEL[step3.mainBot] : '-' },
    { label: '추가 옵션', value: addons || '-' },
  ];
}
