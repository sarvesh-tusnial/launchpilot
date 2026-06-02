import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProgressPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, competenciesRes, conceptProgressRes, chatCountRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_competencies')
      .select('*, competency:competencies(code, name, order_index)')
      .eq('student_id', user.id),
    supabase.from('student_concepts')
      .select('*, concept:concepts(title, sequence, competency_code)')
      .eq('student_id', user.id),
    supabase.from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id),
  ])

  const profile         = profileRes.data
  const competencies    = competenciesRes.data || []
  const conceptProgress = conceptProgressRes.data || []
  const chatCount       = chatCountRes.count || 0

  if (!profile) redirect('/auth/login')

  const firstName    = profile.full_name?.split(' ')[0] || 'there'
  const completed    = competencies.filter((c: any) => c.status === 'completed')
  const masteredConcepts = conceptProgress.filter((p: any) => p.is_completed).length
  const daysSince    = profile.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1

  return (
    <div style={{ background: '#020B14', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#E8E6E0' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '60px', background: 'rgba(2,11,20,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#F0EDE6' }}>
          Deca<span style={{ color: '#0082C3' }}>thlon</span>
        </div>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#888', textDecoration: 'none', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
          ← Back to Maya
        </Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#0082C3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Progress Report</div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.03em', color: '#F0EDE6', marginBottom: '6px' }}>{firstName}'s Journey</h1>
          <p style={{ fontSize: '14px', color: '#555', fontFamily: 'DM Mono, monospace' }}>Decathlon Learning · Day {daysSince}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
          {[
            { n: `${completed.length}/15`, l: 'Competencies Done', col: '#0082C3' },
            { n: masteredConcepts, l: 'Concepts Mastered', col: '#FFD700' },
            { n: chatCount, l: 'Messages with Maya', col: '#00C851' },
            { n: `Day ${daysSince}`, l: 'On Platform', col: '#0099E6' },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px 20px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.col, letterSpacing: '-0.02em', marginBottom: '6px' }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: '#444', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0' }}>Decathlon Enterprise MBA</div>
            <div style={{ fontSize: '12px', color: '#0082C3', fontFamily: 'DM Mono, monospace' }}>{completed.length}/15 competencies</div>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {competencies.map((c: any) => (
              <div key={(c.competency as any)?.code} style={{ flex: 1, height: '6px', borderRadius: '3px', background: c.status === 'completed' ? '#0082C3' : c.status === 'active' ? '#0082C3' : c.status === 'paused' ? 'rgba(0,130,195,0.3)' : 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { col: '#0082C3', label: `${completed.length} completed` },
              { col: 'rgba(0,130,195,0.5)', label: `${competencies.filter(c => c.status === 'active' || c.status === 'paused').length} active` },
              { col: 'rgba(255,255,255,0.1)', label: `${competencies.filter(c => c.status === 'locked').length} locked` },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.col }} />
                <span style={{ fontSize: '11px', color: '#555', fontFamily: 'DM Mono, monospace' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competency breakdown */}
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Competency Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...competencies].sort((a, b) => {
            const order: Record<string, number> = { active: 0, paused: 1, completed: 2, locked: 3 }
            return (order[a.status] ?? 4) - (order[b.status] ?? 4)
          }).map((sc: any) => {
            const code = (sc.competency as any)?.code
            const name = (sc.competency as any)?.name
            const isActive   = sc.status === 'active'
            const isDone     = sc.status === 'completed'
            const isPaused   = sc.status === 'paused'
            const isLocked   = sc.status === 'locked'

            // Count mastered concepts for this competency
            const compConcepts = conceptProgress.filter((p: any) => (p.concept as any)?.competency_code === code)
            const mastered = compConcepts.filter((p: any) => p.is_completed).length
            const total = 20

            return (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(0,130,195,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', opacity: isLocked ? 0.4 : 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDone ? 'rgba(0,200,81,0.1)' : isActive ? 'rgba(0,130,195,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isDone ? 'rgba(0,200,81,0.3)' : isActive ? 'rgba(0,130,195,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDone ? '#00C851' : isActive ? '#0082C3' : isPaused ? 'rgba(0,130,195,0.4)' : 'rgba(255,255,255,0.15)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: isActive ? '#0082C3' : '#444' }}>{code}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: isLocked ? '#333' : '#E8E6E0' }}>{name}</span>
                    {isActive && <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#0082C3', background: 'rgba(0,130,195,0.1)', padding: '2px 6px', borderRadius: '4px' }}>IN PROGRESS</span>}
                    {isDone && <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#00C851', background: 'rgba(0,200,81,0.1)', padding: '2px 6px', borderRadius: '4px' }}>COMPLETED</span>}
                  </div>
                  {!isLocked && (
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: total }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < mastered ? '#0082C3' : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: isDone ? '#00C851' : isActive ? '#0082C3' : '#333' }}>{mastered}/{total}</div>
                  <div style={{ fontSize: '9px', color: '#444', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>concepts</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
