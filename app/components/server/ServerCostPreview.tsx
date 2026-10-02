/**
 * 서버비 미리보기 (시안 Frame 2095589789). 상태·판정은 useServerCalculator (기존 계산기와 같은 로직, Q4).
 *  줄: 이름(title4, 140px) ↔ 입력(580px), 간격 70. 줄 간격 60(모바일 28).
 *  시안에 없는 '서버 사양'(최소/타협/쾌적, 4개월 이상)은 OptionCard 3개로 디자인 (Q4).
 *  결과는 PriceCard, 지불 방식·규모와 예산은 InfoBox. 문구는 기존 계산기 그대로 (Q9).
 */
import type { ReactNode } from 'react';
import { Button, GoogleLogo, InfoBox, OptionCard, PriceCard, Radio, Select, TitledSection } from '@/app/components/ds';
import { TIER_OPTIONS, getMonthOptions } from '@/app/lib/mastodonServerConfig';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';
import { useServerCalculator } from './useServerCalculator';

type CalcResult = ServerCalcResult & { type: 'gcp' | 'vultr' };

type CalcLayout = 'rows' | 'grid';

function Row({ label, labelFor, children, layout = 'rows' }: { label: ReactNode; labelFor?: string; children: ReactNode; layout?: CalcLayout }) {
  const Label = labelFor ? 'label' : 'p';
  if (layout === 'grid') {
    return (
      <div className="flex flex-col gap-3">
        <Label {...(labelFor ? { htmlFor: labelFor } : {})} className="text-title5 text-text-primary">
          {label}
        </Label>
        {children}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-[70px]">
      <Label {...(labelFor ? { htmlFor: labelFor } : {})} className="text-title4 text-text-primary lg:w-[140px] lg:shrink-0">
        {label}
      </Label>
      <div className="w-full lg:w-[580px]">{children}</div>
    </div>
  );
}

function priceHighlights(r: CalcResult) {
  if (r.months >= 12 || r.type === 'vultr') {
    return r.type === 'vultr' && r.months < 12 ? [{ strong: `월 ${r.monthlyKrw}`, text: `× ${r.months}개월` }] : [];
  }
  if (r.paidMonths === 0) return [{ strong: `처음 ${r.freeMonths}개월 전액 무료`, text: 'GCP 무료 크레딧 적용' }];
  return [
    { strong: `처음 ${r.freeMonths}개월 무료`, text: 'GCP 크레딧 적용' },
    { strong: `이후 ${r.paidMonths}개월 월 ${r.monthlyKrw}`, text: '등록한 결제수단에서 자동 청구' },
  ];
}

function ResultCard({ result }: { result: CalcResult }) {
  const isMonthly = result.months >= 12;
  return (
    <PriceCard
      title={isMonthly ? '월별 서버비' : `${result.monthsLabel} 총 서버비`}
      highlights={priceHighlights(result)}
      logo={result.type === 'gcp' ? <GoogleLogo size={56} /> : <span className="font-inter text-title2 text-text-primary">Vultr</span>}
      logoLabel={result.type === 'gcp' ? '구글 클라우드 플랫폼' : 'Vultr'}
      specs={[
        { label: '마스토돈 서버', value: result.mastodon },
        { label: '검색 서버', value: result.elastic ?? '없음' },
        {
          label: '선택 사양',
          value: `${result.monthsLabel} / ${result.usersLabel} / 검색 ${result.search === 'yes' ? 'O' : 'X'}${result.tierLabel ? ` / ${result.tierLabel}` : ''}`,
        },
      ]}
      price={isMonthly ? result.monthlyKrw : result.totalKrw}
    />
  );
}

function WarnCard({ notes, onSearchNo }: { notes: string[]; onSearchNo: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-warning-200 bg-warning-50 p-5" role="status">
      <p className="text-title5 text-warning-700">검색 기능 비추천</p>
      <ul className="flex flex-col gap-1">
        {notes.map((note) => (
          <li key={note} className="flex gap-2 text-body3 text-warning-700">
            <span aria-hidden="true">·</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
      <Button variant="white" size="sm" className="self-start" onClick={onSearchNo}>
        검색 없이 계속하기 →
      </Button>
    </div>
  );
}

function paymentItems(result: CalcResult): string[] {
  if (result.type === 'gcp' && result.paidMonths > 0) {
    return [
      `첫 ${result.freeMonths}개월은 구글에서 제공하는 무료 크레딧을 소모하며, 이후 매달 약 ${result.monthlyKrw}이 지출됩니다.`,
      '서버 비용은 커미션 비용과 별개로, 호스팅 업체에 등록하신 결제수단으로 월초에 자동 결제됩니다.',
    ];
  }
  if (result.type === 'gcp') {
    return [
      `서버 설치 후 ${result.freeMonths}개월간은 구글에서 제공하는 무료 크레딧을 소모하여 서버비 없이 사용하실 수 있습니다. 애프터 등을 위해 서버를 ${result.freeMonths}개월 이상 유지하실 경우, 사양을 낮추고 월 3만원 정도의 금액으로 서버를 유지해 드립니다.`,
      `무료 체험이 끝나도 자동 결제가 진행되지 않습니다. 만약 유료 플랜으로 전환하여 ${result.freeMonths}개월 이상 서버를 사용하실 경우, 서버 비용은 커미션 비용과 별개로, 호스팅 업체에 등록하신 결제수단으로 월초에 자동 결제됩니다.`,
    ];
  }
  return [
    '장기/소규모 서버의 경우 서버비 절약을 위해 구글이 아닌 Vultr라는 호스팅 업체를 통해 서버 컴퓨터를 대여하게 됩니다. 3개월 무료 크레딧을 지급하지 않는 대신, 월 서버비가 더 적습니다.',
    '이때 발생하는 서버 비용은 커미션주가 아닌, 호스팅 업체에 가입 시 등록하시는 결제수단으로 월초에 자동 결제됩니다.',
  ];
}

function PaymentInfo({ result }: { result: CalcResult }) {
  return <InfoBox title="서버비 지불 방식" items={paymentItems(result)} />;
}

function TierChoice({ calc, layout }: { calc: ReturnType<typeof useServerCalculator>; layout: CalcLayout }) {
  return (
    <Row label="서버 사양" layout={layout}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="서버 사양">
        {TIER_OPTIONS.filter((o) => calc.availableTiers.includes(o.value)).map((o) => {
          const monthly = calc.getTierMonthlyKrw(o.value);
          return (
            <OptionCard key={o.value} name="server-tier" value={o.value} checked={calc.tier === o.value}
              onChange={() => calc.setTier(o.value)} title={o.label} description={o.description}
              price={monthly ? `월 ${monthly}` : undefined} layout="responsive" className="lg:p-5" />
          );
        })}
      </div>
    </Row>
  );
}

function SearchChoice({ calc, longTerm, layout }: { calc: ReturnType<typeof useServerCalculator>; longTerm: boolean; layout: CalcLayout }) {
  return (
    <Row label="검색 기능 추가 여부" layout={layout}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-5" role="radiogroup" aria-label="검색 기능 추가 여부">
          <Radio name="server-search" label="예" checked={calc.search === 'yes'} disabled={calc.searchLocked}
            onChange={() => !calc.searchLocked && calc.setSearch('yes')} />
          <Radio name="server-search" label="아니오" checked={calc.search === 'no'} disabled={calc.searchLocked}
            onChange={() => !calc.searchLocked && calc.setSearch('no')} />
          <span className="text-body3 text-text-disabled">(세팅비용 +15,000원)</span>
        </div>
        {calc.searchLocked && (
          <p className="text-body3 text-brand-700">
            {longTerm
              ? '장기 소규모 서버(반영구)는 검색 서버가 별도로 필요해 서버비가 크게 올라, 검색을 '
              : '이 사양은 장기·소규모(Vultr) 서버라 검색 서버 비용이 커, 검색을 '}
            <strong>‘아니오’로 고정</strong>합니다.
            {!longTerm && ' 검색이 필요하시면 운영 기간을 12개월 미만(GCP 사양)으로 선택해 주세요.'}
          </p>
        )}
      </div>
    </Row>
  );
}

function CalculatorFields({ calc, longTerm, layout }: { calc: ReturnType<typeof useServerCalculator>; longTerm: boolean; layout: CalcLayout }) {
  const months = longTerm ? (
    // 장기 소규모 서버(STEP1 체크): 기간을 12개월 이상으로 고정해 보여만 준다 (기존 신청서 계산기와 같은 문구)
    <p id="server-months" className="flex min-h-16 items-center rounded-input border border-border-strong bg-background-100 px-4 text-body2 text-text-primary">
      12개월 이상 · 장기 소규모 서버 (반영구)
    </p>
  ) : (
    <Select id="server-months" value={calc.months} onValueChange={calc.setMonths}
      options={getMonthOptions(calc.usersKey).map((o) => ({ value: String(o.value), label: o.label }))} />
  );
  const users = (
    <Select id="server-users" value={calc.usersKey} onValueChange={calc.setUsersKey} options={calc.usersOptions}
      helper={calc.isLongTermMonths ? (
        <span className="text-brand-700">
          장기(12개월 이상) 서버는 10인 이하 소규모만 신청하실 수 있어요. 11인 이상이 1년 넘게 운영하실 예정이라면 따로 문의해 주세요.
        </span>
      ) : '커뮤니티의 경우 러닝 인원'} />
  );
  return (
    <div className={layout === 'grid' ? 'flex flex-col gap-6' : 'flex flex-col gap-7 lg:gap-[60px]'}>
      <div className={layout === 'grid' ? 'grid grid-cols-1 gap-5 md:grid-cols-2' : 'contents'}>
        <Row label="서버 운영 기간" labelFor={longTerm ? undefined : 'server-months'} layout={layout}>{months}</Row>
        <Row label="평균 동시접속자 수" labelFor="server-users" layout={layout}>{users}</Row>
      </div>
      <SearchChoice calc={calc} longTerm={longTerm} layout={layout} />
      {calc.showTier && <TierChoice calc={calc} layout={layout} />}
    </div>
  );
}

/**
 * 계산기 본문 (입력 → 결과 카드 → 지불 방식·규모와 예산). 서버 커미션 페이지와 신청서 STEP2 가 같이 쓴다.
 * layout: rows(서버 페이지, 이름 140 ↔ 입력 580) / grid(신청서, 위 라벨 + 2열). longTerm: 기간 12개월 이상 고정(신청서 STEP1 장기 체크).
 */
export function ServerCalculator({ longTerm = false, layout = 'rows' }: { longTerm?: boolean; layout?: CalcLayout }) {
  const calc = useServerCalculator(longTerm);
  const { result, isAllSelected } = calc;
  return (
    <>
      <div className="flex flex-col gap-10">
        <CalculatorFields calc={calc} longTerm={longTerm} layout={layout} />
        {!isAllSelected && (
          <p className="text-body3 text-text-secondary">
            위 {calc.showTier ? 4 : 3}가지를 모두 선택하면 예상 서버비와 설치 사양을 확인할 수 있습니다.
          </p>
        )}
        {isAllSelected && result && (result.type === 'warn'
          ? <WarnCard notes={result.warnNotes} onSearchNo={() => calc.setSearch('no')} />
          : <ResultCard result={result as CalcResult} />)}
      </div>
      <div className="flex flex-col gap-4">
        {isAllSelected && result && result.type !== 'warn' && <PaymentInfo result={result as CalcResult} />}
        <InfoBox title="규모와 예산">
          <p>
            사양과 서버비는 계단처럼 증가하기 때문에, 19인 규모와 30인 규모가 동일한 사양의 서버를 사용하게 될 수도 있습니다.
            이 경우, 19인 서버는 널널하지만 30인 서버는 다소 렉이 발생할 수 있습니다. 좁은 공간에 많은 사람이 들어와 있으니까요.
            이때, 서버비 증가를 감안하시고 더 넓은 서버를 선택하시거나, 렉을 감안하고 예산에 맞추어 사양이 낮은 서버를 설치할 수도 있습니다.
          </p>
        </InfoBox>
      </div>
    </>
  );
}

export function ServerCostPreview() {
  return (
    <TitledSection
      id="server-cost-preview"
      title="서버비 미리보기"
      description={
        <>
          서버 설치를 신청하기 전, 예상 서버비와 설치 사양을 먼저 확인해보세요.<br />
          마스토돈 서버 설치 및 테마 커미션 = 인테리어 비용, 서버비 = 집주인에게 납부하는 월세라고 생각해주시면 됩니다.<br />
          커뮤니티 운영 기간과 규모에 따라 지출하시는 서버비가 달라집니다.
        </>
      }
    >
      <ServerCalculator />
    </TitledSection>
  );
}
