import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import TasksClient from './TasksClient'

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, tasksRes, submissionsRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tasks').select('*, concept:concepts(title, slug)'),
    supabase.from('submissions').select('task_id, verdict, score, created_at').eq('student_id', user.id).order('created_at', { ascending: false }),
    supabase.from('student_concepts').select('concept_id, is_unlocked').eq('student_id', user.id),
  ])

  const profile = profileRes.data
  const tasks = tasksRes.data || []
  const submissions = submissionsRes.data || []
  const progress = progressRes.data || []

  const unlockedConceptIds = new Set(progress.filter(p => p.is_unlocked).map(p => p.concept_id))
  const submissionMap = new Map(submissions.map(s => [s.task_id, s]))

  const availableTasks = tasks.filter(t => unlockedConceptIds.has(t.concept_id))

  return (
    <TasksClient
      profile={profile}
      tasks={availableTasks}
      submissionMap={Object.fromEntries(submissionMap)}
    />
  )
}
