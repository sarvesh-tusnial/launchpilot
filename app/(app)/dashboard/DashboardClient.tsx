'use client'
import { useState } from 'react'
import Link from 'next/link'
import MayaChat from '@/components/features/MayaChat'

type Props = {
  profile: any
  firstName: string
  competencies: any[]
  completed: any[]
  active: any
  locked: any[]
  activeConcepts: any[]
  conceptProgress: any[]
  masteredConcepts: number
  openingMessage: string
  sessionContext: string
  chatHistory: any[]
  currentConceptId?: string
}

export default function DashboardClient({
  profile, firstName,
  competencies, completed, active, locked,
  activeConcepts, conceptProgress, masteredConcepts,
  openingMessage, sessionContext, chatHistory, currentConceptId,
}: Props) {
  const [switching, setSwitching] = useState(false)
  const [showAllComps, setShowAllComps] = useState(false)

  const switchCompetency = async (code: string) => {
    if (switching) return
    setSwitching(true)
    try {
      const res = await fetch('/api/switch-competency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competency_code: code }),
      })
      const data = await res.json()
      if (data.error) { setSwitching(false); return }
      window.location.reload()
    } catch {
      setSwitching(false)
    }
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/db/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const activeCode = (active?.competency as any)?.code
  const activeName = (active?.competency as any)?.name
  const totalConcepts = activeConcepts.length || 20
  const unlockedComps = competencies.filter(c => c.status !== 'locked')
  const visibleComps = showAllComps ? competencies : unlockedComps.slice(0, 3)

  return (
    <div style={{ background: '#020B14', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#E8E6E0', display: 'flex', flexDirection: 'column' }}>

      {/* TOP NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '60px', background: 'rgba(2,11,20,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#F0EDE6' }}>
            Deca<span style={{ color: '#0082C3' }}>thlon</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0082C3' }} />
            <span style={{ fontSize: '12px', color: '#555', fontFamily: 'DM Mono, monospace' }}>Learning Platform</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/progress" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#888', textDecoration: 'none', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
            <span>📊</span> Progress
          </Link>
          <button onClick={handleSignOut} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#444', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
            Sign out
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,130,195,0.2)', border: '1px solid rgba(0,130,195,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#0099E6' }}>
            {firstName[0]}
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '60px' }}>

        {/* LEFT SIDEBAR */}
        <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 16px', position: 'fixed', top: '60px', bottom: 0, left: 0, overflowY: 'auto', background: '#020B14' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            {[
              { n: completed.length, l: 'Done' },
              { n: unlockedComps.filter(c => c.status === 'active' || c.status === 'paused').length, l: 'Active' },
              { n: locked.length, l: 'Locked' },
            ].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0082C3' }}>{s.n}</div>
                <div style={{ fontSize: '9px', color: '#555', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* My Competencies */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>My Competencies</div>
              <div style={{ fontSize: '10px', color: '#333', fontFamily: 'DM Mono, monospace' }}>{unlockedComps.length} active</div>
            </div>
            {visibleComps.map((sc: any) => {
              const code = (sc.competency as any)?.code
              const name = (sc.competency as any)?.name
              const isActive = sc.status === 'active'
              const isDone   = sc.status === 'completed'
              return (
                <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', marginBottom: '3px', background: isActive ? 'rgba(0,130,195,0.08)' : 'transparent', border: isActive ? '1px solid rgba(0,130,195,0.15)' : '1px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: isDone ? '#00C851' : isActive ? '#0082C3' : 'rgba(255,255,255,0.15)' }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: isActive ? '#0082C3' : '#444', marginBottom: '1px' }}>{code}</div>
                      <div style={{ fontSize: '12px', color: isActive ? '#E8E6E0' : '#888', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    </div>
                  </div>
                  {!isActive && !isDone && (
                    <button onClick={() => switchCompetency(code)} disabled={switching} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#555', cursor: 'pointer', fontFamily: 'DM Mono, monospace', flexShrink: 0, marginLeft: '6px' }}>
                      switch →
                    </button>
                  )}
                </div>
              )
            })}
            {unlockedComps.length > 0 && (
              <button onClick={() => setShowAllComps(!showAllComps)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#444', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
                {showAllComps ? 'Show less ↑' : `Browse all 15 competencies →`}
              </button>
            )}
            {locked.length > 0 && (
              <div style={{ padding: '6px 10px', marginTop: '6px', fontSize: '11px', color: '#333', fontFamily: 'DM Mono, monospace' }}>
                🔒 {locked.length} more unlock as you progress
              </div>
            )}
          </div>

          {/* Now Studying card */}
          {active && (
            <div style={{ marginTop: '16px', background: 'rgba(0,130,195,0.06)', border: '1px solid rgba(0,130,195,0.15)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#0082C3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Now Studying</div>
              <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#0082C3', marginBottom: '3px' }}>{activeCode}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0', marginBottom: '10px', lineHeight: '1.3' }}>{activeName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#0082C3' }}>{masteredConcepts}</div>
                  <div style={{ fontSize: '9px', color: '#444', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>done</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#555' }}>{totalConcepts - masteredConcepts}</div>
                  <div style={{ fontSize: '9px', color: '#444', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>left</div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CHAT */}
        <main style={{ marginLeft: '240px', flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 60px)' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <MayaChat
              profile={profile}
              openingMessage={openingMessage}
              sessionContext={sessionContext}
              chatHistory={chatHistory}
              currentConceptId={currentConceptId}
            />
          </div>

          {/* RIGHT — concept progress */}
          {active && activeConcepts.length > 0 && (
            <div style={{ width: '220px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '20px 14px', overflowY: 'auto', background: '#020B14' }}>
              <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>CONCEPT PROGRESS</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0', marginBottom: '4px', lineHeight: '1.3' }}>{activeName}</div>
              <div style={{ fontSize: '11px', color: '#0082C3', marginBottom: '16px' }}>{masteredConcepts}/{totalConcepts} mastered</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {activeConcepts.map((c: any, i: number) => {
                  const cp = conceptProgress.find((p: any) => p.concept_id === c.id)
                  const isDone    = cp?.is_completed
                  const isCurrent = c.id === currentConceptId
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: isCurrent ? 'rgba(0,130,195,0.08)' : 'transparent', border: isCurrent ? '1px solid rgba(0,130,195,0.15)' : '1px solid transparent' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', fontFamily: 'DM Mono, monospace', background: isDone ? 'rgba(0,200,81,0.15)' : isCurrent ? 'rgba(0,130,195,0.15)' : 'rgba(255,255,255,0.04)', color: isDone ? '#00C851' : isCurrent ? '#0082C3' : '#333', border: `1px solid ${isDone ? 'rgba(0,200,81,0.3)' : isCurrent ? 'rgba(0,130,195,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                        {isDone ? '✓' : String(i + 1).padStart(2, '0')}
                      </div>
                      <span style={{ fontSize: '11px', color: isDone ? '#444' : isCurrent ? '#E8E6E0' : '#666', lineHeight: '1.4', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {c.title}
                      </span>
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
