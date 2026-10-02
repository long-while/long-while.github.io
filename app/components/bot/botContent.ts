/**
 * 자동봇 커미션 옵션·문구 (기존 BotCommission.tsx 의 이름·가격·설명 그대로, Q9).
 * name/aliases 는 견적함 항목 이름이라 바꾸면 안 된다 (견적함·신청서 매핑, 수정 강조에 쓰임).
 */
import { IMAGES } from '@/app/constants/images';

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

export const WEEKLY_FEE = 5000;
export const OPERATION_FEE_PREFIX = '기본 가동료';
export const INVESTIGATION_TYPE = '자동조사 타입';
export const OMAKASE_TYPE = '오마카세 타입';

export const SHEET_LINKS = [
  { title: '기본 & 상점 & 스탯 자동봇 시트', href: 'https://docs.google.com/spreadsheets/d/1iTqRwJChqTCpfpMaleLEt2i1h2MTroyWAbNktZF8KjA/edit?usp=sharing', image: IMAGES.botType01 },
  { title: '예약 툿 시트', href: 'https://docs.google.com/spreadsheets/d/1ui6iVgG-nDLF2RDVd50bz2jVeBU9JRp3f5oCx3a4eQE/edit?usp=sharing', image: IMAGES.botType02 },
  { title: '스토리 자동진행 시트', href: 'https://docs.google.com/spreadsheets/d/1K0mXU2NOQ71HF9Mo6Zs_cFHlpDPeRFm_N8v7Pts58cY/edit?usp=sharing', image: IMAGES.botType03 },
  { title: '조사 자동봇 시트', href: 'https://docs.google.com/spreadsheets/d/1kccCpDwSaQyaNeUxmCfyIrUNM9taJDeyfQfXTMcBQ24/edit?usp=sharing', image: IMAGES.botType04 },
  { title: 'CoC 자동봇 시트', href: 'https://docs.google.com/spreadsheets/d/1F4mhGtNT3cgkgze5PlZvMMG9XKMNOzeJNaCPH0KhGrs/edit?usp=sharing', image: IMAGES.botType05 },
];

export const OPERATION_NOTES = [
  '봇 가동 비용은 1주에 5천원입니다.',
  '커뮤니티 용도의 자동봇이라면 운영 주수만큼 숫자를 올려주세요.',
  '만약 6개월 이상의 장기 소규모 서버를 위한 자동봇을 신청하시는 경우, 아래 항목을 2주(1만원)으로 세팅해주시면 됩니다.',
  '장기 소규모 서버는 가동 주수에 따른 비용을 받지 않는 대신, 초기 세팅 비용이 1만원 청구됩니다.',
  '종류 불문, 자동봇 유지보수는 무기한 진행하며, 작업 종료 후 전달드리는 오픈채팅에서 진행합니다.',
  '며칠 전에도 작년 신청자님의 자동봇을 업데이트 해드렸습니다.',
];

/** 봇 타입 비교 표: 기본 / 기본&상점 / 기본&상점&스탯 */
export const COMPARE_COLUMNS = ['기본', '기본&상점', '기본&상점&스탯'];
export const COMPARE_ROWS: { feature: string; has: [boolean, boolean, boolean] }[] = [
  { feature: '구글 시트 연동', has: [true, true, true] },
  { feature: '[nDm]', has: [true, true, true] },
  { feature: '[운세]', has: [true, true, true] },
  { feature: '커스텀 명령어 [홀짝] [가위바위보] 등', has: [true, true, true] },
  { feature: '재화 시스템', has: [false, true, true] },
  { feature: '상점 & 인벤토리', has: [false, true, true] },
  { feature: '스탯 시스템', has: [false, false, true] },
  { feature: '[사용/아이템명]', has: [false, false, true] },
];
export const COMPARE_PRICES = ['₩15,000', '₩35,000', '₩45,000'];

