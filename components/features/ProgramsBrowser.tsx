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
  target_audience: string
}

interface Props {
  allPrograms: Program[]
  enrolledProgramIds: string[]
  activeProgramId: string
}

const PROGRAM_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  'pm-mba':              { color: '#FF6A00', bg: 'rgba(255,106,0,0.06)',   border: 'rgba(255,106,0,0.2)',   emoji: '📦' },
  'ai-agents':           { color: '#60A5FA', bg: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.2)',  emoji: '🤖' },
  'reach-distribution':  { color: '#34D399', bg: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.2)',  emoji: '📡' },
  'automation-nocode':   { color: '#F97066', bg: 'rgba(249,112,102,0.06)', border: 'rgba(249,112,102,0.2)', emoji: '⚡' },
  'strategy-leadership': { color: '#A78BFA', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)', emoji: '♟️' },
  'growth':              { color: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)',  emoji: '📈' },
  'cybersecurity':       { color: '#FB7185', bg: 'rgba(251,113,133,0.06)', border: 'rgba(251,113,133,0.2)', emoji: '🔐' },
  'marketing':           { color: '#FB7185', bg: 'rgba(251,113,133,0.06)', border: 'rgba(251,113,133,0.2)', emoji: '📣' },
  'finance':             { color: '#FB923C', bg: 'rgba(251,146,60,0.06)',  border: 'rgba(251,146,60,0.2)',  emoji: '💰' },
}

function getCfg(slug: string) {
  return PROGRAM_CONFIG[slug] || PROGRAM_CONFIG['pm-mba']
}

function shortTitle(title: string) {
  return title.replace(/ MBA$/i, '').replace(/ MBA /i, ' ')
}

export default function ProgramsBrowser({ allPrograms, enrolledProgramIds, activeProgramId }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const enrolledIds = new Set(enrolledProgramIds)

  const handleSwitch = async (program: Program) => {
    if (loading || program.id === activeProgramId) return
    setLoading(program.id)
    await fetch('/api/switch-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: program.id }),
    })
    router.push('/dashboard')
    router.refresh()
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
  }

  const live = allPrograms.filter(p => p.is_active)
  const soon = allPrograms.filter(p => !p.is_active)

  return (
    <div style={{ maxWidth: '900px', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
          All Programs
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '8px' }}>
          Mentogram MBA Programs
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>
          One account gives you access to every live program. Switch between them anytime from this page or the header.
        </p>
      </div>

      {/* Live programs */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
          Live · {live.length} programs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {live.map(program => {
            const cfg = getCfg(program.slug)
            const isActive = program.id === activeProgramId
            const isEnrolled = enrolledIds.has(program.id)
            const isLoading = loading === program.id

            return (
              <div
                key={program.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', borderRadius: '12px', gap: '16px',
                  background: isActive ? cfg.bg : 'var(--bg2)',
                  border: `1px solid ${isActive ? cfg.border : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                    {cfg.emoji}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: isActive ? cfg.color : 'var(--text)' }}>
                        {program.title}
                      </span>
                      {isActive && (
                        <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, textTransform: 'uppercase' }}>
                          Active
                        </span>
                      )}
                      {isEnrolled && !isActive && (
                        <span style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', padding: '2px 8px', borderRadius: '100px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: 'var(--teal)', textTransform: 'uppercase' }}>
                          Enrolled
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{program.tagline}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
                      {program.phase_1_label} · {program.phase_2_label} · {program.phase_3_label}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div style={{ flexShrink: 0 }}>
                  {isActive ? (
                    <div style={{ fontSize: '13px', color: cfg.color, fontFamily: 'DM Mono, monospace' }}>← viewing now</div>
                  ) : isEnrolled ? (
                    <button
                      onClick={() => handleSwitch(program)}
                      disabled={!!loading}
                      style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {isLoading ? '...' : 'Switch →'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(program)}
                      disabled={!!loading}
                      style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {isLoading ? '...' : 'Enroll & Switch →'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Coming soon */}
      {soon.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
            Coming Soon · {soon.length} programs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {soon.map(program => {
              const cfg = getCfg(program.slug)
              return (
                <div
                  key={program.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderRadius: '12px', gap: '16px',
                    background: 'var(--bg2)', border: '1px solid var(--border)', opacity: 0.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {cfg.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>{program.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{program.tagline}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', padding: '4px 12px', borderRadius: '100px', border: '1px solid var(--border)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
                    Coming Soon
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
