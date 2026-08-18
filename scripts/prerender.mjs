/**
 * 빌드 타임 프리렌더
 * ==================
 *
 * `vite build`(클라이언트) → `vite build --ssr`(Node 번들) 이후에 실행됩니다.
 *
 * 하는 일:
 *  1. 경로별로 앱을 한 번 렌더해서 실제 텍스트가 들어 있는 HTML 을 만든다
 *  2. 경로별 title/description/canonical/og/robots 를 head 에 박아 넣는다
 *  3. 구조화 데이터(JSON-LD)를 삽입한다
 *  4. sitemap.xml 과 404.html 을 만든다
 *
 * 결과물은 dist/server/index.html 처럼 디렉터리 형태라, GitHub Pages 가
 * 리다이렉트 없이 /server/ 를 그대로 서빙합니다.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ROUTES,
  SITE_URL,
  SITE_NAME,
  CONTACT_URL,
  FAQ_ITEMS,
  render,
} from '../dist-ssr/entry-server.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

/** HTML 속성값에 안전하게 넣기 위한 이스케이프 */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON-LD 안에서 </script> 로 스크립트가 조기 종료되는 것을 막는다 */
function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: ROUTES[0].description,
    areaServed: 'KR',
    availableLanguage: 'ko',
    sameAs: [CONTACT_URL],
  };
}

function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'ko',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function serviceSchema(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: route.page === 'server' ? '마스토돈 서버 설치 커미션' : '마스토돈 자동봇 커미션',
    serviceType: route.page === 'server' ? '마스토돈 서버 설치 및 테마 커스텀' : '마스토돈 자동봇 세팅',
    description: route.description,
    url: `${SITE_URL}${route.path}`,
    areaServed: 'KR',
    provider: { '@id': `${SITE_URL}/#organization` },
  };
}

function schemasForRoute(route) {
  if (route.page === 'home') return [organizationSchema(), webSiteSchema(), faqSchema()];
  if (route.page === 'server' || route.page === 'bot') return [serviceSchema(route)];
  return [];
}

/**
 * 빌드된 index.html 을 템플릿 삼아 경로별 메타데이터와 렌더 결과를 주입한다.
 */
function buildHtml(template, route, appHtml, { forceNoindex = false } = {}) {
  const url = `${SITE_URL}${route.path}`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);
  const indexable = route.indexable && !forceNoindex;

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${description}" />`
    )
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`);

  const head = [];
  if (!indexable) {
    head.push('<meta name="robots" content="noindex, follow" />');
  }
  // 404 폴백에는 구조화 데이터를 넣지 않는다 (실제 페이지가 아니므로)
  for (const schema of forceNoindex ? [] : schemasForRoute(route)) {
    head.push(`<script type="application/ld+json">${serializeJsonLd(schema)}</script>`);
  }
  if (head.length > 0) {
    html = html.replace('</head>', `    ${head.join('\n    ')}\n  </head>`);
  }

  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

function buildSitemap(routes, lastmod) {
  const entries = routes
    .map((route) =>
      [
        '  <url>',
        `    <loc>${SITE_URL}${route.path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${route.page === 'home' ? '1.0' : '0.8'}</priority>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n');
}

async function main() {
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
  const lastmod = new Date().toISOString().slice(0, 10);

  let homeHtml = '';

  for (const route of ROUTES) {
    const appHtml = await render(route.page);
    const html = buildHtml(template, route, appHtml);

    const outDir = route.path === '/' ? distDir : path.join(distDir, route.path);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), html, 'utf8');

    if (route.page === 'home') homeHtml = appHtml;
    console.log(`  프리렌더 완료: ${route.path} (${(html.length / 1024).toFixed(1)} kB)`);
  }

  // 알 수 없는 경로 대비 폴백. GitHub Pages 가 404 상태로 내려주므로 색인되지 않는다.
  await writeFile(
    path.join(distDir, '404.html'),
    buildHtml(template, ROUTES[0], homeHtml, { forceNoindex: true }),
    'utf8'
  );

  const indexable = ROUTES.filter((route) => route.indexable);
  await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(indexable, lastmod), 'utf8');

  console.log(`  sitemap.xml: ${indexable.length}개 URL, 404.html 생성 완료`);
}

main().catch((error) => {
  console.error('프리렌더 실패:', error);
  process.exit(1);
});
