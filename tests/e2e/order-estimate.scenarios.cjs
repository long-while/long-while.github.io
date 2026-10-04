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
  customCommandUpgrade: false, keywordReplyImage: false, reservationToot: false, autoProfileImage: false, tootCurrencyLink: false, transferFeature: false,
  transferOption: null, attendanceSystem: false, attendanceCurrencyAmount: 10, attendanceCommand: '[출석]', randomBox: false, randomBoxCommand: '', currencyUnit: '',
  statList: '', accountList: [], extraAccountTiers: 0, tootPerCurrency: '', omakaseDetails: '', setupDeadline: '',
  botSymbol: '✶', botAccountId: '', investigationBotAccountId: '',
};
const draft = (currentStep, over = {}) => ({
  version: 2,
  formData: { step1: { ...STEP1, ...over.step1 }, step2: { ...STEP2, ...over.step2 }, step3: { ...STEP3, ...over.step3 }, step4: { policyConfirmation: '' } },
  currentStep,
  savedAt: new Date().toISOString(),
});
// 4단계 검토: 서버 설치를 신청하면 서버비 미리보기 결과가 있어야 다음으로 간다 → 초안을 채울 때 함께 넣는다
const CALC = { type: 'gcp', months: 3, usersKey: 'u10', search: 'no', tier: null };
const syncState = (items) => ({ synced: true, syncedAt: new Date().toISOString(), itemCount: items.length, syncedItems: items.map((i) => i.name) });

