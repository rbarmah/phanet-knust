'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Service { id: string; name: string; date: string; type: string; _count: { attendance: number }; }

export default function AttendancePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/services').then(r => r.json()).then(data => { setServices(data); setLoading(false); }); }, []);

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p className="subtitle">Select a service to take or view attendance</p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
          <h3>No services available</h3><p>Create a service first to start taking attendance.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {services.map(s => {
            const isPast = new Date(s.date) < new Date();
            return (
              <Link href={`/dashboard/attendance/${s.id}`} key={s.id} className="card card-interactive" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`badge ${isPast ? 'badge-gray' : 'badge-green'}`}>{isPast ? 'Past' : 'Upcoming'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s._count.attendance} records</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', letterSpacing: '-0.01em' }}>{s.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
