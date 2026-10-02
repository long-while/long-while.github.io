/**
 * LevelBar — 시안 'Component 58' (0 / 50 / 100). 160×3, 모서리 9999, 바탕 #EDEDED, 채움 #3376E7.
 * Stepper — 시안 신청서 단계 표시 (Component 54 active / default, file.json 실측).
 *  원 46px: 지난·현재 단계 #3376E7 + 흰 체크 / 다음 단계 흰 바탕 + #DDDDDD 선 + #A6A6A6 체크.
 *  라벨 title5, 현재·지난 #000 / 다음 #A6A6A6. 단계 사이 LevelBar: 지난 단계 뒤 100, 현재 단계 뒤 50, 나머지 0.
 */
import clsx from 'clsx';

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
}

function StepCircle({ done }: { done: boolean }) {
  return (
    <span
      className={clsx(
        'flex size-[46px] items-center justify-center rounded-pill',
        done ? 'bg-brand text-text-inverse' : 'border border-border-100 bg-background-white text-text-disabled',
      )}
      aria-hidden="true"
    >
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        <path d="M15.73 23L21.18 28.45L30.27 17.54" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={clsx('flex items-start justify-center gap-2 lg:gap-4', className)}>
      {steps.map((label, index) => {
        const reached = index <= current;
        const barValue = index < current ? 100 : index === current ? 50 : 0;
        return (
          <li key={label} className={clsx('flex items-start gap-2 lg:gap-4', index < steps.length - 1 && 'flex-1 lg:flex-none')}>
            <div className="flex flex-col items-center gap-2.5" aria-current={index === current ? 'step' : undefined}>
              <StepCircle done={reached} />
              <span className={clsx('whitespace-nowrap text-caption2 lg:text-title5', reached ? 'text-text-primary' : 'text-text-disabled')}>
                {label}
                <span className="sr-only">{index < current ? ' (완료)' : index === current ? ' (현재 단계)' : ''}</span>
              </span>
            </div>
            {index < steps.length - 1 && <LevelBar value={barValue} className="mt-[22px] min-w-6 flex-1 lg:w-40 lg:flex-none" />}
          </li>
        );
      })}
    </ol>
  );
}
