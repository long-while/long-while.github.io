import type { OrderFormData, PriceEstimate, ValidationError, Step2Data, Step3Data, AdditionalOption, FastDeadlineOption } from '@/app/types/order';
import { DATE_FORMAT_REGEX, GMAIL_REGEX, INPUT_LIMITS } from '@/app/types/order';
import { PRICING_CONFIG, FORM_CONFIG, ACCOUNT_LIST_CONFIG } from '@/app/constants/form';
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
  return GMAIL_REGEX.test(email);
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

  // Invalid Date 체크
  if (isNaN(result.getTime()) || isNaN(open.getTime()) || isNaN(close.getTime())) {
    return {
      field: 'dates',
      message: '유효하지 않은 날짜입니다.',
    };
  }

  if (result > open || open >= close) {
    return {
      field: 'dates',
      message: '합격자 발표일 ≤ 개장일 < 폐장일 순서로 입력해 주세요.',
    };
  }

  return null;
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * 마감일 입력에서 월/일을 추출한다.
 * 구분자(/ . -)가 있거나 없는 형식 모두 허용한다.
 * 예: "06/16", "6/16", "6.16", "6-16", "0616"(MMDD), "616"(MDD)
 * 유효 범위를 벗어나거나 파싱 불가하면 null.
 */
