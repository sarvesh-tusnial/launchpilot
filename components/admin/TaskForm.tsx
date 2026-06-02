'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Competency { code: string; name: string; school: string }
interface Concept { id: string; title: string; sequence: number; competency_code: string; competency_name?: string; school?: string }
interface Props { competencies: Competency[]; concepts: Concept[]; task?: any }

const TASK_TYPES = [
  { value: 'case_study',     label: 'Case Study',                    desc: 'Real company scenario with decisions to make',           icon: '◈' },
  { value: 'simulation',     label: 'Simulation',                    desc: 'AI plays stakeholders, student manages the room',        icon: '◎' },
  { value: 'roleplay',       label: 'Roleplay',                      desc: 'Student plays a character in a specific scenario',       icon: '◷' },
  { value: 'implementation', label: 'Implementation Decision Making', desc: 'Design and defend a real-world implementation',         icon: '◆' },
  { value: 'experiment',     label: 'Experiment Design',              desc: 'Design and defend an A/B test or growth experiment',    icon: '⬡' },
  { value: 'prioritization', label: 'Prioritization',                 desc: 'Rank and defend a backlog or set of options',           icon: '◉' },
  { value: 'strategy_memo',  label: 'Strategy Memo',                  desc: 'Board-level strategic recommendation',                  icon: '◍' },
]

const RUBRIC = [
  { key: 'user_insight',          label: 'User Insight',          def: 20 },
  { key: 'problem_clarity',       label: 'Problem Clarity',       def: 20 },
  { key: 'business_thinking',     label: 'Business Thinking',     def: 20 },
  { key: 'execution_quality',     label: 'Execution Quality',     def: 15 },
  { key: 'tradeoff_reasoning',    label: 'Tradeoff Reasoning',    def: 15 },
  { key: 'communication_clarity', label: 'Communication Clarity', def: 10 },
]

const SCHOOL_COLS: Record<string, string> = {
  business: '#FF6A00', finance: '#1D4ED8', ai: '#7C3AED', manufacturing: '#0D9488', generic: '#16A34A',
}

const SCHOOL_LABELS: Record<string, string> = {
  business: 'School of Business', finance: 'School of Finance', ai: 'School of AI & Technology',
  manufacturing: 'School of Manufacturing', generic: 'Generic — All Schools',
}

const SCHOOL_ORDER = ['business', 'finance', 'ai', 'manufacturing', 'generic']

// Derive school purely from code prefix — no database dependency
function schoolFromCode(code: string): string {
  if (!code || typeof code !== 'string' || code.length === 0) return 'generic'
  const c = code[0].toUpperCase()
  if (c === 'B') return 'business'
  if (c === 'F') return 'finance'
  if (c === 'A') return 'ai'
  if (c === 'M') return 'manufacturing'
  return 'generic'
}

