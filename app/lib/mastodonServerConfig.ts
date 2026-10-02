import { LONG_TERM_MIN_MONTHS } from '@/app/constants/form';

// ===== 선택 옵션 =====

/** 이 값 이하로 고르면 GCP 무료 크레딧 기간 안에서만 운영한다 (선택지 '3개월 이하'). */
export const SHORT_TERM_MONTHS = 3;
const DEFAULT_FREE_MONTHS = 3;

export const MONTH_OPTIONS = [
  { value: 3, label: '3개월 이하' },
  { value: 4, label: '4개월' },
  { value: 5, label: '5개월' },
  { value: 6, label: '6개월' },
  { value: 7, label: '7개월' },
  { value: 8, label: '8개월' },
  { value: 9, label: '9개월' },
  { value: 10, label: '10개월' },
  { value: 11, label: '11개월' },
  { value: 12, label: '12개월 이상' },
];

export const USERS_OPTIONS = [
  { value: 'u5', label: '5인 미만' },
  { value: 'u10', label: '5~10인' },
  { value: 'u18', label: '11~18인' },
  { value: 'u30', label: '19~30인' },
  { value: 'u30p', label: '30인 초과' },
];

export function isValidUsersKey(usersKey: string): boolean {
  return USERS_OPTIONS.some(o => o.value === usersKey);
}

/** 장기(12개월 이상) 서버는 소규모(10인 이하)만 받는다. 11인 이상은 따로 문의. */
const LONG_TERM_USERS = ['u5', 'u10'];

function isLongTerm(months: number): boolean {
  return months >= LONG_TERM_MIN_MONTHS;
}

/** 기간에 맞는 인원 선택지 (장기는 10인 이하만) */
export function getUsersOptions(months: number): { value: string; label: string }[] {
  if (!isLongTerm(months)) return USERS_OPTIONS;
  return USERS_OPTIONS.filter(o => LONG_TERM_USERS.includes(o.value));
}

export function isUsersAllowed(months: number, usersKey: string): boolean {
  return getUsersOptions(months).some(o => o.value === usersKey);
}

// ===== KRW 포맷 =====

function formatKrw(krw: number): string {
  if (krw === 0) return '무료';
  if (krw < 10000) return `${krw / 1000}천원`;
  const man = krw / 10000;
  if (Number.isInteger(man)) return `${man}만원`;
  return `${man.toFixed(1)}만원`;
}

// ===== 서버 사양 등급 (4개월 이상) =====

export type ServerTier = 'min' | 'mid' | 'max';

export const TIER_OPTIONS: { value: ServerTier; label: string }[] = [
  { value: 'min', label: '최소' },
  { value: 'mid', label: '타협' },
  { value: 'max', label: '쾌적' },
];

export function isValidTier(tier: unknown): tier is ServerTier {
  return TIER_OPTIONS.some(o => o.value === tier);
}

/** 무료 크레딧 기간을 넘겨 서버비가 나오는 기간(4개월 이상)에만 사양 등급을 고른다. */
export function needsTier(months: number): boolean {
  return months > SHORT_TERM_MONTHS;
}

// ===== GCP us-central1 사양 (monthly: KRW, 1 USD ≈ 1,500원) =====

const E2_SMALL = 'e2-small (2 vCPU, 2GB RAM)';
const E2_MEDIUM = 'e2-medium (2 vCPU, 4GB RAM)';
const E2_STANDARD_2 = 'e2-standard-2 (2 vCPU, 8GB RAM)';
const E2_HIGHMEM_2 = 'e2-highmem-2 (2 vCPU, 16GB RAM)';
const E2_HIGHMEM_4 = 'e2-highmem-4 (4 vCPU, 32GB RAM)';

const GCP_MONTHLY: Record<string, number> = {
  [E2_SMALL]: 30000,
  [E2_MEDIUM]: 40000,
  [E2_STANDARD_2]: 80000, // $55
  [E2_HIGHMEM_2]: 110000, // $75
  [E2_HIGHMEM_4]: 210000, // $140
};

interface GcpOption { monthly: number; mastodon: string; elastic: string | null }
interface GcpEntry {
  noSearch: GcpOption;
  search: GcpOption | null;
  /** 무료 크레딧($300)으로 버티는 개월 수. 생략 시 3개월 */
  freeMonths?: number;
}

/** 검색 서버는 인원 구간으로 정한다: 30인 초과는 e2-medium, 그 외 e2-small, 5인 미만은 검색 비추천 */
const ELASTIC_BY_USERS: Record<string, string | null> = {
  u5: null,
  u10: E2_SMALL,
  u18: E2_SMALL,
  u30: E2_SMALL,
  u30p: E2_MEDIUM,
};

