import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import LessonClient from './LessonClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ConceptPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [conceptRes, profileRes, progressRes] = await Promise.all([
    supabase.from('concepts').select('*').eq('slug', slug).single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_concepts').select('*').eq('student_id', user.id),
  ])

  const concept = conceptRes.data
  if (!concept) redirect('/learn')

  const profile = profileRes.data
  const progress = progressRes.data || []
  const progressMap = new Map(progress.map(p => [p.concept_id, p]))
  const studentConcept = progressMap.get(concept.id)

  if (!studentConcept?.is_unlocked) {
    redirect('/learn')
  }

  const priorGaps = progress.filter(p => p.gap_flag).map(p => {
    const c = (p as any).concept?.title || ''
    return c
  }).filter(Boolean)

  const existingLesson = await supabase
    .from('lessons')
    .select('*')
    .eq('student_id', user.id)
    .eq('concept_id', concept.id)
    .eq('completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <LessonClient
      concept={concept}
      profile={profile}
      studentConcept={studentConcept}
      existingLesson={existingLesson.data}
      priorGaps={priorGaps}
    />
  )
}
