import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OrderFormData, Step1Data, Step2Data, Step3Data, Step4Data } from '@/app/types/order';
import { ORDER_STORAGE_KEY, SCHEMA_VERSION } from '@/app/types/order';
import { FORM_CONFIG } from '@/app/constants/form';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import { syncCartToOrderData, loadSyncState, clearSyncState } from '@/app/utils/cartOrderSync';
// cartOrderSync 는 이 타입을 re-export 하지 않으므로 원본에서 가져온다.
// (예전에는 잘못된 경로라 cartSyncState 가 any 로 무너져 있었다)
import type { CartSyncState } from '@/app/types/estimate-mapping';

interface OrderContextType {
  formData: OrderFormData;
  currentStep: 1 | 2 | 3 | 4;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep3: (data: Partial<Step3Data>) => void;
  updateStep4: (data: Partial<Step4Data>) => void;
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  resetForm: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  // 임시저장 복원 직후 여부 (구글 비밀번호는 저장되지 않아 재입력 안내가 필요)
  restoredFromStorage: boolean;
  syncFromCart: (cartItems: EstimateItem[], syncState?: CartSyncState | null) => void;
  cartSyncState: CartSyncState | null;
  clearCartSync: () => void;
  /** 견적함 항목으로 실제 값을 채운 단계 (Q6: 이 단계만 요약 상태로 시작). 직접 들어오거나 기존 신청서를 유지하면 null */
  cartApplied: { step2: boolean; step3: boolean } | null;
}

const initialStep1Data: Step1Data = {
  termsAgreed: null,
  applicantNickname: '',
  communityShortName: '',
  communityKoreanName: '',
  communityEnglishName: '',
  isLongTermCommunity: false,
  longTermConfirmed: false,
  resultAnnouncementDate: '',
  openingDate: '',
  closingDate: '',
  operationWeeks: 0,
  googleEmail: '',
  googlePassword: '',
};

const initialStep2Data: Step2Data = {
  applyServerInstall: null,
  additionalOption: null,
  changeCharacterLimit: false,
  characterLimitValue: 0,
  searchOption: false,
  mastoHostMigration: false,
  fastDeadline: false,
  fastDeadlineOption: null,
  desiredDeadline: '',
  adminAccountId: '',
};

const initialStep3Data: Step3Data = {
  applyBot: null,
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
};

const initialStep4Data: Step4Data = {
  policyConfirmation: '',
};

const initialFormData: OrderFormData = {
  step1: initialStep1Data,
  step2: initialStep2Data,
  step3: initialStep3Data,
  step4: initialStep4Data,
};

/**
 * 저장된 step3 데이터를 현재 스키마로 변환한다.
 * v1: accountList 가 콤마 구분 문자열이었으므로 배열로 변환하고,
 * extraAccountTiers 누락 시 0 으로 보정한다. v2 데이터는 그대로 통과한다.
 */
function migrateStep3(rawStep3: unknown): Partial<Step3Data> {
  if (!rawStep3 || typeof rawStep3 !== 'object') return {};
  const step3 = rawStep3 as Record<string, unknown>;
  const migrated: Record<string, unknown> = { ...step3 };

  if (typeof step3.accountList === 'string') {
    migrated.accountList = step3.accountList
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  } else if (!Array.isArray(step3.accountList)) {
    migrated.accountList = [];
  }

  if (typeof step3.extraAccountTiers !== 'number') {
    migrated.extraAccountTiers = 0;
  }

  return migrated as Partial<Step3Data>;
}

/**
 * 불변식: TRPG 봇(D100 / 2D6 3종세트)은 기능이 겹치는 '기본' 봇과 공존 불가. (기본+상점 이상은 허용)
 * 두 값이 동시에 들어오면 기본 봇 선택을 해제하고, 메인 봇에 딸린 옵션도 함께 정리한다.
 */
