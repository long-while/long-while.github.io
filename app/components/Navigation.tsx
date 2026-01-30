import { useState } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { MenuIcon, CloseIcon } from '@/app/components/icons';
import type { NavigationProps, MenuItem, PageType } from '@/app/types/navigation';

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items } = useEstimate();

  // 플랫 네비게이션 메뉴 (드롭다운 제거)
  const navItems: MenuItem[] = [
    { id: 'server', label: '서버 커미션' },
    { id: 'bot', label: '자동봇' },
    { id: 'faq', label: 'FAQ' },
  ];

  // 주요 CTA
  const primaryActions: MenuItem[] = [
    { id: 'estimate', label: items.length > 0 ? '견적 확인' : '견적', badge: items.length > 0 ? items.length : undefined },
    { id: 'order', label: '신청하기', isPrimary: true },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.isExternal && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(item.id as PageType);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 데스크톱 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <button
              onClick={() => onNavigate('home')}
              className="text-[20px] font-medium tracking-[-0.01em] hover:text-[var(--brand-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
            >
              한참 커미션
            </button>

            {/* 데스크톱 메뉴 - 플랫 네비게이션 */}
            <div className="hidden md:flex items-center gap-1">
              {/* 플랫 메뉴 아이템 */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`px-4 py-2 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2 rounded ${
                    currentPage === item.id 
                      ? 'text-[var(--brand-primary)] font-medium' 
                      : 'text-foreground hover:text-[var(--brand-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* 구분선 */}
              <div className="w-px h-6 bg-black/10 mx-2" />

              {/* 주요 CTA */}
              {primaryActions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`px-4 py-2 text-[14px] transition-all relative focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2 ${
                    item.isPrimary 
                      ? 'bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-primary-hover)] ml-2' 
                      : currentPage === item.id 
                        ? 'text-[var(--brand-primary)] font-medium' 
                        : 'text-foreground hover:text-[var(--brand-primary)]'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span 
                      className={`absolute -top-1 -right-1 text-[11px] font-mono w-5 h-5 rounded-full flex items-center justify-center ${
                        item.isPrimary ? 'bg-white text-[var(--brand-primary)]' : 'bg-[var(--brand-primary)] text-white'
                      }`}
                      role="status"
                      aria-live="polite"
                      aria-label={`견적에 ${item.badge}개 항목이 담겨있습니다`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 모바일 햄버거 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-[var(--brand-primary)] transition-colors relative focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
              aria-label="메뉴"
              aria-expanded={isMobileMenuOpen}
            >
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--brand-primary)] text-white text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 슬라이딩 메뉴 */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="네비게이션 메뉴"
      >
        {/* 오버레이 */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* 슬라이딩 메뉴 - 오른쪽에서 */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white border-l-2 border-black transition-transform duration-300 overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-8 pb-[calc(32px+env(safe-area-inset-bottom))]">
            <div className="mb-8">
              <h2 className="text-[24px] font-medium">메뉴</h2>
            </div>

            <nav className="space-y-2">
              {/* 홈 */}
              <button
                onClick={() => handleMenuClick({ id: 'home', label: '홈' })}
                className={`w-full text-left px-4 py-3 min-h-[44px] text-[16px] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)] transition-colors rounded focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2 ${
                  currentPage === 'home' ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)] font-medium' : 'text-foreground'
                }`}
              >
                홈
              </button>

              {/* 플랫 네비게이션 메뉴 */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full text-left px-4 py-3 min-h-[44px] text-[16px] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)] transition-colors rounded focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2 ${
                    currentPage === item.id 
                      ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)] font-medium' 
                      : 'text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* 구분선 */}
              <div className="h-px bg-black/10 my-4" />

              {/* 주요 CTA */}
              {primaryActions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full text-left px-4 py-3 min-h-[44px] text-[16px] transition-colors rounded flex items-center justify-between focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2 ${
                    item.isPrimary 
                      ? 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]' 
                      : currentPage === item.id 
                        ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)] font-medium' 
                        : 'text-foreground hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[12px] font-mono px-2 py-0.5 rounded-full ${
                      item.isPrimary ? 'bg-white/20 text-white' : 'bg-[var(--brand-primary)] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}