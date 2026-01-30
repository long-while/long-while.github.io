/**
 * Error Type Definitions
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ErrorCategory =
  | 'validation'
  | 'network'
  | 'storage'
  | 'clipboard'
  | 'unknown';

export interface AppError {
  id: string;
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  field?: string;
  timestamp: number;
  context?: Record<string, unknown>;
  recoverable: boolean;
  recoveryAction?: () => void;
}

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export const ErrorCodes = {
  // Validation
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_EMAIL_INVALID: 'VALIDATION_EMAIL_INVALID',
  VALIDATION_DATE_ORDER: 'VALIDATION_DATE_ORDER',
  VALIDATION_CHAR_LIMIT: 'VALIDATION_CHAR_LIMIT',
  VALIDATION_EMOJI_NOT_ALLOWED: 'VALIDATION_EMOJI_NOT_ALLOWED',

  // Storage
  STORAGE_SAVE_FAILED: 'STORAGE_SAVE_FAILED',
  STORAGE_LOAD_FAILED: 'STORAGE_LOAD_FAILED',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',

  // Clipboard
  CLIPBOARD_NOT_SUPPORTED: 'CLIPBOARD_NOT_SUPPORTED',
  CLIPBOARD_PERMISSION_DENIED: 'CLIPBOARD_PERMISSION_DENIED',

  // Network
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',

  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const;
