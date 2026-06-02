'use client'
import { useState } from 'react'
import Link from 'next/link'

const PATHWAYS = [
  { code: 'P01', emoji: '🤖', name: 'Launch an AI Tech Business' },
  { code: 'P02', emoji: '🎓', name: 'Launch a Course Business' },
  { code: 'P03', emoji: '💼', name: 'Launch a Consulting Business' },
  { code: 'P04', emoji: '🏪', name: 'Launch a Marketplace' },
  { code: 'P05', emoji: '📦', name: 'Launch an E-commerce Business' },
  { code: 'P06', emoji: '👗', name: 'Launch a Fashion D2C Brand' },
  { code: 'P07', emoji: '📚', name: 'Launch an EdTech Business' },
  { code: 'P08', emoji: '🌐', name: 'Build a Community Business' },
  { code: 'P09', emoji: '🎬', name: 'Launch a Content Creation Business' },
  { code: 'P10', emoji: '💻', name: 'Launch a Freelancing Business' },
]

export default function ApplyPage() {
  const [step, setStep]               = useState(1)
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [jobTitle, setJobTitle]       = useState('')
  const [experience, setExperience]   = useState('')
  const [selectedPathway, setSelectedPathway] = useState('')
  const [motivation, setMotivation]   = useState('')
  const [businessIdea, setBusinessIdea] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async () => {
    if (!fullName || !email || !selectedPathway || !motivation) {
      setError('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, jobTitle, experience, selectedPathway, motivation, businessIdea }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSubmitting(false); return }
    setSubmitted(true)
    setSubmitting(false)
  }

  const styles: Record<string, React.CSSProperties> = {
    page:    { minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif', color: 'var(--text)' },
    nav:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', borderBottom: '1px solid var(--border)' },
    logo:    { fontSize: '18px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none' },
    body:    { maxWidth: '560px', margin: '0 auto', padding: '40px 20px 80px' },
    label:   { display: 'block', fontSize: '11px', color: 'var(--text3)', marginBottom: '6px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
    input:   { width: '100%', padding: '13px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    btn:     { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
    backBtn: { padding: '15px 24px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
    error:   { padding: '12px 16px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '10px', fontSize: '14px', color: '#F97066' },
  }

  if (submitted) return (
    <div style={styles.page}>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>🚀</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.02em' }}>Application submitted!</h1>
          <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: '1.7', marginBottom: '32px' }}>
            Hey {fullName.split(' ')[0]} — we've received your application for <strong style={{ color: 'var(--accent2)' }}>{PATHWAYS.find(p => p.code === selectedPathway)?.name}</strong>. We'll send your login credentials within 24 hours.
          </p>
          <Link href="/" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '15px', width: '100%', textAlign: 'center', boxSizing: 'border-box' as const }}>
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>
          Launch<span style={{ color: 'var(--accent)' }}>Pilot</span>
        </Link>
        <Link href="/auth/login" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>Sign in</Link>
      </nav>

      <div style={styles.body}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: '10px' }}>
            Apply · Step {step} of 3
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '8px' }}>
            {step === 1 ? 'Tell us about yourself.' : step === 2 ? 'Pick your pathway.' : 'Almost there.'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>
            {step === 1 ? 'A few quick details to personalise your experience.' : step === 2 ? 'Pick the business you want to launch.' : 'Tell us about your idea and why now.'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? 'var(--accent)' : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={styles.label}>Full Name *</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Current Job Title</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Marketing Manager" style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Years of Work Experience</label>
              <select value={experience} onChange={e => setExperience(e.target.value)} style={{ ...styles.input, appearance: 'none' as const }}>
                <option value="">Select...</option>
                <option value="0-2">0–2 years</option>
                <option value="3-5">3–5 years</option>
                <option value="6-10">6–10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button onClick={() => { if (!fullName || !email) { setError('Name and email are required'); return } setError(''); setStep(2) }} style={styles.btn}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {PATHWAYS.map(p => (
                <button key={p.code} onClick={() => setSelectedPathway(p.code)} style={{
                  padding: '14px 12px', borderRadius: '12px', textAlign: 'left' as const, cursor: 'pointer',
                  background: selectedPathway === p.code ? 'rgba(108,71,255,0.1)' : 'var(--bg2)',
                  border: `1px solid ${selectedPathway === p.code ? 'rgba(108,71,255,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{p.emoji}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: selectedPathway === p.code ? 'var(--text)' : 'var(--text2)', lineHeight: '1.3' }}>{p.name}</div>
                </button>
              ))}
            </div>
            {error && <div style={{ ...styles.error, marginBottom: '16px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} style={styles.backBtn}>← Back</button>
              <button onClick={() => { if (!selectedPathway) { setError('Please select a pathway'); return } setError(''); setStep(3) }} style={{ ...styles.btn, flex: 1 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={styles.label}>What's your business idea? *</label>
              <textarea value={businessIdea} onChange={e => setBusinessIdea(e.target.value)}
                placeholder="Describe your idea in a sentence or two. It's okay if it's rough."
                rows={3} style={{ ...styles.input, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={styles.label}>Why do you want to launch this now? *</label>
              <textarea value={motivation} onChange={e => setMotivation(e.target.value)}
                placeholder="What's driving you? Why is now the right time?"
                rows={4} style={{ ...styles.input, resize: 'vertical' as const }} />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} style={styles.backBtn}>← Back</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ ...styles.btn, flex: 1, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Submitting...' : 'Submit →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
