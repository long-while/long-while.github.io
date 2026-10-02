/**
 * Checkbox, Radio — 시안 '체크박스'·'라디오버튼' (component-1 Radio / Checkbox Default, file.json 실측).
 * 둘 다 28px 원형. 선택: #3376E7 바탕 + 흰 체크(체크박스) / 흰 점 14px(라디오).
 * 미선택: #DDDDDD 바탕 + 흰 체크·점. outline 모양(흰 바탕 + #DDDDDD 선 + #A6A6A6 체크)도 지원.
 * 실제 <input> 을 시각적으로만 숨겨서 키보드·폼 동작은 브라우저 기본을 그대로 쓴다.
 */
import clsx from 'clsx';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  /** 미선택 모양: filled(#DDDDDD 바탕, 기본) / outline(흰 바탕 + 선) */
  appearance?: 'filled' | 'outline';
  /** 라벨 글자 크기: 16(기본) / 18 */
  labelSize?: 'md' | 'lg';
}

const box = (appearance: 'filled' | 'outline') =>
  clsx(
    'relative flex size-7 shrink-0 items-center justify-center rounded-pill transition-colors duration-150',
    appearance === 'filled' ? 'bg-border-100' : 'bg-background-white border border-border-100',
    'peer-checked:bg-brand peer-checked:border-transparent',
    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand',
    'peer-disabled:opacity-40',
  );

function ChoiceRow({ children, disabled, htmlFor }: { children: ReactNode; disabled?: boolean; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className={clsx('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      {children}
    </label>
  );
}

const labelClass = (size: 'md' | 'lg', muted: boolean) =>
  clsx(size === 'lg' ? 'text-title4' : 'text-title5', muted ? 'text-text-disabled' : 'text-text-primary', 'peer-disabled:text-text-disabled');

export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>(function Checkbox(
  { label, appearance = 'filled', labelSize = 'md', id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `checkbox-${autoId}`;
  return (
    <span className={className}>
      <ChoiceRow htmlFor={inputId} disabled={disabled}>
        <input ref={ref} id={inputId} type="checkbox" disabled={disabled} className="peer sr-only" {...rest} />
        <span className={box(appearance)} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={appearance === 'outline' ? 'text-text-disabled' : 'text-text-inverse'}>
            <path d="M8.91 14L12.73 17.82L19.09 10.18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className={labelClass(labelSize, false)}>{label}</span>
      </ChoiceRow>
    </span>
  );
});

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio(
  { label, appearance = 'filled', labelSize = 'md', id, className, disabled, checked, defaultChecked, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `radio-${autoId}`;
  const isUnchecked = checked === false || (checked === undefined && !defaultChecked);
  return (
    <span className={className}>
      <ChoiceRow htmlFor={inputId} disabled={disabled}>
        <input
          ref={ref} id={inputId} type="radio" disabled={disabled} checked={checked} defaultChecked={defaultChecked}
          className="peer sr-only" {...rest}
        />
        <span className={box(appearance)} aria-hidden="true">
          <span className="size-3.5 rounded-pill bg-background-white" />
        </span>
        {/* 시안: 선택 안 된 라디오의 라벨은 #A6A6A6 */}
        <span className={clsx(labelClass(labelSize, isUnchecked), 'peer-checked:text-text-primary')}>{label}</span>
      </ChoiceRow>
    </span>
  );
});
