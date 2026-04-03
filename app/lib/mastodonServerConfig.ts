// ===== 선택 옵션 =====

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
  { value: 'u30', label: '11~30인' },
  { value: 'u30p', label: '30인 초과' },
];

// ===== KRW 포맷 =====

function formatKrw(krw: number): string {
  if (krw === 0) return '무료';
  const man = krw / 10000;
  if (Number.isInteger(man)) return `${man}만원`;
  return `${man.toFixed(1)}만원`;
}

// ===== GCP us-central1 구성 (monthly: KRW) =====
// u5   noSearch 3만원  (e2-small)
// u10  noSearch 3만원  (e2-small)   / search 6만원  (e2-small + e2-small 검색)
// u30  noSearch 4만원  (e2-medium)  / search 7만원  (e2-medium + e2-small 검색)
// u30p noSearch 8만원  (e2-standard-2) / search 12만원 (e2-standard-2 + e2-medium 검색)

const GCP_CONFIGS: Record<string, {
  noSearch: { monthly: number; mastodon: string; elastic: string | null };
  search: { monthly: number; mastodon: string; elastic: string | null } | null;
}> = {
  u5: {
    noSearch: { monthly: 30000, mastodon: 'e2-small (2 vCPU, 2GB RAM)', elastic: null },
    search: null,
  },
  u10: {
    noSearch: { monthly: 30000, mastodon: 'e2-small (2 vCPU, 2GB RAM)', elastic: null },
    search: { monthly: 60000, mastodon: 'e2-small (2 vCPU, 2GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30: {
    noSearch: { monthly: 40000, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: null },
    search: { monthly: 70000, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30p: {
    noSearch: { monthly: 80000, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: null },
    search: { monthly: 120000, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: 'e2-medium (2 vCPU, 4GB RAM)' },
  },
};

// ===== GCP 3개월 이하 전용 (크레딧만 소모하므로 사양 업그레이드) =====
// u5   e2-small     (변경 없음)
// u10  e2-medium    (e2-small → e2-medium)
// u30  e2-standard-2 (e2-medium → e2-standard-2)
// u30p e2-standard-4 (e2-standard-2 → e2-standard-4)

const GCP_SHORT_CONFIGS: Record<string, {
  noSearch: { monthly: number; mastodon: string; elastic: string | null };
  search: { monthly: number; mastodon: string; elastic: string | null } | null;
}> = {
  u5: {
    noSearch: { monthly: 30000, mastodon: 'e2-small (2 vCPU, 2GB RAM)', elastic: null },
    search: null,
  },
  u10: {
    noSearch: { monthly: 40000, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: null },
    search: { monthly: 70000, mastodon: 'e2-medium (2 vCPU, 4GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30: {
    noSearch: { monthly: 80000, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: null },
    search: { monthly: 110000, mastodon: 'e2-standard-2 (2 vCPU, 8GB RAM)', elastic: 'e2-small (2 vCPU, 2GB RAM)' },
  },
  u30p: {
    noSearch: { monthly: 160000, mastodon: 'e2-standard-4 (4 vCPU, 16GB RAM)', elastic: null },
    search: { monthly: 200000, mastodon: 'e2-standard-4 (4 vCPU, 16GB RAM)', elastic: 'e2-medium (2 vCPU, 4GB RAM)' },
  },
};

// ===== Vultr 서울 구성 (monthly: KRW) =====
// u5   noSearch 2만원  (vhf-1c-2gb)
// u10  noSearch 3만원  (vc2-2c-4gb)  / search 4.5만원 (vc2-2c-4gb + vc2-1c-2gb 검색 1.5만원)
// u30  noSearch 3.5만원 (vhp-2c-4gb) / search 6.5만원  (vhp-2c-4gb + vc2-2c-4gb 검색 3만원)
// u30p noSearch 6만원  (vc2-4c-8gb)  / search 9만원    (vc2-4c-8gb + vc2-2c-4gb 검색 3만원)

const VULTR_PRICES: Record<string, { noSearch: number; search: number | null }> = {
  u5:   { noSearch: 20000, search: null },
  u10:  { noSearch: 30000, search: 45000 },
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

  const vultrMonthlyKrw = hasSearch ? VULTR_PRICES[usersKey].search! : VULTR_PRICES[usersKey].noSearch;
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
      monthlyKrw: formatKrw(vultrMonthlyKrw),
      totalKrw: formatKrw(vultrMonthlyKrw * months),
      freeMonths: 0, paidMonths: months,
      warnNotes: [],
    };
  }

  // GCP vs Vultr 비교 (3개월 이하: 크레딧 전용 사양)
  const gcpEntry = months <= 3 ? GCP_SHORT_CONFIGS[usersKey] : GCP_CONFIGS[usersKey];
  const gcpCfg = hasSearch ? gcpEntry.search : gcpEntry.noSearch;

  // GCP 설정이 없는 경우 Vultr 강제 (u5+search는 위에서 처리됨)
  if (!gcpCfg) {
    return {
      type: 'vultr',
      months, monthsLabel, usersKey, usersLabel, search,
      hosting: 'Vultr (서울)',
      mastodon: vultrCfg.mastodon,
      elastic: vultrCfg.elastic,
      monthlyKrw: formatKrw(vultrMonthlyKrw),
      totalKrw: formatKrw(vultrMonthlyKrw * months),
      freeMonths: 0, paidMonths: months,
      warnNotes: [],
    };
  }

  const gcpMonthlyKrw = gcpCfg.monthly;
  const paidMonths = Math.max(0, months - 3);
  const gcpKrwTotal = paidMonths * gcpMonthlyKrw;
  const vultrKrwTotal = months * vultrMonthlyKrw;

  // GCP가 유리한 경우
  if (vultrKrwTotal >= gcpKrwTotal) {
    return {
      type: 'gcp',
      months, monthsLabel, usersKey, usersLabel, search,
      hosting: 'GCP (us-central1)',
      mastodon: gcpCfg.mastodon,
      elastic: gcpCfg.elastic,
      monthlyKrw: formatKrw(gcpMonthlyKrw),
      totalKrw: formatKrw(gcpKrwTotal),
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
    monthlyKrw: formatKrw(vultrMonthlyKrw),
    totalKrw: formatKrw(vultrKrwTotal),
    freeMonths: 0,
    paidMonths: months,
    warnNotes: [],
  };
}
