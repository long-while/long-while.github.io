/**
 * Tabs — 시안 '탭메뉴'(type1, 상자형) / '탭메뉴-2'(type2, 밑줄형) (component-1, file.json 실측).
 *  type1: 56px, 패딩 16·28, 모서리 4, 기본 #F6F7F8 + #767676 / 선택 #3376E7 + 흰 글자. 640px 미만은 탭이 폭을 나눠 가짐(가로 넘침 방지)
 *  type2: 70px, 패딩 20, 기본 글자 #A6A6A6 / 선택 글자·밑줄 #3376E7, '추가금' 같은 작은 배지
 * WAI-ARIA tabs 패턴: role=tablist/tab, 화살표·Home·End 로 이동(roving tabindex).
 * 탭 내용(tabpanel)은 쓰는 쪽에서 그린다: id={tabPanelId(idPrefix, id)}, aria-labelledby={tabId(idPrefix, id)}.
 */
import clsx from 'clsx';
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { focusRing } from './shared';

export interface TabItem {
  id: string;
  label: ReactNode;
  /** type2 의 작은 배지 (예: 추가금) */
  badge?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'box' | 'line';
  idPrefix: string;
  'aria-label': string;
  className?: string;
}

export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
export const tabPanelId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

const TAB_CLASS = {
  box: (selected: boolean) =>
    clsx(
      'min-h-14 min-w-0 flex-1 rounded-button px-2 py-4 text-caption1 transition-colors duration-150 sm:min-w-[128px] sm:flex-none sm:shrink-0 sm:px-7',
      selected ? 'bg-brand text-text-inverse shadow-card' : 'bg-background-100 text-text-secondary hover:bg-background-200',
    ),
  line: (selected: boolean) =>
    clsx(
      'flex min-h-[70px] shrink-0 items-center justify-center gap-1 border-b-2 px-5 py-5 text-caption1 transition-colors duration-150 lg:w-[220px] lg:shrink lg:px-3 xl:px-5',
      selected ? 'border-brand text-brand' : 'border-transparent text-text-disabled hover:text-text-secondary',
    ),
};

function Badge({ selected, children }: { selected: boolean; children: ReactNode }) {
  return (
    <span className={clsx('rounded-pill px-3 py-1 text-body3', selected ? 'bg-brand-50 text-brand' : 'bg-background-100 text-text-disabled')}>
      {children}
    </span>
  );
}

export function Tabs({ items, value, onChange, variant = 'box', idPrefix, className, 'aria-label': ariaLabel }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = items.findIndex((item) => item.id === value);

  // 좁은 화면에서 탭 줄이 가로로 넘칠 때, 고른 탭이 보이도록 탭 줄만 가로로 옮긴다 (페이지 세로 위치는 그대로)
  useEffect(() => {
    const tab = refs.current[selectedIndex];
    const list = tab?.parentElement;
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = tab.offsetLeft - list.offsetLeft - (list.clientWidth - tab.clientWidth) / 2;
  }, [selectedIndex]);

  const moveFocus = (index: number) => {
    const next = (index + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next].id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: items.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    moveFocus(keys[event.key]);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        'flex max-w-full overflow-x-auto',
        variant === 'box' ? 'w-full gap-2 rounded-input bg-background-100 p-2 sm:w-fit' : 'border-b border-border-100 lg:justify-center-safe',
        className,
      )}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => { refs.current[index] = el; }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.id)}
            aria-selected={selected}
            aria-controls={tabPanelId(idPrefix, item.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={clsx(TAB_CLASS[variant](selected), focusRing)}
          >
            <span>{item.label}</span>
            {variant === 'line' && item.badge && <>{' '}<Badge selected={selected}>{item.badge}</Badge></>}
          </button>
        );
      })}
    </div>
  );
}
