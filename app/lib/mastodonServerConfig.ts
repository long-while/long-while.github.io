// ===== 선택 옵션 =====

export const MONTH_OPTIONS = [
  { value: 3, label: '3개월 미만' },
  { value: 4, label: '4개월' },
  { value: 5, label: '5개월' },
  { value: 6, label: '6개월' },
  { value: 7, label: '7개월' },
  { value: 8, label: '8개월' },
  { value: 9, label: '9개월' },
  { value: 10, label: '10개월' },
  { value: 11, label: '11개월' },
  { value: 12, label: '12개월' },
];

export const USERS_OPTIONS = [
  { value: 'u5',   label: '5인 미만' },
  { value: 'u10',  label: '6~10인 (월 8만원~)' },
  { value: 'u30',  label: '11~30인 (월 4만원~)' },
  { value: 'u30p', label: '30인 초과 (월 8만원~)' },
];

// ===== USD → KRW 변환 =====

// x1400 + 5000 버퍼, 천원 단위 반올림
function toKrw(usd: number): number {
  return Math.round((usd * 1400 + 5000) / 1000) * 1000;
}

function formatKrw(krw: number): string {
  const man = krw / 10000;
  if (Number.isInteger(man)) return `${man}만원`;
  return `${man.toFixed(1)}만원`;
}

function monthlyKrwStr(usd: number): string {
  return formatKrw(toKrw(usd));
}

function totalKrwStr(totalUsd: number): string {
  if (totalUsd === 0) return '무료';
  return formatKrw(toKrw(totalUsd));
}

// ===== GCP us-central1 구성 =====
// toKrw(usd) = round((usd*1400+5000)/1000)*1000
// u10  noSearch $54 → 8.1만원 / search $72 → 10.6만원 (e2-small 검색 +$18)
// u30  noSearch $25 → 4만원   / search $43 → 6.5만원  (e2-small 검색 +$18)
// u30p noSearch $54 → 8.1만원 / search $79 → 11.6만원 (e2-medium 검색 +$25)

const GCP_CONFIGS: Record<string, {
  noSearch: { monthly: number; mastodon: string; elastic: string | null };
  search: { monthly: number; mastodon: string; elastic: string | null };
}> = {
  u10: {
    noSearch: { monthly: 54, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: null },
    search:   { monthly: 72, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30: {
    noSearch: { monthly: 25, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: null },
    search:   { monthly: 43, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30p: {
    noSearch: { monthly: 54, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: null },
    search:   { monthly: 79, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: 'e2-medium (2 vCPU, 4GB RAM)' },
  },
};

// ===== Vultr 서울 구성 =====
// u5   noSearch $11 → 2만원
// u10  noSearch $18 → 3만원  / search $29 → 4.6만원 (vc2-1c-2gb 검색 +$7=1.5만원)
// u30  noSearch $22 → 3.6만원 / search $43 → 6.5만원 (vc2-2c-4gb 검색 +$18=3만원)
// u30p noSearch $39 → 6만원  / search $61 → 9만원   (vc2-2c-4gb 검색 +$18=3만원)

const VULTR_PRICES: Record<string, { noSearch: number; search: number | null }> = {
  u5:   { noSearch: 11, search: null },
  u10:  { noSearch: 18, search: 29 },
  u30:  { noSearch: 22, search: 43 },
  u30p: { noSearch: 39, search: 61 },
};

const VULTR_CONFIGS: Record<string, {
  noSearch: { mastodon: string; elastic: string | null };
  search?: { mastodon: string; elastic: string | null };
}> = {
  u5: {
    noSearch: { mastodon: 'vc2-1c-2gb (1 vCPU, 2GB RAM, 55GB SSD)', elastic: null },
  },
  u10: {
    noSearch: { mastodon: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)', elastic: null },
    search:   { mastodon: 'vc2-2c-4gb (2 vCPU, 4GB RAM, 80GB SSD)', elastic: 'vc2-1c-2gb (1 vCPU, 2GB RAM, 55GB SSD)' },
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

export function getServerCalcResult(
  months: number,
  usersKey: string,
  search: 'yes' | 'no'
): ServerCalcResult {
  const monthsLabel = MONTH_OPTIONS.find(o => o.value === months)?.label ?? `${months}개월`;
  const usersLabel = USERS_OPTIONS.find(o => o.value === usersKey)?.label ?? usersKey;
  const hasSearch = search === 'yes';

  // 5인 미만 + 검색: 비추천
  if (usersKey === 'u5' && hasSearch) {
    return {
      type: 'warn',
      months, monthsLabel, usersKey, usersLabel, search,
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

  // 5인 미만: Vultr만
  if (usersKey === 'u5') {
    const usdMonthly = VULTR_PRICES.u5.noSearch;
    const cfg = VULTR_CONFIGS.u5.noSearch;
    return {
      type: 'vultr',
      months, monthsLabel, usersKey, usersLabel, search,
      hosting: 'Vultr (서울)',
      mastodon: cfg.mastodon,
      elastic: null,
      monthlyKrw: monthlyKrwStr(usdMonthly),
      totalKrw: totalKrwStr(usdMonthly * months),
      freeMonths: 0, paidMonths: months,
      warnNotes: [],
    };
  }

  const vultrUsdMonthly = hasSearch ? VULTR_PRICES[usersKey].search! : VULTR_PRICES[usersKey].noSearch;
  const vultrCfg = hasSearch
    ? (VULTR_CONFIGS[usersKey].search ?? VULTR_CONFIGS[usersKey].noSearch)
    : VULTR_CONFIGS[usersKey].noSearch;

  // 12개월 이상: Vultr 강제
  if (months >= 12) {
    return {
      type: 'vultr',
      months, monthsLabel, usersKey, usersLabel, search,
      hosting: 'Vultr (서울)',
      mastodon: vultrCfg.mastodon,
      elastic: vultrCfg.elastic,
      monthlyKrw: monthlyKrwStr(vultrUsdMonthly),
      totalKrw: totalKrwStr(vultrUsdMonthly * months),
      freeMonths: 0, paidMonths: months,
      warnNotes: [],
    };
  }

  // 나머지: GCP vs Vultr 비교
  const gcpCfg = hasSearch ? GCP_CONFIGS[usersKey].search : GCP_CONFIGS[usersKey].noSearch;
  const gcpUsdMonthly = gcpCfg.monthly;
  const paidMonths = Math.max(0, months - 3);
  const gcpUsdTotal = paidMonths * gcpUsdMonthly;
  const vultrUsdTotal = months * vultrUsdMonthly;

  // GCP가 유리한 경우
  if (vultrUsdTotal >= gcpUsdTotal) {
    return {
      type: 'gcp',
      months, monthsLabel, usersKey, usersLabel, search,
      hosting: 'GCP (us-central1)',
      mastodon: gcpCfg.mastodon,
      elastic: gcpCfg.elastic,
      monthlyKrw: monthlyKrwStr(gcpUsdMonthly),
      totalKrw: totalKrwStr(gcpUsdTotal),
      freeMonths: Math.min(months, 3),
      paidMonths,
      warnNotes: [],
    };
  }

  // Vultr가 유리한 경우
  return {
    type: 'vultr',
    months, monthsLabel, usersKey, usersLabel, search,
    hosting: 'Vultr (서울)',
    mastodon: vultrCfg.mastodon,
    elastic: vultrCfg.elastic,
    monthlyKrw: monthlyKrwStr(vultrUsdMonthly),
    totalKrw: totalKrwStr(vultrUsdTotal),
    freeMonths: 0,
    paidMonths: months,
    warnNotes: [],
  };
}
