/**
 * Order Form Type Definitions
 * 신청서 폼 전체 타입 정의
 */

// 약관 동의 상태
export type AgreementStatus = 'yes' | 'no' | null;

// 추가 옵션 타입 (배타적 선택)
export type AdditionalOption = 'logo' | 'dayTheme' | 'nightTheme' | 'bothTheme' | null;

// 메인 봇 타입
export type MainBotType = 'basic' | 'basicShop' | 'basicShopStat' | null;

// 운영 주수 옵션
export type OperationWeeksOption = 'manual' | 'longterm' | null;

// 양도 옵션
export type TransferOption = 'itemOnly' | 'currencyOnly' | 'all' | null;

// 빠른 마감 옵션
export type FastDeadlineOption = 'basic48h' | 'basic24h' | 'logo48h' | 'theme48h' | null;

// Step 1: 신청자 및 커뮤니티 정보
export interface Step1Data {
  termsAgreed: AgreementStatus;
  applicantNickname: string;
  communityShortName: string;
  communityKoreanName: string;
  communityEnglishName: string;
  isLongTermCommunity: boolean; // 장기 소규모 서버 여부 (체크 시 일정 입력 생략)
  resultAnnouncementDate: string; // yyyy-mm-dd
  openingDate: string; // yyyy-mm-dd
  closingDate: string; // yyyy-mm-dd
  operationWeeks: number; // 자동 계산
  googleEmail: string;
  googlePassword: string;
}

// Step 2: 서버 설치 옵션
export interface Step2Data {
  applyServerInstall: AgreementStatus;
  additionalOption: AdditionalOption;
  notionGuide: boolean;
  changeCharacterLimit: boolean;
  characterLimitValue: number;
  searchOption: boolean;
  mastoHostMigration: boolean;
  fastDeadline: boolean;
  fastDeadlineOption: FastDeadlineOption;
  desiredDeadline: string; // MM/DD
  adminAccountId: string;
}

// Step 3: 자동봇 커미션
export interface Step3Data {
  applyBot: AgreementStatus;
  operationWeeksOption: OperationWeeksOption;
  manualWeeks: number;
  botStartDate: string; // MM/DD
  botEndDate: string; // MM/DD
  mainBot: MainBotType;
  cocBot: boolean;
  omakaseBot: boolean;
  investigationBot: boolean;
  investigationDailyLimit: boolean;
  investigationDailyLimitCount: number;
  customCommandUpgrade: boolean;
  reservationToot: boolean;
  autoProfileImage: boolean;
  tootCurrencyLink: boolean;
  transferFeature: boolean;
  transferOption: TransferOption;
  attendanceSystem: boolean;
  attendanceCurrencyAmount: number; // 출석 시 받을 재화의 수 (정수)
  attendanceCommand: string; // 출석 명령어 (항상 [..] 형식)
  currencyUnit: string;
  statList: string;
  accountList: string[]; // 예약 툿/자동 스진용 추가 계정 (총괄 계정 제외)
  extraAccountTiers: number; // 추가 계정 구매 단계 (0~2, 단계당 +5천원·3칸)
  tootPerCurrency: string;
  omakaseDetails: string;
  setupDeadline: string; // MM/DD
  botSymbol: string;
  botAccountId: string;
  cocBotAccountId: string;
  investigationBotAccountId: string;
}

// Step 4: 최종 확인 및 견적
export interface Step4Data {
  policyConfirmation: string; // '예' 입력 필수
}

// 전체 신청서 데이터
export interface OrderFormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
}

// 견적 계산 결과
export interface PriceEstimate {
  serverTotal: number;
  botTotal: number;
  operationCost: number;
  grandTotal: number;
  hasVariablePrice: boolean; // 빠른 마감 또는 오마카세 선택 시
  variableItems: string[];
}

// 검증 에러
export interface ValidationError {
  field: string;
  message: string;
}

// localStorage 저장 키
export const ORDER_STORAGE_KEY = 'mas_commission_order_draft';

// 스키마 버전 (데이터 구조 변경 시 증가)
// v2: step3.accountList 를 string → string[] 로 변경, extraAccountTiers 추가
export const SCHEMA_VERSION = 2;

// localStorage 저장 데이터 타입
export interface StoredOrderData {
  version: number;
  formData: OrderFormData;
  currentStep: 1 | 2 | 3 | 4;
  savedAt: string;
}

// 날짜 포맷 정규식
export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// 이메일 정규식 (Gmail 전용) - 강화된 버전
// 점으로 시작/끝나거나 연속된 점 허용 안함
export const GMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._]*[a-zA-Z0-9])?@gmail\.com$/;

// 입력 필드 최대 길이 제한
export const INPUT_LIMITS = {
  applicantNickname: 50,
  communityShortName: 30,
  communityKoreanName: 100,
  communityEnglishName: 100,
  botSymbol: 5,
  adminAccountId: 100,
  botAccountId: 100,
  cocBotAccountId: 100,
  investigationBotAccountId: 100,
  currencyUnit: 20,
  statList: 500,
  accountList: 100, // 계정 1칸당 최대 길이
  tootPerCurrency: 200,
  omakaseDetails: 1000,
} as const;
