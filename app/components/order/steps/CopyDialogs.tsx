/**
 * STEP4 복사 흐름 화면 (Q7) — 시안 '신청서 - STEP04-복사 완료 모달' / '-복사 실패 안내' / '-이동 후 안내띠' (330:2502, 330:2778, 330:2640).
 *  모달은 ds Modal(532): 제목 → 부제(파랑) → 회색 상자(복사한 내용) → 버튼 2개(흰 + 파랑).
 *  안내띠는 ds Banner, 화면 위(헤더 아래)에 붙어 따라온다 (지시: 상단 안내띠. 헤더와 겹치지 않게 top-below-header).
 */
import { useEffect, useRef, useState } from 'react';
import { Banner, Button, Icon, Modal } from '@/app/components/ds';
import type { useCopyFlow } from './useCopyFlow';

type Flow = ReturnType<typeof useCopyFlow>;

const PREVIEW_LINES = 8;

function CopyTextBox({ text, initiallyOpen, selectOnOpen }: { text: string; initiallyOpen: boolean; selectOnOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const lines = text.split('\n');
  // 복사 실패 시에는 원문을 바로 전체 선택해 둔다 (사용자는 Ctrl+C 만 누르면 된다)
  useEffect(() => {
    if (open && selectOnOpen) {
      areaRef.current?.focus();
      areaRef.current?.select();
    }
  }, [open, selectOnOpen]);
  return (
    <div className="flex flex-col gap-3 rounded-input bg-background-100 p-5">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex items-center justify-between gap-2 text-left text-title5 text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
        복사한 내용 다시 보기
        <Icon name="chevron-down" size={20} className={open ? 'shrink-0 rotate-180 text-text-disabled transition-transform' : 'shrink-0 text-text-disabled transition-transform'} />
      </button>
      {open ? (
        <textarea ref={areaRef} readOnly value={text} rows={6} aria-label="신청서 복사 내용" onFocus={(e) => e.currentTarget.select()}
          className="form-input resize-y font-mono text-body3" />
      ) : (
        <p className="whitespace-pre-line text-body3 text-text-secondary">
          {lines.slice(0, PREVIEW_LINES).join('\n')}
          {lines.length > PREVIEW_LINES && '\n...'}
        </p>
      )}
    </div>
  );
}

/**
 * text: 실제 복사한 원문(실패 시 직접 복사용). maskedText: 화면 확인용(구글 비밀번호를 가린 것).
 * 복사 완료 모달·다시 보기에는 비밀번호를 보이지 않는다 (Q16 범위 밖이지만 새 화면 위치에 노출하지 않기 위해).
 */
export function CopyDialogs({ flow, text, maskedText }: { flow: Flow; text: string; maskedText: string }) {
  const { dialog, countdown } = flow;
  return (
    <>
      <Modal
        open={dialog === 'copied' || dialog === 'review'}
        onClose={flow.closeDialog}
        title="복사가 완료되었습니다"
        subtitle={
          dialog === 'copied' && countdown !== null ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
              {countdown}초 후 크레페로 자동 이동합니다
              <button type="button" onClick={flow.cancelRedirect} className="text-body3 text-text-secondary underline underline-offset-2 hover:text-text-primary">
                자동 이동 취소
              </button>
            </span>
          ) : undefined
        }
        initialFocus="last"
        actions={
          <>
            <Button variant="white" size="lg" onClick={flow.copiedManually}>직접 복사했어요</Button>
            <Button size="lg" onClick={flow.openCrepe}>크레페로 이동하기</Button>
          </>
        }
      >
        <CopyTextBox text={maskedText} initiallyOpen={dialog === 'review'} />
      </Modal>

      <Modal
        open={dialog === 'failed'}
        onClose={flow.closeDialog}
        icon={<Icon name="warning" size={28} className="shrink-0 text-error-500" />}
        title="복사에 실패했습니다"
        actions={
          <>
            <Button variant="white" size="lg" onClick={flow.copiedManually}>직접 복사했어요</Button>
            <Button size="lg" onClick={flow.copy} disabled={flow.isCopying}>다시 시도</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {flow.error && <p className="text-body3 text-text-secondary">{flow.error}</p>}
          <CopyTextBox text={text} initiallyOpen selectOnOpen />
        </div>
      </Modal>
    </>
  );
}

export function MoveBanner({ flow }: { flow: Flow }) {
  if (!flow.showBanner) return null;
  return (
    <div className="sticky top-below-header z-30">
      <Banner
        className="shadow-card"
        title="복사가 완료되었습니다"
        description="아직 크레페로 이동하지 않으셨다면, 오른쪽 버튼을 눌러 이동해 주세요."
        actions={
          <>
            <Button variant="white" size="md" onClick={flow.review}>복사한 내용 다시 보기</Button>
            <Button size="md" onClick={flow.openCrepe}>크레페로 이동하기</Button>
          </>
        }
      />
    </div>
  );
}
