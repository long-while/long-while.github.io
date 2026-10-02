/**
 * 나의 견적함 (/estimate/) — 시안 '나의 견적함-비어있음 / 채워있음 / 채워있음-삭제알림' (232:1026, 242:3405, 242:4009, file.json 실측).
 *  헤더 아래 100 → 가운데 제목 묶음(ESTIMATE → 24 → display 제목 → 16 → 항목 수 body1) → 48 → 내용 1320 → 120 → 푸터.
 *  채워있음: 묶음(서버·자동봇·기타) 간격 60 → 32 → 안내 글머리표 → 20 → 총액 상자 → 60 → '신청서 작성하기' 220×64.
 *  비어있음: 경고 그림 → 24 → 안내(28/38 + body3) → 40 → 상품 페이지 카드 2개(648×228, 간격 24).
 *  연필은 지금처럼 상품 페이지로 이동 (Q5, 시안의 '수정하기' 펼침 화면은 만들지 않음). 삭제는 ds Toast 로 되돌리기.
 *  문구는 기존 사이트 그대로 (Q9).
 */
import { useCallback, useEffect } from 'react';
import {
  Banner, BulletList, Button, EstimateGroup, EstimateItemRow, EstimateTotal, Icon, LinkCard, Toast, buttonClassName,
} from '@/app/components/ds';
import { SERVER_INSTALL_ITEM_NAME } from '@/app/constants/form';
import { ServerFeeNote } from '@/app/components/server/ServerFeeNote';
import { useEstimate } from '@/app/contexts/EstimateContext';
import type { EstimateItem } from '@/app/contexts/EstimateContext';
import { navLinkProps } from '@/app/lib/navLink';
import type { NavigateFunction } from '@/app/types/navigation';
import { eulReul, eunNeun } from '@/app/utils/josa';

interface EstimatePageProps {
  onBack?: () => void;
  onNavigate: NavigateFunction;
}

/** 삭제 알림이 저절로 사라지기까지의 시간 */
const UNDO_TIMEOUT_MS = 8000;

const won = (n: number) => `₩${n.toLocaleString()}`;

// 설명에서 [대괄호] 안의 명령어만 추출하는 함수
function extractCommands(description: string): string {
  const matches = description.match(/\[([^\]]+)\]/g);
  if (!matches || matches.length === 0) return description;
  return matches.join(', ');
}

const subtotal = (items: EstimateItem[]) => items.reduce((sum, item) => sum + item.price, 0);

/** 삭제 직후 뜨는 되돌리기 알림 (ds Toast) */
function UndoToast({ itemId, name, onUndo, onDismiss }: { itemId: string; name: string; onUndo: () => void; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
    // 삭제 건마다 타이머를 새로 시작한다 (이름은 중복될 수 있어 id 를 쓴다)
  }, [itemId, onDismiss]);
  return <Toast floating floatAlign="end" message={`'${name}'${eulReul(name)} 삭제했습니다.`} actionLabel="실행 취소" onAction={onUndo} onClose={onDismiss} />;
}

function PageTitle({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="font-inter text-eyebrow uppercase text-brand">ESTIMATE</p>
      <div className="flex flex-col gap-4">
        <h1 className="text-display text-text-primary">내 견적 확인하기</h1>
        <p className="text-body1 text-text-secondary">총 {count}개 항목</p>
      </div>
    </div>
  );
}

function EmptyState({ onNavigate }: { onNavigate: NavigateFunction }) {
  const server = navLinkProps('server', onNavigate);
  const bot = navLinkProps('bot', onNavigate);
  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <Icon name="warning" size={50} className="text-error-500" />
        <div className="flex flex-col gap-2">
          <h2 className="text-title1 text-text-primary">견적에 담긴 항목이 없습니다</h2>
          <p className="text-body3 text-text-secondary">서버 설치 커미션 또는 자동봇 커미션 페이지에서 원하시는 옵션을 선택해주세요.</p>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <LinkCard tone="gray" eyebrow="SERVER" title="서버 설치 커미션" {...server} />
        <LinkCard tone="gray" eyebrow="BOT" title="자동봇 커미션" {...bot} />
      </div>
    </div>
  );
}

