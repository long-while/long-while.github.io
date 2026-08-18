/**
 * 빌드 타임 프리렌더 진입점
 * =========================
 *
 * GitHub Pages 는 정적 호스팅이라 요청 시점 SSR 이 불가능합니다. 대신 빌드할 때
 * 각 경로를 한 번씩 렌더해서 실제 텍스트가 들어 있는 HTML 을 만들어 둡니다.
 * (검색엔진이 JS 실행 없이도 페이지 내용을 읽을 수 있게 하기 위함)
 *
 * lazy() 로 분리된 페이지 컴포넌트도 렌더 결과에 포함되어야 하므로
 * 모든 Suspense 경계가 해소된 뒤 호출되는 onAllReady 시점에 HTML 을 수집합니다.
 *
 * 실제 사용은 scripts/prerender.mjs 참고.
 */
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import App from '@/app/App';
import type { PageType } from '@/app/types/navigation';

export { ROUTES, SITE_URL, SITE_NAME, CONTACT_URL, absoluteUrl } from '@/app/constants/seo';
export { FAQ_ITEMS } from '@/app/components/FAQ';

const RENDER_TIMEOUT_MS = 20_000;

export function render(page: PageType): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });
    sink.on('finish', () => resolve(Buffer.concat(chunks).toString('utf8')));
    sink.on('error', reject);

    let settled = false;
    const { pipe, abort } = renderToPipeableStream(<App initialPage={page} />, {
      onAllReady() {
        settled = true;
        clearTimeout(timer);
        pipe(sink);
      },
      onError(error) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      abort();
      reject(new Error(`프리렌더 시간 초과: ${page}`));
    }, RENDER_TIMEOUT_MS);
  });
}
