/**
 * 봇 타입 상세 카드 (시안 Frame 2095589870, file.json 실측).
 *  2열, 간격 24. 카드: 모서리 10(→ card 12), 패딩 28, 간격 16, 선 #E5E5EC(Q15 → border-100).
 *  선택: #F1F6FD 바탕 + #3376E7 선, 이름 #3376E7, 안쪽 상자 흰색. 기본: 흰 바탕, 안쪽 상자 #F6F7F8.
 *  머리: 체크 원 28 + 이름 title3 ↔ 가격 title3 #3376E7. 안쪽 상자: 모서리 12, 패딩 24, 목록 body3 #767676 ('구성요소' 소제목은 4단계 사용자 요청으로 뺌).
 *  자동조사 예시·오마카세 상세는 기존처럼 카드 안 펼치기로 둔다 (시안에 없음).
 */
import { useId, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { Icon, buttonClassName } from '@/app/components/ds';
import { INVESTIGATION_EXAMPLE, INVESTIGATION_TYPE, OMAKASE_FORM_URL, OMAKASE_TYPE, type BotType } from './botContent';
import type { BotEstimate } from './useBotEstimate';

const won = (n: number) => `₩${n.toLocaleString()}`;
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden="true" className={clsx('flex size-7 shrink-0 items-center justify-center rounded-pill text-text-inverse', checked ? 'bg-brand' : 'bg-border-100')}>
      <Icon name="check" size={20} />
    </span>
  );
}

function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="rounded-input border border-border-100 bg-background-white">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={panelId}
        className={clsx('flex w-full items-center justify-between gap-3 rounded-input px-4 py-3 text-left text-title5 text-text-primary', focus)}>
        {label}
        <Icon name="chevron-down" size={20} className={clsx('shrink-0 text-text-secondary transition-transform duration-300', open && 'rotate-180')} />
      </button>
      {open && <div id={panelId} className="flex flex-col gap-4 border-t border-border-100 p-4 animate-slideDown">{children}</div>}
    </div>
  );
}

function InvestigationExample() {
  return (
    <Disclosure label="예시 조사 보기">
      {INVESTIGATION_EXAMPLE.map((turn, i) => {
        const isCharacter = turn.role === '캐릭터';
        return (
          <div key={i} className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-caption1">
              <span className={clsx('font-semibold', isCharacter ? 'text-brand-700' : 'text-brand')}>{turn.role}</span>
              <span className="text-text-secondary">{turn.label}</span>
            </p>
            <pre className={clsx('whitespace-pre-wrap rounded-button border p-2.5 font-sans text-body3 text-text-primary', isCharacter ? 'border-brand-100 bg-background-brand' : 'border-border-100 bg-background-100')}>
              {turn.message}
            </pre>
          </div>
        );
      })}
    </Disclosure>
  );
}

function OmakaseDetail({ note }: { note?: string }) {
  return (
    <Disclosure label="오마카세 기능 상세 설명">
      <p className="text-body2 text-text-secondary">
        (커뮤 시스템 문서와 따로 만든 문서여야 해요)
      </p>
      <div className="flex flex-col gap-2 border-t border-border-100 pt-4">
        <h4 className="text-title5 text-text-primary">문서에 포함되어야 할 내용</h4>
        <ul className="flex flex-col gap-1 text-body3 text-text-secondary">
          {['러너가 입력할 명령어 (예: [사용/사과])', '명령어 입력 후 봇이 처리할 내용', '러너에게 보여줄 결과 메시지'].map((t) => (
            <li key={t} className="flex gap-2"><span aria-hidden="true">•</span>{t}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2 border-t border-border-100 pt-4">
        <h4 className="text-title5 text-text-primary">작성 예시</h4>
        <div className="flex flex-col gap-1.5 rounded-input bg-background-inverse-raised p-4 font-mono text-body3 text-text-disabled">
          <p className="text-brand-300">"[사용/아이템명] 명령어를 추가하고 싶어요!"</p>
          <p>→ 러너가 [사용/사과]를 입력하면</p>
          <p>→ 봇이 러너의 소지품에서 사과를 삭제하고, 체력을 +10 해준 뒤</p>
          <p>→ "사과를 사용했습니다! 체력이 +10 되었습니다." 라고 답변해 주세요.</p>
        </div>
      </div>
      <a href={OMAKASE_FORM_URL} target="_blank" rel="noopener noreferrer" className={clsx(buttonClassName({ variant: 'primary', size: 'sm' }), 'self-start')}>
        예시 오마카세 신청서 보기 →
      </a>
      <div className="flex flex-col gap-1 border-t border-border-100 pt-4 text-body3 text-text-secondary">
        <p>구현할 시스템만 짧고 명확하게 써 주세요.</p>
      </div>
      <p className="flex items-start gap-2 rounded-input border border-error-500 p-4 text-body3 font-medium text-error-500" role="note">
        <Icon name="warning" size={16} className="mt-0.5 shrink-0" />
        한 번에 이해하기 어려우면 신청이 거절될 수 있어요.
      </p>
      {note && <p className="border-t border-border-100 pt-4 text-body3 text-text-secondary">{note}</p>}
    </Disclosure>
  );
}

/** 운영진만 쓰는 명령어는 일반 유저 기능과 섞이지 않게 구분선 아래로 따로 묶는다 */
function AdminFeatures({ features }: { features: string[] }) {
  return (
    <div className="border-t border-border-100 pt-3">
      <ul className="flex flex-col gap-1 text-body3 text-text-secondary">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2"><span aria-hidden="true">•</span>{feature}</li>
        ))}
      </ul>
    </div>
  );
}

