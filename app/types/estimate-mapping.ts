/**
 * 견적 ↔ 신청서 매핑 타입 정의
 * 견적에서 담은 항목이 신청서 필드에 어떻게 매핑되는지 정의
 */

// 견적 항목이 매핑될 수 있는 키 타입
export type EstimateMappingKey =
  // 서버 설치 관련
  | 'serverInstall'      // → step2.applyServerInstall = 'yes'
  | 'botInstall'         // → step3.applyBot = 'yes'
  | 'logo'               // → step2.additionalOption = 'logo'
  | 'dayTheme'           // → step2.additionalOption = 'dayTheme'
  | 'nightTheme'         // → step2.additionalOption = 'nightTheme'
  | 'bothTheme'          // → step2.additionalOption = 'bothTheme'
  | 'notionGuide'        // → step2.notionGuide = true
  | 'characterLimit'     // → step2.changeCharacterLimit = true
  | 'localTimeline'      // → step2.changeLocalTimeline = true
  | 'fastDeadline24h'    // → step2.fastDeadline = true, fastDeadlineOption = 'basic24h'
  | 'fastDeadline48hLogo'// → step2.fastDeadline = true, fastDeadlineOption = 'logo48h'
  | 'fastDeadline48hTheme' // → step2.fastDeadline = true, fastDeadlineOption = 'theme48h'
  | 'search'             // → 검색 기능 (추가 옵션)
  // 자동봇 관련
  | 'basicBot'           // → step3.mainBot = 'basic'
  | 'basicShopBot'       // → step3.mainBot = 'basicShop'
  | 'basicShopStatBot'   // → step3.mainBot = 'basicShopStat'
  | 'cocBot'             // → step3.cocBot = true
  | 'omakaseBot'         // → step3.omakaseBot = true
  | 'reservationToot'    // → step3.reservationToot = true
  | 'autoProfileImage'   // → step3.autoProfileImage = true (스토리 자동 진행)
  | 'tootCurrencyLink'   // → step3.tootCurrencyLink = true
  | 'transferFeature'    // → step3.transferFeature = true
  | 'operationWeeks'     // → step3.manualWeeks (특별 처리 필요)
  | 'customCommandUpgrade' // → 커스텀 명령어 업그레이드 (추가 옵션)
  | 'autoInvestigation'  // → 자동조사 타입
  | 'investigationDailyLimit' // → 일일 조사 횟수 제한
  | 'dmNotification' // → 특정 상황 DM 전송
  | 'botFastDeadline48h' // → 빠른 마감 (48시간 내)
  | 'botFastDeadline1w'; // → 빠른 마감 (1주일 내)

// 견적 항목 이름과 매핑 키 매칭 테이블
export const ESTIMATE_NAME_TO_MAPPING_KEY: Record<string, EstimateMappingKey> = {
  // 서버 설치 기본 옵션
  '마스토돈 서버 설치': 'serverInstall',
  '자동봇 설치': 'botInstall',
  
  // 서버 추가 옵션
  '로고만 변경': 'logo',
  '테마 1종 커스텀': 'dayTheme',  // 낮 또는 밤 1종
  '테마 전체 커스텀': 'bothTheme', // 낮/밤 2종
  '툿 글자수 제한 변경': 'characterLimit',
  '로컬 타임라인 설정 변경': 'localTimeline',
  '검색 기능': 'search',
  '마스토돈 가이드': 'notionGuide',
  
  // 빠른 마감 옵션
  '빠른마감: 24시간 내 기본 서버 설치': 'fastDeadline24h',
  '빠른마감: 48시간 내 로고 변경 서버 설치': 'fastDeadline48hLogo',
  '빠른마감: 48시간 내 테마 커스텀 서버 설치': 'fastDeadline48hTheme',
  
  // 봇 타입
  '기본 타입': 'basicBot',
  '기본&상점 타입': 'basicShopBot',
  '기본&상점&스탯 타입': 'basicShopStatBot',
  'CoC 타입': 'cocBot',
  '오마카세 타입': 'omakaseBot',
  '자동조사 타입': 'autoInvestigation',

  // 봇 추가 옵션
  '예약 툿': 'reservationToot',
  '스토리 자동 진행': 'autoProfileImage',
  '커스텀 명령어 업그레이드': 'customCommandUpgrade',
  '양도 기능': 'transferFeature',
  '툿수-재화 자동반영': 'tootCurrencyLink',
  '일일 조사 횟수 제한': 'investigationDailyLimit',
  '특정 상황 DM 전송': 'dmNotification',
  '빠른 마감 (48시간 내)': 'botFastDeadline48h',
  '빠른 마감 (1주일 내)': 'botFastDeadline1w',

  // 타입별 추가 옵션 (레거시 - 하단 추가 옵션으로 통합)
  '기본 타입 - 커스텀 명령어 업그레이드': 'customCommandUpgrade',
  '기본&상점 타입 - 양도 기능': 'transferFeature',
  '기본&상점 타입 - 툿수-재화 자동반영': 'tootCurrencyLink',
  '기본&상점 타입 - 커스텀 명령어 업그레이드': 'customCommandUpgrade',
  '기본&상점&스탯 타입 - 양도 기능': 'transferFeature',
  '기본&상점&스탯 타입 - 툿수-재화 자동반영': 'tootCurrencyLink',
  '기본&상점&스탯 타입 - 커스텀 명령어 업그레이드': 'customCommandUpgrade',
};

