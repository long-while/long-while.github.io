/**
 * 문서 메타데이터 갱신
 * ===================
 *
 * SPA 내부 이동 시에도 <title>/description/canonical 이 현재 페이지를 따라가도록
 * 갱신합니다. 최초 진입 시의 메타데이터는 빌드 타임 프리렌더(scripts/prerender.mjs)가
 * HTML 에 직접 박아 두므로, 이 함수는 이후 클라이언트 이동만 담당합니다.
 */
import { absoluteUrl, type RouteMeta } from '@/app/constants/seo';

function setMetaByName(name: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setRobots(indexable: boolean): void {
  const tag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (indexable) {
    tag?.remove();
    return;
  }
  setMetaByName('robots', 'noindex, follow');
}

export function applyRouteMeta(route: RouteMeta): void {
  if (typeof document === 'undefined') return;

  const url = absoluteUrl(route.path);

  document.title = route.title;
  setMetaByName('description', route.description);
  setCanonical(url);
  setRobots(route.indexable);
  setMetaByProperty('og:title', route.title);
  setMetaByProperty('og:description', route.description);
  setMetaByProperty('og:url', url);
}
