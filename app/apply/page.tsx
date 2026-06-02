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

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.02em' }}>Application submitted!</h1>
        <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: '1.7', marginBottom: '32px' }}>
          Hey {fullName.split(' ')[0]} — we've received your application for <strong style={{ color: 'var(--accent2)' }}>{PATHWAYS.find(p => p.code === selectedPathway)?.name}</strong>. We'll review it and send your login credentials within 24 hours.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          Back to homepage
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '64px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none' }}>
          Launch<span style={{ color: 'var(--accent)' }}>Pilot</span>
        </Link>
        <Link href="/auth/login" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>Already have an account? Sign in →</Link>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
            Apply · Step {step} of 3
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '8px' }}>
            {step === 1 ? 'Tell us about yourself.' : step === 2 ? 'Pick your launch pathway.' : 'Almost there.'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text2)' }}>
            {step === 1 ? 'A few quick details so we can personalise your experience.' : step === 2 ? 'Pick the business you want to launch. You can always ask Maya about the others.' : 'Tell us about your idea and why you\'re ready to launch.'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '40px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? 'var(--accent)' : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>

        {/* Step 1 — Personal details */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Current Job Title</label>
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Marketing Manager" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Years of Work Experience</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} style={inputStyle}>
                  <option value="">Select...</option>
                  <option value="0-2">0–2 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="6-10">6–10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <button onClick={() => { if (!fullName || !email) { setError('Name and email are required'); return } setError(''); setStep(2) }} style={btnStyle}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Pick pathway */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
              {PATHWAYS.map(p => (
                <button key={p.code} onClick={() => setSelectedPathway(p.code)} style={{
                  padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                  background: selectedPathway === p.code ? 'rgba(108,71,255,0.1)' : 'var(--bg2)',
                  border: `1px solid ${selectedPathway === p.code ? 'rgba(108,71,255,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{p.emoji}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedPathway === p.code ? 'var(--text)' : 'var(--text2)', lineHeight: '1.3' }}>{p.name}</div>
                </button>
              ))}
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{ ...btnStyle, background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)', flex: '0 0 auto', padding: '13px 24px' }}>← Back</button>
              <button onClick={() => { if (!selectedPathway) { setError('Please select a pathway'); return } setError(''); setStep(3) }} style={{ ...btnStyle, flex: 1 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Motivation */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>What's your business idea? *</label>
              <textarea value={businessIdea} onChange={e => setBusinessIdea(e.target.value)} placeholder="Describe your idea in a sentence or two. It's okay if it's rough — that's what Maya is for." rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={labelStyle}>Why do you want to launch this now? *</label>
              <textarea value={motivation} onChange={e => setMotivation(e.target.value)} placeholder="What's driving you? What have you tried before? Why is now the right time?" rows={4}
                style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={{ ...btnStyle, background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)', flex: '0 0 auto', padding: '13px 24px' }}>← Back</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ ...btnStyle, flex: 1, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Submitting...' : 'Submit Application →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const btnStyle: React.CSSProperties = { width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }
const errorStyle: React.CSSProperties = { padding: '10px 14px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F97066' }
