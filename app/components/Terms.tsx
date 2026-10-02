import type { MouseEvent } from 'react';
import { FAST_DEADLINE_EXAMPLES, TERMS_SECTIONS } from '@/app/components/terms/termsContent';

export interface TermsProps {
  title?: string;
  /** 이용안내 페이지에서는 h1 으로 렌더한다 */
  headingLevel?: 'h1' | 'h2';
  /** 항목이 6개라 페이지로 볼 때는 상단 목차를 붙인다 */
  showToc?: boolean;
  /** 모달처럼 바깥에서 이미 제목을 보여주는 경우 false 로 끈다 */
  showTitle?: boolean;
}

export default function Terms({
  title = '약관 및 기타 안내',
  headingLevel: Heading = 'h2',
  showToc = false,
  showTitle = true,
}: TermsProps) {
  // 문서 제목이 h1 이면 각 항목은 h2, 섹션으로 얹힐 때는 h3 이 되도록 맞춘다
  const SectionHeading = Heading === 'h1' ? 'h2' : 'h3';
  // 항목 안의 예시 제목도 한 단계 아래로 — 레벨을 건너뛰지 않게 한다
  const ExampleHeading = Heading === 'h1' ? 'h3' : 'h4';

  /**
   * 목차 이동은 주소의 해시를 바꾸지 않고 스크롤만 한다.
   * 신청서 안에서 모달로 띄웠을 때 `/order/#estimate-fee` 처럼 주소가 바뀌는 걸 막기 위함.
   * href 는 그대로 두어 링크 복사·키보드 사용에는 영향이 없다.
   */
  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // 새 탭으로 여는 조작은 브라우저에 맡긴다
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    const id = event.currentTarget.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = TERMS_SECTIONS;
  const examples = FAST_DEADLINE_EXAMPLES;

  return (
    <section className="py-15">
      {showTitle && (
        <div className="mb-16 border-b border-border pb-4">
          <Heading className="text-[29px] tracking-[-0.01em] font-semibold">
            {title}
          </Heading>
        </div>
      )}

      {showToc && (
        <nav aria-label="이용안내 목차" className="mb-12 border border-border bg-background-inverse/[0.02] p-6">
          <p className="text-[12px] font-mono text-foreground/50 uppercase tracking-widest mb-4">목차</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {sections.map((section, index) => (
              <li key={section.id} className="flex items-baseline gap-3">
                <span className="text-[12px] font-mono text-brand shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <a
                  href={`#${section.id}`}
                  onClick={handleTocClick}
                  className="text-[15px] hover:text-brand hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                  {section.title}
                </a>
                {section.fee && (
                  <span className="text-[11px] text-brand-700 shrink-0">추가금</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} id={section.id} className="pb-6 border-b border-border last:border-0 last:pb-0 scroll-mt-header">
            <div className="max-w-4xl flex items-baseline gap-6">
              <div className="text-[12px] font-mono leading-normal text-brand shrink-0">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div>
                <SectionHeading className="text-[20px] mb-2">
                  {section.title}
                </SectionHeading>

                {/* 추가금이 발생하는 조건은 본문보다 먼저 눈에 띄어야 한다 */}
                {section.fee && (
                  <p className="mb-3 inline-flex items-start gap-2 border border-brand/40 bg-brand-50 px-3 py-2 text-[13px] leading-[1.6] text-brand-700">
                    <span className="font-semibold shrink-0">추가금</span>
                    <span>{section.fee}</span>
                  </p>
                )}

                <p className="text-[15px] leading-[1.9] text-foreground/70">
                  {section.content}
                </p>

                {/* 빠른마감 섹션에만 예시 추가 */}
                {section.hasExamples && (
                  <div className="mt-8">
                  <ExampleHeading className="text-[16px] mb-4 text-foreground/80">빠른마감 적용 예시</ExampleHeading>
                  <div className="space-y-3">
                    {examples.map((example, exampleIndex) => (
                      <div
                        key={exampleIndex}
                        className={`border p-5 ${
                          example.isPositive
                            ? 'border-border'
                            : 'border-brand/30 bg-brand-50'
                        }`}
                      >
                        <p className="text-[14px] leading-[1.8] mb-2">{example.case}</p>
                        <div className={`text-[13px] font-mono flex items-center gap-2 ${
                          example.isPositive ? 'text-foreground/60' : 'text-brand'
                        }`}>
                          <span>→</span>
                          <span>{example.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}