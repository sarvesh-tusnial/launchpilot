'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [checking, setChecking]     = useState(true)
  const [error, setError]           = useState('')
  const [resetMode, setResetMode]   = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent]   = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { router.replace('/dashboard') } else { setChecking(false) }
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    })
    if (authError) { setError('Incorrect email or password.'); setLoading(false); return }
    const res  = await fetch('/api/auth/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.user.id }),
    })
    const json = await res.json()
    if (json.isAdmin) { router.push('/admin') }
    else if (json.status === 'active') { router.push('/dashboard') }
    else { setError('Your account is pending. Please contact support.'); await supabase.auth.signOut() }
    setLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) { setError('Please enter your email'); return }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setLoading(false)
    if (resetError) { setError(resetError.message) } else { setResetSent(true) }
  }

  const s: Record<string, React.CSSProperties> = {
    page:   { minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' },
    nav:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', borderBottom: '1px solid var(--border)', flexShrink: 0 },
    body:   { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' },
    card:   { width: '100%', maxWidth: '420px' },
    label:  { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '6px' },
    input:  { width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    btn:    { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' },
    error:  { padding: '12px 16px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '10px', fontSize: '14px', color: '#F97066' },
  }

  if (checking) return <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>Loading...</div></div>

  if (resetMode) return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none' }}>
          Launch<span style={{ color: 'var(--accent)' }}>Pilot</span>
        </Link>
      </nav>
      <div style={s.body}>
        <div style={s.card}>
          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.02em' }}>Check your email</h1>
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '28px' }}>Reset link sent to <strong>{resetEmail}</strong>.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false) }} style={s.btn}>Back to Sign In</button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em' }}>Reset password</h1>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '28px' }}>We'll send a reset link to your email.</p>
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" placeholder="you@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                </div>
                {error && <div style={s.error}>{error}</div>}
                <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>
              <button onClick={() => { setResetMode(false); setError('') }} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px' }}>
                ← Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none' }}>
          Launch<span style={{ color: 'var(--accent)' }}>Pilot</span>
        </Link>
        <Link href="/apply" style={{ fontSize: '13px', color: 'var(--accent2)', textDecoration: 'none', fontWeight: '600' }}>Apply →</Link>
      </nav>

      <div style={s.body}>
        <div style={s.card}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: 'clamp(28px, 7vw, 36px)', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>Welcome back.</h1>
            <p style={{ fontSize: '15px', color: 'var(--text2)' }}>Sign in to continue your launch journey.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Password</label>
                <button type="button" onClick={() => { setResetMode(true); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0 }}>
                  Forgot?
                </button>
              </div>
              <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            {error && <div style={s.error}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--text3)' }}>
              New to LaunchPilot?{' '}
              <Link href="/apply" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: '600' }}>Apply for a spot →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
