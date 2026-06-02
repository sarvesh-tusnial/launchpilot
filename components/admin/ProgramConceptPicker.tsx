'use client'

interface Program {
  id: string
  slug: string
  title: string
}

interface Concept {
  id: string
  title: string
  slug: string
  phase: number
  program_id: string
}

interface Props {
  programs: Program[]
  concepts: Concept[]
  selectedConceptId: string
  onChange: (conceptId: string) => void
  label?: string
  hint?: string
  required?: boolean
  allowNone?: boolean
  noneLabel?: string
}

const PROGRAM_CONFIG: Record<string, { color: string; emoji: string }> = {
  'pm-mba':              { color: '#FF6A00', emoji: '📦' },
  'ai-agents':           { color: '#60A5FA', emoji: '🤖' },
  'reach-distribution':  { color: '#34D399', emoji: '📡' },
  'automation-nocode':   { color: '#F97066', emoji: '⚡' },
  'strategy-leadership': { color: '#A78BFA', emoji: '♟️' },
  'growth':              { color: '#F59E0B', emoji: '📈' },
  'cybersecurity':       { color: '#FB7185', emoji: '🔐' },
  'marketing':           { color: '#34D399', emoji: '📣' },
  'finance':             { color: '#FB923C', emoji: '💰' },
}

function shortTitle(title: string) {
  return title.replace(/ MBA$/i, '')
}

import { useState, useEffect } from 'react'

export default function ProgramConceptPicker({
  programs, concepts, selectedConceptId, onChange,
  label, hint, required, allowNone, noneLabel,
}: Props) {
  // Derive selected program from selected concept
  const selectedConcept = concepts.find(c => c.id === selectedConceptId)
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    selectedConcept?.program_id || ''
  )

  useEffect(() => {
    const c = concepts.find(c => c.id === selectedConceptId)
    if (c) setSelectedProgramId(c.program_id)
  }, [selectedConceptId])

  const programConcepts = concepts.filter(c => c.program_id === selectedProgramId)
  const selectedProgram = programs.find(p => p.id === selectedProgramId)
  const cfg = selectedProgram ? (PROGRAM_CONFIG[selectedProgram.slug] || { color: '#FF6A00', emoji: '🎓' }) : null

  const phaseLabel: Record<number, string> = { 1: 'Phase 1', 2: 'Phase 2', 3: 'Phase 3' }

  const handleProgramChange = (programId: string) => {
    setSelectedProgramId(programId)
    onChange('') // reset concept when program changes
  }

  const selectStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {label && (
        <label style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '500' }}>
          {label} {required && <span style={{ color: 'var(--coral)' }}>*</span>}
        </label>
      )}

      {/* Step 1: Program */}
      <div>
        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Step 1 — Select Program
        </div>
        <select
          value={selectedProgramId}
          onChange={e => handleProgramChange(e.target.value)}
          style={{
            ...selectStyle,
            borderColor: selectedProgramId && cfg ? cfg.color + '40' : 'var(--border)',
            color: selectedProgramId ? 'var(--text)' : 'var(--text3)',
          }}
        >
          <option value="">Select a program...</option>
          {programs.map(p => {
            const pcfg = PROGRAM_CONFIG[p.slug] || { emoji: '🎓', color: '#FF6A00' }
            return (
              <option key={p.id} value={p.id}>
                {pcfg.emoji} {shortTitle(p.title)}
              </option>
            )
          })}
        </select>
      </div>

      {/* Step 2: Concept — only shown after program selected */}
      {selectedProgramId && (
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: cfg?.color || 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            Step 2 — Select Concept within {cfg?.emoji} {shortTitle(selectedProgram?.title || '')}
          </div>
          <select
            value={selectedConceptId}
            onChange={e => onChange(e.target.value)}
            style={{
              ...selectStyle,
              borderColor: selectedConceptId ? (cfg?.color || 'var(--accent)') + '40' : 'var(--border)',
            }}
          >
            <option value="">{allowNone ? (noneLabel || 'All concepts (always available)') : 'Select a concept...'}</option>
            {[1, 2, 3].map(phase => {
              const phaseConcepts = programConcepts.filter(c => c.phase === phase)
              if (phaseConcepts.length === 0) return null
              return (
                <optgroup key={phase} label={`${phaseLabel[phase]}`}>
                  {phaseConcepts.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </optgroup>
              )
            })}
          </select>
          {programConcepts.length === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>
              No concepts found for this program.
            </div>
          )}
        </div>
      )}

      {hint && (
        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{hint}</div>
      )}
    </div>
  )
}
