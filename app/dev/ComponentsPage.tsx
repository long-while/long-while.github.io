/**
 * /__components — 개발 모드 전용 컴포넌트 확인 페이지.
 * src/main.tsx 에서 import.meta.env.DEV 일 때만 동적으로 불러오므로 프로덕션 빌드·프리렌더에 포함되지 않는다.
 * 예시 이미지는 design/assets/images (git 제외, 로컬 전용)를 개발 서버 경로로 읽는다. 없으면 빈 배경으로 보인다.
 * ?modal=1 이면 모달을 연 상태로 시작 (스크린샷용).
 */
import { useState, type ReactNode } from 'react';
import { EstimateProvider } from '@/app/contexts/EstimateContext';
import {
  AccordionItem, Banner, BulletList, Button, Checkbox, ErrorSummary, EstimateGroup, EstimateItemRow, EstimateTotal, FeatureCard, Icon, InfoBox, LevelBar, LinkCard, Modal, NoticeBox, OptionCard, PageHero, PriceCard,
  ProcessStep, Radio, SectionTitle, Select, ServiceCard, SiteFooter, SiteHeader, StickyEstimateBar, Stepper, Tabs,
  TextField, TitledSection, Toast, tabPanelId, type IconName,
} from '@/app/components/ds';
import { fieldBoxClassName } from '@/app/components/ds/TextField';

const IMG = (hash: string) => `/design/assets/images/${hash}.png`;
const HERO = IMG('f5c662525a55253b8832d20cb5beee7da9636814');
const SERVICE = IMG('a3da49215a01ec44e3f6e73fa9ccd81ac0c32252');
const FEATURE = IMG('55229bf0c91be7e839ea69c6a32056aae30bb86b');
const STEP = IMG('de20de2860ca6e4633d28001d45a4b4b4acc2d13');
const ICONS: IconName[] = ['chevron-down', 'chevron-up', 'chevron-right', 'check', 'close', 'plus', 'minus', 'search', 'calendar', 'pencil', 'trash', 'bell', 'info', 'warning', 'lock', 'cart', 'menu', 'external-link'];
const noop = () => undefined;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-border-100 py-12">
      <h2 className="text-headline2 text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption2 text-text-secondary">{label}</p>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </div>
  );
}

function Buttons() {
  return (
    <Block title="Button">
      <Row label="Default (primary · gray · white · dark · black)">
        <Button variant="primary" className="w-[220px]">버튼</Button>
        <Button variant="gray" className="w-[220px]">버튼</Button>
        <Button variant="white" className="w-[220px]">버튼</Button>
        <Button variant="dark">크레페 DM 바로가기</Button>
        <Button variant="black" size="md">수정하기</Button>
      </Row>
      <Row label="Hover 모양 (실제로는 마우스를 올리면 바뀜, 여기서는 같은 토큰으로 고정 표시)">
        <Button variant="primary" className="w-[220px] !bg-brand-hover">버튼</Button>
        <Button variant="gray" className="w-[220px] !bg-background-200">버튼</Button>
        <Button variant="white" className="w-[220px] !bg-background-100">버튼</Button>
      </Row>
      <Row label="크기 lg 64 · md 44 · sm 42 · pill">
        <Button size="lg">큰 버튼</Button>
        <Button size="md">중간 버튼</Button>
        <Button size="sm" variant="white">선택하기</Button>
        <Button size="md" variant="black" pill>신청하기</Button>
      </Row>
      <Row label="Disabled · 링크(href)">
        <Button disabled>비활성</Button>
        <Button variant="white" disabled>비활성</Button>
        <Button href="#buttons" variant="white">링크 버튼</Button>
      </Row>
    </Block>
  );
}