function ItemGroup({ title, items, onRemove, onEdit }: {
  title: string;
  items: EstimateItem[];
  onRemove: (item: EstimateItem) => void;
  onEdit: (item: EstimateItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <EstimateGroup title={title} aside={`소계 ${won(subtotal(items))}`}>
      {items.map((item) => (
        <EstimateItemRow
          key={item.id}
          name={item.name}
          description={item.description ? extractCommands(item.description) : undefined}
          price={item.price === 0 ? '협의' : won(item.price)}
          badge={item.locked && <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-body3 text-brand">필수 포함</span>}
          locked={item.locked}
          lockedTitle="서버 설치에 자동으로 포함되는 항목이라 삭제하실 수 없어요."
          lockedLabel={`${item.name}${eunNeun(item.name)} 삭제할 수 없는 필수 항목입니다`}
          editLabel={`${item.name} 수정하러 가기`}
          editTitle="상품 페이지에서 이 항목을 다시 고릅니다"
          removeLabel={`${item.name} 삭제`}
          onEdit={() => onEdit(item)}
          onRemove={() => onRemove(item)}
        />
      ))}
    </EstimateGroup>
  );
}

/**
 * 서버 설치를 빼고 서버 옵션(테마·빠른마감·검색 등)만 남은 견적이면 알린다 (4단계 리뷰).
 * 자동으로 지우지 않고, 함께 빼거나 서버 설치를 다시 담을 수 있게 고르게 한다.
 */
function OrphanServerOptions({ items, onRemoveAll, onAddInstall }: { items: EstimateItem[]; onRemoveAll: () => void; onAddInstall: () => void }) {
  return (
    <Banner
      tone="warning"
      title="서버 설치 없이 담긴 서버 옵션이 있어요"
      description={`${items.map((i) => i.name).join(', ')}${eunNeun(items[items.length - 1].name)} 마스토돈 서버 설치와 함께 신청하는 옵션입니다.`}
      actions={<>
        <Button variant="white" size="md" onClick={onRemoveAll}>서버 옵션 모두 빼기</Button>
        <Button size="md" onClick={onAddInstall}>서버 설치 담으러 가기</Button>
      </>}
    />
  );
}

function FilledState({ onNavigate }: { onNavigate: NavigateFunction }) {
  const { items, removeItem, getTotalPrice, proceedToOrder, setEditTargetName, serverCalcResult } = useEstimate();
  const order = navLinkProps('order', onNavigate);

  /** 항목 수정: 해당 상품 페이지로 이동하면서 어떤 옵션을 고치려는지 넘긴다 (상품 페이지가 스크롤·강조) */
  const handleEdit = useCallback((item: EstimateItem) => {
    setEditTargetName(item.name);
    onNavigate(item.category === 'bot' ? 'bot' : 'server');
  }, [onNavigate, setEditTargetName]);
  const handleRemove = (item: EstimateItem) => removeItem(item.id, { trackUndo: true });

  const hasInstall = items.some((i) => i.name === SERVER_INSTALL_ITEM_NAME);
  const orphanServerItems = hasInstall ? [] : items.filter((i) => i.category === 'server' && !i.locked);
  const removeOrphans = () => orphanServerItems.forEach((i) => removeItem(i.id));
  const addInstall = () => {
    setEditTargetName(SERVER_INSTALL_ITEM_NAME);
    onNavigate('server');
  };

  const groups = [
    { title: '서버 설치', items: items.filter((i) => i.category === 'server') },
    { title: '자동봇', items: items.filter((i) => i.category === 'bot') },
    { title: '기타', items: items.filter((i) => i.category !== 'server' && i.category !== 'bot') },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-10 lg:gap-[60px]">
      <div className="flex w-full flex-col gap-8">
        {orphanServerItems.length > 0 && <OrphanServerOptions items={orphanServerItems} onRemoveAll={removeOrphans} onAddInstall={addInstall} />}
        <div className="flex flex-col gap-10 lg:gap-[60px]">
          {groups.map((g) => <ItemGroup key={g.title} title={g.title} items={g.items} onRemove={handleRemove} onEdit={handleEdit} />)}
        </div>
        <div className="flex flex-col gap-5">
          <BulletList
            items={[
              // 세 줄을 하나로, 자동봇 구동비 안내는 자동봇 페이지로 옮김 (4단계 문구 정리)
              '최종 금액은 난이도와 일정에 따라 달라질 수 있어, 신청서 확인 후 확정해 드려요.',
              // '협의' 항목(가격 0)은 합계에 안 들어가므로 알린다 (4단계 검토)
              ...(items.some((i) => i.price === 0) ? ['‘협의’ 항목은 총 견적 금액에 포함되지 않아요. 상담 후 따로 알려드려요.'] : []),
            ]}
          />
          <EstimateTotal label="총 견적 금액" amount={won(getTotalPrice())} />
          {hasInstall && <ServerFeeNote result={serverCalcResult} />}
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <a
          {...order}
          onClick={(e) => {
            proceedToOrder();
            order.onClick(e);
          }}
          className={buttonClassName({ variant: 'primary', size: 'lg' })}
        >
          신청서 작성하기
        </a>
        <p className="text-body3 text-text-secondary">견적 항목이 신청서에 자동으로 반영됩니다</p>
      </div>
    </div>
  );
}

export default function EstimatePage({ onNavigate }: EstimatePageProps) {
  const { items, lastRemoved, undoRemove, dismissLastRemoved } = useEstimate();

  // 견적함을 떠나면 삭제 알림도 함께 정리한다 (다음에 들어왔을 때 묵은 알림이 뜨지 않도록)
  useEffect(() => dismissLastRemoved, [dismissLastRemoved]);

  return (
    <main id="main" tabIndex={-1} className="bg-background-white outline-none">
      {lastRemoved && (
        <UndoToast itemId={lastRemoved.item.id} name={lastRemoved.item.name} onUndo={undoRemove} onDismiss={dismissLastRemoved} />
      )}
      <div className="container-ds flex flex-col items-center gap-10 pb-[60px] pt-12 lg:gap-12 lg:pb-[120px] lg:pt-[100px]">
        <PageTitle count={items.length} />
        {items.length === 0 ? <EmptyState onNavigate={onNavigate} /> : <FilledState onNavigate={onNavigate} />}
      </div>
    </main>
  );
}