function applyCocBotExclusivity(step3: Step3Data): Step3Data {
  if (!(step3.cocBot || step3.trpg2d6Bot) || step3.mainBot !== 'basic') return step3;
  return {
    ...step3,
    mainBot: null,
    investigationBot: false,
    investigationDailyLimit: false,
    investigationDailyLimitCount: 0,
    investigationBotAccountId: '',
  };
}

/**
 * 저장본의 한 단계 값을 초기값 모양에 맞춰 합친다.
 * 초기값이 null 인 칸(선택 전 상태)은 null·문자열만, 배열은 문자열 배열만, 숫자는 유한수만, 나머지는 같은 타입일 때만 받는다.
 */
function mergeSaved<T extends object>(initial: T, raw: unknown): T {
  const merged = { ...initial } as Record<string, unknown>;
  if (!raw || typeof raw !== 'object') return merged as T;
  const source = raw as Record<string, unknown>;
  for (const [key, initialValue] of Object.entries(initial)) {
    const value = source[key];
    if (value === undefined) continue;
    if (initialValue === null) {
      if (value === null || typeof value === 'string') merged[key] = value;
    } else if (Array.isArray(initialValue)) {
      if (Array.isArray(value)) merged[key] = value.filter((entry) => typeof entry === 'string');
    } else if (typeof initialValue === 'number') {
      if (typeof value === 'number' && Number.isFinite(value)) merged[key] = value;
    } else if (typeof value === typeof initialValue) {
      merged[key] = value;
    }
  }
  return merged as T;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [cartSyncState, setCartSyncState] = useState<CartSyncState | null>(null);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);
  const [cartApplied, setCartApplied] = useState<{ step2: boolean; step3: boolean } | null>(null);
  // 저장된 신청서를 이어 쓸지 정하기 전에는 자동 저장을 멈춘다. 멈추지 않으면 복원 창이 떠 있는 동안 빈 신청서가 저장본을 덮어쓴다 (4단계 리뷰)
  const [autosaveReady, setAutosaveReady] = useState(false);

  const updateStep1 = useCallback((data: Partial<Step1Data>) => {
    setFormData(prev => {
      const step1 = { ...prev.step1, ...data };
      // 불변식: 장기 소규모 서버는 검색 옵션과 공존 불가 (저렴한 월 서버비 유지)
      // UI 효과(Step2)와 별개로 데이터 단에서도 강제 해제해, 견적·복사·요약이 항상 일치하도록 한다.
      const step2 = step1.isLongTermCommunity && prev.step2.searchOption
        ? { ...prev.step2, searchOption: false }
        : prev.step2;
      return { ...prev, step1, step2 };
    });
  }, []);

  const updateStep2 = useCallback((data: Partial<Step2Data>) => {
    setFormData(prev => ({
      ...prev,
      step2: { ...prev.step2, ...data },
    }));
  }, []);

  const updateStep3 = useCallback((data: Partial<Step3Data>) => {
    setFormData(prev => ({
      ...prev,
      step3: applyCocBotExclusivity({ ...prev.step3, ...data }),
    }));
  }, []);

  const updateStep4 = useCallback((data: Partial<Step4Data>) => {
    setFormData(prev => ({
      ...prev,
      step4: { ...prev.step4, ...data },
    }));
  }, []);

  // 장바구니에서 데이터 동기화
  const syncFromCart = useCallback((cartItems: EstimateItem[], syncStateArg?: CartSyncState | null) => {
    setAutosaveReady(true);
    // resetForm 이 저장소의 동기화 표시를 먼저 지우는 경로(견적으로 새로 작성)가 있어 호출하는 쪽에서 받은 값을 우선 쓴다
    const syncState = syncStateArg !== undefined ? syncStateArg : loadSyncState();
    if (cartItems.length === 0) return;

    const { step2, step3 } = syncCartToOrderData(cartItems);
    setCartApplied({ step2: Object.keys(step2).length > 0, step3: Object.keys(step3).length > 0 });

    setFormData(prev => {
      const mergedStep2 = { ...prev.step2, ...step2 };
      // 불변식 유지: 장기 소규모 서버면 장바구니의 검색 옵션을 무시한다.
      if (prev.step1.isLongTermCommunity) {
        mergedStep2.searchOption = false;
      }
      return {
        ...prev,
        step2: mergedStep2,
        // 불변식 유지: 장바구니에 기본 봇 + TRPG 봇이 함께 담겨 있어도 기본 봇을 해제한다.
        step3: applyCocBotExclusivity({ ...prev.step3, ...step3 }),
      };
    });

    // 화면(배너·'견적에서 선택됨' 표시)용으로는 기억하고, 저장소 표시는 지운다.
    // 남겨 두면 새로고침할 때마다 '견적 데이터 반영' 창이 다시 떠서 '견적으로 새로 작성'으로 작업을 날릴 수 있었다 (4단계 검토)
    setCartSyncState(syncState);
    clearSyncState();
  }, []);

  // 장바구니 동기화 상태 초기화
  const clearCartSync = useCallback(() => {
    clearSyncState();
    setCartSyncState(null);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setRestoredFromStorage(false);
    setCartApplied(null);
    setAutosaveReady(true);
    localStorage.removeItem(ORDER_STORAGE_KEY);
    clearCartSync();
  }, [clearCartSync]);

  // localStorage 저장 (비밀번호는 보안상 저장하지 않음)
  const saveToLocalStorage = useCallback(() => {
    if (!autosaveReady) return;
    try {
      // 아무것도 안 쓴 신청서는 저장하지 않는다 (들어왔다 나가기만 해도 다음에 '작성 중인 내용 발견'이 떴다, 4단계 검토)
      // (지우지는 않는다: 빈 탭을 닫을 때 다른 탭의 진짜 저장본을 지울 수 있다)
      if (currentStep === 1 && JSON.stringify(formData) === JSON.stringify(initialFormData)) return;
      const sanitizedFormData = {
        ...formData,
        step1: {
          ...formData.step1,
          googlePassword: '', // 비밀번호는 localStorage에 저장하지 않음
        },
      };
      const dataToSave = {
        version: SCHEMA_VERSION,
        formData: sanitizedFormData,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage 용량 초과. 이전 데이터를 정리해주세요.');
      } else {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [formData, currentStep, autosaveReady]);

  // localStorage 로드 (스키마 버전 검증 및 필드 병합)
  const loadFromLocalStorage = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      // 저장본이 없거나 못 읽어도 '기존 유지'를 고른 것이므로 그 뒤부터는 저장한다
      setAutosaveReady(true);
      if (!saved) return false;

      const parsed = JSON.parse(saved);

      // 스키마 버전 확인 (v0=추적 이전, 미래 버전은 호환 불가하므로 폐기)
      const version = parsed.version || 0;
      if (version < 1 || version > SCHEMA_VERSION) {
        localStorage.removeItem(ORDER_STORAGE_KEY);
        return false;
      }

      if (parsed && typeof parsed === 'object' && parsed.formData && typeof parsed.formData === 'object') {
        // 초기값과 같은 모양인 값만 가져온다 (null·다른 타입·NaN 이 기본값을 덮어 화면이 깨지지 않게, 4단계 검토. v1 → v2 마이그레이션 포함)
        const mergedFormData: OrderFormData = {
          step1: mergeSaved(initialStep1Data, parsed.formData.step1),
          step2: mergeSaved(initialStep2Data, parsed.formData.step2),
          step3: mergeSaved(initialStep3Data, migrateStep3(parsed.formData.step3)),
          step4: mergeSaved(initialStep4Data, parsed.formData.step4),
        };
        // 비밀번호는 저장하지 않는다. 예전·조작된 저장본에 들어 있어도 비운다
        mergedFormData.step1.googlePassword = '';
        // 고르는 값(선택지)은 정해진 값만. 이상한 값이면 선택 전 상태로
        const pick = <T,>(value: T, allowed: readonly T[]): T | null => (allowed.includes(value) ? value : null);
        mergedFormData.step1.termsAgreed = pick(mergedFormData.step1.termsAgreed, ['yes', 'no'] as const);
        mergedFormData.step2.applyServerInstall = pick(mergedFormData.step2.applyServerInstall, ['yes', 'no'] as const);
        mergedFormData.step2.additionalOption = pick(mergedFormData.step2.additionalOption, ['logo', 'dayTheme', 'nightTheme', 'bothTheme'] as const);
        mergedFormData.step2.fastDeadlineOption = pick(mergedFormData.step2.fastDeadlineOption, ['basic48h', 'basic24h', 'logo48h', 'theme48h'] as const);
        mergedFormData.step3.applyBot = pick(mergedFormData.step3.applyBot, ['yes', 'no'] as const);
        mergedFormData.step3.mainBot = pick(mergedFormData.step3.mainBot, ['basic', 'basicShop', 'basicShopStat'] as const);
        mergedFormData.step3.operationWeeksOption = pick(mergedFormData.step3.operationWeeksOption, ['longterm', 'manual'] as const);
        mergedFormData.step3.transferOption = pick(mergedFormData.step3.transferOption, ['itemOnly', 'currencyOnly', 'all'] as const);
        // 불변식 유지: 예전(변경 전) 저장본이 장기 소규모 + 검색을 동시에 담고 있어도 검색을 해제한다.
        if (mergedFormData.step1.isLongTermCommunity) {
          mergedFormData.step2.searchOption = false;
        }
        // 불변식 유지: 예전 저장본에 기본 봇 + TRPG 봇이 함께 담겨 있어도 기본 봇을 해제한다.
        mergedFormData.step3 = applyCocBotExclusivity(mergedFormData.step3);
        setFormData(mergedFormData);
        // 단계는 1~4 만 (범위 밖이면 빈 화면이 됐다)
        const step = Number(parsed.currentStep);
        setCurrentStep(Number.isInteger(step) && step >= 1 && step <= 4 ? (step as 1 | 2 | 3 | 4) : 1);
        // 비밀번호는 저장되지 않으므로 복원 시 재입력 안내 플래그 설정
        setRestoredFromStorage(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // 손상된 데이터 제거
      localStorage.removeItem(ORDER_STORAGE_KEY);
      return false;
    }
  }, []);

  // 자동 저장: 입력이 멈추고 잠깐 뒤(디바운스) 저장. 칸을 떠나지 않고 바로 새로고침해도 남도록 (4단계 리뷰)
  useEffect(() => {
    const timer = setTimeout(saveToLocalStorage, FORM_CONFIG.autosave.debounceMs);
    return () => clearTimeout(timer);
  }, [saveToLocalStorage]);

  // 페이지 떠날 때 저장 (모바일 사파리는 beforeunload 대신 pagehide 만 오는 경우가 있어 둘 다)
  useEffect(() => {
    window.addEventListener('beforeunload', saveToLocalStorage);
    window.addEventListener('pagehide', saveToLocalStorage);
    return () => {
      window.removeEventListener('beforeunload', saveToLocalStorage);
      window.removeEventListener('pagehide', saveToLocalStorage);
    };
  }, [saveToLocalStorage]);

  // 초기 마운트: 이어 쓸 저장본도 견적 반영도 없으면 바로 자동 저장 시작.
  // 동기화 상태(배너·표시)는 실제로 견적을 반영할 때만 켠다 (예전에는 '기존 신청서 유지'를 골라도 '반영되었습니다'가 떴다)
  useEffect(() => {
    const syncState = loadSyncState();
    if (!syncState?.synced && !localStorage.getItem(ORDER_STORAGE_KEY)) setAutosaveReady(true);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        formData,
        currentStep,
        updateStep1,
        updateStep2,
        updateStep3,
        updateStep4,
        setCurrentStep,
        resetForm,
        saveToLocalStorage,
        loadFromLocalStorage,
        restoredFromStorage,
        syncFromCart,
        cartSyncState,
        clearCartSync,
        cartApplied,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}
