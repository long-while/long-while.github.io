/**
 * Icon Components
 * ===============
 * 
 * 재사용 가능한 SVG 아이콘 컴포넌트 모음
 * 각 아이콘은 className을 통해 크기와 색상을 조절할 수 있습니다.
 * 
 * @example
 * import { ArrowRightIcon, ChevronDownIcon } from '@/app/components/icons';
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
 * 아래쪽 화살표 아이콘
 * 스크롤 힌트 등에 사용
 */
export function ArrowDownIcon({ className = 'w-6 h-6', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M19 14l-7 7m0 0l-7-7m7 7V3" 
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
 * 체크 아이콘
 * 성공 상태, 완료 표시 등에 사용
 */
export function CheckIcon({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M5 13l4 4L19 7" 
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
 * 정보 아이콘 (i)
 * 안내 메시지, 툴팁 등에 사용
 */
export function InfoIcon({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );
}

/**
 * 경고 아이콘 (!)
 * 경고 메시지에 사용
 */
export function WarningIcon({ className = 'w-5 h-5', strokeWidth = 2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
      />
    </svg>
  );
}
