'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  submission: any
}

const DIMENSION_LABELS: Record<string, string> = {
  user_insight: 'User Insight',
  problem_clarity: 'Problem Clarity',
  business_thinking: 'Business Thinking',
  execution_quality: 'Execution Quality',
  tradeoff_reasoning: 'Tradeoff Reasoning',
  communication_clarity: 'Communication Clarity',
}

export default function SubmissionDetail({ submission: sub }: Props) {
  const [note, setNote] = useState(sub.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const saveNote = async () => {
    setSaving(true)
    await fetch(`/api/admin/submissions/${sub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: note }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const verdictColor = sub.verdict === 'PASS' ? 'var(--teal)' : sub.verdict === 'REVISE' ? 'var(--amber)' : 'var(--coral)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top row - score + student info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Result</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '40px', fontWeight: '700', color: verdictColor }}>{sub.score ?? '—'}</div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: verdictColor }}>{sub.verdict || 'Pending'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>out of 100</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Student</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{sub.student?.full_name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px' }}>{sub.student?.email}</div>
          <div style={{ marginTop: '8px' }}><span className="tag tag-accent">{sub.student?.domain}</span></div>
        </div>
      </div>

      {/* Task brief */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Task Brief</div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginBottom: '10px' }}>{sub.task?.title}</div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>{sub.task?.brief}</p>
      </div>

      {/* Student submission */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Student Submission
          <span style={{ marginLeft: '12px', color: 'var(--text3)', fontWeight: '400' }}>
            {sub.content.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.8', whiteSpace: 'pre-line', margin: 0 }}>{sub.content}</p>
      </div>

      {/* AI Dimension Scores */}
      {sub.dimension_scores && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>AI Dimension Scores</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(sub.dimension_scores).map(([dim, data]: [string, any]) => (
              <div key={dim}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{DIMENSION_LABELS[dim] || dim}</span>
                  <span style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: data.score >= 4 ? 'var(--teal)' : data.score >= 3 ? 'var(--amber)' : 'var(--coral)' }}>{data.score}/5</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                  <div style={{ height: '100%', width: `${(data.score / 5) * 100}%`, background: data.score >= 4 ? 'var(--teal)' : data.score >= 3 ? 'var(--amber)' : 'var(--coral)', borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{data.verdict} — <span style={{ color: 'var(--text2)' }}>{data.instruction}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback Items */}
      {sub.feedback_items && sub.feedback_items.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>AI Feedback</div>
          {sub.feedback_items.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < sub.feedback_items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(249,112,102,0.12)', border: '1px solid rgba(249,112,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: 'var(--coral)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '4px' }}>{item.issue}</div>
                <div style={{ fontSize: '13px', color: 'var(--teal)' }}>Fix: {item.fix}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Notes */}
      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Your Notes
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add your personal notes on this submission — what you'd tell this student if you reviewed it yourself..."
          rows={5}
          style={{
            width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '12px 14px', fontSize: '14px',
            color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
            lineHeight: '1.7', resize: 'vertical', marginBottom: '12px',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--amber)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={saveNote}
            disabled={saving}
            style={{
              background: 'var(--amber)', border: 'none', borderRadius: '8px',
              padding: '8px 20px', fontSize: '13px', fontWeight: '600',
              color: '#000', cursor: 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
          {saved && <span style={{ fontSize: '13px', color: 'var(--teal)' }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  )
}
