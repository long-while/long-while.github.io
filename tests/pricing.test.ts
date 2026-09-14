/**
 * 가격/견적 로직 검증.
 * 별도 테스트 러너 없이 `npm run test` (vite SSR 번들 → node 실행)로 돌린다.
 */

import { syncInfraFeeItem, insertRemovedItem } from '@/app/contexts/EstimateContext';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import {
  calculateServerPrice,
  calculateTotalEstimate,
  generateCopyText,
  getDeadlineBlackoutError,
  hasServerInfraFee,
  MISSING_GOOGLE_EMAIL_MARK,
  MISSING_GOOGLE_PASSWORD_MARK,
  validateGoogleAccount,
  validateStep1,
} from '@/app/utils/orderUtils';
import { FAQ_ITEMS, FAQ_CATEGORIES } from '@/app/components/FAQ';
import {
  PRICING_CONFIG,
  SERVER_INFRA_FEE_ITEM,
  SERVER_INSTALL_ITEM_NAME,
} from '@/app/constants/form';
import type { OrderFormData } from '@/app/types/order';

let failed = 0;

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
      cocBotAccountId: '',
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

check('10/20은 마감 불가', getDeadlineBlackoutError('10/20', 'desiredDeadline')?.field, 'desiredDeadline');
check('10/15은 마감 불가 (시작일)', getDeadlineBlackoutError('10/15', 'desiredDeadline') !== null, true);
check('10/28은 마감 불가 (종료일)', getDeadlineBlackoutError('10/28', 'desiredDeadline') !== null, true);
check('10/14는 마감 가능', getDeadlineBlackoutError('10/14', 'desiredDeadline'), null);
check('10/29는 마감 가능', getDeadlineBlackoutError('10/29', 'desiredDeadline'), null);
check('8/22는 마감 가능 (예전 기간 해제)', getDeadlineBlackoutError('8/22', 'desiredDeadline'), null);
check('10/3은 마감 가능 (예전 기간 해제)', getDeadlineBlackoutError('10/3', 'desiredDeadline'), null);

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
  resultAnnouncementDate: '2026-01-01',
  openingDate: '2026-01-10',
  closingDate: '2026-03-10',
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

// ===== FAQ 분류 =====

check('FAQ 항목 수', FAQ_ITEMS.length, 15);
check('메인 대표 질문 수', FAQ_ITEMS.filter((item) => item.featured).length, 4);
check(
  '분류별 질문 수',
  FAQ_CATEGORIES.map((category) => FAQ_ITEMS.filter((item) => item.category === category).length),
  [4, 4, 7]
);
check(
  '모든 질문에 유효한 분류가 있다',
  FAQ_ITEMS.every((item) => FAQ_CATEGORIES.includes(item.category)),
  true
);

console.log(failed === 0 ? '\n모든 검증 통과' : `\n${failed}개 실패`);
if (failed > 0) process.exit(1);

export {};
