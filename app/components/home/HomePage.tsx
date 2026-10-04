/**
 * 메인페이지 (시안 '메인페이지' 29:352, file.json 실측). 문구는 기존 사이트 그대로 (Q9).
 *  히어로 980 (헤더가 위에 뜸, P1) → 120 → [서비스 · 특징 · 진행 순서(배경 #F1F6FD) · FAQ · CTA(배경 이미지)], 섹션 간격 160 → 푸터.
 *  모바일(<1024): 섹션 간격 80, 위 여백 60, 진행 순서·CTA 패딩 60·80 (Q1).
 */
import { type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import {
  AccordionItem, BrandWordmark, FeatureCard, Icon, LinkCard, ProcessStep, SectionTitle, ServiceCard, buttonClassName,
} from '@/app/components/ds';
import { FAQ_ITEMS } from '@/app/components/faq/faqContent';
import { IMAGES, type SiteImage } from '@/app/constants/images';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction, PageType } from '@/app/types/navigation';
import { FEATURES, SIMPLE_STEPS } from './homeContent';

interface HomeProps {
  onNavigate: NavigateFunction;
}

/** 이미지 파일은 표시 크기의 2배라서, 시안 표시 크기 = 파일 크기의 절반 */
function halfSize(image: SiteImage): CSSProperties {
  return { width: image.width / 2, height: image.height / 2 };
}

function Img({ image, alt = '', priority = false, sizes, className, style }: { image: SiteImage; alt?: string; priority?: boolean; sizes?: string; className?: string; style?: CSSProperties }) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes ?? '100vw' : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // fetchpriority 는 React 18 타입에 없어 소문자 속성으로 넘긴다
      {...(priority ? { fetchpriority: 'high' } : {})}
      className={className}
      style={style}
      // 장식 그림(alt 없음)이 못 오면 깨진 그림 표시 대신 숨긴다. 뒤에 같은 색 바탕이 깔려 있어 티가 나지 않음 (4단계 리뷰)
      onError={alt === '' ? (e) => { e.currentTarget.style.visibility = 'hidden'; } : undefined}
    />
  );
}

