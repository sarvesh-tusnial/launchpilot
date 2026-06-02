'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/db/client'
import MayaChat from '@/components/features/MayaChat'

const TRACKS = [
  { code: 'B01', name: 'Business Fundamentals', desc: '30 concepts — ICP, PMF, product, marketing, team', color: '#7F77DD' },
  { code: 'B02', name: 'Revenue',               desc: '8 concepts — pricing, sales process, MRR growth',  color: '#1D9E75' },
  { code: 'B03', name: 'Scale',                 desc: '8 concepts — city expansion, sales team, ops',     color: '#BA7517' },
  { code: 'B04', name: 'Fundraising',           desc: '8 concepts — seed prep, metrics, pitch deck',      color: '#D85A30' },
]

const HARDCODED_EMAIL    = 'founder@bubbler.app'
const HARDCODED_PASSWORD = 'Bubbler2025!'

export default function BubblerPage() {
  const [loggedIn, setLoggedIn]           = useState(false)
  const [checking, setChecking]           = useState(true)
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [loginError, setLoginError]       = useState('')
  const [activeTrack, setActiveTrack]     = useState('B01')
  const [concepts, setConcepts]           = useState<any[]>([])
  const [conceptProgress, setConceptProgress] = useState<any[]>([])
  const [currentConcept, setCurrentConcept]   = useState<any>(null)
  const [chatHistory, setChatHistory]     = useState<any[]>([])
  const [profile, setProfile]             = useState<any>(null)
  const [loading, setLoading]             = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('bubbler_auth')
    if (saved === 'true') { setLoggedIn(true); initSession() }
    setChecking(false)
  }, [])

  useEffect(() => { if (loggedIn) loadTrackData(activeTrack) }, [activeTrack, loggedIn])

  const initSession = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
  }

  const loadTrackData = async (trackCode: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [conceptData, progressData, chatData] = await Promise.all([
      supabase.from('concepts').select('*').eq('competency_code', trackCode).order('sequence'),
      user ? supabase.from('student_concepts').select('*').eq('student_id', user.id) : Promise.resolve({ data: [] }),
      user ? supabase.from('chat_messages').select('role, content, created_at').eq('student_id', user.id).order('created_at', { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
    ])
    const allConcepts  = conceptData.data || []
    const allProgress  = progressData.data || []
    const completedIds = new Set(allProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    const current      = allConcepts.find((c: any) => !completedIds.has(c.id)) || allConcepts[0] || null
    setConcepts(allConcepts)
    setConceptProgress(allProgress)
    setCurrentConcept(current)
    setChatHistory((chatData.data || []).reverse())
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim().toLowerCase() === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: HARDCODED_EMAIL, password: HARDCODED_PASSWORD })
      if (error) { setLoginError('Login failed — please contact your admin.'); return }
      localStorage.setItem('bubbler_auth', 'true')
      setLoggedIn(true)
      initSession()
    } else {
      setLoginError('Invalid credentials.')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('bubbler_auth')
    setLoggedIn(false)
    setProfile(null)
    setConcepts([])
  }

  const track = TRACKS.find(t => t.code === activeTrack)!
  const completedIds  = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
  const masteredCount = concepts.filter(c => completedIds.has(c.id)).length
  const currentStage  = conceptProgress.find(p => p.concept_id === currentConcept?.id)?.stage || 1

  const openingMessage = currentConcept
    ? `Hey Karthik! Ready to work on **${track.name}**? We're on "${currentConcept.title}" — let's pick up where we left off.`
    : `Hey Karthik! Welcome to the ${track.name} track. Let's get started.`

  const sessionContext = currentConcept
    ? `Bubbler founder (Karthik) working on ${track.name} track, concept: "${currentConcept.title}" (${currentConcept.sequence}/${track.code === 'B01' ? 30 : 8})`
    : `Bubbler founder (Karthik) starting ${track.name} track`

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#333', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>Loading...</div>
    </div>
  )

  // ── LOGIN ──
  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'grid', gridTemplateColumns: '1fr 400px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .serif { font-family: 'Fraunces', Georgia, serif; }
        .mono { font-family: 'DM Mono', monospace; }
        input:focus { border-color: rgba(127,119,221,0.5) !important; outline: none; }
        .track-row:hover { background: rgba(255,255,255,0.03) !important; }
        .track-row { transition: background 0.15s; }
        .btn-enter:hover { opacity: 0.88; }
        .btn-enter { transition: opacity 0.15s; }
      `}</style>

      {/* LEFT */}
      <div style={{ padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '480px' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7F77DD' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#E8E6E0', letterSpacing: '-0.01em' }}>Bubbler Co-Pilot</div>
              <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Powered by LaunchPilot</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="serif" style={{ fontSize: 'clamp(38px, 4vw, 54px)', fontWeight: '900', color: '#F0EDE6', letterSpacing: '-0.03em', lineHeight: '1.06', marginBottom: '20px' }}>
            Hey Karthik,<br /><span style={{ color: '#7F77DD', fontStyle: 'italic' }}>welcome.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: '1.8', marginBottom: '52px', maxWidth: '400px' }}>
            Your personal AI co-pilot for Bubbler — built to take you from 0 to 1 with a sharp focus on revenue, scale, and fundraising.
          </p>

          {/* Tracks */}
          <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>Your 4 tracks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '48px' }}>
            {TRACKS.map((t, i) => (
              <div key={t.code} className="track-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: '10px', fontWeight: '700', color: t.color }}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#C8C4BC', marginBottom: '1px' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: '#333' }}>{t.desc}</div>
                </div>
                <span className="mono" style={{ fontSize: '8px', color: t.color, background: `${t.color}14`, border: `1px solid ${t.color}22`, padding: '2px 7px', borderRadius: '4px', flexShrink: 0, letterSpacing: '0.08em' }}>{t.code}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>How it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Pick a track — Maya teaches each concept with real Bubbler and India SaaS scenarios',
              'Every session follows 8 stages from hook to action step — structured and fast-moving',
              'Each session ends with one specific commitment to execute before the next session',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span className="mono" style={{ fontSize: '9px', color: '#7F77DD', fontWeight: '700', flexShrink: 0, marginTop: '3px' }}>0{i + 1}</span>
                <span style={{ fontSize: '13px', color: '#444', lineHeight: '1.65' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ background: '#07050F', borderLeft: '1px solid rgba(127,119,221,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '6px' }}>Sign in</h2>
            <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>Access your private co-pilot session.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="mono" style={{ display: 'block', fontSize: '10px', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                style={{ width: '100%', padding: '13px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', color: '#E8E6E0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'border-color 0.15s' }} />
            </div>
            <div>
              <label className="mono" style={{ display: 'block', fontSize: '10px', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '13px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', color: '#E8E6E0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            </div>
            {loginError && (
              <div style={{ padding: '10px 14px', background: 'rgba(216,90,48,0.08)', border: '1px solid rgba(216,90,48,0.18)', borderRadius: '8px', fontSize: '13px', color: '#D85A30' }}>{loginError}</div>
            )}
            <button type="submit" className="btn-enter" style={{ width: '100%', padding: '14px', borderRadius: '9px', border: 'none', background: '#7F77DD', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '6px', letterSpacing: '-0.01em' }}>
              Enter →
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#222', letterSpacing: '0.08em' }}>Private session · Not for sharing</div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── DASHBOARD ──
  return (
    <div style={{ background: '#050309', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#E8E6E0', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .mono { font-family: 'DM Mono', monospace; }
      `}</style>

      {/* TOP NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '56px', background: 'rgba(5,3,9,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0', letterSpacing: '-0.01em' }}>Bubbler Co-Pilot</div>
            <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Powered by LaunchPilot</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#2a2a2a', fontFamily: 'DM Mono, monospace' }}>founder@bubbler.app</span>
          <button onClick={handleSignOut} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#333', cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>
        {/* LEFT SIDEBAR */}
        <aside style={{ width: '256px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.04)', padding: '24px 16px', position: 'fixed', top: '56px', bottom: 0, left: 0, overflowY: 'auto', background: '#050309' }}>

          <div className="mono" style={{ fontSize: '9px', color: '#222', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>Tracks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '20px' }}>
            {TRACKS.map((t, i) => {
              const isActive = t.code === activeTrack
              return (
                <button key={t.code} onClick={() => setActiveTrack(t.code)} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                  background: isActive ? `${t.color}10` : 'transparent',
                  border: isActive ? `1px solid ${t.color}22` : '1px solid transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: isActive ? `${t.color}20` : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '9px', fontWeight: '700', color: isActive ? t.color : '#333' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: isActive ? '#E8E6E0' : '#555', lineHeight: '1.2', marginBottom: '1px' }}>{t.name}</div>
                    <div className="mono" style={{ fontSize: '9px', color: '#222' }}>{t.code === 'B01' ? '30' : '8'} concepts</div>
                  </div>
                </button>
              )
            })}
          </div>

          {!loading && (
            <>
              <div style={{ padding: '14px', background: `${track.color}08`, border: `1px solid ${track.color}18`, borderRadius: '10px', marginBottom: '16px' }}>
                <div className="mono" style={{ fontSize: '9px', color: track.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Now Studying</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#C8C4BC', marginBottom: '10px', lineHeight: '1.4' }}>
                  {currentConcept?.title || 'Starting first concept'}
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                  {Array.from({ length: track.code === 'B01' ? 30 : 8 }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < masteredCount ? track.color : 'rgba(255,255,255,0.05)' }} />
                  ))}
                </div>
                <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a' }}>{masteredCount}/{track.code === 'B01' ? 30 : 8} completed</div>
              </div>

              <div className="mono" style={{ fontSize: '9px', color: '#222', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px' }}>Concepts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {concepts.map((c: any) => {
                  const isDone    = completedIds.has(c.id)
                  const isCurrent = c.id === currentConcept?.id
                  return (
                    <div key={c.id} style={{ display: 'flex', gap: '8px', padding: '5px 6px', borderRadius: '5px', background: isCurrent ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      <span style={{ fontSize: '9px', color: isDone ? '#1D9E75' : isCurrent ? track.color : '#222', flexShrink: 0, marginTop: '2px' }}>
                        {isDone ? '✓' : isCurrent ? '→' : '○'}
                      </span>
                      <span style={{ fontSize: '11px', color: isDone ? '#2a2a2a' : isCurrent ? '#C8C4BC' : '#444', lineHeight: '1.4', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {c.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="mono" style={{ fontSize: '11px', color: '#222', letterSpacing: '0.1em' }}>Loading track...</div>
            </div>
          ) : (
            <MayaChat
              profile={profile || { full_name: 'Karthik', email: HARDCODED_EMAIL }}
              openingMessage={openingMessage}
              sessionContext={sessionContext}
              chatHistory={chatHistory}
              currentConceptId={currentConcept?.id}
              currentStage={currentStage}
            />
          )}
        </main>
      </div>
    </div>
  )
}
