/**
 * Icon Components
 * ===============
 * 
 * 재사용 가능한 SVG 아이콘 컴포넌트 모음
 * 각 아이콘은 className을 통해 크기와 색상을 조절할 수 있습니다.
 * 
 * @example
 * import { ArrowRightIcon } from '@/app/components/icons';
 * <ArrowRightIcon className="w-5 h-5 text-brand" />
 */

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

/**
 * 오른쪽 화살표 아이콘
 * CTA 버튼, 링크 등에 사용
 */
export function ArrowRightIcon({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M13 7l5 5m0 0l-5 5m5-5H6" 
      />
    </svg>
  );
}

/**
 * 햄버거 메뉴 아이콘
 * 모바일 네비게이션 토글에 사용
 */
export function MenuIcon({ className = 'w-6 h-6', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M4 6h16M4 12h16M4 18h16" 
      />
    </svg>
  );
}

/**
 * 닫기 (X) 아이콘
 * 모달, 메뉴 닫기 등에 사용
 */
export function CloseIcon({ className = 'w-6 h-6', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );
}

/**
 * 외부 링크 아이콘
 * 새 탭에서 열리는 링크에 사용
 */
export function ExternalLinkIcon({ className = 'w-4 h-4', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
      />
    </svg>
  );
}

/**
 * 장바구니 아이콘
 * 견적/장바구니 관련 기능에 사용
 */
export function ShoppingCartIcon({ className = 'w-6 h-6', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
      />
    </svg>
  );
}
