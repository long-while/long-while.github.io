/**
 * LevelBar — 시안 'Component 58' (0 / 50 / 100). 160×3, 모서리 9999, 바탕 #EDEDED, 채움 #3376E7.
 * Stepper — 시안 신청서 단계 표시 (Component 54 active / default, file.json 실측).
 *  원 46px: 지난·현재 단계 #3376E7 + 흰 체크 / 다음 단계 흰 바탕 + #DDDDDD 선 + #A6A6A6 체크.
 *  라벨 title5, 현재·지난 #000 / 다음 #A6A6A6. 단계 사이 LevelBar: 지난 단계 뒤 100, 현재 단계 뒤 50, 나머지 0.
 */
import clsx from 'clsx';
import { focusRing } from './shared';

interface LevelBarProps {
  /** 0~100 */
  value: number;
  className?: string;
  /** 주면 진행 막대로 읽힌다(role=progressbar). 없으면 장식 */
  label?: string;
}

export function LevelBar({ value, className, label }: LevelBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={clsx('h-[3px] overflow-hidden rounded-pill bg-background-200', className)}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-valuenow={label ? pct : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-hidden={label ? undefined : true}
    >
      <div className="h-full rounded-pill bg-brand transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface StepperProps {
  steps: string[];
  /** 현재 단계 (0부터) */
  current: number;
  className?: string;
  /** 주면 단계를 눌러 이동할 수 있다 (신청서) */
  onStepClick?: (index: number) => void;
  /** 이동할 수 있는 단계인지. 아니면 버튼을 끄고 흐리게 (기존 신청서 동작) */
  isStepEnabled?: (index: number) => boolean;
}

function StepCircle({ done }: { done: boolean }) {
  return (
    <span
      className={clsx(
        'flex size-9 items-center justify-center rounded-pill sm:size-[46px]',
        done ? 'bg-brand text-text-inverse' : 'border border-border-100 bg-background-white text-text-disabled',
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 46 46" fill="none" className="size-full">
        <path d="M15.73 23L21.18 28.45L30.27 17.54" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Stepper({ steps, current, className, onStepClick, isStepEnabled }: StepperProps) {
  return (
    <ol className={clsx('flex items-start justify-center gap-1 sm:gap-2 lg:gap-4', className)}>
      {steps.map((label, index) => {
        const reached = index <= current;
        const barValue = index < current ? 100 : index === current ? 50 : 0;
        const enabled = isStepEnabled ? isStepEnabled(index) : true;
        const content = (
          <>
            <StepCircle done={reached} />
            <span className={clsx('whitespace-nowrap text-caption2 lg:text-title5', reached ? 'text-text-primary' : 'text-text-disabled')}>
              {label}
              <span className="sr-only">{index < current ? ' (완료)' : index === current ? ' (현재 단계)' : ''}</span>
            </span>
          </>
        );
        return (
          <li key={label} className={clsx('flex items-start gap-1 sm:gap-2 lg:gap-4', index < steps.length - 1 && 'flex-1 lg:flex-none')}>
            {onStepClick ? (
              <button
                type="button"
                onClick={() => onStepClick(index)}
                aria-current={index === current ? 'step' : undefined}
                disabled={!enabled}
                className={clsx('flex flex-col items-center gap-2.5 rounded-input', focusRing, enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60')}
              >
                {content}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2.5" aria-current={index === current ? 'step' : undefined}>
                {content}
              </div>
            )}
            {index < steps.length - 1 && <LevelBar value={barValue} className="mt-[17px] min-w-4 flex-1 sm:mt-[22px] lg:w-40 lg:flex-none" />}
          </li>
        );
      })}
    </ol>
  );
}
