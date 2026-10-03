/**
 * 견적 항목 이름 → 현재 판매 가격.
 * 저장된 견적(localStorage)의 가격은 담을 때 값이라, 가격을 바꾼 뒤에도 예전 값이 남거나 조작된 값이 들어올 수 있다.
 * 불러올 때 이 표로 다시 맞춰서 견적함·신청서·복사문 금액이 늘 같은 곳(PRICING_CONFIG)을 따르게 한다.
 * 표에 없는 이름(예전 이름 등)은 null → 저장된 값이 올바를 때만 그대로 쓴다.
 */
import { SERVER_INFRA_FEE_ITEM } from '@/app/constants/form';
import { ADDITIONAL_OPTIONS as SERVER_ADDITIONAL, INSTALL, RUSH_OPTIONS, THEME_OPTIONS } from '@/app/components/server/serverContent';
import { ADDITIONAL_OPTIONS as BOT_ADDITIONAL, BOT_TYPES, OPERATION_FEE_PREFIX, WEEKLY_FEE } from '@/app/components/bot/botContent';

const OPERATION_FEE_PATTERN = new RegExp(`^${OPERATION_FEE_PREFIX} \\((\\d+)주\\)$`);

function buildPriceTable(): Map<string, number> {
  const table = new Map<string, number>();
  table.set(INSTALL.name, INSTALL.price);
  table.set(SERVER_INFRA_FEE_ITEM.name, SERVER_INFRA_FEE_ITEM.price);
  THEME_OPTIONS.forEach((o) => table.set(o.name, o.price));
  SERVER_ADDITIONAL.forEach((o) => table.set(o.name, o.price));
  RUSH_OPTIONS.forEach((o) => table.set(o.estimateName, o.price));
  // 오마카세는 0(협의)이라 표에 넣으면 '협의' 표시가 그대로 유지된다
  BOT_TYPES.forEach((t) => table.set(t.name, t.price));
  BOT_ADDITIONAL.forEach((o) => [o.name, ...(o.aliases ?? [])].forEach((name) => table.set(name, o.price)));
  return table;
}

let priceTable: Map<string, number> | null = null;
let currentNames: Map<string, string> | null = null;

/** 예전 이름(별칭)으로 저장된 견적 항목을 지금 이름으로. 별칭이 아니면 그대로 */
export function currentItemName(name: string): string {
  currentNames ??= new Map(BOT_ADDITIONAL.flatMap((o) => (o.aliases ?? []).map((alias) => [alias, o.name] as const)));
  return currentNames.get(name) ?? name;
}

/** 현재 가격. 모르는 이름이면 null */
export function catalogPrice(name: string): number | null {
  const weeks = name.match(OPERATION_FEE_PATTERN);
  if (weeks) return Number(weeks[1]) * WEEKLY_FEE;
  priceTable ??= buildPriceTable();
  return priceTable.get(name) ?? null;
}