function Fields() {
  const [value, setValue] = useState('');
  return (
    <Block title="TextField · Select">
      <div className="grid gap-6 lg:grid-cols-2">
        <TextField label="기본" placeholder="입력해주세요" value={value} onChange={(e) => setValue(e.target.value)} helper="*커뮤니티의 경우 러닝 인원" />
        <TextField label="값 있음" defaultValue="12개월 이상 · 장기 소규모 서버 (반영구)" required />
        <div className="flex flex-col gap-2">
          <span className="text-title5">포커스 모양 (고정 표시)</span>
          <input readOnly value="12개월 이상 · 장기 소규모 서버 (반영구)" className={`${fieldBoxClassName(false)} !border-border-strong !bg-background-100`} />
        </div>
        <TextField label="오류" placeholder="입력해주세요" error="*커뮤니티의 경우 러닝 인원" />
        <TextField label="비활성" placeholder="입력할 수 없음" disabled />
        <Select label="셀렉트 기본" options={[{ value: '3', label: '3개월 이하' }, { value: '4', label: '4개월' }, { value: '5', label: '5개월' }]} helper="*커뮤니티의 경우 러닝 인원" />
        <Select label="셀렉트 선택됨" defaultValue="12" options={[{ value: '12', label: '12개월 이상 · 장기 소규모 서버 (반영구)' }, { value: '3', label: '3개월 이하' }]} />
        <Select label="셀렉트 오류" options={[{ value: '1', label: '5인미만' }]} error="*커뮤니티의 경우 러닝 인원" />
        <Select label="셀렉트 비활성" options={[{ value: '1', label: '5인미만' }]} disabled />
        <div className="flex flex-col gap-2">
          <span className="text-title5">셀렉트 열림 목록 모양 (고정 표시)</span>
          <div className="rounded-input border border-border-100 bg-background-white p-2 shadow-modal">
            {['3개월 이하', '4개월', '5개월', '6개월', '7개월'].map((t, i) => (
              <div key={t} className={`rounded-button px-3 py-3 text-body2 ${i === 0 ? 'bg-background-100 text-brand font-medium' : 'text-text-primary'}`}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </Block>
  );
}

function Choices() {
  const [radio, setRadio] = useState('a');
  return (
    <Block title="Checkbox · Radio">
      <Row label="Checkbox: 선택 · 미선택 · outline · 비활성 (Tab 으로 포커스 표시 확인)">
        <Checkbox label="체크박스" defaultChecked />
        <Checkbox label="체크박스" />
        <Checkbox label="체크박스" appearance="outline" labelSize="lg" />
        <Checkbox label="비활성" disabled />
        <Checkbox label="비활성 선택" disabled defaultChecked />
      </Row>
      <Row label="Radio: 선택 · 미선택 · 비활성">
        <Radio name="demo" label="라디오버튼" checked={radio === 'a'} onChange={() => setRadio('a')} />
        <Radio name="demo" label="라디오버튼" checked={radio === 'b'} onChange={() => setRadio('b')} />
        <Radio name="demo-d" label="비활성" disabled />
      </Row>
    </Block>
  );
}

function TabsDemo() {
  const [box, setBox] = useState('schedule');
  const [line, setLine] = useState('fee');
  return (
    <Block title="Tabs">
      <Tabs idPrefix="faq-demo" aria-label="FAQ 분류" value={box} onChange={setBox}
        items={[{ id: 'schedule', label: '신청과 일정' }, { id: 'scope', label: '서비스 범위' }, { id: 'cost', label: '서버와 비용' }]} />
      <div id={tabPanelId('faq-demo', box)} role="tabpanel" aria-labelledby={`faq-demo-tab-${box}`} className="text-body3 text-text-secondary">선택된 탭: {box}</div>
      <Tabs idPrefix="guide-demo" variant="line" aria-label="이용안내 항목" value={line} onChange={setLine}
        items={[{ id: 'fee', label: '견적비', badge: '추가금' }, { id: 'error', label: '오류 유지보수' }, { id: 'question', label: '질문', badge: '추가금' }, { id: 'theme', label: '테마 이미지', badge: '추가금' }, { id: 'refund', label: '환불' }, { id: 'fast', label: '빠른마감', badge: '추가금' }]} />
      <div id={tabPanelId('guide-demo', line)} role="tabpanel" aria-labelledby={`guide-demo-tab-${line}`} className="text-body3 text-text-secondary">선택된 탭: {line}</div>
    </Block>
  );
}

function Progress() {
  return (
    <Block title="Stepper · LevelBar · Accordion">
      <Stepper steps={['신청자 정보', '서버 설치', '자동봇', '최종 확인']} current={0} />
      <Stepper steps={['신청자 정보', '서버 설치', '자동봇', '최종 확인']} current={1} />
      <Stepper steps={['신청자 정보', '서버 설치', '자동봇', '최종 확인']} current={3} />
      <Row label="LevelBar 0 · 50 · 100">
        <LevelBar value={0} className="w-40" />
        <LevelBar value={50} className="w-40" />
        <LevelBar value={100} className="w-40" label="진행률" />
      </Row>
      <div>
        <AccordionItem index={1} question="신청서는 언제 접수해야 하나요?" defaultOpen
          answer="아무때나 접수해주시면 됩니다! 1년 후에 진행해야 하는 작업건이어도 신청서 내용이 준비되는 대로 보내주세요!" />
        <AccordionItem index={2} question="자관 역극 혹은 TRPG 용으로 장기 소규모 서버 설치도 가능한가요?" answer="가능합니다." />
      </div>
    </Block>
  );
}

function Cards() {
  const [theme, setTheme] = useState('logo');
  const [addons, setAddons] = useState<string[]>(['limit']);
  const toggle = (id: string) => setAddons((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return (
    <Block title="OptionCard · PriceCard · SectionTitle">
      <div className="grid gap-4 lg:grid-cols-3">
        <OptionCard name="theme" value="logo" checked={theme === 'logo'} onChange={() => setTheme('logo')} title="로고만 변경" description="트위터 테마에서 로고만 교체하는 옵션" price="₩5,000" />
        <OptionCard name="theme" value="one" checked={theme === 'one'} onChange={() => setTheme('one')} title="커스텀 테마 1종" description="낮/밤 테마 중 하나를 선택해 색상 테마와 로고, 배경까지 변경" price="₩20,000" />
        <OptionCard name="theme" value="all" disabled title="커스텀 테마 2종 (비활성)" description="선택할 수 없는 상태" price="₩30,000" />
      </div>
      <OptionCard type="checkbox" layout="row" checked={addons.includes('limit')} onChange={() => toggle('limit')} title="툿 글자수 제한 변경" description="기본 글자 수 제한으로 툿을 더 길게 작성" price="₩5,000" />
      <OptionCard type="checkbox" layout="row" checked={addons.includes('search')} onChange={() => toggle('search')} title="검색 기능" description="팔로우 중인 유저의 툿과 멘션을 단어 단위로 검색" price="₩15,000" />
      <PriceCard title="3개월 이하 총 서버비" highlights={[{ strong: '처음 3개월 전액 무료', text: 'GCP 무료 크레딧 적용' }]}
        specs={[{ label: '마스토돈 서버', value: 'e2-standard-2 (2 vCPU, 8GB RAM)' }, { label: '검색 서버', value: '없음' }, { label: '선택 사양', value: '7개월 / 30인 초과 / 검색 X' }]} price="무료" />
      <PriceCard title="4개월 총 서버비" highlights={[{ strong: '처음 3개월 전액 무료', text: 'GCP 무료 크레딧 적용' }, { strong: '이후 2개월 월 3만원', text: '등록한 결제수단에서 자동 청구' }]}
        specs={[{ label: '마스토돈 서버', value: 'e2-standard-2 (2 vCPU, 8GB RAM)' }, { label: '검색 서버', value: '없음' }, { label: '선택 사양', value: '7개월 / 30인 초과 / 검색 X' }]} price="8만원" />
      <SectionTitle eyebrow="SERVICE" title="커미션 서비스" description="서버 설치부터 자동봇 제작까지, 필요한 커미션을 골라보세요." />
      <OptionCard layout="responsive" name="resp" checked onChange={noop} title="responsive (모바일 가로·데스크톱 카드)" description="390 에서 확인" price="₩5,000" />
      <TitledSection title="TitledSection 제목" description="설명 문장">
        <InfoBox title="InfoBox Type-1"><p>문단 안내 문장입니다.</p></InfoBox>
        <InfoBox title="InfoBox Type-2" items={['글머리표 1', '글머리표 2']} />
        <NoticeBox><p className="text-body1 text-text-secondary">NoticeBox 강조 상자</p></NoticeBox>
        <BulletList items={['공지 목록 1', '공지 목록 2']} />
      </TitledSection>
    </Block>
  );
}

function Overlays({ modalOpen, setModalOpen }: { modalOpen: boolean; setModalOpen: (v: boolean) => void }) {
  return (
    <Block title="Modal · Toast · Banner · StickyEstimateBar">
      <Row label="Modal (Esc, 바깥 클릭, 닫기 버튼으로 닫힘 · 포커스 가둠 · 스크롤 잠금)">
        <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
      </Row>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="복사가 완료되었습니다" subtitle="5초 후 크레페로 자동 이동합니다"
        actions={<><Button variant="white" onClick={() => setModalOpen(false)}>직접 복사했어요</Button><Button onClick={() => setModalOpen(false)}>크레페로 이동하기</Button></>}>
        <div className="flex flex-col gap-3 rounded-input bg-background-100 p-5">
          <p className="text-title5 text-text-primary">복사한 내용 다시 보기</p>
          <p className="whitespace-pre-line">{'[한참 커미션 신청서]\n신청자 닉네임: 한참'}</p>
        </div>
      </Modal>
      <Toast message="'기본&상점&스탯 타입'을 삭제했습니다." actionLabel="되돌리기" onAction={noop} onClose={noop} />
      <ErrorSummary title="입력 내용을 확인해 주세요" errors={[{ key: 'a', message: '신청자 닉네임을 입력해 주세요.', onSelect: noop }, { key: 'b', message: '모든 날짜를 입력해 주세요.', onSelect: noop }]} />
      <Stepper steps={['신청자 정보', '서버 설치', '자동봇', '최종 확인']} current={1} onStepClick={noop} isStepEnabled={(i) => i <= 2} />
      <Banner title="복사가 완료되었습니다" description="아직 크레페로 이동하지 않으셨다면, 오른쪽 버튼을 눌러 이동해 주세요."
        actions={<><Button variant="white">복사한 내용 다시 보기</Button><Button>크레페로 이동하기</Button></>} />
      <StickyEstimateBar placement="inline" message="견적이 궁금하다면 가볍게 확인해보세요!" amount="₩10,000" href="#" />
    </Block>
  );
}

function EstimateDemo() {
  return (
    <Block title="EstimateGroup · EstimateItemRow · EstimateTotal (견적함)">
      <EstimateGroup title="서버 설치" aside="소계 ₩55,000">
        <EstimateItemRow name="커스텀 테마 2종" description="낮/밤 2종의 전반적인 색상테마+로고+배경 변경." price="₩30,000"
          editLabel="커스텀 테마 2종 수정하러 가기" removeLabel="커스텀 테마 2종 삭제" onEdit={noop} onRemove={noop} />
        <EstimateItemRow name="도메인·SMTP 실비" price="₩5,000" locked lockedLabel="삭제할 수 없는 필수 항목"
          badge={<span className="rounded-pill bg-brand-50 px-2 py-0.5 text-body3 text-brand">필수 포함</span>} />
      </EstimateGroup>
      <EstimateTotal label="총 견적 금액" amount="₩55,000" />
      <div className="grid gap-6 lg:grid-cols-2">
        <LinkCard tone="gray" eyebrow="SERVER" title="서버 설치 커미션" href="#" />
        <LinkCard tone="gray" eyebrow="BOT" title="자동봇 커미션" href="#" />
      </div>
    </Block>
  );
}

function Marketing() {
  return (
    <Block title="ServiceCard · FeatureCard · ProcessStep · LinkCard · Icon">
      <div className="flex flex-wrap gap-6">
        <ServiceCard image={SERVICE} title="서버 설치 & 테마 커스텀" description="구글 클라우드 플랫폼을 이용한 마스토돈 서버 설치 및 커스텀 테마 제작" price="15,000원 ~" ctaLabel="더 보러가기" href="#" />
      </div>
      <div className="flex flex-wrap gap-6">
        <FeatureCard className="max-w-[264px] border border-border-100" icon={<img src={FEATURE} alt="" className="max-h-20" />} title="다중계정 로그인 & 계정 전환" description="웹에서도 앱처럼, 총괄계에서 NPC 계정으로 빠르게 전환할 수 있어요." />
        <ProcessStep step="STEP 01" icon={<img src={STEP} alt="" className="size-[140px]" />} title="서비스 선택 & 견적 확인" description="원하는 옵션을 견적에 담고, 예상 금액을 미리 확인하세요." />
      </div>
      <div className="grid gap-6 rounded-card bg-background-brand p-6 lg:grid-cols-2">
        <LinkCard eyebrow="SERVER" title="서버 커미션 견적 내기" href="#" description="설명은 있을 때만 보임" />
        <LinkCard eyebrow="BOT" title="자동봇 커미션 견적 내기" href="#" />
      </div>
      <div className="flex flex-wrap items-center gap-6 text-text-secondary">
        {ICONS.map((name) => (
          <span key={name} className="flex flex-col items-center gap-2 text-caption2">
            <Icon name={name} label={name} />
            {name}
          </span>
        ))}
      </div>
    </Block>
  );
}

export function ComponentsPage() {
  const [modalOpen, setModalOpen] = useState(() => new URLSearchParams(window.location.search).get('modal') === '1');
  return (
    <EstimateProvider>
      <SiteHeader currentPage="home" onNavigate={noop} />
      <main className="pt-header">
        <PageHero image={HERO} eyebrow="SERVICE" title="서버 설치 & 테마 커스텀" description="구글 클라우드 플랫폼 기반으로, 나만의 마스토돈 서버와 테마를 만들어드립니다." />
        <div className="container-ds">
          <h1 className="py-10 text-display">컴포넌트 확인 (/__components, 개발 전용)</h1>
          <Buttons />
          <Fields />
          <Choices />
          <TabsDemo />
          <Progress />
          <Cards />
          <EstimateDemo />
          <Overlays modalOpen={modalOpen} setModalOpen={setModalOpen} />
          <Marketing />
        </div>
      </main>
      <SiteFooter onNavigate={noop} />
    </EstimateProvider>
  );
}
