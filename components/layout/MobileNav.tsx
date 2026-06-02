'use client'
import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = {
  student: [
  ['#maya', 'Mentogram AI'],
  ['#how', 'How It Works'],
  ['#programs', 'Competencies'],
  ['#immersion', 'Immersion'],
  ['#mentors', 'Mentors'],
  ['/finance', '🔵 School of Finance'],
  ['/business', '🟠 School of Business'],
  ['/ai', '🟣 School of AI & Tech'],
  ['/manufacturing', '🟢 School of Manufacturing'],
],
  enterprise: [
    ['#vision', 'The Problem'],
    ['#how', 'How It Works'],
    ['#use-cases', 'Use Cases'],
  ],
}

export default function MobileNav({ page = 'student' }: { page?: 'student' | 'enterprise' }) {
  const [open, setOpen] = useState(false)
  const links = NAV_LINKS[page]
  const accentCol = page === 'enterprise' ? '#60A5FA' : '#FF6A00'

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none',
          background: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          padding: '6px 10px',
          color: '#AAA',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
        className="mob-menu-btn"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: '68px',
          left: 0,
          right: 0,
          background: page === 'enterprise' ? 'rgba(2,8,23,0.98)' : 'rgba(5,5,10,0.98)',
          backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${accentCol}20`,
          padding: '16px 20px 24px',
          zIndex: 199,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}>
          {links.map(([h, l]) => (
            <a key={h} href={h} onClick={() => setOpen(false)}
              style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#AAA', textDecoration: 'none', fontSize: '15px', display: 'block' }}
            >{l}</a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {page === 'enterprise' ? (
              <>
                <Link href="/" onClick={() => setOpen(false)}
                  style={{ padding: '12px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#AAA', textDecoration: 'none', fontSize: '14px' }}
                >← For Students</Link>
                <a href="https://calendly.com/sarvesh-launchpilotschool/" target="_blank" onClick={() => setOpen(false)}
                  style={{ padding: '12px 16px', textAlign: 'center', background: '#60A5FA', borderRadius: '8px', color: '#020817', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}
                >Book a Demo →</a>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}
                  style={{ padding: '12px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#AAA', textDecoration: 'none', fontSize: '14px' }}
                >Sign In</Link>
                <Link href="/apply" onClick={() => setOpen(false)}
                  style={{ padding: '12px 16px', textAlign: 'center', background: '#FF6A00', borderRadius: '8px', color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}
                >Apply Now →</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}