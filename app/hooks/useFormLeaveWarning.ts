import { useEffect } from 'react';

/**
 * 폼 이탈 경고 훅
 * 사용자가 페이지를 떠나려 할 때 경고를 표시합니다.
 */
export function useFormLeaveWarning(isDirty: boolean, message?: string) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message || '작성 중인 내용이 있습니다. 페이지를 떠나시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);
}
