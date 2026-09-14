import { useEffect, useState } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';

/**
 * 견적함에서 '수정'을 눌러 상품 페이지로 넘어왔을 때,
 * 해당 옵션으로 스크롤하고 잠시 테두리를 강조한다.
 *
 * 상품 페이지의 옵션에는 `data-option-name="<견적 항목 이름>"` 이 붙어 있어야 한다.
 * 이름이 정확히 일치하지 않는 경우가 있어 세 단계로 찾는다:
 *  1. 정확히 일치
 *  2. 접두어 일치 — '기본 가동료 (3주)' 처럼 이름에 값이 섞이는 항목
 *  3. 별칭 일치 — 예전 장바구니에 '양도 기능' 으로 저장된 항목이 지금은 '재화, 아이템 양도 기능'
 *
 * 반환값은 지금 강조할 항목 이름이며, 옵션의 className 에서 사용한다.
 */
const HIGHLIGHT_DURATION_MS = 2600;

/** 강조 대상 엘리먼트를 찾는다 */
function findTarget(targetName: string): HTMLElement | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-option-name]'));

  const exact = candidates.find((el) => el.dataset.optionName === targetName);
  if (exact) return exact;

  const byPrefix = candidates.find(
    (el) => el.dataset.optionName && targetName.startsWith(el.dataset.optionName)
  );
  if (byPrefix) return byPrefix;

  return (
    candidates.find((el) => el.dataset.optionAliases?.split('|').includes(targetName)) ?? null
  );
}

export function useEditTargetHighlight(): string | null {
  const { editTargetName, setEditTargetName } = useEstimate();
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (!editTargetName) return;

    const target = findTarget(editTargetName);
    // 이 페이지에 해당 옵션이 없으면(다른 카테고리) 표시만 지우고 끝낸다
    if (!target) {
      setEditTargetName(null);
      return;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

    // 키보드·스크린리더 사용자도 어디로 왔는지 알 수 있게 포커스를 옮긴다
    const focusable = target.matches('button, input, a') ? target : target.querySelector<HTMLElement>('button, input, a');
    focusable?.focus({ preventScroll: true });

    setHighlighted(editTargetName);
    setEditTargetName(null);

    const timer = setTimeout(() => setHighlighted(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [editTargetName, setEditTargetName]);

  return highlighted;
}