function gcpEntry(mastodon: string, usersKey: string, freeMonths?: number): GcpEntry {
  const elastic = ELASTIC_BY_USERS[usersKey];
  const monthly = GCP_MONTHLY[mastodon];
  return {
    noSearch: { monthly, mastodon, elastic: null },
    search: elastic ? { monthly: monthly + GCP_MONTHLY[elastic], mastodon, elastic } : null,
    freeMonths,
  };
}

// ===== GCP 4~11개월: 등급별 사양 =====
// 인원       최소            타협            쾌적
// u5   e2-small        -               e2-medium
// u10  e2-small        e2-medium       e2-standard-2
// u18  e2-medium       e2-standard-2   e2-standard-2
// u30  e2-medium       e2-standard-2   e2-highmem-2
// u30p e2-standard-2   e2-highmem-2    e2-highmem-4

const GCP_TIER_MACHINES: Record<string, Partial<Record<ServerTier, string>>> = {
  u5:   { min: E2_SMALL, max: E2_MEDIUM },
  u10:  { min: E2_SMALL, mid: E2_MEDIUM, max: E2_STANDARD_2 },
  u18:  { min: E2_MEDIUM, mid: E2_STANDARD_2, max: E2_STANDARD_2 },
  u30:  { min: E2_MEDIUM, mid: E2_STANDARD_2, max: E2_HIGHMEM_2 },
  u30p: { min: E2_STANDARD_2, mid: E2_HIGHMEM_2, max: E2_HIGHMEM_4 },
};

/** 기간·인원 구간에서 고를 수 있는 등급 (5인 미만 4~11개월과 장기 소규모는 타협 없음) */
export function getAvailableTiers(months: number, usersKey: string): ServerTier[] {
  const machines = (isLongTerm(months) ? LONG_TERM_MACHINES[usersKey] : GCP_TIER_MACHINES[usersKey]) ?? {};
  return TIER_OPTIONS.map(o => o.value).filter(tier => tier in machines);
}

function resolveTier(months: number, usersKey: string, tier: ServerTier | null): ServerTier | null {
  if (!needsTier(months)) return null;
  return tier && getAvailableTiers(months, usersKey).includes(tier) ? tier : 'min';
}

// ===== GCP 3개월 이하 전용 (크레딧만 소모하므로 사양 업그레이드) =====
// u5   e2-small       3만원
// u10  e2-medium      4만원  / search 7만원  (+ e2-small 검색)
// u18  e2-standard-2  8만원  / search 11만원 (+ e2-small 검색)
// u30  e2-highmem-2   11만원 / search 14만원 (+ e2-small 검색)
// u30p e2-highmem-4   21만원 / search 25만원 (+ e2-medium 검색)
//      크레딧 $300으로 2개월만 무료 → 선택지가 '2개월 이하'로 바뀐다.
//      검색 서버까지 켜면 2개월 합계가 $300을 조금 넘는다.

const GCP_SHORT_CONFIGS: Record<string, GcpEntry> = {
  u5: gcpEntry(E2_SMALL, 'u5'),
  u10: gcpEntry(E2_MEDIUM, 'u10'),
  u18: gcpEntry(E2_STANDARD_2, 'u18'),
  u30: gcpEntry(E2_HIGHMEM_2, 'u30'),
  u30p: gcpEntry(E2_HIGHMEM_4, 'u30p', 2),
};

function getGcpEntry(months: number, usersKey: string, tier: ServerTier): GcpEntry {
  if (months <= SHORT_TERM_MONTHS) return GCP_SHORT_CONFIGS[usersKey];
  const machines = GCP_TIER_MACHINES[usersKey];
  return gcpEntry(machines[tier] ?? machines.min!, usersKey);
}

/** 3개월 이하 선택 시 무료로 쓸 수 있는 개월 수 (e2-highmem-4는 2개월) */
export function getShortTermFreeMonths(usersKey: string): number {
  return GCP_SHORT_CONFIGS[usersKey]?.freeMonths ?? DEFAULT_FREE_MONTHS;
}

export function getMonthsLabel(months: number, usersKey: string): string {
  if (months === SHORT_TERM_MONTHS) return `${getShortTermFreeMonths(usersKey)}개월 이하`;
  return MONTH_OPTIONS.find(o => o.value === months)?.label ?? `${months}개월`;
}

/** 인원 구간에 맞춰 '3개월 이하' 라벨을 바꾼 기간 선택지 */
export function getMonthOptions(usersKey: string): { value: number; label: string }[] {
  return MONTH_OPTIONS.map(o => ({ value: o.value, label: getMonthsLabel(o.value, usersKey) }));
}

// ===== Vultr 서울 장기 소규모 (12개월 이상, 10인 이하, 검색 불가) =====
// 인원       최소                    쾌적
// u5   vc2-1c-1gb 8천원 ($5)    vc2-1c-2gb 1.5만원 ($10)
// u10  vc2-1c-2gb 1.5만원 ($10) vc2-2c-4gb 3만원 ($20)

