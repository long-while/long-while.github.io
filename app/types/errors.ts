/**
 * Error Type Definitions
 * 에러 타입 정의
 */

/**
 * 에러 심각도 레벨
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * 에러 복구 가능 여부
 */
export type RecoveryAction =
  | 'RETRY'           // 재시도 가능
  | 'REFRESH'         // 페이지 새로고침 필요
  | 'CLEAR_DATA'      // 데이터 초기화 필요
  | 'CONTACT_SUPPORT' // 지원 문의 필요
  | 'NONE';           // 자동 복구 또는 무시

/**
 * 통합 에러 인터페이스
 */
export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  recoveryAction: RecoveryAction;
  field?: string;
  originalError?: Error;
  timestamp?: string;
  context?: Record<string, unknown>;
}

/**
 * 에러 코드 -> 사용자 메시지 매핑
 */
export const ERROR_MESSAGES: Record<string, { message: string; severity: ErrorSeverity; recovery: RecoveryAction }> = {
  // Storage 관련
  STORAGE_QUOTA_EXCEEDED: {
    message: '저장 공간이 부족합니다. 브라우저 캐시를 정리하거나 시크릿 모드를 해제해주세요.',
    severity: 'error',
    recovery: 'CLEAR_DATA',
  },
  STORAGE_ACCESS_DENIED: {
    message: '브라우저가 데이터 저장을 차단했습니다. 쿠키 및 사이트 데이터 설정을 확인해주세요.',
    severity: 'error',
    recovery: 'NONE',
  },
  STORAGE_CORRUPTED: {
    message: '저장된 데이터가 손상되었습니다. 새로 작성해주세요.',
    severity: 'warning',
    recovery: 'CLEAR_DATA',
  },

  // Clipboard 관련
  CLIPBOARD_DENIED: {
    message: '클립보드 접근이 차단되었습니다. 브라우저 권한을 확인하거나 수동으로 복사해주세요.',
    severity: 'warning',
    recovery: 'NONE',
  },
  CLIPBOARD_FAILED: {
    message: '복사에 실패했습니다. 다시 시도해주세요.',
    severity: 'error',
    recovery: 'RETRY',
  },

  // Validation 관련
  VALIDATION_FAILED: {
    message: '입력 정보를 확인해주세요.',
    severity: 'warning',
    recovery: 'NONE',
  },

  // 성공 메시지
  COPY_SUCCESS: {
    message: '신청서가 클립보드에 복사되었습니다.',
    severity: 'info',
    recovery: 'NONE',
  },

  // 기본값
  UNKNOWN: {
    message: '예상치 못한 오류가 발생했습니다. 페이지를 새로고침 해주세요.',
    severity: 'error',
    recovery: 'REFRESH',
  },
};
