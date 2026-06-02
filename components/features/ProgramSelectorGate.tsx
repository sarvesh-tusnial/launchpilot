'use client'

import { useState } from 'react'
import ProgramSelector from './ProgramSelector'

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
}

export default function ProgramSelectorGate({ programs }: Props) {
  const [enrolled, setEnrolled] = useState(false)

  const handleSelect = (program: Program) => {
    // Reload the page — dashboard will now find active_program_id
    window.location.reload()
  }

  return (
    <ProgramSelector
      programs={programs}
      onSelect={handleSelect}
    />
  )
}
