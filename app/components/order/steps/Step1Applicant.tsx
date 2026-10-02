/**
 * STEP1 신청자 및 커뮤니티 정보 — 시안 '신청서 - STEP01-일반' / '-장기 소규모 서버' (334:2616, 249:1469, file.json 실측).
 *  묶음 순서는 시안대로: 신청자 닉네임 → 커뮤니티 정보 → 커뮤니티 일정 → 약관 동의 (간격 70).
 *  입력칸 580(2열, 간격 20), 라벨 → 12 → 칸 → 8 → '※' 도움말 body3. 일정 3칸. 약관 동의는 #DDDDDD 선 상자(패딩 32·24) + 원형 체크.
 *  장기 소규모 서버: 회색 안내 상자(InfoBox) + 아래 확인 체크. 입력·검증·날짜 계산 동작은 기존 그대로.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Checkbox, FieldLabel, FormSection, InfoBox } from '@/app/components/ds';
import { useOrder } from '@/app/contexts/OrderContext';
import TermsModal from '@/app/components/order/TermsModal';
import { FieldError, FieldGroupError, useFieldAria } from '@/app/contexts/FieldErrorContext';
import { calculateOperationWeeks } from '@/app/utils/orderUtils';
import { INPUT_LIMITS, type Step1Data } from '@/app/types/order';

type TextKey = 'applicantNickname' | 'communityShortName' | 'communityKoreanName' | 'communityEnglishName';

// 4단계 문구 정리: 같은 말이 겹치던 네 줄을 셋으로, 기간 기준은 12개월(T2). 자세한 조건은 FAQ 한 문항이 기준
const LONG_TERM_NOTES: ReactNode[] = [
  <><strong>12개월 이상</strong> 소규모로 운영할 때만 체크해 주세요.</>,
  <>그보다 짧게 쓰신다면 자관·역극용이어도 체크하지 말고, 아래 일정란에 대략적인 날짜를 적어 주세요.</>,
  <>장기 소규모 서버는 서버비를 낮추기 위해 <strong>검색 기능을 넣을 수 없어요.</strong></>,
];

function TextInput({ field, label, helper, placeholder, step1, onChange }: {
  field: TextKey;
  label: string;
  helper?: string;
  placeholder: string;
  step1: Step1Data;
  onChange: (field: TextKey, value: string) => void;
}) {
  const fieldAria = useFieldAria();
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor={field} required>{label}</FieldLabel>
      <div>
        <input
          id={field}
          {...fieldAria(field)}
          type="text"
          value={step1[field]}
          onChange={(e) => onChange(field, e.target.value.slice(0, INPUT_LIMITS[field]))}
          maxLength={INPUT_LIMITS[field]}
          placeholder={placeholder}
          aria-required="true"
          className="form-input"
        />
        {helper && <p className="mt-2 text-body3 text-text-secondary">※ {helper}</p>}
        <FieldError field={field} />
      </div>
    </div>
  );
}

function DateInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor={id} required>{label}</FieldLabel>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} aria-required="true" className="form-input" />
    </div>
  );
}

function ScheduleSection({ step1, updateStep1 }: { step1: Step1Data; updateStep1: (d: Partial<Step1Data>) => void }) {
  const toggleLongTerm = (checked: boolean) => {
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
  };
  return (
    <FormSection title="커뮤니티 일정">
      <Checkbox
        appearance="outline"
        checked={step1.isLongTermCommunity}
        onChange={(e) => toggleLongTerm(e.target.checked)}
        label={<>장기 소규모 서버입니다.<span className="text-text-secondary"> (합격자 발표/개장/폐장 일정 없이 운영)</span></>}
      />

      {/* 장기 소규모 서버 안내 + '확인했습니다' 게이트 */}
      {step1.isLongTermCommunity && (
        <div className="flex flex-col gap-4 animate-slideDown">
          <InfoBox title="장기 소규모 서버가 맞으신지 꼭 확인해 주세요" items={LONG_TERM_NOTES} />
          <div>
            <Checkbox
              appearance="outline"
              checked={step1.longTermConfirmed}
              onChange={(e) => updateStep1({ longTermConfirmed: e.target.checked })}
              label="12개월 이상 운영할 장기 소규모 서버가 맞습니다."
            />
            <FieldError field="longTermConfirmed" />
          </div>
        </div>
      )}

      {!step1.isLongTermCommunity && (
        <FieldGroupError field="dates">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <DateInput id="resultAnnouncementDate" label="합격자 발표일" value={step1.resultAnnouncementDate} onChange={(v) => updateStep1({ resultAnnouncementDate: v })} />
            <DateInput id="openingDate" label="개장일" value={step1.openingDate} onChange={(v) => updateStep1({ openingDate: v })} />
            <DateInput id="closingDate" label="폐장일" value={step1.closingDate} onChange={(v) => updateStep1({ closingDate: v })} />
          </div>
          {/* 운영 기간 표시 */}
          {step1.operationWeeks > 0 && (
            <p className="mt-4 rounded-input bg-background-brand px-5 py-4 text-title5 text-brand">
              커뮤니티 운영기간: {step1.operationWeeks}주
            </p>
          )}
        </FieldGroupError>
      )}
    </FormSection>
  );
}

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

  const setText = (field: TextKey, value: string) => updateStep1({ [field]: value });

  return (
    <div className="flex flex-col gap-12 lg:gap-[70px]">
      <FormSection title="신청자 닉네임">
        <div className="lg:w-[580px]">
          <TextInput field="applicantNickname" label="신청자의 크레페 닉네임" placeholder="예: 한참" step1={step1} onChange={setText} />
        </div>
      </FormSection>

      <FormSection title="커뮤니티 정보">
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
          <TextInput field="communityShortName" label="커뮤니티 약칭" placeholder="예: 망저" step1={step1} onChange={setText} />
          <TextInput field="communityKoreanName" label="한글 이름" placeholder="예: 망각의 저편" step1={step1} onChange={setText} />
          <TextInput field="communityEnglishName" label="영어 이름" helper="도메인 이름에 쓰여요." placeholder="예: Beyond the Oblivion" step1={step1} onChange={setText} />
        </div>
      </FormSection>

      <ScheduleSection step1={step1} updateStep1={updateStep1} />

      <FormSection title="약관 동의" titleAside={<span className="sr-only">(필수)</span>}>
        <FieldGroupError field="termsAgreed">
          <div className="rounded-input border border-border-100 px-5 py-6 lg:px-6 lg:py-8">
            <Checkbox
              id="termsAgreed"
              appearance="outline"
              labelSize="lg"
              checked={step1.termsAgreed === 'yes'}
              onChange={(e) => updateStep1({ termsAgreed: e.target.checked ? 'yes' : 'no' })}
              aria-required="true"
              // 라벨 안의 '이용안내' 버튼이 이름에서 빠져 '를 확인했으며…'로 읽혀서 이름을 직접 준다 (4단계 리뷰)
              aria-label="이용안내를 확인했으며, 내용에 동의합니다."
              {...fieldAria('termsAgreed')}
              label={
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setIsTermsModalOpen(true); }}
                    className="underline underline-offset-2 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    이용안내
                  </button>
                  를 확인했으며, 내용에 동의합니다. <span className="text-brand" aria-hidden="true">*</span>
                </>
              }
            />
            {/* 동의하기 전에 꼭 알아야 할 규칙(환불·추가금)을 탭 안에 숨기지 않고 여기서 먼저 요약 (4단계 리뷰) */}
            <ul className="mt-5 flex list-disc flex-col gap-1.5 pl-5 text-body3 text-text-secondary lg:ml-9">
              <li>환불: 작업이 끝난 커미션은 커뮤니티 개장이 취소되어도 환불되지 않으며, 작업 중 취소하시면 그때까지 작업한 금액이 청구됩니다. 커미션주가 개장일까지 작업을 마무리하지 못한 경우에만 환불해 드립니다.</li>
              <li>추가금: 기획서 수령 후 취소 시 견적비 2만원, 무료 3회를 넘는 질문 1개당 3천원, 테마 이미지 교체 1회당 5천원, 빠른 마감 추가금이 있습니다.</li>
            </ul>
          </div>
        </FieldGroupError>
      </FormSection>

      <TermsModal open={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