function scrollToServices() {
  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 모바일(1024px 미만) 전용 세로 히어로 그림 (사용자 제공, 3792×6636 원본을 WebP 로 줄임).
 * 가로 그림을 세로 화면에 채우면 양옆이 크게 잘렸다. images.ts 는 스크립트가 자동으로 만드는 파일이라 여기에 둔다
 */
const HOME_HERO_MOBILE: SiteImage = {
  src: '/images/home-hero-mobile-1080w.webp',
  width: 1080,
  height: 1890,
  srcSet: '/images/home-hero-mobile-720w.webp 720w, /images/home-hero-mobile-1080w.webp 1080w, /images/home-hero-mobile-1440w.webp 1440w',
};

function HomeHero() {
  return (
    <section className="relative flex min-h-[600px] items-end overflow-hidden bg-gradient-brand-hero lg:min-h-[980px]">
      {/* 모든 너비에서 비율을 지키며 잘라 채움(다른 페이지 배너처럼 확대). 1920×980 에서는 원본 비율과 같아 잘리는 곳 없음 (사용자 요청: 늘려 채우면 좁은 창에서 찌그러짐).
          모바일은 세로 그림으로 바꾸고, 글자가 덮는 아래쪽보다 구름·로봇이 있는 가운데 위쪽이 보이게 맞춘다 */}
      <picture>
        <source media="(max-width: 1023.98px)" srcSet={HOME_HERO_MOBILE.srcSet} sizes="100vw" width={HOME_HERO_MOBILE.width} height={HOME_HERO_MOBILE.height} />
        <Img image={IMAGES.homeHero} priority className="absolute inset-0 size-full object-cover max-lg:object-[50%_35%]" />
      </picture>
      {/* 시안 Rectangle 33543: 높이 59.5% 부터 아래로 #4977D3 0→100%. 모바일은 글이 차지하는 비율이 커서 30% 부터 */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,#4977D3_100%)] lg:bg-[linear-gradient(180deg,transparent_59.5%,#4977D3_100%)]" aria-hidden="true" />
      {/* 글자가 놓이는 왼쪽 아래만 조금 더 어둡게: 밝은 일러스트 위 흰 글자 대비가 낮았다 (4단계 리뷰) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_15%_100%,rgba(30,64,150,0.55),transparent_70%)]" aria-hidden="true" />
      <div className="container-ds relative pb-12 [text-shadow:0_1px_12px_rgba(20,45,110,0.35)] lg:pb-[68px]">
        <div className="flex max-w-[621px] flex-col gap-5">
          {/* 사용자 제공 '한참 커미션' 글자 로고(흰색). 기존 제목 글자(display 48/모바일 28)와 같은 높이. 읽는 글자는 그대로 */}
          <h1 className="text-text-inverse">
            <BrandWordmark className="block h-7 lg:h-12" />
            <span className="sr-only">한참 커미션</span>
          </h1>
          <p className="text-body1 text-text-inverse">
            마스토돈 자캐커뮤를 위한 코딩 커미션<br />
            서버 설치부터 자동봇까지 한번에
          </p>
          <ul className="flex flex-wrap gap-2">
            {/* '3개월 무료 서버비'는 서버비가 계속 무료인 것처럼 읽혀서, 구글 무료 크레딧임을 밝힘 (4단계 리뷰) */}
            {['3개월 서버비 0원', '무료 유지보수', '1:1 맞춤 설정'].map((badge) => (
              <li key={badge} className="rounded-pill border border-background-white/20 bg-background-white/10 px-4 py-2 text-body3 text-text-inverse backdrop-blur-sm">
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={scrollToServices}
        aria-label="아래로 스크롤"
        className="absolute bottom-6 left-1/2 hidden size-11 -translate-x-1/2 animate-bounce items-center justify-center rounded-pill border border-background-white/20 bg-background-white/10 text-text-inverse backdrop-blur-sm hover:bg-background-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse motion-reduce:animate-none lg:flex"
      >
        <Icon name="chevron-down" size={20} />
      </button>
    </section>
  );
}

function ctaProps(page: PageType, onNavigate: NavigateFunction) {
  const { href, onClick } = navLinkProps(page, onNavigate);
  return { href, onClick: onClick as (event: MouseEvent<HTMLAnchorElement>) => void };
}

function Services({ onNavigate }: HomeProps) {
  const server = ctaProps('server', onNavigate);
  const bot = ctaProps('bot', onNavigate);
  return (
    <section id="services-section" className="container-ds scroll-mt-header flex flex-col items-center gap-10">
      <SectionTitle eyebrow="SERVICE" title="커미션 서비스" />
      <div className="grid w-full grid-cols-1 justify-items-center gap-10 lg:grid-cols-2 lg:gap-6">
        <ServiceCard image={IMAGES.homeServiceServer.src} srcSet={IMAGES.homeServiceServer.srcSet} title={<>서버 설치 &amp; 테마 커스텀</>}
          description="마스토돈 자체 서버를 개설해 드려요." ctaLabel="자세히 보기" href={server.href} onCtaClick={server.onClick} />
        <ServiceCard image={IMAGES.homeServiceBot.src} srcSet={IMAGES.homeServiceBot.srcSet} title="자동봇 커미션"
          description="커뮤 운영을 돕는 자동봇을 만들어 드려요." ctaLabel="자세히 보기" href={bot.href} onCtaClick={bot.onClick} />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="container-ds flex flex-col items-center gap-10">
      <SectionTitle eyebrow="POINT" title="한참 마스토돈만의 특징" />
      {/* 시안: 칸 사이에만 #DDD 선 (바깥 선 없음). 1px 간격 + 선 색 바탕으로 그린다. 칸 수가 늘 꽉 차도록 2열/5열 */}
      <div className="grid w-full grid-cols-2 gap-px bg-border-100 lg:grid-cols-5">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} className="bg-background-white"
            icon={<Img image={IMAGES[f.image]} style={halfSize(IMAGES[f.image])} className="object-contain" />}
            title={f.title} />
        ))}
      </div>
    </section>
  );
}

// '자세한 진행 과정 (8단계)' 펼침은 위 4단계·FAQ 와 겹쳐 뺐다 (4단계 문구 정리 T9)
function Process({ onNavigate }: HomeProps) {
  const order = navLinkProps('order', onNavigate);
  return (
    <section className="bg-background-brand py-[60px] lg:py-[120px]">
      <div className="container-ds flex flex-col items-center gap-[60px]">
        <div className="flex w-full flex-col items-center gap-10">
          <SectionTitle eyebrow="PROGRESS" title="커미션 진행 순서" />
          <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SIMPLE_STEPS.map((step) => (
              <ProcessStep key={step.number} step={`STEP ${step.number}`} title={step.title} description={step.description}
                icon={<Img image={IMAGES[step.image]} style={halfSize(IMAGES[step.image])} className="object-contain" />} />
            ))}
          </div>
        </div>
        <a {...order} className={buttonClassName({ variant: 'primary', size: 'lg' })}>
          신청서 작성하기
        </a>
      </div>
    </section>
  );
}

