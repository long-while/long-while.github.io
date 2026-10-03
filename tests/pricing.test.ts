/**
 * 가격/견적 로직 검증.
 * 별도 테스트 러너 없이 `npm run test` (vite SSR 번들 → node 실행)로 돌린다.
 */

import { syncInfraFeeItem, insertRemovedItem, sanitizeEstimateItems } from '@/app/contexts/EstimateContext';
import { catalogPrice, currentItemName } from '@/app/utils/estimateCatalog';
import { ESTIMATE_NAME_TO_MAPPING_KEY } from '@/app/types/estimate-mapping';
import { ADDITIONAL_OPTIONS as BOT_OPTIONS, BOT_TYPES } from '@/app/components/bot/botContent';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import {
  calculateServerPrice,
  calculateTotalEstimate,
  generateCopyText,
  getDeadlineBlackoutError,
  hasServerInfraFee,
  asAccount,
  botPeriodWithYears,
  computeRequiredFastDeadline,
  extractMonthDay,
  isPastMonthDay,
  rushFitsCustomOption,
  validateOrderConsistency,
  isRealMonthDay,
  MISSING_GOOGLE_EMAIL_MARK,
  MISSING_GOOGLE_PASSWORD_MARK,
  validateAccountId,
  validateDates,
  validateGoogleAccount,
  validateStep1,
  validateStep2,
  validateStep3,
} from '@/app/utils/orderUtils';
import { syncCartToOrderData } from '@/app/utils/cartOrderSync';
import { FAQ_ITEMS, FAQ_CATEGORIES } from '@/app/components/faq/faqContent';
import { filterEntries, groupByCategory, splitByQuery } from '@/app/components/faq/faqSearch';
import { eulReul, eunNeun } from '@/app/utils/josa';
import {
  PRICING_CONFIG,
  SERVER_INFRA_FEE_ITEM,
  SERVER_INSTALL_ITEM_NAME,
} from '@/app/constants/form';
import type { OrderFormData } from '@/app/types/order';
import {
  getAvailableTiers,
  getMonthOptions,
  getServerCalcResult,
  getUsersOptions,
  isUsersAllowed,
  needsTier,
} from '@/app/lib/mastodonServerConfig';

let failed = 0;

// 날짜 규칙(지난 폐장일·연도 범위)이 실행하는 해에 따라 달라지지 않게 올해 기준으로 만든다
const THIS_YEAR = new Date().getFullYear();
const NEXT_YEAR = THIS_YEAR + 1;

