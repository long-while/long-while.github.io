/**
 * 자동봇 표 2개 (file.json 실측).
 *  CompareTable — 봇 타입 비교 (Frame 2095589850): 바깥 모서리 12 + #DDDDDD 선, 칸 600/240/240/240, 패딩 24.
 *    머리 #F6F7F8 + body1 #767676 / 본문 title4 #000 / 있음 = 파란 원 28 + 흰 체크, 없음 = #F6F7F8 원 + #A6A6A6 체크.
 *    가격 줄 #F1F6FD + title3 #3376E7 (패딩 32·24).
 *  CommandTable — 커스텀 명령어 예시 (Frame 2095589860): 칸 240/나머지, 같은 선·패딩. {중괄호}는 파란 굵은 글씨.
 * 좁은 화면에서는 글자를 줄이고 줄바꿈해 표가 화면 폭에 맞는다 (페이지 가로 스크롤 없음, Q1).
 */
import clsx from 'clsx';
import { BulletList, Icon } from '@/app/components/ds';
import { COMPARE_COLUMNS, COMPARE_PRICES, COMPARE_ROWS, CUSTOM_COMMAND_EXAMPLES } from './botContent';

const cell = 'border border-border-100 px-2 py-3 lg:p-6';
const priceCell = 'border border-border-100 px-1 py-3 lg:px-6 lg:py-8';
const wrap = 'overflow-x-auto rounded-card border border-border-100';
const table = 'w-full border-collapse border-hidden';

function Mark({ on }: { on: boolean }) {
  return (
    <span className={clsx('mx-auto flex size-6 items-center justify-center rounded-pill lg:size-7', on ? 'bg-brand text-text-inverse' : 'bg-background-100 text-text-disabled')}>
      <Icon name="check" size={20} label={on ? '포함' : '미포함'} />
    </span>
  );
}

export function CompareTable() {
  return (
    <div className="flex flex-col gap-4">
      <div className={wrap}>
        <table className={clsx(table, 'table-fixed')}>
          <colgroup>
            <col className="w-[34%] lg:w-[45.5%]" />
            {COMPARE_COLUMNS.map((c) => <col key={c} />)}
          </colgroup>
          <thead className="bg-background-100 text-caption1 text-text-secondary lg:text-body1">
            <tr>
              <th scope="col" className={clsx(cell, 'text-left font-normal')}>기능</th>
              {COMPARE_COLUMNS.map((c) => <th key={c} scope="col" className={clsx(cell, 'font-normal')}>{c}</th>)}
            </tr>
          </thead>
          <tbody className="text-body3 font-medium text-text-primary lg:text-title4">
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature}>
                <th scope="row" className={clsx(cell, 'text-left font-medium')}>{row.feature}</th>
                {row.has.map((on, i) => <td key={COMPARE_COLUMNS[i]} className={cell}><Mark on={on} /></td>)}
              </tr>
            ))}
            <tr className="bg-background-brand text-caption1 text-brand lg:text-title3">
              <th scope="row" className={clsx(priceCell, 'text-left font-medium')}>가격</th>
              {COMPARE_PRICES.map((p, i) => <td key={COMPARE_COLUMNS[i]} className={clsx(priceCell, 'whitespace-nowrap text-center')}>{p}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-body3 text-text-secondary">
        * 자동조사 타입(₩20,000)과 오마카세 타입(협의)은 특수 목적 봇으로 아래에서 별도 확인해주세요.
      </p>
    </div>
  );
}

const brace = <span className="font-bold text-brand">{'{중괄호}'}</span>;

/** '{...}' 조각을 강조 글씨로 */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{[^}]*\})/).filter(Boolean).map((part, i) =>
        part.startsWith('{') ? <span key={i} className="font-bold text-brand">{part}</span> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

export function CommandTable() {
  return (
    <div className="flex flex-col gap-5">
      <BulletList
        items={[
          <span key="brace">아래 {brace} 항목이 모두 업그레이드로 추가되었습니다.</span>,
          <span key="what"><strong className="font-semibold text-text-primary">커스텀 명령어란?</strong> 운영진이 시트에 입력해 둔 명령어를 유저가 입력하면, 해당 명령어와 짝지어진 문구 중 하나가 랜덤으로 출력되는 방식입니다.</span>,
          <span key="ex">만약 <strong className="font-semibold text-text-primary">[허기]</strong>라는 명령어를 사용하면 아래 표에 있는 허기 문구 3개 중 하나가 무작위로 반환됩니다.</span>,
        ]}
      />
      <div className={wrap}>
        <table className={table}>
          <thead className="bg-background-100 text-caption1 text-text-secondary lg:text-body1">
            <tr>
              <th scope="col" className={clsx(cell, 'w-[76px] text-left font-normal lg:w-[240px]')}>명령어</th>
              <th scope="col" className={clsx(cell, 'text-left font-normal')}>예시 문구 (업그레이드 시 사용 가능)</th>
            </tr>
          </thead>
          <tbody className="text-body3 font-medium text-text-primary lg:text-title4">
            {CUSTOM_COMMAND_EXAMPLES.map((row) => (
              <tr key={row.text}>
                <th scope="row" className={clsx(cell, 'text-left align-top font-medium')}>{row.command}</th>
                <td className={cell}><Highlighted text={row.text} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
