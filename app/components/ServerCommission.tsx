import { useState, useEffect } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { ChevronDownIcon } from '@/app/components/icons';
import type { NavigateFunction } from '@/app/types/navigation';
import MastodonServerCalculator from '@/app/components/MastodonServerCalculator';
import { DEADLINE_BLACKOUT_LABEL } from '@/app/utils/orderUtils';

interface ServerCommissionProps {
  onBack: () => void;
  onNavigate?: NavigateFunction;
}

export default function ServerCommission({ onBack, onNavigate }: ServerCommissionProps) {
  const { addItem, removeItem, items, serverCalcResult } = useEstimate();
  const [isLongTermInfoOpen, setIsLongTermInfoOpen] = useState(false);

  const isItemInEstimate = (name: string) => {
    return items.some(item => item.name === name);
  };

  // 검색 차단 규칙: 계산기가 Vultr(장기·소규모) 서버로 판정하면 검색 기능은 담을 수 없다.
  const SEARCH_ITEM_NAME = '검색 기능';
  const searchBlocked = serverCalcResult?.type === 'vultr';

  // Vultr 판정으로 바뀌면 이미 담긴 검색 기능 항목을 제거해 견적과 정책을 일치시킨다.
  useEffect(() => {
    if (!searchBlocked) return;
    const searchItem = items.find(item => item.name === SEARCH_ITEM_NAME);
    if (searchItem) removeItem(searchItem.id);
  }, [searchBlocked, items, removeItem]);

  // 테마 옵션들 (택1 그룹)
  const themeOptions = [
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
  ];

  // 빠른마감 옵션들 (체크박스 형태)
  const rushOptions = [
    { estimateName: '빠른마감: 48시간 내 기본 서버 설치', displayName: '48시간 내 기본 서버 설치 마감', price: 5000, description: '결제 요청 시각으로부터 48시간 내에 기본 옵션 서버를 설치합니다.' },
    { estimateName: '빠른마감: 24시간 내 기본 서버 설치', displayName: '24시간 내 기본 서버 설치 마감', price: 10000, description: '결제 요청 시각으로부터 24시간 내에 기본 옵션 서버를 설치합니다.' },
    { estimateName: '빠른마감: 48시간 내 로고 변경 서버 설치', displayName: '48시간 내 로고 변경된 서버 설치 마감', price: 15000, description: '결제 요청 시각으로부터 48시간 내에 로고 변경 옵션 서버를 설치합니다.' },
    { estimateName: '빠른마감: 48시간 내 테마 커스텀 서버 설치', displayName: '48시간 내 테마 커스텀된 서버 설치 마감', price: 20000, description: '결제 요청 시각으로부터 48시간 내에 커스텀 테마 옵션 서버를 설치합니다.' },
  ];

  // 추가 옵션들 (중복 선택 가능)
  const additionalOptions: {
    name: string;
    price: number;
    description: string;
  }[] = [
      {
        name: '툿 글자수 제한 변경',
        price: 5000,
        description: '기본 공백포함 1000자.'
      },
      {
        name: '검색 기능',
        price: 15000,
        description: '단어 단위 검색. 팔로우 중인 유저의 툿+멘션에서 찾아 결과를 반환합니다.'
      },
      {
        name: 'masto.host 에서 서버 데이터 이전',
        price: 20000,
        description: '팔로우 관계, 텍스트 데이터, 이미지 등 모든 정보를 기존 서버에서 새로운 서버로 옮겨드립니다.'
      }
    ];

  // 현재 선택된 테마 옵션
  const getSelectedThemeOption = () => {
    return themeOptions.find(option => isItemInEstimate(option.name));
  };

  // 테마 옵션 선택 (택1)
  const handleThemeOptionSelect = (name: string, price: number, description?: string) => {
    // 기존 테마 옵션 모두 제거
    themeOptions.forEach(option => {
      const existingItem = items.find(item => item.name === option.name);
      if (existingItem) {
        removeItem(existingItem.id);
      }
    });

    // 이미 선택된 것을 다시 클릭한 경우 해제만 (위에서 이미 제거됨)
    if (getSelectedThemeOption()?.name === name) {
      return;
    }

    // 새 옵션 추가
    addItem({
      name,
      price,
      category: 'server',
      description,
    });
  };

  // 추가 옵션 토글 (중복 선택 가능)
  const handleToggleEstimate = (name: string, price: number, description?: string) => {
    const existingItem = items.find(item => item.name === name);

    if (existingItem) {
      removeItem(existingItem.id);
    } else {
      addItem({
        name,
        price,
        category: 'server',
        description,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1060px] mx-auto px-8 py-16">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-3 text-[14px] min-h-[44px] hover:text-[#ff7b00] transition-colors text-foreground/70 focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2 rounded"
        >
          <span className="text-[18px]">←</span>
          메인으로 돌아가기
        </button>

        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-[40px] leading-[0.95] tracking-[-0.03em] font-bold text-[#ff7b00]">
            서버 설치 & 테마 커미션
          </h1>
        </div>

        {/* 장기 소규모 서버 안내 (드롭다운) */}
        <div className="border border-border mb-10 overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setIsLongTermInfoOpen(!isLongTermInfoOpen)}
            aria-expanded={isLongTermInfoOpen}
            className="w-full px-6 py-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors min-h-[44px] text-left"
          >
            <span className="text-[19px] font-semibold leading-[1.4]">
              TRPG 혹은 자관 역극용으로 장기 소규모 서버 설치가 가능할까요?
            </span>
            <ChevronDownIcon
              className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isLongTermInfoOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`border-t border-border transition-all duration-300 ease-in-out ${isLongTermInfoOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
              }`}
          >
            <div className="px-6 py-6 text-[15px] leading-[1.8] text-foreground/80">
              <p>
                네, 가능합니다. 서버에 가입된 계정의 수와 상관없이 평균 동시접속자가 10인 미만이라면 소규모 서버 설치가 가능해요. 서버비는 사양에 따라 8천원~3만원까지 상이하며, 매달 월초에 VM 대여 업체에 등록하신 결제 수단으로 자동 지불하시게 됩니다. (커미션주에게 내시는 게 아니에요!) 도메인과 서버를 포함하여 모든 정보와 데이터는 신청자님께 귀속되며, 커미션 진행을 돕도록 상세한 안내가 준비되어 있습니다. 만약 소규모 서버용 장기 자동봇을 가동하시게 된다면 동일한 VM에 세팅해드리므로 가동 주수에 따른 비용이 들지 않는 대신, 초기 세팅 비용이 1만원 청구됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 서버비 계산기 */}
        <MastodonServerCalculator />

        {/* 공지 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">공지</h2>
          </div>

          <div className="max-w-4xl space-y-6 text-[15px] leading-[1.8]">
            <p>
              <span className="font-medium">기본 마감일:</span> 서버 개장 3~5일 전
            </p>
            {/* 접수 불가 기간: 신청서 검증(orderUtils 의 getDeadlineBlackoutError)과 동일한 기간 */}
            <p className="text-[#cc5500] font-medium">
              {DEADLINE_BLACKOUT_LABEL} 은 마감이 불가능한 기간입니다. 해당 기간을 마감일로 신청하실 수 없어요.
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
              서버 설치 커미션 신청 시, 첫 맛톤커 러너 분들을 위한 노션 가이드를 무료로 제공합니다. 합격자 가이드에 링크를 첨부하여 사용할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 기본 옵션 */}
        <section id="server-install-section" className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">기본 옵션</h2>
          </div>

          <div className="space-y-3">
            <div className={`border p-5 transition-all ${isItemInEstimate('마스토돈 서버 설치') ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20' : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                  <h3 className="text-[15px] text-black font-semibold">마스토돈 서버 설치</h3>
                  <span className="text-[14px] leading-[1.6] text-foreground/60">
                    자캐 커뮤에 특화된 한참 인스턴스를 설치합니다.
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                  <span className="text-[15px] font-mono leading-normal text-[#ff7b00]">₩20,000</span>
                  <button
                    onClick={() => handleToggleEstimate('마스토돈 서버 설치', 20000, '자캐 커뮤에 특화된 한참 인스턴스를 설치합니다.')}
                    className={`w-10 h-10 min-w-[44px] min-h-[44px] rounded-full border transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2 ${isItemInEstimate('마스토돈 서버 설치')
                      ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]'
                      : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                      }`}
                    aria-label={isItemInEstimate('마스토돈 서버 설치') ? '견적에서 제거' : '견적에 추가'}
                  >
                    {isItemInEstimate('마스토돈 서버 설치') ? (
                      <Trash2 className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[14px] text-foreground/60 mt-4">
              자동봇도 함께 필요하시다면{' '}
              <button
                onClick={() => onNavigate?.('bot')}
                className="text-[#ff7b00] hover:underline"
              >
                자동봇 커미션 페이지
              </button>
              를 확인해주세요.
            </p>
          </div>
        </section>

        {/* 테마 선택 (택1) */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">테마 선택</h2>
          </div>

          {/* 택1 안내 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-[14px] text-blue-800 font-medium">택1 옵션</p>
              <p className="text-[13px] text-blue-700">아래 옵션 중 하나만 선택할 수 있습니다. 커스텀 없이 기본 트위터 테마를 원하시면 선택하지 않으셔도 됩니다.</p>
            </div>
          </div>

          <div className="space-y-3">
            {themeOptions.map((option) => {
              const isSelected = isItemInEstimate(option.name);
              return (
                <button
                  key={option.name}
                  onClick={() => handleThemeOptionSelect(option.name, option.price, option.description)}
                  className={`w-full border p-5 transition-all text-left focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2 ${isSelected
                    ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                    : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      {/* 라디오 버튼 스타일 */}
                      <div className={`w-6 h-6 min-w-[24px] rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected
                        ? 'border-[#ff7b00] bg-[#ff7b00]'
                        : 'border-gray-300'
                        }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-[15px] text-black font-semibold">{option.name}</h3>
                        <span className="text-[14px] leading-[1.6] text-foreground/60">
                          {option.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 pl-10 md:pl-0">
                      <span className="text-[15px] font-mono leading-normal text-[#ff7b00]">₩{option.price.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 추가 옵션 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">추가 옵션</h2>
          </div>

          <div className="space-y-3">
            {additionalOptions.map((option) => {
              const isSelected = isItemInEstimate(option.name);
              const isBlocked = option.name === SEARCH_ITEM_NAME && searchBlocked;
              return (
                <div key={option.name}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isBlocked) return;
                      handleToggleEstimate(option.name, option.price, option.description);
                    }}
                    disabled={isBlocked}
                    className={`w-full border p-5 transition-all text-left ${isSelected
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                      } ${isBlocked ? 'opacity-50 cursor-not-allowed hover:border-border hover:bg-white' : ''} focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2`}
                    aria-pressed={isSelected}
                    aria-disabled={isBlocked}
                    aria-label={isSelected ? `${option.name} 견적에서 제거` : `${option.name} 견적에 추가`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-6 h-6 min-w-[24px] rounded border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'border-[#ff7b00] bg-[#ff7b00]' : 'border-gray-300'
                            }`}
                          aria-hidden
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <div>
                          <h3 className="text-[15px] text-black font-semibold">{option.name}</h3>
                          <span className="text-[14px] leading-[1.6] text-foreground/60">
                            {option.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-[15px] font-mono leading-normal text-[#ff7b00] shrink-0 pl-10 md:pl-0">₩{option.price.toLocaleString()}</span>
                    </div>
                  </button>
                  {isBlocked && (
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#cc5500]">
                      위 계산기에서 장기·소규모(Vultr) 서버로 판정되어 검색 기능을 추가할 수 없습니다. 검색이 필요하시면 운영 기간을 12개월 미만(GCP 사양)으로 선택해 주세요.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 빠른마감 옵션 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">빠른마감 옵션</h2>
          </div>

          <div className="space-y-3">
            {rushOptions.map((option) => {
              const isSelected = isItemInEstimate(option.estimateName);
              return (
                <button
                  key={option.estimateName}
                  type="button"
                  onClick={() => handleToggleEstimate(option.estimateName, option.price)}
                  className={`w-full border p-5 transition-all text-left ${isSelected
                    ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                    : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                    } focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2`}
                  aria-pressed={isSelected}
                  aria-label={isSelected ? `${option.displayName} 견적에서 제거` : `${option.displayName} 견적에 추가`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-6 h-6 min-w-[24px] rounded border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'border-[#ff7b00] bg-[#ff7b00]' : 'border-gray-300'
                          }`}
                        aria-hidden
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <h3 className="text-[15px] text-black font-semibold">{option.displayName}</h3>
                        <span className="text-[14px] leading-[1.6] text-foreground/60">{option.description}</span>
                      </div>
                    </div>
                    <span className="text-[15px] font-mono leading-normal text-[#ff7b00] shrink-0 pl-10 md:pl-0">₩{option.price.toLocaleString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}