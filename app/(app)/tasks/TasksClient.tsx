'use client'

import { useState } from 'react'
import type { Task, Profile } from '@/types'

interface Props {
  profile: Profile | null
  tasks: (Task & { concept: { title: string; slug: string } | null })[]
  submissionMap: Record<string, { verdict: string | null; score: number | null; created_at: string }>
}

const TASK_TYPE_LABELS: Record<string, string> = {
  prd: 'PRD',
  case_study: 'Case Study',
  experiment: 'Experiment',
  prioritization: 'Prioritization',
  strategy_memo: 'Strategy Memo',
}

const TASK_TYPE_COLORS: Record<string, string> = {
  prd: 'tag-accent',
  case_study: 'tag-teal',
  experiment: 'tag-amber',
  prioritization: 'tag-coral',
  strategy_memo: 'tag-blue',
}

export default function TasksClient({ profile, tasks, submissionMap }: Props) {
  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null)
  const [submission, setSubmission] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [localSubmissions, setLocalSubmissions] = useState(submissionMap)

  const handleSubmit = async () => {
    if (!selectedTask || !submission.trim()) return
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          conceptId: selectedTask.concept_id,
          content: submission,
          studentLevel: profile?.current_phase || 1,
        }),
      })
      const data = await res.json()
      if (data.submission) {
        setResult(data.submission)
        setLocalSubmissions(prev => ({
          ...prev,
          [selectedTask.id]: {
            verdict: data.submission.verdict,
            score: data.submission.score,
            created_at: data.submission.created_at,
          }
        }))
      }
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  if (selectedTask) {
    return (
      <div style={{ maxWidth: '800px' }}>
        <button
          onClick={() => { setSelectedTask(null); setResult(null); setSubmission('') }}
          style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0 }}
        >
          ← Back to Tasks
        </button>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className={`tag ${TASK_TYPE_COLORS[selectedTask.task_type]}`}>{TASK_TYPE_LABELS[selectedTask.task_type]}</span>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Difficulty {'◆'.repeat(selectedTask.difficulty)}{'◇'.repeat(5 - selectedTask.difficulty)}</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '6px', letterSpacing: '-0.02em' }}>{selectedTask.title}</h1>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Concept: {(selectedTask as any).concept?.title}</div>
        </div>

        {/* Brief */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Task Brief</div>
          <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {selectedTask.brief}
          </p>
        </div>

        {/* Rubric */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Evaluation Rubric</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.entries(selectedTask.rubric.weights || {}).map(([dim, weight]) => (
              <div key={dim} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg3)', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' }}>{dim.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)' }}>{weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submission */}
        {!result ? (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>
                Your Submission
              </label>
              <textarea
                value={submission}
                onChange={e => setSubmission(e.target.value)}
                placeholder="Write your full response here. Be specific, reference real data or reasoning, and address all required sections from the brief..."
                rows={18}
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '16px', fontSize: '14px',
                  color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                  lineHeight: '1.7', resize: 'vertical', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>
                {submission.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || submission.trim().length < 100}
              className="btn btn-primary"
              style={{ opacity: submission.trim().length < 100 ? 0.4 : 1 }}
            >
              {submitting ? 'Evaluating with AI...' : 'Submit for Evaluation'}
            </button>
            {submission.trim().length < 100 && submission.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px' }}>Minimum 100 characters required</p>
            )}
          </>
        ) : (
          <EvaluationResult result={result} />
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Execution Engine</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '8px' }}>PM Tasks</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Real PM deliverables evaluated by AI using a senior PM rubric.</p>
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Tasks Available Yet</h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Complete lessons to unlock execution tasks.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(task => {
            const sub = localSubmissions[task.id]
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '20px 24px',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className={`tag ${TASK_TYPE_COLORS[task.task_type]}`}>{TASK_TYPE_LABELS[task.task_type]}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{'◆'.repeat(task.difficulty)}{'◇'.repeat(5 - task.difficulty)}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)', marginBottom: '4px' }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{(task as any).concept?.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {sub ? (
                    <>
                      {sub.score !== null && (
                        <span style={{ fontSize: '14px', fontWeight: '600', color: (sub.score || 0) >= 72 ? 'var(--teal)' : 'var(--coral)' }}>
                          {sub.score}/100
                        </span>
                      )}
                      <span className={`tag tag-${sub.verdict === 'PASS' ? 'teal' : sub.verdict === 'REVISE' ? 'amber' : 'coral'}`}>
                        {sub.verdict}
                      </span>
                    </>
                  ) : (
                    <span className="tag tag-gray">Not submitted</span>
                  )}
                  <span style={{ color: 'var(--text3)' }}>→</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EvaluationResult({ result }: { result: any }) {
  const verdictColor = result.verdict === 'PASS' ? 'var(--teal)' : result.verdict === 'REVISE' ? 'var(--amber)' : 'var(--coral)'
  const verdictBg = result.verdict === 'PASS' ? 'rgba(74,222,128,0.08)' : result.verdict === 'REVISE' ? 'rgba(245,158,11,0.08)' : 'rgba(249,112,102,0.08)'
  const verdictBorder = result.verdict === 'PASS' ? 'rgba(74,222,128,0.2)' : result.verdict === 'REVISE' ? 'rgba(245,158,11,0.2)' : 'rgba(249,112,102,0.2)'

  return (
    <div>
      {/* Overall verdict */}
      <div style={{ background: verdictBg, border: `1px solid ${verdictBorder}`, borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: verdictColor }}>{result.verdict}</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: verdictColor }}>{result.score}/100</div>
        </div>
        {result.bridge_insight && (
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '8px' }}>{result.bridge_insight}</p>
        )}
      </div>

      {/* Dimension Scores */}
      {result.dimension_scores && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Dimension Breakdown
          </div>
          {Object.entries(result.dimension_scores).map(([dim, score]: [string, any]) => (
            <div key={dim} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500', textTransform: 'capitalize' }}>
                  {dim.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: score.score >= 4 ? 'var(--teal)' : score.score >= 3 ? 'var(--amber)' : 'var(--coral)' }}>
                  {score.score}/5
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{ height: '100%', width: `${(score.score / 5) * 100}%`, background: score.score >= 4 ? 'var(--teal)' : score.score >= 3 ? 'var(--amber)' : 'var(--coral)', borderRadius: '2px' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{score.verdict} — {score.instruction}</p>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Items */}
      {result.feedback_items && result.feedback_items.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            What to Fix
          </div>
          {result.feedback_items.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < result.feedback_items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(249,112,102,0.12)', border: '1px solid rgba(249,112,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: 'var(--coral)', flexShrink: 0 }}>
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
    </div>
  )
}
