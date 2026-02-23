import { useOrder } from '@/app/contexts/OrderContext';
import { useState, useEffect } from 'react';
import { validateCharacterLimit } from '@/app/utils/orderUtils';
import { ShoppingCart } from 'lucide-react';

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
  const step2 = formData.step2;
  const [characterLimitError, setCharacterLimitError] = useState<string | null>(null);

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
  // 빠른 마감이 견적에서 선택되었는지
  const fastDeadlineFromCart = isFromCart('빠른마감');

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
      <div className="pb-6 border-b-2 border-black animate-fadeInDown">
        <h2 className="text-[28px] font-medium mb-2 bg-gradient-to-r from-[#ff7b00] to-[#ff9933] bg-clip-text text-transparent">
          Step 2. 서버 설치 옵션
        </h2>
        <p className="text-[14px] text-gray-600">
          마스토돈 서버 설치가 필요하신가요? 필요하지 않으시다면 "아니오"를 선택해 주세요.
        </p>
      </div>

      {/* 1) 서버 설치 신청 여부 */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-[18px] font-medium">
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
          {/* 2) 커스텀 옵션 선택 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-[18px] font-medium mb-1">
                2) 커스텀 옵션 선택
                {themeFromCart && step2.additionalOption && <FromCartBadge />}
              </h3>
              <p className="text-[13px] text-gray-600">
                테마 옵션은 전부 로고 변경 옵션이 포함되어 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 로고 변경 */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  step2.additionalOption === 'logo'
                    ? 'border-[#ff7b00] bg-[#fff5eb] shadow-[2px_2px_0px_0px_rgba(255,123,0,0.3)] scale-[1.02]'
                    : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'logo'}
                  onChange={() => handleAdditionalOptionChange('logo')}
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">로고 변경</div>
                  <div className="text-[13px] text-gray-600 mt-1">+5,000원</div>
                </div>
              </label>

              {/* 낮 테마 */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  step2.additionalOption === 'dayTheme'
                    ? 'border-[#ff7b00] bg-[#fff5eb] shadow-[2px_2px_0px_0px_rgba(255,123,0,0.3)] scale-[1.02]'
                    : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'dayTheme'}
                  onChange={() => handleAdditionalOptionChange('dayTheme')}
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">낮 테마</div>
                  <div className="text-[13px] text-gray-600 mt-1">+20,000원</div>
                </div>
              </label>

              {/* 밤 테마 */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  step2.additionalOption === 'nightTheme'
                    ? 'border-[#ff7b00] bg-[#fff5eb] shadow-[2px_2px_0px_0px_rgba(255,123,0,0.3)] scale-[1.02]'
                    : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'nightTheme'}
                  onChange={() => handleAdditionalOptionChange('nightTheme')}
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">밤 테마</div>
                  <div className="text-[13px] text-gray-600 mt-1">+20,000원</div>
                </div>
              </label>

              {/* 테마 2종 */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  step2.additionalOption === 'bothTheme'
                    ? 'border-[#ff7b00] bg-[#fff5eb] shadow-[2px_2px_0px_0px_rgba(255,123,0,0.3)] scale-[1.02]'
                    : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                }`}
              >
                <input
                  type="radio"
                  name="additionalOption"
                  checked={step2.additionalOption === 'bothTheme'}
                  onChange={() => handleAdditionalOptionChange('bothTheme')}
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
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
            <h3 className="text-[18px] font-medium">3) 기타 옵션 선택</h3>

            {/* 노션 가이드 */}
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
              step2.notionGuide 
                ? 'border-[#ff7b00] bg-[#fff5eb]' 
                : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
            }`}>
              <input
                type="checkbox"
                checked={step2.notionGuide}
                onChange={(e) => updateStep2({ notionGuide: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#ff7b00]"
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
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
                step2.changeCharacterLimit 
                  ? 'border-[#ff7b00] bg-[#fff5eb]' 
                  : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
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
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
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
                    className={`w-full md:w-64 px-4 py-2 border-2 rounded-md focus:outline-none text-[14px] ${
                      characterLimitError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#ff7b00]'
                    }`}
                  />
                  {characterLimitError && (
                    <div className="p-3 bg-red-50 border-2 border-red-500 rounded-md">
                      <p className="text-[13px] text-red-600">{characterLimitError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 검색 옵션 */}
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
                step2.searchOption
                  ? 'border-[#ff7b00] bg-[#fff5eb]'
                  : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
                <input
                  type="checkbox"
                  checked={step2.searchOption}
                  onChange={(e) => updateStep2({ searchOption: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    검색 옵션 (+30,000원)
                    {searchFromCart && step2.searchOption && <FromCartBadge />}
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    서버에 검색 기능을 추가합니다.
                  </div>
                </div>
              </label>

              {step2.searchOption && (
                <div className="ml-7 p-4 bg-amber-50 border-2 border-amber-400 rounded-lg animate-slideDown">
                  <p className="text-[13px] text-amber-800 leading-[1.8]">
                    검색 기능을 활성화하기 위해서는 서버비가 월 $40 정도 소모됩니다. 마스토돈 서버에 서버비 50달러, 검색 기능에 서버비 40달러가 발생하므로 한달 서버비는 약 90달러 (약 13만원) 정도입니다. GCP는 월 300달러의 무료 크레딧을 제공하므로 3개월까진 무리 없이 사용할 수 있습니다. 다만, 3개월 이상 서버를 유지할 계획이 있으시다면 검색 기능은 설치하지 않는 것을 추천드립니다.
                  </p>
                </div>
              )}
            </div>

            {/* 빠른 마감 */}
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
                step2.fastDeadline
                  ? 'border-[#ff7b00] bg-[#fff5eb]'
                  : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
              }`}>
                <input
                  type="checkbox"
                  checked={step2.fastDeadline}
                  onChange={(e) => {
                    updateStep2({ fastDeadline: e.target.checked });
                    if (!e.target.checked) {
                      updateStep2({ fastDeadlineOption: null });
                    }
                  }}
                  className="mt-1 w-4 h-4 accent-[#ff7b00]"
                />
                <div className="flex-1">
                  <div className="font-medium text-[14px]">
                    48시간 이내 빠른 마감
                    {fastDeadlineFromCart && step2.fastDeadline && <FromCartBadge />}
                  </div>
                </div>
              </label>

              {/* 빠른 마감 옵션 (조건부 노출) */}
              {step2.fastDeadline && (
                <div className="ml-7 space-y-3 animate-slideDown">
                  <p className="text-[13px] text-gray-600 mb-2">아래 옵션 중 하나를 선택해 주세요.</p>
                  
                  {/* 24시간 내 기본 서버 */}
                  <label
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      step2.fastDeadlineOption === 'basic24h'
                        ? 'border-[#ff7b00] bg-[#fff5eb]'
                        : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'basic24h'}
                      onChange={() => updateStep2({ fastDeadlineOption: 'basic24h' })}
                      className="mt-0.5 w-4 h-4 accent-[#ff7b00]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[14px]">24시간 내 기본 서버 설치 마감 (+10,000원)</div>
                    </div>
                  </label>

                  {/* 48시간 내 로고 변경 */}
                  <label
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      step2.fastDeadlineOption === 'logo48h'
                        ? 'border-[#ff7b00] bg-[#fff5eb]'
                        : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'logo48h'}
                      onChange={() => updateStep2({ fastDeadlineOption: 'logo48h' })}
                      className="mt-0.5 w-4 h-4 accent-[#ff7b00]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[14px]">48시간 내 로고 변경된 서버 설치 마감 (+15,000원)</div>
                    </div>
                  </label>

                  {/* 48시간 내 테마 커스텀 */}
                  <label
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      step2.fastDeadlineOption === 'theme48h'
                        ? 'border-[#ff7b00] bg-[#fff5eb]'
                        : 'border-gray-300 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fastDeadlineOption"
                      checked={step2.fastDeadlineOption === 'theme48h'}
                      onChange={() => updateStep2({ fastDeadlineOption: 'theme48h' })}
                      className="mt-0.5 w-4 h-4 accent-[#ff7b00]"
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
            <h3 className="text-[18px] font-medium mb-4">4) 기타 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="desiredDeadline" className="block text-[14px] font-medium">
                  희망 마감일
                </label>
                <input
                  id="desiredDeadline"
                  type="text"
                  value={step2.desiredDeadline}
                  onChange={(e) => updateStep2({ desiredDeadline: e.target.value })}
                  placeholder="MM/DD (예: 03/15)"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                />
                <p className="text-[12px] text-gray-600">월/일 형식으로 입력해 주세요.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="adminAccountId" className="block text-[14px] font-medium">
                  총괄 계정 아이디
                </label>
                <input
                  id="adminAccountId"
                  type="text"
                  value={step2.adminAccountId}
                  onChange={(e) => updateStep2({ adminAccountId: e.target.value })}
                  placeholder="@NOTICE, @ADMIN 등"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-[#ff7b00] focus:outline-none text-[14px]"
                />
                <p className="text-[12px] text-gray-600">대문자 권장</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "아니오" 선택 시 안내 메시지 */}
      {step2.applyServerInstall === 'no' && (
        <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-lg animate-slideDown">
          <p className="text-[14px] text-gray-700 flex items-center gap-2">
            <span>✓</span>
            서버 설치를 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.
          </p>
        </div>
      )}
    </div>
  );
}
