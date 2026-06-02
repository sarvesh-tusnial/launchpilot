'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [checking, setChecking]   = useState(true)
  const [error, setError]         = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
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
      email: email.trim().toLowerCase(),
      password,
    })
    if (authError) { setError('Incorrect email or password.'); setLoading(false); return }

    const res  = await fetch('/api/auth/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.user.id }),
    })
    const json = await res.json()

    if (json.isAdmin) {
      router.push('/admin')
    } else if (json.status === 'active') {
      router.push('/dashboard')
    } else {
      setError('Your account is pending. Please contact LaunchPilot support.')
      await supabase.auth.signOut()
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) { setError('Please enter your email'); return }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setLoading(false)
    if (resetError) { setError(resetError.message) } else { setResetSent(true) }
  }

  if (checking) return <div style={styles.center}><div style={styles.loading}>Loading...</div></div>

  const LeftPanel = () => (
    <div style={styles.left}>
      <div style={styles.leftInner}>
        <Link href="/" style={styles.logo}>
          Launch<span style={{ color: 'var(--accent2)' }}>Pilot</span>
        </Link>
        <div style={styles.tagline}>From idea to first revenue. No excuses.</div>
        <div style={styles.features}>
          {[
            { icon: '🚀', text: '10 launch pathways — pick yours and go' },
            { icon: '🤖', text: 'Maya — your AI launch coach, available 24/7' },
            { icon: '💰', text: '25 steps from idea to first paying customer' },
            { icon: '⚡', text: 'Built for working professionals with limited time' },
          ].map(f => (
            <div key={f.text} style={styles.featureRow}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (resetMode) return (
    <div style={styles.page}>
      <LeftPanel />
      <div style={styles.right}>
        <div style={styles.formWrap}>
          {resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
              <h1 style={{ ...styles.formTitle, marginBottom: '12px' }}>Check your email</h1>
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '28px' }}>
                Reset link sent to <strong>{resetEmail}</strong>.
              </p>
              <button onClick={() => { setResetMode(false); setResetSent(false) }} style={styles.submitBtn}>Back to Sign In</button>
            </div>
          ) : (
            <>
              <div style={styles.formHeader}>
                <h1 style={styles.formTitle}>Reset password</h1>
                <p style={styles.formSub}>We'll send you a reset link.</p>
              </div>
              <form onSubmit={handleForgotPassword} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" placeholder="you@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                </div>
                {error && <div style={styles.errorBox}>{error}</div>}
                <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>
              <div style={styles.footer}>
                <button onClick={() => { setResetMode(false); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0 }}>
                  ← Back to sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <LeftPanel />
      <div style={styles.right}>
        <div style={styles.formWrap}>
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Welcome back.</h1>
            <p style={styles.formSub}>Sign in to continue your launch journey.</p>
          </div>
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <div style={styles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Password</label>
                <button type="button" onClick={() => { setResetMode(true); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontSize: '12px', fontWeight: '500', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            {error && <div style={styles.errorBox}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div style={styles.footer}>
            <p style={styles.footerText}>
              New to LaunchPilot?{' '}
              <Link href="/apply" style={styles.applyLink}>Get started →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:        { minHeight: '100vh', display: 'flex', background: 'var(--bg)' },
  left:        { width: '420px', flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '48px 40px' },
  leftInner:   { width: '100%' },
  logo:        { fontSize: '22px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontFamily: 'Georgia, serif', display: 'block', marginBottom: '32px' },
  tagline:     { fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' },
  features:    { display: 'flex', flexDirection: 'column', gap: '20px' },
  featureRow:  { display: 'flex', alignItems: 'center', gap: '14px' },
  featureIcon: { fontSize: '20px', flexShrink: 0, width: '28px' },
  featureText: { fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 },
  right:       { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' },
  formWrap:    { width: '100%', maxWidth: '400px' },
  formHeader:  { marginBottom: '36px' },
  formTitle:   { fontSize: '32px', fontWeight: '700', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '8px' },
  formSub:     { fontSize: '14px', color: 'var(--text2)' },
  form:        { display: 'flex', flexDirection: 'column', gap: '20px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '13px', fontWeight: '500', color: 'var(--text)' },
  input:       { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  errorBox:    { background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#F97066' },
  submitBtn:   { width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s', marginTop: '4px' },
  footer:      { marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border)' },
  footerText:  { fontSize: '13px', color: 'var(--text3)', textAlign: 'center' },
  applyLink:   { color: 'var(--accent2)', textDecoration: 'none', fontWeight: '500' },
  center:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loading:     { fontSize: '13px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' },
}
