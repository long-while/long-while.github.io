/**
 * 라우팅 · SEO 상수
 * =================
 *
 * URL 경로(path)와 페이지 상태(PageType)의 매핑, 그리고 페이지별 메타데이터를
 * 한곳에서 관리합니다.
 *
 * 이 모듈은 브라우저 런타임과 빌드 타임 프리렌더(scripts/prerender.mjs) 양쪽에서
 * 사용되므로 window/document 등 브라우저 전용 API를 참조하면 안 됩니다.
 *
 * 경로 규칙: 홈은 '/', 나머지는 모두 슬래시로 끝납니다('/server/').
 * GitHub Pages 가 디렉터리 형태(`dist/server/index.html`)를 리다이렉트 없이
 * 그대로 서빙하기 때문에, 정규 URL(canonical)과 실제 URL 을 일치시키기 위함입니다.
 */
import type { PageType } from '@/app/types/navigation';

export const SITE_URL = 'https://longwhile.site';
export const SITE_NAME = '한참 커미션';
export const CONTACT_URL = 'https://crepe.cm/@longwhile';

export interface RouteMeta {
  page: PageType;
  /** 홈은 '/', 그 외에는 '/server/' 처럼 슬래시로 끝난다 */
  path: string;
  title: string;
  description: string;
  /** false 면 robots noindex 를 붙이고 sitemap 에서도 제외한다 */
  indexable: boolean;
}

/**
 * 실제 URL 을 가지는 페이지 목록.
 * faq/terms 는 홈 페이지 내 섹션이므로 별도 경로가 아니라 앵커(/#faq)로 다룬다.
 */
export const ROUTES: RouteMeta[] = [
  {
    page: 'home',
    path: '/',
    title: '마스토돈 서버 설치 커미션 | 한참 커미션',
    description:
      '자캐커뮤를 위한 마스토돈 서버 설치 커미션. GCP 기반 인스턴스 구축부터 트위터 UI 커스텀 테마, 오마카세 자동봇 세팅까지 한번에 맡기실 수 있습니다.',
    indexable: true,
  },
  {
    page: 'server',
    path: '/server/',
    title: '마스토돈 서버 설치 커미션 · 커스텀 테마 | 한참 커미션',
    description:
      '구글 클라우드 플랫폼(GCP)으로 마스토돈 서버를 설치해 드립니다. 인원수·기간별 서버비 계산기, 트위터 UI 테마, 로고 제작 옵션과 가격을 확인하세요.',
    indexable: true,
  },
  {
    page: 'bot',
    path: '/bot/',
    title: '마스토돈 자동봇 커미션 | 한참 커미션',
    description:
      '마스토돈 자캐커뮤용 자동봇 세팅 커미션. 오마카세·다이스·CoC 등 타입별 자동봇을 구글 시트 기반으로 세팅하고 사용법까지 안내해 드립니다.',
    indexable: true,
  },
  {
    // 이용자별 장바구니 화면이라 색인 대상이 아니다
    page: 'estimate',
    path: '/estimate/',
    title: '나의 견적 | 한참 커미션',
    description: '선택한 커미션 항목의 견적을 확인하고 신청서로 이어서 진행합니다.',
    indexable: false,
  },
  {
    // 신청서 폼. 검색 유입 가치가 없고 색인되면 혼선만 준다
    page: 'order',
    path: '/order/',
    title: '커미션 신청서 | 한참 커미션',
    description: '마스토돈 서버 설치와 자동봇 커미션 신청서를 작성합니다.',
    indexable: false,
  },
];

/** 홈 페이지 내 섹션 앵커 */
const HOME_ANCHORS: Partial<Record<PageType, string>> = {
  faq: '/#faq',
  terms: '/#terms',
};

const HOME_ROUTE = ROUTES[0];

export function routeForPage(page: PageType): RouteMeta {
  return ROUTES.find((route) => route.page === page) ?? HOME_ROUTE;
}

/** 경로 끝의 슬래시 유무 차이를 흡수한다 ('/server' → '/server/') */
export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function routeForPath(pathname: string): RouteMeta | undefined {
  const normalized = normalizePath(pathname);
  return ROUTES.find((route) => route.path === normalized);
}

/**
 * 링크(<a href>)에 사용할 URL.
 * faq/terms 는 홈의 섹션 앵커로, 나머지는 자기 경로로 연결한다.
 */
export function hrefForPage(page: PageType): string {
  return HOME_ANCHORS[page] ?? routeForPage(page).path;
}

/**
 * 현재 location 으로부터 페이지를 판별한다.
 * 구버전 해시 링크(#server 등)로 들어온 경우에도 해당 페이지로 인식한다.
 */
export function pageForLocation(pathname: string, hash: string): PageType {
  const legacyHash = hash.replace(/^#/, '');
  if (normalizePath(pathname) === '/' && legacyHash) {
    const legacyRoute = ROUTES.find((route) => route.page === legacyHash && route.page !== 'home');
    if (legacyRoute) return legacyRoute.page;
  }
  return routeForPath(pathname)?.page ?? 'home';
}

/** 구버전 해시 링크로 진입했는지 여부 (진입 시 1회 경로로 치환하기 위해 사용) */
export function isLegacyHashEntry(pathname: string, hash: string): boolean {
  const legacyHash = hash.replace(/^#/, '');
  if (!legacyHash || normalizePath(pathname) !== '/') return false;
  return ROUTES.some((route) => route.page === legacyHash && route.page !== 'home');
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
