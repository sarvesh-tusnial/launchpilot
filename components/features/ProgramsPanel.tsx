'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Program {
  id: string
  slug: string
  title: string
  tagline: string
  is_active: boolean
  phase_1_label: string
  phase_2_label: string
  phase_3_label: string
}

interface Enrollment { program_id: string }

interface Props {
  allPrograms: Program[]
  enrollments: Enrollment[]
  activeProgramSlug: string
  programColors: Record<string, { color: string; bgColor: string; borderColor: string }>
}

const PROGRAM_EMOJIS: Record<string, string> = {
  'pm-mba':    '📦',
  'ai-agents': '🤖',
  'growth':    '📈',
  'cybersecurity': '🔐',
  'quant':     '📊',
  'marketing': '📣',
  'finance':   '💰',
}

export default function ProgramsPanel({ allPrograms, enrollments, activeProgramSlug, programColors }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const enrolledIds = new Set(enrollments.map(e => e.program_id))

  const handleEnroll = async (program: Program) => {
    if (loading) return
    setLoading(program.id)

    await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: program.id }),
    })

    router.push(`/learn?program=${program.slug}`)
    router.refresh()
    setLoading(null)
    setOpen(false)
  }

  const handleSwitch = async (program: Program) => {
    if (loading) return
    setLoading(program.id)

    await fetch('/api/switch-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: program.id }),
    })

    router.push(`/learn?program=${program.slug}`)
    router.refresh()
    setLoading(null)
    setOpen(false)
  }

  const activeConfig = programColors[activeProgramSlug] || programColors['pm-mba']

  return (
    <div style={{ marginBottom: '28px' }}>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', fontWeight: '600',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          border: `1px solid ${open ? activeConfig.borderColor : 'var(--border)'}`,
          background: open ? activeConfig.bgColor : 'var(--bg2)',
          color: open ? activeConfig.color : 'var(--text2)',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: '16px' }}>⊞</span>
        All Programs
        <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '2px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          marginTop: '12px',
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>Mentogram MBA Programs</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>Enroll in any live program. Switch between them anytime.</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✕</button>
          </div>

          {/* Programs grid */}
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {allPrograms.map(program => {
              const cfg = programColors[program.slug] || { color: '#FF6A00', bgColor: 'rgba(255,106,0,0.06)', borderColor: 'rgba(255,106,0,0.25)' }
              const isEnrolled = enrolledIds.has(program.id)
              const isActive = program.slug === activeProgramSlug
              const isLive = program.is_active
              const isLoading = loading === program.id
              const emoji = PROGRAM_EMOJIS[program.slug] || '🎓'

              return (
                <div
                  key={program.id}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${isActive ? cfg.borderColor : 'var(--border)'}`,
                    background: isActive ? cfg.bgColor : 'var(--bg)',
                    opacity: !isLive ? 0.5 : 1,
                    position: 'relative',
                  }}
                >
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {isActive ? (
                      <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: cfg.bgColor, border: `1px solid ${cfg.borderColor}`, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current</span>
                    ) : isEnrolled ? (
                      <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enrolled</span>
                    ) : isLive ? (
                      <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
                    ) : (
                      <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Soon</span>
                    )}
                  </div>

                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>{emoji}</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: isActive ? cfg.color : 'var(--text)', marginBottom: '4px' }}>{program.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '12px', lineHeight: '1.4' }}>
                    {program.phase_1_label} · {program.phase_2_label} · {program.phase_3_label}
                  </div>

                  {/* Action button */}
                  {isActive ? (
                    <div style={{ fontSize: '12px', color: cfg.color, fontFamily: 'DM Mono, monospace' }}>← currently viewing</div>
                  ) : isEnrolled && isLive ? (
                    <button
                      onClick={() => handleSwitch(program)}
                      disabled={!!loading}
                      style={{ width: '100%', padding: '8px', borderRadius: '7px', border: `1px solid ${cfg.borderColor}`, background: cfg.bgColor, color: cfg.color, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {isLoading ? 'Switching...' : 'Switch to this →'}
                    </button>
                  ) : isLive ? (
                    <button
                      onClick={() => handleEnroll(program)}
                      disabled={!!loading}
                      style={{ width: '100%', padding: '8px', borderRadius: '7px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {isLoading ? 'Enrolling...' : 'Enroll & Switch →'}
                    </button>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>Coming soon</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
