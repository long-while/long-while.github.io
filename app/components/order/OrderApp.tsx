/**
 * 신청서 (/order/) 껍데기 — 시안 '신청서 - STEP01~04' 공통 (334:2616 등, file.json 실측).
 *  바탕 #F6F7F8, 헤더 아래 100 → 흰 카드(OrderForm) → 120 → 푸터.
 *  견적 반영 다이얼로그는 시안 '신청서 팝업창'(324:8175) 대로 ds Modal, 초안 복원 다이얼로그도 같은 모양 (Q8).
 *  두 다이얼로그 모두 고르지 않고 닫는 길(Esc)은 지우지 않는 쪽(기존 신청서 유지 / 이어서 작성)으로 처리한다.
 */
import { useEffect, useState } from 'react';
import { OrderProvider, useOrder } from '@/app/contexts/OrderContext';
import { Button, Modal, SiteFooter, SiteHeader } from '@/app/components/ds';
import OrderForm from './OrderForm';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import { loadSyncState } from '@/app/utils/cartOrderSync';

interface OrderContentProps {
  onNavigate: (page: string) => void;
}

// localStorage에서 견적 데이터 불러오기
function loadEstimateFromStorage(): EstimateItem[] {
  try {
    const stored = localStorage.getItem('mas_commission_estimate');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('견적 데이터 불러오기 실패:', error);
  }
  return [];
}

function RestoreDialog({ open, onRestore, onStartNew }: { open: boolean; onRestore: () => void; onStartNew: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onRestore}
      closeOnOverlay={false}
      showClose={false}
      initialFocus="last"
      title="작성 중인 내용 발견"
      subtitle="이전에 작성하던 신청서가 있습니다. 계속 작성하시겠습니까?"
      actions={
        <>
          <Button variant="white" size="lg" onClick={onStartNew}>새로 작성</Button>
          <Button size="lg" onClick={onRestore}>이어서 작성</Button>
        </>
      }
    />
  );
}

function SyncDialog({ open, onOverwrite, onKeep }: { open: boolean; onOverwrite: () => void; onKeep: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onKeep}
      closeOnOverlay={false}
      showClose={false}
      initialFocus="last"
      title="견적 데이터 반영"
      subtitle="견적에서 선택한 항목을 신청서에 반영하시겠습니까?"
      actions={
        <>
          <Button variant="white" size="lg" onClick={onKeep}>기존 신청서 유지</Button>
          <Button size="lg" onClick={onOverwrite}>견적으로 새로 작성</Button>
        </>
      }
    >
      <p>이전에 작성하던 신청서가 있습니다. 견적 데이터로 덮어쓰거나 기존 신청서를 유지할 수 있습니다.</p>
    </Modal>
  );
}

function OrderContent({ onNavigate }: OrderContentProps) {
  const { loadFromLocalStorage, resetForm, syncFromCart } = useOrder();
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  useEffect(() => {
    // 장바구니에서 넘어온 경우 (동기화 상태 확인)
    const syncState = loadSyncState();
    const hasSavedData = localStorage.getItem('mas_commission_order_draft');

    if (syncState?.synced) {
      if (hasSavedData) {
        // 기존 신청서가 있는 경우 선택 다이얼로그 표시
        setShowSyncDialog(true);
      } else {
        // 기존 신청서가 없으면 바로 동기화
        syncFromCart(loadEstimateFromStorage());
      }
    } else if (hasSavedData) {
      // 장바구니에서 넘어온 게 아니고 기존 데이터가 있는 경우
      setShowRestoreDialog(true);
    }
  }, [syncFromCart]);

  const handleRestore = () => {
    if (loadFromLocalStorage()) setShowRestoreDialog(false);
  };

  const handleStartNew = () => {
    resetForm();
    setShowRestoreDialog(false);
  };

  // 장바구니 데이터로 덮어쓰기
  const handleSyncOverwrite = () => {
    resetForm();
    syncFromCart(loadEstimateFromStorage());
    setShowSyncDialog(false);
  };

  // 기존 신청서 유지
  const handleKeepExisting = () => {
    loadFromLocalStorage();
    setShowSyncDialog(false);
  };

  return (
    <div className="min-h-screen bg-background-100">
      <SiteHeader currentPage="order" onNavigate={onNavigate} />
      <main className="pt-header">
        <div className="container-ds pb-[60px] pt-6 lg:pb-[120px] lg:pt-[100px]">
          <OrderForm />
        </div>
      </main>
      <RestoreDialog open={showRestoreDialog} onRestore={handleRestore} onStartNew={handleStartNew} />
      <SyncDialog open={showSyncDialog} onOverwrite={handleSyncOverwrite} onKeep={handleKeepExisting} />
      <SiteFooter onNavigate={onNavigate} flush />
    </div>
  );
}

interface OrderAppProps {
  onNavigate: (page: string) => void;
}

export default function OrderApp({ onNavigate }: OrderAppProps) {
  return (
    <OrderProvider>
      <OrderContent onNavigate={onNavigate} />
    </OrderProvider>
  );
}
