import { useEffect, useState } from 'react';
import { OrderProvider, useOrder } from '@/app/contexts/OrderContext';
import { SiteFooter, SiteHeader } from '@/app/components/ds';
import OrderForm from './OrderForm';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import { loadSyncState } from '@/app/utils/cartOrderSync';
import { LightbulbOn, FileText, ShoppingBasket } from 'griddy-icons';

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

function OrderContent({ onNavigate }: OrderContentProps) {
  const { loadFromLocalStorage, resetForm, syncFromCart } = useOrder();
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  useEffect(() => {
    // 장바구니에서 넘어온 경우 (동기화 상태 확인)
    const syncState = loadSyncState();
    const hasSavedData = localStorage.getItem('mas_commission_order_draft');
    
    if (syncState?.synced) {
      // 동기화 대기 상태인 경우
      if (hasSavedData) {
        // 기존 신청서가 있는 경우 선택 다이얼로그 표시
        setShowSyncDialog(true);
      } else {
        // 기존 신청서가 없으면 바로 동기화
        const cartItems = loadEstimateFromStorage();
        syncFromCart(cartItems);
      }
    } else if (hasSavedData) {
      // 장바구니에서 넘어온 게 아니고 기존 데이터가 있는 경우
      setShowRestoreDialog(true);
    }
  }, [syncFromCart]);

  const handleRestore = () => {
    const restored = loadFromLocalStorage();
    if (restored) {
      setShowRestoreDialog(false);
    }
  };

  const handleStartNew = () => {
    resetForm();
    setShowRestoreDialog(false);
  };

  // 장바구니 데이터로 덮어쓰기
  const handleSyncOverwrite = () => {
    resetForm();
    const cartItems = loadEstimateFromStorage();
    syncFromCart(cartItems);
    setShowSyncDialog(false);
  };

  // 기존 신청서 유지
  const handleKeepExisting = () => {
    loadFromLocalStorage();
    setShowSyncDialog(false);
  };

  return (
    <div className="min-h-screen bg-background-white">
      <SiteHeader currentPage="order" onNavigate={onNavigate} />

      <div className="pt-header pb-16">
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-br from-brand-50 via-brand-50 to-white border-b border-border py-12 relative overflow-hidden">
          {/* 장식 요소 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

          <div className="max-w-[700px] mx-auto px-4 relative z-10">
            <h1 className="text-[25px] md:text-[29px] font-bold mb-6 text-center">
              커미션 신청서 작성
            </h1>
            
            {/* 단계별 안내 - 온보딩 모달 스타일 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-background-white rounded-lg border border-border">
                <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-text-inverse font-bold text-[12px] shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-[14px] mb-0.5">아래 신청서 작성하기</h3>
                  <p className="text-[12px] text-foreground/60">
                    신청자 정보, 서버 설치, 자동봇 옵션을 입력해요.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background-white rounded-lg border border-border">
                <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-text-inverse font-bold text-[12px] shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-[14px] mb-0.5">4단계에서 신청서 복사하기</h3>
                  <p className="text-[12px] text-foreground/60">
                    최종 확인 후 신청서 내용을 클립보드에 복사해요.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background-white rounded-lg border border-border">
                <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-text-inverse font-bold text-[12px] shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-[14px] mb-0.5">크레페 신청서 제출하기</h3>
                  <p className="text-[12px] text-foreground/60">
                    크레페로 이동한 후, 신청하기 버튼을 누르고 복사한 내용을 제출해요.
                  </p>
                </div>
              </div>
            </div>

            {/* 안내 배지 */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand text-[12px] rounded-full border border-brand">
                <LightbulbOn size={14} color="currentColor" />
                <span>작성 중인 내용은 자동으로 저장됩니다</span>
              </div>
            </div>
          </div>
        </div>

        {/* 복원 다이얼로그 */}
        {showRestoreDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay animate-fadeIn"
            role="dialog"
            aria-labelledby="restore-dialog-title"
            aria-modal="true"
          >
            <div className="bg-background-white border border-border rounded-lg p-6 mx-4 max-w-md shadow-xl animate-bounceIn">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={24} color="var(--color-brand)" aria-hidden="true" />
                <h2 id="restore-dialog-title" className="text-[20px] font-bold">
                  작성 중인 내용 발견
                </h2>
              </div>
              <p className="text-[14px] text-text-primary mb-6">
                이전에 작성하던 신청서가 있습니다. 계속 작성하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-3 bg-brand text-text-inverse border border-transparent rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:brightness-95 active:scale-[0.98]"
                >
                  이어서 작성
                </button>
                <button
                  onClick={handleStartNew}
                  className="flex-1 px-4 py-3 bg-background-white hover:bg-background-100 border border-border rounded-md font-medium transition-all duration-300 hover:shadow-sm active:scale-[0.98]"
                >
                  새로 작성
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 장바구니 동기화 다이얼로그 */}
        {showSyncDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay animate-fadeIn"
            role="dialog"
            aria-labelledby="sync-dialog-title"
            aria-modal="true"
          >
            <div className="bg-background-white border border-border rounded-lg p-6 mx-4 max-w-md shadow-xl animate-bounceIn">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBasket size={24} color="var(--color-brand)" aria-hidden="true" />
                <h2 id="sync-dialog-title" className="text-[20px] font-bold">
                  견적 데이터 반영
                </h2>
              </div>
              <p className="text-[14px] text-text-primary mb-4">
                견적에서 선택한 항목을 신청서에 반영하시겠습니까?
              </p>
              <p className="text-[13px] text-text-secondary mb-6">
                이전에 작성하던 신청서가 있습니다. 견적 데이터로 덮어쓰거나 기존 신청서를 유지할 수 있습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSyncOverwrite}
                  className="flex-1 px-4 py-3 bg-brand text-text-inverse border border-transparent rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:brightness-95 active:scale-[0.98]"
                >
                  견적으로 새로 작성
                </button>
                <button
                  onClick={handleKeepExisting}
                  className="flex-1 px-4 py-3 bg-background-white hover:bg-background-100 border border-border rounded-md font-medium transition-all duration-300 hover:shadow-sm active:scale-[0.98]"
                >
                  기존 신청서 유지
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 신청서 폼 */}
        <OrderForm />
      </div>

      <SiteFooter onNavigate={onNavigate} />
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
