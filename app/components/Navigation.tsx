import { useState } from 'react';
import { useEstimate } from '@/app/contexts/EstimateContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items } = useEstimate();

  const menuItems = [
    { id: 'home', label: '홈' },
    { id: 'estimate', label: '견적 확인하기', badge: items.length > 0 ? items.length : undefined },
    { id: 'server', label: '서버 설치 커미션' },
    { id: 'bot', label: '자동봇 커미션' },
    { id: 'faq', label: '자주 묻는 질문' },
    { id: 'terms', label: '약관 및 안내' },
    { id: 'crepe', label: '크레페로 이동', isExternal: true, url: 'https://crepe.cm/@longwhile/lw5w0ofg' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.isExternal && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(item.id);
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
              className="text-[20px] font-medium tracking-[-0.01em] hover:text-[#ff7b00] transition-colors"
            >
              한참 코딩 커미션
            </button>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`px-4 py-2 text-[14px] hover:text-[#ff7b00] transition-colors relative ${
                    currentPage === item.id ? 'text-[#ff7b00]' : 'text-foreground'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff7b00] text-white text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {item.isExternal && (
                    <span className="ml-1 text-[12px]">↗</span>
                  )}
                </button>
              ))}
            </div>

            {/* 모바일 햄버거 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:text-[#ff7b00] transition-colors relative"
              aria-label="메뉴"
            >
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff7b00] text-white text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
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
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full text-left px-4 py-3 text-[16px] hover:bg-[#fff5eb] hover:text-[#ff7b00] transition-colors rounded flex items-center justify-between ${
                    currentPage === item.id ? 'bg-[#fff5eb] text-[#ff7b00]' : 'text-foreground'
                  }`}
                >
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-[#ff7b00] text-white text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {item.isExternal && (
                      <span className="text-[14px]">↗</span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}