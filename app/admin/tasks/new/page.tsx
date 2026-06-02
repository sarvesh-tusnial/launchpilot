import { requireAdmin } from '@/lib/auth/admin'
import TaskForm from '@/components/admin/TaskForm'
import { CLIENT } from '@/client-config'

const ALL_COMPETENCIES = CLIENT.pathways
const DECATHLON_CODES = CLIENT.pathways.map(c => c.code)

export default async function NewTaskPage() {
  const { supabase } = await requireAdmin()

  const { data: allConcepts } = await supabase
    .from('concepts')
    .select('id, title, sequence, competency_code')
    .in('competency_code', DECATHLON_CODES)
    .order('competency_code').order('sequence')

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin · Task Library
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Add Task</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
          Maya assigns this task during Stage 6 of the linked concept.
        </p>
      </div>
      <TaskForm competencies={ALL_COMPETENCIES} concepts={allConcepts || []} />
    </div>
  )
}
