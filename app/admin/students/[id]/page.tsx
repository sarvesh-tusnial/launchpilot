import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ResetPasswordButton from '@/components/admin/ResetPasswordButton'

interface Props { params: Promise<{ id: string }> }

const SCHOOL_COLS: Record<string, string> = {
  business: '#FF6A00', finance: '#1D4ED8', ai: '#7C3AED', manufacturing: '#0D9488', generic: '#16A34A',
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [profileRes, competenciesRes, submissionsRes, chatCountRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('student_competencies').select('*').eq('student_id', id).order('sequence'),
    supabase.from('submissions').select('*, concept:concepts(id, title, sequence, competency_code)').eq('student_id', id).order('created_at', { ascending: false }),
    supabase.from('chat_messages').select('id', { count: 'exact' }).eq('student_id', id),
  ])

  if (!profileRes.data) redirect('/admin/students')

  const profile      = profileRes.data
  const competencies = competenciesRes.data || []
  const submissions  = submissionsRes.data || []
  const chatCount    = chatCountRes.count || 0

  // Fetch concepts for all competencies
  const competencyCodes = competencies.map((c: any) => c.code)
  const [conceptsRes, conceptProgressRes] = await Promise.all([
    competencyCodes.length > 0
      ? supabase.from('concepts').select('id, title, sequence, competency_code').in('competency_code', competencyCodes).order('competency_code').order('sequence')
      : Promise.resolve({ data: [] }),
    supabase.from('student_concepts').select('*').eq('student_id', id),
  ])

  const allConcepts     = conceptsRes.data || []
  const conceptProgress = conceptProgressRes.data || []
  const progressById    = new Map(conceptProgress.map((p: any) => [p.concept_id, p]))

  // Group submissions by concept id
  const submissionsByConceptId = new Map<string, any[]>()
  for (const sub of submissions) {
    const cid = (sub.concept as any)?.id
    if (!cid) continue
    if (!submissionsByConceptId.has(cid)) submissionsByConceptId.set(cid, [])
    submissionsByConceptId.get(cid)!.push(sub)
  }

  // Stats
  const completedComps   = competencies.filter((c: any) => c.status === 'completed').length
  const masteredConcepts = conceptProgress.filter((p: any) => p.is_mastered).length
  const passedSubs       = submissions.filter((s: any) => s.verdict === 'PASS').length
  const avgScore         = submissions.length > 0
    ? Math.round(submissions.reduce((a: any, s: any) => a + (s.score || 0), 0) / submissions.length)
    : null
  const daysSince = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1
  const schoolCol = SCHOOL_COLS[profile.school] || '#FF6A00'

  return (
    <div style={{ maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/students" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none', display: 'block', marginBottom: '16px' }}>← Back to Students</Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${schoolCol}20`, border: `2px solid ${schoolCol}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: schoolCol, fontFamily: 'Playfair Display, serif' }}>
              {profile.full_name?.[0] || '?'}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '4px' }}>{profile.full_name || 'Unnamed'}</h1>
              <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '6px' }}>{profile.email}</div>
            <ResetPasswordButton studentId={profile.id} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', background: `${schoolCol}15`, color: schoolCol, border: `1px solid ${schoolCol}25` }}>{profile.school}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{profile.student_id}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', background: profile.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)', color: profile.status === 'active' ? 'var(--green)' : 'var(--text3)', border: `1px solid ${profile.status === 'active' ? 'rgba(74,222,128,0.2)' : 'var(--border)'}` }}>{profile.status}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Day {daysSince} of program</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{profile.program_name}</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: 'Competencies Done', value: `${completedComps}/${competencies.length}`, col: '#4ADE80' },
          { label: 'Concepts Mastered',  value: masteredConcepts,                           col: schoolCol },
          { label: 'Tasks Submitted',    value: submissions.length,                         col: '#F59E0B' },
          { label: 'Pass Rate',          value: submissions.length > 0 ? `${Math.round((passedSubs/submissions.length)*100)}%` : '—', col: '#4ADE80' },
          { label: 'Maya Messages',      value: chatCount,                                  col: schoolCol },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', borderTop: `2px solid ${s.col}` }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.col, fontFamily: 'Playfair Display, serif' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Profile info */}
      <div style={{ padding: '18px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '28px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          ['Job Title',    profile.job_title  || '—'],
          ['Company',      profile.company    || '—'],
          ['Experience',   profile.years_experience ? `${profile.years_experience} years` : '—'],
          ['Avg Score',    avgScore ? `${avgScore}/100` : '—'],
          ['Program Type', profile.program_type || '—'],
          ['Joined',       new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
        ].map(([label, value]) => (
          <div key={label as string}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Competencies + Concepts + Submissions */}
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
        Competency Progress & Submissions
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {competencies.map((comp: any) => {
          const compConcepts  = allConcepts.filter((c: any) => c.competency_code === comp.code)
          const mastered      = compConcepts.filter((c: any) => progressById.get(c.id)?.is_mastered).length
          const current       = compConcepts.find((c: any) => progressById.get(c.id)?.is_unlocked && !progressById.get(c.id)?.is_mastered)
          const isDone        = comp.status === 'completed'
          const isActive      = comp.status === 'active'
          const isLocked      = comp.status === 'locked'
          const col           = SCHOOL_COLS[comp.school] || schoolCol
          const compSubs      = submissions.filter((s: any) => (s.concept as any)?.competency_code === comp.code)
          const compAvg       = compSubs.length > 0
            ? Math.round(compSubs.reduce((a: any, s: any) => a + (s.score || 0), 0) / compSubs.length)
            : null

          return (
            <div key={comp.code} style={{ background: 'var(--bg2)', border: `1px solid ${isDone ? 'rgba(74,222,128,0.15)' : isActive ? `${col}25` : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', opacity: isLocked ? 0.4 : 1 }}>

              {/* Competency header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isDone ? 'rgba(74,222,128,0.12)' : isActive ? `${col}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${isDone ? 'rgba(74,222,128,0.3)' : isActive ? `${col}35` : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isDone   && <span style={{ color: '#4ADE80', fontSize: '12px' }}>✓</span>}
                    {isActive && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: col }} />}
                    {isLocked && <span style={{ fontSize: '10px' }}>🔒</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: '700', color: isDone ? '#4ADE80' : isActive ? col : 'var(--text3)' }}>{comp.code}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{comp.name}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      {isDone ? 'Completed' : isActive ? `In progress · Concept ${mastered + 1}/24` : 'Not started'}
                      {current && ` · On: ${current.title}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {[
                    { v: `${mastered}/24`, l: 'concepts',  c: mastered > 0 ? col : 'var(--text3)' },
                    { v: compSubs.length,  l: 'tasks',     c: compSubs.length > 0 ? '#F59E0B' : 'var(--text3)' },
                    { v: compAvg ? `${compAvg}` : '—', l: 'avg',  c: compAvg ? (compAvg >= 72 ? '#4ADE80' : '#F97066') : 'var(--text3)' },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '16px', fontWeight: '700', color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concepts with inline task submissions */}
              {(isActive || isDone) && compConcepts.length > 0 && (
                <div style={{ padding: '12px 20px' }}>

                  {/* Mini progress bar */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const concept    = compConcepts[i]
                      const cp         = concept ? progressById.get(concept.id) : null
                      const isMastered = cp?.is_mastered
                      const isCurrent  = cp?.is_unlocked && !cp?.is_mastered
                      return <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: isMastered ? '#4ADE80' : isCurrent ? col : 'rgba(255,255,255,0.06)' }} />
                    })}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {compConcepts.map((concept: any) => {
                      const cp         = progressById.get(concept.id)
                      const isMastered = cp?.is_mastered
                      const isCurrent  = cp?.is_unlocked && !cp?.is_mastered
                      const isUnlocked = cp?.is_unlocked
                      const stage      = cp?.current_stage || 1
                      const conSubs    = submissionsByConceptId.get(concept.id) || []

                      return (
                        <div key={concept.id} style={{ border: `1px solid ${isMastered ? 'rgba(74,222,128,0.12)' : isCurrent ? `${col}20` : 'rgba(255,255,255,0.04)'}`, borderRadius: '8px', overflow: 'hidden', opacity: !isUnlocked && !isMastered ? 0.3 : 1 }}>

                          {/* Concept row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: isMastered ? 'rgba(74,222,128,0.04)' : isCurrent ? `${col}06` : 'transparent' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isMastered ? '#4ADE80' : isCurrent ? col : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isMastered
                                ? <span style={{ color: '#000', fontSize: '9px', fontWeight: '900' }}>✓</span>
                                : <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: isCurrent ? '#fff' : '#444', fontWeight: '700' }}>{String(concept.sequence).padStart(2,'0')}</span>
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: isCurrent ? '600' : '400', color: isMastered ? 'var(--text3)' : isCurrent ? 'var(--text)' : 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {concept.title}
                              </div>
                              {isCurrent && (
                                <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: col }}>Stage {stage}/8 · in progress</div>
                              )}
                            </div>
                            {/* Task score pills */}
                            {conSubs.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {conSubs.map((sub: any, si: number) => {
                                  const isPassed = sub.verdict === 'PASS'
                                  const scoreCol = isPassed ? '#4ADE80' : '#F97066'
                                  return (
                                    <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '100px', background: `${scoreCol}10`, border: `1px solid ${scoreCol}25` }}>
                                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: '700', color: scoreCol }}>{sub.score}</span>
                                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: scoreCol }}>{sub.verdict}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Task submission detail */}
                          {conSubs.length > 0 && (
                            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              {conSubs.map((sub: any, si: number) => {
                                const isPassed = sub.verdict === 'PASS'
                                const scoreCol = isPassed ? '#4ADE80' : '#F97066'
                                return (
                                  <div key={si} style={{ marginBottom: si < conSubs.length - 1 ? '10px' : '0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: 'var(--text3)', textTransform: 'uppercase' }}>Task Attempt {si + 1}</span>
                                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: '700', color: scoreCol }}>{sub.score}/100 · {sub.verdict}</span>
                                      <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: 'auto' }}>{new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                    {(sub.strengths || sub.gaps) && (
                                      <div style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: '1.6', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: `2px solid ${scoreCol}40` }}>
                                        {sub.strengths && <div><span style={{ color: '#4ADE80', fontWeight: '600' }}>Strong: </span>{sub.strengths}</div>}
                                        {sub.gaps      && <div style={{ marginTop: '4px' }}><span style={{ color: '#F97066', fontWeight: '600' }}>Gaps: </span>{sub.gaps}</div>}
                                        {sub.fix       && <div style={{ marginTop: '4px' }}><span style={{ color: '#F59E0B', fontWeight: '600' }}>Fix: </span>{sub.fix}</div>}
                                      </div>
                                    )}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
