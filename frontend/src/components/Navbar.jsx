import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-logo">🏛️</span>
          <div>
            <div className="brand-tamil tamil">உரிப்பினர் சேர்க்கை</div>
            <div className="brand-english">Urippinar Serkkai</div>
          </div>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>🏠 முகப்பு</Link>
          <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>📝 பதிவு செய்க</Link>
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>👨‍💼 Admin</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            இப்போதே சேர்க
          </Link>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>
      </div>
    </nav>
  );
}
