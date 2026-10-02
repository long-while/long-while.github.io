/**
 * 신청서 공통 틀 — 시안 '신청서 - STEP01~04' (file.json 실측).
 *  흰 카드 1320: 모서리 20, 패딩 70(모바일 20), shadow/card. 안쪽 1180, 간격 60.
 *  머리: '커미션 신청서 작성'(title3 #3376E7) → 12 → 단계 제목(headline1) → 16 → 설명(body1 #767676) → 60 → Stepper.
 *  아래: 가운데 버튼 220×64 — STEP1 은 다음만, STEP2·3 은 이전(흰) + 다음(파랑) 간격 12, STEP4 는 Step4Review 가 이전 + 복사를 그림.
 *  검증·이동·잠긴 단계 안내·오류 목록 클릭 이동 동작은 기존과 같다.
 */
import { useState, useEffect, useCallback, useMemo, useRef, forwardRef } from 'react';
import clsx from 'clsx';
import { Banner, Button, ErrorSummary, Icon, Stepper } from '@/app/components/ds';
import { useOrder } from '@/app/contexts/OrderContext';
import { validateOrderConsistency, validateStep1, validateStep2, validateStep3 } from '@/app/utils/orderUtils';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { FieldErrorProvider } from '@/app/contexts/FieldErrorContext';
import type { ValidationError } from '@/app/types/order';
import Step1Applicant from './steps/Step1Applicant';
import Step2Server from './steps/Step2Server';
import Step3Bot from './steps/Step3Bot';
import Step4Review from './steps/Step4Review';
import { StepModeProvider } from './stepMode';

type StepNumber = 1 | 2 | 3 | 4;

const STEP_LABELS = ['신청자 정보', '서버 설치', '자동봇', '최종 확인'];

/** 단계 제목·설명. STEP1~3 설명은 제목이나 바로 아래 예/아니오 질문과 같은 말이라 뺐다 (4단계 문구 정리) */
const STEP_HEAD: Record<StepNumber, { title: string; description?: string }> = {
  1: { title: 'Step 1. 신청자 및 커뮤니티 정보' },
  2: { title: 'Step 2. 서버 설치 옵션' },
  3: { title: 'Step 3. 자동봇 커미션' },
  4: { title: 'Step 4. 최종 확인 및 견적', description: '입력하신 내용을 확인하고 최종 견적을 확인해 주세요.' },
};

/** 신청 순서 안내 (STEP1 에서만). 세 칸 설명은 위 진행 표시와 겹쳐 한 줄로 줄였다 (4단계 문구 정리) */
function HowToApply() {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card bg-background-100 px-5 py-4 text-body2 text-text-secondary lg:px-6">
      <span className="text-title5 text-text-primary">신청 방법</span>
      <span>작성 → 4단계에서 복사 → 크레페 ‘신청하기’에 붙여넣어 제출</span>
    </p>
  );
}

// 단계가 바뀌면 이 머리말로 스크롤하고 단계 제목(h2)에 포커스를 둔다 (떠 있는 헤더 아래로 오게 scroll-margin)
const OrderHead = forwardRef<HTMLDivElement, { step: StepNumber }>(function OrderHead({ step }, ref) {
  const head = STEP_HEAD[step];
  return (
    <div ref={ref} className="flex scroll-mt-[calc(var(--ds-header-offset)+var(--ds-header-height)+24px)] flex-col items-center gap-3 text-center">
      <h1 className="text-title3 text-brand">커미션 신청서 작성</h1>
      <div className="flex flex-col gap-4">
        <h2 tabIndex={-1} data-step-title className="text-headline1 text-text-primary focus:outline-none">{head.title}</h2>
        {head.description && <p className="text-body1 text-text-secondary">{head.description}</p>}
      </div>
      <p className="flex items-center gap-1 text-body3 text-text-secondary">
        <Icon name="info" size={20} className="shrink-0 text-text-disabled" />
        작성 중인 내용은 자동으로 저장됩니다
      </p>
    </div>
  );
});

