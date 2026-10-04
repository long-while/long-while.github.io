/**
 * 지울 수 없는 앞뒤 글자가 붙는 입력칸 (사용자 요청).
 *  계정 아이디: 누르면 맨 앞에 @ 가 들어가 있고 지워지지 않는다.
 *  명령어: 누르면 [ ] 가 들어가 있고, 글자는 그 사이에만 쓰인다.
 * 아무것도 안 쓰고 나가면 빈 칸으로 되돌린다 (필수 입력 검사가 그대로 동작). 저장 값은 화면에 보이는 그대로 (@NOTICE, [출석]).
 */
import type { FocusEvent, KeyboardEvent, SyntheticEvent } from 'react';

interface Affix {
  prefix: string;
  suffix: string;
}

const AT: Affix = { prefix: '@', suffix: '' };
const BRACKETS: Affix = { prefix: '[', suffix: ']' };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 앞뒤 고정 글자를 뗀 안쪽 글자 (사용자가 앞뒤 글자를 또 쳐도 하나만 남게 모두 지운다) */
function innerOf(value: string, { prefix, suffix }: Affix): string {
  const strip = new RegExp(`[${escape(prefix + suffix)}]`, 'g');
  return value.replace(strip, '');
}

const wrap = (inner: string, { prefix, suffix }: Affix) => `${prefix}${inner}${suffix}`;

/** 커서를 앞 글자 뒤 ~ 뒤 글자 앞 사이로 */
function clampCaret(input: HTMLInputElement, { prefix, suffix }: Affix) {
  const min = prefix.length;
  const max = input.value.length - suffix.length;
  const start = Math.min(Math.max(input.selectionStart ?? min, min), max);
  const end = Math.min(Math.max(input.selectionEnd ?? start, start), max);
  if (start !== input.selectionStart || end !== input.selectionEnd) input.setSelectionRange(start, end);
}

/**
 * input 에 펼쳐 넣는 속성 (value·onChange 포함).
 * emptyValue: 비운 채로 나갈 때 저장할 값 (출석처럼 기본값이 있으면 '[출석]', 아니면 '').
 */
function affixInputProps(affix: Affix, value: string, setValue: (value: string) => void, emptyValue = '') {
  const empty = wrap('', affix);
  return {
    // 예전에 고정 글자 없이 저장된 값(NOTICE)도 화면에는 붙여서 보여 준다 (고치면 저장 값도 붙는다)
    value: value === '' ? '' : wrap(innerOf(value, affix), affix),
    onChange: (e: { target: { value: string } }) => setValue(wrap(innerOf(e.target.value, affix), affix)),
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      if (value === '') setValue(empty);
      const input = e.currentTarget;
      requestAnimationFrame(() => clampCaret(input, affix));
    },
    onBlur: () => {
      const inner = innerOf(value, affix).trim();
      setValue(inner ? wrap(inner, affix) : emptyValue);
    },
    onSelect: (e: SyntheticEvent<HTMLInputElement>) => clampCaret(e.currentTarget, affix),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const { selectionStart: start, selectionEnd: end } = input;
      const min = affix.prefix.length;
      const max = input.value.length - affix.suffix.length;
      if (e.key === 'Backspace' && start === min && end === min) e.preventDefault();
      if (e.key === 'Delete' && start === max && end === max) e.preventDefault();
      if (e.key === 'Home') { e.preventDefault(); input.setSelectionRange(min, min); }
      if (e.key === 'End') { e.preventDefault(); input.setSelectionRange(max, max); }
    },
  };
}

/** 계정 아이디 칸: 맨 앞 @ 고정 */
export const atInputProps = (value: string, setValue: (value: string) => void) => affixInputProps(AT, value, setValue);

/** 명령어 칸: [ ] 고정. emptyValue 는 비운 채로 나갈 때 값 */
export const bracketInputProps = (value: string, setValue: (value: string) => void, emptyValue = '') =>
  affixInputProps(BRACKETS, value, setValue, emptyValue);

/** '@' 만 있는 칸은 빈 칸으로 본다 (누르자마자 '입력해 주세요' 오류가 뜨지 않게) */
export const isBlankAccount = (value: string) => value.replace(/^@+/, '').trim() === '';
