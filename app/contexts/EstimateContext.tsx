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

/** 실행 취소를 위해 보관하는 직전 삭제 항목 */
export interface RemovedEstimateItem {
  item: EstimateItem;
  /** 삭제 전 위치. 되돌릴 때 같은 자리에 넣는다 */
  index: number;
}

interface EstimateContextType {
  items: EstimateItem[];
  addItem: (item: Omit<EstimateItem, 'id'>) => void;
  removeItem: (id: string, options?: { trackUndo?: boolean }) => void;
  clearItems: () => void;
  getTotalPrice: () => number;
  proceedToOrder: () => void;
  serverCalcResult: ServerCalcResult | null;
  setServerCalcResult: (result: ServerCalcResult | null) => void;
  /** 직전에 삭제한 항목 (실행 취소 알림용). 되돌리거나 닫으면 비워진다 */
  lastRemoved: RemovedEstimateItem | null;
  undoRemove: () => void;
  dismissLastRemoved: () => void;
  /** 견적함에서 '수정'을 눌러 이동할 때, 상품 페이지에서 강조할 항목 이름 */
  editTargetName: string | null;
  setEditTargetName: (name: string | null) => void;
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

/**
 * 삭제했던 항목을 원래 자리에 되돌린다.
 *
 * 같은 항목이 이미 다시 담겨 있으면 넣지 않는다. id 는 addItem 이 매번 새로 발급하므로
 * id 뿐 아니라 이름으로도 확인해야 '검색 기능' 이 두 줄로 남아 금액이 두 배가 되는 걸 막을 수 있다.
 */
export function insertRemovedItem(
  items: EstimateItem[],
  removed: RemovedEstimateItem
): EstimateItem[] {
  const alreadyPresent = items.some(
    (item) => item.id === removed.item.id || item.name === removed.item.name
  );
  if (alreadyPresent) return items;

  const next = [...items];
  next.splice(Math.min(Math.max(removed.index, 0), next.length), 0, removed.item);
  return next;
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EstimateItem[]>(() => loadEstimateFromStorage());
  const [serverCalcResult, setServerCalcResultState] = useState<ServerCalcResult | null>(
    () => loadServerCalcFromStorage()
  );
  const [lastRemoved, setLastRemoved] = useState<RemovedEstimateItem | null>(null);
  const [editTargetName, setEditTargetName] = useState<string | null>(null);

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
    // 새로 담았으면 직전 삭제 되돌리기는 의미가 없다
    setLastRemoved(null);

    // 항목 추가 시 동기화 상태 초기화 (새로운 동기화 필요)
    clearSyncState();
  };

  /**
   * 견적 항목 제거.
   *
   * `trackUndo` 는 견적함에서 삭제 버튼을 눌렀을 때만 켠다.
   * 상품 페이지에서 옵션을 토글하거나(선택 해제) 규칙에 따라 자동 제거되는 경우까지 기록하면,
   * 나중에 견적함에 들어갔을 때 엉뚱한 '실행 취소' 알림이 떠 버린다.
   */
  const removeItem = (id: string, options?: { trackUndo?: boolean }) => {
    const index = items.findIndex((item) => item.id === id);
    const target = items[index];
    // 자동 포함 항목(실비)은 개별 제거를 허용하지 않는다.
    if (!target || target.locked) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (options?.trackUndo) {
      setLastRemoved({ item: target, index });
    }
    // 항목 제거 시 동기화 상태 초기화
    clearSyncState();
  };

  /** 삭제한 항목을 원래 자리에 되돌린다 */
  const undoRemove = useCallback(() => {
    if (!lastRemoved) return;

    setItems((prev) => insertRemovedItem(prev, lastRemoved));
    setLastRemoved(null);
    clearSyncState();
  }, [lastRemoved]);

  const dismissLastRemoved = useCallback(() => setLastRemoved(null), []);

  const clearItems = () => {
    setItems([]);
    setLastRemoved(null);
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
      value={{
        items,
        addItem,
        removeItem,
        clearItems,
        getTotalPrice,
        proceedToOrder,
        serverCalcResult,
        setServerCalcResult,
        lastRemoved,
        undoRemove,
        dismissLastRemoved,
        editTargetName,
        setEditTargetName,
      }}
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
