/**
 * STEP3 자동봇 상태·규칙 (기존 Step3Bot.tsx 의 로직을 그대로 옮김, 3단계 5번).
 *  가동 일정 기본값, 주수 자동 계산, 마감 불가 기간·계정 아이디 즉시 검증, 메인 봇·조사 자동봇·TRPG 봇 의존 초기화,
 *  예약 툿·자동 스진 계정 목록(무료 칸·추가 구매·환불) 규칙.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import {
  extractMonthDay,
  getDeadlineBlackoutError,
  getPrimaryBotAccountLabel,
  needsMainBotAccountId,
  validateAccountId,
} from '@/app/utils/orderUtils';
import { ACCOUNT_LIST_CONFIG } from '@/app/constants/form';

// 예약 툿/자동 스진용 추가 계정 정책 (constants/form.ts 와 공유)
export const {
  freeExtraSlotsWithAdmin: FREE_EXTRA_SLOTS_WITH_ADMIN,
  freeExtraSlotsNoAdmin: FREE_EXTRA_SLOTS_NO_ADMIN,
  maxTiers: MAX_ACCOUNT_TIERS,
  slotsPerTier: SLOTS_PER_TIER,
} = ACCOUNT_LIST_CONFIG;

// yyyy-mm-dd → MM/DD
function ymdToMonthDay(date: string): string {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length !== 3) return '';
  const m = (parts[1] || '').padStart(2, '0');
  const d = (parts[2] || '').padStart(2, '0');
  if (!m || !d || m === '00' || d === '00') return '';
  return `${m}/${d}`;
}

// MM/DD 입력값 정리. '6/16'처럼 구분자를 직접 쓰면 그대로 두고(예전에는 숫자만 모아 '61/6'이 됐다, 4단계 검토),
// 숫자만 치면 2자리 뒤에 '/'를 넣는다 ('0616' → '06/16'). 전각 숫자도 받는다
export function normalizeMonthDayInput(raw: string): string {
  const value = raw.normalize('NFKC');
  const typed = value.match(/^\s*(\d{0,2})\s*[/.\-]\s*(\d{0,2})/);
  if (typed) return `${typed[1]}/${typed[2]}`;
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// 원 단위 금액을 "n.n만원" 형태로 표시 (정수면 소수점 생략)
export function formatManwon(won: number): string {
  if (!won || won <= 0) return '0원';
  const man = won / 10000;
  if (Number.isInteger(man)) return `${man}만원`;
  return `${man.toFixed(1)}만원`;
}

// MM/DD ~ MM/DD 사이 주수 계산. 종료일은 폐장일 연도(baseYear), 시작일이 더 늦은 날짜면 그 전 해로 본다.
// 없는 날짜(2/31 등)나 읽을 수 없는 입력은 0 → validateStep3 가 날짜를 다시 묻는다
function calculateWeeksFromMonthDay(start: string, end: string, baseYear: number): number {
  const s = extractMonthDay(start);
  const e = extractMonthDay(end);
  if (!s || !e) return 0;
  const startYear = s.month * 100 + s.day > e.month * 100 + e.day ? baseYear - 1 : baseYear;
  const startDate = new Date(startYear, s.month - 1, s.day);
  const endDate = new Date(baseYear, e.month - 1, e.day);
  if (startDate.getDate() !== s.day || endDate.getDate() !== e.day) return 0;
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, Math.round(diffDays / 7));
}

export function useStep3Bot() {
  const { formData, updateStep3, cartSyncState } = useOrder();
  const step3 = formData.step3;
  const step1 = formData.step1;
  const step2 = formData.step2;

  // 견적에서 동기화된 항목인지 확인
  const isFromCart = (itemName: string) => {
    return cartSyncState?.syncedItems?.some(name =>
      name.includes(itemName) || itemName.includes(name)
    ) ?? false;
  };

  // 봇 타입이 견적에서 선택되었는지
  const basicBotFromCart = isFromCart('기본 타입');
  const basicShopBotFromCart = isFromCart('기본&상점 타입') && !isFromCart('기본&상점&스탯');
  const basicShopStatBotFromCart = isFromCart('기본&상점&스탯 타입');
  // 추가 기능이 견적에서 선택되었는지
  const cocBotFromCart = isFromCart('D100');
  const trpg2d6BotFromCart = isFromCart('2D6');
  const customCommandUpgradeFromCart = isFromCart('커스텀 명령어');
  const reservationFromCart = isFromCart('예약 툿');
  const autoProfileFromCart = isFromCart('스토리 자동 진행');
  const tootCurrencyFromCart = isFromCart('툿수-재화 자동반영');
  const transferFromCart = isFromCart('재화, 아이템 양도 기능');
  const attendanceFromCart = isFromCart('출석 시스템');
  const omakaseFromCart = isFromCart('오마카세');
  const investigationFromCart = isFromCart('자동조사');

  // 자동봇 신청 시 가동 일정 기본값 채우기.
  // 견적에서 넘어와 이미 'manual'이어도 날짜가 비어 있으면 채운다 (안 그러면 0주로 덮여 가동비가 0원이 됐다, 4단계 검토)
  // 날짜 자동 채움은 화면이 열린 뒤 한 번만 (지운 칸이 곧바로 다시 채워져 새로 입력할 수 없던 문제)
  const datesAutoFilled = useRef(false);
  useEffect(() => {
    if (step3.applyBot !== 'yes') return;
    if (step3.operationWeeksOption === 'longterm') return;
    // 장기 소규모 서버(Step1 체크)는 일정이 없으므로 장기 자동봇(세팅비)을 기본값으로.
    // 그렇지 않으면 manual + 빈 날짜 → 0주 → 가동비 0원 과소견적 함정에 빠진다.
    if (step3.operationWeeksOption === null && step1.isLongTermCommunity) {
      updateStep3({ operationWeeksOption: 'longterm', manualWeeks: 0 });
      return;
    }
    const updates: Record<string, unknown> = step3.operationWeeksOption === null ? { operationWeeksOption: 'manual' } : {};
    const fillDates = !datesAutoFilled.current;
    datesAutoFilled.current = true;
    if (fillDates && !step3.botStartDate && step1.resultAnnouncementDate) {
      updates.botStartDate = ymdToMonthDay(step1.resultAnnouncementDate);
    }
    if (fillDates && !step3.botEndDate && step1.closingDate) {
      updates.botEndDate = ymdToMonthDay(step1.closingDate);
    }
    if (Object.keys(updates).length > 0) updateStep3(updates);
  }, [
    step3.applyBot,
    step3.operationWeeksOption,
    step3.botStartDate,
    step3.botEndDate,
    step1.isLongTermCommunity,
    step1.resultAnnouncementDate,
    step1.closingDate,
    updateStep3,
  ]);

  // 가동 주수 자동 계산 (manual 모드)
  const computedBotWeeks = useMemo(() => {
    if (step3.operationWeeksOption !== 'manual') return 0;
    if (!step3.botStartDate || !step3.botEndDate) return 0;
    const baseYear = step1.closingDate
      ? parseInt(step1.closingDate.split('-')[0], 10) || new Date().getFullYear()
      : new Date().getFullYear();
    return calculateWeeksFromMonthDay(step3.botStartDate, step3.botEndDate, baseYear);
  }, [step3.operationWeeksOption, step3.botStartDate, step3.botEndDate, step1.closingDate]);

  useEffect(() => {
    if (step3.operationWeeksOption !== 'manual') return;
    if (computedBotWeeks !== step3.manualWeeks) {
      updateStep3({ manualWeeks: computedBotWeeks });
    }
  }, [computedBotWeeks, step3.manualWeeks, step3.operationWeeksOption, updateStep3]);

  // 세팅 마감일 접수 불가 기간(마감 중단/휴가) 안내
  const setupDeadlineBlackoutError = useMemo(
    () => getDeadlineBlackoutError(step3.setupDeadline, 'setupDeadline'),
    [step3.setupDeadline]
  );

  // 계정 아이디 규칙(3자 이상 / admin·owner·moderator 불가) 실시간 안내
  // 빈칸은 다음 단계 진행 시 필수 검증에서 걸러지므로 입력 중에는 표시하지 않는다.
  const botAccountIdError = useMemo(
    () =>
      step3.botAccountId.trim() === ''
        ? null
        : validateAccountId(step3.botAccountId, 'botAccountId', '봇 계정 ID'),
    [step3.botAccountId]
  );
  const investigationBotAccountIdError = useMemo(
    () =>
      step3.investigationBotAccountId.trim() === ''
        ? null
        : validateAccountId(
          step3.investigationBotAccountId,
          'investigationBotAccountId',
          '조사 자동봇 계정 ID'
        ),
    [step3.investigationBotAccountId]
  );

  // 양도 기능 노출 조건: 상점 또는 스탯 선택 시
  const showTransferFeature =
    step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat';

  // 출석 시스템 노출 조건: 상점 또는 스탯 선택 시
  const showAttendanceSystem = showTransferFeature;

  // 재화 단위 필드 노출 조건: 상점 또는 스탯
  const showCurrencyUnit = showTransferFeature;

  // 스탯 목록 필드 노출 조건: 스탯 선택 시
  const showStatList = step3.mainBot === 'basicShopStat';

  // "아니오" 선택 시 모든 하위 필드 초기화
  const handleBotApplyChange = (value: 'yes' | 'no') => {
    updateStep3({ applyBot: value });
    if (value === 'no') {
      updateStep3({
        operationWeeksOption: null,
        manualWeeks: 0,
        botStartDate: '',
        botEndDate: '',
        mainBot: null,
        cocBot: false,
        trpg2d6Bot: false,
        omakaseBot: false,
        investigationBot: false,
        investigationDailyLimit: false,
        investigationDailyLimitCount: 0,
        customCommandUpgrade: false,
        reservationToot: false,
        autoProfileImage: false,
        tootCurrencyLink: false,
        transferFeature: false,
        transferOption: null,
        attendanceSystem: false,
        attendanceCurrencyAmount: 10,
        attendanceCommand: '[출석]',
        currencyUnit: '',
        statList: '',
        accountList: [],
        extraAccountTiers: 0,
        tootPerCurrency: '',
        omakaseDetails: '',
        setupDeadline: '',
        botSymbol: '✶',
        botAccountId: '',
        investigationBotAccountId: '',
      });
    }
  };

  // 메인 봇 변경 시 의존 필드 초기화
  const handleMainBotChange = (bot: typeof step3.mainBot) => {
    updateStep3({ mainBot: bot });

    // 타입을 바꿔 안 쓰게 된 입력값은 비운다 (남으면 복사문에 '스탯'·'재화 단위'가 그대로 찍혔다, 4단계 검토)
    if (bot !== 'basicShopStat') updateStep3({ statList: '' });
    if (bot !== 'basicShop' && bot !== 'basicShopStat') updateStep3({ currencyUnit: '' });

    // 기본 봇 선택 시 상점/스탯 의존 옵션 초기화
    if (bot === 'basic') {
      updateStep3({
        transferFeature: false,
        transferOption: null,
        attendanceSystem: false,
        tootCurrencyLink: false,
        tootPerCurrency: '',
      });
    }

    // 메인 봇 미선택 시 조사 자동봇 및 하위 옵션 초기화
    if (bot === null) {
      updateStep3({
        investigationBot: false,
        investigationDailyLimit: false,
        investigationDailyLimitCount: 0,
        investigationBotAccountId: '',
      });
    }

    // 메인 봇 미선택 시 상점/스탯 의존 옵션 초기화
    if (bot === null) {
      updateStep3({
        attendanceSystem: false,
        transferFeature: false,
        transferOption: null,
        tootCurrencyLink: false,
        tootPerCurrency: '',
      });
    }
  };

  // TRPG 봇을 고르면 기능이 겹치는 '기본' 타입 선택이 풀린다 (OrderContext 규칙). 말없이 풀리지 않게 알린다
  const [trpgNotice, setTrpgNotice] = useState<string | null>(null);
  const handleTrpgChange = (key: 'cocBot' | 'trpg2d6Bot', checked: boolean) => {
    setTrpgNotice(checked && step3.mainBot === 'basic'
      ? '기본 타입은 D100·2D6 TRPG봇과 기능이 겹쳐 선택을 해제했어요. 함께 쓰시려면 기본&상점 이상을 골라 주세요.'
      : null);
    updateStep3({ [key]: checked });
  };

  // 조사 자동봇 해제 시 일일 횟수 제한 초기화
  const handleInvestigationBotChange = (checked: boolean) => {
    updateStep3({ investigationBot: checked });
    if (!checked) {
      updateStep3({
        investigationDailyLimit: false,
        investigationDailyLimitCount: 0,
        investigationBotAccountId: '',
      });
    }
  };

  // 조사 자동봇 사용 가능 조건 (메인 봇이 선택된 경우)
  const canHaveInvestigationBot = step3.mainBot !== null;

  // TRPG 봇(D100 / 2D6)은 기본 봇과 기능이 겹쳐 함께 선택 불가 (기본&상점 이상은 허용)
  const basicBotBlockedByCoc = step3.cocBot || step3.trpg2d6Bot;
  const blockingTrpgBotNames = [
    step3.cocBot && 'D100 룰 대응 TRPG봇',
    step3.trpg2d6Bot && '2D6 룰 대응 TRPG봇 3종',
  ].filter(Boolean).join(', ');

  // 분리 계정 입력 노출 조건
  // D100 / 2D6 봇 계정은 운영자가 직접 세팅하므로 아이디를 받지 않는다
  const showMainBotAccount = needsMainBotAccountId(step3);
  const showInvestigationBotAccount =
    step3.investigationBot && canHaveInvestigationBot;
  const primaryAccountLabel = getPrimaryBotAccountLabel(step3);

  // ── 예약 툿/자동 스진용 계정 목록 ──────────────────────────────
  const showAccountList = step3.reservationToot || step3.autoProfileImage;
  const hasAdminAccount = step2.adminAccountId.trim() !== '';
  const accounts = step3.accountList;
  const accountTiers = Math.min(MAX_ACCOUNT_TIERS, Math.max(0, step3.extraAccountTiers));
  const freeExtraSlots = hasAdminAccount
    ? FREE_EXTRA_SLOTS_WITH_ADMIN
    : FREE_EXTRA_SLOTS_NO_ADMIN;
  const maxExtraSlots = freeExtraSlots + accountTiers * SLOTS_PER_TIER;
  const totalRegistered = (hasAdminAccount ? 1 : 0) + accounts.length;
  const totalMaxAccounts = (hasAdminAccount ? 1 : 0) + maxExtraSlots;
  const canAddAccountSlot = accounts.length < maxExtraSlots;
  // 총괄 계정을 나중에 입력하는 등으로 무료 한도를 넘긴 경우
  const isOverCapacity = accounts.length > maxExtraSlots;
  const canBuyAccountTier =
    accountTiers < MAX_ACCOUNT_TIERS && accounts.length >= maxExtraSlots;
  const canRefundAccountTier =
    accountTiers > 0 && accounts.length <= freeExtraSlots + (accountTiers - 1) * SLOTS_PER_TIER;

  // 예약 툿/자동 스진을 모두 해제하면 계정 목록 초기화
  const handleReservationTootChange = (checked: boolean) => {
    const resetAccounts = !checked && !step3.autoProfileImage;
    updateStep3({
      reservationToot: checked,
      ...(resetAccounts ? { accountList: [], extraAccountTiers: 0 } : {}),
    });
  };

  const handleAutoProfileImageChange = (checked: boolean) => {
    const resetAccounts = !checked && !step3.reservationToot;
    updateStep3({
      autoProfileImage: checked,
      ...(resetAccounts ? { accountList: [], extraAccountTiers: 0 } : {}),
    });
  };

  const addAccountSlot = () => {
    if (accounts.length >= maxExtraSlots) return;
    updateStep3({ accountList: [...accounts, ''] });
  };

  const removeAccountSlot = (index: number) => {
    updateStep3({ accountList: accounts.filter((_, i) => i !== index) });
  };

  const updateAccountSlot = (index: number, value: string) => {
    updateStep3({
      accountList: accounts.map((account, i) => (i === index ? value : account)),
    });
  };

  const buyAccountTier = () => {
    if (accountTiers >= MAX_ACCOUNT_TIERS) return;
    updateStep3({ extraAccountTiers: accountTiers + 1 });
  };

  const refundAccountTier = () => {
    if (accountTiers <= 0) return;
    const nextTiers = accountTiers - 1;
    const nextMax = freeExtraSlots + nextTiers * SLOTS_PER_TIER;
    updateStep3({
      extraAccountTiers: nextTiers,
      accountList: accounts.slice(0, nextMax),
    });
  };

  return {
    step1, step2, step3, updateStep3,
    fromCart: {
      basicBot: basicBotFromCart, basicShopBot: basicShopBotFromCart, basicShopStatBot: basicShopStatBotFromCart,
      cocBot: cocBotFromCart, trpg2d6Bot: trpg2d6BotFromCart, customCommandUpgrade: customCommandUpgradeFromCart,
      reservation: reservationFromCart, autoProfile: autoProfileFromCart, tootCurrency: tootCurrencyFromCart,
      transfer: transferFromCart, attendance: attendanceFromCart, omakase: omakaseFromCart, investigation: investigationFromCart,
    },
    setupDeadlineBlackoutError, botAccountIdError, investigationBotAccountIdError,
    showTransferFeature, showAttendanceSystem, showCurrencyUnit, showStatList,
    handleBotApplyChange, handleMainBotChange, handleInvestigationBotChange, handleTrpgChange, trpgNotice,
    canHaveInvestigationBot, basicBotBlockedByCoc, blockingTrpgBotNames,
    showMainBotAccount, showInvestigationBotAccount, primaryAccountLabel,
    showAccountList, hasAdminAccount, accounts, accountTiers, totalRegistered, totalMaxAccounts,
    canAddAccountSlot, isOverCapacity, canBuyAccountTier, canRefundAccountTier,
    handleReservationTootChange, handleAutoProfileImageChange,
    addAccountSlot, removeAccountSlot, updateAccountSlot, buyAccountTier, refundAccountTier,
  };
}

export type Step3State = ReturnType<typeof useStep3Bot>;
