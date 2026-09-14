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
    // 도메인 구입 + SMTP 메일 발송 서비스 실비. 서버 설치에 자동 포함(장기 소규모 서버 제외)
    infraFee: 5000,
    options: {
      logo: 5000,
      dayTheme: 20000,
      nightTheme: 20000,
      bothTheme: 30000,
    },
    addons: {
      characterLimit: 5000,
      search: 15000,
      mastoHostMigration: 20000,
      fastDeadline: {
        basic48h: 5000,
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
      tootCurrencyLink: 10000,
      transferFeature: 10000,
      customCommandUpgrade: 5000,
      investigationBot: 20000,
      investigationDailyLimit: 5000,
      attendanceSystem: 10000,
      extraAccountTier: 5000,
    },
    operationPerWeek: 5000,
    longTermSetupFee: 10000,
  },

  policy: {
    freeQuestions: 3,
    questionPrice: 3000,
  },
} as const;

export type PricingConfig = typeof PRICING_CONFIG;

/** 견적(장바구니)에서 서버 설치 본품을 가리키는 항목명 */
export const SERVER_INSTALL_ITEM_NAME = '마스토돈 서버 설치';

/**
 * 서버 설치 신청 시 자동으로 따라붙는 실비 항목.
 * 개별 선택/해제가 불가능하며, 장기 소규모 서버는 제외된다.
 */
export const SERVER_INFRA_FEE_ITEM = {
  /**
   * 견적 항목의 식별 키로도 쓰이므로 바꾸지 말 것.
   * (localStorage 에 저장된 장바구니를 이름으로 대조한다 — syncInfraFeeItem 참고)
   */
  name: '도메인·메일(SMTP) 부가비용',
  /** 크레페로 보내는 복사 텍스트에서 쓰는 짧은 이름 */
  copyLabel: '부가비용',
  price: PRICING_CONFIG.server.infraFee,
  description: '도메인 구입과 메일 발송(SMTP) 서비스에 나가는 실비입니다. 서버 설치에 자동 포함되며 따로 해제하실 수 없어요.',
} as const;

/** 이 개월 수 이상이면 장기 소규모(반영구) 서버로 본다 */
export const LONG_TERM_MIN_MONTHS = 12;

/**
 * 예약 툿/자동 스진용 계정 등록 정책
 */
export const ACCOUNT_LIST_CONFIG = {
  freeExtraSlotsWithAdmin: 2, // 총괄 계정 외 무료 추가 칸
  freeExtraSlotsNoAdmin: 3, // 총괄 계정이 없을 때 무료 추가 칸
  maxTiers: 2, // 추가 구매 가능 단계
  slotsPerTier: 3, // 단계당 추가되는 칸 수
  maxTotalAccounts: 9, // 총괄 계정 포함 최대 등록 수
} as const;
