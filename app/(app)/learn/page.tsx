import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const PROGRAM_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; label: string }> = {
  'pm-mba':              { color: '#FF6A00', bgColor: 'rgba(255,106,0,0.06)',   borderColor: 'rgba(255,106,0,0.25)',   label: 'PM MBA' },
  'ai-agents':           { color: '#60A5FA', bgColor: 'rgba(96,165,250,0.06)',  borderColor: 'rgba(96,165,250,0.25)',  label: 'AI Agents' },
  'reach-distribution':  { color: '#34D399', bgColor: 'rgba(52,211,153,0.06)',  borderColor: 'rgba(52,211,153,0.25)',  label: 'Reach & Distribution' },
  'automation-nocode':   { color: '#F97066', bgColor: 'rgba(249,112,102,0.06)', borderColor: 'rgba(249,112,102,0.25)', label: 'Automation & No-code' },
  'strategy-leadership': { color: '#A78BFA', bgColor: 'rgba(167,139,250,0.06)', borderColor: 'rgba(167,139,250,0.25)', label: 'Strategy & Leadership' },
  'growth':              { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.06)',  borderColor: 'rgba(245,158,11,0.25)',  label: 'Growth MBA' },
}

function getProgramConfig(slug: string) {
  return PROGRAM_CONFIG[slug] || { color: '#FF6A00', bgColor: 'rgba(255,106,0,0.06)', borderColor: 'rgba(255,106,0,0.25)', label: slug }
}

interface Props {
  searchParams: Promise<{ program?: string }>
}

export default async function LearnPage({ searchParams }: Props) {
  const { program: programParam } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, enrollmentsRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('enrollments')
      .select('*, program:programs(*)')
      .eq('student_id', user.id),
    supabase.from('student_concepts').select('*').eq('student_id', user.id),
  ])

  const profile = profileRes.data
  const enrollments = enrollmentsRes.data || []
  const progress = progressRes.data || []
  const progressMap = new Map(progress.map(p => [p.concept_id, p]))

  // Determine active program — URL param overrides profile default
  const activeProgramSlug = programParam ||
    enrollments.find((e: any) => e.program_id === profile?.active_program_id)?.program?.slug ||
    enrollments[0]?.program?.slug

  const activeEnrollment = enrollments.find(e => e.program?.slug === activeProgramSlug)
  const activeProgram = activeEnrollment?.program

  if (!activeProgram) redirect('/dashboard')

  // Fetch concepts for the active program only
  const { data: concepts } = await supabase
    .from('concepts')
    .select('*')
    .eq('program_id', activeProgram.id)
    .order('order_index')

  const programConcepts = concepts || []
  const config = getProgramConfig(activeProgram.slug)

  const mastered = progress.filter(p => p.is_mastered).length
  const totalUnlocked = progress.filter(p => p.is_unlocked).length

  const phases = [
    { num: 1, label: activeProgram.phase_1_label || 'Foundation' },
    { num: 2, label: activeProgram.phase_2_label || 'Execution' },
    { num: 3, label: activeProgram.phase_3_label || 'Mastery' },
  ]

  return (
    <div style={{ maxWidth: '860px', padding: '32px 24px' }}>

      {/* Program header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: config.color, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
          Learning Path
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '6px' }}>
              {activeProgram.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '20px', background: config.bgColor, border: `1px solid ${config.borderColor}`, color: config.color }}>
                {mastered} mastered
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                {totalUnlocked}/{programConcepts.length} unlocked
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ minWidth: '180px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px', textAlign: 'right' }}>
              {Math.round((mastered / programConcepts.length) * 100)}% complete
            </div>
            <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(mastered / programConcepts.length) * 100}%`, background: config.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Concept list by phase */}
      {phases.map(phase => {
        const phaseConcepts = programConcepts.filter(c => c.phase === phase.num)
        if (phaseConcepts.length === 0) return null
        const phasemastered = phaseConcepts.filter(c => progressMap.get(c.id)?.is_mastered).length

        return (
          <div key={phase.num} style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${config.borderColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: config.color, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>
                    Phase {phase.num} · {activeProgram.title}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>{phase.label}</div>
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>
                  {phasemastered}/{phaseConcepts.length} done
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {phaseConcepts.map((concept, idx) => {
                const p = progressMap.get(concept.id)
                const isUnlocked = p?.is_unlocked || false
                const isMastered = p?.is_mastered || false
                const score = p?.level || 0

                return (
                  <div key={concept.id}>
                    {isUnlocked ? (
                      <Link
                        href={`/learn/${concept.slug}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isMastered ? `${config.bgColor}` : 'var(--bg2)',
                          border: `1px solid ${isMastered ? config.borderColor : 'var(--border)'}`,
                          borderRadius: '10px', padding: '16px 20px',
                          textDecoration: 'none', transition: 'border-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isMastered ? config.bgColor : 'rgba(255,255,255,0.04)', border: `1px solid ${isMastered ? config.borderColor : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: isMastered ? config.color : 'var(--text3)', flexShrink: 0 }}>
                            {isMastered ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginBottom: '3px' }}>{concept.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{concept.description}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          {isMastered
                            ? <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '20px', background: config.bgColor, border: `1px solid ${config.borderColor}`, color: config.color }}>✓ Mastered</span>
                            : <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text3)' }}>Level {score}</span>
                          }
                          <span style={{ color: config.color, fontSize: '16px' }}>→</span>
                        </div>
                      </Link>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'var(--bg2)', border: '1px solid var(--border)',
                        borderRadius: '10px', padding: '16px 20px', opacity: 0.4,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>
                            {idx + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginBottom: '3px' }}>{concept.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                              {concept.prerequisites?.length > 0 ? 'Complete the previous concept to unlock' : 'Locked'}
                            </div>
                          </div>
                        </div>
                        <span style={{ color: 'var(--text3)', fontSize: '16px' }}>🔒</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

    </div>
  )
}
