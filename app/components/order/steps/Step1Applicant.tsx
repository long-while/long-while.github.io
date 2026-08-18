import { useEffect } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import { calculateOperationWeeks } from '@/app/utils/orderUtils';
import { INPUT_LIMITS } from '@/app/types/order';

interface Step1ApplicantProps {
  onNavigate?: (page: string) => void;
}

export default function Step1Applicant({ onNavigate }: Step1ApplicantProps) {
  const { formData, updateStep1, restoredFromStorage } = useOrder();
  const step1 = formData.step1;

  // 임시저장 복원 시 비밀번호는 저장되지 않아 비어 있으므로 재입력 안내
  const passwordNeedsReentry = restoredFromStorage && step1.googlePassword.trim() === '';

  // 날짜 변경 시 자동으로 N주 계산
  useEffect(() => {
    if (step1.openingDate && step1.closingDate) {
      const weeks = calculateOperationWeeks(step1.openingDate, step1.closingDate);
      updateStep1({ operationWeeks: weeks });
    }
  }, [step1.openingDate, step1.closingDate, updateStep1]);

  const handleTermsClick = () => {
    if (onNavigate) {
      // 새 탭에서 약관 및 안내 페이지 열기
      window.open(window.location.origin + '/#terms', '_blank', 'noopener,noreferrer');
    }
  };

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
      <fieldset className="space-y-3">
        <legend className="text-[18px] font-semibold">
          1) 약관 동의 <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(필수)</span>
        </legend>
        <p id="terms-description" className="text-[13px] text-gray-600 mt-1 mb-3">
          커미션 진행을 위해 <button type="button" onClick={handleTermsClick} className="underline hover:text-[var(--brand-primary)]">약관 및 안내</button>를 확인하셨나요?
        </p>
        <div
          role="radiogroup"
          aria-labelledby="terms-legend"
          aria-describedby="terms-description"
          aria-required="true"
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="termsAgreed"
              checked={step1.termsAgreed === 'yes'}
              onChange={() => updateStep1({ termsAgreed: 'yes' })}
              className="w-5 h-5 form-radio"
            />
            <span className="text-[14px]">예</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="termsAgreed"
              checked={step1.termsAgreed === 'no'}
              onChange={() => updateStep1({ termsAgreed: 'no' })}
              className="w-5 h-5 form-radio"
            />
            <span className="text-[14px]">아니오</span>
          </label>
        </div>
      </fieldset>

      {/* 2) 신청자 닉네임 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold mb-4">2) 신청자 닉네임</h3>
        <div className="space-y-2">
          <label htmlFor="applicantNickname" className="block text-[14px] font-medium">
            신청자의 크레페 닉네임 <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="applicantNickname"
            type="text"
            value={step1.applicantNickname}
            onChange={(e) => updateStep1({ applicantNickname: e.target.value.slice(0, INPUT_LIMITS.applicantNickname) })}
            maxLength={INPUT_LIMITS.applicantNickname}
            placeholder="예: 한참"
            aria-required="true"
            className="form-input"
          />
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
              type="text"
              value={step1.communityShortName}
              onChange={(e) => updateStep1({ communityShortName: e.target.value.slice(0, INPUT_LIMITS.communityShortName) })}
              maxLength={INPUT_LIMITS.communityShortName}
              placeholder="예: 망저"
              aria-required="true"
              className="form-input"
            />
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
              type="text"
              value={step1.communityKoreanName}
              onChange={(e) => updateStep1({ communityKoreanName: e.target.value.slice(0, INPUT_LIMITS.communityKoreanName) })}
              maxLength={INPUT_LIMITS.communityKoreanName}
              placeholder="예: 망각의 저편"
              aria-required="true"
              className="form-input"
            />
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
              type="text"
              value={step1.communityEnglishName}
              onChange={(e) => updateStep1({ communityEnglishName: e.target.value.slice(0, INPUT_LIMITS.communityEnglishName) })}
              maxLength={INPUT_LIMITS.communityEnglishName}
              placeholder="예: Beyond the Oblivion"
              aria-required="true"
              className="form-input"
            />
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
          </div>
        )}

        {!step1.isLongTermCommunity && (
          <>
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
          </>
        )}
      </div>

      {/* 5) 커뮤니티 구글 계정 */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-[18px] font-semibold mb-2">5) 커뮤니티 구글 계정</h3>
        <p className="text-[13px] text-gray-600 mb-4">
          서버 설치와 자동봇 운영을 위해 커뮤니티의 구글 계정이 필요합니다.<br />
          구글 이메일 주소와 비밀번호를 적어 주세요.<br />
          개인 구글계정을 사용하셔도 상관은 없으나, 개인정보 보호를 위해 새로운 계정을 개설하시는 걸 추천드립니다.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="googleEmail" className="block text-[14px] font-medium">
              커뮤니티 구글 이메일 주소 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="googleEmail"
              type="email"
              value={step1.googleEmail}
              onChange={(e) => updateStep1({ googleEmail: e.target.value })}
              placeholder="example@gmail.com"
              aria-required="true"
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="googlePassword" className="block text-[14px] font-medium">
              구글 비밀번호 <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <p className="text-[12px] text-amber-600 bg-[#fff1e3] p-2 rounded-md mb-2">
              비밀번호는 브라우저에 저장되지 않으며, 페이지를 떠나면 입력 내용이 삭제됩니다.
            </p>
            {passwordNeedsReentry && (
              <p
                role="alert"
                className="text-[12px] text-red-600 bg-red-50 border border-red-300 p-2 rounded-md mb-2 flex items-start gap-1.5"
              >
                <span aria-hidden="true">⚠</span>
                <span>저장된 신청서를 불러왔어요. 비밀번호는 보안상 저장되지 않으니, <strong>여기부터 다시 입력</strong>해 주세요.</span>
              </p>
            )}
            <input
              id="googlePassword"
              type="password"
              value={step1.googlePassword}
              onChange={(e) => updateStep1({ googlePassword: e.target.value })}
              placeholder="비밀번호 입력"
              aria-required="true"
              aria-invalid={passwordNeedsReentry}
              autoComplete="new-password"
              className={`form-input ${passwordNeedsReentry ? 'border-red-500 ring-2 ring-red-200 focus:border-red-500' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
