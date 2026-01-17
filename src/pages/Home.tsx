import './Home.css'

function Home() {
  return (
    <div className="home">
      <header className="site-header">
        <div className="container">
          <div className="status-badge">Status: Open</div>
          <h1>한참 코딩 커미션</h1>
          <p className="intro-text">
            전공생이 진행하는 마스토돈 커뮤니티 특화 커미션입니다.<br />
            코딩을 몰라도 괜찮습니다. 운영의 질을 높여주는 '한참 에디션'을 만나보세요.
          </p>
          <div className="quick-links">
            <a href="https://posty.pe/yp5th0" target="_blank" rel="noopener noreferrer">📦 마스토돈 백업기</a>
            <a href="https://posty.pe/obfsus" target="_blank" rel="noopener noreferrer">📖 셀프 설치 가이드</a>
          </div>
        </div>
      </header>

      <main className="container">
        
        {/* 핵심 차별점 */}
        <section id="features" className="document-section">
          <h2 className="section-title">Why "Han-cham" Edition?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>다중계정 & 전환</h3>
              <p>로그아웃 없이 웹트처럼 자유로운 계정 전환. 40시간의 사투 끝에 구현한 핵심 기능.</p>
            </div>
            <div className="feature-card">
              <h3>트위터 UI</h3>
              <p>마스토돈이 처음인 러너도 익숙하게 적응하는 인터페이스.</p>
            </div>
            <div className="feature-card">
              <h3>운영 편의성</h3>
              <p>모든 DM 관리 페이지, 알림창 분리, 자동봇 시트 연동.</p>
            </div>
            <div className="feature-card">
              <h3>디테일</h3>
              <p>코펍돋움 폰트, 마크다운 지원, 각종 스크롤 및 표기 오류 수정 완료.</p>
            </div>
          </div>
        </section>

        {/* 서버 설치 비용 */}
        <section id="server-pricing" className="document-section">
          <h2 className="section-title">Server & Theme</h2>
          <div className="pricing-group">
            <div className="price-main">
              <span className="label">기본 서버 설치</span>
              <span className="value">20,000원</span>
            </div>
            <p className="desc">GCP 가상 엔진 사용, 한참 인스턴스 + 트위터 UI 테마, 도메인 구매 대행 포함.</p>
            
            <div className="options-list">
              <div className="option-item"><span>전체 테마 커스텀 (낮/밤 2종)</span> <span>+30,000원</span></div>
              <div className="option-item"><span>로고 변경</span> <span>+5,000원</span></div>
              <div className="option-item"><span>글자수 제한 변경</span> <span>+5,000원</span></div>
              <div className="option-item"><span>단어 검색 기능 (베타)</span> <span>+30,000원</span></div>
              <div className="option-item"><span>노션 가이드 제공</span> <span>+5,000원</span></div>
            </div>
          </div>
        </section>

        {/* 자동봇 비용 */}
        <section id="bot-pricing" className="document-section">
          <h2 className="section-title">Auto Bot</h2>
          <p className="notice-box">🤖 봇 가동 비용: 1주일 5,000원 별도 / 마감: 1주 ~ 한달</p>
          
          <div className="pricing-menu">
            <div className="menu-item">
              <div className="item-info">
                <h3>기본 타입</h3>
                <p>시트 연동, 주사위, 운세, 가위바위보, 커스텀 명령어</p>
              </div>
              <div className="item-price">15,000원</div>
            </div>
            <div className="menu-item">
              <div className="item-info">
                <h3>기본 & 상점</h3>
                <p>재화 관리, 아이템 구매/가방/양도, 툿수 연동</p>
              </div>
              <div className="item-price">35,000원</div>
            </div>
            <div className="menu-item">
              <div className="item-info">
                <h3>기본 & 상점 & 스탯</h3>
                <p>캐릭터 스탯 관리, 아이템 사용 시 스탯 변화 반영</p>
              </div>
              <div className="item-price">45,000원</div>
            </div>
            <div className="menu-item">
              <div className="item-info">
                <h3>CoC / 자동조사</h3>
                <p>TRPG 판정 시스템 또는 장소별 키워드 조사 시스템</p>
              </div>
              <div className="item-price">20,000원~</div>
            </div>
          </div>

          <div className="highlight-options">
            <h4>강력 추천 옵션</h4>
            <ul>
              <li>📅 <strong>예약 툿 / 스토리 자동 진행</strong>: 각 +5,000원 (운영의 질이 달라집니다!)</li>
              <li>⚡ <strong>빠른 마감</strong>: 48시간 내(+200%), 1주 내(+100%)</li>
            </ul>
          </div>
        </section>

        {/* 자주 묻는 질문 */}
        <section id="faq" className="document-section">
          <h2 className="section-title">F.A.Q</h2>
          <div className="faq-container">
            <div className="faq-item">
              <p className="question">Q. 서버비는 매달 얼마인가요?</p>
              <p className="answer">무료 크레딧 소진 후 매달 약 4만원(GCP 기준)입니다. 장기 서버의 경우 저렴한 업체로 매칭 시 월 1~2만원 선으로 조정 가능합니다.</p>
            </div>
            <div className="faq-item">
              <p className="question">Q. 테마 이미지는 언제 드려야 하나요?</p>
              <p className="answer">신청 시점에는 필요 없습니다! 신청서 접수 후 상세 규격 안내를 드립니다. 서버 설치 후에도 추가 가능합니다.</p>
            </div>
            <div className="faq-item">
              <p className="question">Q. 서버비는 커미션주님께 입금하나요?</p>
              <p className="answer">아니요, 저는 '시공 업체'입니다. 임대료(서버비)는 건물주(GCP/업체)에게 직접 결제하시게 됩니다.</p>
            </div>
          </div>
        </section>

        {/* 이용약관 */}
        <section id="tos" className="document-section">
          <h2 className="section-title">Terms of Service</h2>
          <div className="tos-box">
            <ul>
              <li><strong>유지보수:</strong> 가동 중 발생한 예상치 못한 오류는 무료로 신속히 해결해 드립니다.</li>
              <li><strong>질문 제한:</strong> 상세 안내가 제공되므로, 개별 질문은 세팅 완료 전까지 3회로 제한됩니다.</li>
              <li><strong>환불:</strong> 작업 착수 후 환불은 불가합니다. (개장 취소 포함)</li>
              <li><strong>추가금:</strong> 이미지 전달 지연으로 인한 빠른 마감 발생 시 추가금이 청구됩니다.</li>
            </ul>
          </div>
        </section>

        {/* 연락처 */}
        <section id="contact" className="document-section">
          <h2 className="section-title">Contact</h2>
          <div className="contact-area">
            <p>신청서는 아무 때나 접수 가능합니다. 작업 일자가 가까워지면 연락드립니다!</p>
            <div className="contact-buttons">
              <a href="#" className="btn primary">크레페로 신청하기</a>
              <a href="#" className="btn">오픈채팅 문의</a>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

export default Home
