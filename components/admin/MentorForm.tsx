'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Competency { code: string; name: string; school: string }
interface Concept { id: string; title: string; sequence: number; competency_code: string }
interface Props {
  competencies: Competency[]
  concepts: Concept[]
  mentor?: any
}


const PATHWAYS_PREFIX = 'P'
const BUBBLER_CODES   = new Set(['B01', 'B02', 'B03', 'B04'])

function schoolFromCode(code: string): string {
  if (!code) return 'generic'
  if (code.startsWith(PATHWAYS_PREFIX) && code.length === 3) return 'launchpilot'
  if (BUBBLER_CODES.has(code)) return 'bubbler'
  if (code.includes('_')) return code.replace(/_\d+$/, '')
  return 'generic'
}

function schoolLabel(school: string): string {
  if (school === 'launchpilot') return 'LaunchPilot Pathways'
  if (school === 'bubbler') return 'Bubbler Co-Pilot'
  if (school === 'generic') return 'Generic'
  return `Co-Pilot: ${school.charAt(0).toUpperCase() + school.slice(1)}`
}

function schoolColor(school: string): string {
  if (school === 'launchpilot') return '#6C47FF'
  if (school === 'bubbler') return '#7F77DD'
  const colors = ['#1D9E75', '#BA7517', '#D85A30', '#D4537E', '#378ADD', '#639922']
  let hash = 0
  for (let i = 0; i < school.length; i++) hash = school.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}


export default function MentorForm({ competencies, concepts, mentor }: Props) {
  const router = useRouter()
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState('')
  const [name,             setName]             = useState(mentor?.name || '')
  const [title,            setTitle]            = useState(mentor?.title || '')
  const [bio,              setBio]              = useState(mentor?.bio || '')
  const [avatarUrl,        setAvatarUrl]        = useState(mentor?.avatar_url || '')
  const [isActive,         setIsActive]         = useState(mentor?.is_active ?? true)
  const [selectedCompCode, setSelectedCompCode] = useState<string>('')
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])
  const [expandedComp,     setExpandedComp]     = useState<string>('')

  // Group competencies by school
  const grouped: Record<string, Competency[]> = {}
  for (const comp of competencies) {
    if (!comp?.code) continue
    const school = schoolFromCode(comp.code)
    grouped[school].push(comp)
  }

  // Concepts for the currently expanded competency
  const filteredConcepts = concepts
    .filter(c => c.competency_code === expandedComp)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  const toggleConcept = (id: string) => {
    setSelectedConcepts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!name.trim())  { setError('Name is required'); return }
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')

    const payload = {
      name,
      title,
      bio,
      avatar_url:       avatarUrl,
      domain_expertise: [],
      is_active:        isActive,
      concept_ids:      selectedConcepts,
    }

    const url    = mentor ? `/api/admin/mentors/${mentor.id}` : '/api/admin/mentors'
    const method = mentor ? 'PUT' : 'POST'

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)

    if (data.error) {
      setError(data.error)
    } else {
      router.push('/admin/mentors')
      router.refresh()
    }
  }

  const expandedCol = schoolColor(schoolFromCode(expandedComp)) || '#888'
  const expandedCompName = competencies.find(c => c.code === expandedComp)?.name || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Name */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g. Rahul Mathur" />
      </div>

      {/* Title */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title / Role</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="e.g. Former PM at Swiggy · Now at Zepto" />
      </div>

      {/* Bio */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Bio <span style={{ color: 'var(--text3)', fontWeight: '400' }}>(shown to students)</span>
        </label>
        <textarea value={bio} onChange={e => setBio(e.target.value)}
          placeholder="Their background, what they've built, what makes them worth learning from..."
          rows={4}
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
      </div>

      {/* Avatar URL */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Avatar URL <span style={{ color: 'var(--text3)', fontWeight: '400' }}>(optional)</span>
        </label>
        <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="input" placeholder="https://..." />
      </div>

      {/* Concept linker */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Link to Concepts
          {selectedConcepts.length > 0 && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent2)', marginLeft: '8px' }}>
              {selectedConcepts.length} selected
            </span>
          )}
        </label>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
          Select a competency to expand it, then pick the concepts this mentor teaches. You can select concepts from multiple competencies.
        </div>

        {/* Selected concept pills */}
        {selectedConcepts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', padding: '12px', background: 'rgba(255,106,0,0.04)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '10px' }}>
            {selectedConcepts.map(id => {
              const concept = concepts.find(c => c.id === id)
              if (!concept) return null
              const col = schoolColor(schoolFromCode(concept.competency_code)) || '#888'
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', background: `${col}12`, border: `1px solid ${col}30`, fontSize: '11px', color: col }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px' }}>{concept.competency_code}·{String(concept.sequence).padStart(2,'0')}</span>
                  <span>{concept.title.slice(0, 30)}{concept.title.length > 30 ? '...' : ''}</span>
                  <button type="button" onClick={() => toggleConcept(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: col, fontSize: '12px', padding: '0', lineHeight: 1 }}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* School groups */}
        {SCHOOL_ORDER.map(school => {
          const comps = grouped[school]
          if (!comps || comps.length === 0) return null
          const col = schoolColor(school)
          return (
            <div key={school} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: col, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {schoolLabel(school)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {comps.map(comp => {
                  const isExpanded = expandedComp === comp.code
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
              {expandedComp && grouped[school]?.some(c => c.code === expandedComp) && filteredConcepts.length > 0 && (
                <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${expandedCol}20`, borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: expandedCol, fontFamily: 'DM Mono, monospace', marginBottom: '10px' }}>
                    {expandedComp} — {expandedCompName} — select concepts (multi-select)
                  </div>
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
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{isActive ? "Active — Maya uses this mentor's knowledge" : 'Inactive'}</span>
      </div>

      {error && (
        <div style={{ background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--coral)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', paddingBottom: '40px' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : mentor ? 'Save Changes' : 'Create Mentor'}
        </button>
        <button onClick={() => router.push('/admin/mentors')} className="btn btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
