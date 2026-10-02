/**
 * 신청서(/order/)·견적함(/estimate/) 시나리오 회귀 검사 (3단계 2번).
 *
 * 개발 서버가 떠 있어야 한다: BASE=http://localhost:5173 node tests/e2e/order-estimate.scenarios.cjs
 * 각 시나리오를 1920px·390px 에서 새 브라우저 컨텍스트(빈 저장소)로 돌린다.
 * 필요한 상태는 사이트 코드를 건드리지 않고 localStorage 를 미리 채워서 만든다.
 * 화면이 바뀌어도 시나리오는 그대로 두고 아래 `ui` 도우미만 고치도록 선택자를 한곳에 모았다.
 *
 * 출력: 시나리오마다 PASS/FAIL 한 줄. 하나라도 실패하면 종료 코드 1.
 * 특정 시나리오만: ONLY=copy-success node ...
 */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const BASE = process.env.BASE || 'http://localhost:5173';
const WIDTHS = (process.env.WIDTHS || '1920,390').split(',').map(Number);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const CREPE_URL = 'https://crepe.cm/@longwhile/lw5w0ofg';

// ── 저장소 키 (app 과 같은 값) ─────────────────────────────
const KEY = {
  estimate: 'mas_commission_estimate',
  draft: 'mas_commission_order_draft',
  sync: 'mas_commission_cart_synced',
  calc: 'mas_commission_server_calc_v2',
};