export default function TaskForm({ competencies, concepts, task }: Props) {
  const router = useRouter()
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState('')
  const [taskType,         setTaskType]         = useState(task?.task_type || 'case_study')
  const [title,            setTitle]            = useState(task?.title || '')
  const [selectedCompCode, setSelectedCompCode] = useState<string>(task?.competency_code || '')
  const [conceptId,        setConceptId]        = useState(task?.concept_id || '')
  const [difficulty,       setDifficulty]       = useState(task?.difficulty || 3)
  const [brief,            setBrief]            = useState(task?.brief || '')
  const [isActive,         setIsActive]         = useState(task?.is_active ?? true)
  const [weights,          setWeights]          = useState<Record<string, number>>(
    task?.rubric?.weights || Object.fromEntries(RUBRIC.map(d => [d.key, d.def]))
  )

  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  // Group competencies by school using code prefix — guaranteed to work
  const grouped: Record<string, Competency[]> = {
    business: [], finance: [], ai: [], manufacturing: [], generic: [],
  }
  for (const comp of competencies) {
    if (!comp || !comp.code || typeof comp.code !== 'string') continue
    const school = schoolFromCode(comp.code)
    grouped[school].push(comp)
  }

  // Concepts for selected competency
  const filteredConcepts = concepts
    .filter(c => c && c.competency_code === selectedCompCode)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  const selectedCol  = SCHOOL_COLS[schoolFromCode(selectedCompCode)] || '#888'
  const selectedComp = competencies.find(c => c.code === selectedCompCode)

  const handleSave = async () => {
    if (!title.trim())     { setError('Title is required'); return }
    if (!selectedCompCode) { setError('Please select a competency'); return }
    if (!conceptId)        { setError('Please select a concept'); return }
    if (!brief.trim())     { setError('Brief is required'); return }
    if (total !== 100)     { setError(`Rubric must total 100 (currently ${total})`); return }
    setSaving(true); setError('')
    const payload = { task_type: taskType, title, concept_id: conceptId, difficulty, brief, is_active: isActive, rubric: { dimensions: RUBRIC.map(d => d.key), weights } }
    const res  = await fetch(task ? `/api/admin/tasks/${task.id}` : '/api/admin/tasks', { method: task ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (data.error) { setError(data.error) } else { router.push('/admin/tasks'); router.refresh() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Task Type */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '12px', fontWeight: '500' }}>Task Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {TASK_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setTaskType(t.value)}
              style={{ textAlign: 'left', padding: '14px 16px', borderRadius: '10px', border: `1px solid ${taskType === t.value ? 'var(--accent)' : 'var(--border)'}`, background: taskType === t.value ? 'rgba(123,92,240,0.08)' : 'var(--bg3)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: taskType === t.value ? 'var(--accent2)' : 'var(--text3)' }}>{t.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: taskType === t.value ? 'var(--accent2)' : 'var(--text)' }}>{t.label}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Task Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The Turnaround Plan — Microsoft 2013" className="input" />
      </div>

      {/* Step 1 — Competency */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Step 1 — Select Competency</label>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>Pick the competency this task belongs to. Then select one of its 24 concepts below.</div>
        {SCHOOL_ORDER.map(school => {
          const comps = grouped[school]
          if (!comps || comps.length === 0) return null
          const col = SCHOOL_COLS[school]
          return (
            <div key={school} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: col, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {SCHOOL_LABELS[school]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {comps.map(comp => {
                  const sel = selectedCompCode === comp.code
                  return (
                    <button key={comp.code} type="button" onClick={() => { setSelectedCompCode(comp.code); setConceptId('') }}
                      style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${sel ? col : 'rgba(255,255,255,0.07)'}`, background: sel ? `${col}15` : 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: '700', color: sel ? col : '#555', marginBottom: '3px' }}>{comp.code}</div>
                      <div style={{ fontSize: '11px', color: sel ? '#F0EDE6' : '#777', lineHeight: '1.3' }}>{comp.name}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Step 2 — Concept */}
      {selectedCompCode && (
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Step 2 — Select Concept
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: selectedCol, marginLeft: '8px' }}>{selectedCompCode} · {selectedComp?.name}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '12px' }}>{filteredConcepts.length} concepts available. Pick the one this task is linked to.</div>
          {filteredConcepts.length === 0 ? (
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '10px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
              No concepts found for {selectedCompCode}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto', padding: '2px' }}>
              {filteredConcepts.map(concept => {
                const sel = conceptId === concept.id
                return (
                  <button key={concept.id} type="button" onClick={() => setConceptId(concept.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${sel ? selectedCol : 'rgba(255,255,255,0.06)'}`, background: sel ? `${selectedCol}10` : 'rgba(255,255,255,0.02)', cursor: 'pointer', width: '100%' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: sel ? `${selectedCol}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? selectedCol : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: sel ? selectedCol : '#555', fontWeight: '700' }}>{String(concept.sequence || 0).padStart(2, '0')}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: sel ? '#F0EDE6' : '#AAA', fontWeight: sel ? '500' : '400', flex: 1 }}>{concept.title}</div>
                    {sel && <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: selectedCol, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#fff', fontSize: '10px', fontWeight: '900' }}>✓</span></div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Difficulty */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Difficulty</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,3,4,5].map(d => (
            <button key={d} type="button" onClick={() => setDifficulty(d)}
              style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontWeight: '600', border: `1px solid ${difficulty===d?'var(--accent)':'var(--border)'}`, background: difficulty===d?'rgba(123,92,240,0.12)':'var(--bg3)', color: difficulty===d?'var(--accent2)':'var(--text3)', cursor: 'pointer', fontSize: '14px' }}>{d}</button>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>{['','Guided','Some ambiguity','Conflicting inputs','Open-ended','Full autonomy'][difficulty]}</div>
      </div>

      {/* Brief */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Task Brief</label>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>Write exactly what the student will read. Give them a character, a company, constraints, and pressure.</div>
        <textarea value={brief} onChange={e => setBrief(e.target.value)} rows={14}
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7', resize: 'vertical' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>{brief.split(/\s+/).filter(Boolean).length} words</div>
      </div>

      {/* Rubric */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '500' }}>Grading Rubric Weights</label>
          <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: total===100?'var(--teal)':'var(--coral)' }}>Total: {total}/100</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {RUBRIC.map(dim => (
            <div key={dim.key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ minWidth: '180px', fontSize: '13px', color: 'var(--text2)' }}>{dim.label}</div>
              <input type="range" min={0} max={50} step={5} value={weights[dim.key]||0} onChange={e => setWeights(prev => ({ ...prev, [dim.key]: Number(e.target.value) }))} style={{ flex: 1, accentColor: 'var(--accent)' }} />
              <div style={{ minWidth: '36px', fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textAlign: 'right' }}>{weights[dim.key]||0}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={() => setIsActive(!isActive)}
          style={{ width: '44px', height: '24px', borderRadius: '12px', background: isActive?'var(--accent)':'var(--bg4)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: '3px', left: isActive?'23px':'3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{isActive ? 'Active — Maya can assign this task' : 'Disabled — Maya will skip this task'}</span>
      </div>

      {error && <div style={{ background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--coral)' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', paddingBottom: '40px' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ opacity: saving?0.6:1 }}>{saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}</button>
        <button onClick={() => router.push('/admin/tasks')} className="btn btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
