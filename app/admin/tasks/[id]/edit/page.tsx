import { requireAdmin } from '@/lib/auth/admin'
import TaskForm from '@/components/admin/TaskForm'
import { CLIENT } from '@/client-config'
import { redirect } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

const ALL_COMPETENCIES = CLIENT.pathways
const DECATHLON_CODES = CLIENT.pathways.map(c => c.code)
export default async function EditTaskPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [taskRes, biz, fin, ai, mfg, gen] = await Promise.all([
    supabase.from('tasks').select('*').eq('id', id).single(),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'business').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'finance').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'ai').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'manufacturing').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'generic').order('competency_code').order('sequence'),
  ])

  if (!taskRes.data) redirect('/admin/tasks')

  const allConcepts = [
    ...(biz.data || []),
    ...(fin.data || []),
    ...(ai.data || []),
    ...(mfg.data || []),
    ...(gen.data || []),
  ].filter(c => c.competency_code)

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin · Task Library
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Edit Task</h1>
      </div>
      <TaskForm competencies={ALL_COMPETENCIES} concepts={allConcepts} task={taskRes.data} />
    </div>
  )
}
