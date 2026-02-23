import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import { calculateTotalEstimate, generateCopyText } from '@/app/utils/orderUtils';
import { copyToClipboard } from '@/app/utils/clipboard';
import { PRICING_CONFIG } from '@/app/constants/form';

const CREPE_URL = 'https://crepe.cm/@longwhile/lw5w0ofg';

export default function Step4Review() {
  const { formData, setCurrentStep } = useOrder();
  const { step1, step2, step3 } = formData;
  const [policyConfirmed, setPolicyConfirmed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 실시간 견적 계산
  const estimate = useMemo(() => {
    try {
      return calculateTotalEstimate(formData);
    } catch (err) {
      console.error('견적 계산 실패:', err);
      return {
        serverTotal: 0,
        botTotal: 0,
        operationCost: 0,
        grandTotal: 0,
        hasVariablePrice: false,
        variableItems: [],
      };
    }
  }, [formData]);

  // 복사 버튼 활성화 조건: 체크박스 선택 시
  const isCopyEnabled = policyConfirmed && !isCopying;

  // 카운트다운 정리
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // 크레페 이동 취소
  const cancelRedirect = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setRedirectCountdown(null);
  }, []);

  // 크레페로 바로 이동
  const goToCrepe = useCallback(() => {
    cancelRedirect();
    window.open(CREPE_URL, '_blank', 'noopener,noreferrer');
  }, [cancelRedirect]);

  // 클립보드 복사 함수
  const handleCopy = useCallback(async () => {
    if (!isCopyEnabled) return;

    setIsCopying(true);
    setError(null);

    const copyText = generateCopyText(formData, estimate);
    const result = await copyToClipboard(copyText);

    if (result.success) {
      setCopySuccess(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // 3초 카운트다운 시작
      setRedirectCountdown(3);
      countdownRef.current = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            // 카운트다운 완료 시 자동 이동
            window.open(CREPE_URL, '_blank', 'noopener,noreferrer');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error);
    }

    setIsCopying(false);
  }, [formData, estimate, isCopyEnabled]);

  // 수정 버튼 핸들러
  const handleEdit = useCallback((step: 1 | 2 | 3) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentStep]);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="pb-6 border-b-2 border-black animate-fadeInDown">
        <h2 className="text-[28px] font-medium mb-2 bg-gradient-to-r from-[#ff7b00] to-[#ff9933] bg-clip-text text-transparent">
          Step 4. 최종 확인 및 견적
        </h2>
        <p className="text-[14px] text-gray-600">
          입력하신 내용을 확인하고 최종 견적을 확인해 주세요.
        </p>
      </div>

      {/* 토스트 알림 */}
      {showToast && (
        <div
          className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-3 max-w-sm animate-slideInRight"
          role="alert"
          aria-live="polite"
        >
          <span className="text-[24px]" aria-hidden="true">✓</span>
          <div>
            <p className="font-bold text-[15px]">복사 완료!</p>
            <p className="text-[13px] text-green-100">신청서가 클립보드에 복사되었습니다</p>
          </div>
        </div>
      )}

      {/* Step 1 요약 */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-300 flex items-center justify-between">
          <h3 className="text-[18px] font-medium">신청자 닉네임</h3>
          <button
            onClick={() => handleEdit(1)}
            className="text-[14px] text-[#ff7b00] hover:text-[#e66d00] font-medium transition-all duration-300 hover:underline"
          >
            수정 →
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[13px] text-gray-500 mb-1">신청자 닉네임</p>
            <p className="text-[15px] font-medium">{step1.applicantNickname || '-'}</p>
          </div>
          <div>
            <p className="text-[13px] text-gray-500 mb-1">구글 이메일</p>
            <p className="text-[15px] font-medium">{step1.googleEmail || '-'}</p>
          </div>
          <div>
            <p className="text-[13px] text-gray-500 mb-1">커뮤니티</p>
            <p className="text-[15px] font-medium">
              {step1.communityKoreanName} / {step1.communityEnglishName} (약칭 '{step1.communityShortName}')
            </p>
          </div>
          <div>
            <p className="text-[13px] text-gray-500 mb-1">운영 일정</p>
            <p className="text-[15px] font-medium">
              {step1.openingDate} ~ {step1.closingDate} ({step1.operationWeeks}주)
            </p>
          </div>
        </div>
      </div>

      {/* Step 2 요약 */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-300 flex items-center justify-between">
          <h3 className="text-[18px] font-medium">서버 설치 옵션</h3>
          <button
            onClick={() => handleEdit(2)}
            className="text-[14px] text-[#ff7b00] hover:text-[#e66d00] font-medium transition-all duration-300 hover:underline"
          >
            수정 →
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[13px] text-gray-500 mb-1">신청 여부</p>
            <p className="text-[15px] font-medium">
              {step2.applyServerInstall === 'yes' ? '예' : '아니오'}
            </p>
          </div>
          {step2.applyServerInstall === 'yes' && (
            <>
              {step2.additionalOption && (
                <div>
                  <p className="text-[13px] text-gray-500 mb-1">커스텀 옵션</p>
                  <p className="text-[15px] font-medium">
                    {step2.additionalOption === 'logo' && '로고 변경'}
                    {step2.additionalOption === 'dayTheme' && '낮 테마'}
                    {step2.additionalOption === 'nightTheme' && '밤 테마'}
                    {step2.additionalOption === 'bothTheme' && '테마 2종'}
                  </p>
                </div>
              )}
              {(step2.notionGuide || step2.changeCharacterLimit || step2.searchOption || step2.fastDeadline) && (
                <div>
                  <p className="text-[13px] text-gray-500 mb-1">추가 옵션</p>
                  <p className="text-[15px] font-medium">
                    {[
                      step2.notionGuide && '노션 가이드',
                      step2.changeCharacterLimit && `글자수 ${step2.characterLimitValue}자`,
                      step2.searchOption && '검색 옵션',
                      step2.fastDeadline && '빠른 마감',
                    ].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              )}
              {step2.adminAccountId && (
                <div>
                  <p className="text-[13px] text-gray-500 mb-1">총괄 계정</p>
                  <p className="text-[15px] font-medium">{step2.adminAccountId}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Step 3 요약 */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-300 flex items-center justify-between">
          <h3 className="text-[18px] font-medium">자동봇 커미션</h3>
          <button
            onClick={() => handleEdit(3)}
            className="text-[14px] text-[#ff7b00] hover:text-[#e66d00] font-medium transition-all duration-300 hover:underline"
          >
            수정 →
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[13px] text-gray-500 mb-1">신청 여부</p>
            <p className="text-[15px] font-medium">
              {step3.applyBot === 'yes' ? '예' : '아니오'}
            </p>
          </div>
          {step3.applyBot === 'yes' && (
            <>
              <div>
                <p className="text-[13px] text-gray-500 mb-1">운영 기간</p>
                <p className="text-[15px] font-medium">
                  {step3.operationWeeksOption === 'same' 
                    ? `커뮤니티 기간과 동일 (${step1.operationWeeks}주)`
                    : `${step3.manualWeeks}주`}
                </p>
              </div>
              {step3.mainBot && (
                <div>
                  <p className="text-[13px] text-gray-500 mb-1">메인 봇</p>
                  <p className="text-[15px] font-medium">
                    {step3.mainBot === 'basic' && '기본'}
                    {step3.mainBot === 'basicShop' && '기본+상점'}
                    {step3.mainBot === 'basicShopStat' && '기본+상점+스탯'}
                  </p>
                </div>
              )}
              {(step3.cocBot || step3.customCommandUpgrade || step3.reservationToot || step3.autoProfileImage ||
                step3.tootCurrencyLink || step3.transferFeature || step3.omakaseBot) && (
                <div>
                  <p className="text-[13px] text-gray-500 mb-1">추가 옵션</p>
                  <p className="text-[15px] font-medium">
                    {[
                      step3.cocBot && 'CoC 봇',
                      step3.customCommandUpgrade && '커스텀 명령어 업그레이드',
                      step3.reservationToot && '예약 툿',
                      step3.autoProfileImage && '자동 스진',
                      step3.tootCurrencyLink && '툿-재화 연동',
                      step3.transferFeature && `양도 기능 (${
                        step3.transferOption === 'itemOnly' ? '아이템만' :
                        step3.transferOption === 'currencyOnly' ? '재화만' : '모두'
                      })`,
                      step3.omakaseBot && '오마카세',
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {step3.botAccountId && (
                <div>
                  <p className="text-[13px] text-gray-500 mb-1">봇 계정</p>
                  <p className="text-[15px] font-medium">{step3.botAccountId}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 최종 견적 */}
      <div className="border-2 border-black rounded-lg overflow-hidden bg-gradient-to-br from-[#fff5eb] to-white">
        <div className="bg-[#ff7b00] px-6 py-4 border-b-2 border-black">
          <h3 className="text-[18px] font-medium text-white">최종 견적</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* 서버 관련 */}
          {step2.applyServerInstall === 'yes' && (
            <div className="space-y-2">
              <p className="text-[15px] font-medium text-gray-700 border-b border-gray-200 pb-1">서버 관련</p>
              <div className="space-y-1 text-[14px]">
                <div className="flex justify-between">
                  <span>서버 설치</span>
                  <span>{PRICING_CONFIG.server.base.toLocaleString()}원</span>
                </div>
                {step2.additionalOption && (
                  <div className="flex justify-between">
                    <span>
                      {step2.additionalOption === 'logo' && '로고 변경'}
                      {step2.additionalOption === 'dayTheme' && '낮 테마'}
                      {step2.additionalOption === 'nightTheme' && '밤 테마'}
                      {step2.additionalOption === 'bothTheme' && '테마 2종'}
                    </span>
                    <span>{PRICING_CONFIG.server.options[step2.additionalOption].toLocaleString()}원</span>
                  </div>
                )}
                {step2.notionGuide && (
                  <div className="flex justify-between">
                    <span>마스토돈 가이드</span>
                    <span>{PRICING_CONFIG.server.addons.notionGuide.toLocaleString()}원</span>
                  </div>
                )}
                {step2.changeCharacterLimit && step2.characterLimitValue > 0 && (
                  <div className="flex justify-between">
                    <span>글자수 변경 ({step2.characterLimitValue}자)</span>
                    <span>{PRICING_CONFIG.server.addons.characterLimit.toLocaleString()}원</span>
                  </div>
                )}
                {step2.searchOption && (
                  <div className="flex justify-between">
                    <span>검색 옵션</span>
                    <span>{PRICING_CONFIG.server.addons.search.toLocaleString()}원</span>
                  </div>
                )}
                {step2.fastDeadline && step2.fastDeadlineOption && (
                  <div className="flex justify-between">
                    <span>
                      빠른 마감 (
                      {step2.fastDeadlineOption === 'basic24h' && '24시간/기본'}
                      {step2.fastDeadlineOption === 'logo48h' && '48시간/로고'}
                      {step2.fastDeadlineOption === 'theme48h' && '48시간/테마'}
                      )
                    </span>
                    <span>
                      {step2.fastDeadlineOption === 'basic24h' && '10,000원'}
                      {step2.fastDeadlineOption === 'logo48h' && '15,000원'}
                      {step2.fastDeadlineOption === 'theme48h' && '20,000원'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 자동봇 관련 */}
          {step3.applyBot === 'yes' && (
            <div className="space-y-2">
              <p className="text-[15px] font-medium text-gray-700 border-b border-gray-200 pb-1">자동봇 관련</p>
              <div className="space-y-1 text-[14px]">
                {/* 가동 비용 */}
                <div className="flex justify-between">
                  <span>
                    가동 비용 ({step3.operationWeeksOption === 'same' ? step1.operationWeeks : step3.manualWeeks}주)
                  </span>
                  <span>{estimate.operationCost.toLocaleString()}원</span>
                </div>
                {/* 메인 봇 */}
                {step3.mainBot && (
                  <div className="flex justify-between">
                    <span>
                      {step3.mainBot === 'basic' && '기본봇'}
                      {step3.mainBot === 'basicShop' && '기본+상점봇'}
                      {step3.mainBot === 'basicShopStat' && '기본+상점+스탯봇'}
                    </span>
                    <span>{PRICING_CONFIG.bot.mainTypes[step3.mainBot].toLocaleString()}원</span>
                  </div>
                )}
                {/* 추가 옵션들 */}
                {step3.cocBot && (
                  <div className="flex justify-between">
                    <span>CoC 봇</span>
                    <span>{PRICING_CONFIG.bot.addons.cocBot.toLocaleString()}원</span>
                  </div>
                )}
                {step3.customCommandUpgrade && (
                  <div className="flex justify-between">
                    <span>커스텀 명령어 업그레이드</span>
                    <span>{PRICING_CONFIG.bot.addons.customCommandUpgrade.toLocaleString()}원</span>
                  </div>
                )}
                {step3.reservationToot && (
                  <div className="flex justify-between">
                    <span>예약 툿</span>
                    <span>{PRICING_CONFIG.bot.addons.reservationToot.toLocaleString()}원</span>
                  </div>
                )}
                {step3.autoProfileImage && (
                  <div className="flex justify-between">
                    <span>자동 스진</span>
                    <span>{PRICING_CONFIG.bot.addons.autoProfileImage.toLocaleString()}원</span>
                  </div>
                )}
                {step3.tootCurrencyLink && (
                  <div className="flex justify-between">
                    <span>툿-재화 연동</span>
                    <span>{PRICING_CONFIG.bot.addons.tootCurrencyLink.toLocaleString()}원</span>
                  </div>
                )}
                {step3.transferFeature && (
                  <div className="flex justify-between">
                    <span>
                      양도 기능 ({
                        step3.transferOption === 'itemOnly' ? '아이템만' :
                        step3.transferOption === 'currencyOnly' ? '재화만' : '모두'
                      })
                    </span>
                    <span>{PRICING_CONFIG.bot.addons.transferFeature.toLocaleString()}원</span>
                  </div>
                )}
                {step3.omakaseBot && (
                  <div className="flex justify-between">
                    <span>오마카세</span>
                    <span className="text-gray-500">별도 협의</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 총 합계 */}
          <div className="pt-4 border-t-2 border-black">
            <div className="flex justify-between items-center">
              <p className="text-[18px] font-bold">총 합계</p>
              <p className="text-[24px] font-bold text-[#ff7b00]">
                {estimate.grandTotal.toLocaleString()}원
              </p>
            </div>
            {estimate.hasVariablePrice && (
              <p className="text-[13px] text-gray-600 mt-2">
                * {estimate.variableItems.join(', ')} 비용은 별도 협의됩니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 질문 정책 안내 */}
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
        <h3 className="text-[16px] font-medium mb-4">질문 정책 안내</h3>
        
        <div className="space-y-4 text-[14px] text-gray-700">
          {/* 무료 질문 횟수 */}
          <div className="space-y-1">
            <p className="font-medium">무료 질문 횟수</p>
            <p className="text-[13px]">
              첫 메시지부터 자동봇 세팅 완료 시점까지 <strong className="text-[#ff7b00]">최대 3회</strong>입니다.<br />
              <span className="text-gray-500">(하나의 메시지에 여러 질문을 작성해 전송하면 1회로 간주됩니다)</span>
            </p>
            <p className="text-[13px]">4회차부터는 질문 1개당 <strong className="text-[#ff7b00]">3,000원</strong>의 추가금이 발생합니다.</p>
          </div>

          {/* 예외 사항 */}
          <div className="p-3 bg-white border border-gray-200 rounded-md">
            <p className="text-[13px]">
              <span className="font-medium">예외:</span> 자동봇 세팅 완료 후 발생하는 오류나 사용법 관련 질문은 카운트하지 않습니다.
            </p>
          </div>

          {/* 복잡한 요구사항 */}
          <div className="space-y-1">
            <p className="font-medium">복잡한 자동봇 / 요구사항이 많은 경우</p>
            <p className="text-[13px]">
              구현을 원하시는 내용을 자세히 기재한 문서를 전달해 주시면, 추가로 필요한 정보를 정리해서 안내드립니다.<br />
              <span className="text-gray-500">보통 신청자님께서 질문하시는 것보다 제가 질문하는 쪽이 효율이 좋습니다.</span>
            </p>
          </div>

          {/* 답변 시간 안내 */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-[13px] text-amber-800">
              해외 거주 중이어서 바로 답변해드리기 어렵습니다. <strong>중요한 질문만 모아서</strong> 전달해 주세요.
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={policyConfirmed}
              onChange={(e) => setPolicyConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 min-w-[20px] min-h-[20px] accent-[#ff7b00] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff7b00] focus-visible:outline-offset-2"
            />
            <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">
              위 질문 정책 안내를 읽고 이해했습니다. <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg animate-bounceIn">
          <p className="text-[14px] text-red-700 text-center">{error}</p>
        </div>
      )}

      {/* 복사 버튼 */}
      <div className="pt-6 border-t-2 border-gray-300">
        <button
          onClick={handleCopy}
          disabled={!isCopyEnabled}
          className={`w-full py-4 rounded-lg font-medium text-[16px] transition-all duration-300 ${
            isCopyEnabled
              ? 'bg-[#ff7b00] hover:bg-[#e66d00] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]'
              : 'bg-gray-200 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
          }`}
        >
          {isCopying ? '복사 중...' : isCopyEnabled ? '신청서 복사하기' : '정책 동의 후 복사 가능'}
        </button>

        {copySuccess && redirectCountdown !== null && (
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg animate-bounceIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-[14px] text-green-700 font-medium">
                복사 완료! {redirectCountdown}초 후 크레페로 이동합니다...
              </p>
              <div className="flex gap-2">
                <button
                  onClick={goToCrepe}
                  className="px-4 py-2 min-h-[44px] text-[14px] bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
                >
                  바로 이동
                </button>
                <button
                  onClick={cancelRedirect}
                  className="px-4 py-2 min-h-[44px] text-[14px] text-green-700 border border-green-500 rounded-md hover:bg-green-100 transition-colors focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {copySuccess && redirectCountdown === null && (
          <div className="mt-4 p-4 bg-[#fff5eb] border-2 border-[#ff7b00] rounded-lg">
            <p className="text-[14px] text-[#ff7b00] font-medium">
              복사에 성공했습니다! <button onClick={goToCrepe} className="underline font-medium hover:text-[#e66d00] transition-colors">크레페</button>로 이동해서 신청서에 내용을 붙여넣습니다.
            </p>
          </div>
        )}

        {isCopyEnabled && !copySuccess && (
          <div className="mt-4 p-4 bg-[#fff5eb] border-2 border-[#ff7b00] rounded-lg animate-fadeIn">
            <p className="text-[14px] text-[#ff7b00]">
              <strong>다음 단계:</strong> 복사하기 버튼을 통해 신청서를 복사한 후, 크레페로 이동해서 신청서에 내용을 붙여넣습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
