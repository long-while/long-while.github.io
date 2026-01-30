import { useState, useRef, useEffect } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';
import { MenuIcon, CloseIcon, ChevronDownIcon } from '@/app/components/icons';
import type { NavigationProps, MenuItem } from '@/app/types/navigation';

interface DropdownGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items } = useEstimate();

  // 드롭다운 그룹 정의
  const menuGroups: DropdownGroup[] = [
    {
      id: 'services',
      label: '서비스',
      items: [
        { id: 'server', label: '서버 설치 커미션' },
        { id: 'bot', label: '자동봇 커미션' },
      ]
    },
    {
      id: 'info',
      label: '안내',
      items: [
        { id: 'faq', label: '자주 묻는 질문' },
        { id: 'terms', label: '약관 및 안내' },
        { id: 'crepe', label: '크레페', isExternal: true, url: 'https://crepe.cm/@longwhile/lw5w0ofg' },
      ]
    }
  ];

  // 주요 CTA (드롭다운 외부)
  const primaryActions: MenuItem[] = [
    { id: 'estimate', label: '견적', badge: items.length > 0 ? items.length : undefined },
    { id: 'order', label: '신청서 작성', isPrimary: true },
  ];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (item: MenuItem) => {
    if (item.isExternal && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(item.id);
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (groupId: string) => {
    setOpenDropdown(openDropdown === groupId ? null : groupId);
  };

  const toggleMobileGroup = (groupId: string) => {
    setMobileExpandedGroup(mobileExpandedGroup === groupId ? null : groupId);
  };

  // 현재 페이지가 특정 그룹에 속하는지 확인
  const isGroupActive = (group: DropdownGroup) => {
    return group.items.some(item => item.id === currentPage);
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
              className="text-[20px] font-medium tracking-[-0.01em] hover:text-[var(--brand-primary)] transition-colors"
            >
              한참 코딩 커미션 [TEST]
            </button>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
              {/* 드롭다운 그룹 */}
              {menuGroups.map((group) => (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(group.id)}
                    className={`flex items-center gap-1 px-4 py-2 text-[14px] hover:text-[var(--brand-primary)] transition-colors ${
                      isGroupActive(group) ? 'text-[var(--brand-primary)]' : 'text-foreground'
                    }`}
                  >
                    {group.label}
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === group.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* 드롭다운 메뉴 */}
                  {openDropdown === group.id && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item)}
                          className={`w-full text-left px-4 py-3 text-[14px] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)] transition-colors flex items-center justify-between ${
                            currentPage === item.id ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)]' : 'text-foreground'
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.isExternal && (
                            <span className="text-[12px] text-foreground/50">↗</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 구분선 */}
              <div className="w-px h-6 bg-black/10 mx-2" />

              {/* 주요 CTA */}
              {primaryActions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`px-4 py-2 text-[14px] transition-all relative ${
                    item.isPrimary 
                      ? 'bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-primary-hover)] ml-2' 
                      : currentPage === item.id 
                        ? 'text-[var(--brand-primary)]' 
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
              className="md:hidden p-2 hover:text-[var(--brand-primary)] transition-colors relative"
              aria-label="메뉴"
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
      >
        {/* 오버레이 */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* 슬라이딩 메뉴 - 오른쪽에서 */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white border-l-2 border-black transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-[24px] font-medium">메뉴</h2>
            </div>

            <nav className="space-y-2">
              {/* 홈 */}
              <button
                onClick={() => handleMenuClick({ id: 'home', label: '홈' })}
                className={`w-full text-left px-4 py-3 text-[16px] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)] transition-colors rounded ${
                  currentPage === 'home' ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)]' : 'text-foreground'
                }`}
              >
                홈
              </button>

              {/* 드롭다운 그룹 */}
              {menuGroups.map((group) => (
                <div key={group.id}>
                  <button
                    onClick={() => toggleMobileGroup(group.id)}
                    className={`w-full text-left px-4 py-3 text-[16px] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)] transition-colors rounded flex items-center justify-between ${
                      isGroupActive(group) ? 'text-[var(--brand-primary)]' : 'text-foreground'
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${mobileExpandedGroup === group.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* 펼쳐진 메뉴 */}
                  {mobileExpandedGroup === group.id && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-black/10 pl-4">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item)}
                          className={`w-full text-left px-4 py-2 text-[15px] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-primary)] transition-colors rounded flex items-center justify-between ${
                            currentPage === item.id ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)]' : 'text-foreground/80'
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.isExternal && (
                            <span className="text-[12px] text-foreground/50">↗</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 구분선 */}
              <div className="h-px bg-black/10 my-4" />

              {/* 주요 CTA */}
              {primaryActions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full text-left px-4 py-3 text-[16px] transition-colors rounded flex items-center justify-between ${
                    item.isPrimary 
                      ? 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]' 
                      : currentPage === item.id 
                        ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)]' 
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