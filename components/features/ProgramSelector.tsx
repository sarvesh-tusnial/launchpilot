'use client'

import { useState } from 'react'

interface Program {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  target_audience: string
  phase_1_label: string
  phase_2_label: string
  phase_3_label: string
  order_index: number
}

interface Props {
  programs: Program[]
  onSelect: (program: Program) => void
}

const PROGRAM_META: Record<string, { emoji: string; color: string; concepts: number }> = {
  'pm-mba':    { emoji: '📦', color: '#FF6A00', concepts: 24 },
  'ai-agents': { emoji: '🤖', color: '#60A5FA', concepts: 24 },
}

export default function ProgramSelector({ programs, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleEnroll = async () => {
    if (!selected) return
    setSaving(true)
    const program = programs.find(p => p.id === selected)!

    await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: selected }),
    })

    onSelect(program)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
          Mento<span style={{ color: 'var(--accent2)' }}>gram</span>
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          AI-Native University
        </div>
      </div>

      <div style={{ maxWidth: '640px', width: '100%' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Choose your program
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text2)', textAlign: 'center', marginBottom: '36px', lineHeight: '1.6' }}>
          You'll have a personal AI mentor, Maya, guiding you through every concept.
          Pick the program you want to start with.
        </p>

        {/* Program cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {programs.map(program => {
            const meta = PROGRAM_META[program.slug] || { emoji: '🎓', color: '#FF6A00', concepts: 24 }
            const isSelected = selected === program.id

            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                style={{
                  textAlign: 'left', padding: '20px 22px',
                  borderRadius: '14px', cursor: 'pointer',
                  border: `2px solid ${isSelected ? meta.color : 'var(--border)'}`,
                  background: isSelected ? `${meta.color}12` : 'var(--bg2)',
                  transition: 'all 0.2s', position: 'relative',
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: '18px', right: '18px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: '#000', fontWeight: '700',
                  }}>
                    ✓
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Emoji icon */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                    background: `${meta.color}20`,
                    border: `1px solid ${meta.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {meta.emoji}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '17px', fontWeight: '700', color: isSelected ? meta.color : 'var(--text)' }}>
                        {program.title}
                      </span>
                      {program.slug === 'pm-mba' && (
                        <span style={{
                          fontSize: '10px', fontFamily: 'DM Mono, monospace',
                          padding: '2px 8px', borderRadius: '4px',
                          background: 'rgba(74,222,128,0.15)',
                          border: '1px solid rgba(74,222,128,0.3)',
                          color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>
                          Live
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text2)', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                      {program.tagline}
                    </p>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Concepts', value: `${meta.concepts}` },
                        { label: 'Phases', value: `${program.phase_1_label} · ${program.phase_2_label} · ${program.phase_3_label}` },
                        { label: 'Format', value: '180 min/concept' },
                      ].map(stat => (
                        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {stat.label}:
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '500' }}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target audience */}
                {isSelected && (
                  <div style={{
                    marginTop: '14px', padding: '10px 14px',
                    background: `${meta.color}10`,
                    border: `1px solid ${meta.color}25`,
                    borderRadius: '8px',
                    fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6',
                  }}>
                    <span style={{ color: meta.color, fontWeight: '600' }}>For: </span>
                    {program.target_audience}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <button
          onClick={handleEnroll}
          disabled={!selected || saving}
          style={{
            width: '100%', padding: '16px',
            borderRadius: '12px', border: 'none',
            background: selected ? 'var(--accent)' : 'var(--bg4)',
            color: selected ? '#000' : 'var(--text3)',
            fontSize: '16px', fontWeight: '700',
            cursor: selected ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Enrolling...' : selected ? `Start ${programs.find(p => p.id === selected)?.title} →` : 'Select a program to continue'}
        </button>

        <p style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', marginTop: '16px' }}>
          You can enroll in more programs later from your profile.
        </p>
      </div>
    </div>
  )
}