function StepNotice({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div role="status" className="flex items-center justify-between gap-4 rounded-card border border-warning-200 bg-warning-50 px-5 py-4">
      <p className="text-body3 text-warning-700">{message}</p>
      <button type="button" onClick={onClose} aria-label="알림 닫기" className="flex size-8 shrink-0 items-center justify-center rounded-pill text-warning-700 hover:bg-warning-200 focus-visible:outline-2 focus-visible:outline-warning-700">
        <Icon name="close" />
      </button>
    </div>
  );
}

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
  const { serverCalcResult } = useEstimate();

  // 각 스텝의 완료 여부 확인 (통합 검증 함수 사용)
  // 진행 표시로 앞 단계를 건너뛸 때도 '다음' 과 같은 검사(단계를 넘나드는 검사 포함)를 쓴다
  const isStepComplete = useCallback((step: number): boolean => {
    const consistency = validateOrderConsistency(formData, serverCalcResult);
    switch (step) {
      case 1:
        return validateStep1(formData.step1).length === 0;
      case 2:
        return validateStep2(formData.step2).length === 0 && consistency.step2.length === 0;
      case 3:
        return validateStep3(formData.step3).length === 0 && consistency.step3.length === 0;
      default:
        return false;
    }
  }, [formData, serverCalcResult]);

  // 특정 스텝으로 이동 가능한지 확인
  const canAccessStep = useCallback((targetStep: number): boolean => {
    if (targetStep <= currentStep) return true; // 이전 스텝은 항상 접근 가능
    for (let i = 1; i < targetStep; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  }, [currentStep, isStepComplete]);

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
    const consistency = validateOrderConsistency(formData, serverCalcResult);
    if (currentStep === 1) return validateStep1(formData.step1);
    if (currentStep === 2) return [...validateStep2(formData.step2), ...consistency.step2];
    if (currentStep === 3) return [...validateStep3(formData.step3), ...consistency.step3];
    return [];
  }, [currentStep, formData, serverCalcResult]);

  /**
   * '다음'을 한 번 누른 뒤에는 사용자가 값을 고칠 때마다 오류를 다시 계산한다.
   * 그러지 않으면 고친 입력칸이 다음 '다음' 클릭 전까지 계속 빨갛게 남는다.
   */
  useEffect(() => {
    if (!submitAttempted) return;
    setValidationErrors(errorsForCurrentStep());
  }, [submitAttempted, errorsForCurrentStep]);

  const goToStep = (step: StepNumber) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 200);
  };

  /**
   * 단계가 바뀌면(다음·이전·진행 표시·STEP4 '수정' 모두) 새 단계가 그려진 뒤 신청서 머리말로 스크롤하고 단계 제목에 포커스.
   * 예전에는 버튼마다 바뀌기 직전에 맨 위로 스크롤해서, 내용 높이가 바뀌며 단계마다 멈추는 위치가 달랐다 (4단계 리뷰).
   * 처음 열 때는 움직이지 않는다.
   */
  const headRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(currentStep);
  useEffect(() => {
    if (shownStep.current === currentStep) return;
    shownStep.current = currentStep;
    headRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    headRef.current?.querySelector<HTMLElement>('[data-step-title]')?.focus({ preventScroll: true });
  }, [currentStep]);

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
    if (currentStep < 4) goToStep((currentStep + 1) as StepNumber);
  };

  const handlePrevious = () => {
    if (currentStep > 1) goToStep((currentStep - 1) as StepNumber);
  };

  const handleStepClick = (index: number) => {
    const step = (index + 1) as StepNumber;
    if (!stepAccessibility[step]) {
      setStepNotice('이전 단계를 먼저 완료해 주세요.');
      return;
    }
    goToStep(step);
  };

  // 스텝 변경 시 에러 초기화
  useEffect(() => {
    setValidationErrors([]);
    setSubmitAttempted(false);
    setStepNotice(null);
  }, [currentStep]);

  const handleDismissSyncNotice = () => {
    setShowSyncNotice(false);
    clearCartSync();
  };

  return (
    <div className="flex flex-col gap-10 rounded-card-lg bg-background-white px-5 py-8 shadow-card sm:p-10 lg:gap-[60px] lg:p-[70px]">
      <div className="flex flex-col gap-8 lg:gap-[60px]">
        <OrderHead ref={headRef} step={currentStep} />
        <Stepper
          steps={STEP_LABELS}
          current={currentStep - 1}
          onStepClick={handleStepClick}
          isStepEnabled={(index) => stepAccessibility[(index + 1) as StepNumber]}
        />
      </div>

      {(showSyncNotice && cartSyncState) || stepNotice || validationErrors.length > 0 || currentStep === 1 ? (
        <div className="flex flex-col gap-4">
          {currentStep === 1 && <HowToApply />}
          {showSyncNotice && cartSyncState && currentStep < 4 && (
            <Banner
              title="견적 항목이 자동으로 반영되었습니다"
              description={`${cartSyncState.itemCount}개 항목이 신청서에 반영되었습니다. Step 2, Step 3에서 선택된 옵션을 확인해 주세요.`}
              actions={
                <button type="button" onClick={handleDismissSyncNotice} aria-label="알림 닫기" className="flex size-11 items-center justify-center rounded-pill text-text-secondary hover:bg-background-white focus-visible:outline-2 focus-visible:outline-brand">
                  <Icon name="close" />
                </button>
              }
            />
          )}
          {stepNotice && <StepNotice message={stepNotice} onClose={() => setStepNotice(null)} />}
          {validationErrors.length > 0 && (
            <ErrorSummary
              title="입력 내용을 확인해 주세요"
              errors={validationErrors.map((error, idx) => ({ key: `${error.field}-${idx}`, message: error.message, onSelect: () => focusField(error.field) }))}
            />
          )}
        </div>
      ) : null}

      <div className={clsx('transition-all duration-300', isTransitioning ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100')}>
        <FieldErrorProvider errors={validationErrors}>
          <StepModeProvider errors={validationErrors} currentStep={currentStep}>
            {currentStep === 1 && <Step1Applicant />}
            {currentStep === 2 && <Step2Server />}
            {currentStep === 3 && <Step3Bot />}
            {currentStep === 4 && <Step4Review />}
          </StepModeProvider>
        </FieldErrorProvider>
      </div>

      {/* STEP4 는 이전·복사 버튼을 Step4Review 가 직접 그린다 (시안: 복사 버튼이 이전 옆) */}
      {currentStep < 4 && (
        <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row">
          {currentStep > 1 && <Button variant="white" size="lg" onClick={handlePrevious} className="sm:w-[220px]">← 이전</Button>}
          <Button size="lg" onClick={handleNext} className="sm:w-[220px]">다음 →</Button>
        </div>
      )}
    </div>
  );
}