// ── 날짜: 실행하는 날 기준으로 계산 (마감 불가 기간 10/15~10/28 은 피함) ──
const DAY = 24 * 60 * 60 * 1000;
const iso = (d) => d.toISOString().slice(0, 10);
const plusDays = (n) => new Date(Date.now() + n * DAY);
function safeDeadline(n) {
  let d = plusDays(n);
  if (d.getMonth() === 9 && d.getDate() >= 15 && d.getDate() <= 28) d = new Date(d.getTime() + 20 * DAY);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

// ── 미리 채우는 데이터 ─────────────────────────────────────
let idSeq = 0;
const item = (name, price, category, extra = {}) => ({ id: `t${++idSeq}`, name, price, category, ...extra });
const ESTIMATE_ITEMS = [
  item('마스토돈 서버 설치', 20000, 'server', { description: '자캐 커뮤에 특화된 한참 인스턴스를 설치합니다.' }),
  item('검색 기능', 15000, 'server', { description: '단어 단위 검색. 팔로우 중인 유저의 툿+멘션에서 찾아 결과를 반환합니다.' }),
  item('기본 타입', 15000, 'bot', { description: '구글 스프레드시트 연동' }),
];

const STEP1 = {
  termsAgreed: 'yes', applicantNickname: '테스트닉', communityShortName: '테커', communityKoreanName: '테스트 커뮤',
  communityEnglishName: 'Test Community', isLongTermCommunity: false, longTermConfirmed: false,
  resultAnnouncementDate: iso(plusDays(30)), openingDate: iso(plusDays(40)), closingDate: iso(plusDays(70)),
  operationWeeks: 5, googleEmail: '', googlePassword: '',
};
const STEP2 = {
  applyServerInstall: 'yes', additionalOption: null, changeCharacterLimit: false, characterLimitValue: 0, searchOption: false,
  mastoHostMigration: false, fastDeadline: false, fastDeadlineOption: null, desiredDeadline: safeDeadline(35), adminAccountId: '@NOTICE',
};
const STEP3 = {
  applyBot: 'no', operationWeeksOption: null, manualWeeks: 0, botStartDate: '', botEndDate: '', mainBot: null, cocBot: false,
  trpg2d6Bot: false, omakaseBot: false, investigationBot: false, investigationDailyLimit: false, investigationDailyLimitCount: 0,
  customCommandUpgrade: false, reservationToot: false, autoProfileImage: false, tootCurrencyLink: false, transferFeature: false,
  transferOption: null, attendanceSystem: false, attendanceCurrencyAmount: 10, attendanceCommand: '[출석]', currencyUnit: '',
  statList: '', accountList: [], extraAccountTiers: 0, tootPerCurrency: '', omakaseDetails: '', setupDeadline: '',
  botSymbol: '✶', botAccountId: '', investigationBotAccountId: '',
};
const draft = (currentStep, over = {}) => ({
  version: 2,
  formData: { step1: { ...STEP1, ...over.step1 }, step2: { ...STEP2, ...over.step2 }, step3: { ...STEP3, ...over.step3 }, step4: { policyConfirmation: '' } },
  currentStep,
  savedAt: new Date().toISOString(),
});
const syncState = (items) => ({ synced: true, syncedAt: new Date().toISOString(), itemCount: items.length, syncedItems: items.map((i) => i.name) });

// ── 화면 도우미 (디자인이 바뀌면 여기만 고친다) ─────────────────
const ui = {
  async seed(page, storage) {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((s) => {
      localStorage.clear();
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
    }, storage);
  },
  async open(page, path) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  },
  next: (page) => page.getByRole('button', { name: /^다음/ }).click(),
  // 견적함 (3단계 3번에서 버튼 → 링크로 바뀜, 동작 같음)
  emptyServerLink: (page) => page.locator('main').getByRole('link', { name: /서버 설치 커미션/ }),
  emptyBotLink: (page) => page.locator('main').getByRole('link', { name: /자동봇 커미션/ }),
  toOrder: (page) => page.locator('main').getByRole('link', { name: '신청서 작성하기' }),
  async waitStep(page, n) {
    const titles = { 1: /Step 1\./, 2: /Step 2\./, 3: /Step 3\./, 4: /Step 4\./ };
    await page.getByRole('heading', { name: titles[n] }).first().waitFor({ timeout: 5000 });
  },
  dialog: (page, title) => page.getByRole('dialog').filter({ hasText: title }),
  errorSummary: (page) => page.getByText('입력 내용을 확인해 주세요'),
  // Q6 요약 상태
  summary: (page, title) => page.getByRole('heading', { name: title }),
  summaryEdit: (page) => page.getByRole('button', { name: '수정', exact: true }),
  async fillStep1(page) {
    await page.locator('#termsAgreed').check({ force: true }); // ds Checkbox: 화면에서 숨긴 실제 input
    await page.locator('#applicantNickname').fill('테스트닉');
    await page.locator('#communityShortName').fill('테커');
    await page.locator('#communityKoreanName').fill('테스트 커뮤');
    await page.locator('#communityEnglishName').fill('Test Community');
    await page.locator('#resultAnnouncementDate').fill(iso(plusDays(30)));
    await page.locator('#openingDate').fill(iso(plusDays(40)));
    await page.locator('#closingDate').fill(iso(plusDays(70)));
  },
  longTermToggle: (page) => page.getByText('장기 소규모 서버입니다.'),
  longTermConfirm: (page) => page.getByText('위 내용을 이해했으며, 반년 이상 반영구적으로 운영할 장기 소규모 서버가 맞습니다.'),
  serverYes: (page) => page.locator('input[name="applyServerInstall"]').nth(0),
  serverNo: (page) => page.locator('input[name="applyServerInstall"]').nth(1),
  botYes: (page) => page.locator('input[name="applyBot"]').nth(0),
  botNo: (page) => page.locator('input[name="applyBot"]').nth(1),
  policyCheckbox: (page) => page.getByLabel(/위 질문 정책 안내를 읽고 이해했습니다/),
  copyButton: (page) => page.getByRole('button', { name: '신청서 복사하기' }),
  // Q7: 복사 완료 모달 부제, 자동 이동 취소, 이동 후 안내띠
  countdownText: (page, sec) => page.getByText(`${sec}초 후 크레페로 자동 이동합니다`),
  cancelRedirect: (page) => page.getByRole('button', { name: '자동 이동 취소' }),
  moveBanner: (page) => page.getByRole('status').filter({ hasText: '아직 크레페로 이동하지 않으셨다면' }),
  async toStep4AndCopy(page) {
    await ui.seed(page, { [KEY.draft]: draft(4) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 4);
    await page.locator('#googleEmail').fill('test@gmail.com');
    await page.locator('#googlePassword').fill('dummy-password');
    await ui.policyCheckbox(page).check({ force: true });
    await ui.copyButton(page).click();
  },
  copyFailMessage: (page) => page.getByText('클립보드 복사에 실패했습니다. 텍스트를 직접 선택하여 복사해 주세요.'),
  copyTextArea: (page) => page.getByLabel('신청서 복사 내용'),
};

// ── 브라우저 쪽 준비: window.open 기록, 클립보드 실패 흉내 ──────────
const RECORD_OPEN = () => {
  window.__opened = [];
  // 새 창이 열린 것처럼 가짜 창을 돌려준다 (null 이면 팝업 차단으로 본다)
  window.open = (url) => { window.__opened.push(String(url)); return { opener: window }; };
};
const BLOCK_POPUP = () => {
  window.__opened = [];
  window.open = (url) => { window.__opened.push(String(url)); return null; };
};
const BREAK_CLIPBOARD = () => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true });
  document.execCommand = () => false;
};

