/**
 * 서버 커미션 옵션 (기존 ServerCommission.tsx 의 이름·설명 그대로, Q9).
 * name/estimateName 은 견적함 항목 이름이라 바꾸면 안 된다 (견적함·신청서 매핑에 쓰임).
 * 가격은 신청서 계산과 같은 PRICING_CONFIG 에서, 신청서 화면 이름도 이 파일에서 가져가 두 화면이 같은 이름·가격을 쓴다 (4단계 리뷰).
 */
import { PRICING_CONFIG } from '@/app/constants/form';
import type { AdditionalOption, FastDeadlineOption } from '@/app/types/order';

const PRICE = PRICING_CONFIG.server;

export const SEARCH_ITEM_NAME = '검색 기능';

export const INSTALL = {
  name: '마스토돈 서버 설치',
  price: PRICE.base,
  description: '자캐 커뮤에 특화된 한참 인스턴스를 설치합니다.',
};

export const THEME_OPTIONS = [
  { name: '테마 전체 커스텀', price: PRICE.options.bothTheme, kind: 'theme', description: '낮/밤 2종의 전반적인 색상테마+로고+배경 변경. 로고, 배경 PNG 필요.' },
  { name: '테마 1종 커스텀', price: PRICE.options.dayTheme, kind: 'theme', description: '낮/밤 택 1종의 전반적인 색상테마+로고+배경 변경.' },
  { name: '로고만 변경', price: PRICE.options.logo, kind: 'logo', description: '트위터 테마에 로고만 바꾸는 옵션. 로고 PNG 파일 필요. 규격은 신청 후 안내드립니다.' },
] as const;

/** 신청서 STEP2·요약·STEP4 에서 쓰는 커스텀 옵션 이름 (서버 페이지와 같은 이름, 테마 1종은 낮/밤을 고름) */
export const THEME_CHOICE_LABEL: Record<NonNullable<AdditionalOption>, string> = {
  logo: '로고만 변경',
  dayTheme: '테마 1종 커스텀 (낮 테마)',
  nightTheme: '테마 1종 커스텀 (밤 테마)',
  bothTheme: '테마 전체 커스텀 (낮/밤 2종)',
};

export const ADDITIONAL_OPTIONS = [
  { name: '툿 글자수 제한 변경', price: PRICE.addons.characterLimit, description: '기본 공백포함 1000자.' },
  { name: SEARCH_ITEM_NAME, price: PRICE.addons.search, description: '단어 단위 검색. 팔로우 중인 유저의 툿+멘션에서 찾아 결과를 반환합니다.' },
  { name: 'masto.host 에서 서버 데이터 이전', price: PRICE.addons.mastoHostMigration, description: '팔로우 관계, 텍스트 데이터, 이미지 등 모든 정보를 기존 서버에서 새로운 서버로 옮겨드립니다.' },
];

/** 빠른마감은 하나만, 고른 테마에 맞는 것만 (fits: 테마 없음 none / 로고 logo / 테마 theme) — 신청서 마감 임박 규칙과 같다 */
export const RUSH_OPTIONS = [
  { estimateName: '빠른마감: 48시간 내 기본 서버 설치', orderValue: 'basic48h', fits: 'none', displayName: '48시간 내 기본 서버 설치 마감', price: PRICE.addons.fastDeadline.basic48h, description: '결제 요청 시각으로부터 48시간 내에 기본 옵션 서버를 설치합니다.' },
  { estimateName: '빠른마감: 24시간 내 기본 서버 설치', orderValue: 'basic24h', fits: 'none', displayName: '24시간 내 기본 서버 설치 마감', price: PRICE.addons.fastDeadline.basic24h, description: '결제 요청 시각으로부터 24시간 내에 기본 옵션 서버를 설치합니다.' },
  { estimateName: '빠른마감: 48시간 내 로고 변경 서버 설치', orderValue: 'logo48h', fits: 'logo', displayName: '48시간 내 로고 변경된 서버 설치 마감', price: PRICE.addons.fastDeadline.logo48h, description: '결제 요청 시각으로부터 48시간 내에 로고 변경 옵션 서버를 설치합니다.' },
  { estimateName: '빠른마감: 48시간 내 테마 커스텀 서버 설치', orderValue: 'theme48h', fits: 'theme', displayName: '48시간 내 테마 커스텀된 서버 설치 마감', price: PRICE.addons.fastDeadline.theme48h, description: '결제 요청 시각으로부터 48시간 내에 커스텀 테마 옵션 서버를 설치합니다.' },
] as const;

/** 신청서에서 쓰는 빠른마감 이름 (서버 페이지와 같은 이름) */
export const RUSH_LABEL = Object.fromEntries(RUSH_OPTIONS.map((o) => [o.orderValue, o.displayName])) as Record<NonNullable<FastDeadlineOption>, string>;
