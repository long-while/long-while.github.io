interface FooterProps {
  onNavigate: (page: 'home' | 'estimate' | 'server' | 'bot') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-12">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="text-[13px] text-foreground/60 hover:text-[#ff7b00] transition-colors"
          >
            홈으로
          </button>
          <button
            onClick={() => onNavigate('estimate')}
            className="text-[13px] text-foreground/60 hover:text-[#ff7b00] transition-colors"
          >
            나의 견적
          </button>
          <button
            onClick={() => onNavigate('server')}
            className="text-[13px] text-foreground/60 hover:text-[#ff7b00] transition-colors"
          >
            서버 커미션
          </button>
          <button
            onClick={() => onNavigate('bot')}
            className="text-[13px] text-foreground/60 hover:text-[#ff7b00] transition-colors"
          >
            자동봇 커미션
          </button>
          <a
            href="https://crepe.cm/@longwhile/lw5w0ofg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#ff7b00] hover:text-[#e66d00] transition-colors"
          >
            커미션 신청
          </a>
        </div>
      </div>
    </footer>
  );
}