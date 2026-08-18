/**
 * SPA 내부 링크 헬퍼
 * =================
 *
 * 내부 이동은 <button> 이 아니라 실제 <a href> 로 노출해야 검색엔진이 링크를 따라가
 * 하위 페이지를 발견할 수 있습니다. 클릭 시에는 전체 새로고침 대신 SPA 이동을 하되,
 * 새 탭 열기(Ctrl/Cmd/가운데 클릭)는 브라우저 기본 동작에 맡깁니다.
 */
import type { MouseEvent } from 'react';
import { hrefForPage } from '@/app/constants/seo';
import type { NavigateFunction, PageType } from '@/app/types/navigation';

export interface NavLinkProps {
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function navLinkProps(page: PageType, onNavigate: NavigateFunction): NavLinkProps {
  return {
    href: hrefForPage(page),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      // 새 탭/새 창으로 여는 조작은 브라우저에 맡긴다
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      onNavigate(page);
    },
  };
}
