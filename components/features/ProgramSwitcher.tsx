'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Program {
  id: string
  slug: string
  title: string
}

interface Props {
  enrollments: Array<{ program: Program }>
  activeProgramSlug: string
  programColors: Record<string, { color: string; bgColor: string; borderColor: string }>
}

export default function ProgramSwitcher({ enrollments, activeProgramSlug, programColors }: Props) {
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  const handleSwitch = async (program: Program) => {
    if (program.slug === activeProgramSlug || switching) return
    setSwitching(true)

    // Update active program in DB so Maya picks it up
    await fetch('/api/switch-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ program_id: program.id }),
    })

    // Navigate to learn page for this program
    router.push(`/learn?program=${program.slug}`)
    router.refresh()
    setSwitching(false)
  }

  return (
    <div style={{ marginBottom: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginRight: '4px' }}>
        Switch program:
      </div>
      {enrollments.map(({ program }) => {
        if (!program) return null
        const cfg = programColors[program.slug] || programColors['pm-mba']
        const isActive = program.slug === activeProgramSlug
        return (
          <button
            key={program.id}
            onClick={() => handleSwitch(program)}
            disabled={switching}
            style={{
              fontSize: '13px', fontWeight: '600',
              padding: '6px 16px', borderRadius: '8px',
              border: `1px solid ${isActive ? cfg.borderColor : 'var(--border)'}`,
              background: isActive ? cfg.bgColor : 'transparent',
              color: isActive ? cfg.color : 'var(--text2)',
              cursor: switching ? 'wait' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {isActive && switching ? '...' : program.title}
          </button>
        )
      })}
    </div>
  )
}
