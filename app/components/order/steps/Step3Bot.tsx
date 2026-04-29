import { useOrder } from '@/app/contexts/OrderContext';
import { useEffect, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { AlertTriangle } from 'griddy-icons';

// yyyy-mm-dd → MM/DD
function ymdToMonthDay(date: string): string {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length !== 3) return '';
  const m = (parts[1] || '').padStart(2, '0');
  const d = (parts[2] || '').padStart(2, '0');
  if (!m || !d || m === '00' || d === '00') return '';
  return `${m}/${d}`;
}

// MM/DD 입력값을 4자리 안으로 정규화 (자동 슬래시 삽입)
function normalizeMonthDayInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// 원 단위 금액을 "n.n만원" 형태로 표시 (정수면 소수점 생략)
function formatManwon(won: number): string {
  if (!won || won <= 0) return '0원';
  const man = won / 10000;
  if (Number.isInteger(man)) return `${man}만원`;
  return `${man.toFixed(1)}만원`;
}

// MM/DD ~ MM/DD 사이 주수 계산 (종료일이 시작일보다 이르면 다음 해로 가정)
function calculateWeeksFromMonthDay(start: string, end: string, baseYear: number): number {
  const startMatch = start.match(/^(\d{1,2})\/(\d{1,2})$/);
  const endMatch = end.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!startMatch || !endMatch) return 0;
  const sm = parseInt(startMatch[1], 10);
  const sd = parseInt(startMatch[2], 10);
  const em = parseInt(endMatch[1], 10);
  const ed = parseInt(endMatch[2], 10);
  if (sm < 1 || sm > 12 || em < 1 || em > 12 || sd < 1 || sd > 31 || ed < 1 || ed > 31) return 0;
  const startDate = new Date(baseYear, sm - 1, sd);
  let endDate = new Date(baseYear, em - 1, ed);
  if (endDate.getTime() < startDate.getTime()) {
    endDate = new Date(baseYear + 1, em - 1, ed);
  }
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, Math.round(diffDays / 7));
}

// 견적에서 선택됨 배지 컴포넌트
function FromCartBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-medium rounded-full ml-2">
      <ShoppingCart className="w-3 h-3" />
      견적에서 선택됨
    </span>
  );
}

