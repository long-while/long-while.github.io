import { pageForLocation, isLegacyHashEntry, hrefForPage, routeForPath, normalizePath } from '@/app/constants/seo';

let failed = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  (actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)})`}`);
};

check('기존 /#faq 링크 → faq 페이지', pageForLocation('/', '#faq'), 'faq');
check('기존 /#terms 링크 → terms 페이지', pageForLocation('/', '#terms'), 'terms');
check('기존 /#server 링크 → server 페이지', pageForLocation('/', '#server'), 'server');
check('/#faq 는 레거시로 인식', isLegacyHashEntry('/', '#faq'), true);
check('/#terms 는 레거시로 인식', isLegacyHashEntry('/', '#terms'), true);
check('/faq/ 는 레거시 아님', isLegacyHashEntry('/faq/', ''), false);
check('/order/#estimate-fee 는 레거시 아님', isLegacyHashEntry('/order/', '#estimate-fee'), false);
check('/order/#estimate-fee 는 order 유지', pageForLocation('/order/', '#estimate-fee'), 'order');
check('슬래시 없는 /faq 도 인식', pageForLocation('/faq', ''), 'faq');
check('/terms 도 인식', pageForLocation('/terms', ''), 'terms');
check('알 수 없는 경로는 home', pageForLocation('/nope/', ''), 'home');
check('hrefForPage(faq)', hrefForPage('faq'), '/faq/');
check('hrefForPage(terms)', hrefForPage('terms'), '/terms/');
check('hrefForPage(home)', hrefForPage('home'), '/');
check('routeForPath(/faq/) indexable', routeForPath('/faq/')?.indexable, true);
check('routeForPath(/terms/) indexable', routeForPath('/terms/')?.indexable, true);
check('normalizePath', normalizePath('/faq'), '/faq/');

console.log(failed === 0 ? '\n라우팅 검증 통과' : `\n${failed}개 실패`);
if (failed > 0) process.exit(1);
export {};
