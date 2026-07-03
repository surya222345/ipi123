import { Link } from 'react-router-dom';
import './HomePage.css';

const stats = [
  { value: '10,000+', label: 'பதிவான உறுப்பினர்கள்', icon: '👥' },
  { value: '32', label: 'மாவட்டங்கள்', icon: '🗺️' },
  { value: '99%', label: 'திருப்தி விகிதம்', icon: '⭐' },
  { value: '2015', label: 'நிறுவப்பட்ட ஆண்டு', icon: '🏛️' },
];

const features = [
  { icon: '📝', title: 'எளிய பதிவு', desc: 'வெறும் சில நிமிடங்களில் உங்கள் உறுப்பினர் பதிவை முடிக்கலாம்.' },
  { icon: '🔒', title: 'பாதுகாப்பான தரவு', desc: 'உங்கள் தனிப்பட்ட தகவல்கள் முழுமையான பாதுகாப்புடன் சேமிக்கப்படும்.' },
  { icon: '🪪', title: 'டிஜிட்டல் அட்டை', desc: 'உடனடியாக உங்கள் உறுப்பினர் ID கார்டை பெறுங்கள்.' },
  { icon: '📞', title: '24/7 ஆதரவு', desc: 'எந்த நேரத்திலும் எங்கள் குழு உங்களுக்கு உதவ தயாராக உள்ளது.' },
];

export default function HomePage() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="page-container">
          <div className="hero-content">
            <div className="hero-badge">🇮🇳 தமிழ்நாடு இயக்கம்</div>
            <h1 className="hero-title tamil">
              உரிப்பினர் <span className="highlight">சேர்க்கை</span>
            </h1>
            <p className="hero-subtitle">Urippinar Serkkai — Tamil Membership Registration</p>
            <p className="hero-desc">
              நமது சமூக இயக்கத்தில் இணையுங்கள். உங்கள் உரிமைகளை பாதுகாக்க,
              உங்கள் குரலை எழுப்ப, நாளை மாற்ற — இன்றே பதிவு செய்யுங்கள்.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                📝 இப்போதே பதிவு செய்க
              </Link>
              <Link to="/admin" className="btn btn-secondary btn-lg">
                👨‍💼 Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="page-container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label tamil">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">ஏன் எங்களிடம் சேருகிறீர்கள்?</h2>
            <p className="section-subtitle">We make membership simple, secure and meaningful.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title tamil">{f.title}</h3>
                <p className="feature-desc tamil">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="page-container">
          <div className="cta-box">
            <h2 className="cta-title tamil">இன்றே எங்களுடன் இணையுங்கள்!</h2>
            <p className="cta-desc">பதிவு செய்வது இலவசம் — வெறும் 3 நிமிடங்கள் போதும்.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              🚀 Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="page-container">
          <p className="tamil">© 2025 உரிப்பினர் சேர்க்கை. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
        </div>
      </footer>
    </div>
  );
}
