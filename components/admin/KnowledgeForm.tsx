'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Competency { code: string; name: string; school: string }
interface Concept { id: string; title: string; sequence: number; competency_code: string }
interface Props {
  mentorId: string
  competencies: Competency[]
  concepts: Concept[]
  knowledge?: any
}

const KNOWLEDGE_TYPES = [
  { value: 'interview_transcript', label: 'Interview Transcript', desc: 'Full or excerpted conversation with the mentor', icon: '🎙️' },
  { value: 'framework',           label: 'Framework',            desc: 'A structured way of thinking they use',           icon: '◈'  },
  { value: 'opinion',             label: 'Opinion / Belief',     desc: 'A strong view they hold about the domain',        icon: '💬' },
  { value: 'case_study',          label: 'Case Study',           desc: 'A real situation they faced and navigated',       icon: '📋' },
  { value: 'career_story',        label: 'Career Story',         desc: 'Their personal journey or turning point',         icon: '🏃' },
  { value: 'mistake',             label: 'Mistake & Lesson',     desc: 'Something they got wrong and what they learned',  icon: '⚠️' },
  { value: 'advice',              label: 'Advice',               desc: 'Direct guidance they give to practitioners',      icon: '💡' },
]

const SCHOOL_COLS: Record<string, string> = {
  business: '#FF6A00', finance: '#1D4ED8', ai: '#7C3AED', manufacturing: '#0D9488', generic: '#16A34A',
}
const SCHOOL_LABELS: Record<string, string> = {
  business: 'School of Business', finance: 'School of Finance', ai: 'School of AI & Technology',
  manufacturing: 'School of Manufacturing', generic: 'Generic — All Schools',
}
const SCHOOL_ORDER = ['business', 'finance', 'ai', 'manufacturing', 'generic']

function schoolFromCode(code: string): string {
  if (!code) return 'generic'
  const c = code[0].toUpperCase()
  if (c === 'B') return 'business'
  if (c === 'F') return 'finance'
  if (c === 'A') return 'ai'
  if (c === 'M') return 'manufacturing'
  return 'generic'
}

