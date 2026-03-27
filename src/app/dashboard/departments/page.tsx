'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DEPARTMENTS, getDepartmentName } from '@/lib/departments';

interface DeptLead {
  id: string; name: string; email: string; phone: string | null;
  role: string; department: string | null; memberCount: number; createdAt: string;
}

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [leads, setLeads] = useState<DeptLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [createdCreds, setCreatedCreds] = useState<{ email: string; tempPassword: string; phone: string | null; name: string; department: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/department-leads').then(r => r.json()).then(data => { setLeads(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/department-leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      setCreatedCreds({ email: data.email, tempPassword: data.tempPassword, phone: data.phone, name: data.name, department: data.department });
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', department: '' });
      fetch('/api/department-leads').then(r => r.json()).then(setLeads);
      showToast('Department Lead account created — send credentials via WhatsApp');
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to create');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  const deptLeads = leads.filter(s => s.role === 'department_lead');
  const adminsList = leads.filter(s => s.role === 'admin');

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p className="subtitle">{deptLeads.length} department leads · {adminsList.length} admins</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Department Lead
          </button>
        )}
      </div>

      {/* Created credentials display */}
      {createdCreds && (
        <div className="card card-gold" style={{ marginBottom: '20px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}><polyline points="20 6 9 17 4 12"/></svg>
                Account Created — Credentials
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Send the login credentials to the new department lead via WhatsApp.</p>
              <div style={{ background: 'var(--surface-raised)', borderRadius: '8px', padding: '12px', fontSize: '13px', fontFamily: 'monospace', marginBottom: '12px' }}>
                <div><strong>Email:</strong> {createdCreds.email}</div>
                <div><strong>Temp Password:</strong> {createdCreds.tempPassword}</div>
                {createdCreds.department && <div><strong>Department:</strong> {getDepartmentName(createdCreds.department)}</div>}
              </div>
              {createdCreds.phone && (
                <a
                  href={`https://wa.me/${createdCreds.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${createdCreds.name} \u{1F44B}\n\nYou have been added as a *Department Lead* on the PHANET KNUST platform.\n${createdCreds.department ? `\n\u{1F3E2} *Department:* ${getDepartmentName(createdCreds.department)}\n` : ''}\n\u{1F510} *Your Login Credentials:*\nEmail: ${createdCreds.email}\nTemporary Password: ${createdCreds.tempPassword}\n\n\u{26A0}\u{FE0F} You will be required to *change your password* on your first login.\n\n\u{2014} PHANET KNUST`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-sm" style={{ background: '#25D366', color: '#fff', display: 'inline-flex', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Send via WhatsApp
                </a>
              )}
            </div>
            <button className="modal-close" onClick={() => setCreatedCreds(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Department Leads list */}
      <div className="section-label">Department Leads</div>
      {deptLeads.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px' }}>
          <p>No department leads have been added yet.</p>
        </div>
      ) : (
        <div className="cards-grid" style={{ marginBottom: '28px' }}>
          {deptLeads.map(s => (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className="avatar avatar-lg avatar-placeholder">{s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>{s.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {s.department && <span className="badge badge-gold">{getDepartmentName(s.department)}</span>}
                <span className="badge badge-blue">{s.memberCount} members</span>
                {s.phone && <span className="badge badge-gray">{s.phone}</span>}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Joined {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {s.phone && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <a href={`tel:${s.phone}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call
                  </a>
                  <a href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admins list */}
      <div className="section-label">Admins</div>
      <div className="cards-grid">
        {adminsList.map(s => (
          <div key={s.id} className="card" style={{ borderColor: 'var(--gold-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar avatar-lg avatar-placeholder">{s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>{s.name}</h3>
                  <span className="badge badge-gold">Admin</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{s.email}</p>
                {s.phone && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s.phone}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create department lead modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Add Department Lead</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required placeholder="John Mensah" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required placeholder="john@phanet.org" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Leave blank to auto-generate" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>If left blank, a temporary password will be auto-generated.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+233…" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" required value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
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
