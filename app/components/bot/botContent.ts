/**
 * 자동봇 커미션 옵션·문구 (기존 BotCommission.tsx 의 이름·가격·설명 그대로, Q9).
 * name/aliases 는 견적함 항목 이름이라 바꾸면 안 된다 (견적함·신청서 매핑, 수정 강조에 쓰임).
 */
import { IMAGES } from '@/app/constants/images';
import { PRICING_CONFIG } from '@/app/constants/form';

/** 가격은 신청서 계산과 같은 PRICING_CONFIG 에서 (한 곳만 고치면 페이지·견적·신청서가 함께 바뀜) */
const PB = PRICING_CONFIG.bot;

// 메인 봇 타입 (서로 배타적: 기본 / 기본&상점 / 기본&상점&스탯 중 하나만 선택 가능)
export const MAIN_BOT_TYPES = ['기본 타입', '기본&상점 타입', '기본&상점&스탯 타입'] as const;
export const SHOP_BOT_TYPES = ['기본&상점 타입', '기본&상점&스탯 타입'] as const;

const D100_BOT_NAME = 'D100 룰 대응 TRPG봇';
const TRPG_2D6_BOT_NAME = '2D6 룰 대응 TRPG봇 3종';

// TRPG봇(D100 / 2D6)은 기능이 겹치는 기본 타입과 함께 담을 수 없다 (기본&상점 이상은 허용)
export const TRPG_EXCLUSIVE_PAIRS: Record<string, string[]> = {
  [D100_BOT_NAME]: ['기본 타입'],
  [TRPG_2D6_BOT_NAME]: ['기본 타입'],
  '기본 타입': [D100_BOT_NAME, TRPG_2D6_BOT_NAME],
};

export const WEEKLY_FEE = PB.operationPerWeek;
export const OPERATION_FEE_PREFIX = '기본 가동료';
export const INVESTIGATION_TYPE = '자동조사 타입';
export const OMAKASE_TYPE = '오마카세 타입';

export const SHEET_LINKS = [
  { title: '기본 & 상점 & 스탯 자동봇 시트', href: 'https://docs.google.com/spreadsheets/d/1iTqRwJChqTCpfpMaleLEt2i1h2MTroyWAbNktZF8KjA/edit?usp=sharing', image: IMAGES.botType01 },
  { title: '예약 툿 시트', href: 'https://docs.google.com/spreadsheets/d/1ui6iVgG-nDLF2RDVd50bz2jVeBU9JRp3f5oCx3a4eQE/edit?usp=sharing', image: IMAGES.botType02 },
  { title: '스토리 자동진행 시트', href: 'https://docs.google.com/spreadsheets/d/1K0mXU2NOQ71HF9Mo6Zs_cFHlpDPeRFm_N8v7Pts58cY/edit?usp=sharing', image: IMAGES.botType03 },
  { title: '조사 자동봇 시트', href: 'https://docs.google.com/spreadsheets/d/1kccCpDwSaQyaNeUxmCfyIrUNM9taJDeyfQfXTMcBQ24/edit?usp=sharing', image: IMAGES.botType04 },
  { title: 'D100 TRPG봇 시트', href: 'https://docs.google.com/spreadsheets/d/1F4mhGtNT3cgkgze5PlZvMMG9XKMNOzeJNaCPH0KhGrs/edit?usp=sharing', image: IMAGES.botType05 },
];

const won = (n: number) => `₩${n.toLocaleString()}`;
const EXAMPLE_WEEKS = 4;

export const OPERATION_NOTES = [
  // '주수만큼 골라 주세요'는 주수 고르는 칸 바로 위로 옮김 (OPERATION_WEEKS_HINT)
  '가동비는 1주 5천원이에요. (테스트 기간 제외)',
  '12개월 이상 장기 서버는 주당 비용 대신 초기 세팅비 1만원만 받아요. 이때는 아래에서 2주(1만원)를 골라 주세요.',
  `합계 예: 기본&상점 ${won(PB.mainTypes.basicShop)} + ${EXAMPLE_WEEKS}주 ${won(EXAMPLE_WEEKS * PB.operationPerWeek)} = ${won(PB.mainTypes.basicShop + EXAMPLE_WEEKS * PB.operationPerWeek)}`,
  '지난 신청자분들의 자동봇도 지금까지 꾸준히 업데이트해 드리고 있습니다.',
];
export const OPERATION_WEEKS_HINT = '커뮤를 운영할 주수만큼 골라 주세요.';

