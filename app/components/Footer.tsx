import type { FooterProps } from '@/app/types/navigation';
import { ExternalLinkIcon } from '@/app/components/icons';

export default function Footer({ onNavigate }: FooterProps) {
  const footerLinkClass = "text-[14px] text-foreground/70 hover:text-[var(--brand-primary)] transition-colors block py-1";
  
  return (
    <footer className="mt-12 bg-black/[0.02] border-t-2 border-black">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* 브랜드 섹션 */}
        <div className="mb-10">
          <button
            onClick={() => onNavigate('home')}
            className="text-[24px] font-bold tracking-[-0.01em] hover:text-[var(--brand-primary)] transition-colors"
          >
            한참 코딩 커미션
          </button>
          <p className="text-[14px] text-foreground/60 mt-2 max-w-[400px]">
            마스토돈 자캐커뮤를 위한 코딩 커미션.<br />
            서버 설치부터 자동봇까지 한번에.
          </p>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-black/10 mb-10" />

        {/* 3컬럼 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* 서비스 */}
          <div>
            <h3 className="text-[14px] font-semibold mb-4 text-foreground/90">서비스</h3>
            <nav className="space-y-1">
              <button onClick={() => onNavigate('server')} className={footerLinkClass}>
                서버 설치 커미션
              </button>
              <button onClick={() => onNavigate('bot')} className={footerLinkClass}>
                자동봇 커미션
              </button>
              <button onClick={() => onNavigate('estimate')} className={footerLinkClass}>
                나의 견적
              </button>
              <button onClick={() => onNavigate('order')} className={footerLinkClass}>
                신청서 작성
              </button>
            </nav>
          </div>

          {/* 안내 */}
          <div>
            <h3 className="text-[14px] font-semibold mb-4 text-foreground/90">안내</h3>
            <nav className="space-y-1">
              <button onClick={() => onNavigate('faq')} className={footerLinkClass}>
                자주 묻는 질문
              </button>
              <button onClick={() => onNavigate('terms')} className={footerLinkClass}>
                약관 및 안내
              </button>
              <a
                href="https://crepe.cm/@longwhile/lw5w0ofg"
                target="_blank"
                rel="noopener noreferrer"
                className={`${footerLinkClass} inline-flex items-center gap-1`}
              >
                크레페 커미션 페이지
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </nav>
          </div>

          {/* 문의 */}
          <div>
            <h3 className="text-[14px] font-semibold mb-4 text-foreground/90">문의</h3>
            <div className="space-y-2 text-[14px] text-foreground/70">
              <a
                href="https://crepe.cm/@longwhile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[var(--brand-primary)] transition-colors"
              >
                크레페 DM
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
              <p className="text-foreground/50">
                운영: 평일 10:00 - 22:00
              </p>
              <p className="text-[13px] text-foreground/40">
                답변은 평일 기준 1~2일 내에 드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-black/10 mb-6" />

        {/* 저작권 */}
        <div className="text-[13px] text-foreground/40 text-center">
          <p>© 2025 한참 코딩 커미션. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}