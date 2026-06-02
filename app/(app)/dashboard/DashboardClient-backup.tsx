'use client'
import { useState } from 'react'
import MayaChat from '@/components/features/MayaChat'
import Link from 'next/link'

type Props = {
  profile: any
  school: { col: string; bright: string; label: string }
  programType: { col: string; label: string }
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
  profile, school, programType, firstName,
  competencies, completed, active, locked,
  activeConcepts, conceptProgress, masteredConcepts,
  openingMessage, sessionContext, chatHistory, currentConceptId,
}: Props) {
  const [compDropdownOpen, setCompDropdownOpen] = useState(false)
  const [showAllComps, setShowAllComps]         = useState(false)
  const [switching, setSwitching]               = useState(false)

  const switchCompetency = async (code: string) => {
    console.log('Switching to:', code)  // ← add this
    if (switching) return
    setSwitching(true)
    try {
      const res  = await fetch('/api/switch-competency', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ competency_code: code }),
      })
      const data = await res.json()
      if (data.error) { console.error('Switch failed:', data.error); setSwitching(false); return }
      setTimeout(() => window.location.reload(), 500)
    } catch (e) {
      console.error('Switch error:', e)
      setSwitching(false)
    }
  }

  const totalConcepts = activeConcepts.length || 24

  // Which concepts to show in right sidebar
  const currentConceptObj = activeConcepts.find((c: any) => {
    const cp = conceptProgress.find((p: any) => p.concept_id === c.id)
    return cp?.is_unlocked && !cp?.is_mastered
  })

  // Competencies to show in dropdown (first 3, then "browse more")
  const visibleComps  = showAllComps ? competencies : competencies.slice(0, 3)

  return (
    <div style={{ background:'#05050A', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#E8E6E0', display:'flex', flexDirection:'column' }}>

      {/* ── TOP NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, height:'60px', background:'rgba(5,5,10,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#F0EDE6' }}>
            Mento<span style={{ color:'#FF6A00' }}>gram</span>
          </div>
          <div style={{ width:'1px', height:'16px', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:school.col }} />
            <span style={{ fontSize:'12px', color:'#555', fontFamily:'DM Mono,monospace' }}>{school.label}</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Link href="/progress" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', borderRadius:'7px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#888', textDecoration:'none', fontSize:'12px', fontFamily:'DM Mono,monospace', transition:'all 0.2s' }}>
            <span>📊</span> Progress
          </Link>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#333' }}>{profile.student_id}</span>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`${school.col}20`, border:`1px solid ${school.col}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:school.bright, fontFamily:'Playfair Display,serif' }}>
            {firstName[0]}
          </div>
        </div>
      </nav>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div style={{ display:'flex', flex:1, paddingTop:'60px', minHeight:'100vh' }}>

        {/* ════════════════════════════════
            LEFT SIDEBAR — Program + Competency dropdown
        ════════════════════════════════ */}
        <div style={{ width:'260px', flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.05)', height:'calc(100vh - 60px)', position:'sticky', top:'60px', overflowY:'auto', display:'flex', flexDirection:'column' }}>

          {/* Program header */}
          <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', fontWeight:'700', padding:'2px 7px', borderRadius:'4px', background:`${programType.col}15`, color:programType.col, border:`1px solid ${programType.col}25` }}>{programType.label}</span>
            </div>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', lineHeight:'1.3', marginBottom:'14px' }}>{profile.program_name}</div>

            {/* Progress bar */}
            <div style={{ marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <span style={{ fontSize:'10px', color:'#555' }}>Overall progress</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:school.bright }}>{completed.length}/{competencies.length}</span>
              </div>
              <div style={{ height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'2px' }}>
                <div style={{ width:`${competencies.length > 0 ? (completed.length/competencies.length)*100 : 0}%`, height:'100%', background:school.col, borderRadius:'2px', transition:'width 0.6s ease' }} />
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
              {[
                { n: completed.length, l: 'Done',   c: '#4ADE80' },
                { n: active ? 1 : 0,   l: 'Active', c: school.bright },
                { n: locked.length,    l: 'Locked', c: '#444' },
              ].map(s => (
                <div key={s.l} style={{ textAlign:'center', padding:'8px 4px', background:'rgba(255,255,255,0.02)', borderRadius:'6px' }}>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:'15px', fontWeight:'700', color:s.c }}>{s.n}</div>
                  <div style={{ fontSize:'9px', color:'#444', marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Competency dropdown ── */}
          <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>

            {/* Dropdown trigger */}
            <button
              onClick={() => setCompDropdownOpen(o => !o)}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background: compDropdownOpen ? `${school.col}10` : 'rgba(255,255,255,0.02)', border:`1px solid ${compDropdownOpen ? school.col+'40' : 'rgba(255,255,255,0.08)'}`, borderRadius:'8px', cursor:'pointer', transition:'all 0.2s' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'5px', background:`${school.col}20`, border:`1px solid ${school.col}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'10px' }}>📚</span>
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:'12px', fontWeight:'600', color:'#F0EDE6' }}>My Competencies</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#555' }}>{competencies.length} enrolled</div>
                </div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: compDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s', flexShrink:0 }}>
                <path d="M2 4L6 8L10 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dropdown list */}
            {compDropdownOpen && (
              <div style={{ marginTop:'6px', display:'flex', flexDirection:'column', gap:'4px' }}>
                {visibleComps.map((comp: any) => {
                  const isActive = comp.status === 'active'
                  const isDone   = comp.status === 'completed'
                  const isLocked = comp.status === 'locked'
                  const isPaused = comp.status === 'paused'
                  const canSwitch = isPaused && !switching
                  return (
                    <div key={comp.code}
                      onClick={() => { if (isPaused && !switching) switchCompetency(comp.code) }}
                      style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 10px', borderRadius:'7px', background: isActive ? `${school.col}08` : isPaused ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)', border:`1px solid ${isActive ? school.col+'30' : isDone ? 'rgba(74,222,128,0.1)' : isPaused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`, opacity: isLocked ? 0.35 : 1, cursor: canSwitch ? 'pointer' : 'default', transition:'all 0.15s' }}>
                      {/* Status dot */}
                      <div style={{ width:'16px', height:'16px', borderRadius:'50%', background: isDone ? '#4ADE80' : isActive ? school.col : isPaused ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {isDone   && <span style={{ color:'#000', fontSize:'8px', fontWeight:'900' }}>✓</span>}
                        {isActive && <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#fff' }} />}
                        {isLocked && <span style={{ fontSize:'8px' }}>🔒</span>}
                        {isPaused && <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'rgba(255,255,255,0.4)' }} />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color: isDone ? '#4ADE80' : isActive ? school.bright : isPaused ? '#888' : '#444', fontWeight:'700', marginBottom:'1px' }}>{comp.code}</div>
                        <div style={{ fontSize:'10px', color: isActive ? '#E8E6E0' : isDone ? '#777' : isPaused ? '#AAA' : '#444', lineHeight:'1.3', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{comp.name}</div>
                      </div>
                      {isPaused && (
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:'#555', flexShrink:0 }}>
                          {switching ? '...' : 'switch →'}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Browse more / show less */}
                {competencies.length > 3 && (
                  <button
                    onClick={() => setShowAllComps(s => !s)}
                    style={{ width:'100%', padding:'8px', borderRadius:'6px', background:'transparent', border:'1px dashed rgba(255,255,255,0.08)', color:'#555', fontSize:'11px', cursor:'pointer', fontFamily:'DM Sans,sans-serif', marginTop:'2px' }}
                  >
                    {showAllComps ? '↑ Show less' : `Browse all ${competencies.length} competencies →`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active competency quick info */}
          {active && (
            <div style={{ padding:'12px 16px', flex:1 }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:'#444', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Now studying</div>
              <div style={{ padding:'12px', background:`${school.col}08`, border:`1px solid ${school.col}25`, borderRadius:'8px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:school.bright, marginBottom:'4px' }}>{active.code}</div>
                <div style={{ fontSize:'12px', fontWeight:'600', color:'#F0EDE6', lineHeight:'1.35', marginBottom:'10px' }}>{active.name}</div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {[
                    { n: masteredConcepts, l: 'done', c: '#4ADE80' },
                    { n: totalConcepts - masteredConcepts, l: 'left', c: school.bright },
                  ].map(s => (
                    <div key={s.l} style={{ flex:1, textAlign:'center', padding:'5px 3px', background:'rgba(0,0,0,0.2)', borderRadius:'5px' }}>
                      <div style={{ fontFamily:'DM Mono,monospace', fontSize:'14px', fontWeight:'700', color:s.c }}>{s.n}</div>
                      <div style={{ fontSize:'8px', color:'#444' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════
            CENTRE — Maya Chat
        ════════════════════════════════ */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, borderRight:'1px solid rgba(255,255,255,0.05)' }}>

          {/* Maya header */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'10px', background:'rgba(5,5,10,0.8)', flexShrink:0 }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:`${school.col}18`, border:`1px solid ${school.col}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:school.bright, fontFamily:'Playfair Display,serif' }}>M</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#F0EDE6' }}>Maya</div>
              <div style={{ fontSize:'10px', color:'#4ADE80', display:'flex', alignItems:'center', gap:'4px' }}>
                <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }} />
                Online · AI Mentor
              </div>
            </div>
            {active && (
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#444', textAlign:'right' }}>
                <div style={{ color:school.bright }}>{active.code}</div>
                <div>Concept {currentConceptObj?.sequence || 1}/{totalConcepts}</div>
              </div>
            )}
          </div>

          {/* Chat fills remaining height */}
          <div style={{ flex:1, overflow:'hidden' }}>
            <MayaChat
              profile={profile}
              openingMessage={openingMessage}
              sessionContext={sessionContext}
              chatHistory={chatHistory}
              currentConceptId={currentConceptId}
            />
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT SIDEBAR — Concept progress tracker
        ════════════════════════════════ */}
        <div style={{ width:'240px', flexShrink:0, height:'calc(100vh - 60px)', position:'sticky', top:'60px', overflowY:'auto', padding:'16px 0' }}>

          {active && activeConcepts.length > 0 ? (
            <>
              {/* Header */}
              <div style={{ padding:'0 14px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:'12px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:'#444', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Concept Progress</div>
                <div style={{ fontSize:'11px', color:'#666', lineHeight:'1.4', marginBottom:'10px' }}>{active.name}</div>
                {/* Mini progress bar */}
                <div style={{ height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', marginBottom:'5px' }}>
                  <div style={{ width:`${(masteredConcepts/totalConcepts)*100}%`, height:'100%', background:school.col, borderRadius:'2px', transition:'width 0.5s' }} />
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:school.bright }}>{masteredConcepts}/{totalConcepts} mastered</div>
              </div>

              {/* Concept list */}
              <div style={{ padding:'0 10px', display:'flex', flexDirection:'column', gap:'4px' }}>
                {activeConcepts.map((concept: any, i: number) => {
                  const cp      = conceptProgress.find((p: any) => p.concept_id === concept.id)
                  const isDone  = cp?.is_mastered
                  const isNow   = cp?.is_unlocked && !cp?.is_mastered
                  const isNext  = !cp?.is_unlocked && !cp?.is_mastered && i === masteredConcepts
                  const isLocked= !cp?.is_unlocked && !cp?.is_mastered && i > masteredConcepts

                  return (
                    <div
                      key={concept.id}
                      style={{
                        display:'flex', alignItems:'flex-start', gap:'8px',
                        padding:'8px 10px', borderRadius:'8px',
                        background: isNow ? `${school.col}10` : isDone ? 'rgba(74,222,128,0.04)' : 'transparent',
                        border:`1px solid ${isNow ? school.col+'35' : isDone ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)'}`,
                        opacity: isLocked ? 0.3 : 1,
                        transition:'all 0.2s',
                      }}
                    >
                      {/* Left — sequence + status indicator */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', flexShrink:0, paddingTop:'1px' }}>
                        <div style={{
                          width:'16px', height:'16px', borderRadius:'50%', flexShrink:0,
                          background: isDone ? '#4ADE80' : isNow ? school.col : 'rgba(255,255,255,0.05)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                          {isDone  && <span style={{ color:'#000', fontSize:'8px', fontWeight:'900' }}>✓</span>}
                          {isNow   && <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#fff', animation:'pulse 2s infinite' }} />}
                          {isNext  && <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'rgba(255,255,255,0.3)' }} />}
                          {isLocked && <span style={{ fontSize:'7px', color:'#333' }}>🔒</span>}
                        </div>
                        {/* Connector line */}
                        {i < activeConcepts.length - 1 && (
                          <div style={{ width:'1px', height:'8px', background: isDone ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)' }} />
                        )}
                      </div>

                      {/* Right — number + title */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color: isDone ? '#4ADE80' : isNow ? school.bright : '#333', fontWeight:'700', marginBottom:'2px' }}>
                          {String(i+1).padStart(2,'0')}
                          {isNow && <span style={{ marginLeft:'5px', color:school.bright }}>← now</span>}
                        </div>
                        <div style={{
                          fontSize:'10px', lineHeight:'1.4',
                          color: isDone ? '#555' : isNow ? '#E8E6E0' : isNext ? '#666' : '#444',
                          fontWeight: isNow ? '500' : '400',
                          overflow:'hidden',
                          display:'-webkit-box',
                          WebkitLineClamp:2,
                          WebkitBoxOrient:'vertical' as any,
                        }}>
                          {concept.title}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom note */}
              <div style={{ padding:'14px', margin:'12px 10px 0', background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:'8px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:'#333', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'5px' }}>To advance</div>
                <div style={{ fontSize:'10px', color:'#444', lineHeight:'1.5' }}>Score ≥72 on every concept task to unlock the next one</div>
              </div>
            </>
          ) : (
            <div style={{ padding:'20px 14px', color:'#444', fontSize:'12px', textAlign:'center' }}>
              No active competency
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
