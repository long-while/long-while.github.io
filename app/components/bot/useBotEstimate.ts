/**
 * 자동봇 견적 담기·빼기 (기존 BotCommission.tsx 의 로직 그대로 옮김).
 *  메인 봇 타입 택1(다른 메인 타입을 누르면 바로 바꿈, 4단계 리뷰), TRPG봇 ↔ 기본 타입 배타, 추가 옵션 선행 조건,
 *  가동 주수 → '기본 가동료 (N주)' 항목. 막힌 선택·자동으로 뺀 옵션은 토스트로 알린다 (3.5초 뒤 자동으로 닫힘).
 */
import { useEffect, useState } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { botOperationFee } from '@/app/constants/form';
import { eulReul, eunNeun } from '@/app/utils/josa';
import {
  ADDITIONAL_OPTIONS, INVESTIGATION_TYPE, MAIN_BOT_TYPES, OPERATION_FEE_PREFIX, TRPG_EXCLUSIVE_PAIRS, WEEKLY_FEE, type AdditionalOption,
} from './botContent';

const TOAST_MS = 3500;
/** 가동 주수 입력 상한 (1년) */
export const MAX_WEEKS = 52;

export interface BotToast {
  tone: 'warning' | 'info';
  title: string;
  message: string;
}

const blocked = (message: string): BotToast => ({ tone: 'warning', title: '선택할 수 없는 옵션이에요', message });

export function requiresOf(option: AdditionalOption): string[] {
  if (!option.requires) return [];
  return Array.isArray(option.requires) ? option.requires : [option.requires];
}

export function useBotEstimate() {
  const { addItem, removeItem, items } = useEstimate();
  // 가동 주수는 견적의 '기본 가동료 (N주)' 항목에서 읽는다 (예전에는 페이지 상태라 다시 들어오면 0주로 보였다, 4단계)
  const operationItem = items.find((item) => item.name.startsWith(OPERATION_FEE_PREFIX));
  const operationWeeks = Number(operationItem?.name.match(/\((\d+)주\)/)?.[1] ?? 0);
  const [toast, setToast] = useState<BotToast | null>(null);
  const has = (name: string) => items.some((item) => item.name === name);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const changeWeeks = (newWeeks: number) => {
    if (!Number.isInteger(newWeeks) || newWeeks < 0 || newWeeks > MAX_WEEKS || newWeeks === operationWeeks) return;
    if (operationItem) removeItem(operationItem.id);
    if (newWeeks > 0) {
      addItem({
        name: `${OPERATION_FEE_PREFIX} (${newWeeks}주)`,
        price: botOperationFee(newWeeks),
        category: 'bot',
        description: `1주당 ₩${WEEKLY_FEE.toLocaleString()} × ${newWeeks}주${botOperationFee(newWeeks) < newWeeks * WEEKLY_FEE ? ` (최대 ₩${botOperationFee(newWeeks).toLocaleString()})` : ''}`,
      });
    }
  };

  /**
   * 메인 타입을 바꿀 때: 예전 타입을 빼고, 새 타입으로는 쓸 수 없게 된 추가 옵션도 함께 뺀다.
   * 뺀 옵션 이름(화면 표시 이름)을 돌려준다.
   */
  const replaceMainType = (previous: string, next: string): string[] => {
    const previousItem = items.find((item) => item.name === previous);
    if (previousItem) removeItem(previousItem.id);
    const remaining = new Set(items.map((item) => item.name).filter((n) => n !== previous).concat(next));
    const dropped: string[] = [];
    for (const option of ADDITIONAL_OPTIONS) {
      const requires = requiresOf(option);
      if (requires.length === 0 || requires.some((r) => remaining.has(r))) continue;
      const names = option.aliases ? [option.name, ...option.aliases] : [option.name];
      for (const item of items.filter((i) => names.includes(i.name))) {
        removeItem(item.id);
        dropped.push(option.label ?? option.name);
      }
    }
    return dropped;
  };

  /** 봇 타입 담기·빼기. 메인 타입은 택1(누르면 바로 바꿈), TRPG봇 ↔ 기본 타입 충돌은 막고 토스트 */
  const toggleType = (name: string, price: number, description?: string) => {
    const existing = items.find((item) => item.name === name);
    if (existing) {
      removeItem(existing.id);
      // 마지막 메인 타입을 빼면 메인 봇과 함께만 되는 자동조사 타입(과 그 옵션)도 같이 뺀다
      const isMain = (MAIN_BOT_TYPES as readonly string[]).includes(name);
      const investigation = items.find((item) => item.name === INVESTIGATION_TYPE);
      if (isMain && investigation) {
        removeItem(investigation.id);
        items.filter((item) => item.name === '일일 조사 횟수 제한').forEach((item) => removeItem(item.id));
        setToast({ tone: 'info', title: '자동조사 타입도 뺐어요', message: '자동조사 타입은 기본 / 기본&상점 / 기본&상점&스탯 중 하나와 함께만 신청할 수 있어요.' });
      }
      return;
    }
    // 자동조사 타입은 메인 봇과 함께만 신청 가능 (신청서 규칙과 같게. 혼자 담으면 신청서에서 빠져 견적보다 금액이 작아졌다, 4단계 검토)
    if (name === INVESTIGATION_TYPE && !MAIN_BOT_TYPES.some(has)) {
      setToast(blocked('자동조사 타입은 기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나를 먼저 고른 뒤 함께 신청할 수 있어요.'));
      return;
    }
    const trpgConflict = TRPG_EXCLUSIVE_PAIRS[name]?.find(has);
    if (trpgConflict) {
      setToast(blocked(
        `"${trpgConflict}" 선택을 먼저 취소해 주세요. TRPG봇과 기본 타입은 기능이 겹쳐 함께 선택할 수 없어요. (기본&상점 이상은 TRPG봇과 함께 선택 가능합니다)`,
      ));
      return;
    }
    const previous = (MAIN_BOT_TYPES as readonly string[]).includes(name) ? MAIN_BOT_TYPES.find((t) => t !== name && has(t)) : undefined;
    const dropped = previous ? replaceMainType(previous, name) : [];
    addItem({ name, price, category: 'bot', description });
    if (dropped.length > 0) {
      setToast({
        tone: 'info',
        title: `${name}으로 바꿨어요`,
        message: `${dropped.map((d) => `'${d}'`).join(', ')}${eunNeun(dropped[dropped.length - 1])} ${name}에서 쓸 수 없어 견적에서 뺐어요.`,
      });
    }
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
      const label = option.label ?? option.name;
      setToast(blocked(`'${label}'${eunNeun(label)} ${requiresLabel}${eulReul(requiresLabel)} 먼저 선택해 주세요.`));
      return;
    }
    if (selected) {
      const existing = items.find((item) => names.includes(item.name));
      if (existing) removeItem(existing.id);
      return;
    }
    addItem({ name: option.name, price: option.price, category: 'bot', description: option.description });
  };

  return { items, has, operationWeeks, changeWeeks, toggleType, optionState, toggleOption, toast, setToast };
}

export type BotEstimate = ReturnType<typeof useBotEstimate>;
