/**
 * 자동봇 견적 담기·빼기 (기존 BotCommission.tsx 의 로직 그대로 옮김).
 *  메인 봇 타입 택1, TRPG봇 ↔ 기본 타입 배타, 추가 옵션 선행 조건, 가동 주수 → '기본 가동료 (N주)' 항목.
 *  막힌 선택은 토스트 문구로 알린다 (3.5초 뒤 자동으로 닫힘).
 */
import { useEffect, useState } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import {
  MAIN_BOT_TYPES, OPERATION_FEE_PREFIX, TRPG_EXCLUSIVE_PAIRS, WEEKLY_FEE, type AdditionalOption,
} from './botContent';

const TOAST_MS = 3500;

export function requiresOf(option: AdditionalOption): string[] {
  if (!option.requires) return [];
  return Array.isArray(option.requires) ? option.requires : [option.requires];
}

export function useBotEstimate() {
  const { addItem, removeItem, items } = useEstimate();
  const [operationWeeks, setOperationWeeks] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const has = (name: string) => items.some((item) => item.name === name);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const changeWeeks = (newWeeks: number) => {
    if (newWeeks < 0) return;
    setOperationWeeks(newWeeks);
    const existing = items.find((item) => item.name.startsWith(OPERATION_FEE_PREFIX));
    if (existing) removeItem(existing.id);
    if (newWeeks > 0) {
      addItem({
        name: `${OPERATION_FEE_PREFIX} (${newWeeks}주)`,
        price: newWeeks * WEEKLY_FEE,
        category: 'bot',
        description: `1주당 ₩5,000 × ${newWeeks}주`,
      });
    }
  };

  /** 봇 타입 담기·빼기. 메인 타입 택1, TRPG봇 ↔ 기본 타입 충돌은 막고 토스트 */
  const toggleType = (name: string, price: number, description?: string) => {
    const existing = items.find((item) => item.name === name);
    if (existing) {
      removeItem(existing.id);
      return;
    }
    if ((MAIN_BOT_TYPES as readonly string[]).includes(name)) {
      const conflict = MAIN_BOT_TYPES.find((t) => t !== name && has(t));
      if (conflict) {
        setToastMessage(`"${conflict}" 선택을 먼저 취소해 주세요. 메인 봇 타입은 하나만 선택할 수 있어요.`);
        return;
      }
    }
    const trpgConflict = TRPG_EXCLUSIVE_PAIRS[name]?.find(has);
    if (trpgConflict) {
      setToastMessage(
        `"${trpgConflict}" 선택을 먼저 취소해 주세요. TRPG봇과 기본 타입은 기능이 겹쳐 함께 선택할 수 없어요. (기본&상점 이상은 TRPG봇과 함께 선택 가능합니다)`,
      );
      return;
    }
    addItem({ name, price, category: 'bot', description });
  };

  /** 추가 옵션 상태: 별칭까지 포함한 선택 여부, 선행 조건 충족 여부 */
  const optionState = (option: AdditionalOption) => {
    const names = option.aliases ? [option.name, ...option.aliases] : [option.name];
    const selected = items.some((item) => names.includes(item.name));
    const requires = requiresOf(option);
    const requiresMet = requires.length === 0 || requires.some(has);
    const requiresLabel = option.requiresLabel ?? requires.join(' 또는 ');
    return { names, selected, disabled: !requiresMet && !selected, requiresLabel };
  };

  const toggleOption = (option: AdditionalOption) => {
    const { names, selected, disabled, requiresLabel } = optionState(option);
    if (disabled) {
      setToastMessage(`'${option.name}'은(는) ${requiresLabel}을(를) 먼저 선택해 주세요.`);
      return;
    }
    if (selected) {
      const existing = items.find((item) => names.includes(item.name));
      if (existing) removeItem(existing.id);
      return;
    }
    addItem({ name: option.name, price: option.price, category: 'bot', description: option.description });
  };

  return { items, has, operationWeeks, changeWeeks, toggleType, optionState, toggleOption, toastMessage, setToastMessage };
}

export type BotEstimate = ReturnType<typeof useBotEstimate>;