function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}
async function expectVisible(locator, msg) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    throw new Error(`보이지 않음: ${msg}`);
  }
}
async function expectHidden(locator, msg) {
  try {
    await locator.first().waitFor({ state: 'hidden', timeout: 5000 });
  } catch {
    throw new Error(`사라지지 않음: ${msg}`);
  }
}
const storageGet = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);

// ── 시나리오 ──────────────────────────────────────────────
const SCENARIOS = {
  async 'estimate-empty'(page) {
    await ui.seed(page, {});
    await ui.open(page, '/estimate/');
    await expectVisible(page.getByText('견적에 담긴 항목이 없습니다'), '빈 견적 안내');
    await expectVisible(ui.emptyServerLink(page), '서버 커미션 바로가기');
    await expectVisible(ui.emptyBotLink(page), '자동봇 커미션 바로가기');
    await ui.emptyBotLink(page).click();
    await page.waitForURL('**/bot/');
  },

  async 'estimate-add-from-product'(page) {
    await ui.seed(page, {});
    await ui.open(page, '/bot/');
    await page.getByRole('button', { name: '기본 타입 견적에 추가' }).click();
    await ui.open(page, '/estimate/');
    await expectVisible(page.getByText('총 1개 항목'), '항목 수 1');
    await expectVisible(page.getByText('기본 타입', { exact: true }), '담긴 항목 이름');
    await expectVisible(page.getByText('₩15,000').first(), '금액');
  },

  async 'estimate-delete-undo'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS });
    await ui.open(page, '/estimate/');
    // 서버 설치 + 실비(자동 포함) + 검색 + 기본 타입 = 4개
    await expectVisible(page.getByText('총 4개 항목'), '항목 수 4 (실비 자동 포함)');
    await page.getByRole('button', { name: '검색 기능 삭제' }).click();
    await expectVisible(page.getByText("'검색 기능'을 삭제했습니다."), '삭제 알림');
    await expectVisible(page.getByText('총 3개 항목'), '삭제 후 3개');
    await page.getByRole('button', { name: '실행 취소' }).click();
    await expectVisible(page.getByText('총 4개 항목'), '되돌린 뒤 4개');
    const names = (await storageGet(page, KEY.estimate)).map((i) => i.name);
    expect(names.indexOf('검색 기능') === 2, `검색 기능이 원래 자리(3번째)로 돌아와야 함: ${names.join(',')}`);
  },

  async 'estimate-locked-item'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS });
    await ui.open(page, '/estimate/');
    expect((await page.getByRole('button', { name: /도메인.*삭제$/ }).count()) === 0, '실비 항목에는 삭제 버튼이 없어야 함');
  },

  async 'estimate-edit-pencil'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS });
    await ui.open(page, '/estimate/');
    await page.getByRole('button', { name: '기본 타입 수정하러 가기' }).click();
    await page.waitForURL('**/bot/');
    await page.waitForFunction(() => document.activeElement?.closest('[data-option-name]')?.getAttribute('data-option-name') === '기본 타입', null, { timeout: 5000 });
    await ui.open(page, '/estimate/');
    await page.getByRole('button', { name: '검색 기능 수정하러 가기' }).click();
    await page.waitForURL('**/server/');
    await page.waitForFunction(() => document.activeElement?.closest('[data-option-name]')?.getAttribute('data-option-name') === '검색 기능', null, { timeout: 5000 });
  },

  async 'estimate-to-order-no-draft'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS });
    await ui.open(page, '/estimate/');
    await ui.toOrder(page).click();
    await page.waitForURL('**/order/');
    expect((await page.getByRole('dialog').count()) === 0, '초안이 없으면 다이얼로그가 없어야 함');
    await expectVisible(page.getByText('견적 항목이 자동으로 반영되었습니다'), '반영 알림');
    await ui.waitStep(page, 1);
    await ui.fillStep1(page);
    await ui.next(page);
    await ui.waitStep(page, 2);
    expect(await ui.serverYes(page).isChecked(), 'STEP2 서버 설치 "예"가 견적에서 채워져야 함');
    // Q6(3단계에서 바뀐 동작): 견적에서 채워진 단계는 요약 상태로 시작 → '수정'을 눌러 펼친 뒤 확인
    await expectVisible(ui.summary(page, '선택하신 서버 사양'), 'STEP2 요약 상태');
    await expectVisible(page.getByText('※ 견적에서 선택됨'), '견적에서 선택됨 표시');
    await ui.summaryEdit(page).click();
    await expectVisible(page.getByRole('heading', { name: '커스텀 옵션 선택' }), '수정 → 편집 상태');
    expect(await page.getByRole('checkbox', { name: /검색 옵션/ }).isChecked(), '검색 옵션이 채워져야 함');
  },

  async 'q6-step3-summary-and-validation'(page) {
    // 출석 시스템만 담으면 자동봇 '예'로 채워지지만 메인 봇이 없어 검증에 걸린다 → 요약에서도 같은 검증, 숨긴 칸 오류면 펼침
    await ui.seed(page, { [KEY.estimate]: [item('출석 시스템', 10000, 'bot')] });
    await ui.open(page, '/estimate/');
    await ui.toOrder(page).click();
    await page.waitForURL('**/order/');
    await ui.waitStep(page, 1);
    await ui.fillStep1(page);
    await ui.next(page);
    await ui.waitStep(page, 2);
    await ui.serverNo(page).check({ force: true });
    await ui.next(page);
    await ui.waitStep(page, 3);
    await expectVisible(ui.summary(page, '선택하신 자동봇 사양'), 'STEP3 요약 상태');
    await ui.next(page);
    await expectVisible(ui.errorSummary(page), '요약 상태에서도 검증 오류');
    await expectVisible(page.getByRole('heading', { name: '메인 봇 종류' }), '숨긴 칸(메인 봇) 오류 → 자동으로 펼침');
    await ui.waitStep(page, 3);
  },

  async 'q6-direct-entry-edit'(page) {
    await ui.seed(page, { [KEY.draft]: draft(2) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 2);
    await expectVisible(page.getByRole('heading', { name: '커스텀 옵션 선택' }), '직접 들어오면 편집 상태');
    expect((await ui.summary(page, '선택하신 서버 사양').count()) === 0, '요약 상태가 아니어야 함');
  },

  async 'q6-keep-existing-edit'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS, [KEY.draft]: draft(2) });
    await ui.open(page, '/estimate/');
    await ui.toOrder(page).click();
    await page.waitForURL('**/order/');
    await ui.dialog(page, '견적 데이터 반영').getByRole('button', { name: '기존 신청서 유지' }).click();
    await ui.waitStep(page, 2);
    expect((await ui.summary(page, '선택하신 서버 사양').count()) === 0, '기존 신청서를 유지하면 견적으로 채운 게 아니라 편집 상태');
  },

  async 'estimate-to-order-with-draft-overwrite'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS, [KEY.draft]: draft(2, { step2: { applyServerInstall: 'no' } }) });
    await ui.open(page, '/estimate/');
    await ui.toOrder(page).click();
    await page.waitForURL('**/order/');
    const dlg = ui.dialog(page, '견적 데이터 반영');
    await expectVisible(dlg, '견적 반영 다이얼로그');
    await dlg.getByRole('button', { name: '견적으로 새로 작성' }).click();
    await expectHidden(dlg, '다이얼로그 닫힘');
    await ui.waitStep(page, 1);
    expect((await page.locator('#applicantNickname').inputValue()) === '', '새로 작성하면 STEP1 이 비어야 함');
  },

  async 'estimate-to-order-with-draft-keep'(page) {
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS, [KEY.draft]: draft(1) });
    await ui.open(page, '/estimate/');
    await ui.toOrder(page).click();
    await page.waitForURL('**/order/');
    const dlg = ui.dialog(page, '견적 데이터 반영');
    await expectVisible(dlg, '견적 반영 다이얼로그');
    await dlg.getByRole('button', { name: '기존 신청서 유지' }).click();
    await expectHidden(dlg, '다이얼로그 닫힘');
    await ui.waitStep(page, 1);
    expect((await page.locator('#applicantNickname').inputValue()) === '테스트닉', '기존 신청서 값이 남아야 함');
  },

  async 'draft-restore-continue'(page) {
    await ui.seed(page, { [KEY.draft]: draft(2) });
    await ui.open(page, '/order/');
    const dlg = ui.dialog(page, '작성 중인 내용 발견');
    await expectVisible(dlg, '초안 복원 다이얼로그');
    await dlg.getByRole('button', { name: '이어서 작성' }).click();
    await expectHidden(dlg, '다이얼로그 닫힘');
    await ui.waitStep(page, 2);
    expect(await ui.serverYes(page).isChecked(), '저장된 STEP2 값 복원');
  },

  async 'draft-restore-new'(page) {
    await ui.seed(page, { [KEY.draft]: draft(2) });
    await ui.open(page, '/order/');
    const dlg = ui.dialog(page, '작성 중인 내용 발견');
    await expectVisible(dlg, '초안 복원 다이얼로그');
    await dlg.getByRole('button', { name: '새로 작성' }).click();
    await expectHidden(dlg, '다이얼로그 닫힘');
    await ui.waitStep(page, 1);
    expect((await page.locator('#applicantNickname').inputValue()) === '', '새로 작성하면 비어야 함');
  },

  async 'step1-long-term'(page) {
    await ui.seed(page, {});
    await ui.open(page, '/order/');
    await ui.waitStep(page, 1);
    await ui.fillStep1(page);
    await ui.longTermToggle(page).click();
    await expectVisible(page.getByText('장기 소규모 서버가 맞으신지 꼭 확인해 주세요'), '장기 안내');
    expect((await page.locator('#openingDate').count()) === 0, '장기 소규모면 날짜 입력칸이 없어야 함');
    await ui.next(page);
    await expectVisible(page.getByText('장기 소규모 서버 안내를 확인하신 후 확인 체크를 해주세요.').first(), '확인 체크 오류');
    await ui.longTermConfirm(page).click();
    await ui.next(page);
    await ui.waitStep(page, 2);
  },

  async 'step1-normal-schedule'(page) {
    await ui.seed(page, {});
    await ui.open(page, '/order/');
    await ui.waitStep(page, 1);
    await ui.fillStep1(page);
    await expectVisible(page.getByText(/커뮤니티 운영기간: \d+주/), '운영 기간 표시');
    await ui.next(page);
    await ui.waitStep(page, 2);
  },

  async 'step2-yes-no'(page) {
    await ui.seed(page, { [KEY.draft]: draft(2, { step2: { applyServerInstall: null, adminAccountId: '' } }) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 2);
    await ui.serverYes(page).check({ force: true });
    await expectVisible(page.getByRole('heading', { name: '커스텀 옵션 선택' }), '예 → 옵션 보임');
    await ui.serverNo(page).check({ force: true });
    await expectVisible(page.getByText('서버 설치를 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.'), '아니오 안내');
    await ui.next(page);
    await ui.waitStep(page, 3);
  },

  async 'step3-yes-no'(page) {
    await ui.seed(page, { [KEY.draft]: draft(3, { step3: { applyBot: null } }) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 3);
    await ui.botYes(page).check({ force: true });
    await expectVisible(page.getByRole('heading', { name: '메인 봇 종류' }), '예 → 메인 봇 보임');
    await ui.botNo(page).check({ force: true });
    await expectHidden(page.getByRole('heading', { name: '메인 봇 종류' }), '아니오 → 옵션 숨김');
    await ui.next(page);
    await ui.waitStep(page, 4);
  },

  async 'validation-errors'(page) {
    await ui.seed(page, {});
    await ui.open(page, '/order/');
    await ui.waitStep(page, 1);
    await ui.next(page);
    await expectVisible(ui.errorSummary(page), '오류 목록');
    const nick = page.locator('#applicantNickname');
    expect((await nick.getAttribute('aria-invalid')) === 'true', '닉네임 입력칸 aria-invalid');
    await expectVisible(page.locator('#applicantNickname-error'), '닉네임 아래 오류 문구');
    await page.getByRole('button', { name: '신청자 닉네임을 입력해 주세요.' }).click();
    await page.waitForFunction(() => document.activeElement?.id === 'applicantNickname', null, { timeout: 3000 });
    // 고치면 그 자리 오류가 바로 사라진다
    await nick.fill('테스트닉');
    await expectHidden(page.locator('#applicantNickname-error'), '고친 칸 오류 사라짐');
  },

  async 'copy-success'(page) {
    // Q7(3단계에서 바뀐 동작): 3초 안내 → 복사 완료 모달 + 5초 카운트다운, 이동 후 안내띠. 크레페는 정확히 1번(개발 모드 포함)
    await page.addInitScript(RECORD_OPEN);
    await ui.toStep4AndCopy(page);
    const modal = ui.dialog(page, '복사가 완료되었습니다');
    await expectVisible(modal, '복사 완료 모달');
    await expectVisible(ui.countdownText(page, 5), '5초 카운트다운');
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.includes('테스트닉'), '클립보드에 신청서 원문');
    // 비밀번호(Q16)는 화면 확인용 미리보기에 새로 드러나지 않아야 한다 (복사 원문은 그대로)
    expect(!(await modal.innerText()).includes('dummy-password'), '복사 완료 모달에 비밀번호가 보이면 안 됨');
    await page.waitForFunction(() => window.__opened.length > 0, null, { timeout: 8000 });
    await page.waitForTimeout(1500);
    const opened = await page.evaluate(() => window.__opened);
    expect(opened.length === 1 && opened[0] === CREPE_URL, `크레페가 정확히 한 번 열려야 함: ${JSON.stringify(opened)}`);
    await expectHidden(modal, '이동 후 모달 닫힘');
    await expectVisible(ui.moveBanner(page), '이동 후 안내띠');
  },

  async 'copy-cancel-redirect'(page) {
    await page.addInitScript(RECORD_OPEN);
    await ui.toStep4AndCopy(page);
    await expectVisible(ui.countdownText(page, 5), '카운트다운');
    await ui.cancelRedirect(page).click();
    await page.waitForTimeout(6500);
    expect((await page.evaluate(() => window.__opened)).length === 0, '취소하면 자동 이동하지 않아야 함');
    await ui.dialog(page, '복사가 완료되었습니다').getByRole('button', { name: '크레페로 이동하기' }).click();
    await expectVisible(ui.moveBanner(page), '직접 이동 후 안내띠');
    expect((await page.evaluate(() => window.__opened)).length === 1, '직접 이동은 한 번');
  },

  async 'q7-manual-move-during-countdown'(page) {
    await page.addInitScript(RECORD_OPEN);
    await ui.toStep4AndCopy(page);
    await expectVisible(ui.countdownText(page, 5), '카운트다운');
    await ui.dialog(page, '복사가 완료되었습니다').getByRole('button', { name: '크레페로 이동하기' }).click();
    await page.waitForTimeout(6500);
    expect((await page.evaluate(() => window.__opened)).length === 1, '카운트다운 중 직접 이동해도 한 번만 열림');
  },

  async 'q7-popup-blocked'(page) {
    await page.addInitScript(BLOCK_POPUP);
    await ui.toStep4AndCopy(page);
    await page.waitForFunction(() => window.__opened.length > 0, null, { timeout: 8000 });
    await expectVisible(ui.moveBanner(page), '팝업이 막혀도 안내띠');
    await ui.moveBanner(page).getByRole('button', { name: '크레페로 이동하기' }).click();
    expect((await page.evaluate(() => window.__opened)).length === 2, '안내띠 버튼으로 다시 시도');
  },

  async 'q7-leave-tab-during-countdown'(page) {
    await page.addInitScript(RECORD_OPEN);
    await ui.toStep4AndCopy(page);
    await expectVisible(ui.countdownText(page, 5), '카운트다운');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(6500);
    expect((await page.evaluate(() => window.__opened)).length === 0, '탭을 떠나면 자동 이동 취소');
    await expectVisible(ui.moveBanner(page), '돌아오면 안내띠');
  },

  async 'copy-failure'(page) {
    await page.addInitScript(RECORD_OPEN);
    await page.addInitScript(BREAK_CLIPBOARD);
    await ui.toStep4AndCopy(page);
    const modal = ui.dialog(page, '복사에 실패했습니다');
    await expectVisible(modal, '복사 실패 모달');
    await expectVisible(ui.copyFailMessage(page), '복사 실패 안내');
    const area = ui.copyTextArea(page);
    await expectVisible(area, '직접 복사할 원문');
    expect((await area.inputValue()).includes('테스트닉'), '원문 내용');
    await modal.getByRole('button', { name: '다시 시도' }).click();
    await expectVisible(modal, '다시 시도해도 실패면 모달 유지');
    await modal.getByRole('button', { name: '직접 복사했어요' }).click();
    await expectHidden(modal, '모달 닫힘');
    await expectVisible(ui.moveBanner(page), '직접 복사 후 안내띠');
    expect((await page.evaluate(() => window.__opened)).length === 0, '실패하면 자동 이동하지 않아야 함');
  },
};