/** 봇 타입 비교 표: 기본 / 기본&상점 / 기본&상점&스탯. 기능은 말로 쓰고 키워드·짧은 설명은 옆에 작게 */
export const COMPARE_COLUMNS = ['기본', '기본&상점', '기본&상점&스탯'];
export const COMPARE_ROWS: { feature: string; keyword?: string; has: [boolean, boolean, boolean] }[] = [
  { feature: '구글 시트 연동', keyword: '운영진이 언제든지 직접 수정 가능', has: [true, true, true] },
  { feature: '주사위 굴리기', keyword: '[1d100]', has: [true, true, true] },
  { feature: '여러 개 중 하나 뽑기', keyword: '[랜덤/옵션, 옵션]', has: [true, true, true] },
  { feature: '오늘의 운세', keyword: '[운세]', has: [true, true, true] },
  { feature: '키워드 답멘', keyword: '[YN] [가위바위보] 등', has: [true, true, true] },
  { feature: '돈(재화) 관리', has: [false, true, true] },
  { feature: '상점 · 가방', keyword: '[상점] [구매] [가방]', has: [false, true, true] },
  { feature: '캐릭터 스탯 (체력 등)', has: [false, false, true] },
  { feature: '아이템을 쓰면 스탯이 바뀜', keyword: '[사용/아이템명]', has: [false, false, true] },
];
export const COMPARE_PRICES = [PB.mainTypes.basic, PB.mainTypes.basicShop, PB.mainTypes.basicShopStat].map(won);

/** 예시 대화 한 줄. message 안의 *별표* 부분은 강조 표시 */
export interface ChatTurn {
  speaker: string;
  fromBot?: boolean;
  message: string;
}

/** 시트 한 줄 (키워드 | 답멘). reply 안의 {중괄호} 부분은 강조 표시 */
export interface SheetRow {
  keyword: string;
  reply: string;
}

/** 기본 안내: 자동봇이 어떻게 움직이는지 한 장면 (주사위 답은 봇 코드 dice_command 처럼 숫자만) */
export const BOT_INTRO_CHAT: ChatTurn[] = [
  { speaker: '루나', message: '@BOT [1d100]' },
  { speaker: '봇', fromBot: true, message: '@Luna *73*' },
];

/** 키워드 답멘 (기본 기능): 같은 키워드를 여러 줄 적으면 그중 하나가 랜덤으로 나간다 */
export const KEYWORD_REPLY_SHEET: SheetRow[] = [
  { keyword: '허기', reply: '배가 고픕니다.' },
  { keyword: '허기', reply: '밥 먹을 시간이에요!' },
  { keyword: 'YN', reply: '예' },
  { keyword: 'YN', reply: '아니오' },
];
export const KEYWORD_REPLY_CHAT: ChatTurn[] = [
  { speaker: '루나', message: '@BOT [허기]' },
  { speaker: '봇', fromBot: true, message: '@Luna 배가 고픕니다.' },
  { speaker: '루나', message: '@BOT [YN]' },
  { speaker: '봇', fromBot: true, message: '@Luna 아니오' },
];

/**
 * 답멘에 이름·주사위 넣기 (추가 옵션). 봇 코드 custom_command.py 기준으로
 * 옵션이 꺼져 있으면 {중괄호}를 하나도 바꾸지 않고 글자 그대로 보낸다 (랜덤 단어 포함).
 * {과와} {아야} {으로로}도 동작하지만 ㄹ 받침 처리가 아직 틀려서 안내하지 않는다.
 */
