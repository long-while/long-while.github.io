interface ServiceCardsProps {
  onNavigate: (page: string) => void;
}

export default function ServiceCards({ onNavigate }: ServiceCardsProps) {
  return (
    <section className="py-15">
      <div className="mb-16 border-b-2 border-black pb-4">
        <h2 className="text-[32px] tracking-[-0.01em] font-semibold">
          커미션 서비스
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => onNavigate('server')}
          className="p-12 hover:bg-[#fff5eb] transition-all text-left group"
        >
          <div className="text-[12px] font-mono text-[#ff7b00] mb-6">01</div>
          <h3 className="text-[32px] mb-4 tracking-[-0.01em]">
            서버 설치 &<br/>테마 커스터마이징
          </h3>
          <p className="text-[16px] leading-[1.8] text-foreground/60 mb-8">
            구글 클라우드 플랫폼을 이용한 마스토돈 서버 설치 및 테마 커스터마이징 서비스
          </p>
          <div className="flex items-center gap-3 text-[14px] text-[#ff7b00] group-hover:gap-4 transition-all">
            <span>자세히 보기</span>
            <span className="text-[18px]">→</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('bot')}
          className="p-12 hover:bg-[#fff5eb] transition-all text-left group"
        >
          <div className="text-[12px] font-mono text-[#ff7b00] mb-6">02</div>
          <h3 className="text-[32px] mb-4 tracking-[-0.01em]">
            자동봇<br/>커미션
          </h3>
          <p className="text-[16px] leading-[1.8] text-foreground/60 mb-8">
            커뮤니티 운영을 돕는 다양한 타입의 자동봇 제작 서비스
          </p>
          <div className="flex items-center gap-3 text-[14px] text-[#ff7b00] group-hover:gap-4 transition-all">
            <span>자세히 보기</span>
            <span className="text-[18px]">→</span>
          </div>
        </button>
      </div>
    </section>
  );
}