'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEPARTMENTS, getDepartmentName } from '@/lib/departments';

interface DeptLead { id: string; name: string; email: string; phone: string | null; role: string; department: string | null; memberCount: number; createdAt: string; }

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [leads, setLeads] = useState<DeptLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'department_lead', department: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [formLink, setFormLink] = useState('');

  useEffect(() => {
    if (!isAdmin && session) { router.push('/dashboard'); return; }
    fetch('/api/department-leads').then(r => r.json()).then(data => { setLeads(data); setLoading(false); }).catch(() => setLoading(false));
  }, [isAdmin, session]);

  useEffect(() => { setFormLink(`${window.location.origin}/register/public`); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/department-leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { showToast('Account created'); setShowModal(false); setForm({ name: '', email: '', password: '', phone: '', role: 'department_lead', department: '' }); fetch('/api/department-leads').then(r => r.json()).then(setLeads); }
    else { const data = await res.json(); showToast(data.error || 'Failed'); }
    setSaving(false);
  };

  const copyLink = () => { navigator.clipboard.writeText(formLink); showToast('Link copied'); };

  if (!isAdmin || loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  const totalMembers = leads.reduce((s, sh) => s + sh.memberCount, 0);

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Manage department leads and system</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Department Lead
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div className="stat-value">{leads.filter(s => s.role === 'department_lead').length}</div>
          <div className="stat-label">Dept. Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div className="stat-value">{leads.filter(s => s.role === 'admin').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div className="stat-value">{totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card card-interactive" onClick={copyLink}>
          <div className="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
          <div className="stat-value" style={{ fontSize: '13px' }}>Copy Link</div>
          <div className="stat-label">Registration Form</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Registration Form Link</div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Share this with new members:</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input className="form-input" value={formLink} readOnly style={{ flex: 1, background: 'var(--surface-raised)', fontSize: '13px' }} />
          <button onClick={copyLink} className="btn btn-primary btn-sm">Copy</button>
        </div>
      </div>

      <div className="section-label">Department Leads &amp; Admins</div>
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Department</th><th style={{textAlign:'right'}}>Members</th><th>Joined</th></tr></thead>
          <tbody>
            {leads.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ fontSize: '13px' }}>{s.email}</td>
                <td style={{ fontSize: '13px' }}>{s.phone || '—'}</td>
                <td><span className={`badge ${s.role === 'admin' ? 'badge-gold' : 'badge-blue'}`}>{s.role === 'admin' ? 'Admin' : 'Dept. Lead'}</span></td>
                <td style={{ fontSize: '13px' }}>{s.department ? getDepartmentName(s.department) : '—'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.memberCount}</td>
                <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Add Account</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required placeholder="John Mensah" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required placeholder="john@phanet.org" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" required placeholder="Set password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+233…" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option value="department_lead">Department Lead</option><option value="admin">Admin</option></select></div>
              </div>
              {form.role === 'department_lead' && (
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" required value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
