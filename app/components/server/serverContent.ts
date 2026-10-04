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
  { name: '커스텀 테마 2종', price: PRICE.options.bothTheme, kind: 'theme', description: '낮/밤 2종의 색상, 로고, 배경 변경' },
  { name: '커스텀 테마 1종', price: PRICE.options.dayTheme, kind: 'theme', description: '낮/밤 중 1종의 색상, 로고, 배경 변경' },
  { name: '로고만 변경', price: PRICE.options.logo, kind: 'logo', description: '기본 트위터 테마에서 로고만 바꿔요.' },
] as const;

/** 신청서 STEP2·요약·STEP4 에서 쓰는 커스텀 옵션 이름 (서버 페이지와 같은 이름, 테마 1종은 낮/밤을 고름) */
export const THEME_CHOICE_LABEL: Record<NonNullable<AdditionalOption>, string> = {
  logo: '로고만 변경',
  dayTheme: '커스텀 라이트 테마',
  nightTheme: '커스텀 다크 테마',
  bothTheme: '커스텀 라이트+다크 테마',
};

// 순서: 검색 / 글자수 / 데이터 이전 (4단계 사용자 요청)
export const ADDITIONAL_OPTIONS = [
  { name: SEARCH_ITEM_NAME, price: PRICE.addons.search, description: '팔로우한 유저의 툿과 멘션에서 단어로 검색해요.' },
  { name: '툿 글자수 제한 변경', price: PRICE.addons.characterLimit, description: '기본 1000자(공백 포함)에서 원하는 글자수로 바꿔요.' },
  { name: 'masto.host 에서 서버 데이터 이전', price: PRICE.addons.mastoHostMigration, description: '팔로우 관계, 텍스트 데이터, 이미지 등 모든 정보를 기존 서버에서 새로운 서버로 옮겨드립니다.' },
];

/** 옵션 이름이 곧 설명이라 설명 줄은 두지 않는다 (4단계 문구 정리). 빠른마감은 하나만, 고른 테마에 맞는 것만 (fits: 테마 없음 none / 로고 logo / 테마 theme) — 신청서 마감 임박 규칙과 같다 */
// 순서: 24시간 기본 / 48시간 기본 / 48시간 로고 / 48시간 테마 (4단계 사용자 요청)
export const RUSH_OPTIONS = [
  { estimateName: '빠른마감: 24시간 내 기본 서버 설치', orderValue: 'basic24h', fits: 'none', displayName: '24시간 내 기본 서버 설치 마감', price: PRICE.addons.fastDeadline.basic24h },
  { estimateName: '빠른마감: 48시간 내 기본 서버 설치', orderValue: 'basic48h', fits: 'none', displayName: '48시간 내 기본 서버 설치 마감', price: PRICE.addons.fastDeadline.basic48h },
  { estimateName: '빠른마감: 48시간 내 로고 변경 서버 설치', orderValue: 'logo48h', fits: 'logo', displayName: '48시간 내 로고 변경된 서버 설치 마감', price: PRICE.addons.fastDeadline.logo48h },
  { estimateName: '빠른마감: 48시간 내 테마 커스텀 서버 설치', orderValue: 'theme48h', fits: 'theme', displayName: '48시간 내 테마 커스텀된 서버 설치 마감', price: PRICE.addons.fastDeadline.theme48h },
] as const;

/** 신청서에서 쓰는 빠른마감 이름 (서버 페이지와 같은 이름) */
export const RUSH_LABEL = Object.fromEntries(RUSH_OPTIONS.map((o) => [o.orderValue, o.displayName])) as Record<NonNullable<FastDeadlineOption>, string>;
