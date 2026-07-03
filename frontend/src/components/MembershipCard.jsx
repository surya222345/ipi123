import ReactDOM from 'react-dom';
import './MembershipCard.css';

export default function MembershipCard({ member, showActions = true }) {
  if (!member) return null;

  const photoUrl = member.photoPath ? `/uploads/${member.photoPath}` : null;
  const verifyUrl = `${window.location.origin}/verify/${member.memberId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=0-0-0&bgcolor=ffffff`;

  const handlePrint = () => {
    window.print();
  };

  const CardFront = () => (
    <div className="id-card-front">
      {/* Header bar */}
      <div className="card-header-bar">
        <div className="card-logo">🎗️</div>
        <div className="card-title-group">
          <span className="card-title-main tamil">உறுப்பினர் அடையாள அட்டை</span>
          <span className="card-title-sub">Membership Identity Card</span>
        </div>
      </div>

      {/* Main card body */}
      <div className="card-content">
        <div className="card-photo-box">
          {photoUrl ? (
            <img src={photoUrl} alt={member.fullName} className="card-photo" />
          ) : (
            <svg viewBox="0 0 24 24" className="card-photo-placeholder" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        <div className="card-details-grid">
          <div className="card-detail-item">
            <span className="card-detail-lbl tamil">உறுப்பினர் எண் / Member ID</span>
            <span className="card-detail-val member-id-text">{member.memberId}</span>
          </div>
          <div className="card-detail-item">
            <span className="card-detail-lbl tamil">பெயர் / Name</span>
            <span className="card-detail-val">{member.fullName}</span>
          </div>
          <div className="card-detail-item">
            <span className="card-detail-lbl tamil">கைபேசி / Mobile</span>
            <span className="card-detail-val">{member.phone}</span>
          </div>
          <div className="card-detail-item">
            <span className="card-detail-lbl tamil">மாவட்டம் / District</span>
            <span className="card-detail-val">{member.district}</span>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="card-footer-bar">
        <span className="tamil">உறுப்பினர் சேர்க்கை</span>
        <span>Registered Member</span>
      </div>
    </div>
  );

  const CardBack = () => (
    <div className="id-card-back">
      <div className="card-back-title tamil">தொடர்பு மற்றும் விபரங்கள்</div>
      
      <div className="card-back-content">
        <div className="card-back-row">
          <span className="card-detail-lbl tamil">தந்தை/கணவர் பெயர் / Father's Name</span>
          <span className="card-detail-val">{member.fatherOrHusbandName}</span>
        </div>
        <div className="card-back-row">
          <span className="card-detail-lbl tamil">இரத்த வகை / Blood Group</span>
          <span className="card-detail-val">{member.bloodGroup || 'N/A'}</span>
        </div>
        <div className="card-back-row">
          <span className="card-detail-lbl tamil">முகவரி / Address</span>
          <span className="card-back-address tamil">
            {member.address}, {member.city}, {member.district} - {member.pincode}
          </span>
        </div>
      </div>

      <div className="card-back-bottom">
        <div className="card-qr-box">
          <img src={qrCodeUrl} alt="Verification QR" className="card-qr-image" />
        </div>
        <div className="card-sign-box">
          <div className="card-sign-line">
            <span className="card-signature-mock">Approved</span>
          </div>
          <span className="card-sign-text tamil">அங்கீகரிக்கப்பட்ட கையொப்பம்</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card-preview-wrapper">
      {/* On-screen Preview */}
      <div className="card-sides-container">
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }} className="tamil">முன்பக்கம் (Front)</h4>
          <CardFront />
        </div>
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }} className="tamil">பின்பக்கம் (Back)</h4>
          <CardBack />
        </div>
      </div>

      {showActions && (
        <div className="card-actions-panel">
          <button className="btn btn-primary" onClick={handlePrint} style={{ gap: 8 }}>
            🖨️ அச்சிடுக (Print Card)
          </button>
        </div>
      )}

      {/* Portal to Body for flawless printing */}
      {ReactDOM.createPortal(
        <div className="printable-card-only">
          <CardFront />
          <CardBack />
          <div className="print-instructions tamil">
            மேலே உள்ள பகுதியை வெட்டி, மடித்து லேமினேட் (Laminate) செய்து கொள்ளவும்.
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
