'use client';

import { useEffect, useState } from 'react';
import { getDepartmentName } from '@/lib/departments';

interface BirthdayMember {
  id: string; firstName: string; lastName: string;
  dateOfBirth: string; phone: string | null; email: string | null;
  photoUrl: string | null; department: string | null;
}

export default function BirthdaysPage() {
  const [members, setMembers] = useState<BirthdayMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { fetch('/api/birthdays').then(r => r.json()).then(data => { setMembers(data); setLoading(false); }); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const isToday = (dateStr: string) => { const d = new Date(dateStr); return d.getDate() === today.getDate() && d.getMonth() === today.getMonth(); };
  const getAge = (dateStr: string) => { const d = new Date(dateStr); let age = today.getFullYear() - d.getFullYear(); const m = today.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--; return age; };

  const sendWhatsApp = (member: BirthdayMember) => {
    if (!member.phone) { showToast('No phone number available'); return; }
    const phone = member.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Happy Birthday, ${member.firstName}!\n\nOn behalf of PHANET KNUST, I want to wish you a very Happy Birthday and many more blessed years ahead! May the good Lord shower you with His abundant grace and favour on this special day and always.\n\nGod bless you richly!\n\nWith love,\nPastor Stefan Danquah\nPHANET KNUST`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    showToast('WhatsApp opened');
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  const todayBirthdays = members.filter(m => isToday(m.dateOfBirth));
  const upcomingBirthdays = members.filter(m => !isToday(m.dateOfBirth));

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="page-header">
        <div>
          <h1>Birthdays</h1>
          <p className="subtitle">{monthNames[today.getMonth()]} · {members.length} birthdays</p>
        </div>
      </div>

      {todayBirthdays.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="section-label">Today&apos;s Birthdays</div>
          <div className="cards-grid">
            {todayBirthdays.map(m => (
              <div key={m.id} className="card card-gold" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {m.photoUrl ? <img src={m.photoUrl} className="avatar avatar-lg" alt="" /> : <div className="avatar avatar-lg avatar-placeholder">{m.firstName[0]}{m.lastName[0]}</div>}
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>{m.firstName} {m.lastName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>Turns {getAge(m.dateOfBirth)} today</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{m.department ? getDepartmentName(m.department) : 'No department'}</p>
                  </div>
                </div>
                <button onClick={() => sendWhatsApp(m)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Send Birthday Message
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-label">{todayBirthdays.length > 0 ? 'Other Birthdays This Month' : 'This Month'}</div>

      {upcomingBirthdays.length === 0 && todayBirthdays.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <h3>No birthdays this month</h3><p>Members with birthdays in {monthNames[today.getMonth()]} will appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {upcomingBirthdays.map(m => {
            const bday = new Date(m.dateOfBirth);
            const isPast = bday.getDate() < today.getDate();
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
                opacity: isPast ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  {m.photoUrl ? <img src={m.photoUrl} className="avatar" alt="" /> : <div className="avatar avatar-placeholder">{m.firstName[0]}{m.lastName[0]}</div>}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.firstName} {m.lastName}{isPast && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>past</span>}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{bday.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} · Turns {getAge(m.dateOfBirth) + (isPast ? 0 : 1)}</div>
                  </div>
                </div>
                <button onClick={() => sendWhatsApp(m)} className="btn btn-outline btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  WhatsApp
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