export const REPLY_TAGS: { tag: string; meaning: string; result: string }[] = [
  { tag: '{시전자}', meaning: '키워드를 보낸 사람 이름', result: '루나' },
  { tag: '{은는} {이가} {을를}', meaning: '앞 글자에 맞춰 조사 자동 선택', result: '루나는 / 하늘은' },
  { tag: '{1d100} {3d6+5}', meaning: '주사위 결과', result: '73' },
  { tag: '{랜덤: A, B, C}', meaning: '적어 둔 것 중 하나', result: 'B' },
];

export const REPLY_TAG_EXAMPLES: { title: string; sheet: SheetRow[]; chat: ChatTurn[] }[] = [
  {
    title: '캐릭터마다 다른 공격식',
    sheet: [
      { keyword: '공격:겐지', reply: '겐지의 공격! 피해 {3d5}' },
      { keyword: '공격:디바', reply: '디바의 공격! 피해 {2d5}' },
    ],
    chat: [
      { speaker: '겐지', message: '@BOT [공격:겐지]' },
      { speaker: '봇', fromBot: true, message: '@Genji 겐지의 공격! 피해 *11*' },
    ],
  },
  {
    title: '보낸 사람에 따라 바뀌는 답멘',
    sheet: [{ keyword: '허기', reply: '{시전자}{은는} 배가 고픕니다.' }],
    chat: [
      { speaker: '루나', message: '@BOT [허기]' },
      { speaker: '봇', fromBot: true, message: '@Luna *루나는* 배가 고픕니다.' },
      { speaker: '하늘', message: '@BOT [허기]' },
      { speaker: '봇', fromBot: true, message: '@Haneul *하늘은* 배가 고픕니다.' },
    ],
  },
  {
    title: '랜덤 단어',
    sheet: [{ keyword: '즐거운 발견', reply: '{랜덤: 숟가락, 젓가락, 깨진 유리}{을를} 찾아냈습니다!' }],
    chat: [
      { speaker: '루나', message: '@BOT [즐거운 발견]' },
      { speaker: '봇', fromBot: true, message: '@Luna *젓가락을* 찾아냈습니다!' },
    ],
  },
];

export interface BotType {
  name: string;
  price: number;
  features: string[];
  /** 운영진만 쓰는 명령어 (카드에서 구분선 아래로 따로 묶음) */
  adminFeatures?: string[];
  note?: string;
}

