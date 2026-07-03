import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import MembershipCard from '../components/MembershipCard';
import './SuccessPage.css';

export default function SuccessPage() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data } = await axios.get(`/api/members/by-memberid/${memberId}`);
        setMember(data);
      } catch (err) {
        setError('உறுப்பினர் விபரங்களை ஏற்றுவதில் தோல்வி (Failed to load member details)');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  return (
    <div className="success-page">
      <div className="success-card" style={{ maxWidth: '680px' }}>
        <div className="success-anim">🎉</div>
        <h1 className="success-title tamil">வாழ்த்துக்கள்!</h1>
        <p className="success-sub">Congratulations! Your membership is registered.</p>
        
        <div className="member-id-box" style={{ marginBottom: '24px' }}>
          <p className="mid-label tamil">உங்கள் உறுப்பினர் எண்</p>
          <p className="mid-value">{memberId}</p>
          <p className="mid-hint">இந்த எண்ணை பாதுகாப்பாக வைத்திருங்கள்</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <span className="spinner"></span>
            <p className="tamil" style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>விபரங்கள் பெறப்படுகிறது...</p>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--red)', fontSize: '14px', margin: '15px 0' }}>⚠️ {error}</div>
        ) : member ? (
          <div style={{ marginTop: '30px', marginBottom: '30px', background: 'rgba(255,255,255,0.02)', padding: '20px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 className="tamil" style={{ fontSize: '15px', marginBottom: '20px', color: 'var(--accent)', fontWeight: 600 }}>💳 உங்கள் உறுப்பினர் அட்டை (Your Membership Card)</h3>
            <MembershipCard member={member} />
          </div>
        ) : null}

        <div className="success-actions" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary btn-lg">🏠 முகப்பு பக்கம்</Link>
          <Link to="/register" className="btn btn-secondary btn-lg">📝 மேலும் பதிவு</Link>
        </div>
      </div>
    </div>
  );
}

