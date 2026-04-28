'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, setAuth } from '@/lib/store';
import { Target, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('admin@leadfinder.io');
  const [password, setPassword] = useState('admin123');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const auth = getAuth() as any;
    if (auth.isLoggedIn) router.push('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (email === 'admin@leadfinder.io' && password === 'admin123') {
      setAuth({ isLoggedIn: true, user: { name: 'Admin User', email, role: 'admin' } });
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use admin@leadfinder.io / admin123');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#eff6ff 100%)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--accent)', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(29,78,216,0.3)',
          }}>
            <Target size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Lead Finder</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Business Intelligence Platform</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 20, padding: '34px 30px',
          boxShadow: '0 8px 40px rgba(15,23,42,0.10)',
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 26 }}>Sign in to your account to continue</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-email" className="form-input" type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@leadfinder.io"
                  style={{ paddingLeft: 34 }} required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-password" className="form-input"
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: 34, paddingRight: 38 }} required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--red-light)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button id="login-btn" className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 2 }}>
              {loading ? <><span className="spinner" style={{ width: 15, height: 15, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{ marginTop: 22, padding: '11px 14px', background: '#f8faff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Demo credentials</strong><br />
            admin@leadfinder.io &nbsp;/&nbsp; admin123
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Lead Finder. All rights reserved.
        </p>
      </div>
    </div>
  );
}
