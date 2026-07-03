import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

const STEPS = ['தனிப்பட்ட தகவல்', 'தொடர்பு தகவல்', 'ஆவணங்கள்'];
const GENDERS = ['ஆண் (Male)', 'பெண் (Female)', 'மற்றவர் (Other)'];
const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ID_TYPES = ['Aadhar Card', 'Voter ID', 'PAN Card', 'Passport', 'Driving License'];
const DISTRICTS = [
  'Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli',
  'Tiruppur','Vellore','Erode','Thoothukkudi','Dindigul','Thanjavur',
  'Ranipet','Sivaganga','Virudhunagar','Nagapattinam','Kanyakumari',
  'Dharmapuri','Krishnagiri','Namakkal','Karur','Perambalur','Ariyalur',
  'Villupuram','Cuddalore','Mayiladuthurai','Kallakurichi','Tiruvannamalai',
  'Vellore','Chengalpattu','Kancheepuram','Tiruvallur','Nilgiris','Pudukkottai'
];

const initForm = {
  fullName: '', fatherOrHusbandName: '', age: '', gender: '',
  dateOfBirth: '', bloodGroup: '', phone: '', alternatePhone: '',
  email: '', address: '', city: '', district: '', pincode: '',
  occupation: '', qualification: '', idType: '', idNumber: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const photoRef = useRef(); const idRef = useRef();

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = 'பெயர் அவசியம்';
      if (!form.fatherOrHusbandName.trim()) e.fatherOrHusbandName = 'தந்தை/கணவர் பெயர் அவசியம்';
      if (!form.age || form.age < 18 || form.age > 100) e.age = 'வயது 18-100 இடையில் இருக்க வேண்டும்';
      if (!form.gender) e.gender = 'பாலினம் தேர்வு செய்யவும்';
      if (!form.occupation.trim()) e.occupation = 'தொழில் அவசியம்';
    }
    if (s === 1) {
      if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = 'சரியான மொபைல் எண் உள்ளிடவும்';
      if (!form.address.trim()) e.address = 'முகவரி அவசியம்';
      if (!form.city.trim()) e.city = 'நகரம் அவசியம்';
      if (!form.district) e.district = 'மாவட்டம் தேர்வு செய்யவும்';
      if (!form.pincode.match(/^\d{6}$/)) e.pincode = 'சரியான பின்கோடு உள்ளிடவும்';
    }
    if (s === 2) {
      if (!form.idType) e.idType = 'அடையாள அட்டை வகை தேர்வு செய்யவும்';
      if (!form.idNumber.trim()) e.idNumber = 'அட்டை எண் அவசியம்';
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  };

  const handleFile = (file, type) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size must be under 5MB'); return; }
    if (type === 'photo') {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = e => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else setIdProof(file);
  };

  const handleSubmit = async () => {
    const e = validateStep(2);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true); setServerError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      if (idProof) fd.append('idProof', idProof);
      const { data } = await axios.post('/api/members', fd);
      navigate(`/success/${data.member.memberId}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="register-page">
      <div className="page-container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <div className="register-header">
          <h1 className="section-title tamil">உறுப்பினர் பதிவு படிவம்</h1>
          <p className="section-subtitle">Membership Registration Form — Fill all required fields</p>
        </div>

        <div className="register-card">
          {/* Step Indicator */}
          <div className="step-indicator">
            {STEPS.map((label, i) => (
              <div key={i} className={`step-item ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`}>
                <div className="step-circle">{i < step ? '✓' : i + 1}</div>
                <div className="step-label tamil">{label}</div>
              </div>
            ))}
          </div>

          {/* Step 0 — Personal */}
          {step === 0 && (
            <div className="form-section">
              <h2 className="form-section-title tamil">தனிப்பட்ட தகவல்கள்</h2>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">பெயர் (Full Name) <span className="req">*</span></label>
                  <input className={`form-control ${errors.fullName ? 'error' : ''}`} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="உங்கள் முழு பெயர்" />
                  {errors.fullName && <span className="err-msg">{errors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">தந்தை / கணவர் பெயர் <span className="req">*</span></label>
                  <input className={`form-control ${errors.fatherOrHusbandName ? 'error' : ''}`} value={form.fatherOrHusbandName} onChange={e => set('fatherOrHusbandName', e.target.value)} placeholder="தந்தை அல்லது கணவர் பெயர்" />
                  {errors.fatherOrHusbandName && <span className="err-msg">{errors.fatherOrHusbandName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">வயது (Age) <span className="req">*</span></label>
                  <input type="number" className={`form-control ${errors.age ? 'error' : ''}`} value={form.age} onChange={e => set('age', e.target.value)} placeholder="உங்கள் வயது" min={18} max={100} />
                  {errors.age && <span className="err-msg">{errors.age}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">பிறந்த தேதி (Date of Birth)</label>
                  <input type="date" className="form-control" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">பாலினம் (Gender) <span className="req">*</span></label>
                  <select className={`form-control ${errors.gender ? 'error' : ''}`} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">-- தேர்வு செய்யவும் --</option>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  {errors.gender && <span className="err-msg">{errors.gender}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">இரத்த வகை (Blood Group)</label>
                  <select className="form-control" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b || '-- தேர்வு செய்யவும் --'}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">தொழில் (Occupation) <span className="req">*</span></label>
                  <input className={`form-control ${errors.occupation ? 'error' : ''}`} value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="உங்கள் தொழில்" />
                  {errors.occupation && <span className="err-msg">{errors.occupation}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">கல்வித் தகுதி (Qualification)</label>
                  <input className="form-control" value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="உங்கள் கல்வி" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Contact */}
          {step === 1 && (
            <div className="form-section">
              <h2 className="form-section-title tamil">தொடர்பு தகவல்கள்</h2>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">மொபைல் எண் (Phone) <span className="req">*</span></label>
                  <input type="tel" className={`form-control ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-இலக்க மொபைல் எண்" maxLength={10} />
                  {errors.phone && <span className="err-msg">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">மாற்று தொலைபேசி (Alternate Phone)</label>
                  <input type="tel" className="form-control" value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} placeholder="மாற்று எண் (விருப்பத்திற்கு)" maxLength={10} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">மின்னஞ்சல் (Email)</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">முகவரி (Address) <span className="req">*</span></label>
                  <textarea className={`form-control ${errors.address ? 'error' : ''}`} rows={3} value={form.address} onChange={e => set('address', e.target.value)} placeholder="வீட்டு எண், தெரு, பகுதி..." />
                  {errors.address && <span className="err-msg">{errors.address}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">நகரம் (City) <span className="req">*</span></label>
                  <input className={`form-control ${errors.city ? 'error' : ''}`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="நகரம்" />
                  {errors.city && <span className="err-msg">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">மாவட்டம் (District) <span className="req">*</span></label>
                  <select className={`form-control ${errors.district ? 'error' : ''}`} value={form.district} onChange={e => set('district', e.target.value)}>
                    <option value="">-- மாவட்டம் தேர்வு --</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  {errors.district && <span className="err-msg">{errors.district}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">பின்கோடு (Pincode) <span className="req">*</span></label>
                  <input className={`form-control ${errors.pincode ? 'error' : ''}`} value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6-இலக்க பின்கோடு" maxLength={6} />
                  {errors.pincode && <span className="err-msg">{errors.pincode}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Documents */}
          {step === 2 && (
            <div className="form-section">
              <h2 className="form-section-title tamil">ஆவண சரிபார்ப்பு</h2>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">அடையாள அட்டை வகை <span className="req">*</span></label>
                  <select className={`form-control ${errors.idType ? 'error' : ''}`} value={form.idType} onChange={e => set('idType', e.target.value)}>
                    <option value="">-- தேர்வு செய்யவும் --</option>
                    {ID_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {errors.idType && <span className="err-msg">{errors.idType}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">அட்டை எண் (ID Number) <span className="req">*</span></label>
                  <input className={`form-control ${errors.idNumber ? 'error' : ''}`} value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="அடையாள அட்டை எண்" />
                  {errors.idNumber && <span className="err-msg">{errors.idNumber}</span>}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="form-group">
                <label className="form-label">புகைப்படம் (Photo)</label>
                <div className="file-zone" onClick={() => photoRef.current.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }} onDragLeave={e => e.currentTarget.classList.remove('drag-over')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0], 'photo'); }}>
                  <input ref={photoRef} type="file" accept="image/jpeg,image/png" onChange={e => handleFile(e.target.files[0], 'photo')} />
                  {photoPreview ? (
                    <div className="photo-preview"><img src={photoPreview} alt="Preview" /><p className="file-name">✅ {photo?.name}</p></div>
                  ) : (
                    <div><div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div><p>புகைப்படத்தை இழுத்து விடுங்கள் அல்லது கிளிக் செய்யுங்கள்</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>JPG, PNG — max 5MB</p></div>
                  )}
                </div>
              </div>

              {/* ID Proof Upload */}
              <div className="form-group">
                <label className="form-label">அடையாள அட்டை நகல் (ID Proof)</label>
                <div className="file-zone" onClick={() => idRef.current.click()}>
                  <input ref={idRef} type="file" accept="image/*,application/pdf" onChange={e => handleFile(e.target.files[0], 'idProof')} />
                  {idProof ? (
                    <p className="file-name">✅ {idProof.name}</p>
                  ) : (
                    <div><div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div><p>அடையாள அட்டையை பதிவேற்றவும்</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>JPG, PNG, PDF — max 5MB</p></div>
                  )}
                </div>
              </div>

              {serverError && <div className="server-error">⚠️ {serverError}</div>}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← முந்தைய</button>}
            {step < 2 ? (
              <button className="btn btn-primary" onClick={handleNext} style={{ marginLeft: 'auto' }}>அடுத்து →</button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto' }}>
                {submitting ? <><span className="spinner"></span> சமர்ப்பிக்கிறது...</> : '✅ படிவம் சமர்ப்பிக்கவும்'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
