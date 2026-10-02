/**
 * 메인페이지 (시안 '메인페이지' 29:352, file.json 실측). 문구는 기존 사이트 그대로 (Q9).
 *  히어로 980 (헤더가 위에 뜸, P1) → 120 → [서비스 · 특징 · 진행 순서(배경 #F1F6FD) · FAQ · CTA(배경 이미지)], 섹션 간격 160 → 푸터.
 *  모바일(<1024): 섹션 간격 80, 위 여백 60, 진행 순서·CTA 패딩 60·80 (Q1).
 */
import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import {
  AccordionItem, Button, FeatureCard, Icon, LinkCard, ProcessStep, SectionTitle, ServiceCard, buttonClassName,
} from '@/app/components/ds';
import { FAQ_ITEMS } from '@/app/components/faq/faqContent';
import { IMAGES, type SiteImage } from '@/app/constants/images';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction, PageType } from '@/app/types/navigation';
import { DETAILED_STEPS, FEATURES, SIMPLE_STEPS } from './homeContent';

interface HomeProps {
  onNavigate: NavigateFunction;
}

/** 이미지 파일은 표시 크기의 2배라서, 시안 표시 크기 = 파일 크기의 절반 */
function halfSize(image: SiteImage): CSSProperties {
  return { width: image.width / 2, height: image.height / 2 };
}

function Img({ image, alt = '', priority = false, className, style }: { image: SiteImage; alt?: string; priority?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <img
      src={image.src}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // fetchpriority 는 React 18 타입에 없어 소문자 속성으로 넘긴다
      {...(priority ? { fetchpriority: 'high' } : {})}
      className={className}
      style={style}
    />
  );
}

function scrollToServices() {
  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
}

function HomeHero() {
  return (
    <section className="relative flex min-h-[600px] items-end overflow-hidden bg-gradient-brand-hero lg:min-h-[980px]">
      {/* 시안 scaleMode STRETCH: 원본 전체를 상자에 늘려 채움. 모바일은 비율이 크게 달라 잘라 채움 */}
      <Img image={IMAGES.homeHero} priority className="absolute inset-0 size-full object-cover lg:object-fill" />
      {/* 시안 Rectangle 33543: 높이 59.5% 부터 아래로 #4977D3 0→100%. 모바일은 글이 차지하는 비율이 커서 30% 부터 */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,#4977D3_100%)] lg:bg-[linear-gradient(180deg,transparent_59.5%,#4977D3_100%)]" aria-hidden="true" />
      <div className="container-ds relative pb-12 lg:pb-[68px]">
        <div className="flex max-w-[621px] flex-col gap-5">
          <p className="font-inter text-eyebrow uppercase text-text-inverse-muted">LONGWHILE COMMISSION</p>
          <h1 className="text-display text-text-inverse">한참 커미션</h1>
          <p className="text-body1 text-text-inverse-muted">
            마스토돈 자캐커뮤를 위한 최고의 커미션<br />
            서버 설치부터 자동봇까지 한번에
          </p>
          <ul className="flex flex-wrap gap-2">
            {['3개월 무료 서버비', '무료 유지보수', '1:1 맞춤 설정'].map((badge) => (
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
        <ServiceCard image={IMAGES.homeServiceServer.src} title={<>서버 설치 &amp; 테마 커스텀</>}
          description="구글 클라우드 플랫폼을 이용한 마스토돈 서버 설치 및 커스텀 테마 제작" ctaLabel="자세히 보기" href={server.href} onCtaClick={server.onClick} />
        <ServiceCard image={IMAGES.homeServiceBot.src} title="자동봇 커미션"
          description="커뮤니티 운영을 돕는 다양한 타입의 자동봇 제작" ctaLabel="자세히 보기" href={bot.href} onCtaClick={bot.onClick} />
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
            title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
}

function DetailedSteps() {
  return (
    <ol className="flex w-full flex-col gap-6 rounded-card bg-background-white p-6 lg:p-10">
      {DETAILED_STEPS.map((step) => (
        <li key={step.number} className="flex items-baseline gap-6">
          <span className="shrink-0 text-caption2 text-brand">{step.number}</span>
          <div className="flex flex-col gap-2">
            <h3 className="text-title4 text-text-primary">{step.title}</h3>
            {step.details && (
              <ul className="flex flex-col gap-2">
                {step.details.map((detail) => (
                  <li key={detail} className="flex gap-3 text-body2 text-text-secondary">
                    <span className="shrink-0 text-brand" aria-hidden="true">—</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Process({ onNavigate }: HomeProps) {
  const [open, setOpen] = useState(false);
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
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="white" className="sm:w-[220px]" aria-expanded={open} aria-controls="home-detailed-steps" onClick={() => setOpen(!open)}
              trailingIcon={<Icon name="chevron-down" size={20} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />}>
              자세한 진행 과정 보기 (8단계)
            </Button>
            <a {...order} className={buttonClassName({ variant: 'primary', size: 'lg' })}>
              신청서 작성하기
            </a>
          </div>
          <div id="home-detailed-steps" hidden={!open} className="w-full">
            <DetailedSteps />
          </div>
        </div>
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
            원하는 옵션을 골라 예상 금액을 확인해 보세요.<br className="lg:hidden" />{' '}
            견적을 담아두면 신청서에 그대로 이어집니다.
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
    <main className="bg-background-white">
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
