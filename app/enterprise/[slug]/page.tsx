'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import MayaChat from '@/components/features/MayaChat'
import { useParams } from 'next/navigation'

export default function EnterpriseCopilotPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [loggedIn, setLoggedIn]       = useState(false)
  const [checking, setChecking]       = useState(true)
  const [company, setCompany]         = useState<any>(null)
  const [notFound, setNotFound]       = useState(false)
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [loginError, setLoginError]   = useState('')
  const [activeTrack, setActiveTrack] = useState<any>(null)
  const [tracks, setTracks]           = useState<any[]>([])
  const [concepts, setConcepts]       = useState<any[]>([])
  const [conceptProgress, setConceptProgress] = useState<any[]>([])
  const [currentConcept, setCurrentConcept]   = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [profile, setProfile]         = useState<any>(null)
  const [loadingTrack, setLoadingTrack] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [view, setView] = useState<'dashboard'|'chat'|'tracks'>('dashboard')

  useEffect(() => { loadCompany() }, [slug])

  const loadCompany = async () => {
    const res = await fetch(`/api/enterprise/${slug}`)
    if (!res.ok) { setNotFound(true); setChecking(false); return }
    const data = await res.json()
    const cp = data.company
    setCompany(cp)
    const trackCodes = [cp.track_1_code, cp.track_2_code, cp.track_3_code, cp.track_4_code, cp.track_5_code, cp.track_6_code].filter(Boolean)
    const supabase = createClient()
    const { data: compData } = await supabase.from('competencies').select('code, name').in('code', trackCodes)
    const trackList = trackCodes.map(code => ({ code, name: compData?.find((c: any) => c.code === code)?.name || code }))
    setTracks(trackList)
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email === cp.email) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      setLoggedIn(true)
      await loadTrackDataDirect(trackCodes[0], trackList, user.id)
    }
    setChecking(false)
  }

  const loadTrackDataDirect = async (trackCode: string, trackList: any[], userId: string) => {
    setLoadingTrack(true)
    const supabase = createClient()
    const allCodes = trackList.map(t => t.code)
    const [conceptData, progressData, chatData] = await Promise.all([
      supabase.from('concepts').select('*').in('competency_code', allCodes).order('competency_code').order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', userId),
      supabase.from('chat_messages').select('role, content, created_at').eq('student_id', userId).order('created_at', { ascending: false }).limit(50),
    ])
    const allConcepts  = conceptData.data || []
    const allProgress  = progressData.data || []
    const activeConcepts = allConcepts.filter((c: any) => c.competency_code === trackCode)
    const completedIds = new Set(allProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    const current      = activeConcepts.find((c: any) => !completedIds.has(c.id)) || activeConcepts[0] || null
    const track        = trackList.find(t => t.code === trackCode)
    setActiveTrack(track || { code: trackCode, name: trackCode })
    setConcepts(allConcepts)
    setConceptProgress(allProgress)
    setCurrentConcept(current)
    setChatHistory((chatData.data || []).reverse())
    setInitialized(true)
    setLoadingTrack(false)
  }

  const switchTrack = async (track: any) => {
    if (!profile) return
    setActiveTrack(track)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('student_competencies').update({ status: 'paused' }).eq('student_id', user.id).eq('status', 'active')
    await supabase.from('student_competencies').update({ status: 'active' }).eq('student_id', user.id).eq('competency_code', track.code)
    await loadTrackDataDirect(track.code, tracks, user.id)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    if (email.trim().toLowerCase() !== company.email) { setLoginError('Invalid credentials.'); return }
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) { setLoginError('Invalid credentials.'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    setProfile(p)
    setLoggedIn(true)
    const trackCodes = [company.track_1_code, company.track_2_code, company.track_3_code, company.track_4_code, company.track_5_code, company.track_6_code].filter(Boolean)
    await loadTrackDataDirect(trackCodes[0], tracks, data.user.id)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setLoggedIn(false); setProfile(null); setInitialized(false)
  }

  const completedIds  = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
  const masteredCount = concepts.filter(c => completedIds.has(c.id)).length
  const totalConcepts = concepts.length || 48
  const content = company?.personalised_content

  const openingMessage = company && currentConcept
    ? `Welcome back. You're on **${activeTrack?.name}** — "${currentConcept.title}". Let's continue.`
    : `Welcome to the ${company?.company_name || ''} upskilling program. Let's get started on ${activeTrack?.name}.`

  const sessionContext = company
    ? `Enterprise upskilling co-pilot for ${company.company_name} (${company.industry}). Company context: ${company.company_description}. Track: ${activeTrack?.name}, concept: "${currentConcept?.title || 'first concept'}".`
    : ''

  const ACCENT = '#2563EB'
  const ACCENT_DARK = '#1E3A8A'
  const INK = '#0B1220'
  const TEAL = '#0D9488'

  if (checking) return (
    <div style={{ minHeight: '100vh', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'IBM Plex Mono, monospace' }}>Loading program...</div>
    </div>
  )

  if (notFound || !company) return (
    <div style={{ minHeight: '100vh', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', marginBottom: '10px' }}>Program not found</div>
        <div style={{ fontSize: '14px', color: '#94A3B8' }}>This enterprise demo doesn't exist or has been removed.</div>
      </div>
    </div>
  )

  // ── DASHBOARD (after login) ──
  if (loggedIn) return (
    <div style={{ background: '#0F172A', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ent-mono{font-family:'IBM Plex Mono',monospace}
        .ent-display{font-family:'Space Grotesk',sans-serif}
        .ent-nav-item{transition:background 0.15s;cursor:pointer}
        .ent-nav-item:hover{background:rgba(255,255,255,0.05)!important}
        .ent-nav-item.active{background:rgba(37,99,235,0.12)!important;border-left:3px solid ${ACCENT}!important;color:#FFFFFF!important}
        @media(max-width:768px){.ent-aside{display:none!important}.ent-main{margin-left:0!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '56px', background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: ACCENT }} />
          </div>
          <div>
            <div className="ent-display" style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>{company.company_name} — Upskilling Program</div>
            <div className="ent-mono" style={{ fontSize: '8px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Powered by LaunchPilot for Enterprise</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: ACCENT }}>
            {(profile?.full_name || company.contact_name || company.company_name)?.[0]?.toUpperCase()}
          </div>
          <button onClick={handleSignOut} style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>

        {/* SIDEBAR */}
        <aside className="ent-aside" style={{ width: '230px', flexShrink: 0, position: 'fixed', top: '56px', bottom: 0, left: 0, background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '20px 12px', flex: 1 }}>
            {([
              { id: 'dashboard', label: 'Coverage Overview', icon: '▦' },
              { id: 'chat',      label: 'Coach Session',     icon: '◉' },
              { id: 'tracks',    label: 'All Tracks',        icon: '▤' },
            ] as const).map(item => (
              <div key={item.id}
                className={`ent-nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id as any)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', color: view === item.id ? '#FFFFFF' : '#94A3B8', fontSize: '13px', fontWeight: view === item.id ? '600' : '400', borderLeft: '3px solid transparent' }}>
                <span style={{ fontSize: '13px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </div>
            ))}

            {activeTrack && !loadingTrack && (
              <div style={{ margin: '16px 0 8px', padding: '14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px' }}>
                <div className="ent-mono" style={{ fontSize: '8px', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '5px' }}>Current Module</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF', marginBottom: '10px', lineHeight: '1.3' }}>{activeTrack.name}</div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '1px', background: i < (concepts.filter((c: any) => c.competency_code === activeTrack.code && completedIds.has(c.id)).length) ? ACCENT : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <button onClick={() => setView('chat')} style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '6px', border: 'none', background: ACCENT, color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Resume session →
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className="ent-main" style={{ marginLeft: '230px', flex: 1, overflowY: 'auto', height: 'calc(100vh - 56px)' }}>

          {view === 'dashboard' && (
            <div style={{ padding: '36px 40px', maxWidth: '1040px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="ent-display" style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                  Skills coverage overview
                </h1>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {company.company_name} · {company.industry} · 6 active tracks
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
                {[
                  { value: tracks.length, label: 'Tracks deployed',  color: ACCENT },
                  { value: masteredCount, label: 'Modules completed', color: TEAL },
                  { value: totalConcepts - masteredCount, label: 'Modules remaining', color: '#F59E0B' },
                  { value: totalConcepts > 0 ? `${Math.round((masteredCount/totalConcepts)*100)}%` : '0%', label: 'Org coverage', color: '#60A5FA' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                    <div className="ent-display" style={{ fontSize: '26px', fontWeight: '700', color: stat.color, letterSpacing: '-0.02em', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Competency matrix */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '14px' }}>Track matrix</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {tracks.map((t, i) => {
                    const isActive = t.code === activeTrack?.code
                    const trackConcepts = concepts.filter((c: any) => c.competency_code === t.code)
                    const trackMastered = trackConcepts.filter((c: any) => completedIds.has(c.id)).length
                    const trackTotal = trackConcepts.length || 8
                    return (
                      <div key={t.code} style={{ padding: '16px 18px', background: isActive ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', cursor: 'pointer' }}
                        onClick={() => { switchTrack(t); setView('chat') }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="ent-mono" style={{ fontSize: '9px', color: ACCENT, background: 'rgba(37,99,235,0.12)', padding: '2px 7px', borderRadius: '4px' }}>TRACK-{String(i+1).padStart(2,'0')}</span>
                          <span className="ent-mono" style={{ fontSize: '9px', color: isActive ? ACCENT : '#FFFFFF' }}>{isActive ? 'Active' : 'Open →'}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', marginBottom: '8px', lineHeight: '1.3' }}>{t.name}</div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: trackTotal }).map((_, i) => (
                            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '1px', background: i < trackMastered ? ACCENT : 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Resume card */}
              {activeTrack && (
                <div style={{ padding: '22px 26px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="ent-mono" style={{ fontSize: '9px', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' }}>Continue training</div>
                    <div style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{activeTrack.name}</div>
                    <div style={{ fontSize: '13px', color: '#94A3B8' }}>
                      {currentConcept ? `Module: "${currentConcept.title}"` : 'Starting first module'}
                    </div>
                  </div>
                  <button onClick={() => setView('chat')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: ACCENT, color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                    Resume session →
                  </button>
                </div>
              )}
            </div>
          )}

          {view === 'chat' && (
            <div style={{ height: '100%', '--bg': '#0F172A', '--bg2': '#16213A', '--bg3': '#1C2A47', '--bg4': '#243352', '--border': 'rgba(255,255,255,0.1)', '--text': '#FFFFFF', '--text2': '#FFFFFF', '--text3': '#FFFFFF' } as React.CSSProperties}>
              {!initialized || loadingTrack ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div className="ent-mono" style={{ fontSize: '11px', color: '#94A3B8' }}>Loading session...</div>
                </div>
              ) : (
                <MayaChat
                  profile={profile || { full_name: company.contact_name || company.company_name, email: company.email }}
                  openingMessage={openingMessage}
                  sessionContext={sessionContext}
                  chatHistory={chatHistory}
                  currentConceptId={currentConcept?.id}
                />
              )}
            </div>
          )}

          {view === 'tracks' && (
            <div style={{ padding: '36px 40px', maxWidth: '1040px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 className="ent-display" style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>All tracks</h1>
                <p className="ent-mono" style={{ fontSize: '11px', color: '#94A3B8' }}>{tracks.length} tracks deployed for {company.company_name}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {tracks.map((t, ti) => {
                  const isActive = t.code === activeTrack?.code
                  const trackConcepts = concepts.filter((c: any) => c.competency_code === t.code)
                  const trackMastered = trackConcepts.filter((c: any) => completedIds.has(c.id)).length
                  const trackTotal = trackConcepts.length || 8
                  const trackPct = trackTotal > 0 ? Math.round((trackMastered/trackTotal)*100) : 0
                  return (
                    <div key={t.code} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', overflow: 'hidden', borderTop: `2px solid ${isActive ? ACCENT : 'rgba(255,255,255,0.1)'}` }}>
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="ent-mono" style={{ fontSize: '10px', fontWeight: '700', color: ACCENT }}>{String(ti+1).padStart(2,'0')}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>{t.name}</div>
                            <div className="ent-mono" style={{ fontSize: '9px', color: '#94A3B8' }}>{trackMastered} of {trackTotal} modules · {trackPct}%</div>
                          </div>
                        </div>
                        {isActive
                          ? <button onClick={() => setView('chat')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: ACCENT, color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Continue →</button>
                          : <button onClick={() => { switchTrack(t); setView('chat') }} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer' }}>Switch →</button>
                        }
                      </div>
                      <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                        {trackConcepts.map((c: any) => {
                          const done = completedIds.has(c.id)
                          const isCurrent = c.id === currentConcept?.id && isActive
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <span style={{ fontSize: '9px', fontWeight: '700', color: done ? TEAL : isCurrent ? ACCENT : '#94A3B8', flexShrink: 0, marginTop: '1px' }}>{done ? '✓' : isCurrent ? '→' : String(c.sequence).padStart(2,'0')}</span>
                              <span style={{ fontSize: '11px', color: done ? '#94A3B8' : '#FFFFFF', lineHeight: '1.4', textDecoration: done ? 'line-through' : 'none' }}>{c.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )

  // ── LANDING + LOGIN PAGE ──
  return (
    <div className="ent-login-layout" style={{ minHeight: '100vh', background: INK, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ent-mono{font-family:'IBM Plex Mono',monospace}
        .ent-display{font-family:'Space Grotesk',sans-serif}
        input:focus{border-color:rgba(37,99,235,0.6)!important;outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
        @media(max-width:768px){
          .ent-login-layout{flex-direction:column!important}
          .ent-login-left{padding:32px 24px 48px!important}
          .ent-login-right{width:100%!important;height:auto!important;position:relative!important;border-left:none!important;border-top:1px solid rgba(255,255,255,0.08)!important;padding:36px 24px!important}
          .ent-matrix-grid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:480px){
          .ent-matrix-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* LEFT — scrollable landing content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="ent-login-left" style={{ padding: '56px 56px 80px' }}>

          {/* Brand bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: ACCENT }} />
            </div>
            <div className="ent-mono" style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.16em' }}>LaunchPilot for Enterprise</div>
          </div>

          {/* HERO */}
          <div style={{ marginBottom: '52px' }}>
            <div className="ent-mono" style={{ fontSize: '10px', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '14px' }}>Upskilling program — {company.company_name}</div>
            <h1 className="ent-display" style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: '1.15', marginBottom: '18px', maxWidth: '640px' }}>
              {content?.headline || `A structured upskilling program built for ${company.company_name}'s teams.`}
            </h1>
            <p style={{ fontSize: '15px', color: '#CBD5E1', lineHeight: '1.7', maxWidth: '560px' }}>
              {content?.subheadline || `Six tracks, AI-coached, mapped directly to how ${company.company_name} operates today.`}
            </p>
          </div>

          {/* COMPETENCY MATRIX */}
          <div style={{ marginBottom: '52px' }}>
            <div className="ent-mono" style={{ fontSize: '10px', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px' }}>Capability map</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '18px' }}>6 tracks, mapped to your org's functions</div>
            <div className="ent-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {tracks.map((t, i) => (
                <div key={t.code} style={{ padding: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', borderTop: `2px solid ${ACCENT}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="ent-mono" style={{ fontSize: '9px', color: ACCENT }}>TRACK-{String(i+1).padStart(2,'0')}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '8px', lineHeight: '1.3' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.5', marginBottom: '12px' }}>{content?.track_outcomes?.[i] || '8 modules tailored to your operations'}</div>
                  {/* Coverage bar — segmented, not a journey progress bar */}
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} style={{ flex: 1, height: '4px', borderRadius: '1px', background: 'rgba(37,99,235,0.25)' }} />
                    ))}
                  </div>
                  <div className="ent-mono" style={{ fontSize: '9px', color: '#94A3B8' }}>8 modules · ready to deploy</div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPANY FIT */}
          {content?.company_context_summary && (
            <div style={{ marginBottom: '52px', padding: '20px 22px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '12px' }}>
              <div className="ent-mono" style={{ fontSize: '9px', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Why this fits {company.company_name}</div>
              <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.7' }}>{content.company_context_summary}</p>
            </div>
          )}

          {/* HOW IT WORKS */}
          <div style={{ marginBottom: '40px' }}>
            <div className="ent-mono" style={{ fontSize: '10px', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px' }}>How it works</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Each employee gets an AI coaching session per module — not a static course.',
                'Progress is tracked per track, so L&D can see coverage across the org at a glance.',
                'Curriculum is generated from your company\'s actual operations, not a generic template.',
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                  <span className="ent-mono" style={{ fontSize: '10px', color: ACCENT, flexShrink: 0, marginTop: '2px' }}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>{line}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT — sticky login */}
      <div className="ent-login-right" style={{ width: '380px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', background: '#0F172A', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="ent-display" style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em', marginBottom: '8px' }}>Demo access</h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6' }}>
            Sign in with the credentials provided to preview the {company.company_name} program.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="ent-mono" style={{ display: 'block', fontSize: '10px', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label className="ent-mono" style={{ display: 'block', fontSize: '10px', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
          </div>
          {loginError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', fontSize: '13px', color: '#F87171' }}>
              {loginError}
            </div>
          )}
          <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: ACCENT, color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
            Enter program →
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <div className="ent-mono" style={{ fontSize: '10px', color: '#64748B', letterSpacing: '0.06em' }}>Confidential demo · Not for external sharing</div>
        </div>
      </div>
    </div>
  )
}
