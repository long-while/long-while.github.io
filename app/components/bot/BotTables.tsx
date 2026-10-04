/**
 * 자동봇 표 2개 (file.json 실측).
 *  CompareTable — 봇 타입 비교 (Frame 2095589850): 바깥 모서리 12 + #DDDDDD 선, 칸 600/240/240/240, 패딩 24.
 *    머리 #F6F7F8 + body1 #767676 / 본문 title4 #000 / 있음 = 파란 원 28 + 흰 체크, 없음 = #F6F7F8 원 + #A6A6A6 체크.
 *    가격 줄 #F1F6FD + title3 #3376E7 (패딩 32·24).
 *  KeywordReplyGuide — 키워드 답변: ① 시트에 적어요 → ② 멘션하면 봇이 답해요 두 카드,
 *    아래에 '키워드 답변에 이름 · 주사위 넣기' 옵션 표 (중괄호 지정 · 키워드 · 답변 · 봇이 보내주는 답변을 한 줄씩).
 * 좁은 화면에서는 글자를 줄이고 줄바꿈하거나 칸을 쌓아 화면 폭에 맞는다 (페이지 가로 스크롤 없음, Q1).
 */
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Icon } from '@/app/components/ds';
import { PRICING_CONFIG } from '@/app/constants/form';
import {
  COMPARE_COLUMNS, COMPARE_PRICES, COMPARE_ROWS, KEYWORD_REPLY_CHAT, KEYWORD_REPLY_SHEET, REPLY_TAGS,
  type ChatTurn,
} from './botContent';

const cell = 'border border-border-100 px-2 py-3 lg:px-5 lg:py-3.5';
const priceCell = 'border border-border-100 px-1 py-3 lg:px-5 lg:py-5';
const wrap = 'overflow-x-auto rounded-card border border-border-100';
const table = 'w-full border-collapse border-hidden';

function Mark({ on }: { on: boolean }) {
  return (
    <span className={clsx('mx-auto flex size-6 items-center justify-center rounded-pill', on ? 'bg-brand text-text-inverse' : 'bg-background-100 text-text-disabled')}>
      <Icon name="check" size={16} label={on ? '포함' : '미포함'} />
    </span>
  );
}

export function CompareTable() {
  return (
    <div className="flex flex-col gap-4 lg:max-w-[960px]">
      <div className={wrap}>
        <table className={clsx(table, 'table-fixed')}>
          <colgroup>
            <col className="w-[34%] lg:w-[45.5%]" />
            {COMPARE_COLUMNS.map((c) => <col key={c} />)}
          </colgroup>
          <thead className="bg-background-100 text-body3 text-text-secondary lg:text-body2">
            <tr>
              <th scope="col" className={clsx(cell, 'text-left font-normal')}>기능</th>
              {COMPARE_COLUMNS.map((c) => <th key={c} scope="col" className={clsx(cell, 'font-normal')}>{c}</th>)}
            </tr>
          </thead>
          <tbody className="text-body3 font-medium text-text-primary lg:text-body2">
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature}>
                <th scope="row" className={clsx(cell, 'text-left font-medium')}>
                  {row.feature}
                  {row.keyword && <span className="block text-[12px] font-normal leading-[18px] text-text-secondary lg:ml-2 lg:inline lg:text-body3">{row.keyword}</span>}
                </th>
                {row.has.map((on, i) => <td key={COMPARE_COLUMNS[i]} className={cell}><Mark on={on} /></td>)}
              </tr>
            ))}
            <tr className="bg-background-brand text-caption1 text-brand lg:text-title4">
              <th scope="row" className={clsx(priceCell, 'text-left font-medium')}>가격</th>
              {COMPARE_PRICES.map((p, i) => <td key={COMPARE_COLUMNS[i]} className={clsx(priceCell, 'whitespace-nowrap text-center')}>{p}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-body3 text-text-secondary">
        * 자동조사(₩{PRICING_CONFIG.bot.addons.investigationBot.toLocaleString()})와 오마카세(협의)는 아래에서 따로 확인해 주세요.
      </p>
    </div>
  );
}


