/**
 * 되돌리기 어려운 동작 전에 한 번 묻는 확인창 (리뷰: '아니오' 한 번에 입력이 사라지고, 계정 칸 추가가 바로 유료로 붙었다).
 */
import type { ReactNode } from 'react';
import { Button, Modal } from '@/app/components/ds';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = '취소', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} initialFocus="last"
      actions={
        <>
          <Button variant="white" size="lg" onClick={onCancel}>{cancelLabel}</Button>
          <Button size="lg" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="text-body2 text-text-secondary">{children}</div>
    </Modal>
  );
}
