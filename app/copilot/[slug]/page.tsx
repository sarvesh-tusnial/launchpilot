'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import MayaChat from '@/components/features/MayaChat'
import { useParams } from 'next/navigation'

export default function CopilotPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [loggedIn, setLoggedIn]       = useState(false)
  const [checking, setChecking]       = useState(true)
  const [copilotProfile, setCopilotProfile] = useState<any>(null)
  const [notFound, setNotFound]       = useState(false)
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [loginError, setLoginError]   = useState('')
  const [generatingBrochure, setGeneratingBrochure] = useState(false)
  const [activeTrack, setActiveTrack] = useState<any>(null)
  const [tracks, setTracks]           = useState<any[]>([])
  const [concepts, setConcepts]       = useState<any[]>([])
  const [conceptProgress, setConceptProgress] = useState<any[]>([])
  const [currentConcept, setCurrentConcept]   = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [profile, setProfile]         = useState<any>(null)
  const [loadingTrack, setLoadingTrack] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [copilotView, setCopilotView] = useState<'dashboard'|'chat'|'tracks'|'progress'>('dashboard')

  useEffect(() => { loadCopilotProfile() }, [slug])

  const loadCopilotProfile = async () => {
    const res = await fetch(`/api/copilot/${slug}`)
    if (!res.ok) { setNotFound(true); setChecking(false); return }
    const data = await res.json()
    const cp = data.copilot
    setCopilotProfile(cp)
    const trackCodes = [cp.track_1_code, cp.track_2_code, cp.track_3_code].filter(Boolean)
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

  const handleBrochure = () => {
    window.open(`/copilot/${slug}/brochure`, '_blank')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!copilotProfile) return
    if (email.trim().toLowerCase() !== copilotProfile.email) { setLoginError('Invalid credentials.'); return }
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) { setLoginError('Invalid credentials.'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    setProfile(p)
    setLoggedIn(true)
    const trackCodes = [copilotProfile.track_1_code, copilotProfile.track_2_code, copilotProfile.track_3_code].filter(Boolean)
    await loadTrackDataDirect(trackCodes[0], tracks, data.user.id)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setLoggedIn(false); setProfile(null); setInitialized(false)
  }

  const completedIds  = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
  const masteredCount = concepts.filter(c => completedIds.has(c.id)).length
  const currentStage  = conceptProgress.find(p => p.concept_id === currentConcept?.id)?.stage || 1
  const totalConcepts = concepts.length || 8
  const content       = copilotProfile?.personalised_content

  const openingMessage = copilotProfile && currentConcept
    ? `Hey ${copilotProfile.founder_name}! Ready to work on **${activeTrack?.name}**? We're on "${currentConcept.title}" — let's pick up where we left off.`
    : `Hey ${copilotProfile?.founder_name || 'there'}! Welcome to your co-pilot. Let's get started on ${activeTrack?.name}.`

  const sessionContext = copilotProfile
    ? `Co-pilot for ${copilotProfile.founder_name}, founder of ${copilotProfile.business_name} (${copilotProfile.business_category}, ${copilotProfile.business_stage}, ${copilotProfile.country}). Business: ${copilotProfile.business_description}. Track: ${activeTrack?.name}, concept: "${currentConcept?.title || 'first concept'}".`
    : ''

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#666', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
    </div>
  )

  if (notFound || !copilotProfile) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#F0EDE6', marginBottom: '10px' }}>Not found</div>
        <div style={{ fontSize: '14px', color: '#888' }}>This co-pilot doesn't exist or has been removed.</div>
      </div>
    </div>
  )

  // ── DASHBOARD (after login) ──
  if (loggedIn) return (
    <div style={{ background: '#05050A', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#E8E6E0', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .mono{font-family:'DM Mono',monospace}
        .nav-item{transition:background 0.15s;cursor:pointer}
        .nav-item:hover{background:rgba(255,255,255,0.04)!important}
        .nav-item.active{background:rgba(255,106,0,0.1)!important;border-left:3px solid #FF6A00!important;color:#F0EDE6!important}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){.dash-aside{display:none!important}.dash-main{margin-left:0!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '56px', background: 'rgba(5,5,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6A00' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#F0EDE6' }}>{copilotProfile.business_name} Co-Pilot</div>
            <div className="mono" style={{ fontSize: '8px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Powered by LaunchPilot</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FF6A00' }}>
            {copilotProfile.founder_name?.[0]?.toUpperCase()}
          </div>
          <button onClick={handleSignOut} style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>

        {/* SIDEBAR */}
        <aside className="dash-aside" style={{ width: '220px', flexShrink: 0, position: 'fixed', top: '56px', bottom: 0, left: 0, background: '#05050A', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '20px 12px', flex: 1 }}>

            {/* Nav */}
            {([
              { id: 'dashboard', label: 'Dashboard',      icon: '⊞' },
              { id: 'chat',      label: 'Chat with Maya', icon: '◉', dot: true },
              { id: 'tracks',    label: 'My Tracks',      icon: '◈' },
              { id: 'progress',  label: 'Progress',       icon: '◎' },
            ] as const).map(item => (
              <div key={item.id}
                className={`nav-item ${copilotView === item.id ? 'active' : ''}`}
                onClick={() => setCopilotView(item.id as any)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '2px', color: copilotView === item.id ? '#F0EDE6' : '#555', fontSize: '13px', fontWeight: copilotView === item.id ? '600' : '400', borderLeft: '3px solid transparent' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {'dot' in item && item.dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s infinite' }} />}
              </div>
            ))}

            {/* Now studying card */}
            {activeTrack && !loadingTrack && (
              <div style={{ margin: '16px 0 8px', padding: '14px', background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '10px' }}>
                <div className="mono" style={{ fontSize: '8px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '5px' }}>Now Studying</div>
                <div className="mono" style={{ fontSize: '9px', color: '#555', marginBottom: '2px' }}>{activeTrack.code}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6', marginBottom: '10px', lineHeight: '1.3' }}>{activeTrack.name}</div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                  {Array.from({ length: totalConcepts }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < masteredCount ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
                <div className="mono" style={{ fontSize: '9px', color: '#444' }}>{masteredCount}/{totalConcepts} concepts</div>
                <button onClick={() => setCopilotView('chat')} style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '7px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Continue with Maya →
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className="dash-main" style={{ marginLeft: '220px', flex: 1, overflowY: 'auto', height: 'calc(100vh - 56px)' }}>

          {/* ── DASHBOARD VIEW ── */}
          {copilotView === 'dashboard' && (
            <div style={{ padding: '36px 40px', maxWidth: '1000px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  Hey {copilotProfile.founder_name.split(' ')[0]} 👋
                </h1>
                <p style={{ fontSize: '13px', color: '#555' }}>
                  {activeTrack ? `You're working on ${activeTrack.name}. Keep going.` : `Welcome to your ${copilotProfile.business_name} Co-Pilot.`}
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
                {[
                  { value: tracks.length,   label: 'Focus tracks',      color: '#FF6A00' },
                  { value: masteredCount,   label: 'Concepts mastered', color: '#4ADE80' },
                  { value: totalConcepts - masteredCount, label: 'Concepts left', color: '#F59E0B' },
                  { value: tracks.length > 0 ? `${Math.round((masteredCount / (tracks.length * totalConcepts || 1)) * 100)}%` : '0%', label: 'Overall progress', color: '#60A5FA' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color, letterSpacing: '-0.03em', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#444' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* My Tracks grid — shown first */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#F0EDE6' }}>My Tracks</div>
                  <button onClick={() => setCopilotView('tracks')} style={{ fontSize: '12px', color: '#FF6A00', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>View all →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {tracks.map((t, i) => {
                    const isActive = t.code === activeTrack?.code
                    const trackConcepts = concepts.filter((c: any) => c.competency_code === t.code)
                    const trackMastered = trackConcepts.filter((c: any) => completedIds.has(c.id)).length
                    const trackTotal = trackConcepts.length || 8
                    return (
                      <div key={t.code} style={{ padding: '16px 18px', background: isActive ? 'rgba(255,106,0,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', cursor: 'pointer' }}
                        onClick={() => { switchTrack(t); setCopilotView('chat') }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="mono" style={{ fontSize: '9px', color: '#FF6A00', background: 'rgba(255,106,0,0.1)', padding: '2px 7px', borderRadius: '4px' }}>Track {String(i+1).padStart(2,'0')}</span>
                          <span className="mono" style={{ fontSize: '9px', color: isActive ? '#FF6A00' : '#333', background: isActive ? 'rgba(255,106,0,0.1)' : 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: '4px' }}>{isActive ? 'Active' : 'Switch →'}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '4px', lineHeight: '1.3' }}>{t.name}</div>
                        <div className="mono" style={{ fontSize: '9px', color: '#444', marginBottom: '8px' }}>{trackMastered}/{trackTotal} concepts</div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: trackTotal }).map((_, i) => (
                            <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < trackMastered ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Resume card */}
              {activeTrack && (
                <div style={{ padding: '22px 26px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Resume where you left off</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em', marginBottom: '4px' }}>{activeTrack.name}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                      {currentConcept ? `Working on "${currentConcept.title}"` : 'Starting first concept — ready to begin'}
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '5px' }}>
                      {Array.from({ length: totalConcepts }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < masteredCount ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: '#444' }}>{masteredCount}/{totalConcepts} concepts</div>
                    {/* Concepts preview */}
                    {concepts.length > 0 && (
                      <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                        {concepts.map((c: any) => {
                          const done = completedIds.has(c.id)
                          const isCurrent = c.id === currentConcept?.id
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '4px 7px', background: isCurrent ? 'rgba(255,106,0,0.06)' : 'transparent', borderRadius: '4px', border: isCurrent ? '1px solid rgba(255,106,0,0.15)' : '1px solid transparent' }}>
                              <span style={{ fontSize: '8px', color: done ? '#4ADE80' : isCurrent ? '#FF6A00' : '#333', flexShrink: 0, marginTop: '2px' }}>{done ? '✓' : isCurrent ? '→' : String(c.sequence).padStart(2,'0')}</span>
                              <span style={{ fontSize: '10px', color: done ? '#444' : isCurrent ? '#E8E6E0' : '#666', lineHeight: '1.4', textDecoration: done ? 'line-through' : 'none' }}>{c.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setCopilotView('chat')} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Continue with Maya →
                  </button>
                </div>
              )}


            </div>
          )}

          {/* ── CHAT VIEW ── */}
          {copilotView === 'chat' && (
            <div style={{ height: '100%', '--bg': '#07070F', '--bg2': '#0F0F18', '--bg3': '#141420', '--bg4': '#1A1A28', '--border': 'rgba(255,255,255,0.08)', '--text': '#F0EDE6', '--text2': '#AAA8A0', '--text3': '#666' } as React.CSSProperties}>
              {!initialized || loadingTrack ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div className="mono" style={{ fontSize: '11px', color: '#444' }}>Loading your session...</div>
                </div>
              ) : (
                <MayaChat
                  profile={profile || { full_name: copilotProfile.founder_name, email: copilotProfile.email }}
                  openingMessage={openingMessage}
                  sessionContext={sessionContext}
                  chatHistory={chatHistory}
                  currentConceptId={currentConcept?.id}
                  currentStage={currentStage}
                />
              )}
            </div>
          )}

          {/* ── MY TRACKS VIEW ── */}
          {copilotView === 'tracks' && (
            <div style={{ padding: '36px 40px', maxWidth: '1000px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>My Tracks</h1>
                <p className="mono" style={{ fontSize: '11px', color: '#444' }}>{tracks.length} tracks built for {copilotProfile.business_name}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tracks.map((t, ti) => {
                  const isActive = t.code === activeTrack?.code
                  const trackConcepts = concepts.filter((c: any) => c.competency_code === t.code)
                  const trackMastered = trackConcepts.filter((c: any) => completedIds.has(c.id)).length
                  const trackTotal = trackConcepts.length || 8
                  const trackPct = trackTotal > 0 ? Math.round((trackMastered / trackTotal) * 100) : 0
                  const accentColor = ['#FF6A00','#FF8C00','#1D9E75'][ti] || '#FF6A00'
                  return (
                    <div key={t.code} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? `${accentColor}30` : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', overflow: 'hidden', borderTop: `3px solid ${isActive ? accentColor : 'rgba(255,255,255,0.08)'}` }}>
                      {/* Track header */}
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="mono" style={{ fontSize: '10px', fontWeight: '800', color: accentColor }}>0{ti+1}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#F0EDE6', marginBottom: '2px' }}>{t.name}</div>
                            <div className="mono" style={{ fontSize: '9px', color: '#444' }}>{trackMastered} of {trackTotal} concepts · {trackPct}%</div>
                          </div>
                          {isActive && <span style={{ fontSize: '8px', color: accentColor, background: `${accentColor}10`, border: `1px solid ${accentColor}25`, padding: '2px 8px', borderRadius: '100px', fontFamily: 'DM Mono, monospace', fontWeight: '700' }}>● Active</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: accentColor, letterSpacing: '-0.02em', lineHeight: '1' }}>{trackPct}%</div>
                          </div>
                          {isActive
                            ? <button onClick={() => setCopilotView('chat')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: accentColor, color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' as const }}>Continue →</button>
                            : <button onClick={() => { switchTrack(t); setCopilotView('chat') }} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid rgba(255,255,255,0.1)`, background: 'transparent', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' as const }}>Switch to this →</button>
                          }
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ padding: '0 20px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: trackTotal }).map((_, i) => (
                            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < trackMastered ? accentColor : 'rgba(255,255,255,0.06)' }} />
                          ))}
                        </div>
                      </div>
                      {/* Concepts grid */}
                      <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {trackConcepts.map((c: any) => {
                          const done = completedIds.has(c.id)
                          const isCurrent = c.id === currentConcept?.id && isActive
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '7px 10px', background: isCurrent ? `${accentColor}08` : done ? 'transparent' : 'rgba(255,255,255,0.01)', borderRadius: '7px', border: isCurrent ? `1px solid ${accentColor}20` : '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: done ? 'rgba(74,222,128,0.15)' : isCurrent ? `${accentColor}15` : 'rgba(255,255,255,0.04)', border: done ? '1px solid rgba(74,222,128,0.3)' : isCurrent ? `1px solid ${accentColor}30` : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                <span style={{ fontSize: '8px', fontWeight: '700', color: done ? '#4ADE80' : isCurrent ? accentColor : '#333' }}>{done ? '✓' : isCurrent ? '→' : String(c.sequence).padStart(2,'0')}</span>
                              </div>
                              <span style={{ fontSize: '11px', color: done ? '#555' : isCurrent ? '#F0EDE6' : '#888', lineHeight: '1.4', textDecoration: done ? 'line-through' : 'none' }}>{c.title}</span>
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

          {/* ── PROGRESS VIEW ── */}
          {copilotView === 'progress' && (
            <div style={{ padding: '36px 40px', maxWidth: '1000px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>Progress</h1>
                <p className="mono" style={{ fontSize: '11px', color: '#444' }}>{copilotProfile.business_name} · {copilotProfile.founder_name}</p>
              </div>

              {/* Overall stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '28px' }}>
                {[
                  { value: concepts.filter((c: any) => completedIds.has(c.id)).length, label: 'Concepts mastered', color: '#4ADE80' },
                  { value: concepts.filter((c: any) => !completedIds.has(c.id)).length, label: 'Remaining', color: '#F59E0B' },
                  { value: tracks.length, label: 'Total tracks', color: '#FF6A00' },
                  { value: concepts.length > 0 ? `${Math.round((concepts.filter((c: any) => completedIds.has(c.id)).length / concepts.length) * 100)}%` : '0%', label: 'Overall', color: '#60A5FA' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em', marginBottom: '3px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Per track */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tracks.map((t, ti) => {
                  const trackConcepts = concepts.filter((c: any) => c.competency_code === t.code)
                  const trackMastered = trackConcepts.filter((c: any) => completedIds.has(c.id)).length
                  const trackTotal = trackConcepts.length || 8
                  const trackPct = trackTotal > 0 ? Math.round((trackMastered / trackTotal) * 100) : 0
                  const isActive = t.code === activeTrack?.code
                  const accentColor = ['#FF6A00','#FF8C00','#1D9E75'][ti] || '#FF6A00'
                  return (
                    <div key={t.code} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '14px', overflow: 'hidden', borderLeft: `4px solid ${isActive ? accentColor : 'rgba(255,255,255,0.1)'}` }}>
                      {/* Header */}
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${accentColor}12`, border: `2px solid ${accentColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: accentColor }}>0{ti+1}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F0EDE6', marginBottom: '2px' }}>{t.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="mono" style={{ fontSize: '9px', color: '#444' }}>{trackMastered}/{trackTotal} concepts</span>
                              {isActive && <span style={{ fontSize: '8px', color: accentColor, background: `${accentColor}10`, padding: '1px 6px', borderRadius: '100px', fontFamily: 'DM Mono, monospace' }}>● Active</span>}
                            </div>
                          </div>
                        </div>
                        {/* Circular-style progress */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '28px', fontWeight: '900', color: trackPct > 0 ? accentColor : '#333', letterSpacing: '-0.03em', lineHeight: '1' }}>{trackPct}%</div>
                          <div className="mono" style={{ fontSize: '8px', color: '#444', marginTop: '2px' }}>complete</div>
                        </div>
                      </div>

                      {/* Progress bar — segmented */}
                      <div style={{ padding: '0 20px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {trackConcepts.map((c: any, ci: number) => {
                            const done = completedIds.has(c.id)
                            const isCurr = c.id === currentConcept?.id && isActive
                            return (
                              <div key={c.id} style={{ flex: 1, height: '6px', borderRadius: '3px', background: done ? accentColor : isCurr ? `${accentColor}50` : 'rgba(255,255,255,0.06)', transition: 'background 0.3s', position: 'relative' as const }} title={c.title} />
                            )
                          })}
                        </div>
                      </div>

                      {/* Concepts */}
                      <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {trackConcepts.map((c: any) => {
                          const done = completedIds.has(c.id)
                          const isCurrent = c.id === currentConcept?.id && isActive
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '6px 10px', background: isCurrent ? `${accentColor}08` : done ? 'rgba(74,222,128,0.03)' : 'rgba(255,255,255,0.01)', borderRadius: '7px', border: isCurrent ? `1px solid ${accentColor}20` : done ? '1px solid rgba(74,222,128,0.1)' : '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: done ? 'rgba(74,222,128,0.15)' : isCurrent ? `${accentColor}15` : 'rgba(255,255,255,0.04)', border: done ? '1px solid rgba(74,222,128,0.4)' : isCurrent ? `1px solid ${accentColor}40` : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                <span style={{ fontSize: '7px', fontWeight: '800', color: done ? '#4ADE80' : isCurrent ? accentColor : '#444' }}>{done ? '✓' : isCurrent ? '→' : String(c.sequence).padStart(2,'0')}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '11px', color: done ? '#555' : isCurrent ? '#F0EDE6' : '#888', lineHeight: '1.4', textDecoration: done ? 'line-through' : 'none', display: 'block' }}>{c.title}</span>
                                {done && <span style={{ fontSize: '8px', color: '#4ADE80', fontFamily: 'DM Mono, monospace' }}>Completed</span>}
                                {isCurrent && <span style={{ fontSize: '8px', color: accentColor, fontFamily: 'DM Mono, monospace' }}>In progress</span>}
                              </div>
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

  // ── LOGIN PAGE ──
  return (
    <div className="login-layout" style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .serif{font-family:'Fraunces',Georgia,serif}
        .mono{font-family:'DM Mono',monospace}
        input:focus{border-color:rgba(155,148,240,0.5)!important;outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        .section-label{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:6px}
        .section-title{font-size:14px;font-weight:600;color:#E8E6E0;margin-bottom:16px;line-height:1.4}

        @media(max-width:768px){
          .login-layout{flex-direction:column!important}
          .login-left{padding:32px 24px 48px!important}
          .login-right{width:100%!important;height:auto!important;position:relative!important;border-left:none!important;border-top:1px solid rgba(255,255,255,0.06)!important;padding:36px 24px!important}
          .sticky-bar{padding:14px 20px!important}
          .sprints-grid{grid-template-columns:1fr!important}
          .timeline-grid{grid-template-columns:1fr 1fr!important}
          .hero-title{font-size:32px!important}
          .dash-nav{padding:0 16px!important}
          .dash-aside{display:none!important}
          .dash-main{margin-left:0!important;height:calc(100vh - 56px)!important}
        }
        @media(max-width:480px){
          .timeline-grid{grid-template-columns:1fr!important}
          .login-left{padding:24px 16px 40px!important}
          .login-right{padding:28px 16px!important}
        }
      `}</style>

      {/* LEFT — scrollable */}
      <div className="login-left-wrap" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Sticky top bar */}
        <div className="sticky-bar" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '18px 52px', background: 'rgba(5,3,9,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(155,148,240,0.2)', border: '1px solid rgba(155,148,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9B94F0' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6' }}>{copilotProfile.business_name} Co-Pilot</div>
            <div className="mono" style={{ fontSize: '8px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Powered by LaunchPilot</div>
          </div>
        </div>

        <div className="login-left" style={{ padding: '52px 52px 80px' }}>

          {/* HERO */}
          <div style={{ marginBottom: '60px' }}>
            <div className="mono" style={{ fontSize: '9px', color: '#9B94F0', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>Your personalised roadmap</div>
            <h1 className="serif hero-title" style={{ fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: '900', color: '#F0EDE6', letterSpacing: '-0.03em', lineHeight: '1.08', marginBottom: '16px' }}>
              Hey {copilotProfile.founder_name},<br />
              <span style={{ color: '#9B94F0', fontStyle: 'italic' }}>your program is ready.</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#AAA', lineHeight: '1.8', maxWidth: '500px' }}>
              Built specifically for <strong style={{ color: '#E8E6E0' }}>{copilotProfile.business_name}</strong> — your mentors, focus areas, sprints and milestones are all tailored to your stage and idea.
            </p>
          </div>

          {/* ── TRACKS ── */}
          <div style={{ marginBottom: '56px' }}>
            <div className="section-label" style={{ color: '#9B94F0' }}>AI Co-Pilot Focus Areas</div>
            <div className="section-title">Your 3 main focus areas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tracks.map((t, i) => (
                <div key={t.code} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(155,148,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '10px', fontWeight: '700', color: '#9B94F0' }}>0{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#E8E6E0' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '3px', lineHeight: '1.4' }}>{content?.track_descriptions?.[i] || '8 custom concepts tailored to your business'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MENTORS ── */}
          {content?.mentors && content.mentors.length > 0 && (
            <div style={{ marginBottom: '56px' }}>
              <div className="section-label" style={{ color: '#1D9E75' }}>Your mentors</div>
              <div className="section-title">From 100+ mentors, we shortlisted these 5 for {copilotProfile.business_name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {content.mentors.map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(29,158,117,0.3)', flexShrink: 0, background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.img ? (
                        <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1D9E75' }}>{m.name?.[0]}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '1px' }}>{m.name}</div>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{m.role} · {m.company}</div>
                      <div style={{ fontSize: '12px', color: '#AAA', lineHeight: '1.5' }}>{m.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MONTHLY SPRINTS ── */}
          {content?.sprints && (
            <div style={{ marginBottom: '56px' }}>
              <div className="section-label" style={{ color: '#BA7517' }}>Monthly sprints</div>
              <div className="section-title">6 sprints lined up for you — 4 weeks each</div>
              <div className="sprints-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {content.sprints.map((s: any, i: number) => (
                  <div key={i} style={{ padding: '16px 18px', background: i % 2 === 0 ? 'rgba(186,117,23,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', borderTop: `2px solid ${i % 2 === 0 ? 'rgba(186,117,23,0.4)' : 'rgba(155,148,240,0.3)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i % 2 === 0 ? 'rgba(186,117,23,0.15)' : 'rgba(155,148,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="mono" style={{ fontSize: '8px', fontWeight: '700', color: i % 2 === 0 ? '#BA7517' : '#9B94F0' }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', lineHeight: '1.3' }}>{s.name.replace(/\s*\([^)]*\)/g, '').trim()}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.6', marginBottom: '8px' }}>{s.description}</div>
                    <div style={{ fontSize: '11px', color: '#BA7517', lineHeight: '1.5', padding: '6px 10px', background: 'rgba(186,117,23,0.06)', borderRadius: '6px' }}>
                      For {copilotProfile.business_name}: {s.relevance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXPERIENTIAL SESSIONS ── */}
          {content?.sunday_sessions && (
            <div style={{ marginBottom: '56px' }}>
              <div className="section-label" style={{ color: '#6C47FF' }}>Experiential sessions</div>
              <div className="section-title">We run live sessions every Sunday — these 5 are most useful for you</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {content.sunday_sessions.slice(0, 5).map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="mono" style={{ fontSize: '9px', fontWeight: '700', color: '#8B6FFF' }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '3px' }}>{s.theme.replace(/^[A-Za-z\s]+[:\-–—]\s*/g, '').trim()}</div>
                      <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.55', marginBottom: '4px' }}>{s.description}</div>
                      <div style={{ fontSize: '11px', color: '#8B6FFF' }}>Why: {s.relevance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TOOLS & DEALS ── */}
          <div style={{ marginBottom: '56px' }}>
            <div className="section-label" style={{ color: '#60A5FA' }}>Tools & deals platform</div>
            <div className="section-title">500+ tools — free or heavily discounted for you</div>
            <div style={{ padding: '20px 22px', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '14px' }}>
              <p style={{ fontSize: '13px', color: '#AAA', lineHeight: '1.7', marginBottom: '16px' }}>
                {content?.tools_highlight || `As a LaunchPilot member, you get access to 500+ tools, software deals and platforms at no cost or heavily discounted — everything ${copilotProfile.business_name} needs to launch and grow.`}
              </p>
              {content?.tools && content.tools.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {content.tools.map((tool: string, i: number) => (
                    <span key={i} style={{ padding: '4px 12px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '100px', fontSize: '12px', color: '#93C5FD', fontWeight: '500' }}>
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 6-MONTH NORTHSTAR ── */}
          {content?.timeline && (
            <div style={{ marginBottom: '56px' }}>
              <div className="section-label" style={{ color: '#AAA' }}>Your 6-month northstar</div>
              <div className="section-title">The journey for {copilotProfile.business_name}</div>
              <div className="timeline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
                {content.timeline.map((t: any, i: number) => {
                  const colors = ['#9B94F0','#8B6FFF','#7A6FFF','#1D9E75','#17876A','#117055']
                  const col = colors[i] || '#9B94F0'
                  const isLast = i === content.timeline.length - 1
                  const isEndOfRow = (i + 1) % 3 === 0
                  return (
                    <div key={i} style={{ position: 'relative' }}>
                      {/* Arrow connector */}
                      {!isLast && !isEndOfRow && (
                        <div style={{ position: 'absolute', right: '-1px', top: '24px', zIndex: 2, fontSize: '14px', color: 'rgba(255,255,255,0.2)' }}>›</div>
                      )}
                      {/* Down arrow at end of row 1 */}
                      {i === 2 && (
                        <div style={{ position: 'absolute', bottom: '-18px', right: '50%', zIndex: 2, fontSize: '14px', color: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' }}>›</div>
                      )}
                      <div style={{ margin: '0 4px 8px', padding: '16px 14px', background: `${col}08`, border: `1px solid ${col}20`, borderRadius: '12px', borderTop: `2px solid ${col}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${col}18`, border: `1px solid ${col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="mono" style={{ fontSize: '8px', fontWeight: '700', color: col }}>M{i + 1}</span>
                          </div>
                          <span className="mono" style={{ fontSize: '8px', color: col, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.month}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#F0EDE6', marginBottom: '5px', lineHeight: '1.3' }}>{t.milestone}</div>
                        <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.55' }}>{t.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Journey arrow */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.15)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#1D9E75' }}>→</span>
                <span style={{ fontSize: '12px', color: '#AAA' }}>Complete this journey and {copilotProfile.business_name} will have traction, revenue, and a clear path to scale.</span>
              </div>
            </div>
          )}

          {/* ── CRITICAL QUESTIONS ── at the end */}
          {content?.critical_warnings && (
            <div style={{ marginBottom: '48px' }}>
              <div className="section-label" style={{ color: '#D85A30' }}>Before you begin</div>
              <div className="section-title">Questions {copilotProfile.business_name} must answer</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {content.critical_warnings.map((w: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 18px', background: 'rgba(216,90,48,0.04)', border: '1px solid rgba(216,90,48,0.12)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '16px', color: '#D85A30', flexShrink: 0 }}>?</span>
                    <span style={{ fontSize: '14px', color: '#E8E6E0', fontWeight: '500', lineHeight: '1.4' }}>
                      {w.question || w.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT — sticky login */}
      <div className="login-right" style={{ width: '380px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', background: '#07050F', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '8px' }}>Sign in</h2>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
            Your personalised session for {copilotProfile.business_name} is ready.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              style={{ width: '100%', padding: '13px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#F0EDE6', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label className="mono" style={{ display: 'block', fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', padding: '13px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#F0EDE6', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
          </div>
          {loginError && (
            <div style={{ padding: '10px 14px', background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F97066' }}>
              {loginError}
            </div>
          )}
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '9px', border: 'none', background: '#9B94F0', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px', letterSpacing: '-0.01em' }}>
            Enter →
          </button>
        </form>

        <div style={{ padding: '18px', background: 'rgba(155,148,240,0.06)', border: '1px solid rgba(155,148,240,0.14)', borderRadius: '12px', marginBottom: '24px' }}>
          <div className="mono" style={{ fontSize: '9px', color: '#9B94F0', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>What's inside</div>
          {[
            `${tracks.length} tracks built for ${copilotProfile.business_name}`,
            '8 custom concepts per track',
            'AI + real world learning sessions',
            'Full memory across every session',
            '500+ tools and deals',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '7px' }}>
              <span style={{ color: '#9B94F0', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '12px', color: '#AAA', lineHeight: '1.5' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <button onClick={handleBrochure}
            style={{ width: '100%', padding: '11px', borderRadius: '9px', border: '1px solid rgba(155,148,240,0.2)', background: 'rgba(155,148,240,0.06)', color: '#9B94F0', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            📄 View Personalised Brochure
          </button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#444', letterSpacing: '0.08em' }}>Private session · Not for sharing</div>
        </div>
      </div>
    </div>
  )
}
