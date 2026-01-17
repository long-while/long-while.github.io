import { useEstimate } from '@/app/contexts/EstimateContext';

interface EstimatePageProps {
  onBack: () => void;
}

export default function EstimatePage({ onBack }: EstimatePageProps) {
  const { items, removeItem, clearItems, getTotalPrice } = useEstimate();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-16">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="mb-16 flex items-center gap-3 text-[14px] hover:text-[#ff7b00] transition-colors text-foreground/60"
        >
          <span className="text-[18px]">←</span>
          메인으로 돌아가기
        </button>

        {/* 타이틀 */}
        <div className="mb-32">
          <div className="pb-2 mb-8">
            <h1 className="text-[48px] leading-[0.95] tracking-[-0.03em] font-bold text-[#ff7b00]">
              내 견적 확인하기
            </h1>
          </div>
          <div>
            <span className="text-[20px] font-mono">
              총 {items.length}개 항목
            </span>
          </div>
        </div>

        {/* 견적 내용 */}
        {items.length === 0 ? (
          <div className="py-32 text-center">
            <h2 className="text-[24px] mb-4 text-foreground/40">
              견적에 담긴 항목이 없습니다
            </h2>
            <p className="text-[16px] text-foreground/60 mb-8">
              서버 설치 커미션 또는 자동봇 커미션 페이지에서<br />
              원하시는 옵션을 선택해주세요.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.hash = '#server'}
                className="w-[200px] h-[60px] border-2 border-black/20 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px]"
              >
                서버 설치 커미션
              </button>
              <button
                onClick={() => window.location.hash = '#bot'}
                className="w-[200px] h-[60px] border-2 border-black/20 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[16px]"
              >
                자동봇 커미션
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 항목 리스트 */}
            <section className="mb-16">
              <div className="mb-12 border-b-2 border-black pb-4">
                <h2 className="text-[32px] tracking-[-0.01em]">선택한 항목</h2>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-2 border-black/10 p-5 hover:border-[#ff7b00]/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-[12px] font-mono text-[#ff7b00] mt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                          <h3 className="text-[17px] text-black font-semibold">{item.name}</h3>
                          {item.description && (
                            <span className="text-[14px] leading-[1.6] text-foreground/60">
                              {item.description}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                          <span className="text-[17px] font-mono text-[#ff7b00]">
                            ₩{item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="px-3 py-1.5 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[13px] flex items-center gap-1.5"
                            aria-label="삭제"
                          >
                            <span>×</span>
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 총액 */}
            <section className="mb-16">
              <div className="border-2 border-[#ff7b00] bg-[#fff5eb] p-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[24px]">총 견적 금액</span>
                  <span className="text-[36px] font-mono text-[#ff7b00]">
                    ₩{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                <p className="text-[15px] text-foreground/70">
                  * 최종 견적은 작업 난이도와 일정에 따라 달라질 수 있습니다.<br />
                  * 정확한 견적은 신청서 제출 후 확인해드립니다.
                </p>
              </div>
            </section>

            {/* 안내사항 */}
            <section className="mb-16">
              <div className="bg-black/[0.02] border-2 border-black/10 p-8">
                <h3 className="text-[18px] mb-4 flex items-center gap-2">
                  <span className="text-[#ff7b00]">ℹ️</span>
                  안내사항
                </h3>
                <ul className="space-y-2 text-[15px] leading-[1.8] text-foreground/70">
                  <li className="flex gap-3">
                    <span className="text-[#ff7b00]">•</span>
                    <span>자동봇 구동비는 주당 ₩5,000이며, 실제 구동 기간만큼만 청구됩니다.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ff7b00]">•</span>
                    <span>서버비는 별도이며, 구글 클라우드 플랫폼에 직접 결제하게 됩니다.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ff7b00]">•</span>
                    <span>빠른마감이 필요한 경우 추가금이 발생할 수 있습니다.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ff7b00]">•</span>
                    <span>견적은 자동 저장되지 않습니다. 캡처하거나 메모해두세요.</span>
                  </li>
                </ul>
              </div>
            </section>

          </>
        )}
      </div>
    </div>
  );
}