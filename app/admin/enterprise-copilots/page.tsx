'use client'
import { useState, useEffect } from 'react'

const INDUSTRIES = ['Manufacturing', 'Retail / E-commerce', 'Logistics & Supply Chain', 'Financial Services', 'Healthcare', 'Technology / SaaS', 'F&B', 'Real Estate', 'Education', 'Other']

type EnterpriseCopilot = {
  id: string
  slug: string
  company_name: string
  industry: string
  email: string
  is_active: boolean
  created_at: string
  track_1_code: string
  track_2_code: string
  track_3_code: string
  track_4_code: string
  track_5_code: string
  track_6_code: string
}

type NewEnterpriseCopilot = { slug: string; email: string; password: string; url: string; tracks: any[] }

export default function AdminEnterpriseCopilotsPage() {
  const [copilots, setCopilots]     = useState<EnterpriseCopilot[]>([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [error, setError]           = useState('')
  const [newCopilot, setNewCopilot] = useState<NewEnterpriseCopilot | null>(null)
  const [copied, setCopied]         = useState(false)
  const [showForm, setShowForm]     = useState(false)

  const [companyName, setCompanyName]               = useState('')
  const [industry, setIndustry]                     = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [contactName, setContactName]                = useState('')
  const [email, setEmail]                           = useState('')
  const [companyWebsite, setCompanyWebsite]         = useState('')
  const [trackNames, setTrackNames] = useState<string[]>([
    'Supply Chain', 'Product Management', 'Finance', 'Accounting', 'Marketing', 'Operations',
  ])

  const fetchCopilots = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/list-enterprise-copilots')
    const data = await res.json()
    setCopilots(data.copilots || [])
    setLoading(false)
  }

  useEffect(() => { fetchCopilots() }, [])

  const setTrack = (i: number, val: string) => {
    setTrackNames(prev => prev.map((t, idx) => (idx === i ? val : t)))
  }

  const handleCreate = async () => {
    if (!companyName || !industry || !companyDescription || !email || trackNames.some(t => !t.trim())) {
      setError('Please fill in all required fields, including all 6 track names')
      return
    }
    setCreating(true)
    setError('')
    setNewCopilot(null)

    const res = await fetch('/api/admin/create-enterprise-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName, industry, companyDescription, contactName, email, companyWebsite,
        track1Name: trackNames[0], track2Name: trackNames[1], track3Name: trackNames[2],
        track4Name: trackNames[3], track5Name: trackNames[4], track6Name: trackNames[5],
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
    setCompanyName(''); setIndustry(''); setCompanyDescription('')
    setContactName(''); setEmail(''); setCompanyWebsite('')
    setTrackNames(['Supply Chain', 'Product Management', 'Finance', 'Accounting', 'Marketing', 'Operations'])
  }

  const copyCredentials = () => {
    if (!newCopilot) return
    navigator.clipboard.writeText(
      `Enterprise Demo Co-Pilot:\nURL: ${newCopilot.url}\nEmail: ${newCopilot.email}\nPassword: ${newCopilot.password}`
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
    display: 'block', fontSize: '11px', color: 'var(--text2)',
    marginBottom: '6px', fontFamily: 'DM Mono, monospace',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Enterprise Demo Co-Pilots</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
            6-track upskilling demos for enterprise sales — one shared login per company, AI-generated curriculum.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, marginTop: '8px' }}>
          {showForm ? 'Cancel' : '+ New Enterprise Demo'}
        </button>
      </div>

      {/* New credentials card */}
      {newCopilot && (
        <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '14px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>✓ Demo created — share these details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {[
              { l: 'URL', v: newCopilot.url },
              { l: 'Email', v: newCopilot.email },
              { l: 'Password', v: newCopilot.password },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'DM Mono, monospace', width: '70px' }}>{r.l}</span>
                <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', fontFamily: r.l === 'Password' ? 'DM Mono, monospace' : 'inherit' }}>{r.v}</span>
              </div>
            ))}
          </div>
          {newCopilot.tracks && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Generated tracks</div>
              {newCopilot.tracks.map((t: any) => (
                <div key={t.code} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '3px' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: '#2563EB', fontSize: '11px' }}>{t.code}</span> — {t.name} ({t.concepts} concepts)
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
          <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>New Enterprise Demo</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '24px', padding: '8px 12px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)', borderRadius: '8px' }}>
            ✦ Claude will auto-generate 8 custom concepts per track, tailored to this company's industry and operations
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Logistics" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Industry *</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={inputStyle}>
                <option value="">Select industry...</option>
                {INDUSTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Contact Name (who's seeing the demo)</label>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Head of L&D name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Demo Login Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@company.com" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Company Website (optional)</label>
            <input value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="acme.com" style={inputStyle} />
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '6px' }}>If given, Claude scans the site for more specific, real-world grounding in the AI audit and benchmark sections. Skip if not available — everything else still generates fine without it.</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Company Description * (what Maya / the curriculum generator will know about this company)</label>
            <textarea value={companyDescription} onChange={e => setCompanyDescription(e.target.value)}
              placeholder="What does the company do? What are its core operations? Who are its customers? What's the scale of the team?"
              rows={4} style={{ ...inputStyle, resize: 'vertical' as const }} />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>6 Tracks (Claude generates 8 concepts per track)</label>
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '12px' }}>Name each track after a company function. Examples: "Supply Chain", "Product Management", "Finance", "Accounting", "Marketing", "Operations"</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {trackNames.map((val, i) => (
              <div key={i}>
                <label style={labelStyle}>Track {i + 1}{i === 0 ? ' (Active first)' : ''}</label>
                <input value={val} onChange={e => setTrack(i, e.target.value)} placeholder={`Track ${i + 1} name`} style={inputStyle} />
              </div>
            ))}
          </div>

          {error && <div style={{ padding: '10px 14px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F97066', marginBottom: '16px' }}>{error}</div>}

          <button onClick={handleCreate} disabled={creating} style={{ padding: '12px 28px', borderRadius: '8px', background: '#2563EB', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: creating ? 'wait' : 'pointer', opacity: creating ? 0.6 : 1 }}>
            {creating ? '⚡ Generating curriculum & creating demo...' : 'Create Enterprise Demo →'}
          </button>
          {creating && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text2)' }}>Claude is generating 6 tracks of custom concepts — takes ~15 seconds</div>}
        </div>
      )}

      {/* List */}
      <div>
        <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          All Enterprise Demos ({copilots.length})
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
        ) : copilots.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '8px' }}>No enterprise demos yet</div>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Click "+ New Enterprise Demo" to create one</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {copilots.map(c => (
              <div key={c.id} style={{ padding: '16px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{c.company_name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text2)' }}>·</span>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#2563EB', background: 'rgba(37,99,235,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{c.industry}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>/enterprise/{c.slug}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text2)' }}>6 tracks</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '100px', background: c.is_active ? 'rgba(0,200,81,0.1)' : 'rgba(255,255,255,0.06)', color: c.is_active ? '#00C851' : 'var(--text2)', border: `1px solid ${c.is_active ? 'rgba(0,200,81,0.2)' : 'var(--border)'}` }}>
                    {c.is_active ? 'active' : 'inactive'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
