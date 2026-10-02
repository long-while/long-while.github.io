/**
 * 디자인 시스템 공통 클래스 조각.
 * 모든 값은 styles/design-tokens.css 의 토큰을 쓴다 (design/prep/tokens.md).
 */

/** 키보드 포커스 표시. 마우스 클릭에는 나타나지 않는다. */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** 어두운 배경 위의 포커스 표시 */
export const focusRingInverse =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse';

/** 화면에는 안 보이고 보조기기에는 읽히는 텍스트 */
export const srOnly = 'sr-only';
