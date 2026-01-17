interface FooterProps {
  onNavigate: (page: 'home' | 'estimate' | 'server' | 'bot') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-12">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-4 border-2 border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[15px]"
          >
            홈으로
          </button>
          <button
            onClick={() => onNavigate('estimate')}
            className="px-6 py-4 border-2 border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[15px]"
          >
            나의 견적
          </button>
          <button
            onClick={() => onNavigate('server')}
            className="px-6 py-4 border-2 border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[15px]"
          >
            서버 커미션
          </button>
          <button
            onClick={() => onNavigate('bot')}
            className="px-6 py-4 border-2 border-black/10 hover:border-[#ff7b00] hover:bg-[#fff5eb] transition-all text-[15px]"
          >
            자동봇 커미션
          </button>
          <a
            href="https://crepe.cm/@longwhile/lw5w0ofg"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 border-2 border-[#ff7b00] bg-[#ff7b00] text-white hover:bg-[#e66d00] hover:border-[#e66d00] transition-all text-[15px] text-center col-span-2 md:col-span-1"
          >
            커미션 신청
          </a>
        </div>
      </div>
    </footer>
  );
}