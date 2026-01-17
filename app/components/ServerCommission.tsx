import { useEstimate } from '@/app/contexts/EstimateContext';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ServerCommissionProps {
  onBack: () => void;
}

export default function ServerCommission({ onBack }: ServerCommissionProps) {
  const { addItem, removeItem, items } = useEstimate();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);

  const isItemInEstimate = (name: string) => {
    return items.some(item => item.name === name);
  };

  const handleToggleEstimate = (name: string, price: number, description?: string) => {
    const existingItem = items.find(item => item.name === name);
    
    if (existingItem) {
      // 이미 있으면 제거
      removeItem(existingItem.id);
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    } else {
      // 없으면 추가
      addItem({
        name,
        price,
        category: 'server',
        description,
      });
      
      // 토스트 표시
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
      
      // 추가됨 표시
      setAddedItems(prev => new Set(prev).add(name));
      setTimeout(() => {
        setAddedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }, 2000);
    }
  };

  const options = [
    {
      name: '테마 전체 커스텀',
      price: 30000,
      description: '낮/밤 2종의 전반적인 색상테마+로고+배경 변경. 로고, 배경 PNG 필요.'
    },
    {
      name: '테마 1종 커스텀',
      price: 20000,
      description: '낮/밤 택 1종의 전반적인 색상테마+로고+배경 변경.'
    },
    {
      name: '로고만 변경',
      price: 5000,
      description: '트위터 테마에 로고만 바꾸는 옵션. 로고 PNG 파일 필요. 규격은 신청 후 안내드립니다.'
    },
    {
      name: '툿 글자수 제한 변경',
      price: 5000,
      description: '기본 공백포함 1000자.'
    },
    {
      name: '검색 기능',
      price: 30000,
      description: '단어 단위 검색. 팔로우 중인 유저의 툿+멘션에서 찾아 결과를 반환합니다.'
    },
    {
      name: '마스토돈 가이드',
      price: 5000,
      description: '테마 추가 시 해당 커뮤니티 서버 캡처본으로 작업, 노션 페이지로 제공. 타 플랫폼은 쓰지 않습니다.'
    }
  ];

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
        <div className="mb-10">
          <div className="pb-2 mb-8">
            <h1 className="text-[48px] leading-[0.95] tracking-[-0.03em] font-bold text-[#ff7b00]">
              서버 설치 & 테마 커미션
            </h1>
          </div>
        </div>

        {/* 기본 안내 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">기본 안내</h2>
          </div>
          
          <div className="max-w-4xl space-y-6 text-[17px] leading-[1.8]">
            <p>
              <span className="font-medium">기본 마감일:</span> 서버 개장 3~5일 전
            </p>
            <p className="text-foreground/70">
              개장으로부터 48시간 이상 남은 시점에 문의하실 경우 추가금 없음! (옵션에 따라 다를수도 있습니다)
            </p>
            <p className="text-foreground/70">
              구글 클라우드 플랫폼의 가상 엔진을 사용하여 서버를 설치합니다.<br />
              기본 옵션은 한참 인스턴스 마스토돈 + 트위터 UI 테마입니다.
            </p>
            <p className="text-foreground/70">
              도메인(사이트명)의 경우, 커뮤니티명과 어울리는 도메인을 제가 구매해 적용해드립니다.
            </p>
            <p className="text-foreground/70">
              준비물로 구글 클라우드 플랫폼을 이용해보지 않은 구글 계정을 준비해주세요!
            </p>
          </div>
        </section>

        {/* 기본 옵션 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">기본 옵션</h2>
          </div>
          
          <div className="space-y-3">
            <div className={`border-2 p-5 transition-all ${isItemInEstimate('자동봇 설치') ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                  <h3 className="text-[17px] text-black font-semibold">자동봇 설치</h3>
                  <span className="text-[14px] leading-[1.6] text-foreground/60">
                    마스토돈 서버와 연동되는 자동봇을 설치합니다.
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                  <span className="text-[17px] font-mono text-[#ff7b00]">₩20,000</span>
                  <button
                    onClick={() => handleToggleEstimate('자동봇 설치', 20000, '마스토돈 서버와 연동되는 자동봇을 설치합니다.')}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      isItemInEstimate('자동봇 설치') 
                        ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                        : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                    }`}
                    aria-label={isItemInEstimate('자동봇 설치') ? '견적에서 제거' : '견적에 추가'}
                  >
                    {isItemInEstimate('자동봇 설치') ? (
                      <Trash2 className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 추가 옵션 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">추가 옵션</h2>
          </div>
          
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.name} className={`border-2 p-5 transition-all ${isItemInEstimate(option.name) ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                    <h3 className="text-[17px] text-black font-semibold">{option.name}</h3>
                    <span className="text-[14px] leading-[1.6] text-foreground/60">
                      {option.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                    <span className="text-[17px] font-mono text-[#ff7b00]">₩{option.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleToggleEstimate(option.name, option.price, option.description)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        isItemInEstimate(option.name) 
                          ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                          : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                      }`}
                      aria-label={isItemInEstimate(option.name) ? '견적에서 제거' : '견적에 추가'}
                    >
                      {isItemInEstimate(option.name) ? (
                        <Trash2 className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 빠른마감 옵션 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">빠른마감 옵션</h2>
          </div>
          
          <div className="space-y-3">
            <div className={`border-2 p-5 transition-all ${isItemInEstimate('빠른마감: 24시간 내 기본 서버 설치') ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                <h3 className="text-[17px] text-black font-semibold flex-1">24시간 내 기본 서버 설치 마감</h3>
                <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                  <span className="text-[17px] font-mono text-[#ff7b00]">₩10,000</span>
                  <button
                    onClick={() => handleToggleEstimate('빠른마감: 24시간 내 기본 서버 설치', 10000)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      isItemInEstimate('빠른마감: 24시간 내 기본 서버 설치') 
                        ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                        : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                    }`}
                    aria-label={isItemInEstimate('빠른마감: 24시간 내 기본 서버 설치') ? '견적에서 제거' : '견적에 추가'}
                  >
                    {isItemInEstimate('빠른마감: 24시간 내 기본 서버 설치') ? (
                      <Trash2 className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={`border-2 p-5 transition-all ${isItemInEstimate('빠른마감: 48시간 내 로고 변경 서버 설치') ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                <h3 className="text-[17px] text-black font-semibold flex-1">48시간 내 로고 변경된 서버 설치 마감</h3>
                <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                  <span className="text-[17px] font-mono text-[#ff7b00]">₩15,000</span>
                  <button
                    onClick={() => handleToggleEstimate('빠른마감: 48시간 내 로고 변경 서버 설치', 15000)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      isItemInEstimate('빠른마감: 48시간 내 로고 변경 서버 설치') 
                        ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                        : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                    }`}
                    aria-label={isItemInEstimate('빠른마감: 48시간 내 로고 변경 서버 설치') ? '견적에서 제거' : '견적에 추가'}
                  >
                    {isItemInEstimate('빠른마감: 48시간 내 로고 변경 서버 설치') ? (
                      <Trash2 className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={`border-2 p-5 transition-all ${isItemInEstimate('빠른마감: 48시간 내 테마 커스텀 서버 설치') ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                <h3 className="text-[17px] text-black font-semibold flex-1">48시간 내 테마 커스텀된 서버 설치 마감</h3>
                <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                  <span className="text-[17px] font-mono text-[#ff7b00]">₩20,000</span>
                  <button
                    onClick={() => handleToggleEstimate('빠른마감: 48시간 내 테마 커스텀 서버 설치', 20000)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      isItemInEstimate('빠른마감: 48시간 내 테마 커스텀 서버 설치') 
                        ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                        : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                    }`}
                    aria-label={isItemInEstimate('빠른마감: 48시간 내 테마 커스텀 서버 설치') ? '견적에서 제거' : '견적에 추가'}
                  >
                    {isItemInEstimate('빠른마감: 48시간 내 테마 커스텀 서버 설치') ? (
                      <Trash2 className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-[#ff7b00] text-white px-8 py-4 rounded-full shadow-lg text-[16px] font-medium animate-[slideUpSimple_0.3s_ease-out]">
            견적에 추가되었습니다!
          </div>
        </div>
      )}
    </div>
  );
}