// 매핑 키 → 신청서 필드 매핑 정의
export interface OrderFieldMapping {
  step: 2 | 3;
  field: string;
  value: unknown;
}

// 매핑 키별 신청서 필드 매핑
export const MAPPING_KEY_TO_ORDER_FIELD: Record<EstimateMappingKey, OrderFieldMapping[]> = {
  // 서버 설치
  serverInstall: [{ step: 2, field: 'applyServerInstall', value: 'yes' }],
  botInstall: [{ step: 3, field: 'applyBot', value: 'yes' }],
  
  // 추가 옵션 (테마)
  logo: [{ step: 2, field: 'additionalOption', value: 'logo' }],
  dayTheme: [{ step: 2, field: 'additionalOption', value: 'dayTheme' }],
  nightTheme: [{ step: 2, field: 'additionalOption', value: 'nightTheme' }],
  bothTheme: [{ step: 2, field: 'additionalOption', value: 'bothTheme' }],
  
  // 기타 서버 옵션
  notionGuide: [{ step: 2, field: 'notionGuide', value: true }],
  characterLimit: [{ step: 2, field: 'changeCharacterLimit', value: true }],
  localTimeline: [
    { step: 2, field: 'applyServerInstall', value: 'yes' },
    { step: 2, field: 'changeLocalTimeline', value: true }
  ],
  search: [
    { step: 2, field: 'applyServerInstall', value: 'yes' },
    { step: 2, field: 'searchOption', value: true }
  ],
  
  // 빠른 마감
  fastDeadline24h: [
    { step: 2, field: 'fastDeadline', value: true },
    { step: 2, field: 'fastDeadlineOption', value: 'basic24h' }
  ],
  fastDeadline48hLogo: [
    { step: 2, field: 'fastDeadline', value: true },
    { step: 2, field: 'fastDeadlineOption', value: 'logo48h' }
  ],
  fastDeadline48hTheme: [
    { step: 2, field: 'fastDeadline', value: true },
    { step: 2, field: 'fastDeadlineOption', value: 'theme48h' }
  ],
  
  // 메인 봇 타입
  basicBot: [
    { step: 3, field: 'applyBot', value: 'yes' },
    { step: 3, field: 'mainBot', value: 'basic' }
  ],
  basicShopBot: [
    { step: 3, field: 'applyBot', value: 'yes' },
    { step: 3, field: 'mainBot', value: 'basicShop' }
  ],
  basicShopStatBot: [
    { step: 3, field: 'applyBot', value: 'yes' },
    { step: 3, field: 'mainBot', value: 'basicShopStat' }
  ],
  
  // 봇 추가 옵션
  cocBot: [
    { step: 3, field: 'applyBot', value: 'yes' },
    { step: 3, field: 'cocBot', value: true }
  ],
  omakaseBot: [
    { step: 3, field: 'applyBot', value: 'yes' },
    { step: 3, field: 'omakaseBot', value: true }
  ],
  reservationToot: [{ step: 3, field: 'reservationToot', value: true }],
  autoProfileImage: [{ step: 3, field: 'autoProfileImage', value: true }],
  tootCurrencyLink: [{ step: 3, field: 'tootCurrencyLink', value: true }],
  transferFeature: [{ step: 3, field: 'transferFeature', value: true }],
  operationWeeks: [], // 특별 처리 필요 (값이 동적)
  
  // 기타 봇 옵션
  customCommandUpgrade: [
    { step: 3, field: 'customCommandUpgrade', value: true }
  ],
  autoInvestigation: [
    { step: 3, field: 'applyBot', value: 'yes' },
    { step: 3, field: 'investigationBot', value: true },
  ],
  investigationDailyLimit: [
    { step: 3, field: 'investigationDailyLimit', value: true },
  ],
  dmNotification: [{ step: 3, field: 'dmNotification', value: true }],
  botFastDeadline48h: [],
  botFastDeadline1w: [],
};

// localStorage 키 - 동기화 상태 플래그
export const CART_SYNC_KEY = 'mas_commission_cart_synced';

// 동기화 상태 타입
export interface CartSyncState {
  synced: boolean;
  syncedAt: string;
  itemCount: number;
  syncedItems: string[]; // 동기화된 항목 이름 목록
}
