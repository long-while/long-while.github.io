/**
 * 견적 합계 아래 '서버비는 따로 결제' 안내 (4단계 리뷰: 견적·최종 견적에 매달 나가는 서버비가 빠져 있다는 표시가 없었다).
 * 서버비 미리보기 결과가 있으면 그 금액을, 없으면 미리보기를 안내한다. 견적함과 신청서 STEP4 에서 같이 쓴다.
 */
import { Icon } from '@/app/components/ds';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';

function feeSentence(result: ServerCalcResult | null): string {
  if (!result || result.type === 'warn' || !result.totalKrw) {
    return '서버비(호스팅 비용)는 이 금액에 포함되지 않으며, 호스팅 업체에 직접 결제됩니다. 예상 금액은 서버 커미션 페이지의 ‘서버비 미리보기’에서 확인하실 수 있어요.';
  }
  const details = [
    result.freeMonths > 0 && `처음 ${result.freeMonths}개월은 구글 무료 크레딧`,
    result.paidMonths > 0 && result.monthlyKrw && `이후 월 ${result.monthlyKrw}`,
  ].filter(Boolean).join(', ');
  return `서버비는 이 금액에 포함되지 않아요. ${result.monthsLabel} 기준 총 서버비 ${result.totalKrw}${details ? `(${details})` : ''}은 등록하신 결제수단으로 호스팅 업체에 직접 결제됩니다.`;
}

export function ServerFeeNote({ result }: { result: ServerCalcResult | null }) {
  return (
    <p className="flex items-start gap-2 rounded-input bg-background-100 p-4 text-body3 text-text-secondary lg:px-6">
      <Icon name="info" size={20} className="mt-0.5 shrink-0 text-text-disabled" />
      <span>{feeSentence(result)}</span>
    </p>
  );
}