function CardHeader({ type, selected }: { type: BotType; selected: boolean }) {
  return (
    <span className="flex w-full items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-2">
        {type.price > 0 && <CheckCircle checked={selected} />}
        <span className={clsx('text-title4 lg:text-title3', selected ? 'text-brand' : 'text-text-primary')}>{type.name}</span>
      </span>
      <span className="shrink-0 text-title4 text-brand lg:text-title3">{type.price ? won(type.price) : '협의'}</span>
    </span>
  );
}

function TypeCard({ type, est, highlighted }: { type: BotType; est: BotEstimate; highlighted: string | null }) {
  const selected = est.has(type.name);
  const ring = highlighted === type.name && 'outline outline-[3px] outline-offset-2 outline-brand';
  const header = <CardHeader type={type} selected={selected} />;
  return (
    <article className={clsx('flex flex-col gap-4 rounded-card border p-5 transition-colors lg:p-7', selected ? 'border-brand bg-background-brand' : 'border-border-100 bg-background-white')}>
      {type.price > 0 ? (
        <button type="button" data-option-name={type.name} aria-pressed={selected}
          aria-label={selected ? `${type.name} 견적에서 제거` : `${type.name} 견적에 추가`}
          onClick={() => est.toggleType(type.name, type.price, [...type.features, ...(type.adminFeatures ?? [])].join(', '))}
          className={clsx('-m-2 flex rounded-input p-2 text-left', focus, ring)}>
          {header}
        </button>
      ) : (
        <div data-option-name={type.name} className={clsx('flex', ring)}>{header}</div>
      )}
      <div className={clsx('flex flex-1 flex-col gap-3 rounded-card p-5 lg:p-6', selected ? 'bg-background-white' : 'bg-background-100')}>
        <ul className="flex flex-col gap-1 text-body3 text-text-secondary">
          {type.features.map((feature) => (
            <li key={feature} className="flex gap-2"><span aria-hidden="true">•</span>{feature}</li>
          ))}
        </ul>
        {type.adminFeatures && <AdminFeatures features={type.adminFeatures} />}
        {type.name === INVESTIGATION_TYPE && <InvestigationExample />}
        {type.name === OMAKASE_TYPE && <OmakaseDetail note={type.note} />}
        {type.note && type.name !== OMAKASE_TYPE && <p className="text-body3 text-text-secondary">{type.note}</p>}
      </div>
    </article>
  );
}

export function BotTypeCards({ types, est, highlighted }: { types: BotType[]; est: BotEstimate; highlighted: string | null }) {
  // 카드는 내용 높이만큼만 (옆 카드에 맞춰 늘어나 아래가 크게 비던 문제, 4단계 리뷰)
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {types.map((type) => <TypeCard key={type.name} type={type} est={est} highlighted={highlighted} />)}
    </div>
  );
}
