/**
 * Navigation Types
 * ================
 * 
 * 네비게이션 관련 공통 타입 정의
 * App, Navigation, Footer 등에서 공유하여 사용합니다.
 * 
 * @author Longwhile Commission
 * @version 1.0.0
 */

/**
 * 애플리케이션 페이지 타입
 * URL hash와 1:1 매핑됩니다.
 */
export type PageType = 'home' | 'server' | 'bot' | 'estimate' | 'faq' | 'terms' | 'order';

/**
 * 네비게이션 콜백 함수 타입
 */
export type NavigateFunction = (page: PageType) => void;

/**
 * Navigation 컴포넌트 Props
 */
export interface NavigationProps {
  currentPage: PageType;
  onNavigate: NavigateFunction;
}

/**
 * Footer 컴포넌트 Props
 */
export interface FooterProps {
  onNavigate: NavigateFunction;
}

/**
 * 뒤로가기 버튼이 있는 컴포넌트의 공통 Props
 */
export interface BackNavigationProps {
  onBack: () => void;
}

/**
 * 메뉴 아이템 타입
 */
export interface MenuItem {
  id: PageType | string;
  label: string;
  badge?: number;
  isExternal?: boolean;
  url?: string;
}
