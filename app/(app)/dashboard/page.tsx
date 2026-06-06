'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import MayaChat from '@/components/features/MayaChat'

type View = 'dashboard' | 'chat' | 'competencies'

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

    const unlockedCodes = scs.filter((sc: any) => sc.is_unlocked).map((sc: any) => sc.competency_code)
    const myComps = allComps.filter((c: any) => unlockedCodes.includes(c.code))
    setCompetencies(myComps)

    const active = scs.find((sc: any) => sc.status === 'active')
    const activeCompData = allComps.find((c: any) => c.code === active?.competency_code)
    setActiveComp(activeCompData || myComps[0] || null)

    if (activeCompData || myComps[0]) {
      const code = (activeCompData || myComps[0]).code
      await loadConceptData(user.id, myComps.map((c: any) => c.code))
    }

    setLoading(false)
  }

  const loadConceptData = async (userId: string, allCodes: string[]) => {
    const supabase = createClient()
    const [conceptsRes, progressRes, chatRes] = await Promise.all([
      supabase.from('concepts').select('*').in('competency_code', allCodes).order('competency_code').order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', userId),
      supabase.from('chat_messages').select('role, content, created_at').eq('student_id', userId).order('created_at', { ascending: false }).limit(60),
    ])
    const allConcepts = conceptsRes.data || []
    const allProgress = progressRes.data || []
    const completedIds = new Set(allProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    const activeConcepts = allConcepts.filter((c: any) => c.competency_code === (activeComp?.code || allCodes[0]))
    const current = activeConcepts.find((c: any) => !completedIds.has(c.id)) || activeConcepts[0] || null
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
    await supabase.from('student_competencies').update({ status: 'paused' }).eq('student_id', user.id).eq('status', 'active')
    await supabase.from('student_competencies').update({ status: 'active' }).eq('student_id', user.id).eq('competency_code', comp.code)
    setActiveComp(comp)
    await loadConceptData(user.id, competencies.map((c: any) => c.code))
    setSwitching(false)
    setView('chat')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const completedIds = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
  const activeConcepts = concepts.filter((c: any) => c.competency_code === activeComp?.code)
  const masteredCount = activeConcepts.filter((c: any) => completedIds.has(c.id)).length
  const totalConcepts = activeConcepts.length || 1
  const pct = Math.round((masteredCount / totalConcepts) * 100)
  const totalConceptsMastered = concepts.filter((c: any) => completedIds.has(c.id)).length
  const completedComps = studentComps.filter(sc => sc.is_completed).length
  const unlockedCount = studentComps.filter(sc => sc.is_unlocked).length
  const lockedCount = competencies.length - unlockedCount
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date()
  const daysActive = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000)))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const currentStage = conceptProgress.find(p => p.concept_id === currentConcept?.id)?.stage || 1
  const openingMessage = currentConcept
    ? `Hey ${firstName}! Ready to continue with **${activeComp?.name}**? We're on "${currentConcept.title}" — let's pick up where you left off.`
    : `Hey ${firstName}! Welcome to LaunchPilot. Let's get started on **${activeComp?.name}**.`
  const sessionContext = activeComp
    ? `LaunchPilot student ${firstName} working on pathway "${activeComp.name}" (${activeComp.code}). Current concept: "${currentConcept?.title || 'first concept'}". Stage ${currentStage} of 8.`
    : ''

  // Streak calculation
  const streakMsgs = [...chatHistory].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const daySet = new Set(streakMsgs.map((m: any) => new Date(m.created_at).toDateString()))
  let streak = 0
  const sd = new Date()
  while (daySet.has(sd.toDateString())) { streak++; sd.setDate(sd.getDate() - 1) }
  const lastActiveDate = streakMsgs.length > 0 ? new Date(streakMsgs[0].created_at) : null
  const diffDays = lastActiveDate ? Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)) : null

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
        .mono { font-family: 'DM Mono', monospace; }
        .nav-item { transition: background 0.15s; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.04) !important; }
        .nav-item.active { background: rgba(255,106,0,0.1) !important; border-left: 3px solid #FF6A00 !important; color: #F0EDE6 !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media(max-width:768px) { .sidebar{display:none!important} .main-content{margin-left:0!important} }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '56px', background: 'rgba(5,5,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6A00' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>LaunchPilot</div>
            <div className="mono" style={{ fontSize: '8px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.16em' }}>School</div>
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

        {/* SIDEBAR */}
        <aside className="sidebar" style={{ width: '220px', flexShrink: 0, position: 'fixed', top: '56px', bottom: 0, left: 0, background: '#05050A', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '20px 12px', flex: 1 }}>

            {/* Nav */}
            {([
              { id: 'dashboard',    label: 'Dashboard',       icon: '⊞' },
              { id: 'chat',         label: 'Chat with Maya',  icon: '◉', dot: true },
              { id: 'competencies', label: 'My Pathways',     icon: '◈' },
            ] as const).map(item => (
              <div key={item.id}
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id as View)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '2px', color: view === item.id ? '#F0EDE6' : '#555', fontSize: '13px', fontWeight: view === item.id ? '600' : '400', borderLeft: '3px solid transparent' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {'dot' in item && item.dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s infinite' }} />}
              </div>
            ))}

            {/* Now studying */}
            {activeComp && (
              <div style={{ margin: '16px 0 8px', padding: '14px', background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '10px' }}>
                <div className="mono" style={{ fontSize: '8px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '5px' }}>Now Studying</div>
                <div className="mono" style={{ fontSize: '9px', color: '#666', marginBottom: '3px' }}>{activeComp.code}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6', marginBottom: '10px', lineHeight: '1.3' }}>{activeComp.name}</div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                  {Array.from({ length: Math.min(totalConcepts, 20) }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i < masteredCount ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
                <div className="mono" style={{ fontSize: '9px', color: '#444' }}>{masteredCount}/{totalConcepts} concepts · {pct}%</div>
                <button onClick={() => setView('chat')} style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '7px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Continue with Maya →
                </button>
              </div>
            )}

            {/* Program name */}
            <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <div className="mono" style={{ fontSize: '7px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px' }}>Program</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#E8E6E0', lineHeight: '1.3', marginBottom: '4px' }}>LaunchPilot School</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF6A00' }} />
                <span className="mono" style={{ fontSize: '8px', color: '#555' }}>Founder Pathways</span>
              </div>
            </div>

            {/* Arc + Streak */}
            <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <div className="mono" style={{ fontSize: '7px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px' }}>Your Progress</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                {(() => {
                  const overallPct = totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0
                  const pathPct = competencies.length > 0 ? Math.round((completedComps / competencies.length) * 100) : 0
                  const r1 = 44, r2 = 34, cx = 56, cy = 56
                  const arcPath = (r: number, pct: number) => {
                    if (pct <= 0) return ''
                    if (pct >= 100) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
                    const angle = (pct / 100) * 360
                    const rad = (angle - 90) * Math.PI / 180
                    const x = cx + r * Math.cos(rad)
                    const y = cy + r * Math.sin(rad)
                    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x} ${y}`
                  }
                  return (
                    <svg width="112" height="112" viewBox="0 0 112 112">
                      <circle cx={cx} cy={cy} r={r1} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                      {overallPct > 0 && <path d={arcPath(r1, overallPct)} fill="none" stroke="#FF6A00" strokeWidth="6" strokeLinecap="round" />}
                      {pathPct > 0 && <path d={arcPath(r2, pathPct)} fill="none" stroke="#4ADE80" strokeWidth="5" strokeLinecap="round" />}
                      <text x={cx} y={cy - 6} textAnchor="middle" fill="#F0EDE6" fontSize="16" fontWeight="800" fontFamily="DM Sans, sans-serif">{overallPct}%</text>
                      <text x={cx} y={cy + 10} textAnchor="middle" fill="#555" fontSize="8" fontFamily="DM Mono, monospace">overall</text>
                    </svg>
                  )
                })()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                {[
                  { label: 'Concepts', val: `${masteredCount}/${totalConcepts}`, col: '#FF6A00' },
                  { label: 'Pathways', val: `${completedComps}/${competencies.length}`, col: '#4ADE80' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.col }} />
                      <span style={{ fontSize: '10px', color: '#888' }}>{s.label}</span>
                    </div>
                    <span className="mono" style={{ fontSize: '10px', color: s.col }}>{s.val}</span>
                  </div>
                ))}
              </div>
              {/* Streak */}
              <div style={{ padding: '10px 12px', background: streak > 0 ? 'rgba(255,106,0,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${streak > 0 ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : streak >= 1 ? '✨' : '💤'}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: streak > 0 ? '#F0EDE6' : '#555' }}>
                      {streak > 0 ? `${streak} day streak` : 'No streak yet'}
                    </div>
                    <div className="mono" style={{ fontSize: '8px', color: '#444', marginTop: '1px' }}>
                      {diffDays === 0 ? 'Active today ✓' : diffDays === 1 ? 'Last active yesterday' : lastActiveDate ? `Last active ${diffDays}d ago` : 'Start your first session'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content" style={{ marginLeft: '220px', flex: 1, overflowY: 'auto', height: 'calc(100vh - 56px)' }}>

          {/* DASHBOARD */}
          {view === 'dashboard' && (
            <div style={{ padding: '36px 40px', maxWidth: '1100px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '6px' }}>{greeting}, {firstName}</h1>
                <p style={{ fontSize: '14px', color: '#555' }}>{activeComp ? `You're working on ${activeComp.name}. Keep it up.` : "Welcome to LaunchPilot. Let's get started."}</p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { value: `${completedComps}/${competencies.length}`, label: 'Pathways done',      color: '#FF6A00' },
                  { value: totalConceptsMastered,                      label: 'Tasks completed',    color: '#4ADE80' },
                  { value: `${totalConceptsMastered}/${concepts.length || 0}`, label: 'Concepts mastered', color: '#A78BFA' },
                  { value: `${daysActive}d`,                          label: 'Days active',         color: '#60A5FA' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '20px 22px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: stat.color, letterSpacing: '-0.03em', marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: '#444' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Data visual */}
              <div style={{ marginBottom: '24px', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '14px' }}>Program Overview</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: '#888' }}>Concepts mastered</span>
                        <span className="mono" style={{ fontSize: '11px', fontWeight: '700', color: '#FF6A00' }}>{masteredCount}/{totalConcepts}</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(to right, #FF6A00, #FF8C00)', borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: '#888' }}>Pathways done</span>
                        <span className="mono" style={{ fontSize: '11px', fontWeight: '700', color: '#4ADE80' }}>{completedComps}/{competencies.length}</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${competencies.length > 0 ? (completedComps / competencies.length) * 100 : 0}%`, height: '100%', background: 'linear-gradient(to right, #4ADE80, #1D9E75)', borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const }}>
                      {competencies.map((comp: any) => {
                        const sc = studentComps.find((s: any) => s.competency_code === comp.code)
                        const isActive = sc?.status === 'active'
                        const isDone = sc?.is_completed
                        const isLocked = !sc?.is_unlocked
                        return (
                          <div key={comp.code} style={{ padding: '3px 8px', borderRadius: '100px', background: isDone ? 'rgba(74,222,128,0.1)' : isActive ? 'rgba(255,106,0,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isDone ? 'rgba(74,222,128,0.25)' : isActive ? 'rgba(255,106,0,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                            <span className="mono" style={{ fontSize: '8px', color: isDone ? '#4ADE80' : isActive ? '#FF6A00' : '#444' }}>{isDone ? '✓ ' : isLocked ? '🔒 ' : '→ '}{comp.code}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '52px', fontWeight: '900', color: '#FF6A00', letterSpacing: '-0.04em', lineHeight: '1' }}>{pct}%</div>
                    <div className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>of active pathway</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>{activeComp?.name || 'No active pathway'}</div>
                  </div>
                </div>
              </div>

              {/* Resume card */}
              {activeComp && (
                <div style={{ padding: '22px 26px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '6px' }}>Resume where you left off</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em', marginBottom: '4px' }}>{activeComp.code} · {activeComp.name}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>{currentConcept ? `Working on "${currentConcept.title}"` : 'Starting concept 1 — ready to begin'}</div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '5px' }}>
                      {Array.from({ length: Math.min(totalConcepts, 20) }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < masteredCount ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                    <div className="mono" style={{ fontSize: '10px', color: '#444' }}>{masteredCount}/{totalConcepts} concepts · {pct}%</div>
                  </div>
                  <button onClick={() => setView('chat')} style={{ padding: '13px 28px', borderRadius: '10px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Continue with Maya →
                  </button>
                </div>
              )}

              {/* Roadmap */}
              {activeComp && activeConcepts.length > 0 && (
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '4px' }}>Pathway roadmap</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#F0EDE6', marginBottom: '20px' }}>{activeComp.name} — your learning path</div>
                  {(() => {
                    const total = activeConcepts.length
                    const phaseSize = Math.ceil(total / 4)
                    const phases = [
                      { label: 'Foundation', color: '#60A5FA', icon: '◎' },
                      { label: 'Build',      color: '#FF8C00', icon: '◈' },
                      { label: 'Launch',     color: '#FF6A00', icon: '◉' },
                      { label: 'Scale',      color: '#4ADE80', icon: '★' },
                    ]
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {phases.map((phase, pi) => {
                          const start = pi * phaseSize
                          const end = Math.min(start + phaseSize, total)
                          const phaseCons = activeConcepts.slice(start, end)
                          const doneCnt = phaseCons.filter((c: any) => completedIds.has(c.id)).length
                          const allDone = doneCnt === phaseCons.length && phaseCons.length > 0
                          const hasActive = phaseCons.some((c: any) => c.id === currentConcept?.id)
                          return (
                            <div key={phase.label} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: allDone ? '#4ADE80' : hasActive ? phase.color : 'rgba(255,255,255,0.06)', border: `2px solid ${allDone ? '#4ADE80' : hasActive ? phase.color : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontSize: '10px', color: allDone ? '#000' : hasActive ? '#fff' : '#444' }}>{allDone ? '✓' : phase.icon}</span>
                                </div>
                                {pi < 3 && <div style={{ width: '2px', flex: 1, background: allDone ? '#4ADE80' : 'rgba(255,255,255,0.06)', minHeight: '24px', margin: '3px 0' }} />}
                              </div>
                              <div style={{ flex: 1, paddingLeft: '12px', paddingBottom: pi < 3 ? '16px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: allDone ? '#4ADE80' : hasActive ? '#F0EDE6' : '#555' }}>{phase.label}</span>
                                    {hasActive && <span className="mono" style={{ fontSize: '8px', color: phase.color, background: `${phase.color}15`, padding: '1px 6px', borderRadius: '100px' }}>● now</span>}
                                    {allDone && <span className="mono" style={{ fontSize: '8px', color: '#4ADE80' }}>done</span>}
                                  </div>
                                  <span className="mono" style={{ fontSize: '9px', color: '#444' }}>{doneCnt}/{phaseCons.length}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' as const }}>
                                  {phaseCons.map((c: any) => {
                                    const done = completedIds.has(c.id)
                                    const isCurr = c.id === currentConcept?.id
                                    return (
                                      <div key={c.id} style={{ fontSize: '9px', color: done ? '#4ADE80' : isCurr ? phase.color : '#555', background: done ? 'rgba(74,222,128,0.08)' : isCurr ? `${phase.color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(74,222,128,0.2)' : isCurr ? `${phase.color}30` : 'rgba(255,255,255,0.05)'}`, padding: '2px 8px', borderRadius: '100px', fontFamily: 'DM Mono, monospace', textDecoration: done ? 'line-through' : 'none' }}>
                                        {done ? '✓' : isCurr ? '→' : String(c.sequence).padStart(2,'0')} {c.title.length > 22 ? c.title.slice(0,22)+'…' : c.title}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {/* CHAT */}
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

          {/* MY PATHWAYS */}
          {view === 'competencies' && (
            <div style={{ padding: '36px 40px', maxWidth: '900px' }}>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>My Pathways</h1>
                <p style={{ fontSize: '13px', color: '#555' }}>{unlockedCount} unlocked · {lockedCount} locked</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {competencies.map((comp: any, ci: number) => {
                  const sc = studentComps.find((s: any) => s.competency_code === comp.code)
                  const isActive = sc?.status === 'active'
                  const isPaused = sc?.status === 'paused'
                  const isCompleted = sc?.is_completed
                  const isLocked = !sc?.is_unlocked
                  const compConcepts = concepts.filter((c: any) => c.competency_code === comp.code)
                  const compMastered = compConcepts.filter((c: any) => completedIds.has(c.id)).length
                  const compTotal = compConcepts.length || 20
                  const compPct = compTotal > 0 ? Math.round((compMastered / compTotal) * 100) : 0
                  const colors = ['#FF6A00','#FF8C00','#4ADE80','#60A5FA','#A78BFA','#F59E0B','#2DD4BF','#FB7185']
                  const col = isCompleted ? '#4ADE80' : isActive ? '#FF6A00' : colors[ci % colors.length]
                  return (
                    <div key={comp.code} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', overflow: 'hidden', borderLeft: `4px solid ${isActive ? '#FF6A00' : isCompleted ? '#4ADE80' : 'rgba(255,255,255,0.08)'}` }}>
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${col}15`, border: `2px solid ${col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="mono" style={{ fontSize: '9px', fontWeight: '800', color: col }}>{comp.code}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#F0EDE6', marginBottom: '2px' }}>{comp.name}</div>
                            <div className="mono" style={{ fontSize: '11px', color: '#444' }}>{compMastered}/{compTotal} concepts mastered</div>
                          </div>
                          {isActive    && <span className="mono" style={{ fontSize: '8px', color: '#FF6A00', background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', padding: '2px 8px', borderRadius: '100px' }}>● Active</span>}
                          {isCompleted && <span className="mono" style={{ fontSize: '8px', color: '#4ADE80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '2px 8px', borderRadius: '100px' }}>✓ Done</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: compPct > 0 ? col : '#333', letterSpacing: '-0.03em' }}>{compPct}%</div>
                          {isActive  && <button onClick={() => setView('chat')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#FF6A00', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Continue →</button>}
                          {isPaused  && <button onClick={() => switchCompetency(comp)} disabled={switching} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{switching ? '...' : 'Switch →'}</button>}
                          {isLocked  && <span className="mono" style={{ fontSize: '11px', color: '#333' }}>🔒 Locked</span>}
                        </div>
                      </div>
                      <div style={{ padding: '0 20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {compConcepts.length > 0
                            ? compConcepts.map((c: any) => {
                                const done = completedIds.has(c.id)
                                const isCurr = c.id === currentConcept?.id && isActive
                                return <div key={c.id} style={{ flex: 1, height: '5px', borderRadius: '3px', background: done ? col : isCurr ? `${col}45` : 'rgba(255,255,255,0.06)' }} title={c.title} />
                              })
                            : Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }} />)
                          }
                        </div>
                      </div>
                      {compConcepts.length > 0 && (
                        <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                          {compConcepts.map((c: any) => {
                            const done = completedIds.has(c.id)
                            const isCurr = c.id === currentConcept?.id && isActive
                            return (
                              <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '6px 9px', background: isCurr ? 'rgba(255,106,0,0.06)' : done ? 'rgba(74,222,128,0.02)' : 'rgba(255,255,255,0.01)', borderRadius: '7px', border: isCurr ? '1px solid rgba(255,106,0,0.18)' : done ? '1px solid rgba(74,222,128,0.08)' : '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: done ? 'rgba(74,222,128,0.15)' : isCurr ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.04)', border: done ? '1px solid rgba(74,222,128,0.35)' : isCurr ? '1px solid rgba(255,106,0,0.35)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                  <span style={{ fontSize: '7px', fontWeight: '800', color: done ? '#4ADE80' : isCurr ? '#FF6A00' : '#444' }}>{done ? '✓' : isCurr ? '→' : String(c.sequence).padStart(2,'0')}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: '11px', color: done ? '#555' : isCurr ? '#F0EDE6' : '#888', lineHeight: '1.4', textDecoration: done ? 'line-through' : 'none', display: 'block' }}>{c.title}</span>
                                  {done   && <span className="mono" style={{ fontSize: '8px', color: '#4ADE80' }}>Completed</span>}
                                  {isCurr && <span className="mono" style={{ fontSize: '8px', color: '#FF6A00' }}>In progress</span>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
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
