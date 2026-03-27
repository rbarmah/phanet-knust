'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [changeError, setChangeError] = useState('');

  // Check if user needs to change password after login
  useEffect(() => {
    if (session && (session.user as any)?.mustChangePassword) {
      setShowPasswordChange(true);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Explicitly fetch the fresh session to check mustChangePassword
      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        if (sessionData?.user?.mustChangePassword) {
          setShowPasswordChange(true);
          setLoading(false);
          return; // Stay on login page, show password change
        }
      } catch {
        // If session fetch fails, still redirect
      }
      
      setLoading(false);
      router.push('/dashboard');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (newPassword.length < 6) {
      setChangeError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: password || currentPassword, newPassword }),
    });

    if (res.ok) {
      // Update session to clear the mustChangePassword flag
      await updateSession({ mustChangePassword: false });
      setShowPasswordChange(false);
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setChangeError(data.error || 'Failed to change password');
    }
    setChangingPassword(false);
  };

  // Password change modal
  if (showPasswordChange) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060E1A',
        padding: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ position: 'fixed', top: '-400px', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(197,162,85,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div className="slide-up" style={{
          background: '#0F1D30',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: 'clamp(28px, 5vw, 40px)',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '14px',
              background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.20)',
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#E8ECF1', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              Change Your Password
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.6 }}>
              For security, you need to set a new password before continuing.
            </p>
          </div>

          {changeError && (
            <div style={{
              background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
              color: '#FF6B6B', fontSize: '13px', fontWeight: 500,
            }}>{changeError}</div>
          )}

          <form onSubmit={handlePasswordChange}>
            {!password && (
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" required
                  value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Your temporary password" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" required
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" required
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={changingPassword}>
              {changingPassword ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Changing…</>
              ) : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060E1A',
      padding: '24px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-400px', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(197,162,85,0.06), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-300px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(96,165,250,0.04), transparent 70%)', pointerEvents: 'none' }} />

      <div className="slide-up" style={{
        background: '#0F1D30',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: 'clamp(28px, 5vw, 40px)',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo & Title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '14px',
            background: 'linear-gradient(135deg, #C5A255, #D4B56A)',
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', fontWeight: 800, color: '#060E1A',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(197, 162, 85, 0.2)',
          }}>P</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#E8ECF1', letterSpacing: '-0.04em', marginBottom: '6px' }}>
            Sign in
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
            PHANET KNUST · Leadership Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '20px',
            color: '#FF6B6B', fontSize: '13px', fontWeight: 500,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="you@phanet.org"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Enter password"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</>
            ) : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: '24px', paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', color: 'rgba(255,255,255,0.35)',
        }}>
          Are you a new member?{' '}
          <a href="/register/public" style={{ color: '#C5A255', fontWeight: 600 }}>Register here</a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner spinner-lg" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
