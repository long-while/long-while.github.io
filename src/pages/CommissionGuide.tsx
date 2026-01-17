import './CommissionGuide.css'

function CommissionGuide() {
  return (
    <div className="commission-guide">
      <h1>커미션 가이드</h1>
      
      <section className="guide-section">
        <h2>작업 프로세스</h2>
        <ol className="process-list">
          <li>
            <strong>문의 및 상담</strong>
            <p>원하시는 작업 내용을 자세히 설명해주세요.</p>
          </li>
          <li>
            <strong>견적 및 계약</strong>
            <p>작업 범위와 비용을 확인하고 계약합니다.</p>
          </li>
          <li>
            <strong>작업 진행</strong>
            <p>정기적인 진행 상황을 공유하며 작업을 진행합니다.</p>
          </li>
          <li>
            <strong>수정 및 완료</strong>
            <p>피드백을 반영하여 최종 작업물을 완성합니다.</p>
          </li>
        </ol>
      </section>

      <section className="guide-section">
        <h2>가격 안내</h2>
        <div className="price-info">
          <p>작업 유형과 복잡도에 따라 가격이 상이합니다.</p>
          <p>정확한 견적은 문의를 통해 안내드리겠습니다.</p>
        </div>
      </section>

      <section className="guide-section">
        <h2>주의사항</h2>
        <ul className="notice-list">
          <li>작업 완료 후 수정은 1~2회까지 무료로 진행됩니다.</li>
          <li>작업 기간은 작업 내용에 따라 달라질 수 있습니다.</li>
          <li>선금 50% 지불 후 작업을 시작합니다.</li>
        </ul>
      </section>
    </div>
  )
}

export default CommissionGuide
