import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

const SCHOOL_COLS: Record<string, string> = {
  business: '#FF6A00', finance: '#1D4ED8', ai: '#7C3AED', manufacturing: '#0D9488', generic: '#16A34A',
}

export default async function StudentSubmissionsPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [profileRes, submissionsRes, chatRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('submissions')
      .select('*, concept:concepts(title, sequence, competency_code)')
      .eq('student_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('chat_messages')
      .select('role, content, created_at')
      .eq('student_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!profileRes.data) redirect('/admin/submissions')

  const profile     = profileRes.data
  const submissions = submissionsRes.data || []
  const chatHistory = chatRes.data || []
  const schoolCol   = SCHOOL_COLS[profile.school] || '#FF6A00'

  const passedCount  = submissions.filter(s => s.verdict === 'PASS').length
  const avgScore     = submissions.length > 0
    ? Math.round(submissions.reduce((a, s) => a + (s.score || 0), 0) / submissions.length)
    : null

  return (
    <div style={{ maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/submissions" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none', display: 'block', marginBottom: '16px' }}>← Back to Submissions</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${schoolCol}20`, border: `2px solid ${schoolCol}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: schoolCol, fontFamily: 'Playfair Display, serif' }}>
              {profile.full_name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}>{profile.full_name || 'Unnamed'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{profile.email} · {profile.student_id}</div>
            </div>
          </div>
          <Link href={`/admin/students/${id}`} style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none', padding: '7px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg2)' }}>
            View Full Progress →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
        {[
          { label: 'Total Submissions', value: submissions.length,                                                           col: '#F59E0B' },
          { label: 'Passed',            value: passedCount,                                                                  col: '#4ADE80' },
          { label: 'Avg Score',         value: avgScore ? `${avgScore}` : '—',                                              col: schoolCol },
          { label: 'Chat Messages',     value: chatHistory.length,                                                           col: schoolCol },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', borderTop: `2px solid ${s.col}` }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.col }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Task Submissions */}
        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Task Submissions ({submissions.length})
          </div>

          {submissions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text3)' }}>No task submissions yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {submissions.map((sub, i) => {
                const isPassed = sub.verdict === 'PASS'
                const scoreCol = isPassed ? '#4ADE80' : sub.verdict === 'REVISE' ? '#F59E0B' : '#F97066'
                const concept  = sub.concept as any
                const compCol  = concept?.competency_code
                  ? SCHOOL_COLS[concept.competency_code[0] === 'B' ? 'business' : concept.competency_code[0] === 'F' ? 'finance' : concept.competency_code[0] === 'A' ? 'ai' : concept.competency_code[0] === 'M' ? 'manufacturing' : 'generic'] || schoolCol
                  : schoolCol

                return (
                  <div key={sub.id || i} style={{ background: 'var(--bg2)', border: `1px solid ${scoreCol}20`, borderRadius: '12px', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${scoreCol}06` }}>
                      <div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: compCol, marginBottom: '3px' }}>
                          {concept?.competency_code} · Concept {concept?.sequence}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{concept?.title || 'Task Submission'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '22px', fontWeight: '900', color: scoreCol, fontFamily: 'DM Mono, monospace' }}>{sub.score}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>/100</span>
                        </div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: '700', color: scoreCol }}>{sub.verdict}</div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ padding: '12px 16px' }}>
                      {/* Student answer if saved */}
                      {sub.content && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Student Answer</div>
                          <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.65', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                            {sub.content}
                          </div>
                        </div>
                      )}

                      {/* Feedback from feedback_items */}
                      {sub.feedback_items && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {sub.feedback_items.strengths && (
                            <div style={{ padding: '8px 10px', background: 'rgba(74,222,128,0.06)', borderRadius: '6px', borderLeft: '2px solid rgba(74,222,128,0.3)' }}>
                              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Strengths</div>
                              <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.55' }}>{sub.feedback_items.strengths}</div>
                            </div>
                          )}
                          {sub.feedback_items.gaps && (
                            <div style={{ padding: '8px 10px', background: 'rgba(249,112,102,0.06)', borderRadius: '6px', borderLeft: '2px solid rgba(249,112,102,0.3)' }}>
                              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#F97066', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Gaps</div>
                              <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.55' }}>{sub.feedback_items.gaps}</div>
                            </div>
                          )}
                          {sub.feedback_items.fix && (
                            <div style={{ padding: '8px 10px', background: 'rgba(245,158,11,0.06)', borderRadius: '6px', borderLeft: '2px solid rgba(245,158,11,0.3)' }}>
                              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Fix</div>
                              <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.55' }}>{sub.feedback_items.fix}</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '8px', fontFamily: 'DM Mono, monospace' }}>
                        {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Chat History with Maya ({chatHistory.length} messages)
          </div>

          {chatHistory.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text3)' }}>No chat history yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '800px', overflowY: 'auto', padding: '2px' }}>
              {chatHistory.map((msg, i) => {
                const isUser   = msg.role === 'user'
                const isMaya   = msg.role === 'assistant'
                // Strip interface format tags for cleaner display
                const cleaned  = msg.content.replace(/\|\|\|[A-Z]+\|\|\|.*?\|\|\|/gs, '[Interface shown]').trim()
                if (!cleaned) return null

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: isUser ? '#F59E0B' : schoolCol, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {isUser ? profile.full_name?.split(' ')[0] || 'Student' : 'Maya'}
                      </div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: 'var(--text3)' }}>
                        {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: isUser ? '4px 12px 12px 12px' : '12px 4px 12px 12px', background: isUser ? 'rgba(245,158,11,0.06)' : `${schoolCol}06`, border: `1px solid ${isUser ? 'rgba(245,158,11,0.12)' : `${schoolCol}15`}`, fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {cleaned.length > 400 ? cleaned.slice(0, 400) + '...' : cleaned}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