function HomeFaq({ onNavigate }: HomeProps) {
  const featured = FAQ_ITEMS.filter((item) => item.featured);
  const faq = navLinkProps('faq', onNavigate);
  return (
    <section className="container-ds flex flex-col items-center gap-[60px]">
      <div className="flex w-full flex-col items-center gap-10">
        <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
        <div className="w-full border-t border-border-100">
          {featured.map((item, index) => (
            <AccordionItem key={item.question} index={index + 1} defaultOpen={index === 0}
              question={item.question} answer={item.answerNode ?? item.answer} />
          ))}
        </div>
      </div>
      <a {...faq} className={buttonClassName({ variant: 'white', size: 'lg' })}>
        전체 FAQ {FAQ_ITEMS.length}개 보기 →
      </a>
    </section>
  );
}

function HomeCta({ onNavigate }: HomeProps) {
  const server = ctaProps('server', onNavigate);
  const bot = ctaProps('bot', onNavigate);
  return (
    <section className="relative overflow-hidden bg-gradient-brand-soft py-20 lg:py-40">
      <Img image={IMAGES.homeCtaBg} className="absolute inset-0 size-full object-cover" />
      <div className="container-ds relative flex flex-col items-center gap-10 lg:gap-20">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-hero-lg text-text-primary">준비되셨나요?</h2>
          <p className="text-title3 text-text-secondary">
            옵션을 골라 예상 금액을 확인해 보세요.<br className="lg:hidden" />{' '}
            담은 견적은 신청서에 그대로 들어가요.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <LinkCard eyebrow="SERVER" title="서버 커미션 견적 내기" {...server} />
          <LinkCard eyebrow="BOT" title="자동봇 커미션 견적 내기" {...bot} />
        </div>
      </div>
    </section>
  );
}

export function HomePage({ onNavigate }: HomeProps) {
  return (
    <main id="main" tabIndex={-1} className="bg-background-white outline-none">
      <HomeHero />
      <Sections>
        <Services onNavigate={onNavigate} />
        <Features />
        <Process onNavigate={onNavigate} />
        <HomeFaq onNavigate={onNavigate} />
      </Sections>
      <HomeCta onNavigate={onNavigate} />
    </main>
  );
}

/** 히어로 아래 120(모바일 60), 섹션 간격 160(모바일 80), 마지막 섹션과 CTA 사이도 160 */
function Sections({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-20 pb-20 pt-[60px] lg:gap-40 lg:pb-40 lg:pt-[120px]">{children}</div>;
}
