import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ValidationError } from '@/app/types/order';

/**
 * 신청서 필드 단위 오류
 * =====================
 *
 * validateStepN 은 이미 `{ field, message }` 를 돌려주지만, 예전에는 상단 목록에
 * 메시지만 모아 보여줘서 어떤 입력칸이 문제인지 알 수 없었습니다.
 * 이 컨텍스트가 그 field 를 각 입력칸까지 내려보냅니다.
 */
const FieldErrorContext = createContext<Record<string, string>>({});

export function FieldErrorProvider({ errors, children }: {
  errors: ValidationError[];
  children: ReactNode;
}) {
  // 한 필드에 오류가 여러 개면 첫 번째만 보여준다 (입력칸 아래가 길어지지 않도록)
  const byField = useMemo(() => {
    const map: Record<string, string> = {};
    for (const error of errors) {
      if (!(error.field in map)) map[error.field] = error.message;
    }
    return map;
  }, [errors]);

  return <FieldErrorContext.Provider value={byField}>{children}</FieldErrorContext.Provider>;
}

/** 해당 필드의 오류 메시지. 없으면 null */
export function useFieldError(field: string): string | null {
  return useContext(FieldErrorContext)[field] ?? null;
}

interface FieldAriaProps {
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

/**
 * 입력칸에 펼쳐 넣을 접근성 속성을 만들어 주는 함수를 돌려준다.
 * 컴포넌트 맨 위에서 한 번만 호출하고, 얻은 함수는 조건부 JSX 안에서도 자유롭게 쓴다.
 * (입력칸마다 훅을 부르면 조건부 렌더링에서 훅 순서가 깨진다)
 */
export function useFieldAria(): (field: string) => FieldAriaProps {
  const errors = useContext(FieldErrorContext);

  return useMemo(
    () => (field: string) =>
      errors[field] ? { 'aria-invalid': true as const, 'aria-describedby': `${field}-error` } : {},
    [errors]
  );
}

/**
 * 입력칸 바로 뒤에 두는 오류 메시지.
 * 인접 형제 CSS(input:has(+ .field-error))가 입력칸 테두리까지 빨갛게 만든다.
 */
export function FieldError({ field }: { field: string }) {
  const message = useFieldError(field);
  if (!message) return null;

  return (
    <p id={`${field}-error`} role="alert" className="field-error">
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </p>
  );
}

/**
 * 라디오/체크박스 그룹처럼 입력칸 하나로 특정되지 않는 묶음용.
 * 묶음 전체에 왼쪽 빨간 선을 긋고 아래에 메시지를 단다.
 */
export function FieldGroupError({ field, children }: { field: string; children: ReactNode }) {
  const message = useFieldError(field);

  return (
    <div className={message ? 'field-group-error' : undefined}>
      {children}
      {message && (
        <p id={`${field}-error`} role="alert" className="field-error">
          <span aria-hidden="true">⚠</span>
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}
