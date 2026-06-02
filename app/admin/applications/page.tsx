'use client'
import { useState, useEffect } from 'react'

const PATHWAY_NAMES: Record<string, string> = {
  P01: '🤖 AI Tech Business', P02: '🎓 Course Business', P03: '💼 Consulting',
  P04: '🏪 Marketplace', P05: '📦 E-commerce', P06: '👗 Fashion D2C',
  P07: '📚 EdTech', P08: '🌐 Community', P09: '🎬 Content Creation', P10: '💻 Freelancing',
}

type Application = {
  id: string
  email: string
  full_name: string
  job_title: string
  years_experience: string
  motivation: string
  status: string
  created_at: string
}

type Credentials = { email: string; password: string }

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading]           = useState(true)
  const [approving, setApproving]       = useState<string | null>(null)
  const [credentials, setCredentials]   = useState<Credentials | null>(null)
  const [copied, setCopied]             = useState(false)
  const [expanded, setExpanded]         = useState<string | null>(null)

  const fetchApplications = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/list-applications')
    const data = await res.json()
    setApplications(data.applications || [])
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [])

  const approve = async (app: Application) => {
    setApproving(app.id)
    const res = await fetch('/api/admin/approve-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: app.id, email: app.email, fullName: app.full_name, jobTitle: app.job_title }),
    })
    const data = await res.json()
    if (data.password) {
      setCredentials({ email: app.email, password: data.password })
      fetchApplications()
    }
    setApproving(null)
  }

  const reject = async (id: string) => {
    await fetch('/api/admin/approve-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, action: 'reject' }),
    })
    fetchApplications()
  }

  const copyCredentials = () => {
    if (!credentials) return
    navigator.clipboard.writeText(`Your LaunchPilot School credentials:\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nLogin at: https://launchpilot-school.vercel.app/auth/login`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pending  = applications.filter(a => a.status === 'pending')
  const reviewed = applications.filter(a => a.status !== 'pending')

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Applications</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>{pending.length} pending · {reviewed.length} reviewed</p>
      </div>

      {/* Credentials card */}
      {credentials && (
        <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>✓ Approved — share these credentials</div>
          {[{ l: 'Email', v: credentials.email }, { l: 'Password', v: credentials.password }, { l: 'Login URL', v: 'launchpilot-school.vercel.app/auth/login' }].map(r => (
            <div key={r.l} style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', width: '70px' }}>{r.l}</span>
              <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>{r.v}</span>
            </div>
          ))}
          <button onClick={copyCredentials} style={{ marginTop: '10px', padding: '8px 18px', borderRadius: '8px', background: copied ? 'rgba(0,200,81,0.1)' : 'var(--bg3)', border: `1px solid ${copied ? 'rgba(0,200,81,0.3)' : 'var(--border)'}`, color: copied ? '#00C851' : 'var(--text2)', fontSize: '13px', cursor: 'pointer' }}>
            {copied ? '✓ Copied!' : 'Copy credentials'}
          </button>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            ⏳ Pending ({pending.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pending.map(app => {
              const pathwayLine = app.motivation?.split('\n')[0] || ''
              const pathwayCode = pathwayLine.replace('Pathway: ', '').trim()
              const isExpanded = expanded === app.id
              return (
                <div key={app.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{app.full_name}</div>
                        {pathwayCode && <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent)', background: 'rgba(108,71,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{PATHWAY_NAMES[pathwayCode] || pathwayCode}</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{app.email} · {app.job_title || 'No title'} · {new Date(app.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                      <button onClick={() => setExpanded(isExpanded ? null : app.id)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', fontSize: '12px', cursor: 'pointer' }}>
                        {isExpanded ? 'Hide' : 'View'} →
                      </button>
                      <button onClick={() => reject(app.id)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(249,112,102,0.3)', color: '#F97066', fontSize: '12px', cursor: 'pointer' }}>
                        Reject
                      </button>
                      <button onClick={() => approve(app)} disabled={approving === app.id} style={{ padding: '8px 18px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: approving === app.id ? 0.6 : 1 }}>
                        {approving === app.id ? 'Approving...' : 'Approve →'}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-wrap' as const }}>{app.motivation}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Reviewed ({reviewed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {reviewed.map(app => (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', opacity: 0.6 }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{app.full_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{app.email}</div>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '100px', background: app.status === 'approved' ? 'rgba(0,200,81,0.1)' : 'rgba(249,112,102,0.1)', color: app.status === 'approved' ? '#00C851' : '#F97066', border: `1px solid ${app.status === 'approved' ? 'rgba(0,200,81,0.2)' : 'rgba(249,112,102,0.2)'}` }}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text3)' }}>No applications yet</div>
        </div>
      )}
    </div>
  )
}
