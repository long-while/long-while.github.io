import './Contact.css'

function Contact() {
  return (
    <div className="contact">
      <h1>문의하기</h1>
      <p className="contact-intro">
        커미션 작업에 대한 문의나 질문이 있으시면 언제든지 연락주세요.
      </p>

      <div className="contact-methods">
        <section className="contact-method">
          <h2>이메일</h2>
          <p>이메일 주소를 여기에 입력하세요</p>
          <a href="mailto:example@example.com" className="contact-link">
            example@example.com
          </a>
        </section>

        <section className="contact-method">
          <h2>소셜 미디어</h2>
          <p>다양한 플랫폼에서 연락 가능합니다.</p>
          <div className="social-links">
            <a href="#" className="social-link">트위터</a>
            <a href="#" className="social-link">인스타그램</a>
            <a href="#" className="social-link">디스코드</a>
          </div>
        </section>
      </div>

      <section className="contact-form-section">
        <h2>문의 양식</h2>
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="subject">제목</label>
            <input type="text" id="subject" name="subject" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">메시지</label>
            <textarea 
              id="message" 
              name="message" 
              rows={6} 
              required
            ></textarea>
          </div>
          <button type="submit" className="btn-submit">
            전송하기
          </button>
        </form>
      </section>
    </div>
  )
}

export default Contact
