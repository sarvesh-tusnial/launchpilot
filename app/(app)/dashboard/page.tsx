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
      .eq('student_id', user.id),
  ])

  const profile      = profileRes.data
  const studentComps = studentCompsRes.data || []

  if (!profile || profile.status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: '#07040F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#F0EDE6', marginBottom: '12px' }}>Application under review.</h1>
          <p style={{ fontSize: '15px', color: '#888', lineHeight: '1.7' }}>
            Hey {profile?.full_name?.split(' ')[0] || 'there'} — we're reviewing your application. You'll receive your login credentials within 24 hours once approved.
          </p>
          <a href="/auth/login" style={{ display: 'inline-block', marginTop: '24px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>← Back to login</a>
        </div>
      </div>
    )
  }

  // Find active pathway
  const active = studentComps.find((c: any) => c.status === 'active')

  let activeConcepts:  any[] = []
  let conceptProgress: any[] = []
  let masteredConcepts = 0
  let currentConcept:  any   = null
  let chatHistory:     any[] = []

  if (active) {
    const activeCode = (active.competency as any)?.code

    const [conceptData, cpData, chatData] = await Promise.all([
      supabase.from('concepts').select('*').eq('competency_code', activeCode).order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', user.id),
      supabase.from('chat_messages')
        .select('role, content, created_at')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    activeConcepts  = conceptData.data || []
    conceptProgress = cpData.data || []
    chatHistory     = (chatData.data || []).reverse()

    const activeConceptIds = new Set(activeConcepts.map((c: any) => c.id))
    masteredConcepts = conceptProgress.filter((p: any) => p.is_completed && activeConceptIds.has(p.concept_id)).length

    const completedIds = new Set(conceptProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    currentConcept = activeConcepts.find((c: any) => !completedIds.has(c.id)) || activeConcepts[0] || null
  }

  const firstName           = profile.full_name?.split(' ')[0] || 'there'
  const activeCompName      = (active?.competency as any)?.name || ''
  const currentConceptTitle = currentConcept?.title || ''

  const openingMessage = active
    ? `Hey ${firstName}! Ready to work on **${activeCompName}**? ${currentConceptTitle ? `We're on Step ${currentConcept?.sequence}: "${currentConceptTitle}" — let's pick up where we left off.` : "Let's start your first step."}`
    : `Hey ${firstName}! Welcome to LaunchPilot. Your pathway hasn't been assigned yet — check back soon or contact support.`

  const sessionContext = active
    ? `Student is working on ${activeCompName}${currentConceptTitle ? `, currently on step: ${currentConceptTitle}` : ''}`
    : 'No pathway active'

  return (
    <DashboardClient
      profile={profile}
      firstName={firstName}
      active={active}
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
