/**
 * 가격/견적 로직 검증.
 * 별도 테스트 러너 없이 `npm run test` (vite SSR 번들 → node 실행)로 돌린다.
 */

import { syncInfraFeeItem } from '@/app/contexts/EstimateContext';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import {
  calculateServerPrice,
  calculateTotalEstimate,
  generateCopyText,
  getDeadlineBlackoutError,
  hasServerInfraFee,
} from '@/app/utils/orderUtils';
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
check('복붙 텍스트 옵션 줄', copyText.includes(`+ ${SERVER_INFRA_FEE_ITEM.name}`), true);
check(
  '복붙 텍스트 견적 줄',
  copyText.includes(`${SERVER_INFRA_FEE_ITEM.name} ${PRICING_CONFIG.server.infraFee.toLocaleString()}`),
  true
);
check('복붙 텍스트 총액', copyText.trim().endsWith('25,000원'), true);

const longTermCopyText = generateCopyText(longTermOrder, calculateTotalEstimate(longTermOrder), null);
check('장기 소규모 복붙 텍스트에는 실비가 없다', longTermCopyText.includes(SERVER_INFRA_FEE_ITEM.name), false);
check('장기 소규모 복붙 텍스트 총액', longTermCopyText.trim().endsWith('2만원'), true);

// ===== 마감 불가 기간 =====

check('10/20은 마감 불가', getDeadlineBlackoutError('10/20', 'desiredDeadline')?.field, 'desiredDeadline');
check('10/15은 마감 불가 (시작일)', getDeadlineBlackoutError('10/15', 'desiredDeadline') !== null, true);
check('10/28은 마감 불가 (종료일)', getDeadlineBlackoutError('10/28', 'desiredDeadline') !== null, true);
check('10/14는 마감 가능', getDeadlineBlackoutError('10/14', 'desiredDeadline'), null);
check('10/29는 마감 가능', getDeadlineBlackoutError('10/29', 'desiredDeadline'), null);
check('8/22는 마감 가능 (예전 기간 해제)', getDeadlineBlackoutError('8/22', 'desiredDeadline'), null);
check('10/3은 마감 가능 (예전 기간 해제)', getDeadlineBlackoutError('10/3', 'desiredDeadline'), null);

console.log(failed === 0 ? '\n모든 검증 통과' : `\n${failed}개 실패`);
if (failed > 0) process.exit(1);

export {};
