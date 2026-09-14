import Terms from '@/app/components/Terms';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';

interface GuidePageProps {
  onNavigate: NavigateFunction;
}

/**
 * 이용안내 페이지 (/terms/)
 * 메인 하단에 있던 약관 및 기타 안내 6항목을 그대로 옮겨 왔다.
 */
export default function GuidePage({ onNavigate }: GuidePageProps) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="max-w-[1060px] mx-auto px-8 py-16">
        <p className="text-[15px] leading-[1.8] text-foreground/70 mb-10 max-w-4xl">
          커미션 진행에 적용되는 안내 사항입니다. 추가금이 발생하는 조건이 포함되어 있으니
          신청 전에 한 번 읽어 주세요.
        </p>

        <Terms title="이용안내" headingLevel="h1" showToc />

        <div className="flex flex-wrap gap-6 pt-6 mt-10 border-t border-border">
          <a
            {...navLinkProps('faq', onNavigate)}
            className="text-[15px] text-[var(--brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
          >
            자주 묻는 질문 보기 →
          </a>
          <a
            href="https://crepe.cm/@longwhile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] text-[var(--brand-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-2"
          >
            크레페 DM 문의 →
          </a>
        </div>
      </div>
    </div>
  );
}
