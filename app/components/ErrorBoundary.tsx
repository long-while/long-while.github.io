/**
 * 화면을 그리다 예상하지 못한 오류가 나면 빈 화면 대신 안내와 다시 시도 버튼을 보여준다 (4단계 검토).
 * 손상된 임시저장 때문에 신청서가 계속 깨지는 경우를 위해 '작성 중인 신청서 지우고 다시 시작'도 둔다.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

const ORDER_DRAFT_KEY = 'mas_commission_order_draft';

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('화면 오류:', error, info.componentStack);
  }

  private resetDraft = () => {
    try {
      localStorage.removeItem(ORDER_DRAFT_KEY);
    } catch {
      // 저장소를 못 쓰는 환경이면 새로고침만
    }
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-100 p-6">
        <div role="alert" className="flex max-w-md flex-col items-center gap-4 rounded-card bg-background-white p-8 text-center shadow-card">
          <h1 className="text-title3 text-text-primary">화면을 불러오지 못했어요</h1>
          <p className="text-body2 text-text-secondary">잠시 후 다시 시도해 주세요. 계속 같은 화면이 나오면 크레페 DM으로 알려 주세요.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="rounded-button bg-brand px-5 py-3 text-title5 text-text-inverse hover:bg-brand-hover">
              다시 시도
            </button>
            <button type="button" onClick={this.resetDraft} className="rounded-button border border-border-100 bg-background-white px-5 py-3 text-title5 text-text-secondary hover:bg-background-100">
              작성 중인 신청서 지우고 다시 시작
            </button>
          </div>
        </div>
      </main>
    );
  }
}
