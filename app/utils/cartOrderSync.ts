/**
 * 장바구니(견적) → 주문(신청서) 동기화 유틸리티
 */

import type { EstimateItem } from '@/app/contexts/EstimateContext';
import type { Step2Data, Step3Data } from '@/app/types/order';
import {
  ESTIMATE_NAME_TO_MAPPING_KEY,
  MAPPING_KEY_TO_ORDER_FIELD,
  CART_SYNC_KEY,
  type CartSyncState,
  type EstimateMappingKey,
} from '@/app/types/estimate-mapping';

// 견적 항목에서 mappingKey 추출
export function getMappingKeyFromItem(item: EstimateItem): EstimateMappingKey | undefined {
  // 먼저 item에 직접 mappingKey가 있는지 확인
  if (item.mappingKey) {
    return item.mappingKey;
  }
  // 없으면 이름으로 매핑
  return ESTIMATE_NAME_TO_MAPPING_KEY[item.name];
}

// 가동료 항목에서 주수 추출
export function extractOperationWeeks(item: EstimateItem): number | null {
  const match = item.name.match(/기본 가동료 \((\d+)주\)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

// 장바구니 항목을 신청서 데이터로 변환
export function syncCartToOrderData(
  cartItems: EstimateItem[]
): { step2: Partial<Step2Data>; step3: Partial<Step3Data> } {
  const step2Updates: Partial<Step2Data> = {};
  const step3Updates: Partial<Step3Data> = {};

  cartItems.forEach(item => {
    // 가동료 특별 처리
    const weeks = extractOperationWeeks(item);
    if (weeks !== null) {
      step3Updates.operationWeeksOption = 'manual';
      step3Updates.manualWeeks = weeks;
      return;
    }

    // 일반 항목 매핑
    const mappingKey = getMappingKeyFromItem(item);
    if (!mappingKey) return;

    const fieldMappings = MAPPING_KEY_TO_ORDER_FIELD[mappingKey];
    if (!fieldMappings) return;

    fieldMappings.forEach(mapping => {
      if (mapping.step === 2) {
        (step2Updates as Record<string, unknown>)[mapping.field] = mapping.value;
      } else if (mapping.step === 3) {
        (step3Updates as Record<string, unknown>)[mapping.field] = mapping.value;
      }
    });
  });

  return { step2: step2Updates, step3: step3Updates };
}

// 동기화 상태 저장
export function saveSyncState(cartItems: EstimateItem[]): void {
  const syncState: CartSyncState = {
    synced: true,
    syncedAt: new Date().toISOString(),
    itemCount: cartItems.length,
    syncedItems: cartItems.map(item => item.name),
  };

  try {
    localStorage.setItem(CART_SYNC_KEY, JSON.stringify(syncState));
  } catch (error) {
    console.error('Failed to save sync state:', error);
  }
}

// 동기화 상태 불러오기
export function loadSyncState(): CartSyncState | null {
  try {
    const stored = localStorage.getItem(CART_SYNC_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load sync state:', error);
  }
  return null;
}

// 동기화 상태 초기화
export function clearSyncState(): void {
  try {
    localStorage.removeItem(CART_SYNC_KEY);
  } catch (error) {
    console.error('Failed to clear sync state:', error);
  }
}

// 동기화 여부 확인
export function isSynced(): boolean {
  const state = loadSyncState();
  return state?.synced ?? false;
}

// 서버 관련 항목이 있는지 확인
export function hasServerItems(cartItems: EstimateItem[]): boolean {
  return cartItems.some(item => {
    const mappingKey = getMappingKeyFromItem(item);
    if (!mappingKey) return false;
    const mappings = MAPPING_KEY_TO_ORDER_FIELD[mappingKey];
    return mappings?.some(m => m.step === 2);
  });
}

// 봇 관련 항목이 있는지 확인
export function hasBotItems(cartItems: EstimateItem[]): boolean {
  return cartItems.some(item => {
    const mappingKey = getMappingKeyFromItem(item);
    if (!mappingKey) return false;
    const mappings = MAPPING_KEY_TO_ORDER_FIELD[mappingKey];
    return mappings?.some(m => m.step === 3);
  });
}

// 동기화된 항목 이름 목록 가져오기
export function getSyncedItemNames(): string[] {
  const state = loadSyncState();
  return state?.syncedItems ?? [];
}

// 특정 항목이 장바구니에서 동기화된 항목인지 확인
export function isItemFromCart(itemName: string): boolean {
  const syncedItems = getSyncedItemNames();
  return syncedItems.includes(itemName);
}
