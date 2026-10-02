/**
 * 서버비 계산기 상태와 판정 로직.
 * 서버 커미션 페이지와 신청서 STEP2 의 계산기(ServerCalculator)가 같이 쓴다.
 * 내용은 옛 MastodonServerCalculator 에 있던 로직을 그대로 옮긴 것 (2단계, 동작 변경 없음. 옛 화면은 3단계에 삭제).
 */
import { useState, useEffect, useMemo } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { LONG_TERM_MIN_MONTHS } from '@/app/constants/form';
import {
  getAvailableTiers,
  getServerCalcResult,
  getUsersOptions,
  isUsersAllowed,
  needsTier,
} from '@/app/lib/mastodonServerConfig';
import type { ServerCalcResult, ServerTier } from '@/app/lib/mastodonServerConfig';

export function useServerCalculator(longTerm: boolean) {
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
  const [tier, setTier] = useState<ServerTier | null>(serverCalcResult?.tier ?? null);

  // 장기 소규모 서버는 반영구(12개월 이상) 운영 → 기간을 12개월로 고정
  useEffect(() => {
    if (longTerm && months !== '12') {
      setMonths('12');
    }
  }, [longTerm, months]);

  // 장기(12개월 이상)는 10인 이하만 받는다. 기간을 바꿔 고른 인원이 범위를 벗어나면 선택 해제
  const isLongTermMonths = Number(months) >= LONG_TERM_MIN_MONTHS;
  const usersOptions = getUsersOptions(Number(months));
  useEffect(() => {
    if (months && usersKey && !isUsersAllowed(Number(months), usersKey)) {
      setUsersKey('');
    }
  }, [months, usersKey]);
  const usersValid = !!usersKey && isUsersAllowed(Number(months), usersKey);

  // 4개월 이상은 서버 사양 등급(최소/타협/쾌적)을 고른다
  const showTier = !!months && usersValid && needsTier(Number(months));
  const availableTiers = useMemo(
    () => getAvailableTiers(Number(months), usersKey),
    [months, usersKey]
  );

  // 기간·인원을 바꿔 고른 등급이 없어지면(5인 미만·장기는 타협 없음) 선택 해제
  useEffect(() => {
    if (tier && !availableTiers.includes(tier)) {
      setTier(null);
    }
  }, [tier, availableTiers]);

  // 현재 인원/기간/등급이 Vultr(장기·소규모) 호스팅인지 검색 제외 기준으로 판정 (검색값에 따른 순환 방지)
  const baselineIsVultr = useMemo(() => {
    if (!months || !usersValid) return false;
    return getServerCalcResult(Number(months), usersKey, 'no', tier).type === 'vultr';
  }, [months, usersKey, usersValid, tier]);

  // 검색 차단 규칙: Vultr(장기·소규모) 서버는 검색 서버 비용이 커서 막고, GCP는 허용한다.
  const searchLocked = longTerm || baselineIsVultr;

  // 검색 잠금 시 '아니오'로 강제 고정
  useEffect(() => {
    if (searchLocked && search !== 'no') {
      setSearch('no');
    }
  }, [searchLocked, search]);

  const isAllSelected = !!(months && usersValid && search && (!showTier || tier));
  const result: ServerCalcResult | null = isAllSelected
    ? getServerCalcResult(Number(months), usersKey, search!, tier)
    : null;

  useEffect(() => {
    setServerCalcResult(result);
  }, [months, usersKey, search, tier, showTier, setServerCalcResult]);

  // 등급 버튼에 표시할 월 서버비 (5인 미만+검색은 경고라 금액 없음)
  const getTierMonthlyKrw = (t: ServerTier) =>
    getServerCalcResult(Number(months), usersKey, search ?? 'no', t).monthlyKrw;

  return {
    months, setMonths, usersKey, setUsersKey, search, setSearch, tier, setTier,
    isLongTermMonths, usersOptions, showTier, availableTiers, searchLocked,
    isAllSelected, result, getTierMonthlyKrw,
  };
}
