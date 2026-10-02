/**
 * 한국어 조사 고르기 (R3: '하나을(를)' 같은 잘못된 조사 고침).
 * 단어의 마지막 한글 글자에 받침이 있으면 앞 조사(을·은), 없으면 뒤 조사(를·는).
 * '기본 가동료 (1주)'처럼 끝에 괄호·숫자가 붙어도 마지막 한글 글자로 판단한다.
 * 한글이 하나도 없으면 고를 수 없어 '을(를)'처럼 둘 다 적는다.
 */
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

function lastHangulHasBatchim(word: string): boolean | null {
  for (let i = word.length - 1; i >= 0; i--) {
    const code = word.charCodeAt(i);
    if (code >= HANGUL_START && code <= HANGUL_END) return (code - HANGUL_START) % 28 !== 0;
  }
  return null;
}

function pick(word: string, withBatchim: string, withoutBatchim: string): string {
  const batchim = lastHangulHasBatchim(word);
  if (batchim === null) return `${withBatchim}(${withoutBatchim})`;
  return batchim ? withBatchim : withoutBatchim;
}

/** 목적격 조사: 을 / 를 */
export const eulReul = (word: string) => pick(word, '을', '를');

/** 보조사: 은 / 는 */
export const eunNeun = (word: string) => pick(word, '은', '는');