export default function KnowledgeForm({ mentorId, competencies, concepts, knowledge }: Props) {
  const router = useRouter()
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState('')
  const [knowledgeType,    setKnowledgeType]    = useState(knowledge?.knowledge_type || 'interview_transcript')
  const [title,            setTitle]            = useState(knowledge?.title || '')
  const [content,          setContent]          = useState(knowledge?.content || '')
  const [isActive,         setIsActive]         = useState(knowledge?.is_active ?? true)
  const [expandedComp,     setExpandedComp]     = useState<string>('')
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>(
    knowledge?.concept_id ? [knowledge.concept_id] : []
  )

  // Group competencies by school
  const grouped: Record<string, Competency[]> = {
    business: [], finance: [], ai: [], manufacturing: [], generic: [],
  }
  for (const comp of competencies) {
    if (!comp?.code) continue
    const school = schoolFromCode(comp.code)
    grouped[school].push(comp)
  }

  // Concepts for expanded competency
  const filteredConcepts = concepts
    .filter(c => c.competency_code === expandedComp)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  const toggleConcept = (id: string) => {
    setSelectedConcepts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!title.trim())   { setError('Title is required'); return }
    if (!content.trim()) { setError('Content is required'); return }
    setSaving(true)
    setError('')

    // Save one knowledge entry per selected concept (or one with no concept if none selected)
    const conceptIds = selectedConcepts.length > 0 ? selectedConcepts : [null]

    try {
      for (const conceptId of conceptIds) {
        const payload = {
          mentor_id:      mentorId,
          knowledge_type: knowledgeType,
          title,
          content,
          concept_id:     conceptId,
          is_active:      isActive,
        }

        const url    = knowledge ? `/api/admin/mentors/${mentorId}/knowledge/${knowledge.id}` : `/api/admin/mentors/${mentorId}/knowledge`
        const method = knowledge ? 'PUT' : 'POST'

        const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
      }

      router.push(`/admin/mentors/${mentorId}/knowledge`)
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setSaving(false)
    }
  }

  const expandedCol      = SCHOOL_COLS[schoolFromCode(expandedComp)] || '#888'
  const expandedCompName = competencies.find(c => c.code === expandedComp)?.name || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Knowledge Type */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '12px', fontWeight: '500' }}>Knowledge Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {KNOWLEDGE_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setKnowledgeType(t.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${knowledgeType === t.value ? 'var(--accent)' : 'var(--border)'}`, background: knowledgeType === t.value ? 'rgba(255,106,0,0.08)' : 'var(--bg3)', cursor: 'pointer' }}>
              <span style={{ fontSize: '18px' }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: knowledgeType === t.value ? 'var(--accent2)' : 'var(--text)' }}>{t.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input"
          placeholder="e.g. How I think about prioritisation under resource constraints" />
      </div>

      {/* Content */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Content</label>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
          Paste raw transcripts, write frameworks, or summarise their views. The more specific and real, the better Maya teaches with it.
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={16}
          placeholder="Paste the interview transcript, framework, opinion, or story here..."
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7', resize: 'vertical' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>{content.split(/\s+/).filter(Boolean).length} words</div>
      </div>

      {/* Concept linker — multi select across schools */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Link to Concepts
          {selectedConcepts.length > 0 && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent2)', marginLeft: '8px' }}>
              {selectedConcepts.length} selected — Maya will use this in all of them
            </span>
          )}
        </label>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
          Click a competency to expand it and pick concepts. Select from multiple competencies and schools — Maya will use this knowledge in all selected concepts. Leave empty to make it available across all concepts.
        </div>

        {/* Selected concept pills */}
        {selectedConcepts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', padding: '12px', background: 'rgba(255,106,0,0.04)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '10px' }}>
            {selectedConcepts.map(id => {
              const concept = concepts.find(c => c.id === id)
              if (!concept) return null
              const col = SCHOOL_COLS[schoolFromCode(concept.competency_code)] || '#888'
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', background: `${col}12`, border: `1px solid ${col}30`, fontSize: '11px', color: col }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px' }}>{concept.competency_code}·{String(concept.sequence).padStart(2,'0')}</span>
                  <span>{concept.title.slice(0, 28)}{concept.title.length > 28 ? '...' : ''}</span>
                  <button type="button" onClick={() => toggleConcept(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: col, fontSize: '12px', padding: '0', lineHeight: 1 }}>✕</button>
                </div>
              )
            })}
            <button type="button" onClick={() => setSelectedConcepts([])}
              style={{ padding: '4px 10px', borderRadius: '100px', background: 'rgba(249,112,102,0.08)', border: '1px solid rgba(249,112,102,0.2)', fontSize: '11px', color: 'var(--coral)', cursor: 'pointer' }}>
              Clear all
            </button>
          </div>
        )}

        {/* School groups */}
        {SCHOOL_ORDER.map(school => {
          const comps = grouped[school]
          if (!comps || comps.length === 0) return null
          const col = SCHOOL_COLS[school]
          return (
            <div key={school} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: col, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {SCHOOL_LABELS[school]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {comps.map(comp => {
                  const isExpanded     = expandedComp === comp.code
                  const conceptsInComp = concepts.filter(c => c.competency_code === comp.code)
                  const selectedInComp = conceptsInComp.filter(c => selectedConcepts.includes(c.id)).length
                  return (
                    <button key={comp.code} type="button"
                      onClick={() => setExpandedComp(isExpanded ? '' : comp.code)}
                      style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${isExpanded ? col : selectedInComp > 0 ? `${col}40` : 'rgba(255,255,255,0.07)'}`, background: isExpanded ? `${col}15` : selectedInComp > 0 ? `${col}08` : 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: '700', color: isExpanded || selectedInComp > 0 ? col : '#555' }}>{comp.code}</div>
                        {selectedInComp > 0 && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: col }}>{selectedInComp} ✓</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: isExpanded || selectedInComp > 0 ? '#F0EDE6' : '#777', lineHeight: '1.3', marginTop: '2px' }}>{comp.name}</div>
                    </button>
                  )
                })}
              </div>

              {/* Expanded concept list */}
              {expandedComp && grouped[school]?.some(c => c.code === expandedComp) && (
                <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${expandedCol}20`, borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: expandedCol, fontFamily: 'DM Mono, monospace' }}>
                      {expandedComp} — {expandedCompName}
                    </div>
                    {filteredConcepts.length > 0 && (
                      <button type="button"
                        onClick={() => {
                          const ids = filteredConcepts.map(c => c.id)
                          const allSelected = ids.every(id => selectedConcepts.includes(id))
                          if (allSelected) {
                            setSelectedConcepts(prev => prev.filter(id => !ids.includes(id)))
                          } else {
                            setSelectedConcepts(prev => [...new Set([...prev, ...ids])])
                          }
                        }}
                        style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: expandedCol, background: `${expandedCol}10`, border: `1px solid ${expandedCol}25`, borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' }}>
                        {filteredConcepts.every(c => selectedConcepts.includes(c.id)) ? 'Deselect all' : 'Select all 24'}
                      </button>
                    )}
                  </div>
                  {filteredConcepts.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', padding: '16px' }}>No concepts found for {expandedComp}</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '280px', overflowY: 'auto' }}>
                      {filteredConcepts.map(concept => {
                        const sel = selectedConcepts.includes(concept.id)
                        return (
                          <button key={concept.id} type="button" onClick={() => toggleConcept(concept.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', padding: '9px 12px', borderRadius: '7px', border: `1px solid ${sel ? expandedCol : 'rgba(255,255,255,0.06)'}`, background: sel ? `${expandedCol}10` : 'rgba(255,255,255,0.02)', cursor: 'pointer', width: '100%' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: sel ? expandedCol : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? expandedCol : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {sel
                                ? <span style={{ color: '#fff', fontSize: '10px', fontWeight: '900' }}>✓</span>
                                : <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#555', fontWeight: '700' }}>{String(concept.sequence).padStart(2,'0')}</span>
                              }
                            </div>
                            <div style={{ fontSize: '12px', color: sel ? '#F0EDE6' : '#AAA', flex: 1 }}>{concept.title}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={() => setIsActive(!isActive)}
          style={{ width: '44px', height: '24px', borderRadius: '12px', background: isActive ? 'var(--accent)' : 'var(--bg4)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: '3px', left: isActive ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{isActive ? 'Active — Maya will use this knowledge' : 'Inactive'}</span>
      </div>

      {error && (
        <div style={{ background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--coral)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', paddingBottom: '40px' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : knowledge ? 'Save Changes' : `Add Knowledge${selectedConcepts.length > 1 ? ` (${selectedConcepts.length} concepts)` : ''}`}
        </button>
        <button onClick={() => router.push(`/admin/mentors/${mentorId}/knowledge`)} className="btn btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