/** *별표* 부분을 파란 굵은 글씨로 (별표는 지움) */
function Starred({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2
          ? <span key={i} className="font-bold text-brand">{part.slice(1, -1)}</span>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** 맨 앞 @멘션(@BOT, @Jay)은 회색으로 덜 보이게, 나머지는 *별표* 강조 */
function Mentioned({ text }: { text: string }) {
  const match = text.match(/^(@\S+)\s*([\s\S]*)$/);
  if (!match) return <Starred text={text} />;
  return (
    <>
      <span className="text-text-secondary">{match[1]}</span> <Starred text={match[2]} />
    </>
  );
}

const tagText = 'font-bold text-brand';

/** {중괄호} 지정을 파란 굵은 글씨로 (시트 답변) */
function Braced({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{[^}]*\})/).filter(Boolean).map((part, i) =>
        part.startsWith('{') && part.endsWith('}')
          ? <span key={i} className={tagText}>{part}</span>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

const bubble = 'rounded-[10px] px-4 py-2.5 text-body3 text-text-primary lg:text-body2';

/** 마스토돈에서 주고받는 모습. 이름 옆에 말풍선을 붙여 한 줄로 */
export function ChatExample({ turns, label }: { turns: ChatTurn[]; label: string }) {
  return (
    <ol className="flex flex-col gap-3" aria-label={label}>
      {turns.map((turn, i) => (
        <li key={i} className="flex items-center gap-4">
          <span className={clsx('w-10 shrink-0 text-body3 font-semibold', turn.fromBot ? 'text-text-secondary' : 'text-brand')}>{turn.speaker}</span>
          <p className={clsx(bubble, 'min-w-0 flex-1 whitespace-pre-wrap', turn.fromBot ? 'bg-background-100' : 'bg-background-brand')}>
            <Mentioned text={turn.message} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/** ① ② 단계 카드: 회색 머리줄 + 내용 */
function StepCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-border-100 bg-background-white">
      <div className="flex items-center justify-between gap-3 border-b border-border-100 bg-background-100 px-5 py-3 lg:px-6">
        <h3 className="text-body3 font-semibold text-text-secondary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KeywordSheet() {
  const row = 'px-5 py-3 lg:px-6 lg:py-3.5';
  return (
    <table className="w-full table-fixed border-collapse text-left">
      <thead className="text-body3 text-text-secondary">
        <tr>
          <th scope="col" className={clsx(row, 'w-[34%] font-normal')}>키워드</th>
          <th scope="col" className={clsx(row, 'font-normal')}>답변</th>
        </tr>
      </thead>
      <tbody className="text-body3 text-text-primary lg:text-body2">
        {KEYWORD_REPLY_SHEET.map((r) => (
          <tr key={`${r.keyword}-${r.reply}`} className="border-t border-border-100">
            <th scope="row" className={clsx(row, 'font-bold')}>[{r.keyword}]</th>
            <td className={row}>{r.reply}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const upgradePrice = `₩${PRICING_CONFIG.bot.addons.customCommandUpgrade.toLocaleString()}`;
/** PC 에서는 머리줄과 같은 칸, 좁은 화면에서는 한 줄씩 쌓임 */
const tagGrid = 'lg:grid lg:grid-cols-[230px_120px_minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-6';
/** 좁은 화면에서만 보이는 칸 이름 (PC 에서는 머리줄이 대신하고 화면 낭독기용으로만 남김) */
const cellLabel = 'w-12 shrink-0 text-caption2 text-text-disabled lg:sr-only';
const cellRow = 'flex items-center lg:block';

function ReplyTagList() {
  return (
    <div className="overflow-hidden rounded-card border border-border-100">
      <div aria-hidden="true" className={clsx(tagGrid, 'hidden border-b border-border-100 bg-background-100 px-6 py-3 text-body3 text-text-secondary')}>
        <span>중괄호 지정</span><span>키워드</span><span>답변</span><span>봇이 보내주는 답변</span>
      </div>
      <ul>
        {REPLY_TAGS.map((r) => (
          <li key={r.tag} className={clsx(tagGrid, 'flex flex-col gap-2 border-t border-border-100 px-5 py-4 first:border-t-0 lg:px-6')}>
            <div className="flex flex-col gap-0.5">
              <p className={clsx(tagText, 'font-mono text-body3 lg:text-body2')}>{r.tag}</p>
              <p className="text-body3 text-text-secondary">{r.meaning}</p>
            </div>
            <p className={clsx(cellRow, 'text-body3 font-bold text-text-primary lg:text-body2')}>
              <span className={clsx(cellLabel, 'font-normal')}>키워드</span>[{r.sheet.keyword}]
            </p>
            <p className={clsx(cellRow, 'text-body3 text-text-primary lg:text-body2')}>
              <span className={cellLabel}>답변</span><span><Braced text={r.sheet.reply} /></span>
            </p>
            <p className={cellRow}>
              <span className={cellLabel}>봇</span>
              <span className={clsx(bubble, 'inline-block bg-background-100')}>{r.botReply}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 키워드 답변 중 '키워드 답변에 이름 · 주사위 넣기' 추가 옵션으로 되는 것 */
function ReplyTagPart() {
  return (
    <div className="flex flex-col gap-6 border-t border-border-100 pt-10">
      <div className="flex flex-col gap-2">
        <h3 className="flex flex-wrap items-center gap-3 text-title4 text-text-primary">
          키워드 답변에 이름 · 주사위 넣기
          <span className="rounded-pill bg-background-brand px-3 py-1 text-body3 font-semibold text-brand">추가 옵션 +{upgradePrice}</span>
        </h3>
        <p className="text-body2 text-text-secondary">
          답변 안에 중괄호 {'{ }'}로 적어 두면 보낼 때 실제 값으로 바뀌어요. 조사를 맞추고 싶다면 <span className={tagText}>{'{은는} {이가} {을를}'}</span> 지정을 사용하세요.
        </p>
      </div>
      <ReplyTagList />
    </div>
  );
}

/** 키워드 답변이란? ① 시트에 적고 → ② 멘션하면 답하는 기본 기능, 그 아래 추가 옵션 */
export function KeywordReplyGuide() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <p className="text-body2 text-text-secondary lg:text-body1">
          운영진이 시트에 <strong className="font-bold text-text-primary">키워드</strong>와 <strong className="font-bold text-text-primary">답변</strong>을 적어 두면, 누가 그 키워드를 보낼 때 봇이 답변을 보내요.
          같은 키워드에 답변을 여러 개 적으면 그중 하나가 랜덤으로 나가요.
        </p>
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
          <StepCard title="① 운영진이 원하는 키워드와 답변을 구글 시트에 지정"><KeywordSheet /></StepCard>
          <span aria-hidden="true" className="flex justify-center text-title3 text-text-disabled">
            <span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span>
          </span>
          <StepCard title="② 정해진 키워드를 멘션하면 봇이 정해진 문구로 답장">
            <div className="p-5 lg:p-6"><ChatExample turns={KEYWORD_REPLY_CHAT} label="키워드 답변 예시 대화" /></div>
          </StepCard>
        </div>
      </div>
      <ReplyTagPart />
    </div>
  );
}