// 순서: 기본 / 기본&상점 / 기본&상점&스탯 / 자동조사 / D100 / 2D6 / 오마카세 (4단계 사용자 요청)
export const BOT_TYPES: BotType[] = [
  {
    name: '기본 타입',
    price: PB.mainTypes.basic,
    features: [
      '구글 스프레드시트 연동',
      '[nDm] [랜덤/옵션, 옵션, 옵션...]',
      '[운세] 명령어와 기본 운세 문구 제공',
      '[가위바위보] [YN] 등 키워드 답멘 기본 제공 (시트에서 직접 늘리고 고칠 수 있어요)',
    ],
  },
  {
    name: '기본&상점 타입',
    price: PB.mainTypes.basicShop,
    features: [
      '기본 타입에 포함된 모든 기능 +@',
      '구글 시트로 캐릭터, 재화, 인벤토리 관리 (운영진 수동 편집 지원)',
      '[상점] 아이템 목록 출력',
      '[구매/아이템명] 아이템 구매 시 재화 차감',
      '[가방] 인벤토리, 재화 확인',
    ],
    adminFeatures: ['[소지금 추가/금액/캐릭터명] [소지금 차감/금액/캐릭터명]'],
  },
  {
    name: '기본&상점&스탯 타입',
    price: PB.mainTypes.basicShopStat,
    features: [
      '기본&상점 타입에 포함된 모든 기능 +@',
      '구글 시트로 캐릭터 스탯 관리 (운영진 수동 편집 지원)',
      '[사용/아이템명] 아이템 소모 후 캐릭터 스탯 변화. 운영진이 시트로 아이템 편집 가능',
    ],
    adminFeatures: ['[OO 변경/수치/캐릭터명] (예: 체력 변경)'],
  },
  {
    name: INVESTIGATION_TYPE,
    price: PB.addons.investigationBot,
    features: [
      // T6: 신청서 규칙과 같게 (메인 봇이 있어야 함)
      '기본 / 기본&상점 / 기본&상점&스탯 중 하나와 함께 신청해 주세요. (단독 신청은 안 돼요)',
      '[장소 목록] [진입/장소명] [조사/포인트명]',
      '장소 목록과 각 장소에서 조사할 수 있는 포인트 관리',
      '캐릭터 소지품 및 스탯과 연동 (특정 이벤트 발생 시 아이템 획득 / 체력 -5 등)',
    ],
  },
  {
    name: D100_BOT_NAME,
    price: PB.addons.cocBot,
    features: [
      'D100 롤언더(기능치 이하 성공) 판정을 쓰는 TRPG용 자동봇',
      '봇과 연동된 플레이어, 커스텀, 랜덤표 구글 시트 제공 (편집 가능, 표 내용은 직접 입력)',
      '[nDm±k]',
      '기본 판정 [근력] [설득]',
      '보너스/페널티 다이스 [근력+1] [관찰력-2]',
      '판정, 피해 정산, 치명타가 모두 적용되는 무기 공격',
      '[랜덤/옵션, 옵션, 옵션] 여러 개의 옵션 중 하나를 랜덤 선택',
      '판정 기능만 드려요. 룰북 내용(광기 목록 등)은 직접 입력해 주세요.',
    ],
  },
  {
    name: TRPG_2D6_BOT_NAME,
    price: PB.addons.trpg2d6Bot,
    features: [
      '2D6 특기표 판정을 쓰는 J룰 TRPG용 자동봇 3종 세트',
      '특기를 체크하는 방식의 플레이어 구글 시트 제공',
      '편집 가능한 커스텀 시트 + 랜덤표 시트 제공',
      '[nDm±k] [nDm±k>=a] [xBy] [aSG@b#c±d>=e] [nDAm±k] 등 지원',
      '기본 판정 [특기명]',
      '보너스/페널티 다이스',
      '명령어를 통한 아이템 관리',
      '[랜덤/옵션, 옵션, 옵션] 여러 개의 옵션 중 하나를 랜덤 선택',
      '판정 기능만 드려요. 룰북 내용(특기명, 광기표 등)은 직접 입력해 주세요.',
      '일부만 선택해 설치 시 룰 당 3만원 (문의 요망)',
    ],
  },
  {
    name: OMAKASE_TYPE,
    price: 0,
    features: [
      '신청 전에 먼저 문의해 주세요. 가능 여부를 본 뒤 신청서를 받아요.',
      '보내실 것: 시스템 설명 문서(외부 링크), 마감일, 가동 기간',
      '난이도에 따라 일정 여유와 추가금이 필요할 수 있어요.',
    ],
    note: '진행하지 않는 시스템: 일반 레이드, 마스레이드, 포지션제 전투',
  },
];

export interface AdditionalOption {
  /** 견적함 항목 이름(신청서 매핑 키). 화면 이름만 바꿀 때는 label 을 쓴다 */
  name: string;
  /** 자동봇 페이지 카드에 보일 이름 (없으면 name). 3단계 사용자 요청: '(시트로 관리)' 표기 */
  label?: string;
  price: number;
  description?: string;
  aliases?: string[];
  priceLabel?: string;
  /** 단일 항목명 또는 "이 중 하나(any)" 배열 */
  requires?: string | string[];
  requiresLabel?: string;
}

export const MAIN_REQUIRES_LABEL = '기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나';
export const SHOP_REQUIRES_LABEL = '기본&상점 또는 기본&상점&스탯 타입';

