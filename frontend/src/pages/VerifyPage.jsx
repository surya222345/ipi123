import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './VerifyPage.css';

export default function VerifyPage() {
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
        setError('உறுப்பினர் விபரங்கள் கண்டறியப்படவில்லை (Member credentials not found)');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  return (
    <div className="verify-page">
      <div className="verify-container">
        {loading ? (
          <div className="verify-card loading-card">
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></span>
            <p className="tamil" style={{ marginTop: 16 }}>சரிபார்க்கப்படுகிறது...</p>
          </div>
        ) : error ? (
          <div className="verify-card error-card">
            <div className="status-icon">❌</div>
            <h1 className="verify-title tamil">சரிபார்ப்பு தோல்வி!</h1>
            <p className="verify-sub">Verification Failed</p>
            <div className="error-box">
              <p className="tamil">{error}</p>
            </div>
            <Link to="/" className="btn btn-secondary" style={{ marginTop: 20 }}>🏠 முகப்பு பக்கம் (Home)</Link>
          </div>
        ) : member ? (
          <div className="verify-card success-card-verify">
            <div className="badge-verified">
              <span className="verified-icon">🛡️</span>
              <span className="tamil font-bold">உறுதிசெய்யப்பட்டது (Verified)</span>
            </div>
            
            <div className="verify-photo-wrapper">
              {member.photoPath ? (
                <img src={`/uploads/${member.photoPath}`} alt="Member" className="verify-photo" />
              ) : (
                <div className="verify-photo-placeholder">👤</div>
              )}
            </div>

            <h1 className="verify-name">{member.fullName}</h1>
            <code className="verify-id">{member.memberId}</code>

            <div className="verify-status-badge">
              {member.status === 'approved' ? (
                <span className="badge badge-approved" style={{ fontSize: 14, padding: '6px 16px' }}>✅ Approved Member</span>
              ) : member.status === 'rejected' ? (
                <span className="badge badge-rejected" style={{ fontSize: 14, padding: '6px 16px' }}>❌ Membership Suspended</span>
              ) : (
                <span className="badge badge-pending" style={{ fontSize: 14, padding: '6px 16px' }}>⏳ Verification Pending</span>
              )}
            </div>

            <div className="verify-details-table">
              <div className="verify-row">
                <span className="verify-key tamil">தந்தை/கணவர் பெயர்</span>
                <span className="verify-val">{member.fatherOrHusbandName}</span>
              </div>
              <div className="verify-row">
                <span className="verify-key tamil">மாவட்டம்</span>
                <span className="verify-val">{member.district}</span>
              </div>
              <div className="verify-row">
                <span className="verify-key tamil">இரத்த வகை</span>
                <span className="verify-val">{member.bloodGroup || 'N/A'}</span>
              </div>
              <div className="verify-row">
                <span className="verify-key tamil">பதிவு செய்யப்பட்ட தேதி</span>
                <span className="verify-val">{new Date(member.createdAt).toLocaleDateString('ta-IN')}</span>
              </div>
            </div>

            <div className="verify-footer">
              <p className="tamil text-muted">இந்த உறுப்பினர் அட்டை தகுதி வாய்ந்தது என சான்றளிக்கப்படுகிறது.</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>🏠 முகப்பு பக்கம் (Home)</Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
