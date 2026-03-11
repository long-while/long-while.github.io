import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { EstimateMappingKey } from '@/app/types/estimate-mapping';
import { ESTIMATE_NAME_TO_MAPPING_KEY } from '@/app/types/estimate-mapping';
import { saveSyncState, clearSyncState } from '@/app/utils/cartOrderSync';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';

export interface EstimateItem {
  id: string;
  name: string;
  price: number;
  category: 'server' | 'bot';
  description?: string;
  mappingKey?: EstimateMappingKey;
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

// localStorage에서 견적 데이터 불러오기
function loadEstimateFromStorage(): EstimateItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('견적 데이터 불러오기 실패:', error);
  }
  return [];
}

// localStorage에 견적 데이터 저장하기
function saveEstimateToStorage(items: EstimateItem[]): void {
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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      mappingKey,
    };
    setItems((prev) => [...prev, newItem]);
    
    // 항목 추가 시 동기화 상태 초기화 (새로운 동기화 필요)
    clearSyncState();
  };

  const removeItem = (id: string) => {
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
