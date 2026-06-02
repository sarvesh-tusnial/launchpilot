import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  prd: 'PRD', case_study: 'Case Study', experiment: 'Experiment',
  prioritization: 'Prioritization', strategy_memo: 'Strategy Memo',
  simulation: 'Simulation', roleplay: 'Roleplay',
}

const TYPE_COLORS: Record<string, string> = {
  prd: 'tag-accent', case_study: 'tag-teal', experiment: 'tag-amber',
  prioritization: 'tag-coral', strategy_memo: 'tag-blue',
  simulation: 'tag-pink', roleplay: 'tag-green',
}

export default async function AdminTasksPage() {
  const { supabase } = await requireAdmin()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, concept:concepts(title, slug)')
    .order('created_at', { ascending: false })

  const grouped: Record<string, typeof tasks> = {}
  for (const task of tasks || []) {
    const type = task.task_type
    if (!grouped[type]) grouped[type] = []
    grouped[type]!.push(task)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Task Library</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
            {tasks?.length || 0} tasks · Maya picks from these automatically based on concept progress
          </p>
        </div>
        <Link href="/admin/tasks/new" className="btn btn-primary">
          + Create Task
        </Link>
      </div>

      {Object.entries(TYPE_LABELS).map(([type, label]) => {
        const typeTasks = grouped[type] || []
        return (
          <div key={type} style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className={`tag ${TYPE_COLORS[type]}`}>{label}</span>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{typeTasks.length} task{typeTasks.length !== 1 ? 's' : ''}</span>
            </div>

            {typeTasks.length === 0 ? (
              <div style={{ padding: '20px', background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '10px', textAlign: 'center' }}>
                <Link href={`/admin/tasks/new?type=${type}`} style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>
                  + Add your first {label} task
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {typeTasks.map(task => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg2)', border: `1px solid ${task.is_active ? 'var(--border)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '14px 18px',
                    opacity: task.is_active ? 1 : 0.4,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)' }}>{task.title}</span>
                        {!task.is_active && <span className="tag tag-gray">Disabled</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        {(task.concept as any)?.title} · Difficulty {'◆'.repeat(task.difficulty)}{'◇'.repeat(5 - task.difficulty)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px', lineHeight: '1.5' }}>
                        {task.brief.slice(0, 120)}...
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '20px', flexShrink: 0 }}>
                      <Link href={`/admin/tasks/${task.id}/edit`} style={{
                        padding: '6px 14px', borderRadius: '7px', fontSize: '13px',
                        background: 'var(--bg3)', border: '1px solid var(--border)',
                        color: 'var(--text2)', textDecoration: 'none',
                      }}>
                        Edit
                      </Link>
                      <Link href={`/admin/tasks/${task.id}`} style={{
                        padding: '6px 14px', borderRadius: '7px', fontSize: '13px',
                        background: 'var(--bg3)', border: '1px solid var(--border)',
                        color: 'var(--text2)', textDecoration: 'none',
                      }}>
                        Preview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
