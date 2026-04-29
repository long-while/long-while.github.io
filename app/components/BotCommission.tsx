import { useEstimate } from '@/app/contexts/EstimateContext';
import { useState, useEffect } from 'react';
import { Plus, Minus, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import type { NavigateFunction } from '@/app/types/navigation';

interface BotCommissionProps {
  onBack: () => void;
  onNavigate?: NavigateFunction;
}

// 메인 봇 타입 (서로 배타적: 기본 / 기본&상점 / 기본&상점&스탯 중 하나만 선택 가능)
const MAIN_BOT_TYPES = ['기본 타입', '기본&상점 타입', '기본&상점&스탯 타입'] as const;
const SHOP_BOT_TYPES = ['기본&상점 타입', '기본&상점&스탯 타입'] as const;

export default function BotCommission({ onBack, onNavigate }: BotCommissionProps) {
  const { addItem, removeItem, items } = useEstimate();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [operationWeeks, setOperationWeeks] = useState(0);
  const [omakaseDetailOpen, setOmakaseDetailOpen] = useState(false);
  const [investigationExampleOpen, setInvestigationExampleOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isItemInEstimate = (name: string) => {
    return items.some(item => item.name === name);
  };

  // 토스트 자동 사라짐
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleOperationWeeksChange = (newWeeks: number) => {
    if (newWeeks < 0) return;

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
      return;
    }

    // 메인 봇 타입은 서로 배타적: 다른 메인 봇 타입이 이미 선택된 경우 막고 토스트
    if ((MAIN_BOT_TYPES as readonly string[]).includes(name)) {
      const conflict = MAIN_BOT_TYPES.find(t => t !== name && isItemInEstimate(t));
      if (conflict) {
        setToastMessage(`"${conflict}" 선택을 먼저 취소해 주세요. 메인 봇 타입은 하나만 선택할 수 있어요.`);
        return;
      }
    }

    // 없으면 추가
    addItem({
      name,
      price,
      category: 'bot',
      description,
    });

    // 추가됨 표시
    setAddedItems(prev => new Set(prev).add(name));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }, 2000);
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
        { name: "양도 기능", price: 10000 },
        { name: "툿수-재화 자동반영", price: 10000 },
        { name: "커스텀 명령어 업그레이드", price: 5000 }
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
        { name: "양도 기능", price: 10000 },
        { name: "툿수-재화 자동반영", price: 10000 },
        { name: "커스텀 명령어 업그레이드", price: 5000 }
      ]
    },
    {
      name: "CoC 타입",
      price: 30000,
      features: [
        "숫자만 변경하면 되는 탐사자 시트 제공",
        "편집 가능한 커스텀 시트와 랜덤 표 시트 제공",
        "[nDm±k]",
        "기본 판정 [근력] [설득]",
        "보너스/패널티 다이스 [근력+1] [관찰력-2]",
        "판정, 피해 정산, 치명타가 모두 적용되는 무기 공격",
        "[▨▨ 변화/수치] 예: [이성 변화/-3]",
        "[랜덤/옵션, 옵션, 옵션] 여러 개의 옵션 중 하나를 랜덤 선택",
        "[장기적 광기] [일시적 광기] 표 굴림",
        "[시트 업데이트] 탐사자 시트를 수동으로 업데이트한 후 자동봇에 반영"
      ]
    },
    {
      name: "자동조사 타입",
      price: 20000,
      features: [
        "[장소 목록] [진입/장소명] [조사/포인트명]",
        "장소 목록과 각 장소에서 조사할 수 있는 포인트 관리",
        "캐릭터 소지품 및 스탯과 연동 (특정 이벤트 발생 시 아이템 획득 / 체력 -5 등)"
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

  // requires: 단일 항목명(string) 또는 "이 중 하나(any)" 배열(string[])
  const additionalOptions: { name: string; price: number; description?: string; aliases?: string[]; priceLabel?: string; requires?: string | string[]; requiresLabel?: string }[] = [
    { name: "커스텀 명령어 업그레이드", price: 5000, aliases: ["기본 타입 - 커스텀 명령어 업그레이드", "기본&상점 타입 - 커스텀 명령어 업그레이드", "기본&상점&스탯 타입 - 커스텀 명령어 업그레이드"], requires: [...MAIN_BOT_TYPES], requiresLabel: "기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나" },
    { name: "양도 기능", price: 10000, aliases: ["기본&상점 타입 - 양도 기능", "기본&상점&스탯 타입 - 양도 기능"], requires: [...SHOP_BOT_TYPES], requiresLabel: "기본&상점 또는 기본&상점&스탯 타입" },
    { name: "툿수-재화 자동반영", price: 10000, aliases: ["기본&상점 타입 - 툿수-재화 자동반영", "기본&상점&스탯 타입 - 툿수-재화 자동반영"], requires: [...SHOP_BOT_TYPES], requiresLabel: "기본&상점 또는 기본&상점&스탯 타입" },
    { name: "출석 시스템", price: 10000, description: "매일 [출석] 혹은 지정한 명령어를 사용하여 1회 출석 후 운영진이 지정한 재화 획득", requires: [...SHOP_BOT_TYPES], requiresLabel: "기본&상점 또는 기본&상점&스탯 타입" },
    { name: "예약 툿", price: 5000, requires: [...MAIN_BOT_TYPES], requiresLabel: "기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나" },
    { name: "스토리 자동 진행", price: 5000, requires: [...MAIN_BOT_TYPES], requiresLabel: "기본 / 기본&상점 / 기본&상점&스탯 타입 중 하나" },
    { name: "일일 조사 횟수 제한", price: 5000, description: "[조사] 명령어 사용 시 1회 카운트", requires: "자동조사 타입" },
    { name: "특정 상황 DM 전송", price: 20000, description: "특정 상황에서 봇이 DM 전송 (ex. 체력이 50 이하로 떨어짐)" },
    { name: "빠른 마감 (48시간 내)", price: 0, priceLabel: "+200%", description: "총 금액의 200% 추가" },
    { name: "빠른 마감 (1주일 내)", price: 0, priceLabel: "+100%", description: "총 금액의 100% 추가" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 토스트 알림 (메인 봇 타입 충돌, 추가옵션 prerequisite 안내) */}
      {toastMessage && (
        <div
          className="fixed top-24 right-4 z-50 bg-amber-500 text-white px-5 py-4 rounded-lg shadow-xl flex items-start gap-3 max-w-sm animate-slideInRight"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-[14px]">선택할 수 없는 옵션이에요</p>
            <p className="text-[13px] mt-0.5 leading-[1.5]">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white text-[18px] leading-none shrink-0"
            aria-label="알림 닫기"
          >
            ×
          </button>
        </div>
      )}

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
            자동봇 커미션
          </h1>
        </div>

        {/* 기본 안내 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">기본 안내</h2>
          </div>

          <div className="max-w-4xl space-y-6 text-[15px] leading-[1.8]">
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

            <p className="text-foreground/70">
              서버 설치도 함께 필요하시다면{' '}
              <button
                onClick={() => onNavigate?.('server')}
                className="text-[#ff7b00] hover:underline"
              >
                서버 설치 커미션 페이지
              </button>
              를 확인해주세요.
            </p>
          </div>
        </section>

        {/* 자동봇 시트 미리보기 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">자동봇 시트 미리보기</h2>
          </div>

          <div className="space-y-4">
            <a
              href="https://docs.google.com/spreadsheets/d/1iTqRwJChqTCpfpMaleLEt2i1h2MTroyWAbNktZF8KjA/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
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
              className="block border border-border p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
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
              className="block border border-border p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-baseline gap-6">
                  <span className="text-[12px] font-mono text-[#ff7b00]">03</span>
                  <span className="text-[17px]">스토리 자동진행 시트</span>
                </div>
                <span className="text-[#ff7b00] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/1kccCpDwSaQyaNeUxmCfyIrUNM9taJDeyfQfXTMcBQ24/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border p-5 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-baseline gap-6">
                  <span className="text-[12px] font-mono text-[#ff7b00]">04</span>
                  <span className="text-[17px]">조사 자동봇 시트</span>
                </div>
                <span className="text-[#ff7b00] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          </div>
        </section>

        {/* 기본 가동료 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">가동 기간</h2>
          </div>

          <div className="border border-border p-8 bg-black/[0.01]">
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
                  className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full border-2 border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white transition-all text-[20px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                  disabled={operationWeeks === 0}
                  aria-label="1주 감소"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-[20px] font-mono min-w-[80px] text-center">{operationWeeks} 주</span>
                <button
                  onClick={() => handleOperationWeeksChange(operationWeeks + 1)}
                  className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full border-2 border-[#ff7b00] text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white transition-all text-[20px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                  aria-label="1주 추가"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-mono leading-normal text-[#ff7b00]">₩{(operationWeeks * 5000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 봇 타입 비교 테이블 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">봇 타입 비교</h2>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse text-[14px] table-fixed">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-border p-3 text-left font-semibold w-[52%]">기능</th>
                  <th className="border border-border p-3 text-center font-semibold w-[16%]">기본</th>
                  <th className="border border-border p-3 text-center font-semibold w-[16%]">기본&상점</th>
                  <th className="border border-border p-3 text-center font-semibold w-[16%]">기본&상점&스탯</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">구글 시트 연동</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="border border-border p-3">[nDm]</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">[운세]</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="border border-border p-3">커스텀 명령어 [홀짝] [가위바위보] 등</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="border border-border p-3">재화 시스템</td>
                  <td className="border border-border p-3 text-center text-gray-300">-</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">상점 & 인벤토리</td>
                  <td className="border border-border p-3 text-center text-gray-300">-</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="border border-border p-3">스탯 시스템</td>
                  <td className="border border-border p-3 text-center text-gray-300">-</td>
                  <td className="border border-border p-3 text-center text-gray-300">-</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">[사용/아이템명]</td>
                  <td className="border border-border p-3 text-center text-gray-300">-</td>
                  <td className="border border-border p-3 text-center text-gray-300">-</td>
                  <td className="border border-border p-3 text-center text-[#ff7b00]">✓</td>
                </tr>
                <tr className="bg-[#fff5eb]">
                  <td className="border border-border p-3 font-semibold">가격</td>
                  <td className="border border-border p-3 text-center font-mono text-[#ff7b00]">₩15,000</td>
                  <td className="border border-border p-3 text-center font-mono text-[#ff7b00]">₩35,000</td>
                  <td className="border border-border p-3 text-center font-mono text-[#ff7b00]">₩45,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[13px] text-foreground/60">
            * 자동조사 타입(₩20,000)과 오마카세 타입(협의)은 특수 목적 봇으로 아래에서 별도 확인해주세요.
          </p>

          {/* 커스텀 명령어 업그레이드 설명 */}
          <div className="mt-12 pt-10 border-t border-border">
            <h3 className="text-[20px] font-semibold mb-2">커스텀 명령어 업그레이드란?</h3>
            <p className="text-[15px] leading-[1.7] text-foreground/80 mb-4">
              아래 <span className="font-bold text-[#ff7b00]">{'{중괄호}'}</span> 항목이 모두 업그레이드로 추가되었습니다.
            </p>
            <p className="text-[14px] leading-[1.7] text-foreground/70 mb-2">
              <strong>커스텀 명령어란?</strong> 운영진이 시트에 입력해 둔 명령어를 유저가 입력하면, 해당 명령어와 짝지어진 문구 중 하나가 랜덤으로 출력되는 방식입니다.
            </p>
            <p className="text-[14px] leading-[1.7] text-foreground/70 mb-6">
              만약 <strong>[허기]</strong>라는 명령어를 사용하면 아래 표에 있는 허기 문구 3개 중 하나가 무작위로 반환됩니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-border p-3 text-left font-semibold w-[120px]">명령어</th>
                    <th className="border border-border p-3 text-left font-semibold">예시 문구 (업그레이드 시 사용 가능)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 align-top">패션</td>
                    <td className="border border-border p-3 font-mono text-[13px]">오늘의 패션 점수는 <span className="font-bold text-[#ff7b00]">{'{1d100}'}</span>점입니다.</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border border-border p-3 align-top">능력치</td>
                    <td className="border border-border p-3 font-mono text-[13px]">능력치는 민첩: <span className="font-bold text-[#ff7b00]">{'{3d6}'}</span> / 힘: <span className="font-bold text-[#ff7b00]">{'{3d10+5}'}</span> / 운: <span className="font-bold text-[#ff7b00]">{'{1d100}'}</span> 입니다.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 align-top">허기</td>
                    <td className="border border-border p-3 font-mono text-[13px]"><span className="font-bold text-[#ff7b00]">{'{시전자}'}</span><span className="font-bold text-[#ff7b00]">{'{은는}'}</span> 배가 고픕니다.</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border border-border p-3 align-top">허기</td>
                    <td className="border border-border p-3 font-mono text-[13px]">배가 고픈 나머지 <span className="font-bold text-[#ff7b00]">{'{시전자}'}</span><span className="font-bold text-[#ff7b00]">{'{이가}'}</span> 옆에 있던 친구를 잡아먹었습니다.</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 align-top">허기</td>
                    <td className="border border-border p-3 font-mono text-[13px]">여러분, <span className="font-bold text-[#ff7b00]">{'{시전자}'}</span><span className="font-bold text-[#ff7b00]">{'{을를}'}</span> 굶기지 마세요.</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border border-border p-3 align-top">즐거운 발견</td>
                    <td className="border border-border p-3 font-mono text-[13px]">당신은 <span className="font-bold text-[#ff7b00]">{'{랜덤: 숟가락, 젓가락, 밥그릇, 깨진 유리}'}</span><span className="font-bold text-[#ff7b00]">{'{을를}'}</span> 찾아냈습니다!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 봇 타입들 */}
        <section className="py-10">
          <div className="mb-10 border-b border-border pb-4">
            <h2 className="text-[29px] tracking-[-0.01em] font-semibold">봇 타입 상세</h2>
          </div>

          {/* 메인 봇 타입 선택 안내 */}
          <p className="mb-6 text-[13px] text-foreground/60">
            * 기본 / 기본&상점 / 기본&상점&스탯 타입은 서로 포함 관계이므로 <span className="font-semibold text-foreground/80">하나만</span> 선택할 수 있어요.
          </p>

          <div className="space-y-8">
            {botTypes.map((type, index) => {
              const typeSelected = isItemInEstimate(type.name);
              const headerContent = (
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    {type.price > 0 && (
                      <div
                        className={`w-6 h-6 min-w-[24px] rounded border-2 flex items-center justify-center transition-all shrink-0 ${typeSelected ? 'border-[#ff7b00] bg-[#ff7b00]' : 'border-gray-300'
                          }`}
                        aria-hidden
                      >
                        {typeSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                    )}
                    <h3 className="text-[16px] font-semibold text-black">{type.name}</h3>
                  </div>
                  <span className="text-[15px] font-mono leading-normal text-[#ff7b00] shrink-0">
                    {type.price ? `₩${type.price.toLocaleString()}` : '협의'}
                  </span>
                </div>
              );
              return (
                <div key={index} className={`border transition-colors ${typeSelected ? 'border-[#ff7b00] bg-[#fff5eb]/30 ring-2 ring-[#ff7b00]/20' : 'border-border hover:border-[#ff7b00]/30'}`}>
                  {type.price > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleToggleEstimate(type.name, type.price, type.features.join(', '))}
                      className="w-full flex justify-between items-center p-6 bg-black/[0.01] border-b border-border text-left hover:bg-[#fff5eb]/50 transition-colors focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                      aria-pressed={typeSelected}
                      aria-label={typeSelected ? `${type.name} 견적에서 제거` : `${type.name} 견적에 추가`}
                    >
                      {headerContent}
                    </button>
                  ) : (
                    <div className="flex justify-between items-center p-6 bg-black/[0.01] border-b border-border">
                      {headerContent}
                    </div>
                  )}

                  <div className="p-6 space-y-6">
                    <ul className="space-y-3">
                      {type.features.map((feature, i) => (
                        <li key={i} className="text-[14px] leading-[1.7] flex gap-3">
                          <span className="text-[#ff7b00] shrink-0">—</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* 자동조사 타입 예시 드롭다운 */}
                    {type.name === '자동조사 타입' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setInvestigationExampleOpen(!investigationExampleOpen)}
                          className="w-full flex items-center justify-between p-3 bg-black/[0.02] border border-border hover:border-[#ff7b00]/30 transition-all text-left focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                        >
                          <span className="text-[13px] font-semibold">예시 조사 보기</span>
                          <ChevronDown className={`w-4 h-4 text-foreground/60 transition-transform duration-300 ${investigationExampleOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {investigationExampleOpen && (
                          <div className="border border-t-0 border-border p-4 space-y-3 animate-slideDown">
                            {[
                              { role: '캐릭터', label: '장소 목록 확인', message: '@BOT 오늘은 어디를 돌아다닐까? [장소 목록]' },
                              { role: '자동봇', label: '장소 목록 출력', message: '@character\n현재 진입할 수 있는 장소는 다음과 같습니다.\n\n- 운동장\n- 교실\n- 음악실\n\n[진입/장소명]으로 조사를 시작할 수 있습니다.' },
                              { role: '캐릭터', label: '장소 진입', message: '@BOT (운동장으로 이동한다.) [진입/운동장]' },
                              { role: '자동봇', label: '진입 시 문구 출력', message: '@character 해가 길게 드리운 운동장이다. [철봉], [모래밭], [스탠드 구석]을 조사할 수 있다.' },
                              { role: '캐릭터', label: '조사 포인트 선택', message: '@BOT (모래밭을 살핀다.) [조사/모래밭]' },
                              { role: '자동봇', label: '조사 시 문구 출력', message: '@character\n[모래밭]\n\n당신은 모래를 파헤친다. 날카로운 유리 조각이 손끝을 스쳐도 아랑곳않고 모래밭을 뒤적인다. 기념주화 3개와 [접힌 쪽지]를 발견했다.\n\n➭ \'기념주화\' 3개 획득\n➭ 체력 -3' },
                              { role: '캐릭터', label: '다음 조사 포인트 선택', message: '@BOT 응? 이게 뭐지? [조사/접힌 쪽지]' },
                              { role: '자동봇', label: '조사 시 문구 출력', message: '@character\n[접힌 쪽지]\n\n쪽지 안에는 \'해가 지면 1학년 3반 교실로 찾아와. - 너의 친구\'라는 글이 적혀 있다. 오래된 것 같다.' },
                            ].map((turn, i) => {
                              const isCharacter = turn.role === '캐릭터';
                              return (
                                <div key={i}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[11px] font-semibold ${isCharacter ? 'text-blue-600' : 'text-[#ff7b00]'}`}>
                                      {turn.role}
                                    </span>
                                    <span className="text-[11px] text-foreground/50">{turn.label}</span>
                                  </div>
                                  <pre className={`text-[11.5px] whitespace-pre-wrap font-sans leading-[1.6] p-2.5 rounded border ${isCharacter ? 'bg-blue-50/60 border-blue-100 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                    {turn.message}
                                  </pre>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 오마카세 타입 추가 정보 드롭다운 */}
                    {type.name === '오마카세 타입' && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setOmakaseDetailOpen(!omakaseDetailOpen)}
                          className="w-full flex items-center justify-between p-4 bg-black/[0.02] border border-border hover:border-[#ff7b00]/30 transition-all text-left focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
                        >
                          <span className="text-[15px] font-semibold">오마카세 기능 상세 설명</span>
                          <ChevronDown className={`w-5 h-5 text-foreground/60 transition-transform duration-300 ${omakaseDetailOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {omakaseDetailOpen && (
                          <div className="border border-t-0 border-border p-6 space-y-6 animate-slideDown">
                            {/* 안내 */}
                            <p className="text-[15px] leading-[1.8] text-foreground/80">
                              구현을 원하는 시스템을 정리한 <span className="font-medium text-[#ff7b00]">외부 문서 링크</span>를 전달해 주세요.<br />
                              (시스템 문서와는 별도의 문서여야 합니다)
                            </p>

                            <hr className="border-border" />

                            {/* 문서에 포함되어야 할 내용 */}
                            <div>
                              <h4 className="text-[14px] font-semibold mb-3">문서에 포함되어야 할 내용</h4>
                              <ul className="space-y-1.5 text-[14px] text-foreground/70">
                                <li className="flex gap-2"><span className="text-[#ff7b00] shrink-0">—</span>러너가 입력할 명령어 (예: [사용/사과])</li>
                                <li className="flex gap-2"><span className="text-[#ff7b00] shrink-0">—</span>명령어 입력 후 봇이 처리할 내용</li>
                                <li className="flex gap-2"><span className="text-[#ff7b00] shrink-0">—</span>러너에게 보여줄 결과 메시지</li>
                              </ul>
                            </div>

                            <hr className="border-border" />

                            {/* 작성 예시 */}
                            <div>
                              <h4 className="text-[14px] font-semibold mb-3">작성 예시</h4>
                              <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-[13px] font-mono space-y-1.5 leading-[1.8]">
                                <p className="text-green-400">"[사용/아이템명] 명령어를 추가하고 싶어요!"</p>
                                <p className="text-gray-400">→ 러너가 [사용/사과]를 입력하면</p>
                                <p className="text-gray-400">→ 봇이 러너의 소지품에서 사과를 삭제하고, 체력을 +10 해준 뒤</p>
                                <p className="text-gray-400">→ "사과를 사용했습니다! 체력이 +10 되었습니다." 라고 답변해 주세요.</p>
                              </div>
                            </div>

                            {/* 예시 신청서 버튼 */}
                            <a
                              href="https://stellar-ground-601.notion.site/310d06ebad99807a99d1fbf4e8fc9ace"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7b00] text-white rounded-md font-medium text-[14px] hover:bg-[#e66d00] transition-colors"
                            >
                              예시 오마카세 신청서 보기
                              <span>→</span>
                            </a>

                            <hr className="border-border" />

                            {/* 작성 가이드 */}
                            <div className="space-y-1.5 text-[13px] text-foreground/60">
                              <p>군더더기 없이 깔끔한 언어로 작성해 주세요. 불필요한 부사와 형용사는 사용하지 않습니다.</p>
                              <p>구현을 원하는 시스템만 작성해 주세요.</p>
                            </div>

                            {/* 경고 알럿 */}
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
                              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                              <p className="text-[13px] text-red-700 font-medium">
                                오마카세 신청서를 한번에 이해하기 어려울 시, 신청이 거절될 수 있습니다.
                              </p>
                            </div>

                            {/* 진행 불가 안내 */}
                            {type.note && (
                              <div className="text-[13px] text-foreground/50 pt-2 border-t border-border">
                                {type.note}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 오마카세가 아닌 타입의 note */}
                    {type.note && type.name !== '오마카세 타입' && (
                      <div className="bg-black/[0.02] border border-border p-6 mt-6">
                        <p className="text-[15px] leading-[1.7] text-foreground/70">
                          {type.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
            {additionalOptions.map((option, index) => {
              const optionNames = option.aliases ? [option.name, ...option.aliases] : [option.name];
              const isSelected = items.some(item => optionNames.includes(item.name));
              const desc = option.description;
              const requiresList = option.requires
                ? Array.isArray(option.requires)
                  ? option.requires
                  : [option.requires]
                : [];
              const requiresMet = requiresList.length === 0 || requiresList.some(r => isItemInEstimate(r));
              const disabled = !requiresMet && !isSelected;
              const requiresLabel = option.requiresLabel ?? (requiresList.length > 0 ? requiresList.join(' 또는 ') : '');
              const handleClick = () => {
                if (disabled) {
                  setToastMessage(`'${option.name}'은(는) ${requiresLabel}을(를) 먼저 선택해 주세요.`);
                  return;
                }
                if (isSelected) {
                  const existing = items.find(item => optionNames.includes(item.name));
                  if (existing) removeItem(existing.id);
                } else {
                  addItem({
                    name: option.name,
                    price: option.price,
                    category: 'bot',
                    description: desc,
                  });
                }
              };
              return (
                <button
                  key={index}
                  type="button"
                  onClick={handleClick}
                  className={`w-full border p-5 transition-all text-left ${disabled
                    ? 'border-border bg-gray-50/60 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                    } focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2`}
                  aria-pressed={isSelected}
                  aria-disabled={disabled}
                  aria-label={disabled ? `${option.name} — ${requiresLabel} 선택 필요` : isSelected ? `${option.name} 견적에서 제거` : `${option.name} 견적에 추가`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-6 h-6 min-w-[24px] rounded border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'border-[#ff7b00] bg-[#ff7b00]' : 'border-gray-300'}`} aria-hidden>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <h3 className="text-[15px] text-black font-semibold">{option.name}</h3>
                        {desc && <span className="text-[14px] leading-[1.6] text-foreground/60">{desc}</span>}
                        {disabled && (
                          <p className="text-[12px] text-foreground/50 mt-1">* {requiresLabel}을(를) 먼저 선택해 주세요.</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[14px] font-mono leading-normal text-[#ff7b00] shrink-0 pl-10 md:pl-0 text-right">{option.priceLabel ?? (option.price === 0 ? '협의' : `₩${option.price.toLocaleString()}`)}</span>
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