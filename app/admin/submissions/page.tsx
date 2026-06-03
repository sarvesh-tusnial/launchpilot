import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

export default async function SubmissionsPage() {
  const { supabase } = await requireAdmin()

  const [studentsRes, compRes, chatRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, status').eq('is_admin', false).order('created_at', { ascending: false }),
    supabase.from('student_competencies').select('student_id, competency_code, status, is_completed'),
    supabase.from('chat_messages').select('student_id, role, content, created_at').eq('role', 'assistant'),
  ])

  const students = studentsRes.data || []
  const comps    = compRes.data || []
  const msgs     = chatRes.data || []

  // Group data by student
  const compsByStudent = new Map<string, any[]>()
  const msgsByStudent  = new Map<string, number>()
  const evalsByStudent = new Map<string, { total: number; passed: number }>()

  for (const c of comps) {
    if (!compsByStudent.has(c.student_id)) compsByStudent.set(c.student_id, [])
    compsByStudent.get(c.student_id)!.push(c)
  }

  for (const m of msgs) {
    msgsByStudent.set(m.student_id, (msgsByStudent.get(m.student_id) || 0) + 1)
    // Detect EVAL blocks in assistant messages
    const evalMatches = m.content?.match(/\|\|\|EVAL\|\|\|({.*?})\|\|\|/g) || []
    if (evalMatches.length > 0) {
      if (!evalsByStudent.has(m.student_id)) evalsByStudent.set(m.student_id, { total: 0, passed: 0 })
      const ev = evalsByStudent.get(m.student_id)!
      for (const match of evalMatches) {
        try {
          const json = JSON.parse(match.replace(/\|\|\|EVAL\|\|\|/, '').replace(/\|\|\|$/, ''))
          ev.total++
          if (json.verdict === 'PASS') ev.passed++
        } catch {}
      }
    }
  }

  // Filter out admins and system users
  const activeStudents = students.filter(s => s.status === 'active' || msgsByStudent.get(s.id))

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Submissions</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
          Click any student to view their full chat history with Maya and task submissions.
        </p>
      </div>

      {activeStudents.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '6px' }}>No student activity yet</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Students will appear here once they start sessions with Maya</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: '12px', padding: '8px 18px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            <div>Student</div>
            <div>Pathway / Track</div>
            <div>Evals</div>
            <div>Pass Rate</div>
            <div>Messages</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeStudents.map(student => {
              const studentComps = compsByStudent.get(student.id) || []
              const active = studentComps.find(c => c.status === 'active')
              const completed = studentComps.filter(c => c.is_completed).length
              const evals = evalsByStudent.get(student.id) || { total: 0, passed: 0 }
              const passRate = evals.total > 0 ? Math.round((evals.passed / evals.total) * 100) : null
              const msgCount = msgsByStudent.get(student.id) || 0

              return (
                <Link key={student.id} href={`/admin/submissions/${student.id}`}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginBottom: '2px' }}>{student.full_name || 'Unnamed'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{student.email}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent)', background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.15)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '3px' }}>
                      {active?.competency_code || '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{completed} concept{completed !== 1 ? 's' : ''} completed</div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: evals.total > 0 ? '#F59E0B' : 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                    {evals.total || '—'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'DM Mono, monospace', color: passRate !== null ? (passRate >= 70 ? '#4ADE80' : '#F97066') : 'var(--text3)' }}>
                    {passRate !== null ? `${passRate}%` : '—'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: msgCount > 0 ? 'var(--accent2)' : 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                    {msgCount || '—'}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
