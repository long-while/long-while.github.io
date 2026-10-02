/**
 * TextField — 시안 Input Guide (component-1, file.json 실측).
 * 높이 64, 패딩 20·16, 모서리 8, 선 #DDDDDD, 글자 body2, 안내 글자 #767676.
 * hover: 선 #000 / focus: 선 #000 + 배경 #F6F7F8 / error: 선·도움말 #DC0000.
 */
import clsx from 'clsx';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface FieldChromeProps {
  label?: ReactNode;
  /** 아래 도움말 */
  helper?: ReactNode;
  /** 오류 문구. 주면 오류 상태가 된다 */
  error?: ReactNode;
  required?: boolean;
}

/** withIcons: 양쪽에 아이콘(검색·지우기)이 들어가는 칸이라 좌우 패딩을 48로 */
export const fieldBoxClassName = (hasError: boolean, { withIcons = false }: { withIcons?: boolean } = {}) =>
  clsx(
    'w-full min-h-16 rounded-input border bg-background-white py-5 text-body2 text-text-primary',
    withIcons ? 'px-12' : 'px-4',
    'placeholder:text-text-secondary transition-colors duration-150 outline-none',
    hasError
      ? 'border-error-500'
      : 'border-border-100 hover:border-border-strong focus:border-border-strong focus-visible:border-border-strong',
    'focus:bg-background-100',
    'disabled:bg-background-100 disabled:text-text-disabled disabled:border-border-100 disabled:cursor-not-allowed',
  );

export function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-title5 text-text-primary">
      {children}
      {required && (
        <span className="text-brand" aria-hidden="true">
          {' '}*
        </span>
      )}
    </label>
  );
}

export function FieldMessage({ id, error, helper }: { id: string; error?: ReactNode; helper?: ReactNode }) {
  if (!error && !helper) return null;
  return (
    <p id={id} className={clsx('text-body3', error ? 'text-error-500' : 'text-text-secondary')} role={error ? 'alert' : undefined}>
      {error ?? helper}
    </p>
  );
}

type TextFieldProps = FieldChromeProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, helper, error, required, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `field-${autoId}`;
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error || helper);
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={fieldBoxClassName(Boolean(error))}
        {...rest}
      />
      <FieldMessage id={messageId} error={error} helper={helper} />
    </div>
  );
});
