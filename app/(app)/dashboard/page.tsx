import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, studentCompsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_competencies')
      .select('*, competency:competencies(code, name, order_index)')
      .eq('student_id', user.id)
      .order('competency(order_index)'),
  ])

  const profile      = profileRes.data
  const studentComps = studentCompsRes.data || []

  if (!profile || profile.status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,130,195,0.1)', border: '1px solid rgba(0,130,195,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 24px' }}>⏳</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.02em' }}>Account pending approval.</h1>
          <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: '1.7' }}>
            Hey {profile?.full_name?.split(' ')[0] || 'there'} — your account is being reviewed. You'll be notified once approved.
          </p>
          <a href="/auth/login" style={{ display: 'inline-block', marginTop: '24px', fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>← Back to login</a>
        </div>
      </div>
    )
  }

  // Use status field — same as Mentogram
  const active    = studentComps.find(c => c.status === 'active')
  const completed = studentComps.filter(c => c.status === 'completed')
  const locked    = studentComps.filter(c => c.status === 'locked')

  // Fetch concepts for active competency
  let activeConcepts:  any[] = []
  let conceptProgress: any[] = []
  let masteredConcepts = 0
  let currentConcept:  any   = null
  let chatHistory:     any[] = []

  if (active) {
    const activeCode = (active.competency as any)?.code

    const [conceptData, cpData, chatData] = await Promise.all([
      supabase.from('concepts')
        .select('*')
        .eq('competency_code', activeCode)
        .order('sequence'),
      supabase.from('student_concepts')
        .select('*')
        .eq('student_id', user.id),
      supabase.from('chat_messages')
        .select('role, content, created_at')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    activeConcepts  = conceptData.data || []
    conceptProgress = cpData.data || []
    chatHistory     = (chatData.data || []).reverse()

    const activeConceptIds  = new Set(activeConcepts.map(c => c.id))
    masteredConcepts = conceptProgress.filter(p => p.is_completed && activeConceptIds.has(p.concept_id)).length

    const completedIds = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))
    currentConcept = activeConcepts.find(c => !completedIds.has(c.id)) || activeConcepts[0] || null
  }

  const firstName           = profile.full_name?.split(' ')[0] || 'there'
  const activeCompName      = (active?.competency as any)?.name || ''
  const currentConceptTitle = currentConcept?.title || ''

  const openingMessage = active
    ? `Hey ${firstName}! Ready to continue with **${activeCompName}**? ${currentConceptTitle ? `We're on "${currentConceptTitle}" — let's pick up where we left off.` : "Let's get started on the first concept."}`
    : `Hey ${firstName}! Welcome to Decathlon Learning. Your admin will assign your competencies soon!`

  const sessionContext = active
    ? `Student is working on ${activeCompName}${currentConceptTitle ? `, currently on concept: ${currentConceptTitle}` : ''}`
    : 'No active competency assigned'

  return (
    <DashboardClient
      profile={profile}
      firstName={firstName}
      competencies={studentComps}
      completed={completed}
      active={active}
      locked={locked}
      activeConcepts={activeConcepts}
      conceptProgress={conceptProgress}
      masteredConcepts={masteredConcepts}
      currentConceptId={currentConcept?.id}
      openingMessage={openingMessage}
      sessionContext={sessionContext}
      chatHistory={chatHistory}
    />
  )
}
