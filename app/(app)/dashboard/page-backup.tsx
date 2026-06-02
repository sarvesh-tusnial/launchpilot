import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import MayaChat from '@/components/features/MayaChat'
import Link from 'next/link'

// ── School colour map ────────────────────────────────────────────
const SCHOOL_CONFIG: Record<string, { col: string; bright: string; label: string }> = {
  business:      { col: '#FF6A00', bright: '#FF8C00', label: 'School of Business' },
  finance:       { col: '#1D4ED8', bright: '#60A5FA', label: 'School of Finance' },
  ai:            { col: '#7C3AED', bright: '#A78BFA', label: 'School of AI & Technology' },
  manufacturing: { col: '#0D9488', bright: '#2DD4BF', label: 'School of Manufacturing' },
}

const TYPE_CONFIG: Record<string, { col: string; label: string }> = {
  MBA:  { col: '#FF6A00', label: 'MBA' },
  PGP:  { col: '#1D4ED8', label: 'PGP' },
  CERT: { col: '#16A34A', label: 'Certificate' },
  BYO:  { col: '#7C3AED', label: 'Build Your Own' },
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // ── Fetch all data in parallel ──────────────────────────────────
  const [profileRes, competenciesRes, chatHistoryRes, submissionsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_competencies')
      .select('*')
      .eq('student_id', user.id)
      .order('sequence'),
    supabase.from('chat_messages')
      .select('role, content, created_at')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('submissions')
      .select('score, verdict, created_at')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const profile = profileRes.data
  const competencies = competenciesRes.data || []
  const chatHistory = (chatHistoryRes.data || []).reverse()
  const lastSubmission = submissionsRes.data?.[0] || null

  // ── If not approved yet, show pending screen ────────────────────
  if (!profile || profile.status === 'pending' || competencies.length === 0) {
    return <PendingScreen profile={profile} />
  }

  // ── Derive current state ────────────────────────────────────────
  const school = SCHOOL_CONFIG[profile.school] || SCHOOL_CONFIG.business
  const programType = TYPE_CONFIG[profile.program_type] || TYPE_CONFIG.MBA
  const firstName = profile.full_name?.split(' ')[0] || 'there'

  const completed  = competencies.filter((c: any) => c.status === 'completed')
  const active     = competencies.find((c: any) => c.status === 'active')
  const locked     = competencies.filter((c: any) => c.status === 'locked')

  // ── Fetch concepts for active competency ───────────────────────
  let activeConcepts: any[] = []
  if (active) {
    const { data } = await supabase
      .from('concepts')
      .select('*')
      .eq('competency_code', active.code)
      .order('sequence')
    activeConcepts = data || []
  }

  // ── Fetch concept progress for active competency ───────────────
  let conceptProgress: any[] = []
  if (active) {
    const { data } = await supabase
      .from('student_concepts')
      .select('*')
      .eq('student_id', user.id)
      .eq('program_id', active.id)
    conceptProgress = data || []
  }

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

  // ── Build Maya opening message ─────────────────────────────────
  let openingMessage = ''
  if (chatHistory.length > 0) {
    openingMessage = `${timeOfDay}, ${firstName}. Welcome back.\n\n`
    if (lastSubmission?.verdict === 'REVISE') {
      openingMessage += `Your last submission scored **${lastSubmission.score}/100** — we need to fix that before moving on.\n\nStill on **${active?.name || 'your current competency'}**. Ready to continue?`
    } else if (active) {
      openingMessage += `You're working on **${active.name}** (${active.code}) — ${completed.length} of ${competencies.length} competencies done.\n\nPick up where we left off, or ask me anything.`
    } else {
      openingMessage += `All ${completed.length} competencies completed. Impressive.\n\nWhat are we working on today?`
    }
  } else if (completed.length === 0) {
    openingMessage = `${timeOfDay}, ${firstName}. Welcome to your **${profile.program_name}**.\n\nI'm Maya — your AI mentor. No lectures. No slides. You learn by doing real work, and you can't advance until you prove you understood it.\n\nLet's start your first competency: **${active?.name}**. Ready?`
  } else {
    openingMessage = `${timeOfDay}, ${firstName}. Back to your **${profile.program_name}**.\n\n${completed.length} of ${competencies.length} competencies done.${active ? ` You're on **${active.name}**.` : ''}\n\nReady to continue?`
  }

  const sessionContext = `Student: ${profile.full_name}, School: ${profile.school}, Program: ${profile.program_name}, Active competency: ${active?.code} ${active?.name}, Completed: ${completed.length}/${competencies.length} competencies, Background: ${profile.job_title || 'not provided'} at ${profile.company || 'unknown'}`

  return (
    <div style={{ background:'#05050A', minHeight:'100vh', fontFamily:'DM Sans,sans-serif', color:'#E8E6E0' }}>

      {/* TOP NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'60px', background:'rgba(5,5,10,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#F0EDE6' }}>
            Mento<span style={{ color:'#FF6A00' }}>gram</span>
          </div>
          <div style={{ width:'1px', height:'16px', background:'rgba(255,255,255,0.1)' }} />
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:school.col }} />
            <span style={{ fontSize:'12px', color:'#666', fontFamily:'DM Mono,monospace' }}>{school.label}</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#444' }}>
            {profile.student_id}
          </div>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`${school.col}20`, border:`1px solid ${school.col}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:school.bright, fontFamily:'Playfair Display,serif' }}>
            {firstName[0]}
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT — sidebar + maya chat */}
      <div style={{ display:'flex', paddingTop:'60px', minHeight:'100vh' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
        <div style={{ width:'320px', flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.05)', overflowY:'auto', height:'calc(100vh - 60px)', position:'sticky', top:'60px', padding:'24px 0' }}>

          {/* Program header */}
          <div style={{ padding:'0 20px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', fontWeight:'700', padding:'3px 8px', borderRadius:'4px', background:`${programType.col}15`, color:programType.col, border:`1px solid ${programType.col}25` }}>{programType.label}</span>
            </div>
            <div className="pf" style={{ fontSize:'16px', fontWeight:'700', color:'#F0EDE6', lineHeight:'1.3', marginBottom:'12px' }}>{profile.program_name}</div>

            {/* Progress bar */}
            <div style={{ marginBottom:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <span style={{ fontSize:'11px', color:'#555' }}>Program progress</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:school.bright }}>{completed.length}/{competencies.length}</span>
              </div>
              <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'2px' }}>
                <div style={{ width:`${(completed.length/competencies.length)*100}%`, height:'100%', background:school.col, borderRadius:'2px', transition:'width 0.5s' }} />
              </div>
            </div>

            <div style={{ display:'flex', gap:'12px' }}>
              {[
                { n: completed.length,   l: 'Done',   c: '#4ADE80' },
                { n: active ? 1 : 0,     l: 'Active', c: school.bright },
                { n: locked.length,      l: 'Locked', c: '#333' },
              ].map(s => (
                <div key={s.l} style={{ flex:1, textAlign:'center', padding:'8px 4px', background:'rgba(255,255,255,0.02)', borderRadius:'6px' }}>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:'16px', fontWeight:'700', color:s.c }}>{s.n}</div>
                  <div style={{ fontSize:'9px', color:'#444', marginTop:'2px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Competency list */}
          <div style={{ padding:'16px 20px 0' }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Competencies</div>

            {competencies.map((comp: any) => {
              const isActive = comp.status === 'active'
              const isDone   = comp.status === 'completed'
              const isLocked = comp.status === 'locked'

              return (
                <div key={comp.code} style={{ marginBottom:'6px', padding:'12px', borderRadius:'10px', border:`1px solid ${isActive ? school.col+'40' : isDone ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)'}`, background: isActive ? `${school.col}08` : isDone ? 'rgba(74,222,128,0.04)' : 'transparent', opacity: isLocked ? 0.4 : 1, transition:'all 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom: isActive ? '8px' : '0' }}>
                    {/* Status icon */}
                    <div style={{ width:'18px', height:'18px', borderRadius:'50%', background: isDone ? '#4ADE80' : isActive ? school.col : 'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {isDone && <span style={{ color:'#000', fontSize:'10px', fontWeight:'900' }}>✓</span>}
                      {isActive && <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#fff', display:'block' }} />}
                      {isLocked && <span style={{ color:'#333', fontSize:'10px' }}>🔒</span>}
                    </div>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color: isDone ? '#4ADE80' : isActive ? school.bright : '#444', fontWeight:'700' }}>{comp.code}</span>
                    <span style={{ fontSize:'11px', color: isDone ? '#888' : isActive ? '#F0EDE6' : '#444', flex:1, lineHeight:'1.3' }}>{comp.name}</span>
                  </div>

                  {/* Active competency — show concept mini-list */}
                  {isActive && activeConcepts.length > 0 && (
                    <div style={{ marginLeft:'26px', display:'flex', flexDirection:'column', gap:'3px' }}>
                      {activeConcepts.slice(0, 6).map((concept: any, i: number) => {
                        const cp = conceptProgress.find((p: any) => p.concept_id === concept.id)
                        const cDone = cp?.is_mastered
                        const cActive = cp?.is_unlocked && !cp?.is_mastered
                        return (
                          <div key={concept.id} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <div style={{ width:'5px', height:'5px', borderRadius:'50%', background: cDone ? '#4ADE80' : cActive ? school.bright : 'rgba(255,255,255,0.1)', flexShrink:0 }} />
                            <span style={{ fontSize:'10px', color: cDone ? '#666' : cActive ? '#AAA' : '#444', lineHeight:'1.4' }}>{concept.title}</span>
                          </div>
                        )
                      })}
                      {activeConcepts.length > 6 && (
                        <div style={{ fontSize:'10px', color:'#444', marginLeft:'11px' }}>+{activeConcepts.length - 6} more concepts</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'calc(100vh - 60px)' }}>

          {/* Active competency banner */}
          {active && (
            <div style={{ padding:'16px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:`${school.col}06`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:`${school.col}15`, border:`1px solid ${school.col}30`, borderRadius:'6px' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:school.bright, animation:'pulse 2s infinite' }} />
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:school.bright, textTransform:'uppercase', letterSpacing:'0.1em' }}>Active</span>
                </div>
                <div>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:school.col, marginRight:'8px' }}>{active.code}</span>
                  <span style={{ fontSize:'14px', fontWeight:'600', color:'#F0EDE6' }}>{active.name}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'16px' }}>
                {[
                  { n:'24', l:'Concepts' },
                  { n:'180 min', l:'Per concept' },
                  { n:'8', l:'Stages each' },
                  { n:'≥72', l:'To advance' },
                ].map(s => (
                  <div key={s.l} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:'13px', fontWeight:'700', color:school.bright }}>{s.n}</div>
                    <div style={{ fontSize:'9px', color:'#555' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concept list for active competency */}
          {active && activeConcepts.length > 0 && (
            <div style={{ padding:'24px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  24 Concepts — {active.name}
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:school.bright }}>
                  {conceptProgress.filter((p: any) => p.is_mastered).length} / 24 mastered
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                {activeConcepts.map((concept: any, i: number) => {
                  const cp = conceptProgress.find((p: any) => p.concept_id === concept.id)
                  const isDone   = cp?.is_mastered
                  const isActive = cp?.is_unlocked && !cp?.is_mastered
                  const isLocked = !cp?.is_unlocked && !cp?.is_mastered
                  return (
                    <div key={concept.id} style={{ padding:'10px 12px', borderRadius:'8px', border:`1px solid ${isDone ? 'rgba(74,222,128,0.2)' : isActive ? school.col+'40' : 'rgba(255,255,255,0.05)'}`, background: isDone ? 'rgba(74,222,128,0.04)' : isActive ? `${school.col}08` : 'rgba(255,255,255,0.01)', opacity: isLocked ? 0.35 : 1, position:'relative', overflow:'hidden' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'5px' }}>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color: isDone ? '#4ADE80' : isActive ? school.bright : '#333', fontWeight:'700' }}>{String(i+1).padStart(2,'0')}</div>
                        {isDone && <span style={{ fontSize:'9px', color:'#4ADE80' }}>✓</span>}
                        {isActive && <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:school.bright, animation:'pulse 2s infinite' }} />}
                      </div>
                      <div style={{ fontSize:'10px', color: isDone ? '#666' : isActive ? '#AAA' : '#444', lineHeight:'1.45', fontWeight: isActive ? '500' : '400' }}>{concept.title}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Maya chat — fills remaining space */}
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 28px 8px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`${school.col}15`, border:`1px solid ${school.col}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:school.bright, fontFamily:'Playfair Display,serif' }}>M</div>
              <div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#F0EDE6' }}>Maya</div>
                <div style={{ fontSize:'10px', color:'#4ADE80', display:'flex', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#4ADE80' }} />
                  Online
                </div>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <MayaChat
                profile={profile}
                openingMessage={openingMessage}
                sessionContext={sessionContext}
                chatHistory={chatHistory}
                currentConceptId={conceptProgress.find((p: any) => p.is_unlocked && !p.is_mastered)?.concept_id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Pending screen — shown before admin approves ──────────────────
function PendingScreen({ profile }: { profile: any }) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  return (
    <div style={{ background:'#05050A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', padding:'24px' }}>
      <div style={{ maxWidth:'520px', textAlign:'center' }}>
        {/* Animated waiting indicator */}
        <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(255,106,0,0.08)', border:'1px solid rgba(255,106,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 32px', position:'relative' }}>
          <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#FF6A00', animation:'pulse 2s infinite' }} />
        </div>

        <div className="pf" style={{ fontSize:'32px', fontWeight:'800', color:'#F0EDE6', letterSpacing:'-0.02em', marginBottom:'16px' }}>
          Application under review.
        </div>
        <p style={{ fontSize:'16px', color:'#AAA', lineHeight:'1.7', marginBottom:'12px' }}>
          Hey {firstName} — we review every application personally. You will hear from us within 48 hours.
        </p>
        {profile?.school && (
          <div style={{ display:'inline-block', padding:'8px 20px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'100px', marginBottom:'32px' }}>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#666' }}>Applied for: </span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#AAA' }}>{profile.program_name} · {profile.school}</span>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxWidth:'320px', margin:'0 auto' }}>
          {[
            'Review your application',
            'Verify your background',
            'Assign your competencies',
            'Send your Student ID',
          ].map((step, i) => (
            <div key={step} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'8px', textAlign:'left' }}>
              <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#FF6A00' }}>{i+1}</span>
              </div>
              <span style={{ fontSize:'13px', color:'#666' }}>{step}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'40px' }}>
          <Link href="/" style={{ fontSize:'13px', color:'#444', textDecoration:'none' }}>← Back to Mentogram</Link>
        </div>
      </div>
    </div>
  )
}
