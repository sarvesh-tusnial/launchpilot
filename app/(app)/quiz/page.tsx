import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import QuizClient from './QuizClient'

interface Props {
  searchParams: Promise<{ concept?: string }>
}

export default async function QuizPage({ searchParams }: Props) {
  const { concept: conceptId } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, progressRes, conceptsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_concepts').select('*, concept:concepts(*)').eq('student_id', user.id).eq('is_unlocked', true),
    supabase.from('concepts').select('*').order('order_index'),
  ])

  const profile = profileRes.data
  const unlockedConcepts = (progressRes.data || []).map(p => p.concept).filter(Boolean)

  let selectedConcept = null
  if (conceptId) {
    selectedConcept = unlockedConcepts.find((c: any) => c?.id === conceptId) || null
  }

  return (
    <QuizClient
      profile={profile}
      unlockedConcepts={unlockedConcepts as any[]}
      initialConcept={selectedConcept as any}
    />
  )
}
