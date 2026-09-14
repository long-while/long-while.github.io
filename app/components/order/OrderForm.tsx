import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import { validateStep1, validateStep2, validateStep3 } from '@/app/utils/orderUtils';
import { FieldErrorProvider } from '@/app/contexts/FieldErrorContext';
import type { ValidationError } from '@/app/types/order';
import Step1Applicant from './steps/Step1Applicant';
import Step2Server from './steps/Step2Server';
import Step3Bot from './steps/Step3Bot';
import Step4Review from './steps/Step4Review';
import { CheckCircle, X } from 'lucide-react';
import { AlertTriangle } from 'griddy-icons';

export default function OrderForm() {
  const { formData, currentStep, setCurrentStep, cartSyncState, clearCartSync } = useOrder();
  const [showSyncNotice, setShowSyncNotice] = useState(false);

  // 동기화 상태가 있으면 알림 표시
  useEffect(() => {
    if (cartSyncState?.synced) {
      setShowSyncNotice(true);
    }
  }, [cartSyncState]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  /** '다음'을 한 번 눌러 검증이 돌았는지. 그 뒤부터는 입력할 때마다 오류를 다시 계산한다 */
  const [submitAttempted, setSubmitAttempted] = useState(false);
  /** 잠긴 단계를 눌렀을 때의 안내. 특정 입력칸의 오류가 아니라 별도로 보여준다 */
  const [stepNotice, setStepNotice] = useState<string | null>(null);

  // 각 스텝의 완료 여부 확인 (통합 검증 함수 사용)
  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return validateStep1(formData.step1).length === 0;
      case 2:
        return validateStep2(formData.step2).length === 0;
      case 3:
        return validateStep3(formData.step3).length === 0;
      default:
        return false;
    }
  }, [formData]);

  // 특정 스텝으로 이동 가능한지 확인
  const canAccessStep = useCallback((targetStep: number): boolean => {
    if (targetStep <= currentStep) return true; // 이전 스텝은 항상 접근 가능
    // 각 이전 스텝이 완료되었는지 확인
    for (let i = 1; i < targetStep; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  }, [currentStep, isStepComplete]);

  // 각 스텝 접근 가능 여부 메모이제이션
  const stepAccessibility = useMemo(() => ({
    1: true,
    2: canAccessStep(2),
    3: canAccessStep(3),
    4: canAccessStep(4),
  }), [canAccessStep]);

  /**
   * 상단 오류 목록에서 항목을 누르면 해당 입력칸으로 이동해 포커스를 준다.
   * 입력칸 id 와 검증 field 이름이 같은 경우에만 동작하고, 아니면 그룹 위치로 스크롤한다.
   */
  const focusField = (field: string) => {
    const input = document.getElementById(field);
    // disabled 입력칸에는 포커스가 들어가지 않으므로 메시지 위치로 보낸다
    if (input && !(input as HTMLInputElement).disabled) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (input as HTMLElement).focus({ preventScroll: true });
      return;
    }
    const anchor = document.getElementById(`${field}-error`) ?? input;
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /** 현재 단계의 검증 결과 */
  const errorsForCurrentStep = useCallback((): ValidationError[] => {
    if (currentStep === 1) return validateStep1(formData.step1);
    if (currentStep === 2) return validateStep2(formData.step2);
    if (currentStep === 3) return validateStep3(formData.step3);
    return [];
  }, [currentStep, formData]);

  /**
   * '다음'을 한 번 누른 뒤에는 사용자가 값을 고칠 때마다 오류를 다시 계산한다.
   * 그러지 않으면 고친 입력칸이 다음 '다음' 클릭 전까지 계속 빨갛게 남는다.
   */
  useEffect(() => {
    if (!submitAttempted) return;
    setValidationErrors(errorsForCurrentStep());
  }, [submitAttempted, errorsForCurrentStep]);

  const handleNext = () => {
    const errors = errorsForCurrentStep();
    setStepNotice(null);

    if (errors.length > 0) {
      setSubmitAttempted(true);
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitAttempted(false);
    setValidationErrors([]);

    if (currentStep < 4) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
        setIsTransitioning(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
        setIsTransitioning(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  };

  // 스텝 변경 시 에러 초기화
  useEffect(() => {
    setValidationErrors([]);
    setSubmitAttempted(false);
    setStepNotice(null);
  }, [currentStep]);

  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: '신청자 정보' },
      { num: 2, label: '서버 설치' },
      { num: 3, label: '자동봇' },
      { num: 4, label: '최종 확인' },
    ];

    const currentStepData = steps.find(s => s.num === currentStep);

    return (
      <div className="mb-8">
        {/* 모바일: 현재 스텝만 표시 */}
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-medium text-[14px] shadow-md">
                {currentStep}
              </div>
              <div>
                <p className="text-[14px] font-medium text-black">{currentStepData?.label}</p>
                <p className="text-[12px] text-foreground/60">Step {currentStep} / 4</p>
              </div>
            </div>
            {/* 미니 진행률 바 */}
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--brand-primary)] transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 데스크톱: 전체 프로그레스 바 */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between relative">
            {/* 프로그레스 라인 */}
            <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 -translate-y-1/2 -z-10">
              <div
                className="h-full bg-[var(--brand-primary)] transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {steps.map((step) => {
              const isAccessible = stepAccessibility[step.num as 1 | 2 | 3 | 4];
              return (
                <button
                  key={step.num}
                  onClick={() => {
                    if (!isAccessible) {
                      setStepNotice('이전 단계를 먼저 완료해 주세요.');
                      return;
                    }
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentStep(step.num as 1 | 2 | 3 | 4);
                      setIsTransitioning(false);
                    }, 200);
                  }}
                  disabled={!isAccessible}
                  className={`flex flex-col items-center gap-2 bg-white px-2 group ${
                    !isAccessible ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-[14px] border-2 transition-all duration-300 ${
                      currentStep >= step.num
                        ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-md'
                        : isAccessible
                          ? 'bg-white text-gray-400 border-gray-300 group-hover:border-[var(--brand-primary)] group-hover:text-[var(--brand-primary)]'
                          : 'bg-gray-100 text-gray-300 border-gray-200'
                    }`}
                  >
                    {step.num}
                  </div>
                  <span
                    className={`text-[14px] whitespace-nowrap transition-all duration-300 ${
                      currentStep >= step.num
                        ? 'text-[var(--brand-primary)] font-medium'
                        : isAccessible
                          ? 'text-gray-400 group-hover:text-[var(--brand-primary)]'
                          : 'text-gray-300'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleDismissSyncNotice = () => {
    setShowSyncNotice(false);
    clearCartSync();
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      {/* 프로그레스 바 */}
      {renderProgressBar()}

      {/* 장바구니 동기화 알림 */}
      {showSyncNotice && cartSyncState && (
        <div className="mb-6 p-4 bg-green-50 border border-green-500 rounded-md animate-fadeIn flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <h3 className="text-[15px] font-medium text-green-800 mb-1">
                견적 항목이 자동으로 반영되었습니다
              </h3>
              <p className="text-[13px] text-green-700">
                {cartSyncState.itemCount}개 항목이 신청서에 반영되었습니다. 
                Step 2, Step 3에서 선택된 옵션을 확인해 주세요.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismissSyncNotice}
            className="p-1 hover:bg-green-100 rounded-full transition-colors shrink-0"
            aria-label="알림 닫기"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {/* 잠긴 단계를 눌렀을 때의 안내 */}
      {stepNotice && (
        <div role="status" className="mb-6 p-4 bg-amber-50 border border-amber-400 rounded-md flex items-center justify-between gap-4">
          <p className="text-[14px] text-amber-800">{stepNotice}</p>
          <button
            onClick={() => setStepNotice(null)}
            className="p-1 hover:bg-amber-100 rounded-full transition-colors shrink-0"
            aria-label="알림 닫기"
          >
            <X className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      )}

      {/* 검증 에러 표시 - 애니메이션 추가 */}
      {validationErrors.length > 0 && (
        <div 
          className="mb-6 p-4 bg-red-50 border border-red-500 rounded-md animate-shake"
          style={{
            animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
          }}
        >
          <h3 className="text-[16px] font-medium text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} color="currentColor" />
            입력 내용을 확인해 주세요
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li
                key={`${error.field}-${idx}`}
                className="text-[14px] text-red-600"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${idx * 0.1}s both`
                }}
              >
                <button
                  type="button"
                  onClick={() => focusField(error.field)}
                  className="text-left underline decoration-red-300 underline-offset-2 hover:decoration-red-600 focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 rounded"
                >
                  {error.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 컨텐츠 카드 - 트랜지션 효과 추가 */}
      <div 
        className={`bg-white border border-border rounded-lg p-8 shadow-sm mb-8 transition-all duration-300 ${
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <FieldErrorProvider errors={validationErrors}>
          {currentStep === 1 && <Step1Applicant />}
          {currentStep === 2 && <Step2Server />}
          {currentStep === 3 && <Step3Bot />}
          {currentStep === 4 && <Step4Review />}
        </FieldErrorProvider>
      </div>

      {/* 네비게이션 버튼 */}
      {currentStep < 4 && (
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-border bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-[14px] font-medium rounded-md hover:shadow-sm active:scale-[0.98]"
          >
            ← 이전
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 border border-transparent bg-[var(--brand-primary)] text-white transition-all duration-200 text-[14px] font-medium rounded-md shadow-sm hover:shadow-md hover:brightness-95 active:scale-[0.98]"
          >
            다음 →
          </button>
        </div>
      )}

      {/* Step 4에서는 이전 버튼만 표시 (복사 버튼은 Step4Review 내부에) */}
      {currentStep === 4 && (
        <div className="flex justify-start">
          <button
            onClick={handlePrevious}
            className="px-6 py-3 border border-border bg-white hover:bg-gray-50 transition-all duration-300 text-[14px] font-medium rounded-md hover:shadow-sm active:scale-[0.98]"
          >
            ← 이전
          </button>
        </div>
      )}
    </div>
  );
}
