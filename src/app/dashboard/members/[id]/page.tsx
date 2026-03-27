'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DEPARTMENTS, getDepartmentName } from '@/lib/departments';

interface MemberDetail {
  id: string; firstName: string; lastName: string;
  phone: string | null; email: string | null; dateOfBirth: string | null;
  programme: string | null; hostel: string | null; yearOfStudy: string | null;
  residence: string | null; photoUrl: string | null;
  department: string | null;
  issues: any[]; attendance: any[]; createdAt: string;
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [toast, setToast] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteDepartment, setPromoteDepartment] = useState('');
  const [promotedCreds, setPromotedCreds] = useState<{ email: string; tempPassword: string; phone: string | null; name: string; department: string | null } | null>(null);

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then(r => r.json())
      .then(data => { setMember(data); setPromoteEmail(data.email || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handlePromote = async () => {
    if (!promoteEmail) { showToast('Email is required for promotion'); return; }
    setPromoting(true);
    const res = await fetch(`/api/members/${params.id}/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: promoteEmail, department: promoteDepartment || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowPromoteModal(false);
      const waPhone = (data.phone || '').replace(/[^0-9]/g, '');
      const deptName = data.department ? getDepartmentName(data.department) : '';
      const waLink = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${data.name} \u{1F44B}\n\nYou have been added as a *Department Lead* on the PHANET KNUST platform.${deptName ? `\n\n\u{1F3E2} *Department:* ${deptName}` : ''}\n\n\u{1F510} *Your Login Credentials:*\nEmail: ${data.email}\nTemporary Password: ${data.tempPassword}\n\n\u{26A0}\u{FE0F} You will be required to *change your password* on your first login.\n\n\u{2014} PHANET KNUST`)}` : '';
      if (waLink) window.open(waLink, '_blank');
      alert(`${member?.firstName} promoted to Department Lead!${deptName ? ` (${deptName})` : ''}\n\nLogin: ${data.email}\nTemp Password: ${data.tempPassword}\n\nSave these credentials — they won't be shown again.`);
      router.push('/dashboard/members');
    } else {
      const data = await res.json();
      showToast(data.error || 'Promotion failed');
    }
    setPromoting(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  if (!member) return <div className="empty-state"><h3>Member not found</h3></div>;

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const totalAttended = member.attendance.filter((a: any) => a.present).length;

  const infoFields = [
    { label: 'Phone', value: member.phone },
    { label: 'Email', value: member.email },
    { label: 'Date of Birth', value: formatDate(member.dateOfBirth) },
    { label: 'Programme', value: member.programme },
    { label: 'Hostel / Hall', value: member.hostel },
    { label: 'Year of Study', value: member.yearOfStudy },
    { label: 'Residence', value: member.residence },
    { label: 'Department', value: member.department ? getDepartmentName(member.department) : null },
    { label: 'Registered', value: formatDate(member.createdAt) },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {toast && <div className="toast toast-success">{toast}</div>}

      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/members" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Members
        </Link>
      </div>

      {/* Promoted credentials */}
      {promotedCreds && (
        <div className="card card-gold" style={{ marginBottom: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: 'var(--green)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}><polyline points="20 6 9 17 4 12"/></svg>
                Promoted to Department Lead
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Send the credentials to the new department lead via WhatsApp.</p>
              <div style={{ background: 'var(--surface-raised)', borderRadius: '8px', padding: '12px', fontSize: '13px', fontFamily: 'monospace', marginBottom: '12px' }}>
                <div><strong>Email:</strong> {promotedCreds.email}</div>
                <div><strong>Temp Password:</strong> {promotedCreds.tempPassword}</div>
                {promotedCreds.department && <div><strong>Department:</strong> {getDepartmentName(promotedCreds.department)}</div>}
              </div>
              {promotedCreds.phone && (
                <a
                  href={`https://wa.me/${promotedCreds.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${promotedCreds.name} \u{1F44B}\n\nYou have been added as a *Department Lead* on the PHANET KNUST platform.${promotedCreds.department ? `\n\n\u{1F3E2} *Department:* ${getDepartmentName(promotedCreds.department)}` : ''}\n\n\u{1F510} *Your Login Credentials:*\nEmail: ${promotedCreds.email}\nTemporary Password: ${promotedCreds.tempPassword}\n\n\u{26A0}\u{FE0F} You will be required to *change your password* on your first login.\n\n\u{2014} PHANET KNUST`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-sm" style={{ background: '#25D366', color: '#fff', display: 'inline-flex', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Send via WhatsApp
                </a>
              )}
            </div>
            <button className="modal-close" onClick={() => setPromotedCreds(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card" style={{ marginBottom: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {member.photoUrl ? (
            <img src={member.photoUrl} className="avatar avatar-xl" alt="" />
          ) : (
            <div className="avatar avatar-xl avatar-placeholder">{member.firstName[0]}{member.lastName[0]}</div>
          )}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
              {member.firstName} {member.lastName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px' }}>
              {member.programme || 'No programme'} · {member.yearOfStudy || 'Year N/A'}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-gold">{member.department ? getDepartmentName(member.department) : 'No department'}</span>
              {member.dateOfBirth && <span className="badge badge-blue">{formatDate(member.dateOfBirth)}</span>}
              {isAdmin && (
                <button onClick={() => setShowPromoteModal(true)} className="btn btn-outline btn-sm" style={{ marginLeft: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Promote to Dept. Lead
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>{totalAttended}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Attended</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>{member.issues.length}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-item ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Bio Info</button>
        <button className={`tab-item ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
        <button className={`tab-item ${tab === 'issues' ? 'active' : ''}`} onClick={() => setTab('issues')}>Issues</button>
      </div>

      {tab === 'info' && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {infoFields.map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{item.value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card" style={{ padding: member.attendance.length ? 0 : undefined, overflow: 'hidden' }}>
          {member.attendance.length === 0 ? (
            <div className="empty-state"><p>No attendance records</p></div>
          ) : member.attendance.map((a: any) => (
            <div key={a.id} className="attendance-item">
              <div className="member-info">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.present ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{a.service.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {new Date(a.service.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <span className={`badge ${a.present ? 'badge-green' : 'badge-red'}`}>
                {a.present ? 'Present' : 'Absent'}{a.autoMarked ? ' (auto)' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'issues' && (
        <div className="card" style={{ padding: member.issues.length ? 0 : undefined, overflow: 'hidden' }}>
          {member.issues.length === 0 ? (
            <div className="empty-state"><p>No issues logged</p></div>
          ) : member.issues.map((issue: any) => (
            <div key={issue.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '14px' }}>{issue.title}</h4>
                <span className={`badge ${issue.resolved ? 'badge-green' : 'badge-gold'}`}>{issue.resolved ? 'Resolved' : issue.category}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{issue.description}</p>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                {issue.createdBy?.name} · {new Date(issue.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promote modal */}
      {showPromoteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPromoteModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>Promote to Department Lead</h2>
              <button className="modal-close" onClick={() => setShowPromoteModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              This will create a Department Lead login account for <strong>{member.firstName} {member.lastName}</strong>. A temporary password will be generated. They will be asked to change it on first login.
            </p>
            <div className="form-group">
              <label className="form-label">Email for Login *</label>
              <input className="form-input" type="email" required placeholder="member@email.com" value={promoteEmail}
                onChange={e => setPromoteEmail(e.target.value)} />
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Login credentials will be sent to this email.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={promoteDepartment} onChange={e => setPromoteDepartment(e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowPromoteModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handlePromote} className="btn btn-primary" style={{ flex: 1 }} disabled={promoting}>
                {promoting ? 'Promoting…' : 'Promote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
