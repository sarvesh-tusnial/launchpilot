'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [isFirstTime, setIsFirstTime] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard')
      } else {
        setChecking(false)
      }
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmedId = studentId.trim().toUpperCase()

    // Look up the email associated with this student ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, onboarding_completed')
      .eq('student_id', trimmedId)
      .single()

    if (profileError || !profile) {
      setError('Student ID not found. Please check your ID and try again.')
      setLoading(false)
      return
    }

    // Sign in with the email behind the student ID
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    if (authError) {
      setError('Incorrect password. Please try again.')
      setLoading(false)
      return
    }

    if (data.user) {
      if (!profile.onboarding_completed) {
        setIsFirstTime(true)
        setLoading(false)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  if (checking) {
    return (
      <div style={styles.center}>
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (isFirstTime) {
    return (
      <div style={styles.center}>
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeIcon}>🎓</div>
          <h1 style={styles.welcomeTitle}>Welcome to Mentogram.</h1>
          <p style={styles.welcomeSub}>
            Before you start, Maya — your personal AI mentor — needs to know who you are.
            A quick interview. Your answers shape every session from here on.
          </p>
          <div style={styles.welcomeNote}>Taking you there now...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <Link href="/" style={styles.logo}>
            Mento<span style={{ color: 'var(--accent2)' }}>gram</span>
          </Link>
          <div style={styles.tagline}>
            The world's first AI-native university.
          </div>
          <div style={styles.features}>
            {[
              { icon: '🤖', text: 'Maya — your AI mentor, available 24/7' },
              { icon: '🎓', text: '60+ competencies, 20+ programs, mastery-based' },
              { icon: '🌍', text: 'Immersions across 8 cities globally' },
              { icon: '📜', text: 'A credential that proves what you can do' },
            ].map(f => (
              <div key={f.text} style={styles.featureRow}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formWrap}>
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Welcome back.</h1>
            <p style={styles.formSub}>Sign in with your Mentogram Student ID.</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Student ID</label>
              <div style={styles.idInputWrap}>
                <span style={styles.idPrefix}>MG-</span>
                <input
                  style={styles.idInput}
                  placeholder="2025-001"
                  value={studentId.replace(/^MG-/i, '')}
                  onChange={e => setStudentId('MG-' + e.target.value.toUpperCase())}
                  autoComplete="username"
                  autoCapitalize="characters"
                  required
                />
              </div>
              <div style={styles.fieldHint}>
                Issued to you when your application was approved.
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have a Student ID?{' '}
              <Link href="/apply" style={styles.applyLink}>Apply to Mentogram →</Link>
            </p>
            <p style={{ ...styles.footerText, marginTop: '8px' }}>
              Lost your ID or password?{' '}
              <a href="mailto:sarvesh@launchpilotschool.com" style={styles.applyLink}>
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: 'var(--bg)',
  },
  left: {
    width: '420px',
    flexShrink: 0,
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '48px 40px',
  },
  leftInner: {
    width: '100%',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text)',
    textDecoration: 'none',
    fontFamily: 'Georgia, serif',
    display: 'block',
    marginBottom: '32px',
  },
  tagline: {
    fontSize: '13px',
    fontFamily: 'DM Mono, monospace',
    color: 'var(--text3)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid var(--border)',
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  featureIcon: {
    fontSize: '20px',
    flexShrink: 0,
    width: '28px',
  },
  featureText: {
    fontSize: '14px',
    color: 'var(--text2)',
    lineHeight: 1.5,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
  },
  formWrap: {
    width: '100%',
    maxWidth: '400px',
  },
  formHeader: {
    marginBottom: '36px',
  },
  formTitle: {
    fontSize: '32px',
    fontWeight: '700',
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.02em',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  formSub: {
    fontSize: '14px',
    color: 'var(--text2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text)',
  },
  fieldHint: {
    fontSize: '11px',
    color: 'var(--text3)',
    fontFamily: 'DM Mono, monospace',
    marginTop: '4px',
  },
  idInputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg2)',
    overflow: 'hidden',
  },
  idPrefix: {
    padding: '11px 12px 11px 14px',
    fontSize: '14px',
    fontFamily: 'DM Mono, monospace',
    color: 'var(--accent2)',
    fontWeight: '600',
    borderRight: '1px solid var(--border)',
    background: 'var(--bg3)',
    flexShrink: 0,
  },
  idInput: {
    flex: 1,
    padding: '11px 14px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'DM Mono, monospace',
    outline: 'none',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg2)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  errorBox: {
    background: 'rgba(249,112,102,0.1)',
    border: '1px solid rgba(249,112,102,0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--coral, #F97066)',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent2)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
    marginTop: '4px',
  },
  footer: {
    marginTop: '28px',
    paddingTop: '24px',
    borderTop: '1px solid var(--border)',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text3)',
    textAlign: 'center' as const,
  },
  applyLink: {
    color: 'var(--accent2)',
    textDecoration: 'none',
    fontWeight: '500',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  loading: {
    fontSize: '13px',
    color: 'var(--text3)',
    fontFamily: 'DM Mono, monospace',
  },
  welcomeCard: {
    maxWidth: '480px',
    textAlign: 'center' as const,
  },
  welcomeIcon: {
    fontSize: '48px',
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    fontFamily: 'Georgia, serif',
    color: 'var(--text)',
    marginBottom: '16px',
  },
  welcomeSub: {
    fontSize: '15px',
    color: 'var(--text2)',
    lineHeight: 1.7,
  },
  welcomeNote: {
    marginTop: '24px',
    fontSize: '13px',
    color: 'var(--text3)',
    fontFamily: 'DM Mono, monospace',
  },
}
