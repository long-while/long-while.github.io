import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>MAS Commission</h1>
        </Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            홈
          </Link>
          <Link 
            to="/guide" 
            className={location.pathname === '/guide' ? 'nav-link active' : 'nav-link'}
          >
            커미션 가이드
          </Link>
          <Link 
            to="/portfolio" 
            className={location.pathname === '/portfolio' ? 'nav-link active' : 'nav-link'}
          >
            포트폴리오
          </Link>
          <Link 
            to="/contact" 
            className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'}
          >
            문의하기
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
