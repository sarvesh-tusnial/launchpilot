'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CLIENT } from '@/client-config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ALL_COMPETENCIES = CLIENT.pathways

type Concept = { id: string; title: string; sequence: number; competency_code: string }

export default function ConceptsEditorPage() {
  const [selectedCode, setSelectedCode]   = useState(ALL_COMPETENCIES[0].code)
  const [concepts, setConcepts]           = useState<Concept[]>([])
  const [loading, setLoading]             = useState(false)
  const [search, setSearch]               = useState('')
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editTitle, setEditTitle]         = useState('')
  const [newTitle, setNewTitle]           = useState('')
  const [saving, setSaving]               = useState(false)

  const selectedComp = ALL_COMPETENCIES.find(c => c.code === selectedCode)!

  const fetchConcepts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('concepts')
      .select('*')
      .eq('competency_code', selectedCode)
      .order('sequence')
    setConcepts(data || [])
    setLoading(false)
  }, [selectedCode])

  useEffect(() => { fetchConcepts() }, [fetchConcepts])

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return
    setSaving(true)
    await supabase.from('concepts').update({ title: editTitle.trim() }).eq('id', id)
    setSaving(false)
    setEditingId(null)
    fetchConcepts()
  }

  const addConcept = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    const nextSeq = concepts.length > 0 ? Math.max(...concepts.map(c => c.sequence)) + 1 : 1
    await supabase.from('concepts').insert({ title: newTitle.trim(), sequence: nextSeq, competency_code: selectedCode })
    setNewTitle('')
    setSaving(false)
    fetchConcepts()
  }

  const deleteConcept = async (id: string) => {
    if (!confirm('Delete this concept?')) return
    await supabase.from('concepts').delete().eq('id', id)
    fetchConcepts()
  }

  const filtered = concepts.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: 'calc(100vh - 80px)', margin: '-40px -48px' }}>

      {/* Left sidebar — competency list */}
      <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '24px 16px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', padding: '0 8px' }}>
          15 Competencies
        </div>
        {ALL_COMPETENCIES.map(c => (
          <button key={c.code} onClick={() => setSelectedCode(c.code)} style={{
            width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
            background: selectedCode === c.code ? 'var(--bg3)' : 'transparent',
            border: selectedCode === c.code ? '1px solid var(--border)' : '1px solid transparent',
            color: selectedCode === c.code ? 'var(--text)' : 'var(--text2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px',
          }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: selectedCode === c.code ? 'var(--accent)' : 'var(--text3)', flexShrink: 0, width: '28px' }}>{c.code}</span>
            <span style={{ fontSize: '13px', lineHeight: '1.3' }}>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Right — concepts list */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent)', background: 'rgba(0,130,195,0.1)', border: '1px solid rgba(0,130,195,0.2)', padding: '3px 10px', borderRadius: '100px' }}>{selectedCode}</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{selectedComp.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{concepts.length} concepts · Each taught through 8 stages · ~180 min per concept</p>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search concepts..." style={{
            padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)',
            color: 'var(--text)', fontSize: '13px', outline: 'none', width: '220px', flexShrink: 0,
          }} />
        </div>

        {/* Concept list */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '8px' }}>No concepts yet for {selectedCode}</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Add the first one below</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
            {filtered.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text3)', flexShrink: 0, width: '24px' }}>{String(c.sequence).padStart(2, '0')}</span>
                {editingId === c.id ? (
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(c.id); if (e.key === 'Escape') setEditingId(null) }}
                    autoFocus style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--accent)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
                ) : (
                  <span style={{ flex: 1, fontSize: '14px', color: 'var(--text)' }}>{c.title}</span>
                )}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {editingId === c.id ? (
                    <>
                      <button onClick={() => saveEdit(c.id)} disabled={saving} style={{ padding: '5px 12px', borderRadius: '6px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '5px 12px', borderRadius: '6px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(c.id); setEditTitle(c.title) }} style={{ padding: '5px 12px', borderRadius: '6px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteConcept(c.id)} style={{ padding: '5px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(249,112,102,0.3)', color: '#F97066', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new concept */}
        <div style={{ display: 'flex', gap: '10px', padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addConcept()}
            placeholder={`Add a new concept to ${selectedComp.name}...`}
            style={{ flex: 1, padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
          <button onClick={addConcept} disabled={saving || !newTitle.trim()} style={{
            padding: '9px 20px', borderRadius: '8px', background: 'var(--accent)', border: 'none',
            color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: saving || !newTitle.trim() ? 0.5 : 1,
          }}>
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}
