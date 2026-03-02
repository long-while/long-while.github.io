/**
 * Form Configuration Constants
 * 폼 설정 상수
 */

export const FORM_CONFIG = {
  // 자동 저장 설정
  autosave: {
    intervalMs: 5000, // 5초마다 자동 저장
    debounceMs: 300,  // 입력 디바운스
  },

  // 애니메이션 설정
  animation: {
    stepTransitionMs: 200,      // 스텝 전환 애니메이션
    countUpDurationMs: 800,     // 개별 가격 카운트업
    countUpTotalDurationMs: 1200, // 총합 카운트업
    toastDurationMs: 3000,      // 토스트 표시 시간
    toastExitDelayMs: 500,      // 토스트 페이드아웃 후 제거
  },

  // 유효성 검사 설정
  validation: {
    characterLimit: {
      min: 1,
      max: 10000,
      default: 1000,
    },
    password: {
      minLength: 8,
    },
  },
} as const;

/**
 * 가격 정책
 */
export const PRICING_CONFIG = {
  version: '2026-01-30',

  server: {
    base: 20000,
    options: {
      logo: 5000,
      dayTheme: 20000,
      nightTheme: 20000,
      bothTheme: 30000,
    },
    addons: {
      notionGuide: 5000,
      characterLimit: 5000,
      search: 30000,
      fastDeadline: {
        basic24h: 10000,
        logo48h: 15000,
        theme48h: 20000,
      },
    },
  },

  bot: {
    mainTypes: {
      basic: 15000,
      basicShop: 35000,
      basicShopStat: 45000,
    },
    addons: {
      cocBot: 30000,
      reservationToot: 5000,
      autoProfileImage: 5000,
      tootCurrencyLink: 7000,
      transferFeature: 10000,
      customCommandUpgrade: 5000,
    },
    operationPerWeek: 5000,
  },

  policy: {
    freeQuestions: 3,
    questionPrice: 3000,
  },
} as const;

export type PricingConfig = typeof PRICING_CONFIG;
