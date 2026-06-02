'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Program {
  id: string
  slug: string
  title: string
  is_active: boolean
  phase_1_label: string
  phase_2_label: string
  phase_3_label: string
}

interface Props {
  allPrograms: Program[]
  enrolledProgramIds: string[]
  activeProgramId: string
  activeProgramSlug: string
  accentColor: string
}

const PROGRAM_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'pm-mba':              { color: '#FF6A00', bg: 'rgba(255,106,0,0.1)',   border: 'rgba(255,106,0,0.3)' },
  'ai-agents':           { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)' },
  'reach-distribution':  { color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)' },
  'automation-nocode':   { color: '#F97066', bg: 'rgba(249,112,102,0.1)', border: 'rgba(249,112,102,0.3)' },
  'strategy-leadership': { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  'growth':              { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
  'cybersecurity':       { color: '#FB7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.3)' },
  'marketing':           { color: '#FB7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.3)' },
  'finance':             { color: '#FB923C', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)' },
}

const PROGRAM_EMOJIS: Record<string, string> = {
  'pm-mba': '📦', 'ai-agents': '🤖', 'reach-distribution': '📡',
  'automation-nocode': '⚡', 'strategy-leadership': '♟️',
  'growth': '📈', 'cybersecurity': '🔐', 'marketing': '📣', 'finance': '💰',
}

function shortTitle(title: string) {
  return title.replace(/ MBA$/i, '').replace(/ MBA /i, ' ')
}

function getColor(slug: string) {
  return PROGRAM_COLORS[slug] || PROGRAM_COLORS['pm-mba']
}

export default function HeaderProgramSwitcher({ allPrograms, enrolledProgramIds, activeProgramId, activeProgramSlug, accentColor }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const enrolledIds = new Set(enrolledProgramIds)

  const handleSwitch = async (program: Program) => {
    if (loading || program.id === activeProgramId) { setOpen(false); return }
    setLoading(program.id)
    await fetch('/api/switch-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: program.id }),
    })
    router.push('/dashboard')
    router.refresh()
    setLoading(null)
    setOpen(false)
  }

  const handleEnroll = async (program: Program) => {
    if (loading) return
    setLoading(program.id)
    await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: program.id }),
    })
    router.push('/dashboard')
    router.refresh()
    setLoading(null)
    setOpen(false)
  }

  const activeProgram = allPrograms.find(p => p.slug === activeProgramSlug)
  const cfg = getColor(activeProgramSlug)

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button — shows current program name */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', fontFamily: 'DM Mono, monospace',
          padding: '4px 10px 4px 8px', borderRadius: '20px', cursor: 'pointer',
          background: open ? cfg.bg : `${accentColor}12`,
          border: `1px solid ${open ? cfg.border : `${accentColor}30`}`,
          color: cfg.color, transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: '13px' }}>{PROGRAM_EMOJIS[activeProgramSlug] || '🎓'}</span>
        {shortTitle(activeProgram?.title || 'Programs')}
        <span style={{ fontSize: '9px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
          />

          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: '300px', zIndex: 100,
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>Switch Program</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                {allPrograms.filter(p => p.is_active).length} live · {allPrograms.filter(p => !p.is_active).length} coming soon
              </div>
            </div>

            {/* Top 3 live programs only */}
            <div style={{ padding: '8px' }}>
              {allPrograms.filter(p => p.is_active).slice(0, 3).map(program => {
                const pcfg = getColor(program.slug)
                const isActive = program.id === activeProgramId
                const isEnrolled = enrolledIds.has(program.id)
                const isLoading = loading === program.id

                return (
                  <div
                    key={program.id}
                    style={{
                      padding: '11px 14px', borderRadius: '10px', marginBottom: '4px',
                      background: isActive ? pcfg.bg : 'transparent',
                      border: `1px solid ${isActive ? pcfg.border : 'transparent'}`,
                      cursor: isActive ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => !isActive && (isEnrolled ? handleSwitch(program) : handleEnroll(program))}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg3)' }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = isActive ? pcfg.bg : 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{PROGRAM_EMOJIS[program.slug] || '🎓'}</span>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: isActive ? pcfg.color : 'var(--text)' }}>
                          {shortTitle(program.title)}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {isActive ? (
                          <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: pcfg.bg, border: `1px solid ${pcfg.border}`, color: pcfg.color, textTransform: 'uppercase' as const }}>Active</span>
                        ) : isLoading ? (
                          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>...</span>
                        ) : isEnrolled ? (
                          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>Switch →</span>
                        ) : (
                          <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', textTransform: 'uppercase' as const }}>Enroll</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Browse all button */}
            <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => { setOpen(false); router.push('/programs') }}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  color: 'var(--text2)', fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                <span>⊞</span> Browse all programs →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
