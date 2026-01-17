import './Portfolio.css'

function Portfolio() {
  // 나중에 실제 작업물 데이터로 교체 가능
  const portfolioItems = [
    {
      id: 1,
      title: '작업물 1',
      description: '작업물 설명을 여기에 작성하세요.',
      category: '일러스트'
    },
    {
      id: 2,
      title: '작업물 2',
      description: '작업물 설명을 여기에 작성하세요.',
      category: '그래픽 디자인'
    },
    {
      id: 3,
      title: '작업물 3',
      description: '작업물 설명을 여기에 작성하세요.',
      category: '일러스트'
    },
  ]

  return (
    <div className="portfolio">
      <h1>포트폴리오</h1>
      <p className="portfolio-intro">
        제가 작업한 커미션 작업물들을 모아놓은 공간입니다.
      </p>
      
      <div className="portfolio-grid">
        {portfolioItems.map((item) => (
          <div key={item.id} className="portfolio-item">
            <div className="portfolio-image-placeholder">
              <span>이미지 영역</span>
            </div>
            <div className="portfolio-content">
              <span className="portfolio-category">{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