// 3단계 사용자 요청으로 뺀 옵션: '특정 상황 DM 전송', '빠른 마감 (48시간 내)', '빠른 마감 (1주일 내)' (EstimateContext 의 판매 중단 목록에도 넣음)
export const ADDITIONAL_OPTIONS: AdditionalOption[] = [
  // 예전 이름 '커스텀 명령어 업그레이드'는 별칭으로 남긴다 (저장된 견적은 불러올 때 새 이름으로 바뀜, estimateCatalog)
  { name: '답멘에 이름·주사위 넣기', price: PB.addons.customCommandUpgrade, description: '답멘에 보낸 사람 이름, 주사위 결과, 랜덤 단어를 넣어요', aliases: ['커스텀 명령어 업그레이드', '기본 타입 - 커스텀 명령어 업그레이드', '기본&상점 타입 - 커스텀 명령어 업그레이드', '기본&상점&스탯 타입 - 커스텀 명령어 업그레이드'], requires: [...MAIN_BOT_TYPES], requiresLabel: MAIN_REQUIRES_LABEL },
  { name: '재화, 아이템 양도 기능', price: PB.addons.transferFeature, aliases: ['양도 기능', '기본&상점 타입 - 양도 기능', '기본&상점&스탯 타입 - 양도 기능'], requires: [...SHOP_BOT_TYPES], requiresLabel: SHOP_REQUIRES_LABEL },
  { name: '툿수-재화 자동반영', price: PB.addons.tootCurrencyLink, aliases: ['기본&상점 타입 - 툿수-재화 자동반영', '기본&상점&스탯 타입 - 툿수-재화 자동반영'], requires: [...SHOP_BOT_TYPES], requiresLabel: SHOP_REQUIRES_LABEL },
  { name: '출석 시스템', price: PB.addons.attendanceSystem, requires: [...SHOP_BOT_TYPES], requiresLabel: SHOP_REQUIRES_LABEL },
  { name: '예약 툿', label: '예약 툿 (시트로 관리)', price: PB.addons.reservationToot, requires: [...MAIN_BOT_TYPES], requiresLabel: MAIN_REQUIRES_LABEL },
  { name: '스토리 자동 진행', label: '스토리 자동 진행 (시트로 관리)', price: PB.addons.autoProfileImage, requires: [...MAIN_BOT_TYPES], requiresLabel: MAIN_REQUIRES_LABEL },
  { name: '일일 조사 횟수 제한', price: PB.addons.investigationDailyLimit, description: '[조사] 명령어 사용 시 1회 카운트', requires: INVESTIGATION_TYPE },
];

export const INVESTIGATION_EXAMPLE = [
  { role: '캐릭터', label: '장소 목록 확인', message: '@BOT 오늘은 어디를 돌아다닐까? [장소 목록]' },
  { role: '자동봇', label: '장소 목록 출력', message: '@character\n현재 진입할 수 있는 장소는 다음과 같습니다.\n\n- 운동장\n- 교실\n- 음악실\n\n[진입/장소명]으로 조사를 시작할 수 있습니다.' },
  { role: '캐릭터', label: '장소 진입', message: '@BOT (운동장으로 이동한다.) [진입/운동장]' },
  { role: '자동봇', label: '진입 시 문구 출력', message: '@character 해가 길게 드리운 운동장이다. [철봉], [모래밭], [스탠드 구석]을 조사할 수 있다.' },
  { role: '캐릭터', label: '조사 포인트 선택', message: '@BOT (모래밭을 살핀다.) [조사/모래밭]' },
  { role: '자동봇', label: '조사 시 문구 출력', message: "@character\n[모래밭]\n\n당신은 모래를 파헤친다. 날카로운 유리 조각이 손끝을 스쳐도 아랑곳않고 모래밭을 뒤적인다. 기념주화 3개와 [접힌 쪽지]를 발견했다.\n\n➭ '기념주화' 3개 획득\n➭ 체력 -3" },
  { role: '캐릭터', label: '다음 조사 포인트 선택', message: '@BOT 응? 이게 뭐지? [조사/접힌 쪽지]' },
  { role: '자동봇', label: '조사 시 문구 출력', message: "@character\n[접힌 쪽지]\n\n쪽지 안에는 '해가 지면 1학년 3반 교실로 찾아와. - 너의 친구'라는 글이 적혀 있다. 오래된 것 같다." },
];

export const OMAKASE_FORM_URL = 'https://stellar-ground-601.notion.site/310d06ebad99807a99d1fbf4e8fc9ace';
