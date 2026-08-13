import { useOrder } from '@/app/contexts/OrderContext';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { useState, useEffect, useMemo } from 'react';
import { validateCharacterLimit, computeRequiredFastDeadline, getDeadlineBlackoutError, validateAccountId, DEADLINE_BLACKOUT_LABEL } from '@/app/utils/orderUtils';
import type { FastDeadlineOption } from '@/app/types/order';
import { ShoppingCart } from 'lucide-react';
import MastodonServerCalculator from '@/app/components/MastodonServerCalculator';

// 견적에서 선택됨 배지 컴포넌트
function FromCartBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-medium rounded-full ml-2">
      <ShoppingCart className="w-3 h-3" />
      견적에서 선택됨
    </span>
  );
}

export default function Step2Server() {
  const { formData, updateStep2, cartSyncState } = useOrder();
  const { serverCalcResult } = useEstimate();
  const step2 = formData.step2;
  // 장기 소규모 서버 선택 시: 검색 기능(검색 서버) 추가 불가 (월 1만원 서버비 유지)
  const isLongTermServer = formData.step1.isLongTermCommunity;
  const [characterLimitError, setCharacterLimitError] = useState<string | null>(null);
  const [adminAccountError, setAdminAccountError] = useState<string | null>(null);

  // 견적에서 동기화된 항목인지 확인
  const isFromCart = (itemName: string) => {
    return cartSyncState?.syncedItems?.some(name =>
      name.includes(itemName) || itemName.includes(name)
    ) ?? false;
  };

  // 서버 설치가 견적에서 선택되었는지
  const serverFromCart = isFromCart('마스토돈 서버 설치');
  // 테마 옵션이 견적에서 선택되었는지
  const themeFromCart = isFromCart('테마') || isFromCart('로고');
  // 노션 가이드가 견적에서 선택되었는지
  const notionFromCart = isFromCart('마스토돈 가이드');
  // 글자수 제한이 견적에서 선택되었는지
  const charLimitFromCart = isFromCart('글자수');
  // 검색 옵션이 견적에서 선택되었는지
  const searchFromCart = isFromCart('검색');
  // masto.host 데이터 이전이 견적에서 선택되었는지
  const mastoHostFromCart = isFromCart('masto.host');
  // 빠른 마감이 견적에서 선택되었는지
  const fastDeadlineFromCart = isFromCart('빠른마감');

  // 검색 차단 규칙: Vultr(장기·소규모) 서버는 검색 불가, GCP는 허용.
  // 장기 소규모 서버(Step1 체크)는 항상 Vultr로 취급한다.
  const hostingIsVultr = serverCalcResult?.type === 'vultr';
  const searchBlockedByVultr = isLongTermServer || hostingIsVultr;

  // 계산기 검색 여부와 검색 옵션을 양방향 동기화
  // (계산기에서 '예'/'아니오'를 고르면 검색 옵션 체크 상태가 따라감)
  const searchDecidedByCalc =
    serverCalcResult?.search === 'yes' || serverCalcResult?.search === 'no';
  // 계산기에서 검색 여부가 결정되었거나, Vultr 서버라 검색이 아예 막힌 경우
  const searchLocked = searchDecidedByCalc || searchBlockedByVultr;
  useEffect(() => {
    if (searchBlockedByVultr) return; // Vultr 서버는 아래 효과에서 검색을 강제로 끔
    if (serverCalcResult?.search === 'yes' && !step2.searchOption) {
      updateStep2({ searchOption: true });
    } else if (serverCalcResult?.search === 'no' && step2.searchOption) {
      updateStep2({ searchOption: false });
    }
  }, [serverCalcResult?.search, searchBlockedByVultr]);

  // Vultr(장기·소규모) 서버 선택 시 검색 옵션 강제 해제
  useEffect(() => {
    if (searchBlockedByVultr && step2.searchOption) {
      updateStep2({ searchOption: false });
    }
  }, [searchBlockedByVultr, step2.searchOption, updateStep2]);

  // 마감일 접수 불가 기간(마감 중단/휴가) 안내
  const deadlineBlackoutError = useMemo(
    () => getDeadlineBlackoutError(step2.desiredDeadline, 'desiredDeadline'),
    [step2.desiredDeadline]
  );

  // 마감일이 임박했을 때 강제 적용되는 빠른 마감 옵션 (선택한 커스텀 옵션 기준)
  const requiredFastDeadline = useMemo(
    () => computeRequiredFastDeadline(step2.desiredDeadline, step2.additionalOption),
    [step2.desiredDeadline, step2.additionalOption]
  );

  // 강제 옵션이 있으면 빠른 마감을 자동으로 켜고 해당 옵션으로 고정
  useEffect(() => {
    if (!requiredFastDeadline) return;
    if (step2.fastDeadline && step2.fastDeadlineOption === requiredFastDeadline) return;
    updateStep2({ fastDeadline: true, fastDeadlineOption: requiredFastDeadline });
  }, [requiredFastDeadline, step2.fastDeadline, step2.fastDeadlineOption, updateStep2]);

  // 강제 적용 시 해당 옵션 외 다른 빠른 마감 옵션은 잠금
  const isFastOptionLocked = (option: FastDeadlineOption): boolean =>
    requiredFastDeadline !== null && requiredFastDeadline !== option;

  // 글자수 값 검증
  useEffect(() => {
    if (step2.changeCharacterLimit && step2.characterLimitValue > 0) {
      const error = validateCharacterLimit(step2.characterLimitValue);
      setCharacterLimitError(error?.message || null);
    } else {
      setCharacterLimitError(null);
    }
  }, [step2.changeCharacterLimit, step2.characterLimitValue]);

  const handleAdditionalOptionChange = (option: typeof step2.additionalOption) => {
    // 같은 옵션 재선택 시 선택 해제
    if (step2.additionalOption === option) {
      updateStep2({ additionalOption: null });
    } else {
      updateStep2({ additionalOption: option });
    }
  };

  // "아니오" 선택 시 모든 하위 필드 초기화
  const handleServerInstallChange = (value: 'yes' | 'no') => {
    updateStep2({ applyServerInstall: value });
    if (value === 'no') {
      updateStep2({
        additionalOption: null,
        notionGuide: false,
        changeCharacterLimit: false,
        characterLimitValue: 0,
        searchOption: false,
        mastoHostMigration: false,
        fastDeadline: false,
        fastDeadlineOption: null,
        desiredDeadline: '',
        adminAccountId: '',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="pb-6 border-b border-border animate-fadeInDown">
        <h2 className="text-[25px] font-semibold mb-2 bg-gradient-to-r from-[#ff7b00] to-[#ff9933] bg-clip-text text-transparent">
          Step 2. 서버 설치 옵션
        </h2>
        <p className="text-[14px] text-gray-600">
          마스토돈 서버 설치가 필요하신가요? 필요하지 않으시다면 "아니오"를 선택해 주세요.
        </p>
      </div>

      {/* 1) 서버 설치 신청 여부 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-[18px] font-semibold">
            1) 서버 설치를 신청하시나요? <span className="text-red-500">*</span>
            {serverFromCart && step2.applyServerInstall === 'yes' && <FromCartBadge />}
          </span>
          <p className="text-[13px] text-gray-600 mt-1 mb-3">
            서버 설치 기본 비용: <span className="font-medium text-[#ff7b00]">20,000원</span>
          </p>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="applyServerInstall"
              checked={step2.applyServerInstall === 'yes'}
              onChange={() => handleServerInstallChange('yes')}
              className="w-5 h-5 accent-[#ff7b00] cursor-pointer"
            />
            <span className="text-[14px]">예</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="radio"
              name="applyServerInstall"
              checked={step2.applyServerInstall === 'no'}
              onChange={() => handleServerInstallChange('no')}
              className="w-5 h-5 accent-[#ff7b00] cursor-pointer"
            />
            <span className="text-[14px]">아니오</span>
          </label>
        </div>
      </div>

      {/* 서버 설치 "예" 선택 시에만 표시되는 옵션들 */}
      {step2.applyServerInstall === 'yes' && (
        <div className="space-y-8 pt-6 border-t border-gray-200 animate-slideDown">

          {/* 서버 사양 계산기 */}
          <MastodonServerCalculator compact longTerm={isLongTermServer} />

          {/* 2) 커스텀 옵션 선택 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[18px] font-semibold mb-1">
                2) 커스텀 옵션 선택
                {themeFromCart && step2.additionalOption && <FromCartBadge />}
              </h3>
              <p className="text-[13px] text-gray-600">
                테마 옵션은 전부 로고 변경 옵션이 포함되어 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 기본 (커스텀 없음) */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step2.additionalOption === null
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === null}
                  onChange={() => updateStep2({ additionalOption: null })}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">기본</div>
                  <div className="text-[13px] text-gray-600 mt-1">무료 — 기본 트위터 테마</div>
                </div>
              </label>

              {/* 로고 변경 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step2.additionalOption === 'logo'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'logo'}
                  onChange={() => handleAdditionalOptionChange('logo')}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">로고 변경</div>
                  <div className="text-[13px] text-gray-600 mt-1">+5,000원</div>
                </div>
              </label>

              {/* 낮 테마 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step2.additionalOption === 'dayTheme'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'dayTheme'}
                  onChange={() => handleAdditionalOptionChange('dayTheme')}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">낮 테마</div>
                  <div className="text-[13px] text-gray-600 mt-1">+20,000원</div>
                </div>
              </label>

              {/* 밤 테마 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step2.additionalOption === 'nightTheme'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'nightTheme'}
                  onChange={() => handleAdditionalOptionChange('nightTheme')}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">밤 테마</div>
                  <div className="text-[13px] text-gray-600 mt-1">+20,000원</div>
                </div>
              </label>

              {/* 테마 2종 */}
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${step2.additionalOption === 'bothTheme'
                  ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                  : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-sm'
                  }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'bothTheme'}
                  onChange={() => handleAdditionalOptionChange('bothTheme')}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">커스텀 테마 2종</div>
                  <div className="text-[13px] text-gray-600 mt-1">+30,000원</div>
                </div>
              </label>
            </div>
          </div>

          {/* 3) 기타 옵션 선택 */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold">3) 기타 옵션 선택</h3>

            {/* 노션 가이드 */}
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step2.notionGuide
              ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
              : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
              <input
                type="checkbox"
                checked={step2.notionGuide}
                onChange={(e) => updateStep2({ notionGuide: e.target.checked })}
                className="w-4 h-4 shrink-0 accent-[#ff7b00]"
              />
              <div className="flex-1">
                <div className="font-medium text-[14px]">
                  노션 마스토돈 가이드 제공 (+5,000원)
                  {notionFromCart && step2.notionGuide && <FromCartBadge />}
                </div>
                <div className="text-[13px] text-gray-600 mt-1">
                  마스토돈 커뮤니티를 처음 러닝하는 러너를 위한 가이드입니다.
                </div>
              </div>
            </label>

            {/* 글자수 제한 변경 */}
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step2.changeCharacterLimit
                ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                }`}>
                <input
                  type="checkbox"
                  checked={step2.changeCharacterLimit}
                  onChange={(e) => {
                    updateStep2({ changeCharacterLimit: e.target.checked });
                    if (!e.target.checked) {
                      updateStep2({ characterLimitValue: 0 });
                      setCharacterLimitError(null);
                    }
                  }}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    글자수 제한 변경 (+5,000원)
                    {charLimitFromCart && step2.changeCharacterLimit && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    기본 공백 포함 1000자. 원하는 글자수 제한을 설정합니다.
                  </div>
                </div>
              </label>

              {/* 글자수 입력 필드 (조건부 노출) */}
              {step2.changeCharacterLimit && (
                <div className="ml-7 space-y-2 animate-slideDown">
                  <label htmlFor="characterLimitValue" className="block text-[14px] font-medium">
                    원하는 글자수
                  </label>
                  <input
                    id="characterLimitValue"
                    type="number"
                    min="1"
                    value={step2.characterLimitValue || ''}
                    onChange={(e) =>
                      updateStep2({ characterLimitValue: parseInt(e.target.value) || 0 })
                    }
                    placeholder="예: 500, 1500, 2000"
                    className={`w-full md:w-64 px-4 py-2 border rounded-md focus:outline-none text-[14px] ${characterLimitError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-input focus:border-[#ff7b00]'
                      }`}
                  />
                  {characterLimitError && (
                    <div className="p-3 bg-red-50 border border-red-500 rounded-md">
                      <p className="text-[13px] text-red-600">{characterLimitError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 검색 옵션 */}
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-lg transition-all duration-300 hover:shadow-sm ${step2.searchOption
                ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                } ${searchLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={step2.searchOption}
                  onChange={(e) => {
                    if (searchLocked) return;
                    updateStep2({ searchOption: e.target.checked });
                  }}
                  disabled={searchLocked}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00] disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    검색 옵션 (+15,000원)
                    {searchFromCart && step2.searchOption && <FromCartBadge />}
                    {searchBlockedByVultr && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-full ml-2">
                        장기·소규모(Vultr) 서버 선택 불가
                      </span>
                    )}
                    {!searchBlockedByVultr && serverCalcResult?.search === 'yes' && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#ff7b00]/10 text-[#ff7b00] text-[11px] font-medium rounded-full ml-2">
                        계산기에서 선택됨
                      </span>
                    )}
                    {!searchBlockedByVultr && serverCalcResult?.search === 'no' && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-full ml-2">
                        계산기에서 제외됨
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    서버에 검색 기능을 추가합니다. 위 계산기의 ‘검색 기능 추가 여부’와 연동됩니다.
                  </div>
                </div>
              </label>

              {/* Vultr(장기·소규모) 서버: 검색 기능 추가 불가 안내 */}
              {searchBlockedByVultr && (
                <div className="ml-7 p-3 bg-[#fff5eb] border border-[#ff7b00] rounded-md animate-slideDown">
                  <p className="text-[13px] leading-[1.7] text-[#cc5500]">
                    {isLongTermServer
                      ? '장기 소규모 서버(반영구)는 검색 서버가 별도로 필요해 월 서버비가 크게 오릅니다. 서버비 절약을 위해 검색 기능을 추가할 수 없어요. 검색이 필요하시면 Step 1에서 ‘장기 소규모 서버’ 체크를 해제해 주세요.'
                      : '이 사양은 장기·소규모(Vultr) 서버라, 검색 서버 비용이 커서 검색 기능을 추가할 수 없습니다. 검색이 필요하시면 위 계산기에서 운영 기간을 12개월 미만(GCP 사양)으로 선택해 주세요.'}
                  </p>
                </div>
              )}

            </div>

            {/* masto.host 데이터 이전 */}
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm ${step2.mastoHostMigration
              ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
              : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
              <input
                type="checkbox"
                checked={step2.mastoHostMigration}
                onChange={(e) => updateStep2({ mastoHostMigration: e.target.checked })}
                className="w-4 h-4 shrink-0 accent-[#ff7b00]"
              />
              <div className="flex-1">
                <div className="font-medium text-[14px]">
                  masto.host 에서 서버 데이터 이전 (+20,000원)
                  {mastoHostFromCart && step2.mastoHostMigration && <FromCartBadge />}
                </div>
                <div className="text-[13px] text-gray-600 mt-1">
                  팔로우 관계, 텍스트 데이터, 이미지 등 모든 정보를 기존 서버에서 새로운 서버로 옮겨드립니다.
                </div>
              </div>
            </label>

            {/* 빠른 마감 */}
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-lg transition-all duration-300 hover:shadow-sm ${step2.fastDeadline
                ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                } ${requiredFastDeadline ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={step2.fastDeadline}
                  disabled={!!requiredFastDeadline}
                  onChange={(e) => {
                    if (requiredFastDeadline) return;
                    updateStep2({ fastDeadline: e.target.checked });
                    if (!e.target.checked) {
                      updateStep2({ fastDeadlineOption: null });
                    }
                  }}
                  className="w-4 h-4 shrink-0 accent-[#ff7b00] disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    48시간 이내 빠른 마감
                    {fastDeadlineFromCart && step2.fastDeadline && <FromCartBadge />}
                    {requiredFastDeadline && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#ff7b00]/10 text-[#ff7b00] text-[11px] font-medium rounded-full ml-2">
                        마감 임박 필수
                      </span>
                    )}
                  </div>
                </div>
              </label>

              {/* 빠른 마감 옵션 (조건부 노출) */}
              {step2.fastDeadline && (
                <div className="ml-7 space-y-3 animate-slideDown">
                  {requiredFastDeadline ? (
                    <div className="p-3 bg-[#fff5eb] border border-[#ff7b00] rounded-md">
                      <p className="text-[13px] leading-[1.7] text-[#cc5500]">
                        희망 마감일이 작성일로부터 2일 이내라, 선택하신 옵션에 맞는 빠른 마감이 필수로 적용됩니다.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-600 mb-2">아래 옵션 중 하나를 선택해 주세요.</p>
                  )}

                  {/* 48시간 내 기본 서버 */}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${step2.fastDeadlineOption === 'basic48h'
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                      } ${isFastOptionLocked('basic48h') ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'basic48h'}
                      disabled={isFastOptionLocked('basic48h')}
                      onChange={() => updateStep2({ fastDeadlineOption: 'basic48h' })}
                      className="w-4 h-4 accent-[#ff7b00] disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[14px]">48시간 내 기본 서버 설치 마감 (+5,000원)</div>
                    </div>
                  </label>

                  {/* 24시간 내 기본 서버 */}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${step2.fastDeadlineOption === 'basic24h'
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                      } ${isFastOptionLocked('basic24h') ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'basic24h'}
                      disabled={isFastOptionLocked('basic24h')}
                      onChange={() => updateStep2({ fastDeadlineOption: 'basic24h' })}
                      className="w-4 h-4 accent-[#ff7b00] disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[14px]">24시간 내 기본 서버 설치 마감 (+10,000원)</div>
                    </div>
                  </label>

                  {/* 48시간 내 로고 변경 */}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${step2.fastDeadlineOption === 'logo48h'
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                      } ${isFastOptionLocked('logo48h') ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'logo48h'}
                      disabled={isFastOptionLocked('logo48h')}
                      onChange={() => updateStep2({ fastDeadlineOption: 'logo48h' })}
                      className="w-4 h-4 accent-[#ff7b00] disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[14px]">48시간 내 로고 변경된 서버 설치 마감 (+15,000원)</div>
                    </div>
                  </label>

                  {/* 48시간 내 테마 커스텀 */}
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${step2.fastDeadlineOption === 'theme48h'
                      ? 'border-[#ff7b00] bg-[#fff5eb] ring-2 ring-[#ff7b00]/20'
                      : 'border-border hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                      } ${isFastOptionLocked('theme48h') ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'theme48h'}
                      disabled={isFastOptionLocked('theme48h')}
                      onChange={() => updateStep2({ fastDeadlineOption: 'theme48h' })}
                      className="w-4 h-4 accent-[#ff7b00] disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[14px]">48시간 내 테마 커스텀된 서버 설치 마감 (+20,000원)</div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 4) 기타 정보 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-[18px] font-semibold mb-4">4) 기타 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="desiredDeadline" className="block text-[14px] font-medium">
                  희망 마감일 <span className="text-red-500">*</span>
                </label>
                <input
                  id="desiredDeadline"
                  type="text"
                  value={step2.desiredDeadline}
                  onChange={(e) => updateStep2({ desiredDeadline: e.target.value })}
                  placeholder="MM/DD"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none text-[14px] ${deadlineBlackoutError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-input focus:border-[#ff7b00]'
                    }`}
                />
                {deadlineBlackoutError ? (
                  <div className="p-3 bg-red-50 border border-red-500 rounded-md">
                    <p className="text-[13px] text-red-600">{deadlineBlackoutError.message}</p>
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-600">
                    월/일 형식으로 입력해 주세요.
                    <br />
                    <strong>{DEADLINE_BLACKOUT_LABEL} 은 마감이 불가능한 기간입니다.</strong>
                  </p>
                )}
                <div className="mt-2 p-3 bg-[#fff5eb] border border-[#ff7b00] rounded-md">
                  <p className="text-[13px] leading-[1.7] text-[#cc5500]">
                    로고 혹은 테마 옵션을 신청하셨나요? 신청서를 접수하시면 테마와 로고 이미지 규격이 전달됩니다. 신청자님께서는 마감일로부터 <strong>최소 일주일 이전에 9종/12종/13종</strong>의 이미지를 전달해주셔야 합니다. 그때까지 디자인을 완성하고 이미지를 전달하실 수 있는지 생각해보고 마감일을 조정하세요.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="adminAccountId" className="block text-[14px] font-medium">
                  총괄 계정 아이디 <span className="text-red-500">*</span>
                </label>
                <input
                  id="adminAccountId"
                  type="text"
                  value={step2.adminAccountId}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateStep2({ adminAccountId: value });
                    if (/[,\/]/.test(value)) {
                      setAdminAccountError('총괄 계정은 하나만 입력해 주세요.');
                    } else if (value.trim() !== '') {
                      // 3자 이상 + admin/owner/moderator 사용 불가 (대소문자 무관)
                      const accountError = validateAccountId(value, 'adminAccountId', '총괄 계정 아이디');
                      setAdminAccountError(accountError ? accountError.message : null);
                    } else {
                      setAdminAccountError(null);
                    }
                  }}
                  placeholder="@NOTICE"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none text-[14px] ${adminAccountError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-input focus:border-[#ff7b00]'
                    }`}
                />
                {adminAccountError ? (
                  <div className="p-3 bg-red-50 border border-red-500 rounded-md">
                    <p className="text-[13px] text-red-600">{adminAccountError}</p>
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-600">대문자 권장 / 3자 이상, admin·owner·moderator 는 사용할 수 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "아니오" 선택 시 안내 메시지 */}
      {step2.applyServerInstall === 'no' && (
        <div className="p-6 bg-gray-50 border border-border rounded-lg animate-slideDown">
          <p className="text-[14px] text-gray-700 flex items-center gap-2">
            <span>✓</span>
            서버 설치를 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.
          </p>
        </div>
      )}
    </div>
  );
}