const VC2_1C_1GB = 'vc2-1c-1gb (1 vCPU, 1GB RAM, 25GB SSD)';
const VC2_1C_2GB = 'vc2-1c-2gb (1 vCPU, 2GB RAM, 55GB SSD)';
const VC2_2C_4GB = 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)';

interface VultrOption { monthly: number; mastodon: string }

const LONG_TERM_MACHINES: Record<string, Partial<Record<ServerTier, VultrOption>>> = {
  u5:  { min: { monthly: 8000, mastodon: VC2_1C_1GB }, max: { monthly: 15000, mastodon: VC2_1C_2GB } },
  u10: { min: { monthly: 15000, mastodon: VC2_1C_2GB }, max: { monthly: 30000, mastodon: VC2_2C_4GB } },
};

// ===== Vultr 서울 (4~11개월 최소 등급에서 GCP보다 총액이 쌀 때만 사용, monthly: KRW) =====
// u5   noSearch 2만원  (vhf-1c-2gb)
// u10  noSearch 3만원  (vc2-2c-4gb)  / search 4.5만원 (vc2-2c-4gb + vc2-1c-2gb 검색 1.5만원)
// u18  noSearch 3.5만원 (vhp-2c-4gb) / search 6.5만원  (vhp-2c-4gb + vc2-2c-4gb 검색 3만원)
// u30  noSearch 3.5만원 (vhp-2c-4gb) / search 6.5만원  (vhp-2c-4gb + vc2-2c-4gb 검색 3만원)
// u30p noSearch 6만원  (vc2-4c-8gb)  / search 9만원    (vc2-4c-8gb + vc2-2c-4gb 검색 3만원)

const VULTR_PRICES: Record<string, { noSearch: number; search: number | null }> = {
  u5:   { noSearch: 20000, search: null },
  u10:  { noSearch: 30000, search: 45000 },
  u18:  { noSearch: 35000, search: 65000 },
  u30:  { noSearch: 35000, search: 65000 },
  u30p: { noSearch: 60000, search: 90000 },
};

const VULTR_CONFIGS: Record<string, {
  noSearch: { mastodon: string; elastic: string | null };
  search?: { mastodon: string; elastic: string | null };
}> = {
  u5: {
    noSearch: { mastodon: 'vhf-1c-2gb (1 vCPU, 2GB RAM)', elastic: null },
  },
  u10: {
    noSearch: { mastodon: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)', elastic: null },
    search:   { mastodon: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)', elastic: 'vc2-1c-2gb (1 vCPU, 2GB RAM, 55GB SSD)' },
  },
  u18: {
    noSearch: { mastodon: 'vhp-2c-4gb (2 vCPU, 4GB RAM)', elastic: null },
    search:   { mastodon: 'vhp-2c-4gb (2 vCPU, 4GB RAM)', elastic: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)' },
  },
  u30: {
    noSearch: { mastodon: 'vhp-2c-4gb (2 vCPU, 4GB RAM)', elastic: null },
    search:   { mastodon: 'vhp-2c-4gb (2 vCPU, 4GB RAM)', elastic: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)' },
  },
  u30p: {
    noSearch: { mastodon: 'vc2-4c-8gb (4 vCPU, 8GB RAM, 160GB SSD)', elastic: null },
    search:   { mastodon: 'vc2-4c-8gb (4 vCPU, 8GB RAM, 160GB SSD)', elastic: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)' },
  },
};

// ===== 결과 타입 =====

export interface ServerCalcResult {
  type: 'gcp' | 'vultr' | 'warn';
  months: number;
  monthsLabel: string;
  usersKey: string;
  usersLabel: string;
  search: 'yes' | 'no';
  /** 4~11개월에만 값이 있다 */
  tier: ServerTier | null;
  tierLabel: string | null;
  hosting: string | null;
  mastodon: string | null;
  elastic: string | null;
  monthlyKrw: string | null;
  totalKrw: string | null;
  freeMonths: number;
  paidMonths: number;
  warnNotes: string[];
}

// ===== 계산 함수 =====

type ResultBase = Pick<
  ServerCalcResult,
  'months' | 'monthsLabel' | 'usersKey' | 'usersLabel' | 'search' | 'tier' | 'tierLabel'
>;

function warnResult(base: ResultBase): ServerCalcResult {
  return {
    ...base,
    type: 'warn',
    hosting: null, mastodon: null, elastic: null,
    monthlyKrw: null, totalKrw: null,
    freeMonths: 0, paidMonths: 0,
    warnNotes: [
      '5인 미만에서는 검색 기능을 추천하지 않습니다.',
      '검색 기능을 추가하려면 서버를 하나 더 설치해야 해서 비용이 크게 올라갑니다.',
      '검색 없이 진행하시는 걸 권장합니다.',
    ],
  };
}

