'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import MayaChat from '@/components/features/MayaChat'
import { useParams } from 'next/navigation'

export default function CopilotPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [loggedIn, setLoggedIn]     = useState(false)
  const [checking, setChecking]     = useState(true)
  const [copilotProfile, setCopilotProfile] = useState<any>(null)
  const [notFound, setNotFound]     = useState(false)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTrack, setActiveTrack] = useState<any>(null)
  const [tracks, setTracks]         = useState<any[]>([])
  const [concepts, setConcepts]     = useState<any[]>([])
  const [conceptProgress, setConceptProgress] = useState<any[]>([])
  const [currentConcept, setCurrentConcept] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [profile, setProfile]       = useState<any>(null)
  const [loadingTrack, setLoadingTrack] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => { loadCopilotProfile() }, [slug])

  const loadCopilotProfile = async () => {
    const res = await fetch(`/api/copilot/${slug}`)
    if (!res.ok) { setNotFound(true); setChecking(false); return }
    const data = await res.json()
    const cp = data.copilot
    setCopilotProfile(cp)

    // Build track list from competencies table
    const trackCodes = [cp.track_1_code, cp.track_2_code, cp.track_3_code].filter(Boolean)
    const supabase = createClient()
    const { data: compData } = await supabase
      .from('competencies')
      .select('code, name')
      .in('code', trackCodes)

    const trackList = trackCodes.map(code => ({
      code,
      name: compData?.find((c: any) => c.code === code)?.name || code,
    }))
    setTracks(trackList)

    // Check if already logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email === cp.email) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      setLoggedIn(true)
      // Load first track data immediately
      await loadTrackDataDirect(trackCodes[0], trackList, user.id)
    }
    setChecking(false)
  }

  const loadTrackDataDirect = async (trackCode: string, trackList: any[], userId: string) => {
    setLoadingTrack(true)
    const supabase = createClient()
    const [conceptData, progressData, chatData] = await Promise.all([
      supabase.from('concepts').select('*').eq('competency_code', trackCode).order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', userId),
      supabase.from('chat_messages').select('role, content, created_at').eq('student_id', userId).order('created_at', { ascending: false }).limit(50),
    ])

    const allConcepts  = conceptData.data || []
    const allProgress  = progressData.data || []
    const completedIds = new Set(allProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    const current      = allConcepts.find((c: any) => !completedIds.has(c.id)) || allConcepts[0] || null

    const track = trackList.find(t => t.code === trackCode)
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

    // Update status
    await supabase.from('student_competencies').update({ status: 'paused' }).eq('student_id', user.id).eq('status', 'active')
    await supabase.from('student_competencies').update({ status: 'active' }).eq('student_id', user.id).eq('competency_code', track.code)

    await loadTrackDataDirect(track.code, tracks, user.id)
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
    setLoggedIn(false)
    setProfile(null)
    setInitialized(false)
  }

  const completedIds  = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
  const masteredCount = concepts.filter(c => completedIds.has(c.id)).length
  const currentStage  = conceptProgress.find(p => p.concept_id === currentConcept?.id)?.stage || 1
  const totalConcepts = concepts.length || 8

  const openingMessage = copilotProfile && currentConcept
    ? `Hey ${copilotProfile.founder_name}! Ready to work on **${activeTrack?.name}**? We're on "${currentConcept.title}" — let's pick up where we left off.`
    : `Hey ${copilotProfile?.founder_name || 'there'}! Welcome to your co-pilot. Let's get started on ${activeTrack?.name}.`

  const sessionContext = copilotProfile
    ? `Co-pilot session for ${copilotProfile.founder_name}, founder of ${copilotProfile.business_name} (${copilotProfile.business_category}, ${copilotProfile.business_stage} stage, ${copilotProfile.country}). Business: ${copilotProfile.business_description}. Currently on track: ${activeTrack?.name || ''}, concept: "${currentConcept?.title || 'first concept'}".`
    : ''

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#333', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
    </div>
  )

  if (notFound || !copilotProfile) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#F0EDE6', marginBottom: '12px' }}>Not found</div>
        <div style={{ fontSize: '14px', color: '#444' }}>This co-pilot doesn't exist or has been removed.</div>
      </div>
    </div>
  )

  // ── LOGIN ──
  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'grid', gridTemplateColumns: '1fr 400px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .serif{font-family:'Fraunces',Georgia,serif} .mono{font-family:'DM Mono',monospace}
        input:focus{border-color:rgba(127,119,221,0.5)!important;outline:none}
      `}</style>
      <div style={{ padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7F77DD' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#E8E6E0' }}>{copilotProfile.business_name} Co-Pilot</div>
              <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Powered by LaunchPilot</div>
            </div>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: '900', color: '#F0EDE6', letterSpacing: '-0.03em', lineHeight: '1.06', marginBottom: '20px' }}>
            Hey {copilotProfile.founder_name},<br /><span style={{ color: '#7F77DD', fontStyle: 'italic' }}>welcome.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: '1.8', marginBottom: '48px' }}>
            Your personal AI co-pilot for <strong style={{ color: '#C8C4BC' }}>{copilotProfile.business_name}</strong> — built around your business, your stage, and your goals.
          </p>
          <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>Your tracks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '48px' }}>
            {tracks.map((t, i) => (
              <div key={t.code} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(127,119,221,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: '9px', fontWeight: '700', color: '#7F77DD' }}>0{i + 1}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#C8C4BC' }}>{t.name}</span>
              </div>
            ))}
          </div>
          <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>How it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Maya knows your business deeply — every session is specific to you', 'Structured 8-stage sessions from hook to action step', 'Every session ends with one specific commitment to execute'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <span className="mono" style={{ fontSize: '9px', color: '#7F77DD', fontWeight: '700', flexShrink: 0, marginTop: '3px' }}>0{i + 1}</span>
                <span style={{ fontSize: '13px', color: '#444', lineHeight: '1.65' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: '#07050F', borderLeft: '1px solid rgba(127,119,221,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '6px' }}>Sign in</h2>
            <p style={{ fontSize: '13px', color: '#333' }}>Access your private co-pilot session.</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="mono" style={{ display: 'block', fontSize: '10px', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                style={{ width: '100%', padding: '13px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#E8E6E0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label className="mono" style={{ display: 'block', fontSize: '10px', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '13px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#E8E6E0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            </div>
            {loginError && <div style={{ padding: '10px 14px', background: 'rgba(216,90,48,0.08)', border: '1px solid rgba(216,90,48,0.18)', borderRadius: '8px', fontSize: '13px', color: '#D85A30' }}>{loginError}</div>}
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '9px', border: 'none', background: '#7F77DD', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '6px' }}>Enter →</button>
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); .mono{font-family:'DM Mono',monospace;}`}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '56px', background: 'rgba(5,3,9,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0' }}>{copilotProfile.business_name} Co-Pilot</div>
            <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Powered by LaunchPilot</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="mono" style={{ fontSize: '11px', color: '#2a2a2a' }}>{copilotProfile.founder_name}</span>
          <button onClick={handleSignOut} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#333', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>
        <aside style={{ width: '256px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.04)', padding: '24px 16px', position: 'fixed', top: '56px', bottom: 0, left: 0, overflowY: 'auto', background: '#050309' }}>

          <div className="mono" style={{ fontSize: '9px', color: '#222', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>Tracks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '20px' }}>
            {tracks.map((t, i) => {
              const isActive = t.code === activeTrack?.code
              return (
                <button key={t.code} onClick={() => switchTrack(t)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', background: isActive ? 'rgba(127,119,221,0.08)' : 'transparent', border: isActive ? '1px solid rgba(127,119,221,0.18)' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: isActive ? 'rgba(127,119,221,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '9px', fontWeight: '700', color: isActive ? '#7F77DD' : '#333' }}>0{i + 1}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: isActive ? '#E8E6E0' : '#555', lineHeight: '1.3' }}>{t.name}</span>
                </button>
              )
            })}
          </div>

          {!loadingTrack && activeTrack && (
            <>
              <div style={{ padding: '14px', background: 'rgba(127,119,221,0.06)', border: '1px solid rgba(127,119,221,0.14)', borderRadius: '10px', marginBottom: '16px' }}>
                <div className="mono" style={{ fontSize: '9px', color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Now Studying</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#C8C4BC', marginBottom: '8px', lineHeight: '1.4' }}>
                  {currentConcept?.title || 'Starting first concept'}
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                  {Array.from({ length: totalConcepts }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < masteredCount ? '#7F77DD' : 'rgba(255,255,255,0.05)' }} />
                  ))}
                </div>
                <div className="mono" style={{ fontSize: '9px', color: '#2a2a2a' }}>{masteredCount}/{totalConcepts} completed</div>
              </div>

              {concepts.length > 0 && (
                <>
                  <div className="mono" style={{ fontSize: '9px', color: '#222', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px' }}>Concepts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {concepts.map((c: any) => {
                      const isDone = completedIds.has(c.id)
                      const isCurrent = c.id === currentConcept?.id
                      return (
                        <div key={c.id} style={{ display: 'flex', gap: '8px', padding: '5px 6px', borderRadius: '5px', background: isCurrent ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                          <span style={{ fontSize: '9px', color: isDone ? '#1D9E75' : isCurrent ? '#7F77DD' : '#222', flexShrink: 0, marginTop: '2px' }}>
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
            </>
          )}

          {loadingTrack && (
            <div className="mono" style={{ fontSize: '10px', color: '#222', textAlign: 'center', padding: '20px 0' }}>Loading...</div>
          )}
        </aside>

        <main style={{ marginLeft: '256px', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
          {!initialized || loadingTrack ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="mono" style={{ fontSize: '11px', color: '#222' }}>Loading your session...</div>
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
        </main>
      </div>
    </div>
  )
}
