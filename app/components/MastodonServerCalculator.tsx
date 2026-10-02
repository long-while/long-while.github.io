import {
  TIER_OPTIONS,
  getMonthOptions,
} from '@/app/lib/mastodonServerConfig';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';
import { useServerCalculator } from '@/app/components/server/useServerCalculator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

export default function MastodonServerCalculator({
  compact = false,
  longTerm = false,
}: {
  compact?: boolean;
  /** 장기 소규모 서버: 기간을 12개월 이상(Vultr)으로 고정하고 검색을 막는다 */
  longTerm?: boolean;
}) {
  const {
    months, setMonths, usersKey, setUsersKey, search, setSearch, tier, setTier,
    isLongTermMonths, usersOptions, showTier, availableTiers, searchLocked,
    isAllSelected, result, getTierMonthlyKrw,
  } = useServerCalculator(longTerm);

  const handleSetSearchNo = () => setSearch('no');

  function getHostingLabel(r: ServerCalcResult & { type: 'gcp' | 'vultr' }) {
    return r.type === 'gcp' ? '구글 클라우드 플랫폼' : 'Vultr';
  }

  function getHostingBadgeClass(r: ServerCalcResult & { type: 'gcp' | 'vultr' }) {
    return r.type === 'gcp'
      ? 'bg-green-100 text-green-700'
      : 'bg-cyan-100 text-cyan-700';
  }

  return (
    <section className={compact ? '' : 'py-10'}>
      {!compact && (
        <div className="mb-10 border-b border-border pb-4">
          <h2 className="text-[29px] tracking-[-0.01em] font-semibold">서버비 미리보기</h2>
          <p className="text-[14px] text-foreground/60 mt-2 leading-[1.7]">
            서버 설치를 신청하기 전, 예상 서버비와 설치 사양을 먼저 확인해보세요.<br />
            마스토돈 서버 설치 및 테마 커미션 = 인테리어 비용,<br />
            서버비 = 집주인에게 납부하는 월세라고 생각해주시면 됩니다.<br />
            커뮤니티 운영 기간과 규모에 따라 지출하시는 서버비가 달라집니다.
          </p>
        </div>
      )}

      {/* 선택 폼: 가로폭 제한 */}
      <div className="max-w-md space-y-5">

        {/* 1. 서버 운영 기간 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-[11px] font-bold font-mono shrink-0">
              1
            </span>
            서버 운영 기간
          </label>
          {longTerm ? (
            <div className="h-[46px] px-3 flex items-center text-[14px] border border-brand bg-brand-50 text-brand-700">
              12개월 이상 · 장기 소규모 서버 (반영구)
            </div>
          ) : (
            <Select value={months} onValueChange={setMonths}>
              <SelectTrigger
                className={`h-[46px] text-[14px] rounded-none w-full
                  ${months ? 'border-brand' : ''}`}
              >
                <SelectValue placeholder="선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions(usersKey).map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 2. 러닝 인원 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-[11px] font-bold font-mono shrink-0">
              2
            </span>
            평균 동시접속자 수 (커뮤니티의 경우 러닝 인원)
          </label>
          <Select value={usersKey} onValueChange={setUsersKey}>
            <SelectTrigger
              className={`h-[46px] text-[14px] rounded-none w-full
                ${usersKey ? 'border-brand' : ''}`}
            >
              <SelectValue placeholder="선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {usersOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLongTermMonths && (
            <p className="text-[13px] leading-[1.7] text-brand-700">
              장기(12개월 이상) 서버는 10인 이하 소규모만 신청하실 수 있어요.
              11인 이상이 1년 넘게 운영하실 예정이라면 따로 문의해 주세요.
            </p>
          )}
        </div>

        {/* 3. 검색 기능 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-[11px] font-bold font-mono shrink-0">
              3
            </span>
            검색 기능 추가 여부
            <span className="text-[12px] text-foreground/40 font-normal">(세팅비용 +15,000원)</span>
          </label>
          <div className="flex gap-3">
            {(['yes', 'no'] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  if (searchLocked) return;
                  setSearch(val);
                }}
                disabled={searchLocked}
                className={`px-5 py-2.5 border text-[14px] transition-all min-h-[44px]
                  ${search === val
                    ? 'border-brand bg-brand-50 text-brand font-medium'
                    : 'border-border text-foreground/60 hover:border-brand hover:bg-brand-50'
                  }
                  ${searchLocked ? 'opacity-40 cursor-not-allowed hover:border-border hover:bg-transparent' : ''}`}
              >
                {val === 'yes' ? '예' : '아니오'}
              </button>
            ))}
          </div>
          {searchLocked && (
            <p className="text-[13px] leading-[1.7] text-brand-700">
              {longTerm
                ? '장기 소규모 서버(반영구)는 검색 서버가 별도로 필요해 서버비가 크게 올라, 검색을 '
                : '이 사양은 장기·소규모(Vultr) 서버라 검색 서버 비용이 커, 검색을 '}
              <strong>‘아니오’로 고정</strong>합니다.
              {!longTerm && ' 검색이 필요하시면 운영 기간을 12개월 미만(GCP 사양)으로 선택해 주세요.'}
            </p>
          )}
        </div>

        {/* 4. 서버 사양 (4~11개월) */}
        {showTier && (
          <div className="space-y-2 animate-fadeIn">
            <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-[11px] font-bold font-mono shrink-0">
                4
              </span>
              서버 사양
            </label>
            <div className="space-y-2" role="radiogroup" aria-label="서버 사양">
              {TIER_OPTIONS.filter((o) => availableTiers.includes(o.value)).map((o) => {
                const monthlyKrw = getTierMonthlyKrw(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={tier === o.value}
                    onClick={() => setTier(o.value)}
                    className={`w-full text-left px-4 py-3 border transition-all min-h-[44px]
                      ${tier === o.value
                        ? 'border-brand bg-brand-50'
                        : 'border-border hover:border-brand hover:bg-brand-50'
                      }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`text-[14px] font-medium ${tier === o.value ? 'text-brand' : 'text-foreground/80'}`}>
                        {o.label}
                      </span>
                      {monthlyKrw && (
                        <span className="text-[13px] font-mono text-foreground/60 shrink-0">월 {monthlyKrw}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-foreground/60 mt-0.5">{o.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 미선택 안내 */}
        {!isAllSelected && (
          <p className="text-[13px] text-foreground/40">
            위 {showTier ? 4 : 3}가지를 모두 선택하면 예상 서버비와 설치 사양을 확인할 수 있습니다.
          </p>
        )}
      </div>

      {/* 결과 카드 + 참고사항: 가로폭 1.4배 */}
      <div className="max-w-[630px] space-y-5 mt-5">

        {/* 결과 카드 */}
        {isAllSelected && result && (
          <div className="animate-fadeIn">
            {result.type === 'warn' ? (
              /* 경고 카드 */
              <div className="border border-warning-200 bg-warning-50 p-5 space-y-3">
                <p className="text-[14px] font-medium text-warning-700">검색 기능 비추천</p>
                <ul className="space-y-1">
                  {result.warnNotes.map((note, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-warning-700 pl-3 relative before:content-['·'] before:absolute before:left-0"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleSetSearchNo}
                  className="mt-1 text-[13px] font-medium text-warning-700 border border-warning-200 bg-background-white px-4 py-2 hover:bg-warning-50 transition-colors min-h-[40px]"
                >
                  검색 없이 계속하기 →
                </button>
              </div>
            ) : (
              /* 결과 카드 */
              <div className="border border-brand bg-background-white">
                {/* 헤더: 총비용 */}
                <div className="px-5 py-5 border-b border-brand/20 space-y-3">
                  {/* 배지 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 ${getHostingBadgeClass(result as ServerCalcResult & { type: 'gcp' | 'vultr' })}`}>
                      {getHostingLabel(result as ServerCalcResult & { type: 'gcp' | 'vultr' })}
                    </span>
                  </div>

                  {/* 12개월 이상: 월 서버비 크게 */}
                  {result.months >= 12 ? (
                    <div>
                      <p className="text-[17px] font-bold text-foreground mb-0.5">월별 서버비</p>
                      <span className="text-[26px] font-bold tracking-tight leading-none text-brand">
                        {result.monthlyKrw}
                      </span>
                    </div>
                  ) : (
                    /* 12개월 미만: 총 서버비 */
                    <div>
                      <p className="text-[17px] font-bold text-foreground mb-0.5">
                        {result.monthsLabel} 총 서버비
                      </p>
                      <span className={`text-[26px] font-bold tracking-tight leading-none
                        ${result.totalKrw === '무료' ? 'text-green-600' : 'text-brand'}`}>
                        {result.totalKrw}
                      </span>
                    </div>
                  )}

                  {/* 기간 breakdown (12개월 미만만) */}
                  {result.months < 12 && result.type === 'gcp' && result.paidMonths === 0 && (
                    <div className="flex items-center gap-2 text-[13px] text-green-700 font-medium">
                      <span>처음 {result.freeMonths}개월 전액 무료</span>
                      <span className="text-foreground/30">—</span>
                      <span className="text-foreground/60 font-normal">GCP 무료 크레딧 적용</span>
                    </div>
                  )}
                  {result.months < 12 && result.type === 'gcp' && result.paidMonths > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background-100 border border-border-100 px-3 py-2.5">
                        <p className="text-[11px] font-semibold text-foreground mb-0.5">처음 {result.freeMonths}개월</p>
                        <p className="text-[17px] font-bold text-green-600">무료</p>
                        <p className="text-[11px] text-foreground/60">GCP 크레딧 적용</p>
                      </div>
                      <div className="bg-background-100 border border-border-100 px-3 py-2.5">
                        <p className="text-[11px] font-semibold text-foreground mb-0.5">이후 {result.paidMonths}개월</p>
                        <p className="text-[17px] font-bold text-brand">월 {result.monthlyKrw}</p>
                        <p className="text-[11px] text-foreground/60">등록한 결제수단에서 자동 청구</p>
                      </div>
                    </div>
                  )}
                  {result.months < 12 && result.type === 'vultr' && (
                    <div className="inline-flex items-baseline gap-1.5">
                      <span className="text-[13px] text-foreground/60">월</span>
                      <span className="text-[18px] font-bold text-brand">{result.monthlyKrw}</span>
                      <span className="text-[13px] text-foreground/60">× {result.months}개월</span>
                    </div>
                  )}
                </div>

                {/* 서버 사양 + 안내 */}
                <div className="px-5 py-4 space-y-3">
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-foreground/40">
                    서버 사양
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[13px] text-foreground/60 shrink-0">마스토돈 서버</span>
                      <span className="text-[12px] font-mono text-foreground/80 text-right">{result.mastodon}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[13px] text-foreground/60 shrink-0">검색 서버</span>
                      <span className="text-[12px] font-mono text-foreground/80 text-right">
                        {result.elastic ?? '없음'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[13px] text-foreground/60 shrink-0">선택 사양</span>
                      <span className="text-[12px] font-mono text-foreground/80 text-right">
                        {result.monthsLabel} / {result.usersLabel} / 검색 {result.search === 'yes' ? 'O' : 'X'}
                        {result.tierLabel && ` / ${result.tierLabel}`}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* 서버비 지불 방식 */}
        {!compact && isAllSelected && result && result.type !== 'warn' && (
          <div className="border border-border bg-background-100/50 px-4 py-4 space-y-1.5">
            <p className="text-[12px] font-semibold text-foreground/50 uppercase tracking-widest font-mono">서버비 지불 방식</p>
            <p className="text-[13px] text-foreground/60 leading-[1.75]">
              {result.type === 'gcp' && result.paidMonths > 0 && (
                <>첫 {result.freeMonths}개월은 구글에서 제공하는 무료 크레딧을 소모하며, 이후 매달 약 {result.monthlyKrw}이 지출됩니다.<br />
                  서버 비용은 커미션 비용과 별개로, 호스팅 업체에 등록하신 결제수단으로 월초에 자동 결제됩니다.</>
              )}
              {result.type === 'gcp' && result.paidMonths === 0 && (
                <>서버 설치 후 {result.freeMonths}개월간은 구글에서 제공하는 무료 크레딧을 소모하여 서버비 없이 사용하실 수 있습니다.
                  애프터 등을 위해 서버를 {result.freeMonths}개월 이상 유지하실 경우, 사양을 낮추고 월 3만원 정도의 금액으로 서버를 유지해 드립니다.<br /><br />
                  무료 체험이 끝나도 자동 결제가 진행되지 않습니다. 만약 유료 플랜으로 전환하여 {result.freeMonths}개월 이상 서버를 사용하실 경우, 서버 비용은 커미션 비용과 별개로, 호스팅 업체에 등록하신 결제수단으로 월초에 자동 결제됩니다.</>
              )}
              {result.type === 'vultr' && (
                <>장기/소규모 서버의 경우 서버비 절약을 위해 구글이 아닌 Vultr라는 호스팅 업체를 통해 서버 컴퓨터를 대여하게 됩니다.
                  3개월 무료 크레딧을 지급하지 않는 대신, 월 서버비가 더 적습니다.<br /><br />
                  이때 발생하는 서버 비용은 커미션주가 아닌, 호스팅 업체에 가입 시 등록하시는 결제수단으로 월초에 자동 결제됩니다.</>
              )}
            </p>
          </div>
        )}

        {/* 규모와 예산 */}
        {!compact && (
          <div className="border border-border bg-background-100/50 px-4 py-4 space-y-1.5">
            <p className="text-[12px] font-semibold text-foreground/50 uppercase tracking-widest font-mono">규모와 예산</p>
            <p className="text-[13px] text-foreground/60 leading-[1.75]">
              사양과 서버비는 계단처럼 증가하기 때문에, 19인 규모와 30인 규모가 동일한 사양의 서버를 사용하게 될 수도 있습니다.
              이 경우, 19인 서버는 널널하지만 30인 서버는 다소 렉이 발생할 수 있습니다.
              좁은 공간에 많은 사람이 들어와 있으니까요.
              이때, 서버비 증가를 감안하시고 더 넓은 서버를 선택하시거나,
              렉을 감안하고 예산에 맞추어 사양이 낮은 서버를 설치할 수도 있습니다.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
