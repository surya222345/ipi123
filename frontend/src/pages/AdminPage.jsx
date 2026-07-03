import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPage.css';
import MembershipCard from '../components/MembershipCard';


const statusColor = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
const statusLabel = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' };

// ── Login Screen ─────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) { setError('கடவுச்சொல் உள்ளிடவும்'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/admin/login', { password });
      if (data.success) {
        localStorage.setItem('admin_auth', 'true');
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <h1 className="login-title tamil">Admin Login</h1>
        <p className="login-sub tamil">நிர்வாக பக்கம் — கடவுச்சொல் தேவை</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">கடவுச்சொல் (Password)</label>
            <div className="pass-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-control ${error ? 'error' : ''}`}
                placeholder="Enter admin password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {error && <span className="err-msg">⚠️ {error}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <><span className="spinner"></span> சரிபார்க்கிறது...</> : '🔓 Login'}
          </button>
        </form>

        <p className="login-hint">Default password: <code>admin@1234</code></p>
        <p className="login-hint" style={{ marginTop: 4 }}>Change in <code>backend/.env</code> → <code>ADMIN_PASSWORD</code></p>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem('admin_auth') === 'true');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [modalTab, setModalTab] = useState('details');

  useEffect(() => {
    if (selected) {
      setModalTab('details');
    }
  }, [selected]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuth(false);
    setMembers([]); setStats(null);
  };

  const fetchStats = useCallback(async () => {
    try { const { data } = await axios.get('/api/members/stats'); setStats(data); } catch { }
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/members', { params: { page, limit: 10, search, status: statusFilter } });
      setMembers(data.members); setPages(data.pages); setTotal(data.total);
    } catch { showToast('Failed to load members', 'error'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { if (isAuth) { fetchStats(); } }, [fetchStats, isAuth]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { if (isAuth) { fetchMembers(); } }, [fetchMembers, isAuth]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/members/${id}/status`, { status });
      showToast(`Status updated to ${status}`);
      fetchMembers(); fetchStats();
      if (selected?._id === id) setSelected(m => ({ ...m, status }));
    } catch { showToast('Update failed', 'error'); }
  };

  const deleteMember = async (id) => {
    if (!window.confirm('நிச்சயமாக நீக்கவா?')) return;
    try {
      await axios.delete(`/api/members/${id}`);
      showToast('Member deleted'); setSelected(null);
      fetchMembers(); fetchStats();
    } catch { showToast('Delete failed', 'error'); }
  };

  // Show login screen if not authenticated
  if (!isAuth) return <AdminLogin onLogin={() => setIsAuth(true)} />;

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </div>
        </div>
      )}

      <div className="page-container" style={{ paddingTop: '84px', paddingBottom: '60px' }}>
        <div className="admin-header">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="section-subtitle tamil">உறுப்பினர் நிர்வாக பலகை — Total: {total}</p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ gap: '8px' }}>
            🔒 Logout
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-row">
            {[
              { icon: '👥', value: stats.total, label: 'மொத்தம்', color: 'var(--blue)' },
              { icon: '⏳', value: stats.pending, label: 'Pending', color: 'var(--yellow)' },
              { icon: '✅', value: stats.approved, label: 'Approved', color: 'var(--green)' },
              { icon: '❌', value: stats.rejected, label: 'Rejected', color: 'var(--red)' },
            ].map((s, i) => (
              <div key={i} className="admin-stat-card" style={{ borderTopColor: s.color }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label tamil">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="filters-row">
          <input
            className="form-control" placeholder="🔍 பெயர், மொபைல், ID மூலம் தேடவும்..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '360px' }}
          />
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: '180px' }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}>↺ Reset</button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></span><p style={{ marginTop: 16 }}>தரவு ஏற்றுகிறது...</p></div>
          ) : members.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><p>உறுப்பினர்கள் இல்லை</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>பெயர்</th>
                  <th>மொபைல்</th>
                  <th>மாவட்டம்</th>
                  <th>நிலை</th>
                  <th>பதிவு தேதி</th>
                  <th>செயல்கள்</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m._id}>
                    <td><code style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>{m.memberId}</code></td>
                    <td>{m.fullName}</td>
                    <td>{m.phone}</td>
                    <td>{m.district}</td>
                    <td><span className={`badge ${statusColor[m.status]}`}>{statusLabel[m.status]}</span></td>
                    <td>{new Date(m.createdAt).toLocaleDateString('ta-IN')}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => setSelected(m)}>👁 View</button>
                        {m.status !== 'approved' && <button className="btn btn-success" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => updateStatus(m._id, 'approved')}>✅</button>}
                        {m.status !== 'rejected' && <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => updateStatus(m._id, 'rejected')}>❌</button>}
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => deleteMember(m._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2)
              .map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
            <button onClick={() => setPage(pages)} disabled={page === pages}>»</button>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: modalTab === 'card' ? '760px' : '640px', transition: 'max-width 0.2s ease' }}>
            <div className="modal-header" style={{ paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{selected.fullName}</h2>
                <code style={{ color: 'var(--accent)', fontSize: '13px' }}>{selected.memberId}</code>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            
            {/* Tabs */}
            <div className="modal-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
              <button 
                className={`tab-btn ${modalTab === 'details' ? 'active' : ''}`} 
                onClick={() => setModalTab('details')}
                style={{ 
                  padding: '12px 16px', 
                  background: 'none', 
                  border: 'none', 
                  color: modalTab === 'details' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: modalTab === 'details' ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                📋 விபரங்கள் (Details)
              </button>
              <button 
                className={`tab-btn ${modalTab === 'card' ? 'active' : ''}`} 
                onClick={() => setModalTab('card')}
                style={{ 
                  padding: '12px 16px', 
                  background: 'none', 
                  border: 'none', 
                  color: modalTab === 'card' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: modalTab === 'card' ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                💳 உறுப்பினர் அட்டை (Card)
              </button>
            </div>

            <div className="modal-body">
              {modalTab === 'details' ? (
                <>
                  <span className={`badge ${statusColor[selected.status]}`} style={{ marginBottom: '20px', display: 'inline-flex' }}>{statusLabel[selected.status]}</span>
                  {selected.photoPath && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <img src={`/uploads/${selected.photoPath}`} alt="Member" style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid var(--accent)', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="detail-grid">
                    {[
                      ['தந்தை/கணவர் பெயர்', selected.fatherOrHusbandName],
                      ['வயது', selected.age],
                      ['பாலினம்', selected.gender],
                      ['இரத்த வகை', selected.bloodGroup || 'N/A'],
                      ['தொழில்', selected.occupation],
                      ['கல்வி', selected.qualification || 'N/A'],
                      ['மொபைல்', selected.phone],
                      ['மின்னஞ்சல்', selected.email || 'N/A'],
                      ['மாவட்டம்', selected.district],
                      ['நகரம்', selected.city],
                      ['பின்கோடு', selected.pincode],
                      ['அடையாள அட்டை', `${selected.idType}: ${selected.idNumber}`],
                    ].map(([k, v]) => (
                      <div key={k} className="detail-row">
                        <span className="detail-key tamil">{k}</span>
                        <span className="detail-val">{v}</span>
                      </div>
                    ))}
                    <div className="detail-row" style={{ gridColumn: '1 / -1' }}>
                      <span className="detail-key tamil">முகவரி</span>
                      <span className="detail-val">{selected.address}</span>
                    </div>
                  </div>
                </>
              ) : (
                <MembershipCard member={selected} />
              )}
            </div>
            <div className="modal-footer">
              {selected.status !== 'approved' && (
                <button className="btn btn-success" onClick={() => updateStatus(selected._id, 'approved')}>✅ Approve</button>
              )}
              {selected.status !== 'rejected' && (
                <button className="btn btn-danger" onClick={() => updateStatus(selected._id, 'rejected')}>❌ Reject</button>
              )}
              <button className="btn btn-danger" onClick={() => deleteMember(selected._id)}>🗑 Delete</button>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
