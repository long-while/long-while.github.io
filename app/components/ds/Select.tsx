/**
 * Select — 시안 '셀렉트' (Input Guide 와 같은 상자, 오른쪽 아래 화살표 24px, 열림 목록).
 * Radix Select 를 써서 키보드 조작(화살표, Enter, Esc, 글자 입력 검색)과 접근성 속성을 그대로 가져간다.
 * 목록은 열릴 때만 포털로 그려지므로 프리렌더(SSR)에 영향이 없다.
 */
import * as RadixSelect from '@radix-ui/react-select';
import clsx from 'clsx';
import { useId } from 'react';
import { Icon } from './Icon';
import { FieldLabel, FieldMessage, fieldBoxClassName, type FieldChromeProps } from './TextField';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends FieldChromeProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** label 이 없을 때 보조기기용 이름 */
  'aria-label'?: string;
}

export function Select({
  options, value, defaultValue, onValueChange, placeholder = '선택해주세요', disabled,
  name, id, className, label, helper, error, required, 'aria-label': ariaLabel,
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const messageId = `${triggerId}-message`;
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && (
        <FieldLabel htmlFor={triggerId} required={required}>
          {label}
        </FieldLabel>
      )}
      <RadixSelect.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} name={name} required={required}>
        <RadixSelect.Trigger
          id={triggerId}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? messageId : undefined}
          className={clsx(
            fieldBoxClassName(Boolean(error)),
            'group flex items-center justify-between gap-3 text-left data-[placeholder]:text-text-secondary',
            'data-[state=open]:border-border-strong',
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className="shrink-0 text-text-disabled transition-transform duration-150 group-data-[state=open]:rotate-180">
            <Icon name="chevron-down" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <SelectList options={options} />
      </RadixSelect.Root>
      <FieldMessage id={messageId} error={error} helper={helper} />
    </div>
  );
}

function SelectList({ options }: { options: SelectOption[] }) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className="z-50 max-h-[var(--radix-select-content-available-height)] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-input border border-border-100 bg-background-white shadow-modal"
      >
        <RadixSelect.Viewport className="p-2">
          {options.map((option) => (
            <RadixSelect.Item
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={clsx(
                'relative flex cursor-pointer select-none items-center rounded-button px-3 py-3 text-body2 text-text-primary outline-none',
                'data-[highlighted]:bg-background-100 data-[state=checked]:text-brand data-[state=checked]:font-medium',
                'data-[disabled]:cursor-not-allowed data-[disabled]:text-text-disabled',
              )}
            >
              <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
            </RadixSelect.Item>
          ))}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}