function extractMonthDay(raw: string): { month: number; day: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let month: number | null = null;
  let day: number | null = null;

  const separated = trimmed.match(/^(\d{1,2})\s*[/.\-]\s*(\d{1,2})$/);
  if (separated) {
    month = parseInt(separated[1], 10);
    day = parseInt(separated[2], 10);
  } else {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 4) {
      // MMDD
      month = parseInt(digits.slice(0, 2), 10);
      day = parseInt(digits.slice(2), 10);
    } else if (digits.length === 3) {
      // MDD (한 자리 월)
      month = parseInt(digits.slice(0, 1), 10);
      day = parseInt(digits.slice(1), 10);
    }
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
 * - 6/15 ~ 6/27: 마감 접수 중단
 * - 7/1 ~ 7/10: 휴가 기간
 * 접수 가능하거나 파싱 불가하면 null.
 */
export function getDeadlineBlackoutError(deadline: string, field: string): ValidationError | null {
  const parsed = extractMonthDay(deadline);
  if (!parsed) return null;
  const { month, day } = parsed;

  if (month === 6 && day >= 15 && day <= 27) {
    return { field, message: '6월 27일까지의 마감은 더 받지 않고 있습니다.' };
  }
  if (month === 7 && day >= 1 && day <= 10) {
    return { field, message: '휴가 기간입니다. 7월 1일 전, 또는 7월 10일 이후로 마감일을 지정해주세요.' };
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
  if (daysUntil > 2) return null;

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

/**
 * 봇 기호 검증 (길이만 체크)
 */
export function validateBotSymbol(symbol: string): ValidationError | null {
  if (!symbol) return null;

  if (symbol.length > 5) {
    return {
      field: 'botSymbol',
      message: '봇 기호는 5자 이하여야 합니다.',
    };
  }

  return null;
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
  }

  // Gmail 검증
  if (!data.googleEmail.trim()) {
    errors.push({ field: 'googleEmail', message: '구글 이메일을 입력해 주세요.' });
  } else if (!isValidGmail(data.googleEmail)) {
    errors.push({ field: 'googleEmail', message: '올바른 Gmail 주소를 입력해 주세요. (예: example@gmail.com)' });
  }

  // 비밀번호 검증
  if (!data.googlePassword.trim()) {
    errors.push({ field: 'googlePassword', message: '구글 비밀번호를 입력해 주세요.' });
  } else if (data.googlePassword.length < 8) {
    errors.push({ field: 'googlePassword', message: '비밀번호는 최소 8자 이상이어야 합니다.' });
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

  // 글자수 변경 선택 시 검증
  if (data.changeCharacterLimit && data.characterLimitValue > 0) {
    const charError = validateCharacterLimit(data.characterLimitValue);
    if (charError) {
      errors.push(charError);
    }
  }

  // 서버 설치 "예" 선택 시 필수 필드 검증
  if (data.applyServerInstall === 'yes') {
    if (!data.desiredDeadline || data.desiredDeadline.trim() === '') {
      errors.push({
        field: 'desiredDeadline',
        message: '희망 마감일을 입력해 주세요.',
      });
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

    if (!data.adminAccountId || data.adminAccountId.trim() === '') {
      errors.push({
        field: 'adminAccountId',
        message: '총괄 계정 아이디를 입력해 주세요.',
      });
    }
  }

  // 총괄 계정 길이 검증
  if (data.adminAccountId && data.adminAccountId.length > INPUT_LIMITS.adminAccountId) {
    errors.push({
      field: 'adminAccountId',
      message: `총괄 계정은 ${INPUT_LIMITS.adminAccountId}자 이하여야 합니다.`,
    });
  }

  // 총괄 계정 복수 입력 검증
  if (data.adminAccountId && /[,\/]/.test(data.adminAccountId)) {
    errors.push({
      field: 'adminAccountId',
      message: '총괄 계정은 하나만 입력해 주세요.',
    });
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
    }

    // 메인 봇 선택 (CoC 봇 단독 신청도 허용)
    if (data.mainBot === null && !data.cocBot) {
      errors.push({
        field: 'mainBot',
        message: '메인 봇 종류를 선택해 주세요. (CoC 봇만 단독 신청도 가능합니다)',
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

    // 봇 계정 ID 필수 + 길이 검증
    if (!data.botAccountId || data.botAccountId.trim() === '') {
      errors.push({
        field: 'botAccountId',
        message: '봇 계정 ID를 입력해 주세요.',
      });
    } else if (data.botAccountId.length > INPUT_LIMITS.botAccountId) {
      errors.push({
        field: 'botAccountId',
        message: `봇 계정은 ${INPUT_LIMITS.botAccountId}자 이하여야 합니다.`,
      });
    }

    // 세팅 마감일 필수 + 접수 불가 기간(마감 중단/휴가) 검증
    if (!data.setupDeadline || data.setupDeadline.trim() === '') {
      errors.push({
        field: 'setupDeadline',
        message: '세팅 마감일을 입력해 주세요.',
      });
    } else {
      const blackoutError = getDeadlineBlackoutError(data.setupDeadline, 'setupDeadline');
      if (blackoutError) {
        errors.push(blackoutError);
      }
    }

    // CoC 봇 계정 길이 검증
    if (data.cocBotAccountId && data.cocBotAccountId.length > INPUT_LIMITS.cocBotAccountId) {
      errors.push({
        field: 'cocBotAccountId',
        message: `CoC 봇 계정은 ${INPUT_LIMITS.cocBotAccountId}자 이하여야 합니다.`,
      });
    }

    // 조사 자동봇 계정 길이 검증
    if (
      data.investigationBotAccountId &&
      data.investigationBotAccountId.length > INPUT_LIMITS.investigationBotAccountId
    ) {
      errors.push({
        field: 'investigationBotAccountId',
        message: `조사 자동봇 계정은 ${INPUT_LIMITS.investigationBotAccountId}자 이하여야 합니다.`,
      });
    }

    // CoC 봇이 메인 봇과 함께 신청된 경우 분리된 계정 입력 필수
    if (
      data.cocBot &&
      data.mainBot &&
      data.botAccountId.trim() !== '' &&
      data.cocBotAccountId.trim() === ''
    ) {
      errors.push({
        field: 'cocBotAccountId',
        message: 'CoC 봇은 별도 계정으로 운영되므로 CoC 봇 전용 계정 ID를 입력해 주세요.',
      });
    }
    if (
      data.cocBot &&
      data.mainBot &&
      data.botAccountId.trim() !== '' &&
      data.cocBotAccountId.trim() !== '' &&
      data.botAccountId.trim() === data.cocBotAccountId.trim()
    ) {
      errors.push({
        field: 'cocBotAccountId',
        message: '기본 자동봇과 CoC 봇은 서로 다른 계정 ID를 사용해야 합니다.',
      });
    }

    // 조사 자동봇이 메인 봇과 함께 신청된 경우 분리된 계정 입력 필수
    if (
      data.investigationBot &&
      data.mainBot !== null &&
      data.botAccountId.trim() !== '' &&
      data.investigationBotAccountId.trim() === ''
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
      data.botAccountId.trim() === data.investigationBotAccountId.trim()
    ) {
      errors.push({
        field: 'investigationBotAccountId',
        message: '메인 봇과 조사 자동봇은 서로 다른 계정 ID를 사용해야 합니다.',
      });
    }
    if (
      data.cocBot &&
      data.investigationBot &&
      data.mainBot !== null &&
      data.cocBotAccountId.trim() !== '' &&
      data.investigationBotAccountId.trim() !== '' &&
      data.cocBotAccountId.trim() === data.investigationBotAccountId.trim()
    ) {
      errors.push({
        field: 'investigationBotAccountId',
        message: 'CoC 봇과 조사 자동봇은 서로 다른 계정 ID를 사용해야 합니다.',
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
  }

  return errors;
}

/**
 * 서버 파트 견적 계산
 */
export function calculateServerPrice(data: OrderFormData['step2']): number {
  if (data.applyServerInstall !== 'yes') return 0;

  const { server } = PRICING_CONFIG;
  let total = server.base;

  // 추가 옵션 (배타적)
  if (data.additionalOption && server.options[data.additionalOption as keyof typeof server.options]) {
    total += server.options[data.additionalOption as keyof typeof server.options];
  }

  // 노션 가이드
  if (data.notionGuide) total += server.addons.notionGuide;

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
 * 봇 파트 견적 계산
 */
export function calculateBotPrice(
  data: OrderFormData['step3'],
  operationWeeks: number
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
  if (data.customCommandUpgrade) botCost += bot.addons.customCommandUpgrade;
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
    operationCost = Math.max(0, data.manualWeeks) * bot.operationPerWeek;
  }

  return { botCost, operationCost };
}

/**
 * 최종 견적 계산
 */
export function calculateTotalEstimate(data: OrderFormData): PriceEstimate {
  const serverTotal = calculateServerPrice(data.step2);
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
 * 최종 복사용 텍스트 생성
 */
export function generateCopyText(data: OrderFormData, estimate: PriceEstimate, serverCalcResult?: ServerCalcResult | null): string {
  const { step1, step2, step3 } = data;
  const { server, bot } = PRICING_CONFIG;
  const divider = '==================\n\n';

  let text = divider;

  // 커뮤니티 정보
  text += `${step1.communityKoreanName} / ${step1.communityEnglishName} (약칭 '${step1.communityShortName}')\n\n`;
  if (step1.isLongTermCommunity) {
    text += `장기 소규모 서버\n\n`;
  } else {
    text += `${formatDateForDisplay(step1.openingDate)} ~ ${formatDateForDisplay(step1.closingDate)} (${step1.operationWeeks}주)\n\n`;
  }
  text += `${step1.googleEmail} / ${step1.googlePassword}\n\n`;
  text += `커미션 신청자명 : ${step1.applicantNickname}\n\n`;

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
      text += `${serverCalcResult.monthsLabel} / ${serverCalcResult.usersLabel} / 검색 ${serverCalcResult.search === 'yes' ? 'O' : 'X'}\n\n`;
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

    if (step2.additionalOption) {
      const optionNames: Record<string, string> = {
        logo: '로고 변경',
        dayTheme: '낮 테마',
        nightTheme: '밤 테마',
        bothTheme: '테마 2종',
      };
      text += `+ ${optionNames[step2.additionalOption]}\n`;
    }
    if (step2.notionGuide) {
      text += '+ 노션 가이드\n';
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
    if (step2.adminAccountId) text += `총괄 계정 : ${step2.adminAccountId}\n\n`;
    if (step2.desiredDeadline) text += `희망 마감일 : ${step2.desiredDeadline}\n\n`;

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

    if (step3.cocBot) text += '+ CoC 봇\n';
    if (step3.investigationBot && step3.mainBot !== null) text += '+ 조사 자동봇\n';
    if (step3.investigationDailyLimit && step3.investigationBot && step3.mainBot !== null) {
      const countLabel = step3.investigationDailyLimitCount > 0
        ? ` (일일 ${step3.investigationDailyLimitCount}회)`
        : '';
      text += `+ 일일 조사 횟수 제한${countLabel}\n`;
    }
    if (step3.customCommandUpgrade) text += '+ 커스텀 명령어 업그레이드\n';
    if (step3.reservationToot) text += '+ 예약 툿\n';
    if (step3.autoProfileImage) text += '+ 자동 스진\n';
    if (step3.tootCurrencyLink) text += '+ 툿-재화 연동\n';
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
    if (step3.omakaseBot) text += '+ 오마카세\n';

    text += '\n';

    // 기타 정보 (각각 별도 줄)
    if (step3.currencyUnit) text += `재화 단위 : ${step3.currencyUnit}\n`;
    if (step3.statList) text += `스탯 : ${step3.statList}\n`;
    if (step3.tootPerCurrency) text += `${step3.tootPerCurrency}\n`;
    if (step3.reservationToot || step3.autoProfileImage) {
      const accounts: string[] = [];
      if (step2.adminAccountId.trim()) accounts.push(step2.adminAccountId.trim());
      accounts.push(...step3.accountList.map((a) => a.trim()).filter(Boolean));
      if (accounts.length > 0) text += `계정 목록 : ${accounts.join(', ')}\n`;
    }
    if (attendanceEnabled) {
      text += `출석 명령어 : ${step3.attendanceCommand || '[출석]'} / 재화 +${step3.attendanceCurrencyAmount || 0}\n`;
    }

    text += '\n';

    const cocAccountActive = step3.cocBot && step3.mainBot !== null;
    const investigationAccountActive =
      step3.investigationBot && step3.mainBot !== null;
    const hasSeparateBotAccounts = cocAccountActive || investigationAccountActive;

    if (hasSeparateBotAccounts) {
      if (step3.botAccountId) {
        text += `메인 봇 계정 : ${step3.botAccountId}\n`;
      }
      if (cocAccountActive && step3.cocBotAccountId) {
        text += `CoC 봇 계정 : ${step3.cocBotAccountId}\n`;
      }
      if (investigationAccountActive && step3.investigationBotAccountId) {
        text += `조사 자동봇 계정 : ${step3.investigationBotAccountId}\n`;
      }
      if (
        step3.botAccountId ||
        (cocAccountActive && step3.cocBotAccountId) ||
        (investigationAccountActive && step3.investigationBotAccountId)
      ) {
        text += '\n';
      }
    } else if (step3.botAccountId) {
      text += `봇 계정 : ${step3.botAccountId}\n\n`;
    }
    if (step3.botSymbol && step3.botSymbol !== '✶') text += `봇 기호 : ${step3.botSymbol}\n\n`;
    if (step3.setupDeadline) text += `희망 마감일 : ${step3.setupDeadline}\n\n`;

    if (step3.omakaseDetails) {
      text += `오마카세 상세 : ${step3.omakaseDetails}\n\n`;
    }

    text += divider;
  }

  // 견적
  text += '견적\n\n';

  // 서버 관련
  if (step2.applyServerInstall === 'yes') {
    text += `서버 설치 ${server.base.toLocaleString()}\n`;

    if (step2.additionalOption) {
      const optionNames: Record<string, string> = {
        logo: '로고 변경',
        dayTheme: '낮 테마',
        nightTheme: '밤 테마',
        bothTheme: '테마 2종',
      };
      text += `${optionNames[step2.additionalOption]} ${server.options[step2.additionalOption as keyof typeof server.options].toLocaleString()}\n`;
    }
    if (step2.notionGuide) {
      text += `마스토돈 가이드 ${server.addons.notionGuide.toLocaleString()}\n`;
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
      text += `자동봇 ${weeks}주 ${(weeks * bot.operationPerWeek).toLocaleString()}\n`;
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
      text += `CoC 봇 ${bot.addons.cocBot.toLocaleString()}\n`;
    }
    if (step3.investigationBot && step3.mainBot !== null) {
      text += `조사 자동봇 ${bot.addons.investigationBot.toLocaleString()}\n`;
    }
    if (step3.investigationDailyLimit && step3.investigationBot && step3.mainBot !== null) {
      text += `일일 조사 횟수 제한 ${bot.addons.investigationDailyLimit.toLocaleString()}\n`;
    }
    if (step3.customCommandUpgrade) {
      text += `커스텀 명령어 업그레이드 ${bot.addons.customCommandUpgrade.toLocaleString()}\n`;
    }
    if (step3.reservationToot) {
      text += `예약 툿 ${bot.addons.reservationToot.toLocaleString()}\n`;
    }
    if (step3.autoProfileImage) {
      text += `자동 스진 ${bot.addons.autoProfileImage.toLocaleString()}\n`;
    }
    if ((step3.reservationToot || step3.autoProfileImage) && step3.extraAccountTiers > 0) {
      const tiers = Math.min(ACCOUNT_LIST_CONFIG.maxTiers, step3.extraAccountTiers);
      text += `추가 계정 ${tiers * ACCOUNT_LIST_CONFIG.slotsPerTier}칸 ${(tiers * bot.addons.extraAccountTier).toLocaleString()}\n`;
    }
    if (step3.tootCurrencyLink) {
      text += `툿-재화 연동 ${bot.addons.tootCurrencyLink.toLocaleString()}\n`;
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

  return text;
}
