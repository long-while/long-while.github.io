import { useEffect, useState } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import TermsModal from '@/app/components/order/TermsModal';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { calculateOperationWeeks } from '@/app/utils/orderUtils';
import { INPUT_LIMITS } from '@/app/types/order';

export default function Step1Applicant() {
  const { formData, updateStep1 } = useOrder();
  const fieldAria = useFieldAria();
  const step1 = formData.step1;
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // 날짜 변경 시 자동으로 N주 계산
  useEffect(() => {
    if (step1.openingDate && step1.closingDate) {
      const weeks = calculateOperationWeeks(step1.openingDate, step1.closingDate);
      updateStep1({ operationWeeks: weeks });
    }
  }, [step1.openingDate, step1.closingDate, updateStep1]);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="pb-6 border-b border-border animate-fadeInDown">
        <h2 className="text-[25px] font-semibold mb-2 text-gradient-brand">
          Step 1. 신청자 및 커뮤니티 정보
        </h2>
        <p className="text-[14px] text-gray-600">
          커미션 신청에 필요한 기본 정보를 입력해 주세요.
        </p>
      </div>

      {/* 1) 약관 동의 */}
      <div className="space-y-3">
        <h3 className="text-[18px] font-semibold">
          1) 약관 동의 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(필수)</span>
        </h3>
        <FieldGroupError field="termsAgreed">
          <label className="flex items-start gap-3 cursor-pointer min-h-[44px] px-2 -mx-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              id="termsAgreed"
              type="checkbox"
              checked={step1.termsAgreed === 'yes'}
              onChange={(e) => updateStep1({ termsAgreed: e.target.checked ? 'yes' : 'no' })}
              className="w-5 h-5 mt-0.5 shrink-0 accent-[#ff7b00]"
              aria-required="true"
              {...fieldAria('termsAgreed')}
            />
            <span className="text-[14px] leading-[1.6]">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setIsTermsModalOpen(true); }}
                className="underline font-medium hover:text-[var(--brand-primary)]"
              >
                이용안내
              </button>
              를 확인했으며, 내용에 동의합니다.
            </span>
          </label>
        </FieldGroupError>
      </div>

      <TermsModal open={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

      {/* 2) 신청자 닉네임 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold mb-4">2) 신청자 닉네임</h3>
        <div className="space-y-2">
          <label htmlFor="applicantNickname" className="block text-[14px] font-medium">
            신청자의 크레페 닉네임 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="applicantNickname"
            {...fieldAria('applicantNickname')}
            type="text"
            value={step1.applicantNickname}
            onChange={(e) => updateStep1({ applicantNickname: e.target.value.slice(0, INPUT_LIMITS.applicantNickname) })}
            maxLength={INPUT_LIMITS.applicantNickname}
            placeholder="예: 한참"
            aria-required="true"
            className="form-input"
          />
          <FieldError field="applicantNickname" />
        </div>
      </div>

      {/* 3) 커뮤니티 정보 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold mb-4">3) 커뮤니티 정보</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="communityShortName" className="block text-[14px] font-medium">
              커뮤니티 약칭 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <p className="text-[13px] text-gray-600 mb-2">
              커미션주의 편의를 위해 작성하는 항목입니다.
            </p>
            <input
              id="communityShortName"
              {...fieldAria('communityShortName')}
              type="text"
              value={step1.communityShortName}
              onChange={(e) => updateStep1({ communityShortName: e.target.value.slice(0, INPUT_LIMITS.communityShortName) })}
              maxLength={INPUT_LIMITS.communityShortName}
              placeholder="예: 망저"
              aria-required="true"
              className="form-input"
            />
            <FieldError field="communityShortName" />
          </div>

          <div className="space-y-2">
            <label htmlFor="communityKoreanName" className="block text-[14px] font-medium">
              한글 이름 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <p className="text-[13px] text-gray-600 mb-2">
              커미션주의 편의를 위해 작성하는 항목입니다.
            </p>
            <input
              id="communityKoreanName"
              {...fieldAria('communityKoreanName')}
              type="text"
              value={step1.communityKoreanName}
              onChange={(e) => updateStep1({ communityKoreanName: e.target.value.slice(0, INPUT_LIMITS.communityKoreanName) })}
              maxLength={INPUT_LIMITS.communityKoreanName}
              placeholder="예: 망각의 저편"
              aria-required="true"
              className="form-input"
            />
            <FieldError field="communityKoreanName" />
          </div>

          <div className="space-y-2">
            <label htmlFor="communityEnglishName" className="block text-[14px] font-medium">
              영어 이름 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <p className="text-[13px] text-gray-600 mb-2">
              도메인 선정 시에 사용되니 신중히 작성해 주세요.
            </p>
            <input
              id="communityEnglishName"
              {...fieldAria('communityEnglishName')}
              type="text"
              value={step1.communityEnglishName}
              onChange={(e) => updateStep1({ communityEnglishName: e.target.value.slice(0, INPUT_LIMITS.communityEnglishName) })}
              maxLength={INPUT_LIMITS.communityEnglishName}
              placeholder="예: Beyond the Oblivion"
              aria-required="true"
              className="form-input"
            />
            <FieldError field="communityEnglishName" />
          </div>
        </div>
      </div>

      {/* 4) 커뮤니티 일정 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold mb-4">4) 커뮤니티 일정</h3>

        <label className="flex items-start gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={step1.isLongTermCommunity}
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                updateStep1({
                  isLongTermCommunity: true,
                  longTermConfirmed: false, // 체크할 때마다 '확인했습니다'를 다시 받도록 초기화
                  resultAnnouncementDate: '',
                  openingDate: '',
                  closingDate: '',
                  operationWeeks: 0,
                });
              } else {
                updateStep1({ isLongTermCommunity: false, longTermConfirmed: false });
              }
            }}
            className="w-4 h-4 mt-1 shrink-0 accent-[#ff7b00]"
          />
          <span className="text-[14px] leading-[1.6]">
            장기 소규모 서버입니다.
            <span className="text-gray-500"> (합격자 발표/개장/폐장 일정 없이 운영)</span>
          </span>
        </label>

        {/* 장기 소규모 서버 안내 + '확인했습니다' 게이트 */}
        {step1.isLongTermCommunity && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg animate-slideDown space-y-3">
            <p className="text-[14px] font-semibold text-amber-800">
              ⚠ 장기 소규모 서버가 맞으신지 꼭 확인해 주세요
            </p>
            <ul className="space-y-1.5 text-[13px] leading-[1.7] text-amber-800">
              <li className="pl-3 relative before:content-['·'] before:absolute before:left-0">
                장기 소규모 서버는 <strong>최소 반년(6개월) 이상</strong> 소규모로 (반영구적으로) 운영하려는 경우에만 해당됩니다.
              </li>
              <li className="pl-3 relative before:content-['·'] before:absolute before:left-0">
                자관·역극용이더라도 <strong>3개월 이하로 짧게</strong> 쓰실 예정이라면 이 항목을 체크하지 마시고, 아래 일정란에 <strong>아무 날짜나 대략</strong> 적어 주세요.
              </li>
              <li className="pl-3 relative before:content-['·'] before:absolute before:left-0">
                정말 장기적으로 유지하실 게 아니라면 체크하지 말아 주세요.
              </li>
              <li className="pl-3 relative before:content-['·'] before:absolute before:left-0">
                장기 소규모 서버는 저렴한 월 서버비 유지를 위해 <strong>검색 기능(검색 서버)을 추가할 수 없습니다.</strong> (서버비는 인원수·기간에 따라 달라지며, 검색을 넣으면 검색 서버가 별도로 필요해 월 서버비가 크게 오릅니다.)
              </li>
            </ul>
            <label className="flex items-start gap-2 cursor-pointer pt-1 border-t border-amber-200">
              <input
                type="checkbox"
                checked={step1.longTermConfirmed}
                onChange={(e) => updateStep1({ longTermConfirmed: e.target.checked })}
                className="w-4 h-4 mt-1 shrink-0 accent-[#ff7b00]"
              />
              <span className="text-[14px] font-medium text-amber-900 leading-[1.6]">
                위 내용을 이해했으며, 반년 이상 반영구적으로 운영할 장기 소규모 서버가 맞습니다.
              </span>
            </label>
            <FieldError field="longTermConfirmed" />
          </div>
        )}

        {!step1.isLongTermCommunity && (
          <FieldGroupError field="dates">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="resultAnnouncementDate" className="block text-[14px] font-medium">
                  합격자 발표일 <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="resultAnnouncementDate"
                  type="date"
                  value={step1.resultAnnouncementDate}
                  onChange={(e) => updateStep1({ resultAnnouncementDate: e.target.value })}
                  aria-required="true"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="openingDate" className="block text-[14px] font-medium">
                  개장일 <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="openingDate"
                  type="date"
                  value={step1.openingDate}
                  onChange={(e) => updateStep1({ openingDate: e.target.value })}
                  aria-required="true"
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="closingDate" className="block text-[14px] font-medium">
                  폐장일 <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="closingDate"
                  type="date"
                  value={step1.closingDate}
                  onChange={(e) => updateStep1({ closingDate: e.target.value })}
                  aria-required="true"
                  className="form-input"
                />
              </div>
            </div>

            {/* 운영 기간 표시 */}
            {step1.operationWeeks > 0 && (
              <div className="mt-4 p-3 bg-[var(--brand-bg)] border border-[var(--brand-primary)] rounded-md">
                <p className="text-[14px] text-[var(--brand-primary)] font-medium">
                  커뮤니티 운영기간: {step1.operationWeeks}주
                </p>
              </div>
            )}
          </FieldGroupError>
        )}
      </div>
    </div>
  );
}
