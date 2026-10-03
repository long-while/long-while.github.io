/**
 * 자동봇 표 2개 (file.json 실측).
 *  CompareTable — 봇 타입 비교 (Frame 2095589850): 바깥 모서리 12 + #DDDDDD 선, 칸 600/240/240/240, 패딩 24.
 *    머리 #F6F7F8 + body1 #767676 / 본문 title4 #000 / 있음 = 파란 원 28 + 흰 체크, 없음 = #F6F7F8 원 + #A6A6A6 체크.
 *    가격 줄 #F1F6FD + title3 #3376E7 (패딩 32·24).
 *  KeywordReplyGuide — 키워드 답멘(기본)과 '답멘에 이름·주사위 넣기' 옵션을 한 섹션에서 시트 + 대화로 보여 준다
 *    (예전 커스텀 명령어 표는 시트 문법만 있어 봇이 실제로 뭐라고 답하는지 안 보였다). {중괄호}는 파란 굵은 글씨.
 * 좁은 화면에서는 글자를 줄이고 줄바꿈해 표가 화면 폭에 맞는다 (페이지 가로 스크롤 없음, Q1).
 */
import clsx from 'clsx';
import { BulletList, Icon } from '@/app/components/ds';
import { PRICING_CONFIG } from '@/app/constants/form';
import {
  COMPARE_COLUMNS, COMPARE_PRICES, COMPARE_ROWS, KEYWORD_REPLY_CHAT, KEYWORD_REPLY_SHEET, REPLY_TAG_EXAMPLES, REPLY_TAGS,
  type ChatTurn, type SheetRow,
} from './botContent';

const cell = 'border border-border-100 px-2 py-3 lg:px-5 lg:py-3.5';
const sheetCell = 'border border-border-100 px-3 py-2.5 lg:px-4 lg:py-3';
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

