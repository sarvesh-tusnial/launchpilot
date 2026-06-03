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

    const trackCodes = [cp.track_1_code, cp.track_2_code, cp.track_3_code].filter(Boolean)
    const supabase = createClient()
    const { data: compData } = await supabase.from('competencies').select('code, name').in('code', trackCodes)
    const trackList = trackCodes.map(code => ({
      code, name: compData?.find((c: any) => c.code === code)?.name || code,
    }))
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
    const [conceptData, progressData, chatData] = await Promise.all([
      supabase.from('concepts').select('*').eq('competency_code', trackCode).order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', userId),
      supabase.from('chat_messages').select('role, content, created_at').eq('student_id', userId).order('created_at', { ascending: false }).limit(50),
    ])
    const allConcepts  = conceptData.data || []
    const allProgress  = progressData.data || []
    const completedIds = new Set(allProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    const current      = allConcepts.find((c: any) => !completedIds.has(c.id)) || allConcepts[0] || null
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
  const content       = copilotProfile?.personalised_content

  const openingMessage = copilotProfile && currentConcept
    ? `Hey ${copilotProfile.founder_name}! Ready to work on **${activeTrack?.name}**? We're on "${currentConcept.title}" — let's pick up where we left off.`
    : `Hey ${copilotProfile?.founder_name || 'there'}! Welcome to your co-pilot. Let's get started on ${activeTrack?.name}.`

  const sessionContext = copilotProfile
    ? `Co-pilot for ${copilotProfile.founder_name}, founder of ${copilotProfile.business_name} (${copilotProfile.business_category}, ${copilotProfile.business_stage}, ${copilotProfile.country}). Business: ${copilotProfile.business_description}. Track: ${activeTrack?.name}, concept: "${currentConcept?.title || 'first concept'}".`
    : ''

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#333', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
    </div>
  )

  if (notFound || !copilotProfile) return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#F0EDE6', marginBottom: '10px' }}>Not found</div>
        <div style={{ fontSize: '14px', color: '#444' }}>This co-pilot doesn't exist or has been removed.</div>
      </div>
    </div>
  )

  // ── DASHBOARD ──
  if (loggedIn) return (
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
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#C8C4BC', marginBottom: '8px', lineHeight: '1.4' }}>{currentConcept?.title || 'Starting first concept'}</div>
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
                          <span style={{ fontSize: '9px', color: isDone ? '#1D9E75' : isCurrent ? '#7F77DD' : '#222', flexShrink: 0, marginTop: '2px' }}>{isDone ? '✓' : isCurrent ? '→' : '○'}</span>
                          <span style={{ fontSize: '11px', color: isDone ? '#2a2a2a' : isCurrent ? '#C8C4BC' : '#444', lineHeight: '1.4', textDecoration: isDone ? 'line-through' : 'none' }}>{c.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
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

  // ── LOGIN PAGE ──
  return (
    <div style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#E8E6E0', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .serif{font-family:'Fraunces',Georgia,serif} .mono{font-family:'DM Mono',monospace}
        input:focus{border-color:rgba(127,119,221,0.5)!important;outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* LEFT — scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0', position: 'relative' }}>

        {/* Sticky brand bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '20px 56px', background: 'rgba(5,3,9,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0', letterSpacing: '-0.01em' }}>{copilotProfile.business_name} Co-Pilot</div>
            <div className="mono" style={{ fontSize: '8px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Powered by LaunchPilot</div>
          </div>
        </div>

        <div style={{ padding: '56px 56px 80px' }}>

          {/* HERO — personalised welcome */}
          <div style={{ marginBottom: '64px' }}>
            <div className="mono" style={{ fontSize: '9px', color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>Your personalised roadmap</div>
            <h1 className="serif" style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: '900', color: '#F0EDE6', letterSpacing: '-0.03em', lineHeight: '1.06', marginBottom: '16px' }}>
              Hey {copilotProfile.founder_name},<br /><span style={{ color: '#7F77DD', fontStyle: 'italic' }}>your program is ready.</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: '1.8', maxWidth: '520px' }}>
              Everything below has been built specifically for <strong style={{ color: '#C8C4BC' }}>{copilotProfile.business_name}</strong> — your mentors, your sprints, your milestones. This is your 6-month path to traction.
            </p>
          </div>

          {/* ── SECTION 1: CRITICAL WARNINGS ── */}
          {content?.critical_warnings && (
            <div style={{ marginBottom: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', background: '#D85A30', borderRadius: '2px' }} />
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#D85A30', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Critical risks for {copilotProfile.business_name}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>These will kill your business if you don't address them.</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {content.critical_warnings.map((w: any, i: number) => (
                  <div key={i} style={{ padding: '18px 20px', background: 'rgba(216,90,48,0.04)', border: '1px solid rgba(216,90,48,0.15)', borderRadius: '12px', borderLeft: '3px solid #D85A30' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '6px', lineHeight: '1.3' }}>{w.title}</div>
                    <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.65' }}>{w.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 2: YOUR TRACKS ── */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '20px', background: '#7F77DD', borderRadius: '2px' }} />
              <div>
                <div className="mono" style={{ fontSize: '9px', color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Your curriculum</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>3 tracks built from scratch for {copilotProfile.business_name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tracks.map((t, i) => (
                <div key={t.code} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(127,119,221,0.04)', border: '1px solid rgba(127,119,221,0.1)', borderRadius: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(127,119,221,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '10px', fontWeight: '700', color: '#7F77DD' }}>0{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#C8C4BC' }}>{t.name}</div>
                    <div className="mono" style={{ fontSize: '9px', color: '#333', marginTop: '2px' }}>8 concepts — specific to {copilotProfile.business_name}</div>
                  </div>
                  <span className="mono" style={{ fontSize: '9px', color: '#7F77DD', background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.2)', padding: '2px 8px', borderRadius: '4px' }}>{t.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 3: YOUR MENTORS ── */}
          {content?.mentors && content.mentors.length > 0 && (
            <div style={{ marginBottom: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', background: '#1D9E75', borderRadius: '2px' }} />
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Your mentors</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Handpicked for {copilotProfile.business_name} — their knowledge is inside Maya</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {content.mentors.map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px 18px', background: 'rgba(29,158,117,0.04)', border: '1px solid rgba(29,158,117,0.12)', borderRadius: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(29,158,117,0.2)', flexShrink: 0, background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.img ? (
                        <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1D9E75' }}>{m.name?.[0]}</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EDE6', marginBottom: '2px' }}>{m.name}</div>
                      <div style={{ fontSize: '12px', color: '#555', marginBottom: '6px' }}>{m.role} · {m.company}</div>
                      <div style={{ fontSize: '12px', color: '#1D9E75', fontStyle: 'italic', lineHeight: '1.5' }}>{m.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 4: MONTHLY SPRINTS ── */}
          {content?.sprints && (
            <div style={{ marginBottom: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '4px', height: '20px', background: '#BA7517', borderRadius: '2px' }} />
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#BA7517', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Monthly sprints for you</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Live 3-day intensives picked for your stage and business</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {content.sprints.map((s: any, i: number) => (
                  <div key={i} style={{ padding: '16px 18px', background: 'rgba(186,117,23,0.04)', border: '1px solid rgba(186,117,23,0.12)', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '48px' }}>
                      <div className="mono" style={{ fontSize: '8px', color: '#BA7517', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.month}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '4px' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.6', marginBottom: '4px' }}>{s.description}</div>
                      <div style={{ fontSize: '11px', color: '#BA7517', fontStyle: 'italic' }}>Why this for {copilotProfile.business_name}: {s.relevance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION 5: SUNDAY SESSIONS + TOOLS ── */}
          <div style={{ marginBottom: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '20px', background: '#6C47FF', borderRadius: '2px' }} />
              <div>
                <div className="mono" style={{ fontSize: '9px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Experiential sessions</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Sundays. In person. Across cities.</div>
              </div>
            </div>
            {content?.sunday_sessions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {content.sunday_sessions.map((s: any, i: number) => (
                  <div key={i} style={{ padding: '14px 18px', background: 'rgba(108,71,255,0.04)', border: '1px solid rgba(108,71,255,0.1)', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, padding: '4px 10px', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: '6px' }}>
                      <div className="mono" style={{ fontSize: '9px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.city}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#C8C4BC', marginBottom: '3px' }}>{s.theme}</div>
                      <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.5' }}>{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {content?.tools_highlight && (
              <div style={{ padding: '16px 20px', background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.14)', borderRadius: '12px' }}>
                <div className="mono" style={{ fontSize: '9px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>500+ Tools & Deals Platform</div>
                <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.65' }}>{content.tools_highlight}</div>
              </div>
            )}
          </div>

          {/* ── SECTION 6: OUTCOMES TIMELINE ── */}
          {content?.timeline && (
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '4px', height: '20px', background: '#F0EDE6', borderRadius: '2px' }} />
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Your 6-month northstar</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Where {copilotProfile.business_name} should be, month by month</div>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '19px', top: '20px', bottom: '20px', width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {content.timeline.map((t: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `rgba(127,119,221,${0.06 + i * 0.025})`, border: `1px solid rgba(127,119,221,${0.1 + i * 0.03})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                        <span className="mono" style={{ fontSize: '8px', color: '#7F77DD', fontWeight: '700' }}>M{i + 1}</span>
                      </div>
                      <div style={{ flex: 1, paddingTop: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#D4D0CC', marginBottom: '3px' }}>{t.milestone}</div>
                        <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.55' }}>{t.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT — fixed login panel */}
      <div style={{ width: '400px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', background: '#07050F', borderLeft: '1px solid rgba(127,119,221,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 44px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '8px' }}>Sign in</h2>
          <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>Access your private co-pilot session for {copilotProfile.business_name}.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
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
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '9px', border: 'none', background: '#7F77DD', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
            Enter →
          </button>
        </form>

        {/* Preview of what's inside */}
        <div style={{ padding: '16px', background: 'rgba(127,119,221,0.05)', border: '1px solid rgba(127,119,221,0.12)', borderRadius: '12px', marginBottom: '24px' }}>
          <div className="mono" style={{ fontSize: '9px', color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>What's inside</div>
          {[
            `${tracks.length} custom tracks for ${copilotProfile.business_name}`,
            '8 concepts per track — specific to your business',
            'Maya knows your business deeply',
            'Full 8-stage structured sessions',
            'Memory across every session',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span style={{ color: '#7F77DD', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '12px', color: '#555', lineHeight: '1.5' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#222', letterSpacing: '0.08em' }}>Private session · Not for sharing</div>
        </div>
      </div>
    </div>
  )
}
