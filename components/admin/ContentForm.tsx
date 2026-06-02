'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Competency { code: string; name: string; school: string }
interface Concept { id: string; title: string; sequence: number; competency_code: string }
interface Props {
  competencies: Competency[]
  concepts: Concept[]
  content?: any
}

const CONTENT_TYPES = [
  { value: 'mentor_video', label: 'Mentor Video',    desc: 'Upload your own recorded video',  icon: '🎥' },
  { value: 'youtube',      label: 'YouTube Video',   desc: 'Paste a YouTube link',            icon: '▶' },
  { value: 'article',      label: 'Article / Blog',  desc: 'Link to an external article',     icon: '🔗' },
  { value: 'case_study',   label: 'Case Study',      desc: 'Upload a PDF case study',         icon: '📋' },
  { value: 'pdf',          label: 'PDF Document',    desc: 'Upload any reference PDF',        icon: '📄' },
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
  if (!code || code.length === 0) return 'generic'
  const c = code[0].toUpperCase()
  if (c === 'B') return 'business'
  if (c === 'F') return 'finance'
  if (c === 'A') return 'ai'
  if (c === 'M') return 'manufacturing'
  return 'generic'
}

export default function ContentForm({ competencies, concepts, content }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving,          setSaving]          = useState(false)
  const [uploading,       setUploading]       = useState(false)
  const [error,           setError]           = useState('')
  const [uploadedPath,    setUploadedPath]    = useState(content?.storage_path || '')
  const [uploadedUrl,     setUploadedUrl]     = useState(content?.url || '')
  const [fileName,        setFileName]        = useState('')
  const [contentType,     setContentType]     = useState(content?.content_type || 'mentor_video')
  const [title,           setTitle]           = useState(content?.title || '')
  const [description,     setDescription]     = useState(content?.description || '')
  const [selectedCompCode,setSelectedCompCode]= useState<string>('')
  const [conceptId,       setConceptId]       = useState(content?.concept_id || '')
  const [url,             setUrl]             = useState(content?.url || '')
  const [duration,        setDuration]        = useState(content?.duration_seconds || '')
  const [thumbnailUrl,    setThumbnailUrl]    = useState(content?.thumbnail_url || '')
  const [isActive,        setIsActive]        = useState(content?.is_active ?? true)

  const needsUpload = contentType === 'mentor_video' || contentType === 'case_study' || contentType === 'pdf'
  const needsUrl    = contentType === 'youtube' || contentType === 'article'

  // Group competencies by school
  const grouped: Record<string, Competency[]> = {
    business: [], finance: [], ai: [], manufacturing: [], generic: [],
  }
  for (const comp of competencies) {
    if (!comp || !comp.code) continue
    const school = schoolFromCode(comp.code)
    grouped[school].push(comp)
  }

  // Concepts for selected competency
  const filteredConcepts = concepts
    .filter(c => c && c.competency_code === selectedCompCode)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  const selectedCol  = SCHOOL_COLS[schoolFromCode(selectedCompCode)] || '#888'
  const selectedComp = competencies.find(c => c.code === selectedCompCode)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    setFileName(file.name)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('contentType', contentType)
    const res  = await fetch('/api/admin/content/upload', { method: 'POST', body: formData })
    const data = await res.json()
    setUploading(false)
    if (data.error) { setError(data.error) } else { setUploadedPath(data.path); setUploadedUrl(data.url) }
  }

  const handleSave = async () => {
    if (!title.trim())                                    { setError('Title is required'); return }
    if (needsUrl && !url.trim())                          { setError('URL is required'); return }
    if (needsUpload && !uploadedPath && !content?.storage_path) { setError('Please upload a file'); return }
    setSaving(true)
    setError('')
    const payload = {
      content_type:    contentType,
      title,
      description,
      concept_id:      conceptId || null,
      url:             needsUrl ? url : uploadedUrl,
      storage_path:    needsUpload ? uploadedPath : null,
      duration_seconds:duration ? Number(duration) : null,
      thumbnail_url:   thumbnailUrl || null,
      is_active:       isActive,
    }
    const res  = await fetch(content ? `/api/admin/content/${content.id}` : '/api/admin/content', { method: content ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (data.error) { setError(data.error) } else { router.push('/admin/content'); router.refresh() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Content Type */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '12px', fontWeight: '500' }}>Content Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CONTENT_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setContentType(t.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', padding: '14px 16px', borderRadius: '10px', border: `1px solid ${contentType === t.value ? 'var(--accent)' : 'var(--border)'}`, background: contentType === t.value ? 'rgba(255,106,0,0.08)' : 'var(--bg3)', cursor: 'pointer', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '20px' }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: contentType === t.value ? 'var(--accent2)' : 'var(--text)' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input"
          placeholder={contentType === 'mentor_video' ? 'e.g. Rahul explains Problem Discovery' : contentType === 'youtube' ? 'e.g. How Notion ships product' : 'e.g. Swiggy Instamart Case Study'} />
      </div>

      {/* Description */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Description <span style={{ color: 'var(--text3)', fontWeight: '400' }}>(shown to student)</span>
        </label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Brief description of what this covers and why it's useful..."
          rows={3}
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
      </div>

      {/* Step 1 — Competency picker */}
      <div>
        <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>Step 1 — Link to Competency</label>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>Select the competency this content belongs to. Then pick the specific concept below.</div>

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
                    <button key={comp.code} type="button"
                      onClick={() => { setSelectedCompCode(comp.code); setConceptId('') }}
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

        {/* None option */}
        <button type="button" onClick={() => { setSelectedCompCode(''); setConceptId('') }}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${!selectedCompCode ? 'var(--accent)' : 'rgba(255,255,255,0.07)'}`, background: !selectedCompCode ? 'rgba(123,92,240,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', fontSize: '12px', color: !selectedCompCode ? 'var(--accent2)' : 'var(--text3)' }}>
          All concepts (always available — no specific concept linked)
        </button>
      </div>

      {/* Step 2 — Concept picker */}
      {selectedCompCode && (
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Step 2 — Select Concept
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: selectedCol, marginLeft: '8px' }}>{selectedCompCode} · {selectedComp?.name}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '12px' }}>{filteredConcepts.length} concepts. Pick which concept surfaces this content.</div>
          {filteredConcepts.length === 0 ? (
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '10px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
              No concepts found for {selectedCompCode}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '300px', overflowY: 'auto', padding: '2px' }}>
              {filteredConcepts.map(concept => {
                const sel = conceptId === concept.id
                return (
                  <button key={concept.id} type="button" onClick={() => setConceptId(concept.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${sel ? selectedCol : 'rgba(255,255,255,0.06)'}`, background: sel ? `${selectedCol}10` : 'rgba(255,255,255,0.02)', cursor: 'pointer', width: '100%' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: sel ? `${selectedCol}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? selectedCol : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '8px', color: sel ? selectedCol : '#555', fontWeight: '700' }}>{String(concept.sequence || 0).padStart(2, '0')}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: sel ? '#F0EDE6' : '#AAA', flex: 1 }}>{concept.title}</div>
                    {sel && <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: selectedCol, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#fff', fontSize: '9px', fontWeight: '900' }}>✓</span></div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* URL for YouTube / Article */}
      {needsUrl && (
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            {contentType === 'youtube' ? 'YouTube URL' : 'Article URL'}
          </label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="input"
            placeholder={contentType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} />
        </div>
      )}

      {/* File upload */}
      {needsUpload && (
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            {contentType === 'mentor_video' ? 'Upload Video File' : 'Upload PDF'}
          </label>
          <input ref={fileRef} type="file" accept={contentType === 'mentor_video' ? 'video/*' : 'application/pdf'} onChange={handleFileUpload} style={{ display: 'none' }} />
          {uploadedPath || content?.storage_path ? (
            <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', color: 'var(--accent2)' }}>✓ {fileName || 'File uploaded'}</div>
              <button type="button" onClick={() => fileRef.current?.click()} style={{ fontSize: '12px', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>Replace</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: '100%', padding: '32px', borderRadius: '10px', border: '2px dashed var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>{contentType === 'mentor_video' ? '🎥' : '📄'}</span>
              <span>{uploading ? 'Uploading...' : `Click to upload ${contentType === 'mentor_video' ? 'video' : 'PDF'}`}</span>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{contentType === 'mentor_video' ? 'MP4, MOV, WebM up to 500MB' : 'PDF up to 50MB'}</span>
            </button>
          )}
        </div>
      )}

      {/* Duration */}
      {(contentType === 'mentor_video' || contentType === 'youtube') && (
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Duration (seconds) <span style={{ color: 'var(--text3)', fontWeight: '400' }}>e.g. 245 for 4:05</span>
          </label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="input" placeholder="245" />
        </div>
      )}

      {/* Thumbnail */}
      {(contentType === 'mentor_video' || contentType === 'youtube') && (
        <div>
          <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Thumbnail URL <span style={{ color: 'var(--text3)', fontWeight: '400' }}>(optional)</span>
          </label>
          <input type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className="input" placeholder="https://... (leave blank for YouTube auto-thumbnail)" />
        </div>
      )}

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={() => setIsActive(!isActive)}
          style={{ width: '44px', height: '24px', borderRadius: '12px', background: isActive ? 'var(--accent)' : 'var(--bg4)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: '3px', left: isActive ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{isActive ? 'Active — Maya will surface this to students' : 'Disabled — Maya will skip this'}</span>
      </div>

      {error && <div style={{ background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--coral)' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', paddingBottom: '40px' }}>
        <button onClick={handleSave} disabled={saving || uploading} className="btn btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : content ? 'Save Changes' : 'Add to Library'}
        </button>
        <button onClick={() => router.push('/admin/content')} className="btn btn-ghost">Cancel</button>
      </div>
    </div>
  )
}
