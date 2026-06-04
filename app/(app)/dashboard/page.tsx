'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MayaChat from '@/components/features/MayaChat'

type View = 'dashboard' | 'chat' | 'competencies' | 'progress'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [competencies, setCompetencies] = useState<any[]>([])
  const [studentComps, setStudentComps] = useState<any[]>([])
  const [concepts, setConcepts] = useState<any[]>([])
  const [conceptProgress, setConceptProgress] = useState<any[]>([])
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [activeComp, setActiveComp] = useState<any>(null)
  const [currentConcept, setCurrentConcept] = useState<any>(null)
  const [view, setView] = useState<View>('dashboard')
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [profileRes, scRes, allCompsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('student_competencies').select('*').eq('student_id', user.id),
      supabase.from('competencies').select('*').order('order_index'),
    ])

    const prof = profileRes.data
    const scs = scRes.data || []
    const allComps = allCompsRes.data || []
    setProfile(prof)
    setStudentComps(scs)

    // Only show competencies this student has access to
    const unlockedCodes = scs.filter((sc: any) => sc.is_unlocked).map((sc: any) => sc.competency_code)
    const myComps = allComps.filter((c: any) => unlockedCodes.includes(c.code))
    setCompetencies(myComps)

    const active = scs.find((sc: any) => sc.status === 'active')
    const activeCompData = allComps.find((c: any) => c.code === active?.competency_code)
    setActiveComp(activeCompData || myComps[0] || null)

    if (activeCompData || myComps[0]) {
      const code = (activeCompData || myComps[0]).code
      await loadConceptData(user.id, code)
    }

    setLoading(false)
  }

  const loadConceptData = async (userId: string, compCode: string) => {
    const supabase = createClient()
    const [conceptsRes, progressRes, chatRes] = await Promise.all([
      supabase.from('concepts').select('*').eq('competency_code', compCode).order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', userId),
      supabase.from('chat_messages').select('role, content, created_at')
        .eq('student_id', userId).order('created_at', { ascending: false }).limit(60),
    ])
    const allConcepts = conceptsRes.data || []
    const allProgress = progressRes.data || []
    const completedIds = new Set(allProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    const current = allConcepts.find((c: any) => !completedIds.has(c.id)) || allConcepts[0] || null
    setConcepts(allConcepts)
    setConceptProgress(allProgress)
    setCurrentConcept(current)
    setChatHistory((chatRes.data || []).reverse())
  }

  const switchCompetency = async (comp: any) => {
    setSwitching(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('student_competencies').update({ status: 'paused' })
      .eq('student_id', user.id).eq('status', 'active')
    await supabase.from('student_competencies').update({ status: 'active' })
      .eq('student_id', user.id).eq('competency_code', comp.code)
    setActiveComp(comp)
    await loadConceptData(user.id, comp.code)
    setSwitching(false)
    setView('chat')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const completedIds = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
  const masteredCount = concepts.filter(c => completedIds.has(c.id)).length
  const totalConcepts = concepts.length || 20
  const pct = totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0
  const activeStatus = studentComps.find(sc => sc.competency_code === activeComp?.code)
  const currentStage = conceptProgress.find(p => p.concept_id === currentConcept?.id)?.stage || 1

  const unlockedCount = studentComps.filter(sc => sc.is_unlocked).length
  const completedComps = studentComps.filter(sc => sc.is_completed).length
  const totalConceptsMastered = conceptProgress.filter(p => p.is_completed).length
  const lockedCount = studentComps.filter(sc => !sc.is_unlocked).length

  // Weeks active
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date()
  const weeksActive = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const openingMessage = currentConcept
    ? `Hey ${firstName}! Ready to continue with **${activeComp?.name}**? We're on "${currentConcept.title}" — let's pick up where you left off.`
    : `Hey ${firstName}! Welcome to LaunchPilot. Let's get started on **${activeComp?.name}**.`

  const sessionContext = activeComp
    ? `LaunchPilot student ${firstName} working on pathway "${activeComp.name}" (${activeComp.code}). Current concept: "${currentConcept?.title || 'first concept'}". Stage ${currentStage} of 8.`
    : ''

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#05050A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#444', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#05050A', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#E8E6E0', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-item { transition: background 0.15s; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.04) !important; }
        .nav-item.active { background: rgba(255,106,0,0.1) !important; border-left: 3px solid #FF6A00 !important; color: #F0EDE6 !important; }
        .comp-card { transition: all 0.15s; cursor: pointer; }
        .comp-card:hover { border-color: rgba(255,106,0,0.3) !important; }
        .stat-card { transition: background 0.15s; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        @media(max-width:768px) {
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .comp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '56px', background: 'rgba(5,5,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6A00' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>LaunchPilot</div>
            <div style={{ fontSize: '8px', color: '#333', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' }}>School</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#FF6A00' }}>
            {firstName[0]?.toUpperCase()}
          </div>
          <button onClick={handleSignOut} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, paddingTop: '56px' }}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar" style={{ width: '220px', flexShrink: 0, position: 'fixed', top: '56px', bottom: 0, left: 0, background: '#05050A', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '20px 12px', flex: 1 }}>

            {/* Nav items */}
            {([
              { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
              { id: 'chat',      label: 'Chat with Maya', icon: '◉', dot: true },
              { id: 'competencies', label: 'My Pathways', icon: '◈' },
              { id: 'progress',  label: 'Progress', icon: '◎' },
            ] as const).map(item => (
              <div key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '2px', color: view === item.id ? '#F0EDE6' : '#555', fontSize: '13px', fontWeight: view === item.id ? '600' : '400', borderLeft: '3px solid transparent' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {'dot' in item && item.dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s infinite' }} />}
              </div>
            ))}

            {/* Currently studying */}
            {activeComp && (
              <div style={{ margin: '16px 0 8px', padding: '14px', background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '10px' }}>
                <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '5px' }}>Now Studying</div>
                <div style={{ fontSize: '9px', color: '#666', fontFamily: 'DM Mono, monospace', marginBottom: '3px' }}>{activeComp.code}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6', marginBottom: '10px', lineHeight: '1.3' }}>{activeComp.name}</div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                  {Array.from({ length: Math.min(totalConcepts, 20) }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < masteredCount ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
                <div style={{ fontSize: '9px', color: '#444', fontFamily: 'DM Mono, monospace' }}>{masteredCount}/{totalConcepts} concepts · {pct}%</div>
                <button onClick={() => setView('chat')}
                  style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '7px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Continue with Maya →
                </button>
              </div>
            )}

            {/* Locked count */}
            {lockedCount > 0 && (
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#333', textAlign: 'center' }}>{lockedCount} pathways locked</div>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main-content" style={{ marginLeft: '220px', flex: 1, overflowY: 'auto', height: 'calc(100vh - 56px)' }}>

          {/* ── DASHBOARD VIEW ── */}
          {view === 'dashboard' && (
            <div style={{ padding: '36px 40px', maxWidth: '1100px' }}>

              {/* Greeting */}
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  {greeting}, {firstName}
                </h1>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {activeComp ? `You're working on ${activeComp.name}. Keep it up.` : 'Welcome to LaunchPilot. Let\'s get started.'}
                </p>
              </div>

              {/* Stats */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '32px' }}>
                {[
                  { value: unlockedCount, label: 'Pathways unlocked', color: '#FF6A00' },
                  { value: completedComps, label: 'Completed', color: '#4ADE80' },
                  { value: totalConceptsMastered, label: 'Concepts mastered', color: '#A78BFA' },
                  { value: `${weeksActive}w`, label: 'Weeks active', color: '#60A5FA' },
                ].map((stat, i) => (
                  <div key={i} className="stat-card" style={{ padding: '20px 22px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: stat.color, letterSpacing: '-0.03em', marginBottom: '4px', fontFamily: 'DM Sans, sans-serif' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: '#444' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Resume where left off */}
              {activeComp && (
                <div style={{ padding: '24px 28px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Resume where you left off</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em', marginBottom: '4px' }}>{activeComp.code} · {activeComp.name}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '14px' }}>
                      {currentConcept ? `Working on "${currentConcept.title}"` : 'Starting concept 1 — ready to begin'}
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                      {Array.from({ length: totalConcepts }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < masteredCount ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#444', fontFamily: 'DM Mono, monospace' }}>{masteredCount}/{totalConcepts} concepts · {pct}%</div>
                  </div>
                  <button onClick={() => setView('chat')}
                    style={{ padding: '13px 28px', borderRadius: '10px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Continue with Maya →
                  </button>
                </div>
              )}

              {/* My Pathways */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>My Pathways</div>
                    <div style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>{unlockedCount} unlocked · {lockedCount} locked</div>
                  </div>
                  <button onClick={() => setView('competencies')} style={{ fontSize: '12px', color: '#FF6A00', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>View all →</button>
                </div>
                <div className="comp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {competencies.slice(0, 6).map((comp: any) => {
                    const sc = studentComps.find(s => s.competency_code === comp.code)
                    const isActive = sc?.status === 'active'
                    const isPaused = sc?.status === 'paused'
                    const isCompleted = sc?.is_completed
                    const statusLabel = isCompleted ? 'Completed' : isActive ? 'Active' : isPaused ? 'Paused' : 'Locked'
                    const statusColor = isCompleted ? '#4ADE80' : isActive ? '#FF6A00' : isPaused ? '#F59E0B' : '#333'
                    const statusBg = isCompleted ? 'rgba(74,222,128,0.1)' : isActive ? 'rgba(255,106,0,0.1)' : isPaused ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)'

                    // Concept progress for this comp
                    const compConcepts = concepts.filter(c => c.competency_code === comp.code)
                    const compMastered = compConcepts.filter(c => completedIds.has(c.id)).length
                    const compTotal = compConcepts.length || 20

                    return (
                      <div key={comp.code} className="comp-card"
                        style={{ padding: '18px 20px', background: isActive ? 'rgba(255,106,0,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '10px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', background: 'rgba(255,106,0,0.1)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>{comp.code}</span>
                          <span style={{ fontSize: '10px', color: statusColor, background: statusBg, padding: '3px 8px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontWeight: '600' }}>{statusLabel}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EDE6', marginBottom: '6px', lineHeight: '1.3' }}>{comp.name}</div>
                        <div style={{ fontSize: '11px', color: '#444', marginBottom: '10px' }}>{compMastered} of {compTotal} mastered</div>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                          {Array.from({ length: Math.min(compTotal, 20) }).map((_, i) => (
                            <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < compMastered ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                          ))}
                        </div>
                        {isActive ? (
                          <button onClick={() => setView('chat')} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Continue with Maya →
                          </button>
                        ) : (isPaused || !sc?.is_unlocked === false) ? (
                          <button onClick={() => switchCompetency(comp)} disabled={switching} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            {switching ? 'Switching...' : 'Switch to this →'}
                          </button>
                        ) : (
                          <div style={{ padding: '9px', textAlign: 'center', fontSize: '12px', color: '#333', fontFamily: 'DM Mono, monospace' }}>🔒 Locked</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── CHAT VIEW ── */}
          {view === 'chat' && (
            <div style={{ height: '100%' }}>
              <MayaChat
                profile={profile}
                openingMessage={openingMessage}
                sessionContext={sessionContext}
                chatHistory={chatHistory}
                currentConceptId={currentConcept?.id}
                currentStage={currentStage}
              />
            </div>
          )}

          {/* ── MY PATHWAYS VIEW ── */}
          {view === 'competencies' && (
            <div style={{ padding: '36px 40px', maxWidth: '1100px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>My Pathways</h1>
                <p style={{ fontSize: '13px', color: '#555' }}>{unlockedCount} pathways unlocked · {lockedCount} still locked</p>
              </div>
              <div className="comp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {competencies.map((comp: any) => {
                  const sc = studentComps.find(s => s.competency_code === comp.code)
                  const isActive = sc?.status === 'active'
                  const isPaused = sc?.status === 'paused'
                  const isCompleted = sc?.is_completed
                  const statusLabel = isCompleted ? 'Completed' : isActive ? 'Active' : isPaused ? 'Paused' : 'Locked'
                  const statusColor = isCompleted ? '#4ADE80' : isActive ? '#FF6A00' : isPaused ? '#F59E0B' : '#333'
                  const statusBg = isCompleted ? 'rgba(74,222,128,0.1)' : isActive ? 'rgba(255,106,0,0.1)' : isPaused ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)'
                  const compConcepts = concepts.filter(c => c.competency_code === comp.code)
                  const compMastered = compConcepts.filter(c => completedIds.has(c.id)).length
                  const compTotal = compConcepts.length || 20
                  return (
                    <div key={comp.code} className="comp-card"
                      style={{ padding: '18px 20px', background: isActive ? 'rgba(255,106,0,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', background: 'rgba(255,106,0,0.1)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>{comp.code}</span>
                        <span style={{ fontSize: '10px', color: statusColor, background: statusBg, padding: '3px 8px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontWeight: '600' }}>{statusLabel}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EDE6', marginBottom: '4px', lineHeight: '1.3' }}>{comp.name}</div>
                      {comp.description && <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px', lineHeight: '1.5' }}>{comp.description}</div>}
                      <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px' }}>{compMastered} of {compTotal} mastered</div>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                        {Array.from({ length: Math.min(compTotal, 20) }).map((_, i) => (
                          <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < compMastered ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                        ))}
                      </div>
                      {isActive ? (
                        <button onClick={() => setView('chat')} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Continue with Maya →</button>
                      ) : isPaused ? (
                        <button onClick={() => switchCompetency(comp)} disabled={switching} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{switching ? 'Switching...' : 'Switch to this →'}</button>
                      ) : (
                        <div style={{ padding: '9px', textAlign: 'center', fontSize: '12px', color: '#333', fontFamily: 'DM Mono, monospace' }}>{isCompleted ? '✓ Completed' : '🔒 Locked'}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── PROGRESS VIEW ── */}
          {view === 'progress' && (
            <div style={{ padding: '36px 40px', maxWidth: '900px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>Progress</h1>
                <p style={{ fontSize: '13px', color: '#555' }}>Your learning journey so far</p>
              </div>

              {/* Summary stats */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '28px' }}>
                {[
                  { value: unlockedCount, label: 'Pathways unlocked', color: '#FF6A00' },
                  { value: completedComps, label: 'Pathways completed', color: '#4ADE80' },
                  { value: totalConceptsMastered, label: 'Concepts mastered', color: '#A78BFA' },
                  { value: `${weeksActive}w`, label: 'Weeks active', color: '#60A5FA' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em', marginBottom: '3px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#444' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Per-pathway breakdown */}
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EDE6', marginBottom: '14px' }}>Pathway Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {competencies.map((comp: any) => {
                  const compConcepts = concepts.filter(c => c.competency_code === comp.code)
                  const compMastered = compConcepts.filter(c => completedIds.has(c.id)).length
                  const compTotal = compConcepts.length || 20
                  const compPct = compTotal > 0 ? Math.round((compMastered / compTotal) * 100) : 0
                  const sc = studentComps.find(s => s.competency_code === comp.code)
                  const isActive = sc?.status === 'active'
                  const isCompleted = sc?.is_completed
                  return (
                    <div key={comp.code} style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', background: 'rgba(255,106,0,0.1)', padding: '2px 7px', borderRadius: '4px' }}>{comp.code}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0' }}>{comp.name}</span>
                          {isActive && <span style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace' }}>● ACTIVE</span>}
                          {isCompleted && <span style={{ fontSize: '9px', color: '#4ADE80', fontFamily: 'DM Mono, monospace' }}>✓ DONE</span>}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: compPct > 0 ? '#FF6A00' : '#333', fontFamily: 'DM Mono, monospace' }}>{compPct}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: Math.min(compTotal, 20) }).map((_, i) => (
                          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < Math.floor(compMastered * 20 / compTotal) ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '10px', color: '#333', fontFamily: 'DM Mono, monospace', marginTop: '5px' }}>{compMastered}/{compTotal} concepts</div>
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
}
