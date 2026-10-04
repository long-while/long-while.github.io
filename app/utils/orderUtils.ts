import type { OrderFormData, PriceEstimate, ValidationError, Step2Data, Step3Data, AdditionalOption, FastDeadlineOption } from '@/app/types/order';
import { DATE_FORMAT_REGEX, GMAIL_REGEX, INPUT_LIMITS } from '@/app/types/order';
import { PRICING_CONFIG, FORM_CONFIG, botOperationFee, ACCOUNT_LIST_CONFIG, SERVER_INFRA_FEE_ITEM, LONG_TERM_MIN_MONTHS } from '@/app/constants/form';
import type { ServerCalcResult } from '@/app/lib/mastodonServerConfig';

/**
 * 입력값 정제 (XSS 방지, 길이 제한)
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .normalize('NFC'); // 유니코드 정규화
}

/**
 * 스크립트 인젝션 검사
 */
export function hasScriptInjection(value: string): boolean {
  return /<script|javascript:|on\w+=/i.test(value);
}

/**
 * 날짜 포맷 검증 (yyyy-mm-dd)
 */
export function isValidDateFormat(date: string): boolean {
  return DATE_FORMAT_REGEX.test(date);
}

/**
 * Gmail 주소 검증
 */
export function isValidGmail(email: string): boolean {
  // 붙여넣기로 딸려온 앞뒤 공백, '@Gmail.com' 같은 대문자도 받는다
  return GMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * 날짜 검증: 합격자 발표일 ≤ 개장일 < 폐장일
 */
export function validateDates(
  resultDate: string,
  openDate: string,
  closeDate: string
): ValidationError | null {
  if (!resultDate || !openDate || !closeDate) {
    return null; // 빈 값은 필수 검증에서 처리
  }

  // 날짜 포맷 검증
  if (!isValidDateFormat(resultDate) || !isValidDateFormat(openDate) || !isValidDateFormat(closeDate)) {
    return {
      field: 'dates',
      message: '날짜 형식이 올바르지 않습니다. (yyyy-mm-dd)',
    };
  }

  const result = new Date(resultDate);
  const open = new Date(openDate);
  const close = new Date(closeDate);

  // Invalid Date 체크. '2026-02-31'처럼 없는 날짜는 Date 가 3월로 넘겨 버리므로 되돌려 비교한다 (4단계 검토)
  const isRealDate = (raw: string, date: Date) => !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === raw;
  if (!isRealDate(resultDate, result) || !isRealDate(openDate, open) || !isRealDate(closeDate, close)) {
    return {
      field: 'dates',
      message: '유효하지 않은 날짜입니다.',
    };
  }

  // 연도 오타(2206년 등) 방지: 올해 기준 앞뒤 몇 년 안쪽만
  const thisYear = new Date().getFullYear();
  if ([result, open, close].some((d) => d.getUTCFullYear() < thisYear - 2 || d.getUTCFullYear() > thisYear + 3)) {
    return { field: 'dates', message: '연도를 확인해 주세요.' };
  }

  if (result > open || open >= close) {
    return {
      field: 'dates',
      message: '합격자 발표일 ≤ 개장일 < 폐장일 순서로 입력해 주세요.',
    };
  }

  // 이미 운영 중인 커뮤니티도 신청할 수 있어 발표일·개장일은 지나도 되지만, 이미 끝난 커뮤니티는 받을 수 없다 (4단계 리뷰)
  if (closeDate < localIsoDate(new Date())) {
    return {
      field: 'dates',
      message: '폐장일이 이미 지났습니다. 날짜를 확인해 주세요.',
    };
  }

  return null;
}

/** 이 기기 시간대 기준 yyyy-mm-dd */
function localIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * 마감일 입력에서 월/일을 추출한다.
 * 받는 형식: "06/16", "6/16", "6.16", "6-16", "0616"(숫자 4자리 MMDD), "6월 16일". 전각 숫자도 받는다.
 * 4단계 검토: 예전에는 숫자만 긁어 모아서 "6/1~6/3"이 6/13, "121"이 1/21 로 읽혔다 → 위 형식만 받는다.
 * 유효 범위를 벗어나거나 파싱 불가하면 null.
 */
export function extractMonthDay(raw: string): { month: number; day: number } | null {
  const trimmed = raw.normalize('NFKC').trim();
  if (!trimmed) return null;

  let month: number | null = null;
  let day: number | null = null;

  const separated = trimmed.match(/^(\d{1,2})\s*[/.\-]\s*(\d{1,2})\.?$/) ?? trimmed.match(/^(\d{1,2})\s*월\s*(\d{1,2})\s*일?$/);
  if (separated) {
    month = parseInt(separated[1], 10);
    day = parseInt(separated[2], 10);
  } else if (/^\d{4}$/.test(trimmed)) {
    // MMDD
    month = parseInt(trimmed.slice(0, 2), 10);
    day = parseInt(trimmed.slice(2), 10);
  }

  if (month === null || day === null) return null;
  if (!Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day };
}

/**
 * 마감일 문자열을 기준일(reference) 연도를 적용한 Date 로 변환한다.
 * 연말에 작성하며 연초 마감을 적는 경우를 대비해, 반년 이상 과거가 되면 다음 해로 보정한다.
 * 파싱 불가 시 null.
 */
const MONTH_DAY_FORMAT_MESSAGE = '마감일을 실제 있는 날짜로 입력해 주세요. (예: 06/16)';
const PAST_DEADLINE_MESSAGE = '이미 지난 날짜예요. 마감일을 다시 확인해 주세요.';

/** 월/일 입력이 오늘보다 앞선 날짜인지 (반년 넘게 지난 날짜는 다음 해로 보므로 '지난 날짜'가 아님) */
export function isPastMonthDay(raw: string, reference: Date = new Date()): boolean {
  const days = getFullDaysUntilDeadline(raw, reference);
  return days !== null && days < 0;
}

/** 빠른마감 옵션이 고른 커스텀 옵션에 맞는지 (서버 페이지 RUSH_OPTIONS.fits 와 같은 규칙) */
export function rushFitsCustomOption(option: FastDeadlineOption, custom: AdditionalOption): boolean {
  if (option === null) return true;
  const kind = custom === null ? 'none' : custom === 'logo' ? 'logo' : 'theme';
  const fits: Record<NonNullable<FastDeadlineOption>, 'none' | 'logo' | 'theme'> = { basic48h: 'none', basic24h: 'none', logo48h: 'logo', theme48h: 'theme' };
  return fits[option] === kind;
}

/** 월/일 마감일 입력이 실제 달력 날짜인지 (13/45, 2/31 같은 값은 false) */
export function isRealMonthDay(raw: string): boolean {
  return parseMonthDayToDate(raw, new Date()) !== null;
}

/**
 * 월/일 마감일에 연도를 붙인 yyyy-mm-dd (다른 마감일 검사와 같은 규칙: 반년 넘게 지난 날짜는 다음 해).
 * 'MM/DD'만 받아 올해인지 내년인지 헷갈린다는 리뷰(10번) — 입력칸 아래·확인 화면·복사문에 함께 보여 준다. 못 읽으면 null
 */
export function monthDayWithYear(raw: string, reference: Date = new Date()): string | null {
  const date = parseMonthDayToDate(raw, reference);
  return date ? localIsoDate(date) : null;
}

/**
 * 자동봇 가동 기간(MM/DD ~ MM/DD)에 연도를 붙여 'yyyy-mm-dd ~ yyyy-mm-dd' 로.
 * 종료일은 폐장일 연도(없으면 올해), 시작일이 종료일보다 늦은 날짜면 그 전 해로 본다.
 * 같은 신청서 안의 커뮤 운영 일정(yyyy-mm-dd)과 나란히 보여도 헷갈리지 않게 (4단계 리뷰). 못 읽으면 null.
 */
export function botPeriodWithYears(start: string, end: string, closingDate: string, today: Date = new Date()): string | null {
  const s = extractMonthDay(start);
  const e = extractMonthDay(end);
  if (!s || !e) return null;
  const endYear = /^\d{4}-/.test(closingDate) ? Number(closingDate.slice(0, 4)) : today.getFullYear();
  const startYear = s.month * 100 + s.day > e.month * 100 + e.day ? endYear - 1 : endYear;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${startYear}-${pad(s.month)}-${pad(s.day)} ~ ${endYear}-${pad(e.month)}-${pad(e.day)}`;
}

function parseMonthDayToDate(mmdd: string, reference: Date): Date | null {
  const parsed = extractMonthDay(mmdd);
  if (!parsed) return null;
  const { month, day } = parsed;

  let date = new Date(reference.getFullYear(), month - 1, day);
  // Date 가 날짜를 보정(예: 2/31)했다면 입력이 유효하지 않은 것
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  if ((date.getTime() - reference.getTime()) / DAY_MS < -182) {
    date = new Date(reference.getFullYear() + 1, month - 1, day);
  }
  return date;
}

/**
 * 마감일이 운영 정책상 접수 불가 기간인지 검사한다.
 * - 2026년 10/15 ~ 10/28: 휴식기 (접수 불가)
 * 연도를 함께 두어, 기간이 지나면 다음 해 같은 날짜는 막지 않는다 (4단계: 안내 문구에 연도가 없다는 리뷰).
 * 접수 가능하거나 파싱 불가하면 null.
 */
type DeadlineBlackoutRange = {
  year: number;
  month: number;
  startDay: number;
  endDay: number;
};

export const DEADLINE_BLACKOUT_RANGES: DeadlineBlackoutRange[] = [
  { year: 2026, month: 10, startDay: 15, endDay: 28 },
];

function formatBlackoutRange({ year, month, startDay, endDay }: DeadlineBlackoutRange): string {
  return `${year}년 ${month}/${startDay}~${month}/${endDay}`;
}

/** 안내 문구용 전체 접수 불가 기간 라벨 (예: '2026년 10/15~10/28') */
export const DEADLINE_BLACKOUT_LABEL = DEADLINE_BLACKOUT_RANGES.map(formatBlackoutRange).join(', ');

export function getDeadlineBlackoutError(deadline: string, field: string, reference: Date = new Date()): ValidationError | null {
  // 다른 마감일 계산과 같은 규칙으로 연도를 정한다 (반년 넘게 지난 날짜는 다음 해)
  const date = parseMonthDayToDate(deadline, reference);
  if (!date) return null;
  const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

  const blocked = DEADLINE_BLACKOUT_RANGES.find(
    (range) => year === range.year && month === range.month && day >= range.startDay && day <= range.endDay
  );
  if (blocked) {
    return { field, message: `${formatBlackoutRange(blocked)}은 마감이 불가능한 기간입니다.` };
  }
  return null;
}

/**
 * 마감일까지 남은 일수를 만(full) 단위로 계산한다.
 * 기준 시각은 마감일의 오후 11시이며, 작성 시각의 시·분은 고려하지 않고
 * 달력상의 날짜 차이(만 N일)만 사용한다.
 * 파싱 불가 시 null.
 */
export function getFullDaysUntilDeadline(deadline: string, referenceDate: Date = new Date()): number | null {
  const deadlineDate = parseMonthDayToDate(deadline, referenceDate);
  if (!deadlineDate) return null;
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const target = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate()
  );
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/**
 * 마감일이 임박했을 때 강제로 적용되어야 하는 빠른 마감 옵션을 계산한다.
 * - 만 2일 이내: 선택한 커스텀 옵션 기준 48시간 옵션(테마/로고/기본) 강제
 * - 만 1일 이내 + 기본 옵션: 24시간 기본 옵션 강제
 * 시간은 고려하지 않고 만 1일/만 2일 단위로만 판단한다.
 * 강제할 필요가 없으면 null.
 */
export function computeRequiredFastDeadline(
  deadline: string,
  additionalOption: AdditionalOption,
  referenceDate: Date = new Date()
): FastDeadlineOption {
  const daysUntil = getFullDaysUntilDeadline(deadline, referenceDate);
  if (daysUntil === null) return null;
  // 이미 지난 날짜는 빠른 마감이 아니라 입력 오류 (validateStep2 가 막는다). 유료 옵션을 강제로 붙이지 않는다
  if (daysUntil < 0 || daysUntil > 2) return null;

  const isTheme =
    additionalOption === 'dayTheme' ||
    additionalOption === 'nightTheme' ||
    additionalOption === 'bothTheme';
  if (isTheme) return 'theme48h';
  if (additionalOption === 'logo') return 'logo48h';

  // 기본 옵션: 만 1일 이내면 24시간, 그 외(만 2일)면 48시간
  return daysUntil <= 1 ? 'basic24h' : 'basic48h';
}

/**
 * 운영 기간(N주) 계산: (폐장일 - 개장일 + 1) / 7, 반올림
 */
export function calculateOperationWeeks(openDate: string, closeDate: string): number {
  if (!openDate || !closeDate) return 0;

  try {
    const open = new Date(openDate);
    const close = new Date(closeDate);

    if (isNaN(open.getTime()) || isNaN(close.getTime())) return 0;

    const diffTime = close.getTime() - open.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // 당일 포함

    return Math.max(0, Math.round(diffDays / 7));
  } catch {
    return 0;
  }
}

/**
 * 글자수 검증
 */
export function validateCharacterLimit(value: number): ValidationError | null {
  const { characterLimit } = FORM_CONFIG.validation;

  if (value === characterLimit.default) {
    return {
      field: 'characterLimitValue',
      message: `기본 사양이 ${characterLimit.default}자입니다. ${characterLimit.default}자를 원하실 경우 이 옵션을 선택하실 필요가 없습니다.`,
    };
  }
  if (value < characterLimit.min) {
    return {
      field: 'characterLimitValue',
      message: `글자수는 ${characterLimit.min} 이상이어야 합니다.`,
    };
  }
  if (value > characterLimit.max) {
    return {
      field: 'characterLimitValue',
      message: `글자수는 ${characterLimit.max} 이하여야 합니다.`,
    };
  }
  return null;
}

/** 계정 아이디 최소 길이 (@ 제외) */
export const ACCOUNT_ID_MIN_LENGTH = 3;

/** 마스토돈 아이디 최대 길이 (@ 제외) */
export const ACCOUNT_ID_MAX_LENGTH = 30;

/** 마스토돈 아이디에 쓸 수 있는 글자: 영문, 숫자, 밑줄 */
const ACCOUNT_ID_PATTERN = /^[A-Za-z0-9_]+$/;

/** 커뮤니티 영어 이름(도메인 후보)에 쓸 수 있는 글자: 영문, 숫자, 띄어쓰기, 하이픈 */
const ENGLISH_NAME_PATTERN = /^[A-Za-z0-9 -]+$/;

/** 마스토돈 예약어라 계정 아이디로 쓸 수 없는 값 (대소문자 무관) */
const RESERVED_ACCOUNT_IDS = ['admin', 'owner', 'moderator'];

/**
 * 계정 아이디 정규화: 앞뒤 공백과 선행 @ 를 제거한다.
 */
export function normalizeAccountId(raw: string): string {
  return raw.trim().replace(/^@+/, '').trim();
}

/** 복사문·확인 화면용 계정 표기: 앞뒤 공백·여러 개의 @ 를 정리해 '@아이디' 하나로 (4단계 검토) */
export function asAccount(raw: string): string {
  const id = normalizeAccountId(raw);
  return id ? `@${id}` : '';
}

/** 여러 줄 입력을 한 줄로 (복사문 칸 구분이 줄바꿈이라 붙여넣은 줄바꿈이 섞이면 칸이 깨졌다) */
function oneLine(value: string): string {
  return value.trim().replace(/\s*[\r\n]+\s*/g, ' / ');
}

/**
 * 두 계정 아이디가 같은 계정인지 비교한다. (@ 유무·대소문자 무시)
 */
export function isSameAccountId(a: string, b: string): boolean {
  return normalizeAccountId(a).toLowerCase() === normalizeAccountId(b).toLowerCase();
}

/**
 * 봇/총괄 계정 아이디 검증.
 * - 빈칸 불가
 * - 하나만 (쉼표·빗금으로 여러 개 적지 않기)
 * - @ 를 뺀 실제 아이디가 영문·숫자·밑줄만, 3자 이상 30자 이하 (마스토돈 아이디 규칙)
 * - admin / owner / moderator 는 대소문자 무관 사용 불가
 * 문제가 없으면 null.
 */
export function validateAccountId(
  raw: string,
  field: string,
  label: string
): ValidationError | null {
  const id = normalizeAccountId(raw ?? '');

  if (id === '') {
    return { field, message: `${label}를 입력해 주세요.` };
  }
  if (/[,/]/.test(id)) {
    return { field, message: `${label}는 하나만 입력해 주세요.` };
  }
  if (!ACCOUNT_ID_PATTERN.test(id)) {
    return { field, message: `${label}는 영문, 숫자, 밑줄(_)만 쓸 수 있습니다. (띄어쓰기·한글·특수문자 불가)` };
  }
  if (id.length > ACCOUNT_ID_MAX_LENGTH) {
    return { field, message: `${label}는 ${ACCOUNT_ID_MAX_LENGTH}자 이하여야 합니다. (@ 제외)` };
  }
  if (id.length < ACCOUNT_ID_MIN_LENGTH) {
    return {
      field,
      message: `${label}는 ${ACCOUNT_ID_MIN_LENGTH}자 이상이어야 합니다. (@ 제외)`,
    };
  }
  if (RESERVED_ACCOUNT_IDS.includes(id.toLowerCase())) {
    return {
      field,
      message: `${label}로 admin, owner, moderator 는 사용할 수 없습니다. (대소문자 무관)`,
    };
  }

  return null;
}

/**
 * 봇 기호 검증 (길이만 체크)
 */
export function validateBotSymbol(symbol: string): ValidationError | null {
  if (!symbol) return null;

  // 이모지는 글자 하나가 UTF-16 두 칸이라 실제 글자 수로 센다
  if (Array.from(symbol).length > 5) {
    return {
      field: 'botSymbol',
      message: '봇 기호는 5자 이하여야 합니다.',
    };
  }

  return null;
}

/**
 * 커뮤니티 구글 계정 검증
 *
 * 입력란은 Step 4(최종 확인)에 있습니다. 이메일만 받고, 비밀번호는 신청서에 넣지 않습니다
 * (복사문에 평문으로 남아 크레페 메시지에 그대로 보였다 — 접수 후 따로 받음).
 */
export function validateGoogleAccount(data: OrderFormData['step1']): ValidationError[] {
  if (!data.googleEmail.trim()) {
    return [{ field: 'googleEmail', message: '구글 이메일을 입력해 주세요.' }];
  }
  if (!isValidGmail(data.googleEmail)) {
    return [{ field: 'googleEmail', message: '올바른 Gmail 주소를 입력해 주세요. (예: example@gmail.com)' }];
  }
  return [];
}

/**
 * Step 1 필수 필드 검증
 */
export function validateStep1(data: OrderFormData['step1']): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.termsAgreed !== 'yes') {
    errors.push({
      field: 'termsAgreed',
      message: '약관에 동의하셔야 신청이 가능합니다.',
    });
  }

  // 닉네임 검증
  if (!data.applicantNickname.trim()) {
    errors.push({ field: 'applicantNickname', message: '신청자 닉네임을 입력해 주세요.' });
  } else if (data.applicantNickname.length > INPUT_LIMITS.applicantNickname) {
    errors.push({ field: 'applicantNickname', message: `닉네임은 ${INPUT_LIMITS.applicantNickname}자 이하여야 합니다.` });
  } else if (hasScriptInjection(data.applicantNickname)) {
    errors.push({ field: 'applicantNickname', message: '유효하지 않은 문자가 포함되어 있습니다.' });
  }

  // 커뮤니티 약칭 검증
  if (!data.communityShortName.trim()) {
    errors.push({ field: 'communityShortName', message: '커뮤니티 약칭을 입력해 주세요.' });
  } else if (data.communityShortName.length > INPUT_LIMITS.communityShortName) {
    errors.push({ field: 'communityShortName', message: `커뮤니티 약칭은 ${INPUT_LIMITS.communityShortName}자 이하여야 합니다.` });
  }

  // 한글 이름 검증
  if (!data.communityKoreanName.trim()) {
    errors.push({ field: 'communityKoreanName', message: '한글 이름을 입력해 주세요.' });
  } else if (data.communityKoreanName.length > INPUT_LIMITS.communityKoreanName) {
    errors.push({ field: 'communityKoreanName', message: `한글 이름은 ${INPUT_LIMITS.communityKoreanName}자 이하여야 합니다.` });
  } else if (hasScriptInjection(data.communityKoreanName)) {
    errors.push({ field: 'communityKoreanName', message: '유효하지 않은 문자가 포함되어 있습니다.' });
  }

  // 영어 이름 검증
  if (!data.communityEnglishName.trim()) {
    errors.push({ field: 'communityEnglishName', message: '영어 이름을 입력해 주세요.' });
  } else if (data.communityEnglishName.length > INPUT_LIMITS.communityEnglishName) {
    errors.push({ field: 'communityEnglishName', message: `영어 이름은 ${INPUT_LIMITS.communityEnglishName}자 이하여야 합니다.` });
  } else if (ENGLISH_NAME_PATTERN.test(data.communityEnglishName.trim()) && !/[A-Za-z]/.test(data.communityEnglishName)) {
    errors.push({ field: 'communityEnglishName', message: '영어 이름에는 영문을 한 글자 이상 넣어 주세요.' });
  } else if (!ENGLISH_NAME_PATTERN.test(data.communityEnglishName.trim())) {
    errors.push({ field: 'communityEnglishName', message: '영어 이름은 영문, 숫자, 띄어쓰기, 하이픈(-)만 쓸 수 있습니다.' });
  }

  // 장기 소규모 서버 체크 시 안내 확인('확인했습니다') 필수
  if (data.isLongTermCommunity && !data.longTermConfirmed) {
    errors.push({
      field: 'longTermConfirmed',
      message: '장기 소규모 서버 안내를 확인하신 후 확인 체크를 해주세요.',
    });
  }

  // 날짜 검증 (장기 소규모 서버 체크 시 스킵)
  if (!data.isLongTermCommunity) {
    if (!data.resultAnnouncementDate || !data.openingDate || !data.closingDate) {
      errors.push({ field: 'dates', message: '모든 날짜를 입력해 주세요.' });
    } else {
      const dateError = validateDates(
        data.resultAnnouncementDate,
        data.openingDate,
        data.closingDate
      );
      if (dateError) {
        errors.push(dateError);
      }
    }
  }

  return errors;
}

/**
 * Step 2 필수 필드 검증
 */
export function validateStep2(data: Step2Data): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.applyServerInstall === null) {
    errors.push({
      field: 'applyServerInstall',
      message: '서버 설치 신청 여부를 선택해 주세요.',
    });
  }

  // 글자수 변경 선택 시 검증 (값 없이 체크만 하면 금액·복사문이 어긋나서 값도 필수, 4단계 검토)
  if (data.changeCharacterLimit) {
    if (!Number.isFinite(data.characterLimitValue) || data.characterLimitValue <= 0) {
      errors.push({ field: 'characterLimitValue', message: '원하는 글자수를 입력해 주세요.' });
    } else {
      const charError = validateCharacterLimit(data.characterLimitValue);
      if (charError) errors.push(charError);
    }
  }

  // 서버 설치 "예" 선택 시 필수 필드 검증
  if (data.applyServerInstall === 'yes') {
    if (!data.desiredDeadline || data.desiredDeadline.trim() === '') {
      errors.push({
        field: 'desiredDeadline',
        message: '희망 마감일을 입력해 주세요.',
      });
    } else if (!isRealMonthDay(data.desiredDeadline)) {
      errors.push({ field: 'desiredDeadline', message: MONTH_DAY_FORMAT_MESSAGE });
    } else if (isPastMonthDay(data.desiredDeadline)) {
      errors.push({ field: 'desiredDeadline', message: PAST_DEADLINE_MESSAGE });
    } else {
      // 접수 불가 기간(마감 중단/휴가) 검증 → 다음 단계 진행 차단
      const blackoutError = getDeadlineBlackoutError(data.desiredDeadline, 'desiredDeadline');
      if (blackoutError) {
        errors.push(blackoutError);
      }

      // 마감 임박 시 빠른 마감 옵션 강제 (UI 가 자동 적용하지만 손상된 데이터 대비)
      const requiredFastDeadline = computeRequiredFastDeadline(
        data.desiredDeadline,
        data.additionalOption
      );
      if (requiredFastDeadline && (!data.fastDeadline || data.fastDeadlineOption !== requiredFastDeadline)) {
        errors.push({
          field: 'fastDeadline',
          message: '마감일이 임박하여 해당하는 빠른 마감 옵션을 선택하셔야 합니다.',
        });
      }
    }

    // 빠른마감을 켰으면 옵션 하나, 그리고 고른 커스텀 옵션에 맞는 것 (서버 페이지와 같은 규칙, 4단계 검토)
    if (data.fastDeadline && !errors.some((e) => e.field === 'fastDeadline')) {
      if (!data.fastDeadlineOption) {
        errors.push({ field: 'fastDeadline', message: '빠른마감 옵션을 하나 골라 주세요.' });
      } else if (!rushFitsCustomOption(data.fastDeadlineOption, data.additionalOption)) {
        errors.push({
          field: 'fastDeadline',
          message: '고르신 커스텀 옵션에 맞는 빠른마감을 골라 주세요. (기본 → 기본 서버 설치 마감, 로고만 변경 → 로고 변경 마감, 테마 → 테마 커스텀 마감)',
        });
      }
    }
  }

  // 총괄 계정 아이디: 빈칸 불가 + 3자 이상 + 예약어(admin/owner/moderator) 불가
  // 서버 설치를 신청하지 않는 경우에는 입력된 값만 같은 규칙으로 검증한다.
  if (data.applyServerInstall === 'yes' || data.adminAccountId.trim() !== '') {
    const adminAccountError = validateAccountId(
      data.adminAccountId,
      'adminAccountId',
      '총괄 계정 아이디'
    );
    if (adminAccountError) {
      errors.push(adminAccountError);
    }
  }


  return errors;
}

/**
 * Step 3 필수 필드 검증
 */
export function validateStep3(data: Step3Data): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.applyBot === null) {
    errors.push({
      field: 'applyBot',
      message: '자동봇 신청 여부를 선택해 주세요.',
    });
  }

  // "예" 선택 시 추가 검증
  if (data.applyBot === 'yes') {
    // 운영 주수 선택
    if (data.operationWeeksOption === null) {
      errors.push({
        field: 'operationWeeksOption',
        message: '운영 기간 설정을 선택해 주세요.',
      });
    } else if (data.operationWeeksOption === 'manual') {
      // 날짜가 비거나 잘못되면 가동 주수가 0주(0원)로 계산된 채 넘어가던 문제 (4단계 검토)
      if (!isRealMonthDay(data.botStartDate) || !isRealMonthDay(data.botEndDate)) {
        errors.push({ field: 'operationWeeksOption', message: '자동봇 가동 시작일과 종료일을 실제 있는 날짜로 입력해 주세요. (예: 03/01 ~ 05/31)' });
      } else if (!Number.isFinite(data.manualWeeks) || data.manualWeeks < 1) {
        errors.push({ field: 'operationWeeksOption', message: '자동봇 가동 기간이 1주 이상이 되도록 날짜를 확인해 주세요.' });
      } else if (data.manualWeeks > 52) {
        errors.push({ field: 'operationWeeksOption', message: '자동봇 가동 기간이 1년(52주)을 넘어요. 날짜를 확인해 주시고, 1년 넘게 쓰실 예정이면 따로 문의해 주세요.' });
      }
    }

    // 메인 봇 선택 (D100 / 2D6 3종세트 타입 단독 신청도 허용)
    if (data.mainBot === null && !data.cocBot && !data.trpg2d6Bot) {
      errors.push({
        field: 'mainBot',
        message: '커뮤니티 봇이나 TRPG 봇 중 하나는 골라 주세요. (TRPG 봇은 단독 신청도 가능합니다)',
      });
    }

    // TRPG 봇은 기능이 겹치는 '기본' 봇과 함께 신청할 수 없다 (기본+상점 이상은 허용)
    if ((data.cocBot || data.trpg2d6Bot) && data.mainBot === 'basic') {
      errors.push({
        field: 'mainBot',
        message:
          'D100 룰 대응 TRPG봇, 2D6 룰 대응 TRPG봇 3종은 기본 봇과 기능이 겹쳐 함께 신청할 수 없습니다. 단독으로 신청하시거나, 커뮤니티 봇을 기본&상점 이상으로 선택해 주세요.',
      });
    }

    // 봇 기호 필수 + 길이 검증
    if (!data.botSymbol || data.botSymbol.trim() === '') {
      errors.push({
        field: 'botSymbol',
        message: '봇 기호를 입력해 주세요.',
      });
    } else {
      const symbolError = validateBotSymbol(data.botSymbol);
      if (symbolError) {
        errors.push(symbolError);
      }
    }

    errors.push(...validateMainBotAccount(data));

    // 세팅 마감일 필수 + 접수 불가 기간(마감 중단/휴가) 검증
    if (!data.setupDeadline || data.setupDeadline.trim() === '') {
      errors.push({
        field: 'setupDeadline',
        message: '세팅 마감일을 입력해 주세요.',
      });
    } else if (!isRealMonthDay(data.setupDeadline)) {
      errors.push({ field: 'setupDeadline', message: MONTH_DAY_FORMAT_MESSAGE });
    } else if (isPastMonthDay(data.setupDeadline)) {
      errors.push({ field: 'setupDeadline', message: PAST_DEADLINE_MESSAGE });
    } else {
      const blackoutError = getDeadlineBlackoutError(data.setupDeadline, 'setupDeadline');
      if (blackoutError) {
        errors.push(blackoutError);
      }
    }

    // 조사 자동봇 계정 길이 + 아이디 규칙 검증 (입력된 경우)
    if (normalizeAccountId(data.investigationBotAccountId) !== '') {
      const investigationAccountError = validateAccountId(
        data.investigationBotAccountId,
        'investigationBotAccountId',
        '조사 자동봇 계정 ID'
      );
      if (investigationAccountError) {
        errors.push(investigationAccountError);
      } else if (
        data.investigationBotAccountId.length > INPUT_LIMITS.investigationBotAccountId
      ) {
        errors.push({
          field: 'investigationBotAccountId',
          message: `조사 자동봇 계정은 ${INPUT_LIMITS.investigationBotAccountId}자 이하여야 합니다.`,
        });
      }
    }

    // 조사 자동봇이 메인 봇과 함께 신청된 경우 분리된 계정 입력 필수 (메인 봇 계정이 비어 있어도 — * 표시와 맞춤, 16번 리뷰)
    if (
      data.investigationBot &&
      data.mainBot !== null &&
      normalizeAccountId(data.investigationBotAccountId) === ''
    ) {
      errors.push({
        field: 'investigationBotAccountId',
        message: '조사 자동봇은 별도 계정으로 운영되므로 조사 자동봇 전용 계정 ID를 입력해 주세요.',
      });
    }
    if (
      data.investigationBot &&
      data.mainBot !== null &&
      data.botAccountId.trim() !== '' &&
      data.investigationBotAccountId.trim() !== '' &&
      isSameAccountId(data.botAccountId, data.investigationBotAccountId)
    ) {
      errors.push({
        field: 'investigationBotAccountId',
        message: '메인 봇과 조사 자동봇은 서로 다른 계정 ID를 사용해야 합니다.',
      });
    }

    // 재화 단위 필수 입력 (상점/스탯 봇 선택 시)
    if (
      (data.mainBot === 'basicShop' || data.mainBot === 'basicShopStat') &&
      (!data.currencyUnit || data.currencyUnit.trim() === '')
    ) {
      errors.push({
        field: 'currencyUnit',
        message: '재화 단위를 입력해 주세요.',
      });
    } else if (data.currencyUnit && data.currencyUnit.length > INPUT_LIMITS.currencyUnit) {
      errors.push({
        field: 'currencyUnit',
        message: `재화 단위는 ${INPUT_LIMITS.currencyUnit}자 이하여야 합니다.`,
      });
    }

    // 스탯 목록 길이 검증
    if (data.statList && data.statList.length > INPUT_LIMITS.statList) {
      errors.push({
        field: 'statList',
        message: `스탯 목록은 ${INPUT_LIMITS.statList}자 이하여야 합니다.`,
      });
    }

    // 오마카세 상세 길이 검증
    if (data.omakaseDetails && data.omakaseDetails.length > INPUT_LIMITS.omakaseDetails) {
      errors.push({
        field: 'omakaseDetails',
        message: `오마카세 상세는 ${INPUT_LIMITS.omakaseDetails}자 이하여야 합니다.`,
      });
    }

    // 예약 툿/자동 스진용 계정 목록 검증 (UI 가 막지만 손상된 데이터 대비)
    if (data.reservationToot || data.autoProfileImage) {
      if (
        !Number.isInteger(data.extraAccountTiers) ||
        data.extraAccountTiers < 0 ||
        data.extraAccountTiers > ACCOUNT_LIST_CONFIG.maxTiers
      ) {
        errors.push({
          field: 'extraAccountTiers',
          message: '추가 계정 구매 단계가 올바르지 않습니다.',
        });
      }
      if (data.accountList.length > ACCOUNT_LIST_CONFIG.maxTotalAccounts) {
        errors.push({
          field: 'accountList',
          message: `계정은 최대 ${ACCOUNT_LIST_CONFIG.maxTotalAccounts}개까지 등록할 수 있습니다.`,
        });
      }
      if (data.accountList.some((account) => account.length > INPUT_LIMITS.accountList)) {
        errors.push({
          field: 'accountList',
          message: `계정 아이디는 각 ${INPUT_LIMITS.accountList}자 이하여야 합니다.`,
        });
      }
    }

    // 돈을 받는 옵션의 세부 내용이 비면 커미션주가 따로 물어봐야 해서 필수 (4단계 검토)
    const hasShopBot = data.mainBot === 'basicShop' || data.mainBot === 'basicShopStat';
    if (data.investigationBot && data.investigationDailyLimit && !(data.investigationDailyLimitCount >= 1)) {
      errors.push({ field: 'investigationDailyLimitCount', message: '일일 조사 횟수를 1 이상으로 입력해 주세요.' });
    }
    if (hasShopBot && data.tootCurrencyLink && data.tootPerCurrency.trim() === '') {
      errors.push({ field: 'tootPerCurrency', message: '몇 툿당 소지금이 얼마나 추가될지 적어 주세요.' });
    }
    if (hasShopBot && data.transferFeature && !data.transferOption) {
      errors.push({ field: 'transferOption', message: '양도 대상을 골라 주세요.' });
    }
    if (data.mainBot === 'basicShopStat' && data.statList.trim() === '') {
      errors.push({ field: 'statList', message: '스탯 목록을 적어 주세요. (예: 체력, 정신력, 행운)' });
    }
    if (data.omakaseBot && data.omakaseDetails.trim() === '') {
      errors.push({ field: 'omakaseDetails', message: '오마카세 시스템을 정리한 문서 링크를 적어 주세요.' });
    } else if (data.omakaseBot && !/^https?:\/\/\S+\.\S+/.test(data.omakaseDetails.trim())) {
      // 23번 리뷰: '아무거나'도 통과했다
      errors.push({ field: 'omakaseDetails', message: '문서 링크를 https:// 로 시작하는 주소로 적어 주세요.' });
    }
    if ((data.reservationToot || data.autoProfileImage) && data.accountList.some((a) => a.trim() !== '' && !/^@?[A-Za-z0-9_]+$/.test(normalizeAccountId(a)))) {
      errors.push({ field: 'accountList', message: '계정 목록에는 영문·숫자·밑줄로 된 아이디를 한 칸에 하나씩 적어 주세요. (주소·쉼표 불가)' });
    }

    // 출석 시스템 검증
    if (
      data.attendanceSystem &&
      (data.mainBot === 'basicShop' || data.mainBot === 'basicShopStat')
    ) {
      if (!Number.isInteger(data.attendanceCurrencyAmount) || data.attendanceCurrencyAmount < 1) {
        errors.push({
          field: 'attendanceCurrencyAmount',
          message: '출석 시 받을 재화의 수를 1 이상의 정수로 입력해 주세요.',
        });
      }
      const cmd = data.attendanceCommand?.trim() ?? '';
      if (!cmd) {
        errors.push({
          field: 'attendanceCommand',
          message: '출석 명령어를 입력해 주세요.',
        });
      } else if (!/^\[.+\]$/.test(cmd)) {
        errors.push({
          field: 'attendanceCommand',
          message: '출석 명령어는 [출석] 처럼 대괄호로 감싸야 합니다.',
        });
      }
    }
    errors.push(...validateRandomBox(data));
  }

  return errors;
}

const hasShopBot = (data: Step3Data) => data.mainBot === 'basicShop' || data.mainBot === 'basicShopStat';

/** 랜덤박스: 명령어는 신청자가 꼭 정해야 한다 (기본값 없음) */
function validateRandomBox(data: Step3Data): ValidationError[] {
  if (!data.randomBox || !hasShopBot(data)) return [];
  const cmd = data.randomBoxCommand?.trim() ?? '';
  if (cmd.replace(/[[\]\s]/g, '') === '') {
    return [{ field: 'randomBoxCommand', message: '랜덤박스 기능으로 사용할 명령어를 정해 주세요. 예: [랜덤박스]' }];
  }
  if (!/^\[.+\]$/.test(cmd)) {
    return [{ field: 'randomBoxCommand', message: '랜덤박스 명령어는 [랜덤박스] 처럼 대괄호로 감싸야 합니다.' }];
  }
  return [];
}

/**
 * 단계를 넘나드는 검사 (4단계 검토). 각 단계 검사만으로는 못 잡던 경우:
 * - STEP2: 서버 설치를 신청했는데 서버비 미리보기를 다 고르지 않음 (복사문에 서버 사양이 빠졌다)
 * - STEP2: 미리보기는 12개월 이상(장기)인데 STEP1 '장기 소규모 서버'는 체크 안 함 → 견적함과 신청서의 부가비용이 달라졌다
 * - STEP3: 서버 설치·자동봇 둘 다 '아니오' (0원짜리 빈 신청서가 복사됐다)
 */
/** STEP2 날짜가 STEP1 일정과 맞는지 (6·8번 리뷰): 희망 마감일은 개장일 이전, 빠른마감은 마감일이 2일 이내일 때만 */
function step2DateErrors(data: OrderFormData): ValidationError[] {
  const { step1, step2 } = data;
  if (step2.applyServerInstall !== 'yes' || !isRealMonthDay(step2.desiredDeadline)) return [];
  const errors: ValidationError[] = [];
  const deadline = monthDayWithYear(step2.desiredDeadline);
  if (deadline && !step1.isLongTermCommunity && isValidDateFormat(step1.openingDate) && deadline > step1.openingDate) {
    errors.push({ field: 'desiredDeadline', message: `희망 마감일(${deadline})이 개장일(${step1.openingDate})보다 늦어요. 개장 전에 서버가 준비되도록 앞당겨 주세요.` });
  }
  const daysLeft = getFullDaysUntilDeadline(step2.desiredDeadline);
  if (step2.fastDeadline && daysLeft !== null && daysLeft > 2) {
    errors.push({ field: 'fastDeadline', message: `희망 마감일이 ${daysLeft}일 뒤라 빠른마감이 필요 없어요. 빠른마감은 마감일이 2일 이내일 때만 골라 주세요.` });
  }
  return errors;
}

/** STEP3 가 STEP1·STEP2 와 맞는지 (7·6·18번 리뷰) */
function step3ConsistencyErrors(data: OrderFormData): ValidationError[] {
  const { step1, step2, step3 } = data;
  if (step3.applyBot !== 'yes') return [];
  const errors: ValidationError[] = [];
  if (step3.operationWeeksOption === 'longterm' && !step1.isLongTermCommunity) {
    errors.push({ field: 'operationWeeksOption', message: '장기 소규모 서버 자동봇은 Step 1에서 ‘장기 소규모 서버’를 체크한 경우에만 고를 수 있어요.' });
  }
  const setup = isRealMonthDay(step3.setupDeadline) ? monthDayWithYear(step3.setupDeadline) : null;
  if (setup && !step1.isLongTermCommunity && isValidDateFormat(step1.closingDate) && setup > step1.closingDate) {
    errors.push({ field: 'setupDeadline', message: `세팅 마감일(${setup})이 폐장일(${step1.closingDate})보다 늦어요. 날짜를 확인해 주세요.` });
  }
  // 자동봇은 서버가 설치된 뒤에 세팅하므로 서버 설치 마감일보다 앞설 수 없다 (사용자 요청)
  const serverDeadline = step2.applyServerInstall === 'yes' && isRealMonthDay(step2.desiredDeadline) ? monthDayWithYear(step2.desiredDeadline) : null;
  if (setup && serverDeadline && setup < serverDeadline) {
    errors.push({ field: 'setupDeadline', message: `세팅 마감일(${setup})은 서버 설치 마감일(${serverDeadline})보다 앞설 수 없어요.` });
  }
  const admin = normalizeAccountId(step2.adminAccountId);
  if (admin && isSameAccountId(step3.botAccountId, step2.adminAccountId)) {
    errors.push({ field: 'botAccountId', message: '봇 계정은 총괄 계정과 다른 아이디로 적어 주세요.' });
  }
  return errors;
}

export function validateOrderConsistency(data: OrderFormData, serverCalc: ServerCalcResult | null): { step2: ValidationError[]; step3: ValidationError[] } {
  const step2: ValidationError[] = step2DateErrors(data);
  const step3: ValidationError[] = step3ConsistencyErrors(data);
  if (data.step2.applyServerInstall === 'yes') {
    if (!serverCalc) {
      step2.push({ field: 'server-months', message: '서버비 미리보기에서 운영 기간·인원·검색·사양을 모두 골라 주세요.' });
    } else if (serverCalc.months >= LONG_TERM_MIN_MONTHS && !data.step1.isLongTermCommunity) {
      step2.push({
        field: 'server-months',
        message: '운영 기간을 12개월 이상으로 고르셨어요. 장기 소규모 서버라면 Step 1에서 ‘장기 소규모 서버’를 체크해 주시고, 아니라면 운영 기간을 12개월 미만으로 바꿔 주세요.',
      });
    }
  }
  if (data.step2.applyServerInstall === 'no' && data.step3.applyBot === 'no') {
    step3.push({ field: 'applyBot', message: '서버 설치와 자동봇 중 하나는 신청해 주세요.' });
  }
  return { step2, step3 };
}

/** 신청서 전체 검사 결과에서 처음 걸리는 단계 (복사 직전·임시저장 복원 뒤 다시 확인용). 문제가 없으면 null */
export function firstInvalidStep(data: OrderFormData, serverCalc: ServerCalcResult | null): { step: 1 | 2 | 3; errors: ValidationError[] } | null {
  const consistency = validateOrderConsistency(data, serverCalc);
  const byStep: Array<[1 | 2 | 3, ValidationError[]]> = [
    [1, validateStep1(data.step1)],
    [2, [...validateStep2(data.step2), ...consistency.step2]],
    [3, [...validateStep3(data.step3), ...consistency.step3]],
  ];
  const found = byStep.find(([, errors]) => errors.length > 0);
  return found ? { step: found[0], errors: found[1] } : null;
}

/**
 * 서버 설치 실비(도메인·SMTP)가 부과되는지 판단한다.
 * 서버 설치를 신청하면 항상 부과되며, 장기 소규모 서버만 제외된다.
 */
export function hasServerInfraFee(data: OrderFormData): boolean {
  return data.step2.applyServerInstall === 'yes' && !data.step1.isLongTermCommunity;
}

/**
 * 서버 파트 견적 계산
 * @param isLongTermCommunity 장기 소규모 서버면 도메인·SMTP 실비를 받지 않는다.
 */
export function calculateServerPrice(
  data: OrderFormData['step2'],
  isLongTermCommunity: boolean = false
): number {
  if (data.applyServerInstall !== 'yes') return 0;

  const { server } = PRICING_CONFIG;
  let total = server.base;

  // 도메인 구입 + SMTP 메일 발송 실비 (자동 포함, 해제 불가)
  if (!isLongTermCommunity) total += server.infraFee;

  // 추가 옵션 (배타적)
  if (data.additionalOption && server.options[data.additionalOption as keyof typeof server.options]) {
    total += server.options[data.additionalOption as keyof typeof server.options];
  }

  // 글자수 변경 (단, 기본값이 아닐 때만)
  if (data.changeCharacterLimit &&
    data.characterLimitValue !== FORM_CONFIG.validation.characterLimit.default &&
    data.characterLimitValue > 0) {
    total += server.addons.characterLimit;
  }

  // 검색 옵션
  if (data.searchOption) total += server.addons.search;

  // masto.host 데이터 이전
  if (data.mastoHostMigration) total += server.addons.mastoHostMigration;

  // 빠른 마감
  if (data.fastDeadline && data.fastDeadlineOption) {
    total += server.addons.fastDeadline[data.fastDeadlineOption as keyof typeof server.addons.fastDeadline];
  }

  return total;
}

/**
 * 직접 입력받는 봇 계정 칸(botAccountId)은 메인 봇이 있을 때만 노출한다.
 * (D100 / 2D6 봇 계정은 운영자가 직접 세팅하므로 받지 않는다)
 */
export function needsMainBotAccountId(data: Step3Data): boolean {
  return data.mainBot !== null;
}

/** 직접 입력받는 봇 계정 칸(botAccountId)의 이름 */
export function getPrimaryBotAccountLabel(data: Step3Data): string {
  return data.investigationBot ? '메인 봇 계정' : '봇 계정';
}

function validateMainBotAccount(data: Step3Data): ValidationError[] {
  if (!needsMainBotAccountId(data)) return [];

  const formatError = validateAccountId(data.botAccountId, 'botAccountId', '봇 계정 ID');
  if (formatError) return [formatError];
  if (data.botAccountId.length > INPUT_LIMITS.botAccountId) {
    return [{
      field: 'botAccountId',
      message: `봇 계정은 ${INPUT_LIMITS.botAccountId}자 이하여야 합니다.`,
    }];
  }
  return [];
}

/** 신청서/복붙 텍스트에 표시할 봇 계정 목록 */
export function getBotAccountLines(data: Step3Data): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  if (needsMainBotAccountId(data) && data.botAccountId.trim() !== '') {
    lines.push({ label: getPrimaryBotAccountLabel(data), value: asAccount(data.botAccountId) });
  }
  if (
    data.investigationBot &&
    needsMainBotAccountId(data) &&
    data.investigationBotAccountId.trim() !== ''
  ) {
    lines.push({ label: '조사 자동봇 계정', value: asAccount(data.investigationBotAccountId) });
  }
  return lines;
}

/**
 * 봇 파트 견적 계산
 */
export function calculateBotPrice(
  data: OrderFormData['step3'],
  _operationWeeks: number
): { botCost: number; operationCost: number } {
  if (data.applyBot !== 'yes') {
    return { botCost: 0, operationCost: 0 };
  }

  const { bot } = PRICING_CONFIG;
  let botCost = 0;

  // 메인 봇
  if (data.mainBot && bot.mainTypes[data.mainBot as keyof typeof bot.mainTypes]) {
    botCost += bot.mainTypes[data.mainBot as keyof typeof bot.mainTypes];
  }

  // 추가 옵션
  if (data.cocBot) botCost += bot.addons.cocBot;
  if (data.trpg2d6Bot) botCost += bot.addons.trpg2d6Bot;
  if (data.customCommandUpgrade) botCost += bot.addons.customCommandUpgrade;
  if (data.keywordReplyImage) botCost += bot.addons.keywordReplyImage;
  if (data.reservationToot) botCost += bot.addons.reservationToot;
  if (data.autoProfileImage) botCost += bot.addons.autoProfileImage;
  if (data.tootCurrencyLink) botCost += bot.addons.tootCurrencyLink;
  if (data.transferFeature) botCost += bot.addons.transferFeature;
  if (data.investigationBot && data.mainBot !== null) botCost += bot.addons.investigationBot;
  if (data.investigationDailyLimit && data.investigationBot && data.mainBot !== null) {
    botCost += bot.addons.investigationDailyLimit;
  }
  if (data.attendanceSystem && (data.mainBot === 'basicShop' || data.mainBot === 'basicShopStat')) {
    botCost += bot.addons.attendanceSystem;
  }
  if (data.randomBox && hasShopBot(data)) botCost += bot.addons.randomBox;
  // 예약 툿/자동 스진용 추가 계정 단계 (단계당 +5천원, 최대 2단계)
  if (data.reservationToot || data.autoProfileImage) {
    const tiers = Math.min(ACCOUNT_LIST_CONFIG.maxTiers, Math.max(0, data.extraAccountTiers));
    botCost += tiers * bot.addons.extraAccountTier;
  }

  // 가동비: 장기 옵션이면 세팅비 정액, 아니면 확정 주수 × 운영비
  let operationCost: number;
  if (data.operationWeeksOption === 'longterm') {
    operationCost = bot.longTermSetupFee;
  } else {
    // 손상된 저장본의 NaN·음수가 총액을 NaN 으로 만들지 않게 (4단계 검토)
    operationCost = botOperationFee(data.manualWeeks);
  }

  return { botCost, operationCost };
}

/**
 * 최종 견적 계산
 */
export function calculateTotalEstimate(data: OrderFormData): PriceEstimate {
  const serverTotal = calculateServerPrice(data.step2, data.step1.isLongTermCommunity);
  const { botCost, operationCost } = calculateBotPrice(data.step3, data.step1.operationWeeks);

  const variableItems: string[] = [];
  if (data.step3.omakaseBot) variableItems.push('오마카세');

  return {
    serverTotal,
    botTotal: botCost,
    operationCost,
    grandTotal: serverTotal + botCost + operationCost,
    hasVariablePrice: variableItems.length > 0,
    variableItems,
  };
}

/**
 * 날짜를 yyyy.mm.dd 포맷으로 변환
 */
function formatDateForDisplay(date: string): string {
  if (!date) return '';
  return date.replace(/-/g, '.');
}

/**
 * 구글 계정이 비어 있을 때 복사 텍스트에 남기는 표시.
 * 예전에는 빈 값이 그대로 들어가 'abc@gmail.com / ' 처럼 보였고,
 * 신청자도 받는 쪽도 누락을 알아채지 못한 채 접수되는 일이 반복됐다.
 */
export const MISSING_GOOGLE_EMAIL_MARK = '[!] 이메일 미입력 — 신청자 확인 필요';

/**
 * 최종 복사용 텍스트 생성
 */
export function generateCopyText(data: OrderFormData, estimate: PriceEstimate, serverCalcResult?: ServerCalcResult | null): string {
  const { step1, step2, step3 } = data;
  const { server, bot } = PRICING_CONFIG;
  const infraFeeApplied = hasServerInfraFee(data);
  const divider = '==================\n\n';

  let text = divider;

  // 커뮤니티 정보
  text += `${step1.communityKoreanName.trim()} / ${step1.communityEnglishName.trim().replace(/\s+/g, ' ')} (약칭 '${step1.communityShortName.trim()}')\n\n`;
  if (step1.isLongTermCommunity) {
    text += `장기 소규모 서버\n\n`;
  } else {
    text += `${formatDateForDisplay(step1.openingDate)} ~ ${formatDateForDisplay(step1.closingDate)} (${step1.operationWeeks}주)\n\n`;
  }
  // 빈 이메일이 조용히 지나가면 받는 쪽에서 누락을 알아채기 어렵다.
  // 검증에서 걸러지지만, 혹시 빠져나가더라도 눈에 띄도록 표시를 남긴다.
  text += `${step1.googleEmail.trim() || MISSING_GOOGLE_EMAIL_MARK} (비밀번호는 접수 후 따로 전달)\n\n`;
  text += `커미션 신청자명 : ${step1.applicantNickname.trim()}\n\n`;

  text += divider;

  // 신청 여부
  text += `서버 커미션 ${step2.applyServerInstall === 'yes' ? 'O' : 'X'}\n`;
  text += `자동봇 커미션 ${step3.applyBot === 'yes' ? 'O' : 'X'}\n\n`;

  text += divider;

  // 서버 설치 옵션
  if (step2.applyServerInstall === 'yes') {
    text += '서버 설치\n';

    // 서버 사양 (계산기 결과)
    if (serverCalcResult && serverCalcResult.type !== 'warn') {
      text += '\n서버 사양\n\n';
      const tierText = serverCalcResult.tierLabel ? ` / ${serverCalcResult.tierLabel}` : '';
      text += `${serverCalcResult.monthsLabel} / ${serverCalcResult.usersLabel} / 검색 ${serverCalcResult.search === 'yes' ? 'O' : 'X'}${tierText}\n\n`;
      // 마스토돈 사양: 괄호 앞 모델명만 추출 (e.g. "e2-medium (2 vCPU, 4GB RAM)" → "e2-medium")
      const mastodonModel = serverCalcResult.mastodon?.split(' (')[0] ?? serverCalcResult.mastodon ?? '';
      text += `마스토돈: ${mastodonModel}\n`;
      const elasticModel = serverCalcResult.elastic
        ? serverCalcResult.elastic.split(' (')[0]
        : '없음';
      text += `검색: ${elasticModel}\n\n`;
      if (serverCalcResult.type === 'gcp' && serverCalcResult.paidMonths === 0) {
        text += `${serverCalcResult.freeMonths}개월까지 무료, 서버비 발생 없음\n\n`;
      } else if (serverCalcResult.type === 'gcp' && serverCalcResult.paidMonths > 0) {
        text += `처음 ${serverCalcResult.freeMonths}개월 무료,\n이후에도 서버 유지 시 월 약 ${serverCalcResult.monthlyKrw} 지출\n\n`;
      } else {
        text += `월 약 ${serverCalcResult.monthlyKrw} 지출\n\n`;
      }
    }

    if (infraFeeApplied) {
      text += `+ ${SERVER_INFRA_FEE_ITEM.copyLabel}\n`;
    }
    if (step2.additionalOption) {
      const optionNames: Record<string, string> = {
        logo: '로고 변경',
        dayTheme: '커스텀 낮 테마',
        nightTheme: '커스텀 밤 테마',
        bothTheme: '커스텀 테마 2종 (낮/밤)',
      };
      text += `+ ${optionNames[step2.additionalOption]}\n`;
    }
    if (step2.changeCharacterLimit && step2.characterLimitValue > 0) {
      text += `+ 글자수 변경 (${step2.characterLimitValue}자)\n`;
    }
    if (step2.searchOption) {
      text += '+ 검색 옵션\n';
    }
    if (step2.mastoHostMigration) {
      text += '+ masto.host 데이터 이전\n';
    }
    if (step2.fastDeadline && step2.fastDeadlineOption) {
      const fastNames: Record<string, string> = {
        basic48h: '빠른 마감 (48시간/기본)',
        basic24h: '빠른 마감 (24시간/기본)',
        logo48h: '빠른 마감 (48시간/로고)',
        theme48h: '빠른 마감 (48시간/테마)',
      };
      text += `+ ${fastNames[step2.fastDeadlineOption]}\n`;
    }

    text += '\n';

    // 기타 정보 (각각 별도 줄)
    if (step2.adminAccountId.trim()) text += `총괄 계정 : ${asAccount(step2.adminAccountId)}\n\n`;
    if (step2.desiredDeadline) text += `희망 마감일 : ${monthDayWithYear(step2.desiredDeadline) ?? step2.desiredDeadline}\n\n`;

    text += divider;
  }

  // 자동봇 옵션
  if (step3.applyBot === 'yes') {
    if (step3.operationWeeksOption === 'longterm') {
      text += `자동봇 (장기 소규모, 세팅비)\n`;
    } else {
      const range = step3.botStartDate && step3.botEndDate
        ? `${step3.botStartDate} ~ ${step3.botEndDate} `
        : '';
      text += `자동봇 ${range}(${step3.manualWeeks}주)\n`;
    }

    if (step3.mainBot) {
      const mainBotNames: Record<string, string> = {
        basic: '기본봇',
        basicShop: '기본+상점봇',
        basicShopStat: '기본+상점+스탯봇',
      };
      text += `${mainBotNames[step3.mainBot]}\n`;
    }

    if (step3.cocBot) text += '+ D100 타입\n';
    if (step3.trpg2d6Bot) text += '+ 2D6 3종세트 타입\n';
    // 예약 툿 · 스토리 자동 진행 · 툿-재화 연동은 늘 맨 위에 (사용자 요청). 툿-재화 비율은 이 줄에 붙인다
    if (step3.reservationToot) text += '+ 예약 툿\n';
    if (step3.autoProfileImage) text += '+ 스토리 자동 진행\n';
    if (step3.tootCurrencyLink) text += `+ 툿-재화 연동${step3.tootPerCurrency.trim() ? ` (${oneLine(step3.tootPerCurrency)})` : ''}\n`;
    if (step3.investigationBot && step3.mainBot !== null) text += '+ 조사 자동봇\n';
    if (step3.investigationDailyLimit && step3.investigationBot && step3.mainBot !== null) {
      const countLabel = step3.investigationDailyLimitCount > 0
        ? ` (일일 ${step3.investigationDailyLimitCount}회)`
        : '';
      text += `+ 일일 조사 횟수 제한${countLabel}\n`;
    }
    if (step3.customCommandUpgrade) text += '+ 키워드 답변에 이름 · 주사위 넣기\n';
    if (step3.keywordReplyImage) text += '+ 키워드 답변 시 이미지 전송\n';
    if (step3.transferFeature) {
      const transferNames: Record<string, string> = {
        itemOnly: '양도 (아이템만)',
        currencyOnly: '양도 (재화만)',
        all: '양도 (모두)',
      };
      text += `+ ${step3.transferOption ? transferNames[step3.transferOption] : '양도 기능'}\n`;
    }
    const attendanceEnabled =
      step3.attendanceSystem &&
      (step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat');
    if (attendanceEnabled) {
      text += `+ 출석 시스템 (${step3.attendanceCommand || '[출석]'} / ${step3.attendanceCurrencyAmount || 0})\n`;
    }
    const randomBoxEnabled = step3.randomBox && hasShopBot(step3);
    if (randomBoxEnabled) text += `+ 랜덤박스 기능 (${step3.randomBoxCommand})\n`;
    if (step3.omakaseBot) text += '+ 오마카세\n';

    text += '\n';

    // 기타 정보 (각각 별도 줄)
    if (step3.currencyUnit.trim()) text += `재화 단위 : ${oneLine(step3.currencyUnit)}\n`;
    if (step3.statList.trim()) text += `스탯 : ${oneLine(step3.statList)}\n`;
    if (step3.reservationToot || step3.autoProfileImage) {
      const accounts: string[] = [];
      if (step2.adminAccountId.trim()) accounts.push(asAccount(step2.adminAccountId));
      accounts.push(...step3.accountList.filter((a) => a.trim()).map(asAccount));
      if (accounts.length > 0) text += `계정 목록 : ${accounts.join(', ')}\n`;
    }
    if (attendanceEnabled) {
      text += `출석 명령어 : ${step3.attendanceCommand || '[출석]'} / 재화 +${step3.attendanceCurrencyAmount || 0}\n`;
    }
    if (randomBoxEnabled) text += `랜덤박스 명령어 : ${step3.randomBoxCommand}\n`;

    text += '\n';

    const accountLines = getBotAccountLines(step3);
    if (accountLines.length > 0) {
      text += accountLines.map(({ label, value }) => `${label} : ${value}\n`).join('') + '\n';
    }
    if (step3.botSymbol && step3.botSymbol !== '✶') text += `봇 기호 : ${step3.botSymbol}\n\n`;
    // 자동봇 쪽은 화면 이름과 같게 '세팅 마감일' (서버의 '희망 마감일'과 헷갈렸다)
    if (step3.setupDeadline) text += `세팅 마감일 : ${monthDayWithYear(step3.setupDeadline) ?? step3.setupDeadline}\n\n`;

    if (step3.omakaseDetails) {
      text += `오마카세 상세 : ${oneLine(step3.omakaseDetails)}\n\n`;
    }

    text += divider;
  }

  // 견적
  text += '>>> 견적\n\n';

  // 서버 관련
  if (step2.applyServerInstall === 'yes') {
    text += `서버 설치 ${server.base.toLocaleString()}\n`;
    if (infraFeeApplied) {
      text += `${SERVER_INFRA_FEE_ITEM.copyLabel} ${server.infraFee.toLocaleString()}\n`;
    }

    if (step2.additionalOption) {
      const optionNames: Record<string, string> = {
        logo: '로고 변경',
        dayTheme: '커스텀 낮 테마',
        nightTheme: '커스텀 밤 테마',
        bothTheme: '커스텀 테마 2종 (낮/밤)',
      };
      text += `${optionNames[step2.additionalOption]} ${server.options[step2.additionalOption as keyof typeof server.options].toLocaleString()}\n`;
    }
    if (step2.changeCharacterLimit && step2.characterLimitValue > 0) {
      text += `글자수 변경 ${server.addons.characterLimit.toLocaleString()}\n`;
    }
    if (step2.searchOption) {
      text += `검색 옵션 ${server.addons.search.toLocaleString()}\n`;
    }
    if (step2.mastoHostMigration) {
      text += `masto.host 데이터 이전 ${server.addons.mastoHostMigration.toLocaleString()}\n`;
    }
    if (step2.fastDeadline && step2.fastDeadlineOption) {
      const fastNames: Record<string, string> = {
        basic48h: '48H 빠른마감',
        basic24h: '24H 빠른마감',
        logo48h: '48H 빠른마감',
        theme48h: '48H 빠른마감',
      };
      text += `${fastNames[step2.fastDeadlineOption]} ${server.addons.fastDeadline[step2.fastDeadlineOption as keyof typeof server.addons.fastDeadline].toLocaleString()}\n`;
    }
    text += '\n';
  }

  // 자동봇 관련
  if (step3.applyBot === 'yes') {
    if (step3.operationWeeksOption === 'longterm') {
      text += `장기 자동봇 세팅비 ${bot.longTermSetupFee.toLocaleString()}\n`;
    } else {
      const weeks = step3.manualWeeks;
      text += `자동봇 ${weeks}주 ${botOperationFee(weeks).toLocaleString()}\n`;
    }

    if (step3.mainBot) {
      const mainBotNames: Record<string, string> = {
        basic: '기본봇',
        basicShop: '기본+상점봇',
        basicShopStat: '기본+상점+스탯봇',
      };
      text += `${mainBotNames[step3.mainBot]} ${bot.mainTypes[step3.mainBot as keyof typeof bot.mainTypes].toLocaleString()}\n`;
    }
    if (step3.cocBot) {
      text += `D100 타입 ${bot.addons.cocBot.toLocaleString()}\n`;
    }
    if (step3.trpg2d6Bot) {
      text += `2D6 3종세트 타입 ${bot.addons.trpg2d6Bot.toLocaleString()}\n`;
    }
    // 위 옵션 목록과 같은 순서 (예약 툿 · 스토리 자동 진행 · 툿-재화 연동이 맨 위, 사용자 요청)
    if (step3.reservationToot) {
      text += `예약 툿 ${bot.addons.reservationToot.toLocaleString()}\n`;
    }
    if (step3.autoProfileImage) {
      text += `스토리 자동 진행 ${bot.addons.autoProfileImage.toLocaleString()}\n`;
    }
    if (step3.tootCurrencyLink) {
      text += `툿-재화 연동 ${bot.addons.tootCurrencyLink.toLocaleString()}\n`;
    }
    if (step3.investigationBot && step3.mainBot !== null) {
      text += `조사 자동봇 ${bot.addons.investigationBot.toLocaleString()}\n`;
    }
    if (step3.investigationDailyLimit && step3.investigationBot && step3.mainBot !== null) {
      text += `일일 조사 횟수 제한 ${bot.addons.investigationDailyLimit.toLocaleString()}\n`;
    }
    if ((step3.reservationToot || step3.autoProfileImage) && step3.extraAccountTiers > 0) {
      const tiers = Math.min(ACCOUNT_LIST_CONFIG.maxTiers, step3.extraAccountTiers);
      text += `추가 계정 ${tiers * ACCOUNT_LIST_CONFIG.slotsPerTier}칸 ${(tiers * bot.addons.extraAccountTier).toLocaleString()}\n`;
    }
    if (step3.customCommandUpgrade) {
      text += `키워드 답변에 이름 · 주사위 넣기 ${bot.addons.customCommandUpgrade.toLocaleString()}\n`;
    }
    if (step3.keywordReplyImage) {
      text += `키워드 답변 시 이미지 전송 ${bot.addons.keywordReplyImage.toLocaleString()}\n`;
    }
    if (step3.transferFeature) {
      const transferNames: Record<string, string> = {
        itemOnly: '양도 (아이템)',
        currencyOnly: '양도 (재화)',
        all: '양도 (모두)',
      };
      text += `${step3.transferOption ? transferNames[step3.transferOption] : '양도 기능'} ${bot.addons.transferFeature.toLocaleString()}\n`;
    }
    if (
      step3.attendanceSystem &&
      (step3.mainBot === 'basicShop' || step3.mainBot === 'basicShopStat')
    ) {
      text += `출석 시스템 ${bot.addons.attendanceSystem.toLocaleString()}\n`;
    }
    if (step3.randomBox && hasShopBot(step3)) {
      text += `랜덤박스 기능 ${bot.addons.randomBox.toLocaleString()}\n`;
    }
    if (step3.omakaseBot) {
      text += '오마카세 별도 협의\n';
    }
    text += '\n';
  }

  // 총 합계
  const totalInMan = estimate.grandTotal / 10000;
  let totalDisplay: string;
  if (Number.isInteger(totalInMan)) {
    totalDisplay = `${totalInMan}만원`;
  } else {
    totalDisplay = `${estimate.grandTotal.toLocaleString()}원`;
  }

  text += `총 ${totalDisplay}`;

  if (estimate.hasVariablePrice) {
    text += ` (${estimate.variableItems.join(', ')} 비용 별도)`;
  }

  const schedule = scheduleLines(data);
  if (schedule.length > 0) text += `\n\n\n>>> 예상 일정\n\n${schedule.join('\n')}`;
  text += '\n\n위 견적 및 일정은 커미션주의 확인 이후 달라질 수 있습니다.';

  return text;
}

/** 결제 요청은 마감일 기준: 서버 설치만 5일 전, 자동봇 세팅까지 하면 7일 전 */
const PAYMENT_DAYS_BEFORE = { serverOnly: 5, withBot: 7 } as const;

/**
 * 복사문 '예상 일정' (사용자 요청).
 *  마감일: 자동봇을 신청하면 세팅 마감일, 아니면 서버 희망 마감일 (세팅 마감일은 서버 마감일보다 앞설 수 없다).
 *  결제 요청: 마감일 5일 전(서버만) / 7일 전(자동봇 포함). 이미지 전달: 결제 요청 1일 전까지 — 로고·테마를 골랐을 때만.
 *  이미 지난 날짜는 오늘로 당긴다. 마감일을 못 읽으면 빈 배열.
 */
function scheduleLines(data: OrderFormData, today: Date = new Date()): string[] {
  const { step2, step3 } = data;
  const withBot = step3.applyBot === 'yes';
  const raw = withBot ? step3.setupDeadline : step2.applyServerInstall === 'yes' ? step2.desiredDeadline : '';
  const deadline = parseMonthDayToDate(raw, today);
  if (!deadline) return [];
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysBefore = (n: number) => {
    const d = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate() - n);
    return d < startOfToday ? startOfToday : d;
  };
  const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const paymentGap = withBot ? PAYMENT_DAYS_BEFORE.withBot : PAYMENT_DAYS_BEFORE.serverOnly;
  const lines: string[] = [];
  const option = step2.applyServerInstall === 'yes' ? step2.additionalOption : null;
  if (option) lines.push(`${md(daysBefore(paymentGap + 1))} 이전: ${option === 'logo' ? '로고' : '테마'} 이미지 전달`);
  lines.push(`${md(daysBefore(paymentGap))}: 결제 요청`);
  lines.push(`${md(deadline)}: 마감`);
  return lines;
}
