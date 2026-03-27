'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface FinanceRecord {
  id: string; serviceId: string; offering: number; tithe: number; otherIncome: number; notes: string | null;
  service: { id: string; name: string; date: string; type: string };
}

export default function FinancesPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ serviceId: '', offering: '', tithe: '', otherIncome: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchData = () => {
    Promise.all([fetch('/api/finances').then(r => r.json()), fetch('/api/services').then(r => r.json())])
      .then(([f, s]) => { setFinances(f); setServices(s); setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/finances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: form.serviceId, offering: parseFloat(form.offering) || 0, tithe: parseFloat(form.tithe) || 0, otherIncome: parseFloat(form.otherIncome) || 0, notes: form.notes || null }) });
    if (res.ok) { showToast('Finance record saved'); setShowModal(false); setForm({ serviceId: '', offering: '', tithe: '', otherIncome: '', notes: '' }); fetchData(); }
    setSaving(false);
  };

  const editRecord = (f: FinanceRecord) => { setForm({ serviceId: f.serviceId, offering: f.offering.toString(), tithe: f.tithe.toString(), otherIncome: f.otherIncome.toString(), notes: f.notes || '' }); setShowModal(true); };

  const totalOffering = finances.reduce((s, f) => s + f.offering, 0);
  const totalTithe = finances.reduce((s, f) => s + f.tithe, 0);
  const totalOther = finances.reduce((s, f) => s + f.otherIncome, 0);
  const grandTotal = totalOffering + totalTithe + totalOther;
  const fmt = (n: number) => `GH₵ ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}
      <div className="page-header">
        <div>
          <h1>Finances</h1>
          <p className="subtitle">Offerings and tithes per service</p>
        </div>
        {isAdmin && <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Record Finance
        </button>}
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Income', value: fmt(grandTotal) },
          { label: 'Offerings', value: fmt(totalOffering) },
          { label: 'Tithes', value: fmt(totalTithe) },
          { label: 'Other Income', value: fmt(totalOther) },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div className="stat-value" style={{ fontSize: '18px' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {finances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <h3>No financial records</h3><p>Admin can record offerings and tithes per service.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Service</th><th>Date</th><th style={{textAlign:'right'}}>Offering</th><th style={{textAlign:'right'}}>Tithe</th><th style={{textAlign:'right'}}>Other</th><th style={{textAlign:'right'}}>Total</th>{isAdmin && <th style={{textAlign:'right'}}>Actions</th>}</tr></thead>
            <tbody>
              {finances.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.service.name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(f.service.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(f.offering)}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(f.tithe)}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(f.otherIncome)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt(f.offering + f.tithe + f.otherIncome)}</td>
                  {isAdmin && <td style={{textAlign:'right'}}><button onClick={() => editRecord(f)} className="btn btn-ghost btn-sm">Edit</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Record Finance</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Service *</label><select className="form-select" required value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})}><option value="">Select</option>{services.map(s => <option key={s.id} value={s.id}>{s.name} — {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Offering (GH₵)</label><input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.offering} onChange={e => setForm({...form, offering: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Tithe (GH₵)</label><input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.tithe} onChange={e => setForm({...form, tithe: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Other (GH₵)</label><input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.otherIncome} onChange={e => setForm({...form, otherIncome: e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" placeholder="Optional…" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
