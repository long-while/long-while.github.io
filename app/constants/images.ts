/**
 * 최적화된 시안 이미지 (자동 생성: design/prep/scripts/optimize_images.mjs — 직접 고치지 말 것).
 * width·height 는 파일의 실제 픽셀 크기. <img> 에 그대로 넣어 레이아웃 흔들림(CLS)을 막는다.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
}

export const IMAGES = {
  homeHero: { src: '/images/home-hero.webp', width: 1672, height: 941 },
  homeCtaBg: { src: '/images/home-cta-bg.webp', width: 1600, height: 617 },
  homeServiceServer: { src: '/images/home-service-server.webp', width: 1671, height: 928 },
  homeServiceBot: { src: '/images/home-service-bot.webp', width: 1670, height: 928 },
  homeFeature01: { src: '/images/home-feature-01.webp', width: 152, height: 80 },
  homeFeature02: { src: '/images/home-feature-02.webp', width: 152, height: 115 },
  homeFeature03: { src: '/images/home-feature-03.webp', width: 140, height: 157 },
  homeFeature04: { src: '/images/home-feature-04.webp', width: 152, height: 102 },
  homeFeature05: { src: '/images/home-feature-05.webp', width: 152, height: 125 },
  homeFeature06: { src: '/images/home-feature-06.webp', width: 152, height: 111 },
  homeFeature07: { src: '/images/home-feature-07.webp', width: 140, height: 142 },
  homeFeature08: { src: '/images/home-feature-08.webp', width: 140, height: 138 },
  homeFeature09: { src: '/images/home-feature-09.webp', width: 152, height: 138 },
  homeFeature10: { src: '/images/home-feature-10.webp', width: 141, height: 144 },
  homeStep01: { src: '/images/home-step-01.webp', width: 280, height: 280 },
  homeStep02: { src: '/images/home-step-02.webp', width: 280, height: 280 },
  homeStep03: { src: '/images/home-step-03.webp', width: 280, height: 280 },
  homeStep04: { src: '/images/home-step-04.webp', width: 280, height: 280 },
  serverHero: { src: '/images/server-hero.webp', width: 1673, height: 523 },
  botHero: { src: '/images/bot-hero.webp', width: 1672, height: 523 },
  botType01: { src: '/images/bot-type-01.webp', width: 100, height: 111 },
  botType02: { src: '/images/bot-type-02.webp', width: 112, height: 110 },
  botType03: { src: '/images/bot-type-03.webp', width: 94, height: 111 },
  botType04: { src: '/images/bot-type-04.webp', width: 88, height: 111 },
  botType05: { src: '/images/bot-type-05.webp', width: 98, height: 110 },
  faqHero: { src: '/images/faq-hero.webp', width: 2172, height: 679 },
  termsHero: { src: '/images/terms-hero.webp', width: 1672, height: 523 },
  termsFee: { src: '/images/terms-fee.webp', width: 1176, height: 680 },
  termsQuestion: { src: '/images/terms-question.webp', width: 1176, height: 680 },
  termsTheme: { src: '/images/terms-theme.webp', width: 1176, height: 680 },
  termsRefund: { src: '/images/terms-refund.webp', width: 1176, height: 680 },
  termsFast: { src: '/images/terms-fast.webp', width: 1176, height: 680 },
  termsMaintenance: { src: '/images/terms-maintenance.webp', width: 1176, height: 680 },
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
