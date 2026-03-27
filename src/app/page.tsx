'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') {
      router.push('/dashboard');
    }

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [status, router]);

  if (!mounted) return null;

  const heroParallax = scrollY * 0.3;
  const heroOpacity = Math.max(0.15, 1 - scrollY / 700);

  return (
    <div className="lp">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ====== CORE ====== */
        .lp {
          --navy: #060E1A;
          --navy-mid: #0C1829;
          --gold: #C5A255;
          --gold-light: #E4CA7A;
          --gold-dim: rgba(197, 162, 85, 0.12);
          --white: #FFFFFF;
          --white-60: rgba(255,255,255,0.6);
          --white-30: rgba(255,255,255,0.3);
          --white-08: rgba(255,255,255,0.08);
          --white-04: rgba(255,255,255,0.04);

          min-height: 100vh;
          background: var(--navy);
          color: var(--white);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ====== AMBIENT ====== */
        .lp-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .lp-glow-1 {
          position: absolute;
          width: 1200px;
          height: 1200px;
          top: -500px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(197, 162, 85, 0.08) 0%, transparent 70%);
        }
        .lp-glow-2 {
          position: absolute;
          width: 800px;
          height: 800px;
          bottom: -300px;
          right: -200px;
          background: radial-gradient(circle, rgba(30, 95, 187, 0.06) 0%, transparent 70%);
        }
        .lp-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 50% at 50% 0%, transparent 50%, var(--navy) 100%);
        }

        /* ====== ANIMATIONS ====== */
        @keyframes reveal {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealScale {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .reveal { animation: reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .reveal-scale { animation: revealScale 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.3s; }
        .d3 { animation-delay: 0.5s; }
        .d4 { animation-delay: 0.7s; }
        .d5 { animation-delay: 0.9s; }
        .d6 { animation-delay: 1.1s; }

        /* ====== HEADER ====== */
        .lp-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 56px;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-header.scrolled {
          padding: 16px 56px;
          background: rgba(6, 14, 26, 0.85);
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);
          border-bottom: 1px solid var(--white-04);
        }
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          color: var(--white);
        }
        .lp-logo-mark {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 16px;
          color: var(--navy);
          box-shadow: 0 4px 20px rgba(197, 162, 85, 0.25);
        }
        .lp-logo-text {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .lp-logo-text span { color: var(--gold); }
        .lp-header-btn {
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          color: var(--white);
          background: var(--white-08);
          border: 1px solid var(--white-08);
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(12px);
        }
        .lp-header-btn:hover {
          background: var(--white-04);
          border-color: var(--white-30);
          transform: translateY(-1px);
        }

        /* ====== HERO ====== */
        .lp-hero {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 140px 32px 80px;
          max-width: 100vw;
        }
        .lp-hero-overline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 32px;
        }
        .lp-hero-overline::before,
        .lp-hero-overline::after {
          content: '';
          width: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold));
        }
        .lp-hero-overline::before {
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        .lp-hero-title {
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 0.95;
          color: var(--white);
          margin-bottom: 32px;
          max-width: 800px;
        }
        .lp-hero-title em {
          font-style: normal;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lp-hero-sub {
          font-size: clamp(15px, 1.8vw, 18px);
          line-height: 1.8;
          color: var(--white-30);
          max-width: 440px;
          margin-bottom: 56px;
          font-weight: 400;
        }
        .lp-hero-cta {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }
        .lp-btn-primary {
          padding: 16px 44px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          color: var(--navy);
          box-shadow: 0 12px 40px rgba(197, 162, 85, 0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-btn-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(197, 162, 85, 0.4), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .lp-btn-secondary {
          padding: 16px 36px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--white-08);
          cursor: pointer;
          background: var(--white-04);
          color: var(--white-60);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-btn-secondary:hover {
          color: var(--white);
          border-color: var(--white-30);
          transform: translateY(-2px);
          background: var(--white-08);
        }

        /* ====== HERO VISUAL ====== */
        .lp-hero-visual {
          position: relative;
          width: 100%;
          max-width: 720px;
          margin-top: 80px;
          animation: float 8s ease-in-out infinite;
        }
        .lp-hero-visual img {
          width: 100%;
          height: auto;
          border-radius: 24px;
          filter: drop-shadow(0 40px 80px rgba(197, 162, 85, 0.12));
        }
        .lp-hero-visual::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: linear-gradient(135deg, rgba(197, 162, 85, 0.2), transparent 50%, rgba(30, 95, 187, 0.15));
          z-index: -1;
          filter: blur(1px);
        }

        /* ====== DIVIDER ====== */
        .lp-section-divider {
          width: 64px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          margin: 0 auto;
          animation: lineGrow 1s ease-out forwards;
          transform-origin: center;
        }

        /* ====== SHOWCASE ====== */
        .lp-showcase {
          position: relative;
          z-index: 10;
          padding: 160px 56px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .lp-showcase-header {
          text-align: center;
          margin-bottom: 100px;
        }
        .lp-showcase-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
        }
        .lp-showcase-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: var(--white);
          margin-bottom: 20px;
        }
        .lp-showcase-desc {
          font-size: 16px;
          color: var(--white-30);
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Feature Cards */
        .lp-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .lp-feature {
          background: linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
          border: 1px solid var(--white-04);
          border-radius: 24px;
          padding: 44px 36px;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .lp-feature::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: radial-gradient(circle at 30% 0%, rgba(197, 162, 85, 0.06), transparent 60%);
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .lp-feature:hover::before { opacity: 1; }
        .lp-feature:hover {
          transform: translateY(-8px);
          border-color: rgba(197, 162, 85, 0.12);
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
        }
        .lp-feature-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: var(--gold-dim);
          border: 1px solid rgba(197, 162, 85, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lp-feature:hover .lp-feature-icon {
          transform: scale(1.1) rotate(3deg);
        }
        .lp-feature-icon svg {
          stroke: var(--gold);
          width: 24px; height: 24px;
        }
        .lp-feature-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--white);
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .lp-feature-desc {
          font-size: 14px;
          color: var(--white-30);
          line-height: 1.7;
        }

        /* ====== DASHBOARD VISUAL ====== */
        .lp-dashboard {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 56px 160px;
        }
        .lp-dashboard-frame {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 60px 120px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .lp-dashboard-frame img {
          width: 100%;
          height: auto;
          display: block;
        }
        .lp-dashboard-frame::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(197, 162, 85, 0.4), transparent);
        }
        .lp-dashboard-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: linear-gradient(180deg, transparent 60%, var(--navy) 100%);
          pointer-events: none;
        }

        /* ====== CTA ====== */
        .lp-cta {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 56px 160px;
          max-width: 700px;
          margin: 0 auto;
        }
        .lp-cta-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: var(--white);
          margin-bottom: 20px;
        }
        .lp-cta-desc {
          font-size: 16px;
          color: var(--white-30);
          margin-bottom: 48px;
          line-height: 1.7;
        }

        /* ====== FOOTER ====== */
        .lp-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 40px 56px;
          border-top: 1px solid var(--white-04);
        }
        .lp-footer-text {
          font-size: 12px;
          color: var(--white-30);
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .lp-footer-text span { color: var(--gold); }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 1024px) {
          .lp-features { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .lp-header { padding: 16px 24px; }
          .lp-header.scrolled { padding: 12px 24px; }
          .lp-hero { padding: 140px 24px 60px; min-height: auto; }
          .lp-hero-visual { margin-top: 48px; }
          .lp-features { grid-template-columns: 1fr; gap: 16px; }
          .lp-feature { padding: 32px 28px; }
          .lp-showcase { padding: 100px 24px; }
          .lp-showcase-header { margin-bottom: 60px; }
          .lp-dashboard { padding: 0 24px 100px; }
          .lp-cta { padding: 0 24px 100px; }
          .lp-footer { padding: 32px 24px; }
          .lp-hero-cta { flex-direction: column; width: 100%; }
          .lp-btn-primary, .lp-btn-secondary { width: 100%; justify-content: center; }
        }
      `}} />

      {/* Ambient Background */}
      <div className="lp-bg">
        <div className="lp-glow-1" />
        <div className="lp-glow-2" />
        <div className="lp-vignette" />
      </div>

      {/* Header */}
      <header className={`lp-header ${scrollY > 20 ? 'scrolled' : ''}`}>
        <Link href="/" className="lp-logo">
          <div className="lp-logo-mark">P</div>
          <div className="lp-logo-text">PHANET <span>KNUST</span></div>
        </Link>
        <Link href="/login" className="lp-header-btn">
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <section className="lp-hero" ref={heroRef}>
        <div
          className="lp-hero-overline reveal d1"
        >
          Leadership Portal
        </div>

        <h1
          className="lp-hero-title reveal d2"
          style={{ transform: `translateY(${heroParallax}px)`, opacity: heroOpacity }}
        >
          Serve every<br /><em>member</em>
        </h1>

        <p className="lp-hero-sub reveal d3">
          The management platform built for department leads who lead with excellence.
        </p>

        <div className="lp-hero-cta reveal d4">
          <Link href="/login" className="lp-btn-primary">
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <Link href="/register/public" className="lp-btn-secondary">
            Join as Member
          </Link>
        </div>

        <div className="lp-hero-visual reveal-scale d5" style={{ transform: `translateY(${heroParallax * 0.5}px)` }}>
          <img
            src="/images/hero-graphic.png"
            alt="Premium leadership platform"
            loading="eager"
          />
        </div>
      </section>

      {/* Section Divider */}
      <div className="lp-section-divider" />

      {/* Showcase */}
      <section className="lp-showcase">
        <div className="lp-showcase-header">
          <div className="lp-showcase-label reveal d1">Capabilities</div>
          <h2 className="lp-showcase-title reveal d2">
            Everything you need.<br />Nothing you don&apos;t.
          </h2>
          <p className="lp-showcase-desc reveal d3">
            Purpose-built tools for shepherding, tracking, and growing your department.
          </p>
        </div>

        <div className="lp-features">
          <div className="lp-feature reveal d1">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="lp-feature-title">Member Directory</h3>
            <p className="lp-feature-desc">Full profiles with photos, contact details, and department assignments at a glance.</p>
          </div>

          <div className="lp-feature reveal d2">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <h3 className="lp-feature-title">Live Attendance</h3>
            <p className="lp-feature-desc">Mark and track attendance for every service with real-time department breakdowns.</p>
          </div>

          <div className="lp-feature reveal d3">
            <div className="lp-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="lp-feature-title">Finances</h3>
            <p className="lp-feature-desc">Transparent records for offerings, tithes, and department budgets — all in one place.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="lp-dashboard">
        <div className="lp-dashboard-frame reveal-scale d2">
          <img
            src="/images/dashboard-preview.png"
            alt="Dashboard experience preview"
            loading="lazy"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2 className="lp-cta-title reveal d1">
          Ready to lead<br />with clarity?
        </h2>
        <p className="lp-cta-desc reveal d2">
          Access your dashboard and start managing your department today.
        </p>
        <div className="reveal d3">
          <Link href="/login" className="lp-btn-primary">
            Access Dashboard
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <p className="lp-footer-text">
          © 2025 <span>PHANET KNUST</span> · Built with purpose
        </p>
      </footer>
    </div>
  );
}
