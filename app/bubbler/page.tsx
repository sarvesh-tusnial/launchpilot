'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import MayaChat from '@/components/features/MayaChat'

const TRACKS = [
  { code: 'B01', name: 'Business Fundamentals', emoji: '🧱', total: 30, color: '#6C47FF' },
  { code: 'B02', name: 'Revenue',               emoji: '💰', total: 8,  color: '#00C851' },
  { code: 'B03', name: 'Scale',                 emoji: '📈', total: 8,  color: '#F59E0B' },
  { code: 'B04', name: 'Fundraising',           emoji: '🚀', total: 8,  color: '#F97066' },
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
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('bubbler_auth')
    if (saved === 'true') {
      setLoggedIn(true)
      initSession()
    }
    setChecking(false)
  }, [])

  useEffect(() => {
    if (loggedIn) loadTrackData(activeTrack)
  }, [activeTrack, loggedIn])

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
      const { error } = await supabase.auth.signInWithPassword({
        email: HARDCODED_EMAIL, password: HARDCODED_PASSWORD,
      })
      if (error) {
        setLoginError('Login failed — please contact your admin.')
        return
      }
      localStorage.setItem('bubbler_auth', 'true')
      setLoggedIn(true)
      initSession()
    } else {
      setLoginError('Invalid credentials. Contact your LaunchPilot admin.')
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
    ? `Hey! Ready to work on **${track.name}**? We're on "${currentConcept.title}" — let's pick up where we left off.`
    : `Welcome to the ${track.name} track! Let's get started.`

  const sessionContext = currentConcept
    ? `Bubbler founder working on ${track.name} track, concept: "${currentConcept.title}" (${currentConcept.sequence}/${track.total})`
    : `Bubbler founder starting ${track.name} track`

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#07040F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#444', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
    </div>
  )

  // ── LOGIN ──
  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: '#07040F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6C47FF, #A78BFA)', fontSize: '26px', marginBottom: '16px' }}>🫧</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', marginBottom: '4px' }}>Bubbler Co-Pilot</div>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Private Access · Powered by LaunchPilot</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '6px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F0EDE6', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '6px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F0EDE6', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            </div>
            {loginError && <div style={{ padding: '10px 14px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', fontSize: '13px', color: '#F97066' }}>{loginError}</div>}
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6C47FF, #8B6FFF)', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              Enter →
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#333', fontFamily: 'DM Mono, monospace' }}>Private session · Not for sharing</div>
      </div>
    </div>
  )

  // ── DASHBOARD ──
  return (
    <div style={{ background: '#07040F', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#F0EDE6', display: 'flex', flexDirection: 'column' }}>

      {/* TOP NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '60px', background: 'rgba(7,4,15,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6C47FF, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🫧</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F0EDE6' }}>Bubbler Co-Pilot</div>
            <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Powered by LaunchPilot</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>founder@bubbler.app</span>
          <button onClick={handleSignOut} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#444', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, paddingTop: '60px' }}>

        {/* LEFT SIDEBAR */}
        <aside style={{ width: '260px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 16px', position: 'fixed', top: '60px', bottom: 0, left: 0, overflowY: 'auto', background: '#07040F' }}>

          {/* Track selector */}
          <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Tracks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
            {TRACKS.map(t => {
              const isActive = t.code === activeTrack
              return (
                <button key={t.code} onClick={() => setActiveTrack(t.code)} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                  background: isActive ? `rgba(${t.color === '#6C47FF' ? '108,71,255' : t.color === '#00C851' ? '0,200,81' : t.color === '#F59E0B' ? '245,158,11' : '249,112,102'},0.1)` : 'transparent',
                  border: isActive ? `1px solid ${t.color}33` : '1px solid transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{t.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: isActive ? '#F0EDE6' : '#888', lineHeight: '1.2', marginBottom: '2px' }}>{t.name}</div>
                    <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#444' }}>{t.total} concepts</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active track progress */}
          {!loading && (
            <>
              <div style={{ padding: '12px', background: `rgba(${track.color === '#6C47FF' ? '108,71,255' : track.color === '#00C851' ? '0,200,81' : track.color === '#F59E0B' ? '245,158,11' : '249,112,102'},0.06)`, border: `1px solid ${track.color}22`, borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: track.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Now Studying</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6', marginBottom: '8px', lineHeight: '1.3' }}>
                  {currentConcept?.title || 'Starting first concept'}
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                  {Array.from({ length: track.total }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < masteredCount ? track.color : 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: '#444', fontFamily: 'DM Mono, monospace' }}>{masteredCount}/{track.total} completed</div>
              </div>

              {/* Concepts list */}
              <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Concepts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {concepts.map((c: any) => {
                  const isDone    = completedIds.has(c.id)
                  const isCurrent = c.id === currentConcept?.id
                  return (
                    <div key={c.id} style={{ display: 'flex', gap: '8px', padding: '5px 6px', borderRadius: '6px', background: isCurrent ? 'rgba(255,255,255,0.04)' : 'transparent', border: isCurrent ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent' }}>
                      <span style={{ fontSize: '10px', color: isDone ? '#00C851' : isCurrent ? track.color : '#333', flexShrink: 0, marginTop: '1px' }}>
                        {isDone ? '✓' : isCurrent ? '→' : '○'}
                      </span>
                      <span style={{ fontSize: '10px', color: isDone ? '#444' : isCurrent ? '#E8E6E0' : '#666', lineHeight: '1.4', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {c.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </aside>

        {/* MAIN — Maya chat */}
        <main style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '13px', color: '#444', fontFamily: 'DM Mono, monospace' }}>Loading track...</div>
            </div>
          ) : (
            <MayaChat
              profile={profile || { full_name: 'Bubbler Founder', email: HARDCODED_EMAIL }}
              openingMessage={openingMessage}
              sessionContext={sessionContext}
              chatHistory={chatHistory}
              currentConceptId={currentConcept?.id}
              currentStage={currentStage}
              apiRoute="/api/bubbler-maya"
            />
          )}
        </main>
      </div>
    </div>
  )
}