/** 커스텀 명령어 예시. {중괄호} 부분은 강조 표시 */
export const CUSTOM_COMMAND_EXAMPLES = [
  { command: '패션', text: '오늘의 패션 점수는 {1d100}점입니다.' },
  { command: '능력치', text: '능력치는 민첩: {3d6} / 힘: {3d10+5} / 운: {1d100} 입니다.' },
  { command: '허기', text: '{시전자}{은는} 배가 고픕니다.' },
  { command: '허기', text: '배가 고픈 나머지 {시전자}{이가} 옆에 있던 친구를 잡아먹었습니다.' },
  { command: '허기', text: '여러분, {시전자}{을를} 굶기지 마세요.' },
  { command: '즐거운 발견', text: '당신은 {랜덤: 숟가락, 젓가락, 밥그릇, 깨진 유리}{을를} 찾아냈습니다!' },
];

export interface BotType {
  name: string;
  price: number;
  features: string[];
  note?: string;
}

export const BOT_TYPES: BotType[] = [
  {
    name: '기본 타입',
    price: 15000,
    features: [
      '구글 스프레드시트 연동',
      '[nDm] [랜덤/옵션, 옵션, 옵션...]',
      '[운세] 명령어와 기본 운세 문구 제공',
      '[가위바위보] [YN] 등 커스텀 명령어 기능 기본 제공',
    ],
  },
  {
    name: '기본&상점 타입',
    price: 35000,
    features: [
      '기본 타입에 포함된 모든 기능 +@',
      '구글 시트로 캐릭터, 재화, 인벤토리 관리 (운영진 수동 편집 지원)',
      '[소지금 추가/금액/캐릭터명] (운영진 명령어)',
      '[소지금 차감/금액/캐릭터명] (운영진 명령어)',
      '[상점] 아이템 목록 출력',
      '[구매/아이템명] 아이템 구매 시 재화 차감',
      '[가방] 인벤토리, 재화 확인',
    ],
  },
  {
    name: '기본&상점&스탯 타입',
    price: 45000,
    features: [
      '기본&상점 타입에 포함된 모든 기능 +@',
      '구글 시트로 캐릭터 스탯 관리 (운영진 수동 편집 지원)',
      '[▨▨ 변경/수치/캐릭터명] (운영진 명령어 / 예: 체력 변경)',
      '[사용/아이템명] 아이템 소모 후 캐릭터 스탯 변화. 운영진이 시트로 아이템 편집 가능',
    ],
  },
  {
    name: D100_BOT_NAME,
    price: 30000,
    features: [
      '크툴루 호러 탐사를 위한 필수품!',
      'D100 롤언더(기능치 이하 성공) 판정을 쓰는 TRPG용 자동봇',
      '봇과 연동된, 편집 가능한 플레이어 구글 시트 제공',
      '편집 가능한 커스텀 시트 + 랜덤표 시트 제공 (표 내용은 직접 입력)',
      '[nDm±k]',
      '기본 판정 [근력] [설득]',
      '보너스/페널티 다이스 [근력+1] [관찰력-2]',
      '판정, 피해 정산, 치명타가 모두 적용되는 무기 공격',
      '[랜덤/옵션, 옵션, 옵션] 여러 개의 옵션 중 하나를 랜덤 선택',
      '룰북 내 정보는 제공 X / 판정 기능만 제공 / 광기 목록 등은 직접 입력',
    ],
  },
  {
    name: TRPG_2D6_BOT_NAME,
    price: 80000,
    features: [
      '2D6 특기표 판정을 쓰는 J룰 TRPG용 자동봇 3종 세트',
      '특기를 체크하는 방식의 플레이어 구글 시트 제공',
      '편집 가능한 커스텀 시트 + 랜덤표 시트 제공',
      '[nDm±k] [nDm±k>=a] [xBy] [aSG@b#c±d>=e] [nDAm±k] 등 지원',
      '기본 판정 [특기명]',
      '보너스/페널티 다이스',
      '명령어를 통한 아이템 관리',
      '[랜덤/옵션, 옵션, 옵션] 여러 개의 옵션 중 하나를 랜덤 선택',
      '룰북 내 정보는 제공 X / 판정 기능만 제공 / 특기명, 광기표 등은 직접 입력',
      '일부만 선택해 설치 시 룰 당 3만원 (문의 요망)',
    ],
  },
  {
    name: INVESTIGATION_TYPE,
    price: 20000,
    features: [
      '[장소 목록] [진입/장소명] [조사/포인트명]',
      '장소 목록과 각 장소에서 조사할 수 있는 포인트 관리',
      '캐릭터 소지품 및 스탯과 연동 (특정 이벤트 발생 시 아이템 획득 / 체력 -5 등)',
    ],
  },
  {
    name: OMAKASE_TYPE,
    price: 0,
    features: [
      '복잡한 오마카세 봇의 경우 최대한 일찍 문의를 넣어주세요!',
      '진행이 가능할지 아닐지 판단한 후 신청서를 받고 있습니다.',
      '보내주실 내용: 시스템을 자세히 설명한 외부 문서 + 마감일 + 구동기간',
      '구현 난이도에 따라 여유로운 일정, 원활한 소통, 그리고 추가금이 필요할 수 있습니다.',
    ],
    note: '진행하지 않아요) 일반 레이드, 마스레이드, 포지션제 전투',
  },
];

