'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CLIENT } from '@/client-config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Competency = { code: string; name: string; group: string }
type Concept = { id: string; title: string; sequence: number; competency_code: string }

export default function ConceptsEditorPage() {
  const [allCompetencies, setAllCompetencies] = useState<Competency[]>([])
  const [selectedCode, setSelectedCode]   = useState('')
  const [concepts, setConcepts]           = useState<Concept[]>([])
  const [loading, setLoading]             = useState(false)
  const [loadingComps, setLoadingComps]   = useState(true)
  const [search, setSearch]               = useState('')
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editTitle, setEditTitle]         = useState('')
  const [newTitle, setNewTitle]           = useState('')
  const [saving, setSaving]               = useState(false)

  // Load all competencies — pathways + copilot tracks
  useEffect(() => {
    const load = async () => {
      setLoadingComps(true)
      const { data } = await supabase
        .from('competencies')
        .select('code, name, order_index')
        .order('order_index')

      const pathwayCodes = new Set(CLIENT.pathways.map((p: any) => p.code))
      const bubblerCodes = new Set(['B01', 'B02', 'B03', 'B04'])

      const comps: Competency[] = []

      // Group 1 — LaunchPilot pathways
      CLIENT.pathways.forEach((p: any) => {
        comps.push({ code: p.code, name: p.name, group: 'LaunchPilot Pathways' })
      })

      // Group 2 — Bubbler tracks
      const bubblerTracks = (data || []).filter((c: any) => bubblerCodes.has(c.code))
      if (bubblerTracks.length > 0) {
        bubblerTracks.forEach((c: any) => {
          comps.push({ code: c.code, name: c.name, group: 'Bubbler Co-Pilot' })
        })
      }

      // Group 3 — Other copilot tracks (not pathways, not bubbler)
      const copilotTracks = (data || []).filter((c: any) =>
        !pathwayCodes.has(c.code) && !bubblerCodes.has(c.code)
      )
      // Group by slug prefix
      const groups: Record<string, any[]> = {}
      copilotTracks.forEach((c: any) => {
        const prefix = c.code.replace(/_\d+$/, '')
        if (!groups[prefix]) groups[prefix] = []
        groups[prefix].push(c)
      })
      Object.entries(groups).forEach(([prefix, tracks]) => {
        tracks.forEach((c: any) => {
          comps.push({ code: c.code, name: c.name, group: `Co-Pilot: ${prefix}` })
        })
      })

      setAllCompetencies(comps)
      if (comps.length > 0) setSelectedCode(comps[0].code)
      setLoadingComps(false)
    }
    load()
  }, [])

  const selectedComp = allCompetencies.find(c => c.code === selectedCode)

  const fetchConcepts = useCallback(async () => {
    if (!selectedCode) return
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

  // Group competencies for sidebar display
  const groups: Record<string, Competency[]> = {}
  allCompetencies.forEach(c => {
    if (!groups[c.group]) groups[c.group] = []
    groups[c.group].push(c)
  })

  if (loadingComps) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>Loading curriculum...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: 'calc(100vh - 80px)', margin: '-40px -48px' }}>

      {/* Left sidebar */}
      <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '20px 12px', overflowY: 'auto' }}>
        {Object.entries(groups).map(([group, comps]) => (
          <div key={group} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 8px', marginBottom: '4px' }}>
              {group}
            </div>
            {comps.map(c => (
              <button key={c.code} onClick={() => setSelectedCode(c.code)} style={{
                width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '7px',
                background: selectedCode === c.code ? 'var(--bg3)' : 'transparent',
                border: selectedCode === c.code ? '1px solid var(--border)' : '1px solid transparent',
                color: selectedCode === c.code ? 'var(--text)' : 'var(--text2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px',
              }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: selectedCode === c.code ? 'var(--accent)' : 'var(--text3)', flexShrink: 0, width: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.code}</span>
                <span style={{ fontSize: '12px', lineHeight: '1.3' }}>{c.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right — concepts */}
      <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent)', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', padding: '3px 10px', borderRadius: '100px' }}>{selectedCode}</span>
              <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{selectedComp?.group}</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '2px' }}>{selectedComp?.name}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{concepts.length} concepts</p>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search concepts..."
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '200px', flexShrink: 0 }} />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text3)' }}>No concepts yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
            {filtered.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '9px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text3)', flexShrink: 0, width: '22px' }}>{String(c.sequence).padStart(2, '0')}</span>
                {editingId === c.id ? (
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(c.id); if (e.key === 'Escape') setEditingId(null) }}
                    autoFocus style={{ flex: 1, padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--accent)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
                ) : (
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{c.title}</span>
                )}
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  {editingId === c.id ? (
                    <>
                      <button onClick={() => saveEdit(c.id)} disabled={saving} style={{ padding: '4px 10px', borderRadius: '5px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 10px', borderRadius: '5px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(c.id); setEditTitle(c.title) }} style={{ padding: '4px 10px', borderRadius: '5px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteConcept(c.id)} style={{ padding: '4px 10px', borderRadius: '5px', background: 'transparent', border: '1px solid rgba(249,112,102,0.3)', color: '#F97066', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add concept */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addConcept()}
            placeholder={`Add concept to ${selectedComp?.name || selectedCode}...`}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
          <button onClick={addConcept} disabled={saving || !newTitle.trim()} style={{ padding: '8px 18px', borderRadius: '7px', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving || !newTitle.trim() ? 0.5 : 1 }}>
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}
