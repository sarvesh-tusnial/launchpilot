'use client'
import { useState, useEffect } from 'react'

const STAGES = ['0-1 (idea stage)', '1-10 (early traction)', '10-100 (scaling)']
const CATEGORIES = ['SaaS', 'Marketplace', 'D2C / E-commerce', 'EdTech', 'FinTech', 'HealthTech', 'Community', 'Content', 'Consulting', 'Agency', 'Other']

type Copilot = {
  id: string
  slug: string
  founder_name: string
  business_name: string
  business_category: string
  email: string
  is_active: boolean
  created_at: string
  track_1_code: string
  track_2_code: string
  track_3_code: string
}

type NewCopilot = { slug: string; email: string; password: string; url: string; tracks: any[] }

export default function AdminCopilotsPage() {
  const [copilots, setCopilots]     = useState<Copilot[]>([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [error, setError]           = useState('')
  const [newCopilot, setNewCopilot] = useState<NewCopilot | null>(null)
  const [copied, setCopied]         = useState(false)
  const [showForm, setShowForm]     = useState(false)

  const [founderName, setFounderName]           = useState('')
  const [email, setEmail]                       = useState('')
  const [businessName, setBusinessName]         = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [businessStage, setBusinessStage]       = useState('0-1 (idea stage)')
  const [country, setCountry]                   = useState('India')
  const [track1Name, setTrack1Name]             = useState('Business Fundamentals')
  const [track2Name, setTrack2Name]             = useState('Revenue & Sales')
  const [track3Name, setTrack3Name]             = useState('Scale & Growth')

  const fetchCopilots = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/list-copilots')
    const data = await res.json()
    setCopilots(data.copilots || [])
    setLoading(false)
  }

  useEffect(() => { fetchCopilots() }, [])

  const handleCreate = async () => {
    if (!founderName || !email || !businessName || !businessCategory || !businessDescription) {
      setError('Please fill in all required fields')
      return
    }
    setCreating(true)
    setError('')
    setNewCopilot(null)

    const res = await fetch('/api/admin/create-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        founderName, email, businessName, businessCategory,
        businessDescription, businessStage, country,
        track1Name, track2Name, track3Name,
      }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
    } else {
      setNewCopilot(data)
      setShowForm(false)
      resetForm()
      fetchCopilots()
    }
    setCreating(false)
  }

  const resetForm = () => {
    setFounderName(''); setEmail(''); setBusinessName('')
    setBusinessCategory(''); setBusinessDescription('')
    setBusinessStage('0-1 (idea stage)'); setCountry('India')
    setTrack1Name('Business Fundamentals')
    setTrack2Name('Revenue & Sales')
    setTrack3Name('Scale & Growth')
  }

  const copyCredentials = () => {
    if (!newCopilot) return
    navigator.clipboard.writeText(
      `Your LaunchPilot Co-Pilot:\nURL: ${newCopilot.url}\nEmail: ${newCopilot.email}\nPassword: ${newCopilot.password}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'var(--bg3)',
    color: 'var(--text)', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', color: 'var(--text3)',
    marginBottom: '6px', fontFamily: 'DM Mono, monospace',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Personalised Co-Pilots</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
            Custom Maya instances — each with their own URL, business context, and AI-generated curriculum.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, marginTop: '8px' }}>
          {showForm ? 'Cancel' : '+ New Co-Pilot'}
        </button>
      </div>

      {/* New credentials card */}
      {newCopilot && (
        <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: '14px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>✓ Co-pilot created — share these details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {[
              { l: 'URL', v: newCopilot.url },
              { l: 'Email', v: newCopilot.email },
              { l: 'Password', v: newCopilot.password },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', width: '70px' }}>{r.l}</span>
                <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', fontFamily: r.l === 'Password' ? 'DM Mono, monospace' : 'inherit' }}>{r.v}</span>
              </div>
            ))}
          </div>
          {newCopilot.tracks && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Generated tracks</div>
              {newCopilot.tracks.map((t: any) => (
                <div key={t.code} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '3px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--accent)', fontSize: '11px' }}>{t.code}</span> — {t.name} ({t.concepts} concepts)
                </div>
              ))}
            </div>
          )}
          <button onClick={copyCredentials} style={{ padding: '8px 18px', borderRadius: '8px', background: copied ? 'rgba(0,200,81,0.1)' : 'var(--bg3)', border: `1px solid ${copied ? 'rgba(0,200,81,0.3)' : 'var(--border)'}`, color: copied ? '#00C851' : 'var(--text2)', fontSize: '13px', cursor: 'pointer' }}>
            {copied ? '✓ Copied!' : 'Copy credentials'}
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div style={{ marginBottom: '40px', padding: '28px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>New Co-Pilot</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '24px', padding: '8px 12px', background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.12)', borderRadius: '8px' }}>
            ✦ Claude will auto-generate 8 custom concepts per track based on the business description
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Founder Name *</label>
              <input value={founderName} onChange={e => setFounderName(e.target.value)} placeholder="Reyo" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="founder@business.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Business Name *</label>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Foliages" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={businessCategory} onChange={e => setBusinessCategory(e.target.value)} style={inputStyle}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Business Stage</label>
              <select value={businessStage} onChange={e => setBusinessStage(e.target.value)} style={inputStyle}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder="India" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Business Description * (what Maya will know about this business)</label>
            <textarea value={businessDescription} onChange={e => setBusinessDescription(e.target.value)}
              placeholder="What does the business do? Who are the customers? What problem does it solve? What stage is it at?"
              rows={4} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>Track Names (Claude generates 8 concepts per track)</label>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '12px' }}>Name each track based on what the founder needs to learn. Examples: "Idea Validation", "First Revenue", "Fundraising Prep"</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Track 1 (Active first)', value: track1Name, set: setTrack1Name, placeholder: 'Business Fundamentals' },
              { label: 'Track 2', value: track2Name, set: setTrack2Name, placeholder: 'Revenue & Sales' },
              { label: 'Track 3', value: track3Name, set: setTrack3Name, placeholder: 'Scale & Growth' },
            ].map(t => (
              <div key={t.label}>
                <label style={labelStyle}>{t.label}</label>
                <input value={t.value} onChange={e => t.set(e.target.value)} placeholder={t.placeholder} style={inputStyle} />
              </div>
            ))}
          </div>

          {error && <div style={{ padding: '10px 14px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F97066', marginBottom: '16px' }}>{error}</div>}

          <button onClick={handleCreate} disabled={creating} style={{ padding: '12px 28px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: creating ? 'wait' : 'pointer', opacity: creating ? 0.6 : 1 }}>
            {creating ? '⚡ Generating concepts & creating co-pilot...' : 'Create Co-Pilot →'}
          </button>
          {creating && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>Claude is generating custom concepts for this business — takes ~10 seconds</div>}
        </div>
      )}

      {/* List */}
      <div>
        <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          All Co-Pilots ({copilots.length})
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
        ) : copilots.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '8px' }}>No co-pilots yet</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Click "+ New Co-Pilot" to create one</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {copilots.map(c => (
              <div key={c.id} style={{ padding: '16px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{c.founder_name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>·</span>
                    <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{c.business_name}</span>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', background: 'rgba(108,71,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{c.business_category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>/copilot/{c.slug}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Tracks: {[c.track_1_code, c.track_2_code, c.track_3_code].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '100px', background: c.is_active ? 'rgba(0,200,81,0.1)' : 'rgba(255,255,255,0.06)', color: c.is_active ? '#00C851' : 'var(--text3)', border: `1px solid ${c.is_active ? 'rgba(0,200,81,0.2)' : 'var(--border)'}` }}>
                    {c.is_active ? 'active' : 'inactive'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
