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
  { value: 'u5', label: '5인 미만' },
  { value: 'u10', label: '6~10인' },
  { value: 'u15', label: '10~15인' },
  { value: 'u20', label: '15~20인' },
  { value: 'u30', label: '20~30인' },
  { value: 'u40', label: '30~40인' },
  { value: 'u40p', label: '40인 이상' },
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
// 서울보다 약 20~30% 저렴한 us-central1 기준 가격 (USD/month)
// toKrw(usd) = round((usd*1400+5000)/1000)*1000

const GCP_CONFIGS: Record<string, {
  noSearch: { monthly: number; mastodon: string; elastic: string | null };
  search: { monthly: number; mastodon: string; elastic: string | null };
}> = {
  u10: {
    // noSearch: $18 → 3만원 / search: $36 → 5.5만원 (검색엔진 e2-small +$18)
    noSearch: { monthly: 18, mastodon: 'e2-small (2 vCPU, 2GB RAM)', elastic: null },
    search: { monthly: 36, mastodon: 'e2-small (2 vCPU, 2GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u15: {
    // noSearch: $25 → 4만원 / search: $43 → 6.5만원 (검색엔진 e2-small +$18)
    noSearch: { monthly: 25, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: null },
    search: { monthly: 43, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u20: {
    // noSearch: $25 → 4만원 / search: $43 → 6.5만원 (검색엔진 e2-small +$18)
    noSearch: { monthly: 25, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: null },
    search: { monthly: 43, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30: {
    // noSearch: $54 → 8.1만원 / search: $79 → 11.6만원 (검색엔진 e2-medium +$25)
    noSearch: { monthly: 54, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: null },
    search: { monthly: 79, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: 'e2-medium (2 vCPU, 4GB RAM)' },
  },
  u40: {
    // noSearch: $68 → 10만원 / search: $93 → 13.5만원 (검색엔진 e2-medium +$25)
    noSearch: { monthly: 68, mastodon: 'e2-standard-4 (4 vCPU, 16GB RAM)', elastic: null },
    search: { monthly: 93, mastodon: 'e2-standard-4 (4 vCPU, 16GB RAM)', elastic: 'e2-medium (2 vCPU, 4GB RAM)' },
  },
  u40p: {
    // noSearch: $82 → 12만원 / search: $111 → 16만원
    noSearch: { monthly: 82, mastodon: 'e2-standard-4 (4 vCPU, 16GB RAM)', elastic: null },
    search: { monthly: 111, mastodon: 'e2-standard-4 (4 vCPU, 16GB RAM)', elastic: 'e2-medium (2 vCPU, 4GB RAM)' },
  },
};

// ===== Vultr 서울 구성 =====

const VULTR_PRICES: Record<string, { noSearch: number; search: number | null }> = {
  u5:   { noSearch: 10, search: null },
  u10:  { noSearch: 24, search: 36 },
  u15:  { noSearch: 27, search: 39 },
  u20:  { noSearch: 32, search: 47 },
  u30:  { noSearch: 40, search: 55 },
  u40:  { noSearch: 55, search: 73 },
  u40p: { noSearch: 68, search: 90 },
};

const VULTR_CONFIGS: Record<string, {
  noSearch: { mastodon: string; elastic: string | null };
  search?: { mastodon: string; elastic: string | null };
}> = {
  u5: {
    noSearch: { mastodon: 'vc2-1c-2gb (1 vCPU, 2GB RAM, 55GB SSD)', elastic: null },
  },
  u10: {
    noSearch: { mastodon: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)', elastic: null },
    search: { mastodon: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)', elastic: 'vhf-1c-2gb (1 vCPU, 2GB RAM, 64GB NVMe)' },
  },
  u15: {
    noSearch: { mastodon: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)', elastic: null },
    search: { mastodon: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)', elastic: 'vhf-1c-2gb (1 vCPU, 2GB RAM, 64GB NVMe)' },
  },
  u20: {
    noSearch: { mastodon: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)', elastic: null },
    search: { mastodon: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)', elastic: 'vhf-2c-2gb (2 vCPU, 2GB RAM, 80GB NVMe)' },
  },
  u30: {
    noSearch: { mastodon: 'vc2-4c-8gb (4 vCPU, 8GB RAM, 160GB SSD)', elastic: null },
    search: { mastodon: 'vc2-4c-8gb (4 vCPU, 8GB RAM, 160GB SSD)', elastic: 'vhf-1c-2gb (1 vCPU, 2GB RAM, 64GB NVMe)' },
  },
  u40: {
    noSearch: { mastodon: 'vhf-3c-8gb (3 vCPU, 8GB RAM, 256GB NVMe)', elastic: null },
    search: { mastodon: 'vhf-3c-8gb (3 vCPU, 8GB RAM, 256GB NVMe)', elastic: 'vhf-2c-2gb (2 vCPU, 2GB RAM, 80GB NVMe)' },
  },
  u40p: {
    noSearch: { mastodon: 'vhf-4c-16gb (4 vCPU, 16GB RAM, 384GB NVMe)', elastic: null },
    search: { mastodon: 'vhf-4c-16gb (4 vCPU, 16GB RAM, 384GB NVMe)', elastic: 'vhf-2c-4gb (2 vCPU, 4GB RAM, 128GB NVMe)' },
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

  // 5인 미만 (검색 없음): Vultr만
  if (usersKey === 'u5') {
    const usdMonthly = VULTR_PRICES.u5.noSearch;
    const usdTotal = usdMonthly * months;
    const cfg = VULTR_CONFIGS.u5.noSearch;
    return {
      type: 'vultr',
      months, monthsLabel, usersKey, usersLabel, search,
      hosting: 'Vultr (서울)',
      mastodon: cfg.mastodon,
      elastic: null,
      monthlyKrw: monthlyKrwStr(usdMonthly),
      totalKrw: totalKrwStr(usdTotal),
      freeMonths: 0, paidMonths: months,
      warnNotes: [],
    };
  }

  // 나머지: GCP vs Vultr 비교
  const gcpCfg = hasSearch ? GCP_CONFIGS[usersKey].search : GCP_CONFIGS[usersKey].noSearch;
  const vultrUsdMonthly = hasSearch ? VULTR_PRICES[usersKey].search! : VULTR_PRICES[usersKey].noSearch;
  const vultrCfg = hasSearch
    ? (VULTR_CONFIGS[usersKey].search ?? VULTR_CONFIGS[usersKey].noSearch)
    : VULTR_CONFIGS[usersKey].noSearch;

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