function check(label: string, actual: unknown, expected: unknown): void {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  if (!passed) failed++;
  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${label}${passed ? '' : `  (actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)})`}`);
}

function createFormData(): OrderFormData {
  return {
    step1: {
      termsAgreed: null,
      applicantNickname: '',
      communityShortName: '',
      communityKoreanName: '',
      communityEnglishName: '',
      isLongTermCommunity: false,
      longTermConfirmed: false,
      resultAnnouncementDate: '',
      openingDate: '',
      closingDate: '',
      operationWeeks: 0,
      googleEmail: '',
      googlePassword: '',
    },
    step2: {
      applyServerInstall: null,
      additionalOption: null,
      changeCharacterLimit: false,
      characterLimitValue: 0,
      searchOption: false,
      mastoHostMigration: false,
      fastDeadline: false,
      fastDeadlineOption: null,
      desiredDeadline: '',
      adminAccountId: '',
    },
    step3: {
      applyBot: null,
      operationWeeksOption: null,
      manualWeeks: 0,
      botStartDate: '',
      botEndDate: '',
      mainBot: null,
      cocBot: false,
      trpg2d6Bot: false,
      omakaseBot: false,
      investigationBot: false,
      investigationDailyLimit: false,
      investigationDailyLimitCount: 0,
      customCommandUpgrade: false,
      reservationToot: false,
      autoProfileImage: false,
      tootCurrencyLink: false,
      transferFeature: false,
      transferOption: null,
      attendanceSystem: false,
      attendanceCurrencyAmount: 10,
      attendanceCommand: '[출석]',
      currencyUnit: '',
      statList: '',
      accountList: [],
      extraAccountTiers: 0,
      tootPerCurrency: '',
      omakaseDetails: '',
      setupDeadline: '',
      botSymbol: '✶',
      botAccountId: '',
      investigationBotAccountId: '',
    },
    step4: { policyConfirmation: '' },
  };
}

// ===== 견적(장바구니) 자동 포함 실비 =====

const installItem: EstimateItem = {
  id: 'install',
  name: SERVER_INSTALL_ITEM_NAME,
  price: PRICING_CONFIG.server.base,
  category: 'server',
};
const themeItem: EstimateItem = {
  id: 'theme',
  name: '테마 1종 커스텀',
  price: 20000,
  category: 'server',
};

const withFee = syncInfraFeeItem([installItem, themeItem], true);
check('실비가 자동으로 담긴다', withFee.length, 3);
check('실비는 서버 설치 바로 뒤에 붙는다', withFee[1].name, SERVER_INFRA_FEE_ITEM.name);
check('실비는 잠금 상태다', withFee[1].locked, true);
check('실비 금액', withFee[1].price, PRICING_CONFIG.server.infraFee);
check('이미 맞춰져 있으면 같은 배열을 반환한다', syncInfraFeeItem(withFee, true) === withFee, true);
check(
  '장기 소규모 서버면 실비를 뺀다',
  syncInfraFeeItem(withFee, false).map((item) => item.name),
  [SERVER_INSTALL_ITEM_NAME, themeItem.name]
);
check('서버 설치가 없으면 실비도 없다', syncInfraFeeItem([themeItem], false).length, 1);
check(
  '중복 실비 항목은 하나로 정리된다',
  syncInfraFeeItem(
    [installItem, { ...withFee[1], id: 'dup1' }, { ...withFee[1], id: 'dup2' }],
    true
  ).filter((item) => item.name === SERVER_INFRA_FEE_ITEM.name).length,
  1
);

const staleFee = syncInfraFeeItem(
  [installItem, { id: 'old', name: SERVER_INFRA_FEE_ITEM.name, price: 3000, category: 'server' }],
  true
).find((item) => item.name === SERVER_INFRA_FEE_ITEM.name);
check('예전에 저장된 실비 항목은 최신 금액으로 갱신된다', staleFee?.price, PRICING_CONFIG.server.infraFee);
check('예전에 저장된 실비 항목도 잠금 처리된다', staleFee?.locked, true);

// ===== 삭제 되돌리기(undo) =====

const undoBase: EstimateItem[] = [installItem, themeItem];
const searchItem: EstimateItem = { id: 'search', name: '검색 기능', price: 15000, category: 'server' };

check(
  '삭제한 항목이 원래 자리에 돌아온다',
  insertRemovedItem(undoBase, { item: searchItem, index: 1 }).map((i) => i.name),
  [SERVER_INSTALL_ITEM_NAME, searchItem.name, themeItem.name]
);
check(
  '같은 id 가 이미 있으면 중복 삽입하지 않는다',
  insertRemovedItem([...undoBase, searchItem], { item: searchItem, index: 1 }).length,
  3
);
check(
  '이름이 같고 id 만 다르면(다시 담은 경우) 중복 삽입하지 않는다',
  insertRemovedItem([...undoBase, { ...searchItem, id: 'different' }], { item: searchItem, index: 1 })
    .filter((i) => i.name === searchItem.name).length,
  1
);
check(
  'index 가 배열보다 크면 끝에 붙인다',
  insertRemovedItem(undoBase, { item: searchItem, index: 99 }).map((i) => i.name).pop(),
  searchItem.name
);
check(
  'index 가 음수여도 맨 앞에 붙는다',
  insertRemovedItem(undoBase, { item: searchItem, index: -5 })[0].name,
  searchItem.name
);
check('되돌릴 게 없으면 원본 배열 그대로', insertRemovedItem([], { item: searchItem, index: 0 }).length, 1);

// ===== 신청서 견적 =====

const noServer = createFormData();
noServer.step2.applyServerInstall = 'no';

const serverOrder = createFormData();
serverOrder.step2.applyServerInstall = 'yes';

const longTermOrder = createFormData();
longTermOrder.step2.applyServerInstall = 'yes';
longTermOrder.step1.isLongTermCommunity = true;

check('서버 미신청이면 0원', calculateServerPrice(noServer.step2, false), 0);
check(
  '서버 설치 = 기본료 + 실비',
  calculateServerPrice(serverOrder.step2, false),
  PRICING_CONFIG.server.base + PRICING_CONFIG.server.infraFee
);
check('장기 소규모 서버는 기본료만', calculateServerPrice(serverOrder.step2, true), PRICING_CONFIG.server.base);

check('실비 부과 여부 (일반)', hasServerInfraFee(serverOrder), true);
check('실비 부과 여부 (서버 미신청)', hasServerInfraFee(noServer), false);
check('실비 부과 여부 (장기 소규모)', hasServerInfraFee(longTermOrder), false);

check(
  '총 견적에 실비가 반영된다',
  calculateTotalEstimate(serverOrder).grandTotal,
  PRICING_CONFIG.server.base + PRICING_CONFIG.server.infraFee
);
check(
  '장기 소규모 총 견적에는 실비가 없다',
  calculateTotalEstimate(longTermOrder).grandTotal,
  PRICING_CONFIG.server.base
);

// ===== 복붙용 텍스트 =====

const copyText = generateCopyText(serverOrder, calculateTotalEstimate(serverOrder), null);
check('복붙 텍스트 옵션 줄', copyText.includes(`+ ${SERVER_INFRA_FEE_ITEM.copyLabel}`), true);
check('복붙 텍스트에는 긴 이름이 나오지 않는다', copyText.includes(SERVER_INFRA_FEE_ITEM.name), false);
check(
  '복붙 텍스트 견적 줄',
  copyText.includes(`${SERVER_INFRA_FEE_ITEM.copyLabel} ${PRICING_CONFIG.server.infraFee.toLocaleString()}`),
  true
);
check('복붙 텍스트 총액', copyText.trim().endsWith('25,000원'), true);

const longTermCopyText = generateCopyText(longTermOrder, calculateTotalEstimate(longTermOrder), null);
check('장기 소규모 복붙 텍스트에는 실비가 없다', longTermCopyText.includes(SERVER_INFRA_FEE_ITEM.copyLabel), false);
check('장기 소규모 복붙 텍스트 총액', longTermCopyText.trim().endsWith('2만원'), true);

// ===== 마감 불가 기간 =====

// 4단계: 접수 불가 기간에 연도(2026)가 붙어, 실행하는 날짜와 상관없이 같은 결과가 나오게 기준일을 고정
const BLACKOUT_REF = new Date(2026, 8, 1);
check('10/20은 마감 불가', getDeadlineBlackoutError('10/20', 'desiredDeadline', BLACKOUT_REF)?.field, 'desiredDeadline');
check('10/15은 마감 불가 (시작일)', getDeadlineBlackoutError('10/15', 'desiredDeadline', BLACKOUT_REF) !== null, true);
check('10/28은 마감 불가 (종료일)', getDeadlineBlackoutError('10/28', 'desiredDeadline', BLACKOUT_REF) !== null, true);
check('10/14는 마감 가능', getDeadlineBlackoutError('10/14', 'desiredDeadline', BLACKOUT_REF), null);
check('10/29는 마감 가능', getDeadlineBlackoutError('10/29', 'desiredDeadline', BLACKOUT_REF), null);
check('8/22는 마감 가능 (예전 기간 해제)', getDeadlineBlackoutError('8/22', 'desiredDeadline', BLACKOUT_REF), null);
check('10/3은 마감 가능 (예전 기간 해제)', getDeadlineBlackoutError('10/3', 'desiredDeadline', BLACKOUT_REF), null);
check('다음 해 같은 날짜는 막지 않음', getDeadlineBlackoutError('10/20', 'desiredDeadline', new Date(2027, 8, 1)), null);
check('안내 문구에 연도', getDeadlineBlackoutError('10/20', 'desiredDeadline', BLACKOUT_REF)?.message, '2026년 10/15~10/28은 마감이 불가능한 기간입니다.');

// ===== 구글 계정 검증 (Step 1 → Step 4 이동) =====

const emptyStep1 = createFormData().step1;
check(
  '빈 구글 계정은 이메일·비밀번호 두 가지 오류',
  validateGoogleAccount(emptyStep1).map((e) => e.field),
  ['googleEmail', 'googlePassword']
);
check(
  'Gmail 이 아니면 오류',
  validateGoogleAccount({ ...emptyStep1, googleEmail: 'me@naver.com', googlePassword: 'longenough' })
    .map((e) => e.field),
  ['googleEmail']
);
check(
  '비밀번호 8자 미만이면 오류',
  validateGoogleAccount({ ...emptyStep1, googleEmail: 'me@gmail.com', googlePassword: 'short' })
    .map((e) => e.field),
  ['googlePassword']
);
check(
  '정상 입력이면 오류 없음',
  validateGoogleAccount({ ...emptyStep1, googleEmail: 'me@gmail.com', googlePassword: 'longenough' }),
  []
);

// 구글 계정은 Step 4 에서 받으므로 Step 1 검증에는 더 이상 포함되지 않는다
const filledStep1 = {
  ...emptyStep1,
  termsAgreed: 'yes' as const,
  applicantNickname: '한참',
  communityShortName: '망저',
  communityKoreanName: '망각의 저편',
  communityEnglishName: 'Beyond the Oblivion',
  // 4단계: 폐장일이 지난 신청·먼 연도 오타를 막으므로 늘 내년 날짜로 (이 검사의 목적은 구글 계정)
  resultAnnouncementDate: `${NEXT_YEAR}-01-01`,
  openingDate: `${NEXT_YEAR}-01-10`,
  closingDate: `${NEXT_YEAR}-03-10`,
};
check('Step 1 검증은 구글 계정을 요구하지 않는다', validateStep1(filledStep1), []);
check(
  'Step 1 검증에 googleEmail 필드가 없다',
  validateStep1(emptyStep1).some((e) => e.field.startsWith('google')),
  false
);

// ===== 복사 텍스트의 구글 계정 누락 표시 =====

const missingAccountOrder: OrderFormData = {
  ...serverOrder,
  step1: { ...serverOrder.step1, googleEmail: '', googlePassword: '' },
};
const missingAccountText = generateCopyText(
  missingAccountOrder,
  calculateTotalEstimate(missingAccountOrder),
  null
);
check('비밀번호가 비면 복사 텍스트에 표시가 남는다', missingAccountText.includes(MISSING_GOOGLE_PASSWORD_MARK), true);
check('이메일이 비면 복사 텍스트에 표시가 남는다', missingAccountText.includes(MISSING_GOOGLE_EMAIL_MARK), true);
check('빈 계정이 " / " 로만 남지 않는다', missingAccountText.includes('\n / \n'), false);

const filledAccountOrder: OrderFormData = {
  ...serverOrder,
  step1: { ...serverOrder.step1, googleEmail: 'me@gmail.com', googlePassword: 'longenough' },
};
const filledAccountText = generateCopyText(
  filledAccountOrder,
  calculateTotalEstimate(filledAccountOrder),
  null
);
check('정상 입력이면 표시가 붙지 않는다', filledAccountText.includes('[!]'), false);
check('정상 입력은 이메일 / 비밀번호로 들어간다', filledAccountText.includes('me@gmail.com / longenough'), true);

// ===== TRPG 봇 (D100 / 2D6 3종세트) =====

function createTrpgOrder(step3: Partial<OrderFormData['step3']>): OrderFormData {
  const base = createFormData();
  return {
    ...base,
    step3: {
      ...base.step3,
      applyBot: 'yes',
      operationWeeksOption: 'longterm',
      setupDeadline: '03/15',
      botAccountId: '@BOT',
      ...step3,
    },
  };
}
const fieldsOf = (order: OrderFormData) => validateStep3(order.step3).map((error) => error.field);

const cartSync = syncCartToOrderData([
  { id: 'd100', name: 'D100 룰 대응 TRPG봇', price: 30000, category: 'bot' },
  { id: '2d6', name: '2D6 룰 대응 TRPG봇 3종', price: 80000, category: 'bot' },
]);
check('견적 → 신청서: D100 타입', cartSync.step3.cocBot, true);
check('견적 → 신청서: 2D6 3종세트 타입', cartSync.step3.trpg2d6Bot, true);

const solo2d6 = createTrpgOrder({ trpg2d6Bot: true, botAccountId: '' });
check('2D6 단독 신청 허용', fieldsOf(solo2d6).includes('mainBot'), false);
check('2D6 단독이면 봇 계정 입력 불필요', fieldsOf(solo2d6), []);
check(
  '2D6 가격',
  calculateTotalEstimate(solo2d6).botTotal,
  PRICING_CONFIG.bot.addons.trpg2d6Bot
);
const solo2d6Text = generateCopyText(solo2d6, calculateTotalEstimate(solo2d6), null);
check('복붙 텍스트 짧은 이름', solo2d6Text.includes('+ 2D6 3종세트 타입'), true);
check('복붙 텍스트 긴 이름 없음', solo2d6Text.includes('특기표'), false);
check('2D6 단독이면 계정 정보 미출력', solo2d6Text.includes('봇 계정'), false);

const soloCoc = createTrpgOrder({ cocBot: true, botAccountId: '@leftover' });
check('D100 단독이면 봇 계정 입력 불필요', fieldsOf(soloCoc), []);
const soloCocText = generateCopyText(soloCoc, calculateTotalEstimate(soloCoc), null);
check('D100 단독이면 계정 정보 미출력', soloCocText.includes('봇 계정'), false);
check('메인 봇 없으면 남은 입력값 미출력', soloCocText.includes('@leftover'), false);

const mixed = createTrpgOrder({ mainBot: 'basicShop', cocBot: true, trpg2d6Bot: true, currencyUnit: '원' });
check('다른 봇과 함께여도 TRPG 계정 입력 불필요', fieldsOf(mixed), []);
check('메인 봇 계정은 여전히 필수', fieldsOf({ ...mixed, step3: { ...mixed.step3, botAccountId: '' } }).includes('botAccountId'), true);
const mixedText = generateCopyText(mixed, calculateTotalEstimate(mixed), null);
check('복붙 텍스트 D100 짧은 이름', mixedText.includes('+ D100 타입'), true);
check('복붙 텍스트 봇 계정', mixedText.includes('봇 계정 : @BOT'), true);
check('복붙 텍스트에 D100 / 2D6 계정 미출력', /D100 봇 계정|2D6 봇 계정/.test(mixedText), false);

const basicWith2d6 = createTrpgOrder({ mainBot: 'basic', trpg2d6Bot: true });
check('기본 봇 + 2D6 차단', fieldsOf(basicWith2d6).includes('mainBot'), true);

// ===== 서버 사양 계산기 =====

const specOf = (months: number, usersKey: string, search: 'yes' | 'no' = 'no') => {
  const r = getServerCalcResult(months, usersKey, search);
  return [r.type, r.mastodon, r.elastic, r.monthlyKrw, r.totalKrw, r.freeMonths, r.paidMonths, r.monthsLabel];
};
check('3개월 이하 11~18인 → e2-standard-2',
  specOf(3, 'u18'), ['gcp', 'e2-standard-2 (2 vCPU, 8GB RAM)', null, '8만원', '무료', 3, 0, '3개월 이하']);
check('3개월 이하 19~30인 → e2-highmem-2',
  specOf(3, 'u30'), ['gcp', 'e2-highmem-2 (2 vCPU, 16GB RAM)', null, '11만원', '무료', 3, 0, '3개월 이하']);
check('30인 초과 → e2-highmem-4, 2개월 무료',
  specOf(3, 'u30p'), ['gcp', 'e2-highmem-4 (4 vCPU, 32GB RAM)', null, '21만원', '무료', 2, 0, '2개월 이하']);
check('30인 초과 + 검색 → e2-medium 검색 서버',
  specOf(3, 'u30p', 'yes'), ['gcp', 'e2-highmem-4 (4 vCPU, 32GB RAM)', 'e2-medium (2 vCPU, 4GB RAM)', '25만원', '무료', 2, 0, '2개월 이하']);
check('19~30인 + 검색 → 14만원',
  specOf(3, 'u30', 'yes'), ['gcp', 'e2-highmem-2 (2 vCPU, 16GB RAM)', 'e2-small (2 vCPU, 2GB RAM)', '14만원', '무료', 3, 0, '3개월 이하']);
check('5~10인 3개월 이하는 그대로 e2-medium',
  specOf(3, 'u10')[1], 'e2-medium (2 vCPU, 4GB RAM)');
check('30인 초과 4개월은 일반 사양·3개월 무료',
  specOf(4, 'u30p'), ['gcp', 'e2-standard-2 (2 vCPU, 8GB RAM)', null, '8만원', '8만원', 3, 1, '4개월']);
check('19~30인 6개월은 일반 사양 e2-medium', specOf(6, 'u30')[1], 'e2-medium (2 vCPU, 4GB RAM)');
const tierModels = (months: number, usersKey: string, search: 'yes' | 'no' = 'no') =>
  getAvailableTiers(months, usersKey).map((tier) => {
    const r = getServerCalcResult(months, usersKey, search, tier);
    return `${tier}:${r.type}:${r.mastodon?.split(' (')[0]}${r.elastic ? '+' + r.elastic.split(' (')[0] : ''}:${r.monthlyKrw}`;
  });
check('등급: 5인 미만 (타협 없음)', tierModels(6, 'u5'),
  ['min:gcp:e2-small:3만원', 'max:gcp:e2-medium:4만원']);
check('등급: 5~10인', tierModels(6, 'u10'),
  ['min:gcp:e2-small:3만원', 'mid:gcp:e2-medium:4만원', 'max:gcp:e2-standard-2:8만원']);
check('등급: 11~18인', tierModels(6, 'u18'),
  ['min:gcp:e2-medium:4만원', 'mid:gcp:e2-standard-2:8만원', 'max:gcp:e2-standard-2:8만원']);
check('등급: 19~30인', tierModels(6, 'u30'),
  ['min:gcp:e2-medium:4만원', 'mid:gcp:e2-standard-2:8만원', 'max:gcp:e2-highmem-2:11만원']);
check('등급: 30인 초과', tierModels(6, 'u30p'),
  ['min:gcp:e2-standard-2:8만원', 'mid:gcp:e2-highmem-2:11만원', 'max:gcp:e2-highmem-4:21만원']);
check('등급: 19~30인 + 검색', tierModels(6, 'u30', 'yes'),
  ['min:gcp:e2-medium+e2-small:7만원', 'mid:gcp:e2-standard-2+e2-small:11만원', 'max:gcp:e2-highmem-2+e2-small:14만원']);
check('등급: 30인 초과 + 검색', tierModels(6, 'u30p', 'yes'),
  ['min:gcp:e2-standard-2+e2-medium:12만원', 'mid:gcp:e2-highmem-2+e2-medium:15만원', 'max:gcp:e2-highmem-4+e2-medium:25만원']);
check('등급: 5인 미만 10개월 최소는 Vultr, 쾌적은 GCP 유지', tierModels(10, 'u5'),
  ['min:vultr:vhf-1c-2gb:2만원', 'max:gcp:e2-medium:4만원']);
check('등급 결과에 라벨 포함', getServerCalcResult(6, 'u30', 'no', 'max').tierLabel, '쾌적');
check('3개월 이하는 등급 무시', getServerCalcResult(3, 'u30', 'no', 'min').tier, null);
check('4개월 이상은 등급 필요', [3, 4, 11, 12].map(needsTier), [false, true, true, true]);
check('고를 수 없는 등급은 최소로 계산', getServerCalcResult(6, 'u5', 'no', 'mid').tierLabel, '최소');

// 장기 소규모 (12개월 이상, 10인 이하)
check('장기: 5인 미만 최소/쾌적', tierModels(12, 'u5'),
  ['min:vultr:vhf-1c-1gb:9천원', 'max:vultr:vc2-1c-2gb:1.5만원']);
check('장기: 5~10인 최소/쾌적', tierModels(12, 'u10'),
  ['min:vultr:vc2-1c-2gb:1.5만원', 'max:vultr:vc2-2c-4gb:3만원']);
check('장기: 검색 요청해도 검색 서버 없음',
  [getServerCalcResult(12, 'u10', 'yes', 'max').elastic, getServerCalcResult(12, 'u10', 'yes', 'max').search], [null, 'no']);
check('장기: 연간 총액', getServerCalcResult(12, 'u5', 'no', 'min').totalKrw, '10.8만원');
check('장기 인원 선택지는 10인 이하만', getUsersOptions(12).map((o) => o.value), ['u5', 'u10']);
check('4~11개월 인원 선택지는 전체', getUsersOptions(11).length, 5);
check('장기 11인 이상 차단', [isUsersAllowed(12, 'u18'), isUsersAllowed(12, 'u10'), isUsersAllowed(6, 'u30p')], [false, true, true]);
const tierOrder = createFormData();
tierOrder.step2.applyServerInstall = 'yes';
const tierText = generateCopyText(tierOrder, calculateTotalEstimate(tierOrder), getServerCalcResult(6, 'u30', 'no', 'mid'));
check('복붙 텍스트 등급 표시', tierText.includes('6개월 / 19~30인 / 검색 X / 타협'), true);

check('기간 선택지 라벨: 30인 초과',getMonthOptions('u30p')[0].label, '2개월 이하');
check('기간 선택지 라벨: 19~30인', getMonthOptions('u30')[0].label, '3개월 이하');
check('기간 선택지 라벨: 인원 미선택', getMonthOptions('')[0].label, '3개월 이하');

const highmemOrder = createFormData();
highmemOrder.step2.applyServerInstall = 'yes';
const highmemText = generateCopyText(highmemOrder, calculateTotalEstimate(highmemOrder), getServerCalcResult(3, 'u30p', 'no'));
check('복붙 텍스트 highmem-4 모델명', highmemText.includes('마스토돈: e2-highmem-4\n'), true);
check('복붙 텍스트 highmem-4 무료 기간', highmemText.includes('2개월까지 무료, 서버비 발생 없음'), true);
check('복붙 텍스트 highmem-4 기간 라벨', highmemText.includes('2개월 이하 / 30인 초과 / 검색 X'), true);

// ===== FAQ 분류 =====

// 4단계: 답변 시간·용어 설명 추가(17), 문구 정리에서 이미지 3→1·렉 2→1 합침(14), 사용자 요청으로 용어 설명 삭제(13)
check('FAQ 항목 수', FAQ_ITEMS.length, 13);
// 사용자 요청으로 '마스토돈 가이드' 문항을 홈에도 (3 → 4)
check('메인 대표 질문 수', FAQ_ITEMS.filter((item) => item.featured).length, 4);
check(
  '분류별 질문 수',
  FAQ_CATEGORIES.map((category) => FAQ_ITEMS.filter((item) => item.category === category).length),
  [3, 4, 6]
);
check(
  '모든 질문에 유효한 분류가 있다',
  FAQ_ITEMS.every((item) => FAQ_CATEGORIES.includes(item.category)),
  true
);

// ===== FAQ 검색 (탭 페이지에서도 기존 규칙 유지) =====

const faqGroups = groupByCategory(FAQ_ITEMS);
const faqAll = faqGroups.flatMap((group) => group.entries);
check('분류별 순번은 1부터', faqGroups.map((group) => group.entries[0].number), [1, 1, 1]);
check('빈 검색어는 전체', filterEntries(faqAll, '   ').length, 13);
check('검색은 대소문자 무시 (masto.HOST)', filterEntries(faqAll, 'masto.HOST').map((e) => e.item.question), ['masto.host로 설치해주실 수 있나요?']);
// 4단계 문구 정리로 '중국집' 비유가 빠져, 답변에만 있는 다른 낱말로 확인
check('검색은 답변도 본다 (질문에 없는 낱말)', filterEntries(faqAll, '설치비만').map((e) => e.item.question), ['그럼 서버비는 커미션주님께 내면 되나요?']);
check('정규식 문자 검색어도 하이라이트가 깨지지 않음', splitByQuery('(3개월까진 서버비 무료)', '(3').map((p) => p.match), [true, false]);

// ===== 조사 고르기 (R3) =====

check('받침 없음 → 를', eulReul('기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나'), '를');
check('받침 있음 → 을', eulReul('기본&상점 또는 기본&상점&스탯 타입'), '을');
check('끝 괄호·숫자는 건너뜀 (1주 → 를)', eulReul('기본 가동료 (1주)'), '를');
check('은/는', [eunNeun('커스텀 명령어 업그레이드'), eunNeun('예약 툿')], ['는', '은']);
check('한글 없음 → 둘 다', eulReul('masto.host'), '을(를)');

// ===== 입력 검사 보강 (4단계 리뷰) =====

check('마감일: 실제 날짜만', ['06/16', '6.16', '0616', '13/45', '2/31', '00/10', 'abc'].map(isRealMonthDay), [true, true, true, false, false, false, false]);
const accountMessage = (raw: string) => validateAccountId(raw, 'adminAccountId', '총괄 계정 아이디')?.message ?? null;
check('계정 아이디: 영문·숫자·밑줄은 통과 (@ 무시)', [accountMessage('notice_01'), accountMessage('@Notice')], [null, null]);
check('계정 아이디: 한글·띄어쓰기·특수문자 불가', accountMessage('공지 계정!'), '총괄 계정 아이디는 영문, 숫자, 밑줄(_)만 쓸 수 있습니다. (띄어쓰기·한글·특수문자 불가)');
check('계정 아이디: 여러 개 불가', accountMessage('a_one, b_two'), '총괄 계정 아이디는 하나만 입력해 주세요.');
check('계정 아이디: 30자 초과 불가', accountMessage('a'.repeat(31)), '총괄 계정 아이디는 30자 이하여야 합니다. (@ 제외)');
check('계정 아이디: 예약어는 그대로 막음', accountMessage('Admin'), '총괄 계정 아이디로 admin, owner, moderator 는 사용할 수 없습니다. (대소문자 무관)');
const englishNameError = (name: string) =>
  validateStep1({ ...createFormData().step1, communityEnglishName: name }).find((e) => e.field === 'communityEnglishName')?.message ?? null;
check('영어 이름: 영문·숫자·띄어쓰기·하이픈 통과', [englishNameError('Test Community 2'), englishNameError('long-while')], [null, null]);
check('영어 이름: 한글·특수문자 불가', englishNameError('한글로만입력 !!@@'), '영어 이름은 영문, 숫자, 띄어쓰기, 하이픈(-)만 쓸 수 있습니다.');
check('폐장일이 지났으면 막음', validateDates('2025-01-01', '2025-01-02', '2025-02-01')?.message, '폐장일이 이미 지났습니다. 날짜를 확인해 주세요.');
check('발표일·개장일은 지나도 폐장일이 앞이면 통과', validateDates(`${THIS_YEAR - 1}-01-01`, `${THIS_YEAR - 1}-01-02`, `${NEXT_YEAR}-02-01`), null);
check('없는 날짜(2월 31일)는 막음', validateDates(`${NEXT_YEAR}-01-01`, `${NEXT_YEAR}-02-31`, `${NEXT_YEAR}-03-01`)?.message, '유효하지 않은 날짜입니다.');
check('연도 오타(먼 미래)는 막음', validateDates(`${NEXT_YEAR}-01-01`, `${NEXT_YEAR}-01-02`, '2206-02-01')?.message, '연도를 확인해 주세요.');
check('자동봇 가동 기간에 연도: 해를 넘기면 시작은 전 해', botPeriodWithYears('11/01', '02/10', '2027-02-10'), '2026-11-01 ~ 2027-02-10');
check('자동봇 가동 기간에 연도: 같은 해', botPeriodWithYears('3/5', '04/20', '2027-04-20'), '2027-03-05 ~ 2027-04-20');
check('자동봇 가동 기간: 못 읽으면 null', botPeriodWithYears('13/45', '02/10', '2027-02-10'), null);

// ===== 4단계 검토 반영 =====

// 저장된 견적 정리: 모양이 이상한 항목 제거, 중복 제거, 가격은 현재 판매가로
const dirty: unknown = [
  null, 'x', { name: '검색 기능', price: '15000', category: 'server' },
  { id: 'a', name: '검색 기능', price: 1, category: 'server' },
  { id: 'b', name: '마스토돈 가이드', price: 5000, category: 'server' },
  { id: 'c', name: '알 수 없는 옛 항목', price: -3, category: 'bot' },
  { id: 'd', name: '알 수 없는 옛 항목2', price: 7000, category: 'bot' },
  { id: 'e', name: '기본 가동료 (3주)', price: 1, category: 'bot' },
  { id: 'f', name: '기본 타입', price: 1, category: 'weird' },
];
check('저장 견적 정리: 이름·가격·분류', sanitizeEstimateItems(dirty).map((i) => [i.name, i.price]), [['검색 기능', PRICING_CONFIG.server.addons.search], ['알 수 없는 옛 항목2', 7000], ['기본 가동료 (3주)', 3 * PRICING_CONFIG.bot.operationPerWeek]]);
check('저장 견적 정리: 배열이 아니면 빈 견적', sanitizeEstimateItems({ a: 1 }), []);

// 이름을 바꾼 옵션: 예전 이름으로 저장된 견적도 지금 이름·가격으로, 예전/지금 이름이 같이 있으면 하나만
const renamed = sanitizeEstimateItems([
  { id: 'g', name: '커스텀 명령어 업그레이드', price: 1, category: 'bot' },
  { id: 'h', name: '답멘에 이름·주사위 넣기', price: 1, category: 'bot' },
  { id: 'i', name: '기본&상점 타입 - 커스텀 명령어 업그레이드', price: 1, category: 'bot' },
]);
check('저장 견적 정리: 예전 이름 → 지금 이름', renamed.map((i) => [i.name, i.price]), [['답멘에 이름·주사위 넣기', PRICING_CONFIG.bot.addons.customCommandUpgrade]]);
check('예전 이름도 같은 신청서 칸으로', [ESTIMATE_NAME_TO_MAPPING_KEY['답멘에 이름·주사위 넣기'], ESTIMATE_NAME_TO_MAPPING_KEY['커스텀 명령어 업그레이드']], ['customCommandUpgrade', 'customCommandUpgrade']);
check('모르는 이름은 그대로', currentItemName('검색 기능'), '검색 기능');

// 자동봇 페이지 가격 = 신청서 계산 가격 (한쪽만 바뀌면 견적함과 신청서 금액이 어긋난다)
const botPriceByName = Object.fromEntries(BOT_TYPES.map((t) => [t.name, t.price]));
check('봇 타입 가격 = PRICING_CONFIG', [botPriceByName['기본 타입'], botPriceByName['기본&상점 타입'], botPriceByName['기본&상점&스탯 타입'], botPriceByName['자동조사 타입'], botPriceByName['D100 룰 대응 TRPG봇'], botPriceByName['2D6 룰 대응 TRPG봇 3종']],
  [PRICING_CONFIG.bot.mainTypes.basic, PRICING_CONFIG.bot.mainTypes.basicShop, PRICING_CONFIG.bot.mainTypes.basicShopStat, PRICING_CONFIG.bot.addons.investigationBot, PRICING_CONFIG.bot.addons.cocBot, PRICING_CONFIG.bot.addons.trpg2d6Bot]);
check('봇 추가 옵션 가격 = 카탈로그', BOT_OPTIONS.every((o) => catalogPrice(o.name) === o.price), true);

// 월/일 입력: 정해진 형식만 (숫자만 긁어 모으던 예전 동작 차단)
check('월/일 형식', ['6/16', '6.16', '0616', '6월 16일', '６/１６'].map((v) => JSON.stringify(extractMonthDay(v))), Array(5).fill(JSON.stringify({ month: 6, day: 16 })));
check('애매한 입력은 거절', ['6/1~6/3', '121', '약 6/16', '616'].map(extractMonthDay), [null, null, null, null]);

// 지난 마감일: 빠른마감을 강제로 붙이지 않고 오류
const REF = new Date(2026, 9, 2);
check('지난 마감일은 빠른마감 강제 없음', computeRequiredFastDeadline('10/01', null, REF), null);
check('오늘 마감은 24시간 빠른마감', computeRequiredFastDeadline('10/02', null, REF), 'basic24h');
check('지난 날짜 판정', [isPastMonthDay('10/01', REF), isPastMonthDay('10/02', REF), isPastMonthDay('01/05', REF)], [true, false, false]);

// 빠른마감 ↔ 커스텀 옵션
check('빠른마감 맞춤', [rushFitsCustomOption('basic24h', null), rushFitsCustomOption('theme48h', null), rushFitsCustomOption('logo48h', 'logo'), rushFitsCustomOption('theme48h', 'nightTheme')], [true, false, true, true]);
const rushStep2 = { ...createFormData().step2, applyServerInstall: 'yes' as const, desiredDeadline: '12/20', adminAccountId: 'notice', fastDeadline: true, fastDeadlineOption: 'theme48h' as const };
check('맞지 않는 빠른마감은 오류', validateStep2(rushStep2).some((e) => e.field === 'fastDeadline'), true);
check('빠른마감 옵션 없이 켜면 오류', validateStep2({ ...rushStep2, fastDeadlineOption: null }).some((e) => e.field === 'fastDeadline'), true);
check('글자수 변경은 값 필수', validateStep2({ ...rushStep2, fastDeadline: false, fastDeadlineOption: null, changeCharacterLimit: true, characterLimitValue: 0 }).some((e) => e.field === 'characterLimitValue'), true);

// 단계를 넘나드는 검사
const emptyOrder = createFormData();
check('서버·자동봇 둘 다 아니오면 오류', validateOrderConsistency({ ...emptyOrder, step2: { ...emptyOrder.step2, applyServerInstall: 'no' }, step3: { ...emptyOrder.step3, applyBot: 'no' } }, null).step3.length, 1);
check('서버 설치인데 미리보기 미완료면 오류', validateOrderConsistency({ ...emptyOrder, step2: { ...emptyOrder.step2, applyServerInstall: 'yes' } }, null).step2.length, 1);

// 자동봇 가동 기간: 날짜 필수, 1~52주
const botStep3 = { ...createFormData().step3, applyBot: 'yes' as const, operationWeeksOption: 'manual' as const, mainBot: 'basic' as const, setupDeadline: '12/01', botAccountId: 'bot_one' };
check('가동 날짜 없으면 오류', validateStep3({ ...botStep3, botStartDate: '', botEndDate: '', manualWeeks: 0 }).some((e) => e.field === 'operationWeeksOption'), true);
check('가동 0주면 오류', validateStep3({ ...botStep3, botStartDate: '06/01', botEndDate: '06/02', manualWeeks: 0 }).some((e) => e.field === 'operationWeeksOption'), true);
check('가동 4주는 통과', validateStep3({ ...botStep3, botStartDate: '06/01', botEndDate: '06/28', manualWeeks: 4 }).some((e) => e.field === 'operationWeeksOption'), false);

// 계정 표기
check('계정 표기 정리', [asAccount(' @@Notice '), asAccount('bot_1'), asAccount('  ')], ['@Notice', '@bot_1', '']);

console.log(failed === 0 ? '\n모든 검증 통과' : `\n${failed}개 실패`);
if (failed > 0) process.exit(1);

export {};
