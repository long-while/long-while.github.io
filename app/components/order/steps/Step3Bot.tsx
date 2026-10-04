/**
 * STEP3 자동봇 커미션 — 시안 '신청서 - STEP03-편집상태' / '-아니오' (280:1868, 280:2850).
 *  상태·규칙은 useStep3Bot(기존 로직 그대로), 화면 조각은 Step3Sections.
 *  Q6: 견적함에서 넘어와 값이 채워졌으면 운영 기간·메인 봇·추가 기능 대신 요약('선택하신 자동봇 사양' + 수정)으로 시작 (stepMode).
 */
import { Icon, SelectionSummary } from '@/app/components/ds';
import { useOrder } from '@/app/contexts/OrderContext';
import { calculateTotalEstimate } from '@/app/utils/orderUtils';
import { botSummaryRows, useStepMode } from '../stepMode';
import { useStep3Bot } from './useStep3Bot';
import { ApplyBotQuestion, BotSettingsSection, ExtraInfoSection, MainBotSection, OperationSection } from './Step3Sections';
import { AddonSection } from './Step3Addons';

/** Q6 요약 상태: 운영 기간·메인 봇·추가 기능을 접고 고른 내용만 보여준다 */
function BotSummary() {
  const { formData } = useOrder();
  const { expand } = useStepMode();
  const estimate = calculateTotalEstimate(formData);
  return (
    <SelectionSummary
      title="선택하신 자동봇 사양"
      note="※ 견적에서 선택됨"
      rows={botSummaryRows(formData.step3, formData.step1.closingDate)}
      total={{ label: '자동봇 관련', amount: `${(estimate.botTotal + estimate.operationCost).toLocaleString()}원` }}
      onEdit={() => expand(3)}
      controls="step3-options"
    />
  );
}

export default function Step3Bot() {
  const s = useStep3Bot();
  const { isSummary } = useStepMode();
  return (
    <div className="flex flex-col gap-12 lg:gap-[70px]">
      <ApplyBotQuestion s={s} />

      {/* 자동봇 "예" 선택 시에만 표시되는 옵션들 */}
      {s.step3.applyBot === 'yes' && (
        <>
          {isSummary(3) ? (
            <BotSummary />
          ) : (
            <div id="step3-options" className="flex flex-col gap-12 lg:gap-[70px]">
              <OperationSection s={s} />
              <MainBotSection s={s} />
              <AddonSection s={s} />
            </div>
          )}
          <BotSettingsSection s={s} />
          <ExtraInfoSection s={s} />
        </>
      )}

      {/* "아니오" 선택 시 안내 메시지 */}
      {/* 서버 설치도 '아니오'면 넘어갈 수 없으니 '다음 단계로 이동'이라고 하지 않는다 (26번 리뷰: 빨간 오류와 초록 안내가 같이 떴다) */}
      {s.step3.applyBot === 'no' && s.step2.applyServerInstall === 'no' && (
        <p className="flex items-center gap-2 rounded-card bg-background-100 p-5 text-body2 text-text-primary animate-slideDown lg:p-6">
          <Icon name="warning" className="shrink-0 text-warning-700" />
          서버 설치도 신청하지 않으셨어요. 서버 설치와 자동봇 중 하나는 신청해 주세요.
        </p>
      )}
      {s.step3.applyBot === 'no' && s.step2.applyServerInstall !== 'no' && (
        <p className="flex items-center gap-2 rounded-card bg-background-100 p-5 text-body2 text-text-primary animate-slideDown lg:p-6">
          <Icon name="check" className="shrink-0 text-brand" />
          자동봇을 신청하지 않으셨습니다. 다음 단계로 이동해 주세요.
        </p>
      )}
    </div>
  );
}