function longTermResult(base: ResultBase, tier: ServerTier): ServerCalcResult {
  const cfg = LONG_TERM_MACHINES[base.usersKey]?.[tier];
  // 장기는 10인 이하만 받으므로 그 외 인원은 화면에서 막힌다. 함수 호출만 안전하게 처리한다.
  if (!cfg) return vultrResult({ ...base, search: 'no' }, false);
  return {
    ...base,
    search: 'no',
    type: 'vultr',
    hosting: 'Vultr (서울)',
    mastodon: cfg.mastodon,
    elastic: null,
    monthlyKrw: formatKrw(cfg.monthly),
    totalKrw: formatKrw(cfg.monthly * base.months),
    freeMonths: 0,
    paidMonths: base.months,
    warnNotes: [],
  };
}

function vultrResult(base: ResultBase, hasSearch: boolean): ServerCalcResult {
  const { usersKey, months } = base;
  const monthly = hasSearch ? VULTR_PRICES[usersKey].search! : VULTR_PRICES[usersKey].noSearch;
  const cfg = hasSearch
    ? (VULTR_CONFIGS[usersKey].search ?? VULTR_CONFIGS[usersKey].noSearch)
    : VULTR_CONFIGS[usersKey].noSearch;
  return {
    ...base,
    type: 'vultr',
    hosting: 'Vultr (서울)',
    mastodon: cfg.mastodon,
    elastic: cfg.elastic,
    monthlyKrw: formatKrw(monthly),
    totalKrw: formatKrw(monthly * months),
    freeMonths: 0,
    paidMonths: months,
    warnNotes: [],
  };
}

function gcpResult(base: ResultBase, cfg: GcpOption, freeMonths: number, paidMonths: number): ServerCalcResult {
  return {
    ...base,
    type: 'gcp',
    hosting: 'GCP (us-central1)',
    mastodon: cfg.mastodon,
    elastic: cfg.elastic,
    monthlyKrw: formatKrw(cfg.monthly),
    totalKrw: formatKrw(paidMonths * cfg.monthly),
    freeMonths,
    paidMonths,
    warnNotes: [],
  };
}

/**
 * 기간·인원·검색·등급으로 호스팅과 사양을 정한다.
 * - 3개월 이하: GCP 크레딧 전용 사양 (무료)
 * - 4~11개월: 고른 등급의 GCP 사양. 최소 등급만 Vultr가 더 싸면 Vultr로 바꾼다.
 * - 12개월 이상: 장기 소규모 Vultr 사양 (10인 이하, 검색 불가)
 * 4개월 이상에서 등급을 주지 않거나 고를 수 없는 등급이면 최소 등급으로 계산한다.
 */
export function getServerCalcResult(
  months: number,
  usersKey: string,
  search: 'yes' | 'no',
  tier: ServerTier | null = null
): ServerCalcResult {
  const appliedTier = resolveTier(months, usersKey, tier);
  const base: ResultBase = {
    months,
    monthsLabel: getMonthsLabel(months, usersKey),
    usersKey,
    usersLabel: USERS_OPTIONS.find(o => o.value === usersKey)?.label ?? usersKey,
    search,
    tier: appliedTier,
    tierLabel: TIER_OPTIONS.find(o => o.value === appliedTier)?.label ?? null,
  };
  const hasSearch = search === 'yes';

  if (usersKey === 'u5' && hasSearch) return warnResult(base);
  if (isLongTerm(months)) return longTermResult(base, appliedTier ?? 'min');

  const isShortTerm = months <= SHORT_TERM_MONTHS;
  const entry = getGcpEntry(months, usersKey, appliedTier ?? 'min');
  const gcpCfg = hasSearch ? entry.search : entry.noSearch;
  if (!gcpCfg) return vultrResult(base, hasSearch);

  const freeMonths = isShortTerm ? (entry.freeMonths ?? DEFAULT_FREE_MONTHS) : DEFAULT_FREE_MONTHS;
  const paidMonths = isShortTerm ? 0 : months - DEFAULT_FREE_MONTHS;

  // 최소 등급은 Vultr가 더 싸면 Vultr로. 타협·쾌적은 사양을 지키기 위해 GCP 유지.
  if (appliedTier === 'min') {
    const vultrMonthly = hasSearch ? VULTR_PRICES[usersKey].search! : VULTR_PRICES[usersKey].noSearch;
    if (months * vultrMonthly < paidMonths * gcpCfg.monthly) return vultrResult(base, hasSearch);
  }
  return gcpResult(base, gcpCfg, freeMonths, paidMonths);
}
