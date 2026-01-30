import { useEffect, useState } from 'react';
import { OrderProvider, useOrder } from '@/app/contexts/OrderContext';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import OrderForm from './OrderForm';

interface OrderContentProps {
  onNavigate: (page: string) => void;
}

function OrderContent({ onNavigate }: OrderContentProps) {
  const { loadFromLocalStorage, resetForm } = useOrder();
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => {
    // 저장된 데이터가 있는지 확인
    const hasSavedData = localStorage.getItem('mas_commission_order_draft');
    if (hasSavedData) {
      setShowRestoreDialog(true);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage="order" onNavigate={onNavigate} />

      <div className="pt-16 pb-16">
        {/* 헤더 섹션 - 애니메이션 추가 */}
        <div className="bg-gradient-to-br from-[var(--brand-bg)] via-[var(--brand-bg-subtle)] to-white border-b-2 border-black py-16 relative overflow-hidden">
          {/* 장식 요소 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--brand-primary)] opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--brand-primary)] opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

          <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
            <h1 className="text-[36px] md:text-[42px] font-bold mb-4 text-gradient-brand animate-fadeInDown">
              커미션 신청서 작성
            </h1>
            <p className="text-[16px] md:text-[18px] text-gray-700 mb-3 animate-fadeInDown animation-delay-100 animation-fill-both">
              커미션 신청은 다음처럼 이루어집니다.
            </p>
            <p className="text-[13px] md:text-[14px] text-gray-600 animate-fadeInDown animation-delay-200 animation-fill-both">
              커미션 페이지에서 정보 확인 → 커미션 페이지에서 신청서 작성 → 4단계에 나온 견적과 신청서 복사 → 크레페 신청서에 신청서 붙여넣기
            </p>

            {/* 안내 배지 */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[var(--brand-primary)] rounded-full shadow-md animate-fadeInUp animation-delay-300 animation-fill-both">
              <span className="text-[16px]" aria-hidden="true">💡</span>
              <span className="text-[13px] text-gray-700">
                작성 중인 내용은 자동으로 저장됩니다
              </span>
            </div>
          </div>
        </div>

        {/* 복원 다이얼로그 */}
        {showRestoreDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
            role="dialog"
            aria-labelledby="restore-dialog-title"
            aria-modal="true"
          >
            <div className="bg-white border-2 border-black rounded-lg p-6 mx-4 max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounceIn">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[24px]" aria-hidden="true">📝</span>
                <h2 id="restore-dialog-title" className="text-[20px] font-bold">
                  작성 중인 내용 발견
                </h2>
              </div>
              <p className="text-[14px] text-gray-700 mb-6">
                이전에 작성하던 신청서가 있습니다. 계속 작성하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white border-2 border-black rounded-md font-medium transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  이어서 작성
                </button>
                <button
                  onClick={handleStartNew}
                  className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 border-2 border-black rounded-md font-medium transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[1px]"
                >
                  새로 작성
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 신청서 폼 */}
        <OrderForm onNavigate={onNavigate} />
      </div>

      <Footer onNavigate={onNavigate} />
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
