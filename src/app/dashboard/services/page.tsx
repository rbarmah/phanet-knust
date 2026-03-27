'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Service {
  id: string; name: string; date: string; type: string; description: string | null;
  _count: { attendance: number; finances: number };
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', type: 'regular', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchServices = () => { fetch('/api/services').then(r => r.json()).then(data => { setServices(data); setLoading(false); }); };
  useEffect(() => { fetchServices(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { showToast('Service created'); setShowModal(false); setForm({ name: '', date: '', type: 'regular', description: '' }); fetchServices(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' }); showToast('Service deleted'); fetchServices();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const typeMap: Record<string, {label: string; badge: string}> = {
    regular: { label: 'Regular', badge: 'badge-gold' },
    allnight: { label: 'All-Night', badge: 'badge-blue' },
    special: { label: 'Special', badge: 'badge-green' },
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}
      <div className="page-header">
        <div>
          <h1>Services</h1>
          <p className="subtitle">{services.length} services</p>
        </div>
        {isAdmin && <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Service
        </button>}
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <h3>No services yet</h3><p>Admin can create church services for attendance tracking.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {services.map(s => (
            <div key={s.id} className="card card-gold">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', letterSpacing: '-0.01em' }}>{s.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(s.date)}</p>
                </div>
                <span className={`badge ${typeMap[s.type]?.badge || 'badge-gray'}`}>{typeMap[s.type]?.label || s.type}</span>
              </div>
              {s.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>{s.description}</p>}
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '14px' }}>{s._count.attendance} attendance records</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Link href={`/dashboard/attendance/${s.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Take Attendance</Link>
                {isAdmin && <button onClick={() => handleDelete(s.id)} className="btn btn-outline btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Create Service</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Service Name *</label><input className="form-input" required placeholder="e.g. Sunday Worship" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Date & Time *</label><input className="form-input" type="datetime-local" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="regular">Regular Service</option><option value="allnight">All-Night Meeting</option><option value="special">Special Service</option></select></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" placeholder="Optional description…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
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
