/**
 * 서버비 미리보기 (시안 Frame 2095589789). 상태·판정은 useServerCalculator (기존 계산기와 같은 로직, Q4).
 *  줄: 이름(title4, 140px) ↔ 입력(580px), 간격 70. 줄 간격 60(모바일 28).
 *  시안에 없는 '서버 사양'(최소/타협/쾌적, 4개월 이상)은 검색 예/아니오와 같은 라디오로, 등급 이름만 (4단계 사용자 요청. 금액은 아래 결과 상자).
 *  결과는 PriceCard, 지불 방식·규모와 예산은 InfoBox. 문구는 기존 계산기 그대로 (Q9).
 */
import type { ReactNode } from 'react';
import { Button, GoogleLogo, InfoBox, PriceCard, Radio, Select, TitledSection } from '@/app/components/ds';
import { TIER_OPTIONS, getMonthOptions } from '@/app/lib/mastodonServerConfig';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';
import { useServerCalculator } from './useServerCalculator';
import { PRICING_CONFIG } from '@/app/constants/form';

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

function ResultCard({ result, layout }: { result: CalcResult; layout: CalcLayout }) {
  const isMonthly = result.months >= 12;
  return (
    <PriceCard
      align={layout === 'rows' ? 'form' : 'default'}
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

/** 서버비 결제 방식의 기준 문장 (사이트의 '서버비는 따로 결제' 설명은 여기를 기준으로, 4단계 문구 정리) */
const SERVER_FEE_BILLING = '서버비는 커미션비와 별개로, 호스팅 업체에 등록하신 결제수단에서 매달 초 자동 결제돼요.';

function paymentItems(result: CalcResult): string[] {
  // 무료·이후 월 금액은 바로 위 결과 카드에 나오므로 여기서는 결제 방식만
  if (result.type === 'gcp' && result.paidMonths > 0) return [SERVER_FEE_BILLING];
  if (result.type === 'gcp') {
    return [
      `애프터 등으로 ${result.freeMonths}개월보다 오래 쓰시면, 사양을 낮춰 월 3만원 정도로 유지해 드려요.`,
      `무료 기간이 끝나도 자동 결제되지 않아요. 유료로 전환해 계속 쓰시면 ${SERVER_FEE_BILLING}`,
    ];
  }
  return [
    '장기 소규모 서버는 서버비를 아끼려고 구글 대신 월 요금이 싼 호스팅 업체를 써요. 무료 크레딧은 없어요.',
    SERVER_FEE_BILLING,
  ];
}

function PaymentInfo({ result }: { result: CalcResult }) {
  return <InfoBox title="서버비 지불 방식" items={paymentItems(result)} />;
}

function TierChoice({ calc, layout }: { calc: ReturnType<typeof useServerCalculator>; layout: CalcLayout }) {
  return (
    <Row label="서버 사양" layout={layout}>
      {/* 사용자 요청(4단계): 검색 예/아니오처럼 라디오로 등급 이름(최소/타협/쾌적)만. 고른 등급의 금액은 바로 아래 결과 상자에 나온다 */}
      <div className="flex flex-wrap items-center gap-5" role="radiogroup" aria-label="서버 사양">
        {TIER_OPTIONS.filter((o) => calc.availableTiers.includes(o.value)).map((o) => (
          <Radio key={o.value} name="server-tier" label={o.label} checked={calc.tier === o.value} onChange={() => calc.setTier(o.value)} />
        ))}
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
          <span className="text-body3 text-text-disabled">(세팅비용 +{PRICING_CONFIG.server.addons.search.toLocaleString()}원)</span>
        </div>
        {/* 신청서(grid)에서는 아래 검색 기능 옵션에 같은 안내가 있어 여기서는 뺀다 (4단계 문구 정리) */}
        {calc.searchLocked && layout === 'rows' && (
          <p className="text-body3 text-brand-700">
            장기 소규모 서버는 검색을 넣을 수 없어 <strong>‘아니오’로 고정</strong>돼요.
            {!longTerm && ' 필요하시면 운영 기간을 12개월 미만으로 골라 주세요.'}
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
        <span className="text-brand-700">장기 서버는 10인 이하만 신청할 수 있어요. 11인 이상이라면 따로 문의해 주세요.</span>
      ) : undefined} />
  );
  return (
    <div className={layout === 'grid' ? 'flex flex-col gap-6' : 'flex flex-col gap-7 lg:gap-[60px]'}>
      <div className={layout === 'grid' ? 'grid grid-cols-1 gap-5 md:grid-cols-2' : 'contents'}>
        <Row label="서버 운영 기간" labelFor={longTerm ? undefined : 'server-months'} layout={layout}>{months}</Row>
        <Row label={<>평균 동시접속자 수 <span className="text-body3 text-text-secondary">(커뮤 러너 수)</span></>} labelFor="server-users" layout={layout}>{users}</Row>
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
          : <ResultCard result={result as CalcResult} layout={layout} />)}
      </div>
      <div className="flex flex-col gap-4">
        {isAllSelected && result && result.type !== 'warn' && <PaymentInfo result={result as CalcResult} />}
        {/* 신청서(grid)에서는 서버 페이지에서 이미 읽고 온 내용이라 뺀다 */}
        {layout === 'rows' && (
          <InfoBox title="규모와 예산">
            <p>
              서버비는 인원에 따라 계단식으로 올라요. 그래서 19인과 30인이 같은 사양을 쓸 수도 있는데, 이때 30인 쪽은 렉이 생길 수 있어요.
              예산을 올려 한 단계 높은 사양을 고르거나, 렉을 감수하고 예산에 맞는 사양을 고르시면 됩니다.
            </p>
          </InfoBox>
        )}
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
          예상 서버비와 사양을 확인해 보세요.<br />
          3개월 이하, 30인 이하 커뮤라면 대부분 서버비는 0원입니다.
        </>
      }
    >
      <ServerCalculator />
    </TitledSection>
  );
}
