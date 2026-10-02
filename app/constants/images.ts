/**
 * 최적화된 시안 이미지 (자동 생성: design/prep/scripts/optimize_images.mjs — 직접 고치지 말 것).
 * width·height 는 파일의 실제 픽셀 크기. <img> 에 그대로 넣어 레이아웃 흔들림(CLS)을 막는다.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  /** 화면 크기별 파일 (작은 화면은 작은 파일). sizes 와 함께 <img> 에 넣는다 */
  srcSet?: string;
}

export const IMAGES = {
  homeHero: { src: '/images/home-hero.webp', width: 3840, height: 1960, srcSet: '/images/home-hero-960w.webp 960w, /images/home-hero-1920w.webp 1920w, /images/home-hero.webp 3840w' },
  homeCtaBg: { src: '/images/home-cta-bg.webp', width: 1600, height: 617 },
  homeServiceServer: { src: '/images/home-service-server.webp', width: 1296, height: 720, srcSet: '/images/home-service-server-648w.webp 648w, /images/home-service-server.webp 1296w' },
  homeServiceBot: { src: '/images/home-service-bot.webp', width: 1296, height: 720, srcSet: '/images/home-service-bot-648w.webp 648w, /images/home-service-bot.webp 1296w' },
  homeFeature01: { src: '/images/home-feature-01.webp', width: 152, height: 114 },
  homeFeature02: { src: '/images/home-feature-02.webp', width: 128, height: 144 },
  homeFeature03: { src: '/images/home-feature-03.webp', width: 152, height: 80 },
  homeFeature04: { src: '/images/home-feature-04.webp', width: 152, height: 110 },
  homeFeature05: { src: '/images/home-feature-05.webp', width: 127, height: 144 },
  homeFeature06: { src: '/images/home-feature-06.webp', width: 143, height: 129 },
  homeFeature07: { src: '/images/home-feature-07.webp', width: 147, height: 125 },
  homeFeature08: { src: '/images/home-feature-08.webp', width: 139, height: 132 },
  homeFeature09: { src: '/images/home-feature-09.webp', width: 152, height: 102 },
  homeFeature10: { src: '/images/home-feature-10.webp', width: 145, height: 127 },
  homeStep01: { src: '/images/home-step-01.webp', width: 280, height: 280 },
  homeStep02: { src: '/images/home-step-02.webp', width: 280, height: 280 },
  homeStep03: { src: '/images/home-step-03.webp', width: 280, height: 280 },
  homeStep04: { src: '/images/home-step-04.webp', width: 280, height: 280 },
  serverHero: { src: '/images/server-hero.webp', width: 3840, height: 1200, srcSet: '/images/server-hero-960w.webp 960w, /images/server-hero-1920w.webp 1920w, /images/server-hero.webp 3840w' },
  botHero: { src: '/images/bot-hero.webp', width: 3840, height: 1200, srcSet: '/images/bot-hero-960w.webp 960w, /images/bot-hero-1920w.webp 1920w, /images/bot-hero.webp 3840w' },
  botType01: { src: '/images/bot-type-01.webp', width: 100, height: 111 },
  botType02: { src: '/images/bot-type-02.webp', width: 112, height: 110 },
  botType03: { src: '/images/bot-type-03.webp', width: 94, height: 111 },
  botType04: { src: '/images/bot-type-04.webp', width: 88, height: 111 },
  botType05: { src: '/images/bot-type-05.webp', width: 98, height: 110 },
  faqHero: { src: '/images/faq-hero.webp', width: 3840, height: 1200, srcSet: '/images/faq-hero-960w.webp 960w, /images/faq-hero-1920w.webp 1920w, /images/faq-hero.webp 3840w' },
  termsHero: { src: '/images/terms-hero.webp', width: 3840, height: 1200, srcSet: '/images/terms-hero-960w.webp 960w, /images/terms-hero-1920w.webp 1920w, /images/terms-hero.webp 3840w' },
  termsFee: { src: '/images/terms-fee.webp', width: 1176, height: 680 },
  termsQuestion: { src: '/images/terms-question.webp', width: 1176, height: 680 },
  termsTheme: { src: '/images/terms-theme.webp', width: 1176, height: 680 },
  termsRefund: { src: '/images/terms-refund.webp', width: 1176, height: 680 },
  termsFast: { src: '/images/terms-fast.webp', width: 1176, height: 680 },
  termsMaintenance: { src: '/images/terms-maintenance.webp', width: 1176, height: 680 },
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
