'use client'
import { useState } from 'react'
import Link from 'next/link'

const SCHOOLS = [
  {
    href: '/finance',
    name: 'School of Finance',
    desc: 'VC · IB · FinTech · Financial Modelling',
    col: '#1D4ED8',
    bg: 'rgba(29,78,216,0.08)',
    border: 'rgba(29,78,216,0.2)',
    dot: '#60A5FA',
  },
  {
    href: '/business',
    name: 'School of Business',
    desc: 'PM · Growth · Strategy · Distribution',
    col: '#FF6A00',
    bg: 'rgba(255,106,0,0.08)',
    border: 'rgba(255,106,0,0.2)',
    dot: '#FF8C00',
  },
  {
    href: '/ai',
    name: 'School of AI & Tech',
    desc: 'AI Agents · Automation · Data · No-Code',
    col: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    dot: '#A78BFA',
  },
  {
    href: '/manufacturing',
    name: 'School of Manufacturing',
    desc: 'Supply Chain · Lean · Industrial AI · Ops',
    col: '#0D9488',
    bg: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.2)',
    dot: '#2DD4BF',
  },
]

export default function SchoolsDropdown() {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '0px 4px',
          color: open ? '#F0EDE6' : '#888',
          fontSize: '13px',
          fontWeight: '500',
          transition: 'color 0.2s',
        }}
      >
        Schools
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            opacity: 0.5,
          }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            background: 'rgba(8,8,16,0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '8px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            zIndex: 300,
          }}
        >
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            background: 'rgba(8,8,16,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            borderRight: 'none',
            rotate: '45deg',
          }} />

          <div style={{ marginBottom: '6px', padding: '6px 10px' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Choose a school
            </span>
          </div>

          {SCHOOLS.map(school => (
            <Link
              key={school.href}
              href={school.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'background 0.15s',
                marginBottom: '2px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = school.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Colour dot */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: school.dot,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '2px' }}>
                  {school.name}
                </div>
                <div style={{ fontSize: '11px', color: '#555', fontFamily: 'DM Mono, monospace', letterSpacing: '0.03em' }}>
                  {school.desc}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#333' }}>→</span>
            </Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '6px', padding: '10px 12px 4px' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#333', letterSpacing: '0.08em' }}>
              More schools launching 2025–2026
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
