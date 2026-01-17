import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import CommissionGuide from './pages/CommissionGuide'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import './App.css'

function App() {
  return (
    <Router basename="/mas-commission">
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<CommissionGuide />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 한참. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
