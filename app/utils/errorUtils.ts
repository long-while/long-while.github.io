/**
 * Error Utilities
 * 에러 처리 유틸리티
 */

import type { AppError, ErrorSeverity, RecoveryAction } from '@/app/types/errors';
import { ERROR_MESSAGES } from '@/app/types/errors';

/**
 * AppError 타입 가드
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'userMessage' in error
  );
}

/**
 * DOMException을 AppError로 변환
 */
function normalizeDOMException(error: DOMException, timestamp: string): AppError {
  const codeMap: Record<string, string> = {
    QuotaExceededError: 'STORAGE_QUOTA_EXCEEDED',
    SecurityError: 'STORAGE_ACCESS_DENIED',
    NotAllowedError: 'CLIPBOARD_DENIED',
  };

  const code = codeMap[error.name] || 'UNKNOWN';
  const config = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;

  return {
    code,
    message: error.message,
    userMessage: config.message,
    severity: config.severity,
    recoveryAction: config.recovery,
    originalError: error,
    timestamp,
  };
}

/**
 * 다양한 형태의 에러를 AppError로 정규화
 */
export function normalizeError(error: unknown): AppError {
  const timestamp = new Date().toISOString();

  // 이미 AppError인 경우
  if (isAppError(error)) {
    return { ...error, timestamp };
  }

  // DOMException 처리 (Storage, Clipboard 등)
  if (error instanceof DOMException) {
    return normalizeDOMException(error, timestamp);
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message,
      userMessage: ERROR_MESSAGES.UNKNOWN.message,
      severity: 'error',
      recoveryAction: 'REFRESH',
      originalError: error,
      timestamp,
    };
  }

  // 문자열 에러
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error,
      userMessage: error,
      severity: 'error',
      recoveryAction: 'NONE',
      timestamp,
    };
  }

  // 기타
  return {
    code: 'UNKNOWN',
    message: String(error),
    userMessage: ERROR_MESSAGES.UNKNOWN.message,
    severity: 'error',
    recoveryAction: 'REFRESH',
    timestamp,
  };
}

/**
 * 에러 생성 헬퍼
 */
export function createAppError(
  code: string,
  overrides?: Partial<AppError>
): AppError {
  const config = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;

  return {
    code,
    message: config.message,
    userMessage: config.message,
    severity: config.severity,
    recoveryAction: config.recovery,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 에러 심각도에 따른 스타일 반환
 */
export function getErrorStyles(severity: ErrorSeverity): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
} {
  switch (severity) {
    case 'info':
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-700',
        icon: 'info',
      };
    case 'warning':
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700',
        icon: 'warning',
      };
    case 'error':
    case 'critical':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-700',
        icon: 'error',
      };
    default:
      return {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-500',
        textColor: 'text-gray-700',
        icon: 'info',
      };
  }
}