// ── 키보드만으로 (7단계 4번) ──────────────────────────────────
/** Tab 을 눌러 조건에 맞는 요소에 포커스가 갈 때까지 이동 (마우스 없이) */
async function tabTo(page, test, label, max = 80) {
  for (let i = 0; i < max; i++) {
    if (await page.evaluate(test)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Tab 으로 도달 못 함: ${label}`);
}
const focusedId = (id) => new Function(`return document.activeElement && document.activeElement.id === ${JSON.stringify(id)}`);
const focusedText = (text) => new Function(`const a = document.activeElement; return !!a && (a.textContent || '').trim().startsWith(${JSON.stringify(text)})`);
const focusedRadio = (name) => new Function(`const a = document.activeElement; return !!a && a.type === 'radio' && a.name === ${JSON.stringify(name)}`);

async function trapCheck(page, dialog, label) {
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const inside = await dialog.evaluate((d) => d.contains(document.activeElement));
    if (!inside) throw new Error(`포커스가 모달 밖으로 나감: ${label}`);
  }
}

Object.assign(SCENARIOS, {
  async 'mobile-menu-focus-and-esc'(page) {
    // 모바일 헤더 메뉴(1024px 미만에만 있음): 포커스가 메뉴 안에서 돌고 Esc 로 닫히면 메뉴 버튼으로 돌아온다
    if ((page.viewportSize()?.width ?? 0) >= 1024) return;
    await ui.seed(page, {});
    await ui.open(page, '/faq/');
    const toggle = page.getByRole('button', { name: '메뉴' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const ok = await page.evaluate(() => !!document.activeElement?.closest('#site-mobile-menu') || document.activeElement?.getAttribute('aria-label') === '메뉴');
      expect(ok, '포커스가 모바일 메뉴 밖으로 나감');
    }
    await page.keyboard.press('Escape');
    expect((await toggle.getAttribute('aria-expanded')) === 'false', 'Esc 로 메뉴 닫힘');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === '메뉴'), '닫으면 메뉴 버튼으로 포커스');
  },

  async 'keyboard-full-flow'(page) {
    await page.addInitScript(RECORD_OPEN);
    await ui.seed(page, {});
    await ui.open(page, '/order/');
    await ui.waitStep(page, 1);
    await page.locator('body').focus();
    const typeInto = async (id, value) => { await tabTo(page, focusedId(id), id); await page.keyboard.type(value); };
    await typeInto('applicantNickname', '키보드닉');
    await typeInto('communityShortName', '키커');
    await typeInto('communityKoreanName', '키보드 커뮤');
    await typeInto('communityEnglishName', 'Keyboard');
    // 날짜 칸: 연도(최대 6자리라 자동으로 안 넘어감) → 오른쪽 화살표 → 월·일 (실제 키보드 입력 순서)
    const typeDate = async (id, n) => {
      const [y, m, day] = iso(plusDays(n)).split('-');
      await tabTo(page, focusedId(id), id);
      await page.keyboard.type(y);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.type(m + day);
    };
    await typeDate('resultAnnouncementDate', 30);
    await typeDate('openingDate', 40);
    await typeDate('closingDate', 70);
    await tabTo(page, focusedId('termsAgreed'), '약관 동의');
    await page.keyboard.press('Space');
    await tabTo(page, focusedText('다음'), '다음 버튼');
    await page.keyboard.press('Enter');
    await ui.waitStep(page, 2);
    await tabTo(page, focusedRadio('applyServerInstall'), '서버 설치 라디오');
    await page.keyboard.press('ArrowRight'); // 예 → 아니오 (라디오 묶음은 방향키)
    if (!(await ui.serverNo(page).isChecked())) { await page.keyboard.press('Space'); }
    expect(await ui.serverNo(page).isChecked(), '키보드로 서버 아니오');
    await tabTo(page, focusedText('다음'), '다음 버튼');
    await page.keyboard.press('Enter');
    await ui.waitStep(page, 3);
    await tabTo(page, focusedRadio('applyBot'), '자동봇 라디오');
    await page.keyboard.press('ArrowRight');
    if (!(await ui.botNo(page).isChecked())) { await page.keyboard.press('Space'); }
    expect(await ui.botNo(page).isChecked(), '키보드로 자동봇 아니오');
    await tabTo(page, focusedText('다음'), '다음 버튼');
    await page.keyboard.press('Enter');
    await ui.waitStep(page, 4);
    await tabTo(page, () => document.activeElement?.type === 'checkbox' && document.activeElement.closest('section')?.textContent.includes('질문 정책'), '정책 동의');
    await page.keyboard.press('Space');
    await typeInto('googleEmail', 'kb@gmail.com');
    await typeInto('googlePassword', 'keyboard-pass');
    await tabTo(page, focusedText('신청서 복사하기'), '복사 버튼');
    await page.keyboard.press('Enter');
    const modal = ui.dialog(page, '복사가 완료되었습니다');
    await expectVisible(modal, '키보드로 복사 → 완료 모달');
    expect((await page.evaluate(() => navigator.clipboard.readText())).includes('키보드닉'), '키보드 입력이 복사 원문에');
    await page.keyboard.press('Escape');
    await expectHidden(modal, 'Esc 로 모달 닫힘');
    await expectVisible(ui.moveBanner(page), 'Esc 뒤 안내띠');
  },

  async 'modal-focus-trap-and-esc'(page) {
    // 초안 복원 (Esc = 이어서 작성)
    await ui.seed(page, { [KEY.draft]: draft(2) });
    await ui.open(page, '/order/');
    let dlg = ui.dialog(page, '작성 중인 내용 발견');
    await expectVisible(dlg, '복원 다이얼로그');
    await trapCheck(page, dlg, '복원');
    await page.keyboard.press('Escape');
    await expectHidden(dlg, '복원 Esc');
    await ui.waitStep(page, 2);
    // 견적 반영 (Esc = 기존 신청서 유지)
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS, [KEY.draft]: draft(1), [KEY.sync]: syncState(ESTIMATE_ITEMS) });
    await ui.open(page, '/order/');
    dlg = ui.dialog(page, '견적 데이터 반영');
    await expectVisible(dlg, '견적 반영 다이얼로그');
    await trapCheck(page, dlg, '견적 반영');
    await page.keyboard.press('Escape');
    await expectHidden(dlg, '견적 반영 Esc');
    expect((await page.locator('#applicantNickname').inputValue()) === '테스트닉', 'Esc 는 기존 신청서 유지');
    // 이용안내 모달
    await page.getByRole('button', { name: '이용안내', exact: true }).click();
    dlg = page.getByRole('dialog').filter({ hasText: '01. 견적비' });
    await expectVisible(dlg, '이용안내 모달');
    await trapCheck(page, dlg, '이용안내');
    await page.keyboard.press('Escape');
    await expectHidden(dlg, '이용안내 Esc');
    // 복사 실패 모달
    await page.addInitScript(BREAK_CLIPBOARD);
    await page.addInitScript(RECORD_OPEN);
    await ui.toStep4AndCopy(page);
    dlg = ui.dialog(page, '복사에 실패했습니다');
    await expectVisible(dlg, '실패 모달');
    await trapCheck(page, dlg, '복사 실패');
    await page.keyboard.press('Escape');
    await expectHidden(dlg, '실패 모달 Esc');
  },
});

// ── 실행 ────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  let passed = 0;
  for (const width of WIDTHS) {
    for (const [name, run] of Object.entries(SCENARIOS)) {
      if (ONLY && !ONLY.includes(name)) continue;
      const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1080 }, reducedMotion: 'reduce' });
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        await run(page);
        if (errors.length) throw new Error(`페이지 오류: ${errors.join(' | ')}`);
        console.log(`PASS  ${width}  ${name}`);
        passed++;
      } catch (e) {
        console.log(`FAIL  ${width}  ${name}  — ${e.message.split('\n')[0]}`);
        failed++;
      } finally {
        await context.close();
      }
    }
  }
  await browser.close();
  console.log(`\nscenarios: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