export default function Step3Bot() {
  const { formData, updateStep3, cartSyncState } = useOrder();
  const step3 = formData.step3;
  const step1 = formData.step1;

  // 견적에서 동기화된 항목인지 확인
  const isFromCart = (itemName: string) => {
    return cartSyncState?.syncedItems?.some(name =>
      name.includes(itemName) || itemName.includes(name)
    ) ?? false;
  };

  // 봇 타입이 견적에서 선택되었는지
  const basicBotFromCart = isFromCart('기본 타입');
  const basicShopBotFromCart = isFromCart('기본&상점 타입') && !isFromCart('기본&상점&스탯');
  const basicShopStatBotFromCart = isFromCart('기본&상점&스탯 타입');
  // 추가 기능이 견적에서 선택되었는지
  const cocBotFromCart = isFromCart('CoC');
  const customCommandUpgradeFromCart = isFromCart('커스텀 명령어');
  const reservationFromCart = isFromCart('예약 툿');
  const autoProfileFromCart = isFromCart('스토리 자동 진행');
  const tootCurrencyFromCart = isFromCart('툿수-재화 자동반영');
  const transferFromCart = isFromCart('양도 기능');
  const attendanceFromCart = isFromCart('출석 시스템');
  const omakaseFromCart = isFromCart('오마카세');
  const investigationFromCart = isFromCart('자동조사');

  // 자동봇 신청 시 가동 일정 기본값 채우기 (한 번만)
  useEffect(() => {
    if (step3.applyBot !== 'yes') return;
    if (step3.operationWeeksOption !== null) return;
    const updates: Record<string, unknown> = { operationWeeksOption: 'manual' };
    if (!step3.botStartDate && step1.resultAnnouncementDate) {
      updates.botStartDate = ymdToMonthDay(step1.resultAnnouncementDate);
    }
    if (!step3.botEndDate && step1.closingDate) {
      updates.botEndDate = ymdToMonthDay(step1.closingDate);
    }
    updateStep3(updates);
  }, [
    step3.applyBot,
    step3.operationWeeksOption,
    step3.botStartDate,
    step3.botEndDate,
    step1.resultAnnouncementDate,
    step1.closingDate,
    updateStep3,
  ]);

  // 가동 주수 자동 계산 (manual 모드)
  const computedBotWeeks = useMemo(() => {
    if (step3.operationWeeksOption !== 'manual') return 0;
    if (!step3.botStartDate || !step3.botEndDate) return 0;
    const baseYear = step1.closingDate
      ? parseInt(step1.closingDate.split('-')[0], 10) || new Date().getFullYear()
      : new Date().getFullYear();
    return calculateWeeksFromMonthDay(step3.botStartDate, step3.botEndDate, baseYear);
  }, [step3.operationWeeksOption, step3.botStartDate, step3.botEndDate, step1.closingDate]);

  useEffect(() => {
    if (step3.operationWeeksOption !== 'manual') return;
    if (computedBotWeeks !== step3.manualWeeks) {
      updateStep3({ manualWeeks: computedBotWeeks });
    }
  }, [computedBotWeeks, step3.manualWeeks, step3.operationWeeksOption, updateStep3]);

  // 양도 기능 노출 조건: 상점 또는 스탯 선택 시
  const showTransferFeature =
    step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat';

  // 출석 시스템 노출 조건: 상점 또는 스탯 선택 시
  const showAttendanceSystem = showTransferFeature;

  // 재화 단위 필드 노출 조건: 상점 또는 스탯
  const showCurrencyUnit = showTransferFeature;

  // 스탯 목록 필드 노출 조건: 스탯 선택 시
  const showStatList = step3.mainBot === 'basicShopStat';

  // "아니오" 선택 시 모든 하위 필드 초기화
  const handleBotApplyChange = (value: 'yes' | 'no') => {
    updateStep3({ applyBot: value });
    if (value === 'no') {
      updateStep3({
        operationWeeksOption: null,
        manualWeeks: 0,
        botStartDate: '',
        botEndDate: '',
        mainBot: null,
        cocBot: false,
        omakaseBot: false,
        investigationBot: false,
        investigationDailyLimit: false,
        investigationDailyLimitCount: 0,
        customCommandUpgrade: false,
        reservationToot: false,
        autoProfileImage: false,
        tootCurrencyLink: false,
        transferFeature: false,
        transferOption: null,
        attendanceSystem: false,
        attendanceCurrencyAmount: 10,
        attendanceCommand: '[출석]',
        currencyUnit: '',
        statList: '',
        accountList: '',
        tootPerCurrency: '',
        omakaseDetails: '',
        setupDeadline: '',
        botSymbol: '✶',
        botAccountId: '',
        cocBotAccountId: '',
        investigationBotAccountId: '',
      });
    }
  };

  // 메인 봇 변경 시 의존 필드 초기화
  const handleMainBotChange = (bot: typeof step3.mainBot) => {
    updateStep3({ mainBot: bot });

    // 기본 봇 선택 시 상점/스탯 의존 옵션 초기화
    if (bot === 'basic') {
      updateStep3({
        transferFeature: false,
        transferOption: null,
        attendanceSystem: false,
        tootCurrencyLink: false,
        tootPerCurrency: '',
      });
    }

    // 메인 봇 미선택 시 조사 자동봇 및 하위 옵션 초기화
    if (bot === null) {
      updateStep3({
        investigationBot: false,
        investigationDailyLimit: false,
        investigationDailyLimitCount: 0,
        investigationBotAccountId: '',
      });
    }

    // 메인 봇 미선택 시 상점/스탯 의존 옵션 초기화
    if (bot === null) {
      updateStep3({
        attendanceSystem: false,
        transferFeature: false,
        transferOption: null,
        tootCurrencyLink: false,
        tootPerCurrency: '',
      });
    }
  };

  // 조사 자동봇 해제 시 일일 횟수 제한 초기화
  const handleInvestigationBotChange = (checked: boolean) => {
    updateStep3({ investigationBot: checked });
    if (!checked) {
      updateStep3({
        investigationDailyLimit: false,
        investigationDailyLimitCount: 0,
        investigationBotAccountId: '',
      });
    }
  };

  // CoC 봇 해제 시 분리 계정 초기화
  const handleCocBotChange = (checked: boolean) => {
    updateStep3({ cocBot: checked });
    if (!checked) {
      updateStep3({ cocBotAccountId: '' });
    }
  };

  // 조사 자동봇 사용 가능 조건 (메인 봇이 선택된 경우)
  const canHaveInvestigationBot = step3.mainBot !== null;

  // 분리 계정 입력 노출 조건
  const showCocBotAccount = step3.cocBot && step3.mainBot !== null;
  const showInvestigationBotAccount =
    step3.investigationBot && canHaveInvestigationBot;
  const requiresSeparateAccounts = showCocBotAccount || showInvestigationBotAccount;

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="pb-6 border-b border-border animate-fadeInDown">
        <h2 className="text-[25px] font-semibold mb-2 bg-gradient-to-r from-[#ff7b00] to-[#ff9933] bg-clip-text text-transparent">
          Step 3. 자동봇 커미션
        </h2>
        <p className="text-[14px] text-gray-600">
          자동봇 기능이 필요하신가요? 필요하지 않으시다면 "아니오"를 선택해 주세요.
        </p>
      </div>

      {/* 1) 자동봇 신청 여부 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-[18px] font-semibold">
            1) 자동봇을 신청하시나요? <span className="text-red-500">*</span>
            {step3.applyBot === 'yes' && (basicBotFromCart || basicShopBotFromCart || basicShopStatBotFromCart || cocBotFromCart || omakaseFromCart || investigationFromCart) && <FromCartBadge />}
          </span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="applyBot"
              checked={step3.applyBot === 'yes'}
              onChange={() => handleBotApplyChange('yes')}
              className="w-4 h-4 accent-[#ff7b00]"
            />
            <span className="text-[14px]">예</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="applyBot"
              checked={step3.applyBot === 'no'}
              onChange={() => handleBotApplyChange('no')}
              className="w-5 h-5 accent-[#ff7b00] cursor-pointer"
            />
            <span className="text-[14px]">아니오</span>
          </label>
        </div>
      </div>

      {/* 자동봇 "예" 선택 시에만 표시되는 옵션들 */}
      {step3.applyBot === 'yes' && (
        <div className="space-y-8 pt-6 border-t border-gray-200 animate-slideDown">
          {/* 2) 운영 기간 설정 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[18px] font-semibold mb-1">2) 운영 기간 설정 <span className="text-red-500">*</span></h3>
            </div>

            <div className="space-y-3">
              {/* 장기 소규모 옵션 */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step3.operationWeeksOption === 'longterm'
                    ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                    : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="operationWeeksOption"
                  checked={step3.operationWeeksOption === 'longterm'}
                  onChange={() => updateStep3({ operationWeeksOption: 'longterm', manualWeeks: 0 })}
                  className="w-4 h-4 mt-1 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="text-[14px] font-medium">6개월 이상 장기 소규모 서버를 위한 자동봇이에요.</span>
                    <span className="text-[14px] font-mono text-[#ff7b00] shrink-0">1만원</span>
                  </div>
                  {step3.operationWeeksOption === 'longterm' && (
                    <p className="text-[13px] leading-[1.7] text-gray-700 border-l-2 border-[#ff7b00] pl-3">
                      자동봇이 마스토돈과 동일한 머신에 설치됩니다. 가동 주수에 따른 비용이 없는 대신, 초기 세팅 비용 1만원이 청구됩니다.
                    </p>
                  )}
                </div>
              </label>

              {/* 자캐 커뮤니티 옵션 */}
              <label
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step3.operationWeeksOption === 'manual'
                    ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                    : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="operationWeeksOption"
                  checked={step3.operationWeeksOption === 'manual'}
                  onChange={() => updateStep3({ operationWeeksOption: 'manual' })}
                  className="w-4 h-4 mt-1 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="text-[14px] font-medium">자캐 커뮤니티를 위한 자동봇이에요.</span>
                    <span className="text-[14px] font-mono text-[#ff7b00] shrink-0">주당 5천원</span>
                  </div>
                  {step3.operationWeeksOption === 'manual' && (
                    <>
                      <p className="text-[13px] leading-[1.7] text-gray-700 border-l-2 border-[#ff7b00] pl-3">
                        기본적으로 합격자 발표일 ~ 폐장일을 기재해 주세요. 애프터 기간에도 자동봇 사용을 원하신다면 종료 일정을 늘리시거나, 이후 가동 기간을 추가하실 수 있습니다.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={step3.botStartDate}
                          onChange={(e) => updateStep3({ botStartDate: normalizeMonthDayInput(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="MM/DD"
                          aria-label="가동 시작일"
                          className="w-24 px-3 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px] font-mono text-center"
                        />
                        <span className="text-[14px] text-gray-500">~</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={step3.botEndDate}
                          onChange={(e) => updateStep3({ botEndDate: normalizeMonthDayInput(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="MM/DD"
                          aria-label="가동 종료일"
                          className="w-24 px-3 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px] font-mono text-center"
                        />
                        <span className="text-[14px] text-gray-700">
                          ({step3.manualWeeks}주, {formatManwon(step3.manualWeeks * 5000)})
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* 3) 메인 봇 종류 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[18px] font-semibold mb-1">3) 메인 봇 종류 <span className="text-red-500">*</span></h3>
              <p className="text-[13px] text-gray-600">
                기본 계열 봇은 중복 선택할 수 없으며, CoC 봇은 기본 계열 봇과 함께 선택하거나 단독으로 신청할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1) 기본 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step3.mainBot === 'basic'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="mainBot"
                  checked={step3.mainBot === 'basic'}
                  onChange={() => handleMainBotChange('basic')}
                  onClick={() => {
                    if (step3.mainBot === 'basic') handleMainBotChange(null);
                  }}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    1) 기본
                    {basicBotFromCart && step3.mainBot === 'basic' && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">15,000원</div>
                </div>
              </label>

              {/* 2) 기본+상점 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step3.mainBot === 'basicShop'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="mainBot"
                  checked={step3.mainBot === 'basicShop'}
                  onChange={() => handleMainBotChange('basicShop')}
                  onClick={() => {
                    if (step3.mainBot === 'basicShop') handleMainBotChange(null);
                  }}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    2) 기본+상점
                    {basicShopBotFromCart && step3.mainBot === 'basicShop' && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">35,000원</div>
                </div>
              </label>

              {/* 3) 기본+상점+스탯 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step3.mainBot === 'basicShopStat'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="mainBot"
                  checked={step3.mainBot === 'basicShopStat'}
                  onChange={() => handleMainBotChange('basicShopStat')}
                  onClick={() => {
                    if (step3.mainBot === 'basicShopStat') handleMainBotChange(null);
                  }}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    3) 기본+상점+스탯
                    {basicShopStatBotFromCart && step3.mainBot === 'basicShopStat' && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">45,000원</div>
                </div>
              </label>

              {/* 4) CoC 봇 (중복 선택 가능) */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step3.cocBot
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={step3.cocBot}
                  onChange={(e) => handleCocBotChange(e.target.checked)}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    4) CoC 봇
                    {cocBotFromCart && step3.cocBot && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">+30,000원</div>
                </div>
              </label>
            </div>
          </div>

          {/* 4) 추가 기능 선택 */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold">4) 추가 기능 선택</h3>

            {/* 조사 자동봇 (메인 봇 선택 시) */}
            {canHaveInvestigationBot && (
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.investigationBot
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                  }`}>
                  <input
                    type="checkbox"
                    checked={step3.investigationBot}
                    onChange={(e) => handleInvestigationBotChange(e.target.checked)}
                    className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[14px]">
                      조사 자동봇
                      {investigationFromCart && step3.investigationBot && <FromCartBadge />}
                    </div>
                    <div className="text-[13px] text-gray-600 mt-1">+20,000원 — 메인 봇(기본 / 기본+상점 / 기본+상점+스탯)과 함께 신청 시 추가 가능</div>
                  </div>
                </label>

                {/* 일일 조사 횟수 제한 (조사 자동봇 선택 시에만) */}
                {step3.investigationBot && (
                  <div className="ml-7 space-y-3">
                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.investigationDailyLimit
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                      }`}>
                      <input
                        type="checkbox"
                        checked={step3.investigationDailyLimit}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          updateStep3({ investigationDailyLimit: checked });
                          if (!checked) updateStep3({ investigationDailyLimitCount: 0 });
                        }}
                        className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-[14px]">일일 조사 횟수 제한</div>
                        <div className="text-[13px] text-gray-600 mt-1">+5,000원 — [조사] 명령어 사용 시 1회 카운트</div>
                      </div>
                    </label>

                    {step3.investigationDailyLimit && (
                      <div className="ml-7 space-y-2">
                        <label htmlFor="investigationDailyLimitCount" className="block text-[14px] font-medium">
                          일일 조사 횟수
                        </label>
                        <input
                          id="investigationDailyLimitCount"
                          type="number"
                          min="1"
                          value={step3.investigationDailyLimitCount || ''}
                          onChange={(e) => updateStep3({ investigationDailyLimitCount: parseInt(e.target.value) || 0 })}
                          placeholder="예: 3"
                          className="w-full md:w-48 px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 커스텀 명령어 업그레이드 */}
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.customCommandUpgrade
              ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
              : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
              <input
                type="checkbox"
                checked={step3.customCommandUpgrade}
                onChange={(e) => updateStep3({ customCommandUpgrade: e.target.checked })}
                className="w-4 h-4 shrink-0 accent-[#ff7b00]"
              />
              <div className="flex-1">
                <div className="font-medium text-[14px]">
                  커스텀 명령어 업그레이드
                  {customCommandUpgradeFromCart && step3.customCommandUpgrade && <FromCartBadge />}
                </div>
                <div className="text-[13px] text-gray-600 mt-1">+5,000원 — 유저 이름/은는맞춤/문구 내 다이스 기능 추가</div>
              </div>
            </label>

            {/* 예약 툿 */}
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.reservationToot
              ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
              : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
              <input
                type="checkbox"
                checked={step3.reservationToot}
                onChange={(e) => updateStep3({ reservationToot: e.target.checked })}
                className="w-4 h-4 shrink-0 accent-[#ff7b00]"
              />
              <div className="flex-1">
                <div className="font-medium text-[14px]">
                  예약 툿
                  {reservationFromCart && step3.reservationToot && <FromCartBadge />}
                </div>
                <div className="text-[13px] text-gray-600 mt-1">+5,000원</div>
              </div>
            </label>

            {/* 자동 스진 */}
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.autoProfileImage
              ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
              : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
              <input
                type="checkbox"
                checked={step3.autoProfileImage}
                onChange={(e) => updateStep3({ autoProfileImage: e.target.checked })}
                className="w-4 h-4 shrink-0 accent-[#ff7b00]"
              />
              <div className="flex-1">
                <div className="font-medium text-[14px]">
                  자동 스진
                  {autoProfileFromCart && step3.autoProfileImage && <FromCartBadge />}
                </div>
                <div className="text-[13px] text-gray-600 mt-1">+5,000원</div>
              </div>
            </label>

            {/* 예약 툿 또는 자동 스진 선택 시 계정 목록 입력 */}
            {(step3.reservationToot || step3.autoProfileImage) && (
              <div className="ml-7 space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <label htmlFor="accountList" className="block text-[14px] font-medium">
                    예약 툿 혹은 스토리 진행에 사용할 계정 목록
                  </label>
                  <p className="text-[13px] text-gray-600">
                    예약 툿을 발송해야 하거나 자동 스토리 진행에 참여하기를 원하는 계정의 희망 아이디를 모두 적어주세요.<br />
                    마스토돈 개인 서버는 아이디 겹침을 고려하지 않으셔도 됩니다.<br />
                    최대한 간결한 이름, 특히 전체 대문자로 통일하여 캐릭터 계정과 차이를 두는 것을 추천드립니다.
                  </p>
                  <input
                    id="accountList"
                    type="text"
                    value={step3.accountList}
                    onChange={(e) => updateStep3({ accountList: e.target.value })}
                    placeholder="@NOTICE, @SYSTEM"
                    className="w-full px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <p className="text-[13px] text-gray-700">
                    <span className="font-medium">Q.</span> 저희는 NPC 계정을 만들 거긴 한데, 얘는 예약 툿 굳이 안보내도 되고 스진에도 등장하지 않아요.<br />
                    <span className="font-medium">A.</span> 빼고 적으시면 됩니다.
                  </p>
                  <p className="text-[13px] text-gray-700">
                    <span className="font-medium">Q.</span> 저희는 시스템 계정이 굳이 예약 툿을 안 보내도 돼요.<br />
                    <span className="font-medium">A.</span> 빼고 적으시면 됩니다.
                  </p>
                </div>
              </div>
            )}

            {/* 툿-재화 연동 (조건부 - 상점/스탯) */}
            {showTransferFeature && (
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.tootCurrencyLink
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                  }`}>
                  <input
                    type="checkbox"
                    checked={step3.tootCurrencyLink}
                    onChange={(e) => updateStep3({ tootCurrencyLink: e.target.checked })}
                    className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[14px]">
                      툿-재화 연동
                      {tootCurrencyFromCart && step3.tootCurrencyLink && <FromCartBadge />}
                    </div>
                    <div className="text-[13px] text-gray-600 mt-1">+10,000원</div>
                  </div>
                </label>

                {step3.tootCurrencyLink && (
                  <div className="ml-7 space-y-2">
                    <label htmlFor="tootPerCurrency" className="block text-[14px] font-medium">
                      몇 툿당 소지금에 얼마가 추가되어야 하나요?
                    </label>
                    <input
                      id="tootPerCurrency"
                      type="text"
                      value={step3.tootPerCurrency}
                      onChange={(e) => updateStep3({ tootPerCurrency: e.target.value })}
                      placeholder="예: 50툿당 1갈레온"
                      className="w-full px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 출석 시스템 (조건부 - 상점/스탯) */}
            {showAttendanceSystem && (
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.attendanceSystem
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                  }`}>
                  <input
                    type="checkbox"
                    checked={step3.attendanceSystem}
                    onChange={(e) => updateStep3({ attendanceSystem: e.target.checked })}
                    className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[14px]">
                      출석 시스템
                      {attendanceFromCart && step3.attendanceSystem && <FromCartBadge />}
                    </div>
                    <div className="text-[13px] text-gray-600 mt-1">
                      +10,000원 — 매일 [출석] 혹은 지정한 명령어 사용 시 1회 출석, 운영진이 지정한 재화 획득
                    </div>
                  </div>
                </label>

                {step3.attendanceSystem && (
                  <div className="ml-7 space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="space-y-2">
                      <label htmlFor="attendanceCurrencyAmount" className="block text-[14px] font-medium">
                        출석 시 받을 재화의 수
                      </label>
                      <input
                        id="attendanceCurrencyAmount"
                        type="number"
                        min="1"
                        step="1"
                        value={step3.attendanceCurrencyAmount || ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '') {
                            updateStep3({ attendanceCurrencyAmount: 0 });
                            return;
                          }
                          const parsed = parseInt(raw, 10);
                          if (Number.isFinite(parsed) && parsed >= 0) {
                            updateStep3({ attendanceCurrencyAmount: parsed });
                          }
                        }}
                        placeholder="예: 10"
                        className="w-full md:w-48 px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                      />
                      <p className="text-[12px] text-gray-500">정수만 입력해 주세요. 기본값은 10입니다.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="attendanceCommand" className="block text-[14px] font-medium">
                        출석 기능으로 사용할 명령어
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[16px] font-mono text-gray-700 px-2 py-2 bg-white border border-input border-r-0 rounded-l-md">[</span>
                        <input
                          id="attendanceCommand"
                          type="text"
                          value={(step3.attendanceCommand || '[출석]').replace(/^\[|\]$/g, '')}
                          onChange={(e) => {
                            const inner = e.target.value.replace(/[\[\]]/g, '').trim();
                            updateStep3({ attendanceCommand: `[${inner}]` });
                          }}
                          onBlur={() => {
                            const inner = (step3.attendanceCommand || '').replace(/[\[\]]/g, '').trim();
                            updateStep3({ attendanceCommand: `[${inner || '출석'}]` });
                          }}
                          placeholder="출석"
                          className="flex-1 md:max-w-[200px] px-3 py-2 border border-input border-x-0 focus:border-[#ff7b00] focus:outline-none text-[14px] font-mono"
                        />
                        <span className="text-[16px] font-mono text-gray-700 px-2 py-2 bg-white border border-input border-l-0 rounded-r-md">]</span>
                      </div>
                      <p className="text-[12px] text-gray-500">예: 출석, 보고, 기상 — 항상 대괄호로 감싸 사용됩니다.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 양도 기능 (조건부) */}
            {showTransferFeature && (
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.transferFeature
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                  }`}>
                  <input
                    type="checkbox"
                    checked={step3.transferFeature}
                    onChange={(e) => updateStep3({ transferFeature: e.target.checked })}
                    className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[14px]">
                      양도 기능
                      {transferFromCart && step3.transferFeature && <FromCartBadge />}
                    </div>
                    <div className="text-[13px] text-gray-600 mt-1">+10,000원</div>
                  </div>
                </label>

                {step3.transferFeature && (
                  <div className="ml-7 space-y-3">
                    <label className="block text-[14px] font-medium">양도 대상</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transferOption"
                          checked={step3.transferOption === 'itemOnly'}
                          onChange={() => updateStep3({ transferOption: 'itemOnly' })}
                          className="w-4 h-4 accent-[#ff7b00]"
                        />
                        <span className="text-[14px]">아이템만</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transferOption"
                          checked={step3.transferOption === 'currencyOnly'}
                          onChange={() => updateStep3({ transferOption: 'currencyOnly' })}
                          className="w-4 h-4 accent-[#ff7b00]"
                        />
                        <span className="text-[14px]">재화만</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transferOption"
                          checked={step3.transferOption === 'all'}
                          onChange={() => updateStep3({ transferOption: 'all' })}
                          className="w-4 h-4 accent-[#ff7b00]"
                        />
                        <span className="text-[14px]">모두</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 오마카세 봇 */}
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step3.omakaseBot
                ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                }`}>
                <input
                  type="checkbox"
                  checked={step3.omakaseBot}
                  onChange={(e) => updateStep3({ omakaseBot: e.target.checked })}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    오마카세 봇
                    {omakaseFromCart && step3.omakaseBot && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1 flex items-center gap-1"><AlertTriangle size={13} color="currentColor" /> 가격 상이 (별도 협의)</div>
                </div>
              </label>

              {step3.omakaseBot && (
                <div className="ml-7 space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label htmlFor="omakaseDetails" className="block text-[14px] font-medium">
                    오마카세 기능 상세 설명
                  </label>
                  <div className="text-[13px] text-gray-600 space-y-2">
                    <p>
                      구현을 원하는 시스템을 정리한 <span className="font-medium">외부 문서 링크</span>를 전달해 주세요.<br />
                      (시스템 문서와는 별도의 문서여야 합니다)
                    </p>
                  </div>
                  <div className="mt-3 p-3 bg-white border border-gray-300 rounded-md text-[13px] text-gray-700 space-y-3">
                    <div>
                      <p className="font-medium mb-1">문서에 포함되어야 할 내용:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>러너가 입력할 명령어 (예: [사용/사과])</li>
                        <li>명령어 입력 후 봇이 처리할 내용</li>
                        <li>러너에게 보여줄 결과 메시지</li>
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="font-medium mb-2">작성 예시:</p>
                      <div className="bg-gray-50 p-2 rounded text-[12px] space-y-2">
                        <p className="font-medium">"[사용/아이템명] 명령어를 추가하고 싶어요!"</p>
                        <p>→ 러너가 [사용/사과]를 입력하면</p>
                        <p>→ 봇이 러너의 소지품에서 사과를 삭제하고, 체력을 +10 해준 뒤</p>
                        <p>→ "사과를 사용했습니다! 체력이 +10 되었습니다." 라고 답변해 주세요.</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <a
                        href="https://stellar-ground-601.notion.site/310d06ebad99807a99d1fbf4e8fc9ace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-[#ff7b00] hover:underline font-medium"
                      >
                        예시 오마카세 신청서 보기 →
                      </a>
                    </div>
                    <div className="pt-3 border-t border-gray-200 text-[12px] text-gray-600 space-y-1">
                      <p>군더더기 없이 깔끔한 언어로 작성해 주세요. 불필요한 부사와 형용사는 사용하지 않습니다.</p>
                      <p>구현을 원하는 시스템만 작성해 주세요.</p>
                      <p className="text-amber-600 font-medium">오마카세 신청서를 한번에 이해하기 어려울 시, 신청이 거절될 수 있습니다.</p>
                    </div>
                  </div>
                  <textarea
                    id="omakaseDetails"
                    value={step3.omakaseDetails}
                    onChange={(e) => updateStep3({ omakaseDetails: e.target.value })}
                    placeholder="외부 문서 링크를 입력해 주세요."
                    rows={3}
                    className="w-full px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px] resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 5) 봇 설정 정보 (조건부) */}
          {(showCurrencyUnit || showStatList) && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-[18px] font-semibold mb-4">5) 봇 설정 정보</h3>
              <div className="space-y-4">
                {showCurrencyUnit && (
                  <div className="space-y-2">
                    <label htmlFor="currencyUnit" className="block text-[14px] font-medium">
                      재화 단위
                    </label>
                    <input
                      id="currencyUnit"
                      type="text"
                      value={step3.currencyUnit}
                      onChange={(e) => updateStep3({ currencyUnit: e.target.value })}
                      placeholder="예: 갈레온, 코인, 골드"
                      className="w-full md:w-96 px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                    />
                  </div>
                )}

                {showStatList && (
                  <div className="space-y-2">
                    <label htmlFor="statList" className="block text-[14px] font-medium">
                      스탯 목록
                    </label>
                    <input
                      id="statList"
                      type="text"
                      value={step3.statList}
                      onChange={(e) => updateStep3({ statList: e.target.value })}
                      placeholder="예: 체력, 정신력, 행운"
                      className="w-full md:w-96 px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6) 기타 정보 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold mb-4">{(showCurrencyUnit || showStatList) ? '6)' : '5)'} 기타 정보 <span className="text-red-500">*</span></h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="botSymbol" className="block text-[14px] font-medium">
                  봇 기호
                </label>
                <input
                  id="botSymbol"
                  type="text"
                  value={step3.botSymbol}
                  onChange={(e) => updateStep3({ botSymbol: e.target.value })}
                  placeholder="기본값: ✶"
                  className="w-full md:w-64 px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                />
              </div>

              {requiresSeparateAccounts && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-[13px] text-amber-800 flex items-start gap-2">
                  <AlertTriangle size={16} color="currentColor" className="mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">
                      {showCocBotAccount && showInvestigationBotAccount
                        ? '메인 봇 / CoC 봇 / 조사 자동봇은 각각 별도의 계정으로 운영됩니다.'
                        : showCocBotAccount
                          ? '메인 봇과 CoC 봇은 각각 별도의 계정으로 운영됩니다.'
                          : '메인 봇과 조사 자동봇은 각각 별도의 계정으로 운영됩니다.'}
                    </p>
                    <p>
                      어떤 계정이 어떤 봇으로 사용될지 구분되도록 아이디를 따로 입력해 주세요. (예: @BOT / @CoC / @SEARCH)
                    </p>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 ${requiresSeparateAccounts ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
                <div className="space-y-2">
                  <label htmlFor="botAccountId" className="block text-[14px] font-medium">
                    {requiresSeparateAccounts ? '메인 봇 계정 ID' : '봇 계정 ID'}
                  </label>
                  <input
                    id="botAccountId"
                    type="text"
                    value={step3.botAccountId}
                    onChange={(e) => updateStep3({ botAccountId: e.target.value })}
                    placeholder="@DICE, @BOT"
                    className="w-full px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                  />
                </div>

                {showCocBotAccount && (
                  <div className="space-y-2">
                    <label htmlFor="cocBotAccountId" className="block text-[14px] font-medium">
                      CoC 봇 계정 ID
                    </label>
                    <input
                      id="cocBotAccountId"
                      type="text"
                      value={step3.cocBotAccountId}
                      onChange={(e) => updateStep3({ cocBotAccountId: e.target.value })}
                      placeholder="@CoC"
                      className="w-full px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                    />
                  </div>
                )}

                {showInvestigationBotAccount && (
                  <div className="space-y-2">
                    <label htmlFor="investigationBotAccountId" className="block text-[14px] font-medium">
                      조사 자동봇 계정 ID
                    </label>
                    <input
                      id="investigationBotAccountId"
                      type="text"
                      value={step3.investigationBotAccountId}
                      onChange={(e) => updateStep3({ investigationBotAccountId: e.target.value })}
                      placeholder="@SEARCH"
                      className="w-full px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="setupDeadline" className="block text-[14px] font-medium">
                  세팅 마감일
                </label>
                <input
                  id="setupDeadline"
                  type="text"
                  value={step3.setupDeadline}
                  onChange={(e) => updateStep3({ setupDeadline: e.target.value })}
                  placeholder="MM/DD (예: 03/15)"
                  className="w-full md:w-64 px-4 py-2 border border-input rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                />
                <p className="text-[12px] text-gray-600">월/일 형식으로 입력해 주세요. 오마카세 자동봇 기능 등의 테스트가 필요한 경우, 테스트 기간까지 고려해서 작성합니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "아니오" 선택 시 안내 메시지 */}
      {step3.applyBot === 'no' && (
        <div className="p-6 bg-gray-50 border border-border rounded-lg animate-slideDown">
          <p className="text-[14px] text-gray-700 flex items-center gap-2">
            <span>✓</span>
            자동봇을 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.
          </p>
        </div>
      )}
    </div>
  );
}
