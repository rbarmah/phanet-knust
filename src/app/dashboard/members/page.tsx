'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { JOINABLE_DEPARTMENTS, getDepartmentName } from '@/lib/departments';

interface Member {
  id: string; firstName: string; lastName: string;
  phone: string | null; email: string | null; dateOfBirth: string | null;
  programme: string | null; hostel: string | null; yearOfStudy: string | null;
  residence: string | null; photoUrl: string | null;
  department: string | null; createdAt: string;
}

const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Postgraduate'];

function MembersContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMine, setFilterMine] = useState(false);
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true');
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    dateOfBirth: '', programme: '', hostel: '',
    yearOfStudy: '', residence: '', department: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchMembers = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterMine) params.set('filter', 'mine');
    fetch(`/api/members?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setMembers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, [search, filterMine]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openNew = () => {
    setEditMember(null);
    setForm({ firstName: '', lastName: '', phone: '', email: '', dateOfBirth: '', programme: '', hostel: '', yearOfStudy: '', residence: '', department: '' });
    setPhoto(null);
    setPhotoPreview(null);
    setShowModal(true);
  };

  const openEdit = (m: Member) => {
    setEditMember(m);
    setForm({
      firstName: m.firstName, lastName: m.lastName,
      phone: m.phone || '', email: m.email || '',
      dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split('T')[0] : '',
      programme: m.programme || '', hostel: m.hostel || '',
      yearOfStudy: m.yearOfStudy || '', residence: m.residence || '',
      department: m.department || '',
    });
    setPhoto(null);
    setPhotoPreview(m.photoUrl || null);
    setShowModal(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let photoUrl: string | undefined = undefined;

    // Upload photo if selected
    if (photo) {
      const fd = new FormData();
      fd.append('file', photo);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        photoUrl = data.url;
      }
    }

    const url = editMember ? `/api/members/${editMember.id}` : '/api/members';
    const method = editMember ? 'PUT' : 'POST';
    const payload = { ...form, ...(photoUrl !== undefined ? { photoUrl } : {}) };

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      showToast(editMember ? 'Member updated' : 'Member added');
      setShowModal(false);
      fetchMembers();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Member deleted'); fetchMembers(); }
  };

  const copyFormLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register/public`);
    showToast('Form link copied to clipboard');
  };

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="page-header">
        <div>
          <h1>Members</h1>
          <p className="subtitle">{members.length} {filterMine ? 'in your department' : 'total members'}</p>
        </div>
        <div className="page-header-actions">
          <button onClick={copyFormLink} className="btn btn-outline btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Copy Link
          </button>
          <button onClick={openNew} className="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Member
          </button>
        </div>
      </div>

      {/* Search + filter row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search by name, email, or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setFilterMine(!filterMine)}
          className={`btn btn-sm ${filterMine ? 'btn-primary' : 'btn-outline'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          My Department
        </button>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <h3>{filterMine ? 'No members in your department' : 'No members yet'}</h3>
          <p>{filterMine ? 'Members in your department will appear here.' : 'Add members or share the registration form link.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Contact</th>
                <th>Programme</th>
                <th>Year</th>
                <th>Department</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {m.photoUrl ? <img src={m.photoUrl} className="avatar" alt="" /> : <div className="avatar avatar-placeholder">{m.firstName[0]}{m.lastName[0]}</div>}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.firstName} {m.lastName}</div>
                        {m.residence && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{m.residence}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{m.phone || '—'}</div>
                    {m.email && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{m.email}</div>}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.programme || '—'}</td>
                  <td>{m.yearOfStudy ? <span className="badge badge-gold">{m.yearOfStudy}</span> : <span style={{color:'var(--text-tertiary)', fontSize:'12px'}}>—</span>}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.department ? getDepartmentName(m.department) : '—'}</td>
                  <td style={{textAlign:'right'}}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <Link href={`/dashboard/members/${m.id}`} className="btn btn-outline btn-sm">View</Link>
                      <button onClick={() => openEdit(m)} className="btn btn-ghost btn-sm">Edit</button>
                      {isAdmin && <button onClick={() => handleDelete(m.id)} className="btn btn-danger btn-sm">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal with photo upload */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editMember ? 'Edit Member' : 'Add New Member'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave}>
              {/* Photo upload */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                  ) : (
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'var(--gold-soft)', border: '2px dashed var(--gold-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange}
                    style={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Programme</label><input className="form-input" value={form.programme} onChange={e => setForm({...form, programme: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Hostel / Hall</label><input className="form-input" value={form.hostel} onChange={e => setForm({...form, hostel: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Year of Study</label><select className="form-select" value={form.yearOfStudy} onChange={e => setForm({...form, yearOfStudy: e.target.value})}><option value="">Select</option>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              </div>
              <div className="form-group"><label className="form-label">Place of Residence</label><input className="form-input" value={form.residence} onChange={e => setForm({...form, residence: e.target.value})} /></div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                  <option value="">Select department</option>
                  {JOINABLE_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : editMember ? 'Update' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner spinner-lg" /></div>}>
      <MembersContent />
    </Suspense>
  );
}
