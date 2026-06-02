import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

const SCHOOL_COLS: Record<string, string> = {
  business: '#FF6A00', finance: '#1D4ED8', ai: '#7C3AED', manufacturing: '#0D9488', generic: '#16A34A',
}

export default async function SubmissionsPage() {
  const { supabase } = await requireAdmin()

  const [studentsRes, submissionsRes, chatRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, school, student_id, program_name, status').eq('is_admin', false).order('created_at', { ascending: false }),
    supabase.from('submissions').select('student_id, score, verdict, created_at'),
    supabase.from('chat_messages').select('student_id', { count: 'exact' }),
  ])

  const students    = studentsRes.data || []
  const submissions = submissionsRes.data || []
  const chatMsgs    = chatRes.data || []

  // Group by student
  const subsByStudent  = new Map<string, any[]>()
  const chatByStudent  = new Map<string, number>()

  for (const sub of submissions) {
    if (!subsByStudent.has(sub.student_id)) subsByStudent.set(sub.student_id, [])
    subsByStudent.get(sub.student_id)!.push(sub)
  }
  for (const msg of chatMsgs) {
    chatByStudent.set(msg.student_id, (chatByStudent.get(msg.student_id) || 0) + 1)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Submissions</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
          Click any student to view their full chat history with Maya and task submissions.
        </p>
      </div>

      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '8px 18px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
        <div>Student</div>
        <div>Program</div>
        <div>Tasks</div>
        <div>Pass Rate</div>
        <div>Messages</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {students.map(student => {
          const subs     = subsByStudent.get(student.id) || []
          const passed   = subs.filter(s => s.verdict === 'PASS').length
          const passRate = subs.length > 0 ? Math.round((passed / subs.length) * 100) : null
          const msgs     = chatByStudent.get(student.id) || 0
          const col      = SCHOOL_COLS[student.school] || '#888'

          return (
            <Link key={student.id} href={`/admin/submissions/${student.id}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', textDecoration: 'none', transition: 'border-color 0.15s' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginBottom: '2px' }}>{student.full_name || 'Unnamed'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{student.email}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: col, fontWeight: '700' }}>{student.school?.toUpperCase()}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{student.program_name?.slice(0, 18) || '—'}</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: subs.length > 0 ? '#F59E0B' : 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                {subs.length}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: passRate !== null ? (passRate >= 70 ? '#4ADE80' : '#F97066') : 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                {passRate !== null ? `${passRate}%` : '—'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: msgs > 0 ? col : 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                {msgs}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
