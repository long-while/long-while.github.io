import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { EstimateMappingKey } from '@/app/types/estimate-mapping';
import { ESTIMATE_NAME_TO_MAPPING_KEY } from '@/app/types/estimate-mapping';
import { saveSyncState, clearSyncState } from '@/app/utils/cartOrderSync';
import {
  SERVER_INSTALL_ITEM_NAME,
  SERVER_INFRA_FEE_ITEM,
  LONG_TERM_MIN_MONTHS,
} from '@/app/constants/form';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';

export interface EstimateItem {
  id: string;
  name: string;
  price: number;
  category: 'server' | 'bot';
  description?: string;
  mappingKey?: EstimateMappingKey;
  /** 자동 포함 항목: 사용자가 개별로 제거할 수 없다 */
  locked?: boolean;
}

interface EstimateContextType {
  items: EstimateItem[];
  addItem: (item: Omit<EstimateItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  getTotalPrice: () => number;
  proceedToOrder: () => void;
  serverCalcResult: ServerCalcResult | null;
  setServerCalcResult: (result: ServerCalcResult | null) => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

const STORAGE_KEY = 'mas_commission_estimate';
const SERVER_CALC_KEY = 'mas_commission_server_calc';

/**
 * 더 이상 판매하지 않는 항목 이름.
 * 이전에 담아둔 장바구니가 localStorage 에 남아 있으면 사라진 옵션이 계속 견적에 잡히므로
 * 불러오는 시점에 걸러낸다. ('마스토돈 가이드'는 서버 설치 시 무료 제공으로 전환)
 */
const RETIRED_ITEM_NAMES = ['마스토돈 가이드'];

// localStorage에서 견적 데이터 불러오기
function loadEstimateFromStorage(): EstimateItem[] {
  // 빌드 타임 프리렌더(Node)에는 localStorage 가 없다
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored) as EstimateItem[];
      return items.filter((item) => !RETIRED_ITEM_NAMES.includes(item.name));
    }
  } catch (error) {
    console.error('견적 데이터 불러오기 실패:', error);
  }
  return [];
}

// localStorage에 견적 데이터 저장하기
function saveEstimateToStorage(items: EstimateItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('견적 데이터 저장 실패:', error);
  }
}

function isValidServerCalcResult(obj: unknown): obj is ServerCalcResult {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.type === 'string' &&
    ['gcp', 'vultr', 'warn'].includes(r.type) &&
    typeof r.months === 'number' &&
    typeof r.usersKey === 'string' &&
    typeof r.search === 'string'
  );
}

function loadServerCalcFromStorage(): ServerCalcResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(SERVER_CALC_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isValidServerCalcResult(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveServerCalcToStorage(result: ServerCalcResult | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (result) {
      localStorage.setItem(SERVER_CALC_KEY, JSON.stringify(result));
    } else {
      localStorage.removeItem(SERVER_CALC_KEY);
    }
  } catch {
    // ignore
  }
}

/** 견적 항목 id 생성 */
function createItemId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 11);
}

/**
 * 서버 설치 실비(도메인·SMTP) 항목을 견적 상태에 맞춰 강제 동기화한다.
 * - 서버 설치가 담겨 있고 장기 소규모 서버가 아니면 항상 1개 포함
 * - 그 외에는 제거 (중복도 정리)
 * 바뀔 게 없으면 입력 배열을 그대로 돌려줘 불필요한 리렌더링을 막는다.
 */
export function syncInfraFeeItem(items: EstimateItem[], shouldInclude: boolean): EstimateItem[] {
  const feeItems = items.filter((item) => item.name === SERVER_INFRA_FEE_ITEM.name);

  if (!shouldInclude) {
    if (feeItems.length === 0) return items;
    return items.filter((item) => item.name !== SERVER_INFRA_FEE_ITEM.name);
  }

  const [existing, ...duplicates] = feeItems;
  const isUpToDate =
    existing !== undefined &&
    existing.price === SERVER_INFRA_FEE_ITEM.price &&
    existing.description === SERVER_INFRA_FEE_ITEM.description &&
    existing.locked === true;
  if (isUpToDate && duplicates.length === 0) return items;

  const withoutFee = items.filter((item) => item.name !== SERVER_INFRA_FEE_ITEM.name);
  const feeItem: EstimateItem = {
    id: existing?.id ?? createItemId(),
    name: SERVER_INFRA_FEE_ITEM.name,
    price: SERVER_INFRA_FEE_ITEM.price,
    description: SERVER_INFRA_FEE_ITEM.description,
    category: 'server',
    locked: true,
  };

  // 서버 설치 본품 바로 뒤에 붙여 견적서에서 함께 읽히게 한다.
  const anchorIndex = withoutFee.findIndex((item) => item.name === SERVER_INSTALL_ITEM_NAME);
  if (anchorIndex === -1) return [...withoutFee, feeItem];
  return [
    ...withoutFee.slice(0, anchorIndex + 1),
    feeItem,
    ...withoutFee.slice(anchorIndex + 1),
  ];
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EstimateItem[]>(() => loadEstimateFromStorage());
  const [serverCalcResult, setServerCalcResultState] = useState<ServerCalcResult | null>(
    () => loadServerCalcFromStorage()
  );

  const setServerCalcResult = useCallback((result: ServerCalcResult | null) => {
    setServerCalcResultState(result);
    saveServerCalcToStorage(result);
  }, []);

  const addItem = (item: Omit<EstimateItem, 'id'>) => {
    // mappingKey가 없으면 이름으로 자동 매핑
    const mappingKey = item.mappingKey || ESTIMATE_NAME_TO_MAPPING_KEY[item.name];
    
    const newItem: EstimateItem = {
      ...item,
      id: createItemId(),
      mappingKey,
    };
    setItems((prev) => [...prev, newItem]);
    
    // 항목 추가 시 동기화 상태 초기화 (새로운 동기화 필요)
    clearSyncState();
  };

  const removeItem = (id: string) => {
    const target = items.find((item) => item.id === id);
    // 자동 포함 항목(실비)은 개별 제거를 허용하지 않는다.
    if (!target || target.locked) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    // 항목 제거 시 동기화 상태 초기화
    clearSyncState();
  };

  const clearItems = () => {
    setItems([]);
    clearSyncState();
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  // 신청서로 이동하면서 동기화 상태 저장
  const proceedToOrder = () => {
    saveSyncState(items);
  };

  // 서버 설치 실비 자동 포함 여부: 장기 소규모(12개월 이상) 서버는 제외한다.
  const isLongTermServer = (serverCalcResult?.months ?? 0) >= LONG_TERM_MIN_MONTHS;
  const needsInfraFee =
    items.some((item) => item.name === SERVER_INSTALL_ITEM_NAME) && !isLongTermServer;

  // 사용자 조작과 무관하게 실비 항목 상태를 항상 맞춰준다.
  useEffect(() => {
    setItems((prev) => syncInfraFeeItem(prev, needsInfraFee));
  }, [needsInfraFee, items]);

  // items가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveEstimateToStorage(items);
  }, [items]);

  return (
    <EstimateContext.Provider
      value={{ items, addItem, removeItem, clearItems, getTotalPrice, proceedToOrder, serverCalcResult, setServerCalcResult }}
    >
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimate() {
  const context = useContext(EstimateContext);
  if (context === undefined) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
}