/** 문장 안의 강조 조각(pattern 에 걸린 부분)을 파란 굵은 글씨로 */
function Highlighted({ text, pattern, strip = false }: { text: string; pattern: RegExp; strip?: boolean }) {
  return (
    <>
      {text.split(pattern).filter(Boolean).map((part, i) =>
        // split 이 강조 조각을 따로 떼어 주므로, 조각 전체가 pattern 에 걸리면 강조
        pattern.test(part)
          ? <span key={i} className="font-bold text-brand">{strip ? part.slice(1, -1) : part}</span>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** {중괄호} 강조 (시트 답멘) */
const BRACES = /(\{[^}]*\})/;
/** *별표* 강조 (봇 답에서 바뀐 부분). 별표는 지운다 */
const STARS = /(\*[^*]+\*)/;

/** 시트에 적는 모습: 키워드 | 답멘 */
function SheetTable({ rows }: { rows: SheetRow[] }) {
  return (
    <div className={wrap}>
      <table className={table}>
        <thead className="bg-background-100 text-body3 text-text-secondary">
          <tr>
            <th scope="col" className={clsx(sheetCell, 'w-[34%] text-left font-normal')}>시트 – 키워드</th>
            <th scope="col" className={clsx(sheetCell, 'text-left font-normal')}>시트 – 답멘</th>
          </tr>
        </thead>
        <tbody className="text-body3 font-medium text-text-primary">
          {rows.map((row) => (
            <tr key={`${row.keyword}-${row.reply}`}>
              <th scope="row" className={clsx(sheetCell, 'text-left align-top font-medium')}>{row.keyword}</th>
              <td className={sheetCell}><Highlighted text={row.reply} pattern={BRACES} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 마스토돈에서 주고받는 모습. 이름 옆에 말풍선을 붙여 한 줄로 (위아래 자리를 줄임) */
export function ChatExample({ turns, label }: { turns: ChatTurn[]; label: string }) {
  return (
    <ol className="flex flex-col gap-2" aria-label={label}>
      {turns.map((turn, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className={clsx('w-10 shrink-0 text-body3 font-semibold', turn.fromBot ? 'text-brand' : 'text-brand-700')}>{turn.speaker}</span>
          <p className={clsx('min-w-0 flex-1 whitespace-pre-wrap rounded-button border px-3 py-2 text-body3 text-text-primary', turn.fromBot ? 'border-border-100 bg-background-100' : 'border-brand-100 bg-background-brand')}>
            <Highlighted text={turn.message} pattern={STARS} strip />
          </p>
        </li>
      ))}
    </ol>
  );
}

/** 시트 ↔ 대화를 나란히 (좁은 화면에서는 위아래) */
function SheetAndChat({ sheet, chat, label }: { sheet: SheetRow[]; chat: ChatTurn[]; label: string }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
      <SheetTable rows={sheet} />
      <ChatExample turns={chat} label={label} />
    </div>
  );
}

const upgradePrice = `₩${PRICING_CONFIG.bot.addons.customCommandUpgrade.toLocaleString()}`;

function ReplyTagTable() {
  return (
    <div className={wrap}>
      <table className={table}>
        <thead className="bg-background-100 text-body3 text-text-secondary">
          <tr>
            <th scope="col" className={clsx(sheetCell, 'text-left font-normal')}>답멘에 적는 것</th>
            <th scope="col" className={clsx(sheetCell, 'text-left font-normal')}>들어가는 것</th>
            <th scope="col" className={clsx(sheetCell, 'text-left font-normal')}>결과 예</th>
          </tr>
        </thead>
        <tbody className="text-body3 font-medium text-text-primary">
          {REPLY_TAGS.map((row) => (
            <tr key={row.tag}>
              <th scope="row" className={clsx(sheetCell, 'text-left align-top font-bold text-brand')}>{row.tag}</th>
              <td className={sheetCell}>{row.meaning}</td>
              <td className={sheetCell}>{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 키워드 답멘 중 '답멘에 이름·주사위 넣기' 추가 옵션으로 되는 것 */
function ReplyTagPart() {
  return (
    <div className="flex flex-col gap-6 border-t border-border-100 pt-10">
      <div className="flex flex-col gap-2">
        <h3 className="flex flex-wrap items-center gap-2 text-title4 text-text-primary">
          답멘에 이름·주사위 넣기
          <span className="rounded-pill bg-background-brand px-2.5 py-0.5 text-body3 font-semibold text-brand">추가 옵션 +{upgradePrice}</span>
        </h3>
        <p className="text-body2 text-text-secondary">
          답멘 안에 보낸 사람 이름, 주사위 결과, 랜덤 단어를 넣을 수 있어요. 이름 뒤 은/는, 이/가, 을/를도 자동으로 맞춰요.
          <br />
          이 옵션 없이 중괄호를 적으면 <strong className="font-semibold text-text-primary">"피해 {'{3d5}'}"</strong>처럼 글자 그대로 나가요.
        </p>
      </div>
      <ReplyTagTable />
      {REPLY_TAG_EXAMPLES.map((example) => (
        <div key={example.title} className="flex flex-col gap-4">
          <h4 className="text-title5 text-text-primary">예시 · {example.title}</h4>
          <SheetAndChat sheet={example.sheet} chat={example.chat} label={`${example.title} 예시 대화`} />
        </div>
      ))}
    </div>
  );
}

/** 키워드 답멘이란? 기본 기능(모든 기본 타입) → 추가 옵션으로 되는 것 순서 */
export function KeywordReplyGuide() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <BulletList
          items={[
            '운영진이 시트에 키워드와 답멘을 적어 두면, 누가 그 키워드를 보낼 때 봇이 답멘을 보내요.',
            '같은 키워드에 답멘을 여러 개 적으면 그중 하나가 랜덤으로 나가요.',
            '[가위바위보] [YN] 같은 기본 키워드를 넣어 드리고, 시트에서 원하는 만큼 늘리고 고칠 수 있어요.',
          ]}
        />
        <SheetAndChat sheet={KEYWORD_REPLY_SHEET} chat={KEYWORD_REPLY_CHAT} label="키워드 답멘 예시 대화" />
      </div>
      <ReplyTagPart />
    </div>
  );
}
