/**
 * Clipboard Utilities with Fallback
 */

interface CopyResult {
  success: boolean;
  error: string | null;
  method: 'clipboard-api' | 'execCommand' | 'manual';
}

/**
 * 안전한 클립보드 복사 (폴백 포함)
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // 1차 시도: Clipboard API
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, error: null, method: 'clipboard-api' };
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }
  }

  // 2차 시도: execCommand (deprecated but fallback)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:-9999px;';
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const success = document.execCommand('copy');

    document.body.removeChild(textarea);

    if (success) {
      return { success: true, error: null, method: 'execCommand' };
    }
  } catch (err) {
    console.warn('execCommand copy failed:', err);
  }

  // 둘 다 실패
  return {
    success: false,
    error: '클립보드 복사에 실패했습니다. 텍스트를 직접 선택하여 복사해 주세요.',
    method: 'manual',
  };
}

/**
 * 클립보드 지원 여부 체크
 */
export function isClipboardSupported(): boolean {
  return !!(
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  );
}
