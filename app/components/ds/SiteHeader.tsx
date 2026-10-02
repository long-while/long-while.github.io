/**
 * SiteHeader — 시안 '헤더' (1320×92, 위에서 24px 떠 있는 흰 바, 모서리 12, 패딩 24, file.json 실측).
 *  3단계 사용자 요청: 왼쪽 '한참' 글자 로고(브랜드색) / 가운데 정렬 메뉴(title5 #767676, 간격 48) / 오른쪽 '신청하기' 브랜드색 알약(44px).
 *  메뉴 'FAQ' 는 접근성을 위해 '자주 묻는 질문'으로 (푸터와 같은 이름).
 * 기존 Navigation 의 동작을 그대로 옮김: <a href> 링크 + SPA 이동, 현재 페이지 표시, '나의 견적' 개수 배지(aria-live),
 * 1024px 미만 햄버거 + 오른쪽 슬라이드 메뉴(dialog), 딤 클릭·링크 클릭 시 닫힘. 추가: Esc 로 메뉴 닫기. (스크롤 그림자는 3단계에 사용자 요청으로 뺌)
 */
import clsx from 'clsx';
import { BrandLogo } from './BrandLogo';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigationProps, PageType } from '@/app/types/navigation';
import { buttonClassName } from './Button';
import { Icon } from './Icon';
import { focusRing } from './shared';

const NAV_ITEMS: Array<{ id: PageType; label: string }> = [
  { id: 'server', label: '서버 커미션' },
  { id: 'bot', label: '자동봇 커미션' },
  { id: 'terms', label: '이용안내' },
  { id: 'faq', label: '자주 묻는 질문' },
  { id: 'estimate', label: '나의 견적' },
];

function CountBadge({ count, onDark = false }: { count: number; onDark?: boolean }) {
  return (
    <span
      className={clsx(
        'inline-flex min-w-5 items-center justify-center rounded-pill px-1.5 text-[11px] leading-5',
        onDark ? 'bg-background-white/20 text-text-inverse' : 'bg-brand text-text-inverse',
      )}
      role="status"
      aria-live="polite"
      aria-label={`견적에 ${count}개 항목이 담겨있습니다`}
    >
      {count}
    </span>
  );
}

export function SiteHeader({ currentPage, onNavigate }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items } = useEstimate();
  const count = items.length;

  const toggleRef = useRef<HTMLButtonElement>(null);

  // 모바일 메뉴: 열면 첫 메뉴로 포커스, Tab 은 메뉴 버튼(닫기)과 메뉴 안에서만 돌고, Esc 로 닫으면 메뉴 버튼으로 포커스를 돌려준다
  useEffect(() => {
    if (!menuOpen) return;
    const menu = document.getElementById('site-mobile-menu');
    const focusables = () => [toggleRef.current, ...Array.from(menu?.querySelectorAll<HTMLElement>('a[href], button') ?? [])].filter(Boolean) as HTMLElement[];
    focusables()[1]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = focusables();
      const index = list.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? (index <= 0 ? list.length - 1 : index - 1) : (index === -1 || index === list.length - 1 ? 0 : index + 1);
      event.preventDefault();
      list[next]?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const linkProps = (page: PageType) => {
    const base = navLinkProps(page, onNavigate);
    return {
      href: base.href,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        base.onClick(event);
        setMenuOpen(false);
      },
      'aria-current': currentPage === page ? ('page' as const) : undefined,
    };
  };

  return (
    <>
      <header className="fixed inset-x-0 top-[var(--ds-header-offset)] z-50">
        <div className="container-ds">
          <nav
            aria-label="주 메뉴"
            // 데스크톱: 3칸 격자(로고 | 가운데 메뉴 | 신청하기)로 메뉴를 바 가운데에 둔다. 스크롤해도 그림자 없음(사용자 요청)
            className="flex h-[var(--ds-header-height)] items-center justify-between rounded-card bg-background-white px-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-6"
          >
            {/* 사용자 제공 '한참' 글자 로고 (3단계). 읽는 이름은 그대로 '한참 커미션' */}
            <a {...linkProps('home')} className={clsx('flex items-center justify-self-start rounded-button', focusRing)}>
              <BrandLogo className="h-[29px] lg:h-9" />
            </a>
            <ul className="hidden items-center gap-12 lg:flex">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      {...linkProps(item.id)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 text-title5 transition-colors',
                        currentPage === item.id ? 'text-brand' : 'text-text-secondary hover:text-text-primary',
                        focusRing,
                      )}
                    >
                      {item.label}
                      {item.id === 'estimate' && count > 0 && <CountBadge count={count} />}
                    </a>
                  </li>
                ))}
            </ul>
            {/* 버튼 클래스의 inline-flex 와 hidden 이 부딪히지 않게 감싸는 요소에서 보이기를 정한다 */}
            <div className="hidden justify-self-end lg:block">
              <a {...linkProps('order')} className={buttonClassName({ variant: 'primary', size: 'md', pill: true })}>
                신청하기
              </a>
            </div>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={clsx('relative flex size-11 items-center justify-center text-text-primary lg:hidden', focusRing)}
              aria-label="메뉴"
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
            >
              {count > 0 && (
                <span className="absolute -right-1 -top-1">
                  <CountBadge count={count} />
                </span>
              )}
              {menuOpen ? <Icon name="close" size={20} /> : <Icon name="menu" />}
            </button>
          </nav>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} currentPage={currentPage} count={count} linkProps={linkProps} />
    </>
  );
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  currentPage: PageType;
  count: number;
  linkProps: (page: PageType) => Record<string, unknown>;
}

function MobileMenu({ open, onClose, currentPage, count, linkProps }: MobileMenuProps) {
  const itemClass = (page: PageType) =>
    clsx(
      'flex min-h-11 w-full items-center justify-between rounded-button px-4 py-3 text-title5 transition-colors',
      currentPage === page ? 'bg-brand-50 text-brand' : 'text-text-primary hover:bg-background-100',
      focusRing,
    );
  return (
    <div
      id="site-mobile-menu"
      className={clsx('fixed inset-0 z-40 transition-opacity duration-300 lg:hidden', open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
      role="dialog"
      aria-modal="true"
      aria-label="네비게이션 메뉴"
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden="true" />
      <div className={clsx('absolute bottom-0 right-0 top-0 w-[280px] overflow-y-auto bg-background-white transition-transform duration-300', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex flex-col gap-2 p-6 pb-[calc(32px+env(safe-area-inset-bottom))] pt-[calc(var(--ds-header-offset)+var(--ds-header-height)+16px)]">
          <a {...linkProps('home')} tabIndex={open ? 0 : -1} className={itemClass('home')}>홈</a>
          {NAV_ITEMS.map((item) => (
            <a key={item.id} {...linkProps(item.id)} tabIndex={open ? 0 : -1} className={itemClass(item.id)}>
              <span>{item.label}</span>
              {item.id === 'estimate' && count > 0 && <CountBadge count={count} />}
            </a>
          ))}
          <div className="my-3 h-px bg-border-100" />
          <a {...linkProps('order')} tabIndex={open ? 0 : -1} className={buttonClassName({ variant: 'primary', size: 'md', pill: true, fullWidth: true })}>
            신청하기
          </a>
        </div>
      </div>
    </div>
  );
}
