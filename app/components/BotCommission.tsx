import { useEstimate } from '@/app/contexts/EstimateContext';
import { useState } from 'react';
import { Plus, Trash2, Minus } from 'lucide-react';

interface BotCommissionProps {
  onBack: () => void;
}

export default function BotCommission({ onBack }: BotCommissionProps) {
  const { addItem, removeItem, items } = useEstimate();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [isHidingToast, setIsHidingToast] = useState(false);
  const [operationWeeks, setOperationWeeks] = useState(0);

  const isItemInEstimate = (name: string) => {
    return items.some(item => item.name === name);
  };

  const handleOperationWeeksChange = (newWeeks: number) => {
    if (newWeeks < 0) return;
    
    const oldWeeks = operationWeeks;
    setOperationWeeks(newWeeks);
    
    // 기존 가동료 항목 제거
    const existingItem = items.find(item => item.name.startsWith('기본 가동료'));
    if (existingItem) {
      removeItem(existingItem.id);
    }
    
    // 새로운 가동료 추가 (0주가 아닐 때만)
    if (newWeeks > 0) {
      addItem({
        name: `기본 가동료 (${newWeeks}주)`,
        price: newWeeks * 5000,
        category: 'bot',
        description: `1주당 ₩5,000 × ${newWeeks}주`,
      });
      
      // 토스트 표시
      if (newWeeks > oldWeeks) {
        setIsHidingToast(false);
        setShowToast(true);
        setTimeout(() => {
          setIsHidingToast(true);
          setTimeout(() => {
            setShowToast(false);
            setIsHidingToast(false);
          }, 300); // 애니메이션 지속 시간
        }, 2000);
      }
    }
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
        category: 'bot',
        description,
      });
      
      // 토스트 표시
      setIsHidingToast(false);
      setShowToast(true);
      setTimeout(() => {
        setIsHidingToast(true);
        setTimeout(() => {
          setShowToast(false);
          setIsHidingToast(false);
        }, 300); // 애니메이션 지속 시간
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

  const botTypes = [
    {
      name: "기본 타입",
      price: 15000,
      features: [
        "구글 스프레드시트 연동",
        "[nDm] [랜덤/옵션, 옵션, 옵션...]",
        "[운세] 명령어와 기본 운세 문구 제공",
        "[가위바위보] [YN] 등 커스텀 명령어 기능 기본 제공"
      ],
      note: "커스텀 명령어란? = 키워드 반응형 시스템. 시트에 운영진이 적은 키워드에 따른 랜덤 응답 출력 (시트를 통해 수동 추가, 관리, 수정 가능). 이 기능을 활용하여 간단한 자동 조사도 구현할 수 있음",
      upgradeOption: {
        name: "커스텀 명령어 업그레이드",
        price: 5000,
        description: "유저 이름/은는맞춤/문구 내 다이스 기능이 추가됩니다!"
      }
    },
    {
      name: "기본&상점 타입",
      price: 35000,
      features: [
        "기본 타입에 포함된 모든 기능 +@",
        "구글 시트로 캐릭터, 재화, 인벤토리 관리 (운영진 수동 편집 지원)",
        "[소지금 추가/금액/캐릭터명] (운영진 명령어)",
        "[소지금 차감/금액/캐릭터명] (운영진 명령어)",
        "[상점] 아이템 목록 출력",
        "[구매/아이템명] 아이템 구매 시 재화 차감",
        "[가방] 인벤토리, 재화 확인"
      ],
      options: [
        { name: "양도 기능", price: 10000, description: "[양도/아이템명/캐릭터명] 캐릭터 간의 아이템, 재화 양도" },
        { name: "툿수 자동 재화 반영", price: 7000, description: "툿수에 따른 자동 재화 반영" },
        { name: "커스텀 명령어 업그레이드", price: 5000, description: "유저 이름/은는맞춤/문구 내 다이스 기능 추가" }
      ]
    },
    {
      name: "기본&상점&스탯 타입",
      price: 45000,
      features: [
        "기본&상점 타입에 포함된 모든 기능 +@",
        "구글 시트로 캐릭터 스탯 관리 (운영진 수동 편집 지원)",
        "[▨▨ 변경/수치/캐릭터명] (운영진 명령어 / 예: 체력 변경)",
        "[사용/아이템명] 아이템 소모 후 캐릭터 스탯 변화. 운영진이 시트로 아이템 편집 가능"
      ],
      options: [
        { name: "양도 기능", price: 10000, description: "[양도/아이템명/캐릭터명] 캐릭터 간의 아이템, 재화 양도" },
        { name: "툿수 자동 재화 반영", price: 7000, description: "툿수에 따른 자동 재화 반영" },
        { name: "커스텀 명령어 업그레이드", price: 5000, description: "유저 이름/은는맞춤/문구 내 다이스 기능 추가" }
      ]
    },
    {
      name: "CoC 타입",
      price: 30000,
      features: [
        "기본 타입에 포함된 모든 기능 +@",
        "숫자만 변경하면 되는 탐사자 시트 제공",
        "[nDm±k]",
        "[판정/능력치명] 예: [판정/근력]",
        "[▨▨ 변화/수치] 예: [이성 변화/-3]",
        "[선택/옵션, 옵션, 옵션] 여러 개의 옵션 중 하나를 랜덤 선택",
        "[시트 업데이트] 탐사자 시트를 수동으로 업데이트한 후 자동봇에 반영"
      ]
    },
    {
      name: "자동조사 타입",
      price: 20000,
      features: [
        "[조사/장소], [조사/물건] 등의 키워드를 받고 조사 내용 출력",
        "캐릭터 재화 및 스탯과 연동 (특정 이벤트 발생 시 5코인 획득 / 체력 -5 등)",
        "특정 장소는 비밀번호나 요구조건 설정 가능"
      ],
      options: [
        { name: "조사 횟수 제한", price: 5000, description: "장소별 혹은 캐릭터별 조사 횟수 제한 가능" },
        { name: "조사 목록 시트 연동", price: 10000, description: "러너 공개용 조사 목록 시트 연동, 조사된 장소 표시 등의 부가기능 추가" }
      ]
    },
    {
      name: "오마카세 타입",
      price: 0,
      features: [
        "복잡한 오마카세 봇의 경우 최대한 일찍 문의를 넣어주세요!",
        "진행이 가능할지 아닐지 판단한 후 신청서를 받고 있습니다.",
        "보내주실 내용: 시스템을 자세히 설명한 외부 문서 + 마감일 + 구동기간",
        "구현 난이도에 따라 여유로운 일정, 원활한 소통, 그리고 추가금이 필요할 수 있습니다."
      ],
      note: "진행하지 않아요) 일반 레이드, 마스레이드, 포지션제 전투"
    }
  ];

  const additionalOptions = [
    { name: "예약 툿 기능", price: 5000 },
    { name: "스토리 자동 진행", price: 5000, note: "정말 추천합니다!! 써보니까 운영의 질이 달라져요!" },
    { name: "특정 상황 DM 전송", price: 0, description: "특정 상황에서 봇이 DM 전송 (ex. 체력이 50 이하로 떨어짐)" },
    { name: "시스템/봇 가이드 문서", price: 0, description: "해당 커뮤니티 서버 캡처본으로 제작합니다" }
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
              자동봇 커미션
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
              마스토돈 자동봇 커미션입니다. 타입에 따라 가격이 달라집니다.<br />
              타입 내에 기재되지 않은 기능도 대부분 구현할 수 있습니다.
            </p>
            
            <p className="text-foreground/70">
              기본 개발 기간은 한달이며, 원하시는 일정과 구현 난이도에 따라 빠르게 마감할 수 있습니다.<br />
              <span className="font-medium text-[#ff7b00]">48시간 내 마감 +200%, 일주일 내 마감 +100%</span> 추가금을 받습니다.
            </p>
            
            <p className="text-foreground/70">
              개발 중에 요청 기능이 늘어나거나 구현 방식이 변경될 경우 추가금이 발생하거나 마감일이 변경될 수 있습니다.<br />
              봇 가동 중 사전에 발견하지 못한 오류가 발생할 경우 무료로 유지보수를 진행합니다.
            </p>
          </div>
        </section>

        {/* 자동봇 시트 미리보기 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">자동봇 시트 미리보기</h2>
          </div>

          <div className="space-y-4">
            <a
              href="https://docs.google.com/spreadsheets/d/1iTqRwJChqTCpfpMaleLEt2i1h2MTroyWAbNktZF8KjA/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block border-2 border-black/10 p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-baseline gap-6">
                  <span className="text-[12px] font-mono text-[#ff7b00]">01</span>
                  <span className="text-[17px]">기본 & 상점 & 스탯 자동봇 시트</span>
                </div>
                <span className="text-[#ff7b00] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/1ui6iVgG-nDLF2RDVd50bz2jVeBU9JRp3f5oCx3a4eQE/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block border-2 border-black/10 p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-baseline gap-6">
                  <span className="text-[12px] font-mono text-[#ff7b00]">02</span>
                  <span className="text-[17px]">예약 툿 시트</span>
                </div>
                <span className="text-[#ff7b00] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/1K0mXU2NOQ71HF9Mo6Zs_cFHlpDPeRFm_N8v7Pts58cY/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block border-2 border-black/10 p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-baseline gap-6">
                  <span className="text-[12px] font-mono text-[#ff7b00]">03</span>
                  <span className="text-[17px]">스토리 자동진행 시트</span>
                </div>
                <span className="text-[#ff7b00] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          </div>
        </section>

        {/* 기본 가동료 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">가동 기간</h2>
          </div>
          
          <div className="border-2 border-black/10 p-8 bg-black/[0.01]">
            <div className="mb-6">
              <p className="text-[19px] leading-[1.8] font-semibold text-black">
                1주에 5천원
              </p>
              <p className="text-[15px] leading-[1.8] text-foreground/70 mt-2">
                봇 가동 비용은 1주일 5000원입니다. 유지보수는 무료로 진행합니다.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleOperationWeeksChange(Math.max(0, operationWeeks - 1))}
                  className="w-10 h-10 rounded-full border-2 border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white transition-all text-[20px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={operationWeeks === 0}
                  aria-label="1주 감소"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-[20px] font-mono min-w-[80px] text-center">{operationWeeks} 주</span>
                <button
                  onClick={() => handleOperationWeeksChange(operationWeeks + 1)}
                  className="w-10 h-10 rounded-full border-2 border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white transition-all text-[20px] flex items-center justify-center"
                  aria-label="1주 추가"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-mono text-[#ff7b00]">₩{(operationWeeks * 5000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 봇 타입들 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">봇 타입</h2>
          </div>
          
          <div className="space-y-8">
            {botTypes.map((type, index) => (
              <div key={index} className={`border-2 transition-colors ${isItemInEstimate(type.name) ? 'border-[#ff7b00]' : 'border-black/10 hover:border-[#ff7b00]/30'}`}>
                <div className="flex justify-between items-center p-8 bg-black/[0.01] border-b-2 border-black/10">
                  <div className="flex-1">
                    <h3 className="text-[26px]">{type.name}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[22px] font-mono text-[#ff7b00]">
                      {type.price ? `₩${type.price.toLocaleString()}` : '협의'}
                    </span>
                    {type.price > 0 && (
                      <button
                        onClick={() => handleToggleEstimate(type.name, type.price, type.features.join(', '))}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          isItemInEstimate(type.name) 
                            ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                            : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                        }`}
                        aria-label={isItemInEstimate(type.name) ? '견적에서 제거' : '견적에 추가'}
                      >
                        {isItemInEstimate(type.name) ? (
                          <Trash2 className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <ul className="space-y-3">
                    {type.features.map((feature, i) => (
                      <li key={i} className="text-[16px] leading-[1.7] flex gap-3">
                        <span className="text-[#ff7b00] shrink-0">—</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {type.note && (
                    <div className="bg-black/[0.02] border-2 border-black/10 p-6 mt-6">
                      <p className="text-[15px] leading-[1.7] text-foreground/70">
                        {type.note}
                      </p>
                    </div>
                  )}

                  {type.upgradeOption && (
                    <div className={`p-5 mt-6 border-2 transition-all ${isItemInEstimate(`${type.name} - ${type.upgradeOption.name}`) ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                          <h4 className="text-[17px] text-black font-semibold">{type.upgradeOption.name}</h4>
                          <span className="text-[14px] leading-[1.6] text-foreground/60">
                            {type.upgradeOption.description}
                          </span>
                        </div>
                        <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                          <span className="text-[17px] font-mono text-[#ff7b00]">₩{type.upgradeOption.price.toLocaleString()}</span>
                          <button
                            onClick={() => handleToggleEstimate(
                              `${type.name} - ${type.upgradeOption.name}`,
                              type.upgradeOption.price,
                              type.upgradeOption.description
                            )}
                            className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                              isItemInEstimate(`${type.name} - ${type.upgradeOption.name}`) 
                                ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                                : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                            }`}
                            aria-label={isItemInEstimate(`${type.name} - ${type.upgradeOption.name}`) ? '견적에서 제거' : '견적에 추가'}
                          >
                            {isItemInEstimate(`${type.name} - ${type.upgradeOption.name}`) ? (
                              <Trash2 className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {type.options && (
                    <div className="mt-6 pt-6 border-t-2 border-black/10">
                      <div className="text-[11px] tracking-[0.15em] uppercase mb-4 text-[#ff7b00]">
                        추가 옵션
                      </div>
                      <div className="space-y-3">
                        {type.options.map((option, i) => (
                          <div key={i} className={`border-2 p-5 transition-all ${isItemInEstimate(`${type.name} - ${option.name}`) ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                                <h4 className="text-[17px] text-black font-semibold">{option.name}</h4>
                                <span className="text-[14px] leading-[1.6] text-foreground/60">
                                  {option.description}
                                </span>
                              </div>
                              <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                                <span className="text-[17px] font-mono text-[#ff7b00]">₩{option.price.toLocaleString()}</span>
                                <button
                                  onClick={() => handleToggleEstimate(
                                    `${type.name} - ${option.name}`,
                                    option.price,
                                    option.description
                                  )}
                                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                                    isItemInEstimate(`${type.name} - ${option.name}`) 
                                      ? 'border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00]' 
                                      : 'border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white'
                                  }`}
                                  aria-label={isItemInEstimate(`${type.name} - ${option.name}`) ? '견적에서 제거' : '견적에 추가'}
                                >
                                  {isItemInEstimate(`${type.name} - ${option.name}`) ? (
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
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 추가 옵션 */}
        <section className="py-15">
          <div className="mb-16 border-b-2 border-black pb-4">
            <h2 className="text-[32px] tracking-[-0.01em] font-semibold">추가 옵션</h2>
          </div>
          
          <div className="space-y-3">
            {additionalOptions.map((option, index) => (
              <div key={index} className={`border-2 p-5 transition-all ${isItemInEstimate(option.name) ? 'border-[#ff7b00] bg-[#fff5eb]' : 'border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb]'}`}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                    <h3 className="text-[17px] text-black font-semibold">{option.name}</h3>
                    <span className="text-[14px] leading-[1.6] text-foreground/60">
                      {option.note || option.description}
                    </span>
                  </div>
                  {option.price > 0 && (
                    <div className="flex items-center justify-between md:justify-start gap-4 shrink-0">
                      <span className="text-[17px] font-mono text-[#ff7b00]">₩{option.price.toLocaleString()}</span>
                      <button
                        onClick={() => handleToggleEstimate(
                          option.name,
                          option.price,
                          option.note || option.description
                        )}
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
                  )}
                </div>
              </div>
            ))}
            <div className="border-2 border-[#ff7b00] p-5 bg-[#ff7b00] text-white">
              <span className="text-[16px]">빠른 마감: 48시간 내 +200%, 일주일 내 +100%</span>
            </div>
          </div>
        </section>

      </div>

      {/* 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className={`bg-[#ff7b00] text-white px-8 py-4 rounded-full shadow-lg text-[16px] font-medium ${
            isHidingToast 
              ? 'animate-[slideDownSimple_0.3s_ease-out]' 
              : 'animate-[slideUpSimple_0.3s_ease-out]'
          }`}>
            견적에 추가되었습니다!
          </div>
        </div>
      )}
    </div>
  );
}