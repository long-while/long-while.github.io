import type { FooterProps } from '@/app/types/navigation';

export default function Footer({ onNavigate }: FooterProps) {
  const footerLinkClass = "text-[16px] font-medium text-black hover:text-[var(--brand-primary)] transition-colors";
  
  return (
    <footer className="mt-12">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <button onClick={() => onNavigate('home')} className={footerLinkClass}>
            홈으로
          </button>
          <button onClick={() => onNavigate('order')} className={footerLinkClass}>
            신청서 작성
          </button>
          <button onClick={() => onNavigate('estimate')} className={footerLinkClass}>
            나의 견적
          </button>
          <button onClick={() => onNavigate('server')} className={footerLinkClass}>
            서버 커미션
          </button>
          <button onClick={() => onNavigate('bot')} className={footerLinkClass}>
            자동봇 커미션
          </button>
          <a
            href="https://crepe.cm/@longwhile/lw5w0ofg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[16px] font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
          >
            커미션 신청하러 가기!
          </a>
        </div>
      </div>
    </footer>
  );
}