import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { OrderFormData, Step1Data, Step2Data, Step3Data, Step4Data } from '@/app/types/order';
import { ORDER_STORAGE_KEY, SCHEMA_VERSION } from '@/app/types/order';
import { FORM_CONFIG } from '@/app/constants/form';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import { syncCartToOrderData, loadSyncState, clearSyncState, type CartSyncState } from '@/app/utils/cartOrderSync';

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
}

const initialStep1Data: Step1Data = {
  termsAgreed: null,
  applicantNickname: '',
  communityShortName: '',
  communityKoreanName: '',
  communityEnglishName: '',
  isLongTermCommunity: false,
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
  notionGuide: false,
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
  cocBotAccountId: '',
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

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [cartSyncState, setCartSyncState] = useState<CartSyncState | null>(null);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  const updateStep1 = useCallback((data: Partial<Step1Data>) => {
    setFormData(prev => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
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
      step3: { ...prev.step3, ...data },
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
    if (cartItems.length === 0) return;

    const { step2, step3 } = syncCartToOrderData(cartItems);

    setFormData(prev => ({
      ...prev,
      step2: { ...prev.step2, ...step2 },
      step3: { ...prev.step3, ...step3 },
    }));

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
    localStorage.removeItem(ORDER_STORAGE_KEY);
    clearCartSync();
  }, [clearCartSync]);

  // localStorage 저장 (비밀번호는 보안상 저장하지 않음)
  const saveToLocalStorage = useCallback(() => {
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
  }, [formData, currentStep]);

  // localStorage 로드 (스키마 버전 검증 및 필드 병합)
  const loadFromLocalStorage = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
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

  // 자동 저장
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage();
    }, FORM_CONFIG.autosave.intervalMs);

    return () => clearInterval(interval);
  }, [saveToLocalStorage]);

  // 페이지 떠날 때 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveToLocalStorage]);

  // 초기 마운트 시 동기화 상태 확인
  useEffect(() => {
    const syncState = loadSyncState();
    if (syncState?.synced) {
      setCartSyncState(syncState);
    }
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
