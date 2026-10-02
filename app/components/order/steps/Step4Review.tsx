/**
 * STEP4 최종 확인 및 견적 — 시안 '신청서 - STEP04' (286:2988). 화면 조각은 Step4Sections.
 *  아래 버튼 줄: 이전(흰) + 신청서 복사하기(파랑) 220×64 가운데 (시안처럼 복사 버튼이 이전 옆).
 *  복사 → 크레페 이동은 Q7 흐름(useCopyFlow): 완료 모달 + 5초 후 이동 + 이동 후 안내띠, 실패 시 경고 모달.
 *  복사 직전 구글 계정 검사(비어 있으면 막고 입력칸으로 이동)는 기존 그대로.
 */
import { useState, useMemo, useCallback } from 'react';
import { useOrder } from '@/app/contexts/OrderContext';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { calculateTotalEstimate, generateCopyText, hasServerInfraFee, validateGoogleAccount } from '@/app/utils/orderUtils';
import { Button } from '@/app/components/ds';
import { ApplicantReview, BotReview, EstimateReview, GoogleAccountFields, PolicyBox, ServerReview } from './Step4Sections';
import { CopyDialogs, MoveBanner } from './CopyDialogs';
import { useCopyFlow } from './useCopyFlow';

export default function Step4Review() {
  const { formData, setCurrentStep, updateStep1, restoredFromStorage } = useOrder();
  const { serverCalcResult } = useEstimate();
  const { step1 } = formData;
  // 임시저장 복원 시 비밀번호는 저장되지 않아 비어 있으므로 재입력 안내
  const passwordNeedsReentry = restoredFromStorage && step1.googlePassword.trim() === '';
  const [policyConfirmed, setPolicyConfirmed] = useState(false);
  // 구글 계정 오류는 복사를 한 번 시도한 뒤부터 보여준다 (입력 전부터 빨갛게 두지 않도록)
  const [googleErrorsShown, setGoogleErrorsShown] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // 실시간 견적 계산
  const estimate = useMemo(() => {
    try {
      return calculateTotalEstimate(formData);
    } catch (err) {
      console.error('견적 계산 실패:', err);
      return { serverTotal: 0, botTotal: 0, operationCost: 0, grandTotal: 0, hasVariablePrice: false, variableItems: [] };
    }
  }, [formData]);

  // 도메인·SMTP 실비 부과 여부 (서버 설치 신청 시 자동 포함, 장기 소규모는 제외)
  const infraFeeApplied = hasServerInfraFee(formData);

  /**
   * 화면에 보여 주는 신청서 원문.
   * 스냅샷으로 굳히면, 복사한 뒤 이 화면에서 구글 계정을 고쳤을 때
   * '내용 보기'가 옛 값을 보여 주고 그대로 다시 복사돼 버린다. 항상 현재 값에서 파생시킨다.
   */
  const copyTextPreview = useMemo(
    () => generateCopyText(formData, estimate, serverCalcResult),
    [formData, estimate, serverCalcResult],
  );
  const flow = useCopyFlow(copyTextPreview);
  // 확인용 화면에는 비밀번호를 가린다 (복사되는 원문은 그대로). 비밀번호는 검증상 8자 이상이라 다른 글자와 겹칠 일이 거의 없다
  const maskedCopyText = useMemo(
    () => (step1.googlePassword.length >= 8 ? copyTextPreview.split(step1.googlePassword).join('••••••••') : copyTextPreview),
    [copyTextPreview, step1.googlePassword],
  );

  // 구글 계정 검증 (Step 1 에서 이 단계로 옮겨온 항목)
  const googleErrors = useMemo(() => validateGoogleAccount(step1), [step1]);
  const googleErrorFor = useCallback(
    (field: string) => (googleErrorsShown ? googleErrors.find((e) => e.field === field)?.message ?? null : null),
    [googleErrors, googleErrorsShown],
  );

  // 복사 버튼 활성화 조건: 정책 동의 체크
  const isCopyEnabled = policyConfirmed && !flow.isCopying;

  const handleCopy = useCallback(async () => {
    if (!isCopyEnabled) return;
    // 구글 계정이 비어 있으면 복사 전에 막고 해당 입력칸으로 보낸다
    if (googleErrors.length > 0) {
      setGoogleErrorsShown(true);
      setGoogleError('커뮤니티 구글 계정을 입력해 주세요.');
      document.getElementById('googleAccount')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById(googleErrors[0].field)?.focus({ preventScroll: true });
      return;
    }
    setGoogleError(null);
    await flow.copy();
  }, [isCopyEnabled, googleErrors, flow]);

  // 수정·이전: 단계만 바꾸면 OrderForm 이 신청서 머리말로 스크롤하고 제목에 포커스를 준다
  const handleEdit = useCallback((step: 1 | 2 | 3) => setCurrentStep(step), [setCurrentStep]);
  const goPrevious = () => setCurrentStep(3);

  return (
    <div className="flex flex-col gap-12 lg:gap-[70px]">
      <MoveBanner flow={flow} />
      <CopyDialogs flow={flow} text={copyTextPreview} maskedText={maskedCopyText} />

      <ApplicantReview data={formData} onEdit={handleEdit} />
      <ServerReview data={formData} onEdit={handleEdit} />
      <BotReview data={formData} onEdit={handleEdit} />
      <EstimateReview data={formData} estimate={estimate} infraFeeApplied={infraFeeApplied} serverCalc={serverCalcResult} />
      <PolicyBox confirmed={policyConfirmed} onConfirm={setPolicyConfirmed} />
      <GoogleAccountFields
        email={step1.googleEmail}
        password={step1.googlePassword}
        onChange={updateStep1}
        errorFor={googleErrorFor}
        passwordNeedsReentry={passwordNeedsReentry}
      />

      {(googleError || (isCopyEnabled && !flow.copySuccess)) && (
        <div className="flex flex-col gap-4">
          {googleError && (
            <p className="rounded-card border border-error-500 bg-background-white p-4 text-center text-body3 text-error-500">{googleError}</p>
          )}
          {isCopyEnabled && !flow.copySuccess && (
            <p className="rounded-card bg-background-brand p-5 text-body2 text-brand">
              <strong className="font-medium">다음 단계:</strong> 복사하기 버튼을 통해 신청서를 복사한 후, 크레페로 이동해서 신청서에 내용을 붙여넣습니다.
            </p>
          )}
        </div>
      )}

      {/* 아래 버튼: 이전 + 복사 (시안) */}
      <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row">
        <Button variant="white" size="lg" onClick={goPrevious} className="sm:w-[220px]">← 이전</Button>
        <Button size="lg" onClick={handleCopy} disabled={!isCopyEnabled} className="sm:min-w-[220px]">
          {flow.isCopying ? '복사 중...' : isCopyEnabled ? '신청서 복사하기' : '정책 동의 후 복사 가능'}
        </Button>
      </div>
    </div>
  );
}