export interface AdditionalOption {
  name: string;
  price: number;
  description?: string;
  aliases?: string[];
  priceLabel?: string;
  /** 단일 항목명 또는 "이 중 하나(any)" 배열 */
  requires?: string | string[];
  requiresLabel?: string;
}

const MAIN_LABEL = '기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나';
const SHOP_LABEL = '기본&상점 또는 기본&상점&스탯 타입';

export const ADDITIONAL_OPTIONS: AdditionalOption[] = [
  { name: '커스텀 명령어 업그레이드', price: 5000, aliases: ['기본 타입 - 커스텀 명령어 업그레이드', '기본&상점 타입 - 커스텀 명령어 업그레이드', '기본&상점&스탯 타입 - 커스텀 명령어 업그레이드'], requires: [...MAIN_BOT_TYPES], requiresLabel: MAIN_LABEL },
  { name: '재화, 아이템 양도 기능', price: 10000, aliases: ['양도 기능', '기본&상점 타입 - 양도 기능', '기본&상점&스탯 타입 - 양도 기능'], requires: [...SHOP_BOT_TYPES], requiresLabel: SHOP_LABEL },
  { name: '툿수-재화 자동반영', price: 10000, aliases: ['기본&상점 타입 - 툿수-재화 자동반영', '기본&상점&스탯 타입 - 툿수-재화 자동반영'], requires: [...SHOP_BOT_TYPES], requiresLabel: SHOP_LABEL },
  { name: '출석 시스템', price: 10000, description: '매일 [출석] 혹은 지정한 명령어를 사용하여 1회 출석 후 운영진이 지정한 재화 획득', requires: [...SHOP_BOT_TYPES], requiresLabel: SHOP_LABEL },
  { name: '예약 툿', price: 5000, requires: [...MAIN_BOT_TYPES], requiresLabel: MAIN_LABEL },
  { name: '스토리 자동 진행', price: 5000, requires: [...MAIN_BOT_TYPES], requiresLabel: MAIN_LABEL },
  { name: '일일 조사 횟수 제한', price: 5000, description: '[조사] 명령어 사용 시 1회 카운트', requires: INVESTIGATION_TYPE },
  { name: '특정 상황 DM 전송', price: 20000, description: '특정 상황에서 봇이 DM 전송 (ex. 체력이 50 이하로 떨어짐)' },
  { name: '빠른 마감 (48시간 내)', price: 0, priceLabel: '+200%', description: '총 금액의 200% 추가' },
  { name: '빠른 마감 (1주일 내)', price: 0, priceLabel: '+100%', description: '총 금액의 100% 추가' },
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
