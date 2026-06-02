'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking,     setChecking]     = useState(true)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event — fires when Supabase processes the token from URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setValidSession(true)
        setChecking(false)
      } else if (event === 'SIGNED_IN' && session) {
        // Token already exchanged — session exists
        setValidSession(true)
        setChecking(false)
      }
    })

    // Fallback — check for existing session after short delay
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setValidSession(true)
      }
      setChecking(false)
    }, 1500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      // Sign out so they log in fresh with new password
      await supabase.auth.signOut()
      setTimeout(() => router.push('/auth/login'), 3000)
    }
  }

  if (checking) return (
    <div style={styles.center}>
      <div style={styles.loading}>Verifying reset link...</div>
    </div>
  )

  if (!validSession) return (
    <div style={styles.center}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h1 style={styles.title}>Link expired or invalid</h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '24px' }}>
          This password reset link has expired or already been used. Request a new one from the login page.
        </p>
        <Link href="/auth/login" style={{ ...styles.btn, display: 'inline-block', textDecoration: 'none', textAlign: 'center' as const }}>
          Back to Sign In →
        </Link>
      </div>
    </div>
  )

  if (success) return (
    <div style={styles.center}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h1 style={styles.title}>Password updated</h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7 }}>
          Your password has been changed. Taking you to sign in...
        </p>
      </div>
    </div>
  )

  return (
    <div style={styles.center}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none', fontFamily: 'Georgia, serif', display: 'block', marginBottom: '8px' }}>
            Mento<span style={{ color: 'var(--accent2)' }}>gram</span>
          </Link>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Set new password
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={styles.label}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters" autoComplete="new-password" style={styles.input} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={styles.label}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password" autoComplete="new-password" style={styles.input} required />
            </div>
            {error && (
              <div style={{ background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#F97066' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.6 : 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600' }}>
              {loading ? 'Updating...' : 'Set New Password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  center:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif', color: 'var(--text)' },
  loading: { fontSize: '13px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' },
  title:   { fontSize: '24px', fontWeight: '700', color: 'var(--text)', marginBottom: '12px', fontFamily: 'Georgia, serif' },
  label:   { fontSize: '13px', fontWeight: '500', color: 'var(--text)' },
  input:   { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  btn:     { width: '100%', padding: '13px', borderRadius: '8px', background: 'var(--accent2)', color: '#fff', display: 'block', textAlign: 'center' as const },
}
