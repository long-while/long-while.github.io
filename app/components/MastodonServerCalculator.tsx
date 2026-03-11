import { useState, useEffect } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { MONTH_OPTIONS, USERS_OPTIONS, getServerCalcResult } from '@/app/lib/mastodonServerConfig';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';

function scrollToServerInstall() {
  const el = document.getElementById('server-install-section');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function MastodonServerCalculator() {
  const { serverCalcResult, setServerCalcResult } = useEstimate();

  const [months, setMonths] = useState<string>(
    serverCalcResult ? String(serverCalcResult.months) : ''
  );
  const [usersKey, setUsersKey] = useState<string>(
    serverCalcResult ? serverCalcResult.usersKey : ''
  );
  const [search, setSearch] = useState<'yes' | 'no' | null>(
    serverCalcResult ? serverCalcResult.search : null
  );

  const isAllSelected = !!(months && usersKey && search);
  const result: ServerCalcResult | null = isAllSelected
    ? getServerCalcResult(Number(months), usersKey, search!)
    : null;

  // 선택값 변경 시 context에 동기화
  useEffect(() => {
    setServerCalcResult(result);
  }, [months, usersKey, search, setServerCalcResult]);

  const handleSetSearchNo = () => setSearch('no');

  // GCP 배지 라벨: 브랜드명보다 유저에게 의미 있는 정보 우선
  function getHostingLabel(r: ServerCalcResult & { type: 'gcp' | 'vultr' }) {
    if (r.type === 'gcp') {
      return r.paidMonths === 0 ? '처음 3개월 무료' : '무료 크레딧 3개월';
    }
    return '서울 리전 서버';
  }

  function getHostingBadgeClass(r: ServerCalcResult & { type: 'gcp' | 'vultr' }) {
    return r.type === 'gcp'
      ? 'bg-green-100 text-green-700'
      : 'bg-cyan-100 text-cyan-700';
  }

  return (
    <section className="py-10">
      <div className="mb-10 border-b border-border pb-4">
        <h2 className="text-[29px] tracking-[-0.01em] font-semibold">서버비 미리보기</h2>
        <p className="text-[14px] text-foreground/60 mt-2 leading-[1.7]">
          서버 설치를 신청하기 전, 예상 서버비와 설치 사양을 먼저 확인해보세요.<br />
          서버비는 커미션 비용과 별개로, 호스팅 업체에 직접 납부하는 금액입니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. 서버 운영 기간 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ff7b00]/10 text-[#ff7b00] text-[11px] font-bold font-mono shrink-0">
              1
            </span>
            서버 운영 기간
          </label>
          <select
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className={`w-full px-4 py-3 border text-[14px] focus:outline-none transition-colors appearance-none cursor-pointer bg-white
              ${months ? 'border-[#ff7b00] text-foreground' : 'border-border text-foreground/40'}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
            }}
          >
            <option value="">선택해주세요</option>
            {MONTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* 2. 러닝 인원 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ff7b00]/10 text-[#ff7b00] text-[11px] font-bold font-mono shrink-0">
              2
            </span>
            러닝 인원
          </label>
          <select
            value={usersKey}
            onChange={(e) => setUsersKey(e.target.value)}
            className={`w-full px-4 py-3 border text-[14px] focus:outline-none transition-colors appearance-none cursor-pointer bg-white
              ${usersKey ? 'border-[#ff7b00] text-foreground' : 'border-border text-foreground/40'}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
            }}
          >
            <option value="">선택해주세요</option>
            {USERS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* 3. 검색 기능 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[14px] font-medium text-foreground/70">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ff7b00]/10 text-[#ff7b00] text-[11px] font-bold font-mono shrink-0">
              3
            </span>
            검색 기능 추가 여부
            <span className="text-[12px] text-foreground/40 font-normal">(+30,000원)</span>
          </label>
          <div className="flex gap-3">
            {(['yes', 'no'] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setSearch(val)}
                className={`px-5 py-2.5 border text-[14px] transition-all min-h-[44px]
                  ${search === val
                    ? 'border-[#ff7b00] bg-[#fff5eb] text-[#ff7b00] font-medium'
                    : 'border-border text-foreground/60 hover:border-[#ff7b00] hover:bg-[#fff5eb]'
                  }`}
              >
                {val === 'yes' ? '예' : '아니오'}
              </button>
            ))}
          </div>
        </div>

        {/* 미선택 안내 */}
        {!isAllSelected && (
          <p className="text-[13px] text-foreground/40">
            위 3가지를 모두 선택하면 예상 서버비와 설치 사양을 확인할 수 있습니다.
          </p>
        )}

        {/* 결과 카드 */}
        {isAllSelected && result && (
          <div className="animate-fadeIn">
            {result.type === 'warn' ? (
              /* 경고 카드 */
              <div className="border border-amber-300 bg-amber-50 p-5 space-y-3">
                <p className="text-[14px] font-medium text-amber-800">검색 기능 비추천</p>
                <ul className="space-y-1">
                  {result.warnNotes.map((note, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-amber-700 pl-3 relative before:content-['·'] before:absolute before:left-0"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleSetSearchNo}
                  className="mt-1 text-[13px] font-medium text-amber-800 border border-amber-400 bg-white px-4 py-2 hover:bg-amber-50 transition-colors min-h-[40px]"
                >
                  검색 없이 계속하기 →
                </button>
              </div>
            ) : (
              /* 결과 카드 (GCP / Vultr) */
              <div className="border border-[#ff7b00] bg-[#fff5eb]">
                {/* 헤더: 총비용 */}
                <div className="px-5 py-5 border-b border-[#ff7b00]/20 space-y-3">
                  {/* 배지 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 ${getHostingBadgeClass(result as ServerCalcResult & { type: 'gcp' | 'vultr' })}`}>
                      {getHostingLabel(result as ServerCalcResult & { type: 'gcp' | 'vultr' })}
                    </span>
                    <span className="text-[11px] text-foreground/40 font-mono">{result.hosting}</span>
                  </div>

                  {/* 총 서버비 레이블 + 금액 */}
                  <div>
                    <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-foreground/40 mb-1">
                      {result.monthsLabel} 총 서버비
                    </p>
                    <span className={`text-[36px] font-bold tracking-tight leading-none
                      ${result.totalKrw === '무료' ? 'text-green-600' : 'text-[#ff7b00]'}`}>
                      {result.totalKrw}
                    </span>
                  </div>

                  {/* 기간 breakdown */}
                  {result.type === 'gcp' && result.paidMonths === 0 && (
                    <div className="flex items-center gap-2 text-[13px] text-green-700 font-medium">
                      <span>처음 {result.freeMonths}개월 전액 무료</span>
                      <span className="text-foreground/30">—</span>
                      <span className="text-foreground/50 font-normal">GCP 무료 크레딧 적용</span>
                    </div>
                  )}
                  {result.type === 'gcp' && result.paidMonths > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white border border-[#ff7b00]/20 px-3 py-2">
                        <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider mb-0.5">처음 {result.freeMonths}개월</p>
                        <p className="text-[16px] font-bold text-green-600">무료</p>
                        <p className="text-[11px] text-foreground/40">GCP 크레딧 적용</p>
                      </div>
                      <div className="bg-white border border-[#ff7b00]/20 px-3 py-2">
                        <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider mb-0.5">이후 {result.paidMonths}개월</p>
                        <p className="text-[16px] font-bold text-[#ff7b00]">월 {result.monthlyKrw}</p>
                        <p className="text-[11px] text-foreground/40">결제수단 자동 청구</p>
                      </div>
                    </div>
                  )}
                  {result.type === 'vultr' && (
                    <div className="inline-flex items-baseline gap-1.5">
                      <span className="text-[13px] text-foreground/50">월</span>
                      <span className="text-[18px] font-bold text-[#ff7b00]">{result.monthlyKrw}</span>
                      <span className="text-[13px] text-foreground/50">× {result.months}개월</span>
                    </div>
                  )}
                </div>

                {/* 서버 사양 */}
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
                      </span>
                    </div>
                  </div>

                  {/* 비용 안내 */}
                  {result.type === 'gcp' && (
                    <p className="text-[12px] text-foreground/50 pt-2 border-t border-[#ff7b00]/10">
                      {result.paidMonths === 0
                        ? 'GCP 무료 크레딧으로 전액 커버됩니다. 서버비가 발생하지 않습니다.'
                        : `처음 ${result.freeMonths}개월은 무료, 이후 서버 유지 시 월 약 ${result.monthlyKrw} 지출.`
                      }
                    </p>
                  )}
                  {result.type === 'vultr' && (
                    <p className="text-[12px] text-foreground/50 pt-2 border-t border-[#ff7b00]/10">
                      서울 리전 서버로 한국에서 빠르게 접속됩니다.
                    </p>
                  )}

                  <p className="text-[11px] text-foreground/40">
                    ※ 서버비는 커미션 비용과 별개로 호스팅 업체에 직접 납부합니다.
                  </p>

                  {/* CTA: 기본 옵션으로 이동 */}
                  <button
                    type="button"
                    onClick={scrollToServerInstall}
                    className="mt-1 w-full py-2.5 border border-[#ff7b00] text-[#ff7b00] text-[13px] font-medium hover:bg-[#ff7b00] hover:text-white transition-all min-h-[44px]"
                  >
                    서버 설치 커미션 신청하기 ↓
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
