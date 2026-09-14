import FAQ from '@/app/components/FAQ';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';

interface FaqPageProps {
  onNavigate: NavigateFunction;
}

/**
 * FAQ 전용 페이지 (/faq/)
 * 메인에는 대표 질문 4개만 남기고, 전체 15개는 분류별로 이 페이지에서 보여준다.
 */
export default function FaqPage({ onNavigate }: FaqPageProps) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="max-w-[1060px] mx-auto px-8 py-16">
        <p className="text-[15px] leading-[1.8] text-foreground/70 mb-10 max-w-4xl">
          커미션 신청 전에 많이 주시는 질문을 모았습니다. 찾는 내용이 없다면{' '}
          <a
            href="https://crepe.cm/@longwhile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-primary)] font-semibold hover:underline"
          >
            크레페 DM
          </a>
          으로 문의해 주세요.
        </p>

        <FAQ
          grouped
          collapsible
          headingLevel="h1"
          footer={
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
              <a
                {...navLinkProps('terms', onNavigate)}
                className="text-[15px] text-[var(--brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
              >
                이용안내 보기 →
              </a>
              <a
                {...navLinkProps('server', onNavigate)}
                className="text-[15px] text-[var(--brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
              >
                서버 커미션 보기 →
              </a>
              <a
                {...navLinkProps('bot', onNavigate)}
                className="text-[15px] text-[var(--brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
              >
                자동봇 커미션 보기 →
              </a>
            </div>
          }
        />
      </div>
    </div>
  );
}
