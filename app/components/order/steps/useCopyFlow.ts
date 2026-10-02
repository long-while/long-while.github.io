/**
 * STEP4 복사 → 크레페 이동 흐름 (Q7).
 *  복사 성공: '복사 완료' 모달 + 5초 카운트다운 → 크레페 새 탭 1번 → 모달 닫고 '이동 후 안내띠'.
 *  자동 이동 취소: 카운트다운만 멈추고 모달은 그대로(직접 이동 버튼 사용).
 *  복사 실패: 경고 모달에 원문(전체 선택된 상태) + '다시 시도' / '직접 복사했어요'(→ 안내띠).
 *  팝업 차단: window.open 이 창을 못 열면(null) 그래도 안내띠로 이어져 버튼으로 다시 열 수 있다.
 *  두 번 이동 막기: 실제 여는 일은 openCrepe 한 곳에서만, 상태 갱신 함수 밖에서 한다(개발 모드 StrictMode 에서도 1번).
 *   자동 이동은 '이번 복사에서 아직 안 열었을 때'만. 카운트다운 중 탭을 떠나면(hidden) 자동 이동을 취소하고 안내띠로 바꾼다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '@/app/utils/clipboard';

export const CREPE_URL = 'https://crepe.cm/@longwhile/lw5w0ofg';
export const REDIRECT_SECONDS = 5;

export type CopyDialog = 'none' | 'copied' | 'failed' | 'review';

export function useCopyFlow(copyText: string) {
  const [dialog, setDialog] = useState<CopyDialog>('none');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  /** 이번 복사에서 이미 크레페를 열었는지 (자동·직접 이동이 겹쳐 두 번 열리지 않게) */
  const openedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCountdown(null);
  }, []);

  useEffect(() => stopCountdown, [stopCountdown]);

  /** 크레페 새 탭 열기. 팝업이 막혀도 안내띠로 이어진다 */
  const openCrepe = useCallback(() => {
    stopCountdown();
    openedRef.current = true;
    // noopener 를 features 로 주면 성공해도 null 이 돌아와 차단 여부를 알 수 없어서, 연 뒤 opener 를 끊는다
    const win = window.open(CREPE_URL, '_blank');
    if (win) win.opener = null;
    setDialog('none');
    setShowBanner(true);
  }, [stopCountdown]);

  // 카운트다운이 0이 되면 아직 안 열었을 때만 연다 (상태 갱신 함수 밖)
  useEffect(() => {
    if (countdown !== 0) return;
    if (!openedRef.current) openCrepe();
    else stopCountdown();
  }, [countdown, openCrepe, stopCountdown]);

  // 카운트다운 중 다른 탭으로 가면 자동 이동을 취소하고, 돌아왔을 때 안내띠로 이어지게 한다
  useEffect(() => {
    if (countdown === null) return;
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden') return;
      stopCountdown();
      setDialog('none');
      setShowBanner(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [countdown, stopCountdown]);

  const startCountdown = useCallback(() => {
    stopCountdown();
    setCountdown(REDIRECT_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
  }, [stopCountdown]);

  const copy = useCallback(async () => {
    setIsCopying(true);
    setError(null);
    const result = await copyToClipboard(copyText);
    setIsCopying(false);
    if (result.success) {
      openedRef.current = false;
      setCopySuccess(true);
      setShowBanner(false);
      setDialog('copied');
      startCountdown();
      return;
    }
    stopCountdown();
    setError(result.error);
    setDialog('failed');
  }, [copyText, startCountdown, stopCountdown]);

  /** '직접 복사했어요': 모달을 닫고 안내띠에서 직접 이동하게 한다 */
  const copiedManually = useCallback(() => {
    stopCountdown();
    setDialog('none');
    setShowBanner(true);
  }, [stopCountdown]);

  const closeDialog = useCallback(() => {
    // 성공 모달을 닫으면(Esc 등) 자동 이동도 멈추고 안내띠로
    if (dialog === 'copied' || dialog === 'failed') copiedManually();
    else setDialog('none');
  }, [dialog, copiedManually]);

  return {
    dialog, countdown, showBanner, error, isCopying, copySuccess,
    copy, openCrepe, cancelRedirect: stopCountdown, copiedManually, closeDialog,
    review: () => setDialog('review'),
  };
}
