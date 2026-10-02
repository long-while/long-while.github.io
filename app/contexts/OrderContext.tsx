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
  syncFromCart: (cartItems: EstimateItem[]) => void;
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
  const syncFromCart = useCallback((cartItems: EstimateItem[]) => {
    setAutosaveReady(true);
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

    // 동기화 상태 업데이트
    const syncState = loadSyncState();
    setCartSyncState(syncState);
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

      if (parsed.formData && parsed.currentStep) {
        // 기존 데이터와 초기값을 병합하여 누락된 필드 방지 (v1 → v2 마이그레이션 포함)
        const mergedFormData: OrderFormData = {
          step1: { ...initialStep1Data, ...parsed.formData.step1 },
          step2: { ...initialStep2Data, ...parsed.formData.step2 },
          step3: { ...initialStep3Data, ...migrateStep3(parsed.formData.step3) },
          step4: { ...initialStep4Data, ...parsed.formData.step4 },
        };
        // 불변식 유지: 예전(변경 전) 저장본이 장기 소규모 + 검색을 동시에 담고 있어도 검색을 해제한다.
        if (mergedFormData.step1.isLongTermCommunity) {
          mergedFormData.step2.searchOption = false;
        }
        // 불변식 유지: 예전 저장본에 기본 봇 + TRPG 봇이 함께 담겨 있어도 기본 봇을 해제한다.
        mergedFormData.step3 = applyCocBotExclusivity(mergedFormData.step3);
        setFormData(mergedFormData);
        setCurrentStep(parsed.currentStep);
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

  // 초기 마운트: 동기화 상태 확인, 이어 쓸 저장본이 없으면 바로 자동 저장 시작
  useEffect(() => {
    const syncState = loadSyncState();
    if (syncState?.synced) {
      setCartSyncState(syncState);
    }
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