// ── 화면 도우미 (디자인이 바뀌면 여기만 고친다) ─────────────────
const ui = {
  // 화면에서 숨긴 실제 input(ds Checkbox·Radio)을 고른다. 좌표 클릭(check force)은 단계 이동 뒤 스크롤로 고정 헤더 아래에 깔리면
  // 헤더를 눌러 버려 가끔 실패했다 → 요소에 직접 click (이미 골라져 있으면 그대로)
  async pick(locator) {
    await locator.evaluate((el) => { if (!el.checked) el.click(); });
  },
  async seed(page, storage) {
    if (storage[KEY.draft] && !storage[KEY.calc]) storage = { ...storage, [KEY.calc]: CALC };
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
    // 4단계: 단계가 바뀌면 머리말로 부드럽게 스크롤한다. 스크롤이 멈춘 뒤에 눌러야 좌표가 어긋나지 않는다
    await page.waitForFunction(() => new Promise((resolve) => {
      const y = window.scrollY;
      setTimeout(() => resolve(window.scrollY === y), 120);
    }), null, { timeout: 5000 });
  },
  dialog: (page, title) => page.getByRole('dialog').filter({ hasText: title }),
  errorSummary: (page) => page.getByText('입력 내용을 확인해 주세요'),
  // Q6 요약 상태
  summary: (page, title) => page.getByRole('heading', { name: title }),
  summaryEdit: (page) => page.getByRole('button', { name: '수정', exact: true }),
  async fillStep1(page) {
    await ui.pick(page.locator('#termsAgreed')); // ds Checkbox: 화면에서 숨긴 실제 input
    await page.locator('#applicantNickname').fill('테스트닉');
    await page.locator('#communityShortName').fill('테커');
    await page.locator('#communityKoreanName').fill('테스트 커뮤');
    await page.locator('#communityEnglishName').fill('Test Community');
    await page.locator('#resultAnnouncementDate').fill(iso(plusDays(30)));
    await page.locator('#openingDate').fill(iso(plusDays(40)));
    await page.locator('#closingDate').fill(iso(plusDays(70)));
  },
  longTermToggle: (page) => page.getByText('장기 소규모 서버입니다.'),
  // 4단계 문구 정리로 확인 문장이 짧아짐 (기준 12개월)
  longTermConfirm: (page) => page.getByText('12개월 이상 운영할 장기 소규모 서버가 맞습니다.'),
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
    await ui.pick(ui.policyCheckbox(page));
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
    // 커스텀 옵션 드롭다운은 요약 상태에서도 늘 보인다 (사용자 요청)
    await expectVisible(page.getByRole('combobox', { name: '커스텀 옵션' }), '요약 상태에서도 커스텀 옵션 드롭다운');
    await ui.summaryEdit(page).click();
    await expectVisible(page.getByRole('heading', { name: '테마 커스텀 선택' }), '수정 → 편집 상태');
    // 4단계: 신청서 옵션 이름을 서버 페이지와 맞춤 ('검색 옵션' → '검색 기능')
    expect(await page.getByRole('checkbox', { name: /검색 기능/ }).isChecked(), '검색 기능이 채워져야 함');
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
    await ui.pick(ui.serverNo(page));
    await ui.next(page);
    await ui.waitStep(page, 3);
    await expectVisible(ui.summary(page, '선택하신 자동봇 사양'), 'STEP3 요약 상태');
    await ui.next(page);
    await expectVisible(ui.errorSummary(page), '요약 상태에서도 검증 오류');
    await expectVisible(page.getByRole('heading', { name: '커뮤니티 봇 선택' }), '숨긴 칸(메인 봇) 오류 → 자동으로 펼침');
    await ui.waitStep(page, 3);
  },

  async 'q6-direct-entry-edit'(page) {
    await ui.seed(page, { [KEY.draft]: draft(2) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 2);
    await expectVisible(page.getByRole('heading', { name: '테마 커스텀 선택' }), '직접 들어오면 편집 상태');
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

  async 'draft-typed-reload-wait-restore'(page) {
    // 리뷰(4단계): 입력 → 새로고침 → 복원 창을 띄운 채 몇 초 → '이어서 작성'이면 입력이 사라졌다 (자동 저장이 빈 신청서로 덮어씀)
    await ui.seed(page, {});
    await ui.open(page, '/order/');
    await page.locator('#applicantNickname').fill('복원테스트');
    await page.waitForTimeout(800); // 입력 중 저장(짧은 지연) 확인: 칸을 떠나지 않고 바로 새로고침
    await page.reload({ waitUntil: 'networkidle' });
    const dlg = ui.dialog(page, '작성 중인 내용 발견');
    await expectVisible(dlg, '초안 복원 다이얼로그');
    await page.waitForTimeout(6000); // 예전 자동 저장 간격(5초)보다 길게 창을 띄워 둠
    await dlg.getByRole('button', { name: '이어서 작성' }).click();
    await expectHidden(dlg, '한 번 눌러 닫힘');
    expect((await page.locator('#applicantNickname').inputValue()) === '복원테스트', '입력한 닉네임 복원');
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
    await ui.pick(ui.serverYes(page));
    await expectVisible(page.getByRole('heading', { name: '테마 커스텀 선택' }), '예 → 옵션 보임');
    await ui.pick(ui.serverNo(page));
    // 입력한 내용이 있으면 '아니오' 전에 확인창 (1번 리뷰: 한 번 눌러도 다 사라졌다)
    const confirmNo = ui.dialog(page, '입력한 내용이 사라져요');
    await expectVisible(confirmNo, '아니오 확인창');
    await confirmNo.getByRole('button', { name: '계속 신청할게요' }).click();
    expect(await ui.serverYes(page).isChecked(), '취소하면 예 그대로');
    await ui.pick(ui.serverNo(page));
    await ui.dialog(page, '입력한 내용이 사라져요').getByRole('button', { name: '아니오로 바꾸고 지우기' }).click();
    await expectVisible(page.getByText('서버 설치를 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.'), '아니오 안내');
    await ui.next(page);
    await ui.waitStep(page, 3);
  },

  async 'step-change-scroll-and-focus'(page) {
    // 리뷰(4단계): '다음'을 누르면 단계마다 멈추는 위치가 달랐다 → 항상 새 단계 제목이 화면에 보이고 포커스가 간다
    const titleInView = async (n) => {
      await ui.waitStep(page, n);
      await page.waitForFunction((re) => {
        const h = [...document.querySelectorAll('h2')].find((el) => new RegExp(re).test(el.textContent));
        if (!h) return false;
        const r = h.getBoundingClientRect();
        return document.activeElement === h && r.top >= 0 && r.bottom <= window.innerHeight;
      }, `Step ${n}\.`, { timeout: 4000 });
    };
    await ui.seed(page, {});
    await ui.open(page, '/order/');
    await ui.fillStep1(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await ui.next(page);
    await titleInView(2);
    await ui.pick(ui.serverNo(page));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await ui.next(page);
    await titleInView(3);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole('button', { name: /이전/ }).click();
    await titleInView(2);
  },

  async 'step3-yes-no'(page) {
    await ui.seed(page, { [KEY.draft]: draft(3, { step3: { applyBot: null } }) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 3);
    await ui.pick(ui.botYes(page));
    await expectVisible(page.getByRole('heading', { name: '커뮤니티 봇 선택' }), '예 → 메인 봇 보임');
    await ui.pick(ui.botNo(page));
    // '예'를 누르면 가동 날짜가 자동으로 채워지므로 지울 내용이 있어 확인창이 뜬다
    await ui.dialog(page, '입력한 내용이 사라져요').getByRole('button', { name: '아니오로 바꾸고 지우기' }).click();
    await expectHidden(page.getByRole('heading', { name: '커뮤니티 봇 선택' }), '아니오 → 옵션 숨김');
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
  async 'bot-main-type-switch'(page) {
    // 리뷰(4단계): 기본 계열 타입은 하나만 고를 수 있으니 다른 것을 누르면 바로 바뀌어야 한다. 새 타입에서 못 쓰는 옵션은 함께 빠지고 알림
    await ui.seed(page, { [KEY.estimate]: [item('기본&상점 타입', 35000, 'bot'), item('출석 시스템', 10000, 'bot'), item('예약 툿', 5000, 'bot')] });
    await ui.open(page, '/bot/');
    await page.locator('[data-option-name="기본 타입"]').first().click();
    const toast = page.getByRole('status').filter({ hasText: '기본 타입으로 바꿨어요' });
    await expectVisible(toast, '바꿈 알림');
    await page.waitForTimeout(300);
    const box = await toast.boundingBox();
    const vw = page.viewportSize().width;
    expect(box.x >= 0 && box.x + box.width <= vw, `알림이 화면 안에 있어야 함: ${box.x}+${box.width} / ${vw}`);
    const names = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).map((i) => i.name), KEY.estimate);
    expect(names.includes('기본 타입') && !names.includes('기본&상점 타입'), `메인 타입 교체: ${names}`);
    expect(!names.includes('출석 시스템') && names.includes('예약 툿'), `기본 타입에서 못 쓰는 옵션만 빠짐: ${names}`);
  },

  async 'estimate-bar-footer-and-menu'(page) {
    // 리뷰(4단계): 고정 바는 왼쪽 글자를 눌러도 이동, 플로팅 버튼은 푸터가 보이면 숨김, 모바일 메뉴를 열면 메뉴가 위
    const mobile = page.viewportSize().width < 768;
    await ui.seed(page, { [KEY.estimate]: [item('커스텀 테마 1종', 20000, 'server')] });
    await ui.open(page, '/faq/');
    const floating = page.locator(mobile ? 'button[aria-label^="견적 보기"]' : 'button[aria-label^="견적 확인하기"]');
    await expectVisible(floating, '플로팅 견적 버튼');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expectHidden(floating, '푸터가 보이면 숨김');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectVisible(floating, '푸터에서 벗어나면 다시 보임');
    if (mobile) {
      await page.getByRole('button', { name: '메뉴' }).click();
      await page.waitForTimeout(400);
      const box = await floating.boundingBox();
      const onTop = await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('#site-mobile-menu'), [box.x + box.width / 2, box.y + box.height / 2]);
      expect(onTop, '메뉴를 열면 견적 버튼 위를 메뉴가 덮어야 함');
      await page.keyboard.press('Escape');
    }
    await ui.open(page, '/server/');
    await page.locator('main a[href="/estimate/"]').filter({ hasText: '견적 확인 (1개)' }).getByText('견적 확인 (1개)').click();
    await page.waitForURL('**/estimate/');
  },

  async 'server-rush-single-and-theme-fit'(page) {
    // 리뷰(4단계): 빠른마감 48시간·24시간을 함께 담을 수 있었다 → 택1, 고른 테마에 맞는 것만
    const names = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]').map((i) => i.name), KEY.estimate);
    const rush = (name) => page.locator(`[data-option-name="${name}"]`).first();
    await ui.seed(page, {});
    await ui.open(page, '/server/');
    await rush('빠른마감: 48시간 내 기본 서버 설치').click({ force: true });
    await rush('빠른마감: 24시간 내 기본 서버 설치').click({ force: true });
    let list = await names();
    expect(list.includes('빠른마감: 24시간 내 기본 서버 설치') && !list.includes('빠른마감: 48시간 내 기본 서버 설치'), `빠른마감은 하나만: ${list}`);
    expect(await rush('빠른마감: 48시간 내 테마 커스텀 서버 설치').isDisabled(), '테마 없이 테마 마감은 못 고름');
    await page.locator('[data-option-name="커스텀 테마 1종"]').first().click({ force: true });
    await expectVisible(page.getByRole('status').filter({ hasText: '테마 선택이 바뀌어' }), '맞지 않게 된 빠른마감을 뺐다는 안내');
    list = await names();
    expect(list.includes('커스텀 테마 1종') && !list.some((n) => n.startsWith('빠른마감')), `테마를 고르면 기본 마감은 빠짐: ${list}`);
    expect(await rush('빠른마감: 24시간 내 기본 서버 설치').isDisabled(), '테마를 고르면 기본 마감은 잠김');
    await rush('빠른마감: 48시간 내 테마 커스텀 서버 설치').click({ force: true });
    expect((await names()).includes('빠른마감: 48시간 내 테마 커스텀 서버 설치'), '테마 마감은 고를 수 있음');
  },

  async 'server-search-linked'(page) {
    // 리뷰(4단계): 서버비 미리보기의 검색 예/아니오와 추가 옵션 '검색 기능'이 따로 놀았다 → 미리보기를 따라 담기·빼기, 카드는 잠금
    const pick = async (id, re) => {
      const el = page.locator('#' + id);
      if ((await el.evaluate((e) => e.tagName)) === 'SELECT') {
        await el.selectOption(await el.evaluate((e, r) => [...e.options].find((o) => new RegExp(r).test(o.text)).value, re));
      } else {
        await el.click();
        await page.getByRole('option', { name: new RegExp(re) }).first().click();
      }
    };
    const hasSearch = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]').some((i) => i.name === '검색 기능'), KEY.estimate);
    await ui.seed(page, {});
    await ui.open(page, '/server/');
    await pick('server-months', '^6개월');
    await pick('server-users', '^11');
    const search = page.getByRole('radiogroup', { name: '검색 기능 추가 여부' });
    await search.getByText('예', { exact: true }).click();
    await page.getByRole('radiogroup', { name: '서버 사양' }).getByText('쾌적').click();
    await page.waitForFunction((k) => (localStorage.getItem(k) || '').includes('검색 기능'), KEY.estimate, { timeout: 3000 });
    expect(await page.locator('[data-option-name="검색 기능"]').first().isDisabled(), '미리보기에서 정했으면 카드는 잠김');
    await search.getByText('아니오', { exact: true }).click();
    await page.waitForTimeout(300);
    expect(!(await hasSearch()), '미리보기에서 아니오 → 견적에서 빠짐');
  },

  async 'order-search-from-other-options'(page) {
    // 신청서 STEP2: 계산기 안 검색 질문·결과·지불 방식·부가비용·가이드 안내를 빼고, 검색은 기타 옵션 체크가 정한다 (사용자 요청)
    const calcSearch = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null')?.search ?? null, KEY.calc);
    await ui.seed(page, { [KEY.draft]: draft(2), [KEY.calc]: { ...CALC, search: 'no' } });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 2);
    expect((await page.getByRole('radiogroup', { name: '검색 기능 추가 여부' }).count()) === 0, '계산기 검색 질문 없음');
    for (const gone of ['도메인·메일(SMTP) 부가비용', '서버비 지불 방식', '노션 마스토돈 가이드 무료 제공']) {
      expect((await page.getByText(gone).count()) === 0, `숨김: ${gone}`);
    }
    const search = page.getByRole('checkbox', { name: /검색 기능/ });
    await search.check({ force: true });
    await page.waitForFunction((k) => JSON.parse(localStorage.getItem(k) || 'null')?.search === 'yes', KEY.calc, { timeout: 3000 });
    await search.uncheck({ force: true });
    await page.waitForTimeout(300);
    expect((await calcSearch()) === 'no', '검색 체크 해제 → 계산기도 아니오');
  },

  async 'server-fee-note'(page) {
    // 리뷰(4단계): 견적 총액에 매달 나가는 서버비가 빠져 있다는 표시가 없었다
    await ui.seed(page, { [KEY.estimate]: [item('마스토돈 서버 설치', 20000, 'server')] });
    await ui.open(page, '/estimate/');
    // 4단계 문구 정리로 '이 금액에 포함되지 않아요' → '이 금액과 별도'
    await expectVisible(page.getByText(/서버비는 이 금액과 별도/), '서버비 별도 안내');
    await ui.seed(page, { [KEY.estimate]: [item('기본 타입', 15000, 'bot')] });
    await ui.open(page, '/estimate/');
    expect((await page.getByText(/서버비는 이 금액과 별도/).count()) === 0, '서버 설치가 없으면 안내 없음');
  },

  async 'estimate-orphan-server-options'(page) {
    // 리뷰(4단계): 서버 설치를 지워도 서버 옵션만 남아 신청서로 갈 수 있었다 → 알리고 함께 빼거나 다시 담게
    await ui.seed(page, { [KEY.estimate]: [item('커스텀 테마 1종', 20000, 'server'), item('검색 기능', 15000, 'server'), item('기본 타입', 15000, 'bot')] });
    await ui.open(page, '/estimate/');
    const banner = page.getByRole('status').filter({ hasText: '서버 설치 없이 담긴 서버 옵션이 있어요' });
    await expectVisible(banner, '서버 옵션만 남은 경고');
    await banner.getByRole('button', { name: '서버 옵션 모두 빼기' }).click();
    await expectHidden(banner, '모두 빼면 경고 사라짐');
    const names = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).map((i) => i.name), KEY.estimate);
    expect(JSON.stringify(names) === JSON.stringify(['기본 타입']), `서버 옵션만 빠짐: ${names}`);
  },

  async 'skip-link-and-terms-name'(page) {
    // 리뷰(4단계): 본문 바로가기 링크가 없었고, 약관 체크박스 이름이 '를 확인했으며…'로 앞이 잘려 읽혔다
    await ui.seed(page, {});
    await ui.open(page, '/faq/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: '본문 바로가기' });
    expect(await skip.evaluate((el) => el === document.activeElement), '첫 Tab 은 본문 바로가기');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => document.activeElement?.id === 'main'), 'Enter → 본문으로 포커스');
    await ui.open(page, '/order/');
    await expectVisible(page.getByRole('checkbox', { name: '이용안내를 확인했으며, 내용에 동의합니다.' }), '약관 체크박스 이름');
  },

  async 'bot-weeks-input'(page) {
    // 리뷰(4단계): 가동 주수를 +/- 로만 바꿀 수 있었다 → 직접 입력·빠른 선택. 다시 들어와도 견적의 주수가 보여야 함
    const weeksItem = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k)).find((i) => i.name.startsWith('기본 가동료'))?.name ?? null, KEY.estimate);
    await ui.seed(page, { [KEY.estimate]: [item('기본 가동료 (2주)', 10000, 'bot')] });
    await ui.open(page, '/bot/');
    const input = page.getByRole('spinbutton', { name: '가동 주수 직접 입력' });
    expect((await input.inputValue()) === '2', '견적의 2주가 보여야 함');
    await page.getByRole('group', { name: '가동 주수 빠른 선택' }).getByRole('button', { name: '26주' }).click();
    expect((await weeksItem()) === '기본 가동료 (26주)', `빠른 선택 26주: ${await weeksItem()}`);
    await input.fill('10');
    expect((await weeksItem()) === '기본 가동료 (10주)', `직접 입력 10주: ${await weeksItem()}`);
  },

  async 'past-deadline-and-bot-dates'(page) {
    // 4단계 검토: 지난 마감일에 유료 빠른마감이 자동으로 붙던 문제, '6/16'이 '61/6'으로 바뀌어 가동비 0원이 되던 문제
    const yesterday = new Date(Date.now() - DAY);
    const past = `${String(yesterday.getMonth() + 1).padStart(2, '0')}/${String(yesterday.getDate()).padStart(2, '0')}`;
    await ui.seed(page, { [KEY.draft]: draft(2) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 2);
    await page.locator('#desiredDeadline').fill(past);
    await page.waitForTimeout(600);
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).formData.step2, KEY.draft);
    expect(!saved.fastDeadline, '지난 날짜에는 빠른마감을 자동으로 붙이지 않음');
    await ui.next(page);
    await expectVisible(page.getByText('이미 지난 날짜예요').first(), '지난 마감일 오류');

    await ui.seed(page, { [KEY.draft]: draft(3, { step2: { applyServerInstall: 'no', desiredDeadline: '', adminAccountId: '' }, step3: { applyBot: 'yes', operationWeeksOption: 'manual', mainBot: 'basic' } }) });
    await ui.open(page, '/order/');
    await ui.dialog(page, '작성 중인 내용 발견').getByRole('button', { name: '이어서 작성' }).click();
    await ui.waitStep(page, 3);
    // 가동 기간은 달력(date) 입력으로 바뀜 (사용자 요청). 저장은 예전처럼 MM/DD
    const year = new Date().getFullYear();
    await page.getByLabel('가동 시작일').fill(`${year}-06-16`);
    await page.getByLabel('가동 종료일').fill(`${year}-07-14`);
    await page.waitForTimeout(400);
    const bot = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).formData.step3, KEY.draft);
    expect(bot.botStartDate === '06/16' && bot.botEndDate === '07/14', `가동 기간 저장: ${bot.botStartDate} ~ ${bot.botEndDate}`);
    await expectVisible(page.getByText(/자동봇 가동 기간: 4주/), '가동 주수 안내');
  },

  async 'sync-dialog-once'(page) {
    // 4단계 검토: 견적을 반영한 뒤 새로고침할 때마다 '견적 데이터 반영' 창이 다시 떠서 작업을 날릴 수 있었다
    await ui.seed(page, { [KEY.estimate]: ESTIMATE_ITEMS, [KEY.sync]: syncState(ESTIMATE_ITEMS) });
    await ui.open(page, '/order/');
    await expectVisible(page.getByText('견적 항목이 자동으로 반영되었습니다'), '처음엔 반영 안내');
    await ui.fillStep1(page);
    await page.waitForTimeout(600);
    await page.reload({ waitUntil: 'networkidle' });
    expect((await ui.dialog(page, '견적 데이터 반영').count()) === 0, '새로고침해도 견적 반영 창이 다시 뜨지 않음');
    await expectVisible(ui.dialog(page, '작성 중인 내용 발견'), '대신 이어 쓰기 창');
  },

  async 'no-horizontal-overflow'(page) {
    // 리뷰(4단계): 이용안내가 1218px 에서 가로로 넘쳤다. 실행 너비 + 좁은 PC 너비(1024·1218)에서 모든 경로를 본다
    const base = page.viewportSize();
    const widths = base.width >= 1024 ? [base.width, 1024, 1218] : [base.width];
    for (const width of widths) {
      await page.setViewportSize({ width, height: base.height });
      for (const path of ['/', '/server/', '/bot/', '/terms/', '/faq/', '/estimate/', '/order/']) {
        await ui.open(page, path);
        const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        expect(scroll <= client, `${width}px ${path} 가로 넘침 ${scroll}/${client}`);
      }
    }
  },

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
    await ui.seed(page, { [KEY.calc]: CALC });
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
    // 4단계 검토: 서버·자동봇 둘 다 '아니오'는 막히므로 서버 설치 '예'로 끝까지 (미리보기 값은 미리 채움)
    await tabTo(page, focusedRadio('applyServerInstall'), '서버 설치 라디오');
    if (!(await ui.serverYes(page).isChecked())) { await page.keyboard.press('Space'); }
    expect(await ui.serverYes(page).isChecked(), '키보드로 서버 예');
    await typeInto('desiredDeadline', safeDeadline(35));
    await typeInto('adminAccountId', 'kbadmin');
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
