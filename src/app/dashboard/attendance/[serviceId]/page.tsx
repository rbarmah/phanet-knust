'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Member { id: string; firstName: string; lastName: string; photoUrl: string | null; phone: string | null; }
interface AttendanceRecord { id: string; memberId: string; present: boolean; autoMarked: boolean; member: Member; }

export default function TakeAttendancePage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const [service, setService] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/services/${serviceId}`).then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
      fetch(`/api/attendance?serviceId=${serviceId}`).then(r => r.json()),
    ]).then(([svc, mem, att]) => {
      setService(svc); setMembers(mem);
      const m = new Map<string, boolean>();
      att.forEach((a: AttendanceRecord) => m.set(a.memberId, a.present));
      setAttendance(m); setLoading(false);
    });
  }, [serviceId]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const toggleAttendance = async (memberId: string) => {
    const newStatus = !attendance.get(memberId);
    setAttendance(prev => { const n = new Map(prev); n.set(memberId, newStatus); return n; });
    const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId, memberId, present: newStatus }) });
    if (res.ok) showToast(newStatus ? 'Marked present' : 'Marked absent');
  };

  const filteredMembers = members.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) || (m.phone && m.phone.includes(search))
  );

  const presentCount = Array.from(attendance.values()).filter(v => v).length;

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {toast && <div className="toast toast-success">{toast}</div>}

      <div style={{ marginBottom: '16px' }}>
        <Link href="/dashboard/attendance" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Attendance
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>{service?.name}</h1>
          <p className="subtitle">{service && new Date(service.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="stat-card" style={{ padding: '10px 18px', margin: 0 }}>
            <div className="stat-value" style={{ fontSize: '20px' }}>{presentCount}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-card" style={{ padding: '10px 18px', margin: 0 }}>
            <div className="stat-value" style={{ fontSize: '20px' }}>{members.length - presentCount}</div>
            <div className="stat-label">Absent</div>
          </div>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: '16px' }}>
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredMembers.map(m => {
          const isPresent = attendance.get(m.id) || false;
          return (
            <div key={m.id} className="attendance-item" style={{ cursor: 'pointer' }} onClick={() => toggleAttendance(m.id)}>
              <div className="member-info">
                {m.photoUrl ? <img src={m.photoUrl} className="avatar" alt="" /> : <div className="avatar avatar-placeholder">{m.firstName[0]}{m.lastName[0]}</div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.firstName} {m.lastName}</div>
                  {m.phone && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{m.phone}</div>}
                </div>
              </div>
              <div style={{
                width: 42, height: 24, borderRadius: 12,
                background: isPresent ? 'var(--green)' : 'var(--text-quaternary)',
                position: 'relative', transition: 'background 0.2s ease',
                flexShrink: 0,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3, left: isPresent ? 21 : 3,
                  transition: 'left 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }} />
              </div>
            </div>
          );
        })}
        {filteredMembers.length === 0 && <div className="empty-state" style={{ padding: '24px' }}><p>No members match your search.</p></div>}
      </div>
    </div>
  );
}
