'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { JOINABLE_DEPARTMENTS, getDepartmentName } from '@/lib/departments';

const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Postgraduate'];

export default function RegisterPage() {
  const params = useParams();
  const token = params.token as string;
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    dateOfBirth: '', programme: '', hostel: '',
    yearOfStudy: '', residence: '', department: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    let photoUrl = '';
    if (photo) {
      const fd = new FormData();
      fd.append('file', photo);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        photoUrl = data.url;
      }
    }

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, photoUrl, isPublic: true, token }),
    });

    if (res.ok) {
      setSelectedDept(form.department);
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
    }
    setSubmitting(false);
  };

  const selectedDeptInfo = JOINABLE_DEPARTMENTS.find(d => d.id === form.department);

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060E1A',
        padding: '24px',
        position: 'relative',
      }}>
        <div style={{ position: 'fixed', top: '-400px', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(197,162,85,0.06), transparent 70%)', pointerEvents: 'none' }} />
        <div className="slide-up" style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--green-soft)', border: '1px solid rgba(52,199,89,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>Registration Complete</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Welcome to PHANET KNUST, {form.firstName}!
            {selectedDept ? ` You have been added to the ${getDepartmentName(selectedDept)} department.` : ''}
          </p>

          {/* Department info card */}
          {selectedDept && (
            <div style={{
              background: 'rgba(197,162,85,0.06)',
              border: '1px solid rgba(197,162,85,0.15)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              maxWidth: 360,
              margin: '0 auto',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                Your Department
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', letterSpacing: '-0.01em', color: 'var(--gold)' }}>
                {getDepartmentName(selectedDept)}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {JOINABLE_DEPARTMENTS.find(d => d.id === selectedDept)?.description}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px', lineHeight: 1.5 }}>
                Your department lead will reach out to you. God bless you!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060E1A',
      padding: '24px',
      position: 'relative',
    }}>
      <div style={{ position: 'fixed', top: '-400px', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(197,162,85,0.06), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '20px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '14px',
            background: 'linear-gradient(135deg, #C5A255, #D4B56A)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#060E1A', fontSize: '16px',
            margin: '0 auto 16px',
            boxShadow: '0 4px 20px rgba(197, 162, 85, 0.2)',
          }}>P</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px', color: '#E8ECF1' }}>
            Member Registration
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>PHANET KNUST</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-soft)', border: '1px solid rgba(255,59,48,0.15)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
            color: '#D70015', fontSize: '13px', fontWeight: 500,
          }}>{error}</div>
        )}

        <div className="card slide-up">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" type="tel" required placeholder="+233…" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Date of Birth *</label><input className="form-input" type="date" required value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Programme of Study *</label><input className="form-input" required placeholder="e.g. Computer Science" value={form.programme} onChange={e => setForm({...form, programme: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label">Hostel / Hall</label><input className="form-input" placeholder="e.g. Unity Hall" value={form.hostel} onChange={e => setForm({...form, hostel: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Year of Study *</label><select className="form-select" required value={form.yearOfStudy} onChange={e => setForm({...form, yearOfStudy: e.target.value})}><option value="">Select</option>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Place of Residence</label><input className="form-input" placeholder="e.g. Ayeduase" value={form.residence} onChange={e => setForm({...form, residence: e.target.value})} /></div>

            {/* Department selection */}
            <div className="form-group">
              <label className="form-label">Department *</label>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Choose a department you would like to be part of.</p>
              <select className="form-select" required value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                <option value="">Select a department</option>
                {JOINABLE_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Department description */}
            {selectedDeptInfo && (
              <div style={{
                background: 'rgba(197,162,85,0.06)',
                border: '1px solid rgba(197,162,85,0.15)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gold)', marginBottom: '4px' }}>
                  {selectedDeptInfo.name}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedDeptInfo.description}
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Photo</label>
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--white)', color: 'var(--text-primary)' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
              {submitting ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</> : 'Submit Registration'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>PHANET KNUST · Pastor Stefan Danquah</p>
      </div>
    </div>
  );
}
