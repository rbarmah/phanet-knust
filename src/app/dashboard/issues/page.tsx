'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Issue {
  id: string; title: string; description: string; category: string;
  resolved: boolean; shareWithAll: boolean; createdAt: string;
  member: { id: string; firstName: string; lastName: string; photoUrl: string | null };
  createdBy: { name: string };
  sharedWith: { sharedWith: { id: string; name: string } }[];
}

const categories = ['bereavement', 'prayer', 'health', 'financial', 'academic', 'other'];

export default function IssuesPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [departmentLeads, setDepartmentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ memberId: '', category: 'prayer', title: '', description: '', shareWithAll: false, sharedWithIds: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchData = () => {
    Promise.all([
      fetch('/api/issues').then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
      fetch('/api/department-leads').then(r => r.json()).catch(() => []),
    ]).then(([i, m, s]) => { setIssues(i); setMembers(m); setDepartmentLeads(s); setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/issues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { showToast('Issue logged'); setShowModal(false); setForm({ memberId: '', category: 'prayer', title: '', description: '', shareWithAll: false, sharedWithIds: [] }); fetchData(); }
    setSaving(false);
  };

  const toggleResolved = async (id: string, current: boolean) => {
    await fetch(`/api/issues/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: !current }) });
    showToast(!current ? 'Issue resolved' : 'Issue reopened'); fetchData();
  };

  const toggleLead = (id: string) => {
    setForm(prev => ({ ...prev, sharedWithIds: prev.sharedWithIds.includes(id) ? prev.sharedWithIds.filter(s => s !== id) : [...prev.sharedWithIds, id] }));
  };

  const filtered = filter === 'all' ? issues : filter === 'open' ? issues.filter(i => !i.resolved) : filter === 'resolved' ? issues.filter(i => i.resolved) : issues.filter(i => i.category === filter);

  const categoryBadges: Record<string, string> = { bereavement: 'badge-purple', prayer: 'badge-blue', health: 'badge-red', financial: 'badge-orange', academic: 'badge-gold', other: 'badge-gray' };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}
      <div className="page-header">
        <div>
          <h1>Issues</h1>
          <p className="subtitle">{issues.filter(i => !i.resolved).length} open issues</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log Issue
        </button>
      </div>

      <div className="tabs">
        {['all', 'open', 'resolved', ...categories].map(f => (
          <button key={f} className={`tab-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <h3>No issues found</h3><p>No issues match the current filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(issue => (
            <div key={issue.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', letterSpacing: '-0.01em' }}>{issue.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{issue.member.firstName} {issue.member.lastName} · by {issue.createdBy.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <span className={`badge ${issue.resolved ? 'badge-green' : categoryBadges[issue.category] || 'badge-gray'}`}>
                    {issue.resolved ? 'Resolved' : issue.category}
                  </span>
                  {issue.shareWithAll && <span className="badge badge-blue">All</span>}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>{issue.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(issue.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <button onClick={() => toggleResolved(issue.id, issue.resolved)} className={`btn btn-sm ${issue.resolved ? 'btn-outline' : 'btn-primary'}`}>
                  {issue.resolved ? 'Reopen' : 'Resolve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Log Issue</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Member *</label><select className="form-select" required value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}><option value="">Select member</option>{members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Category *</label><select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" required placeholder="Brief title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" required placeholder="Describe the issue…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group">
                <label className="form-label">Sharing</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <label className="toggle-switch"><input type="checkbox" checked={form.shareWithAll} onChange={e => setForm({...form, shareWithAll: e.target.checked})} /><span className="toggle-slider" /></label>
                  <span style={{ fontSize: '13px' }}>Share with all department leads</span>
                </div>
                {!form.shareWithAll && departmentLeads.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {departmentLeads.filter(s => s.role === 'department_lead').map(s => (
                      <button key={s.id} type="button" onClick={() => toggleLead(s.id)} className={`btn btn-sm ${form.sharedWithIds.includes(s.id) ? 'btn-primary' : 'btn-outline'}`}>{s.name}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Log Issue'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
