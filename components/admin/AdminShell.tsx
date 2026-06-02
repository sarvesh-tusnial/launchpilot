'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',               label: 'Overview',         icon: '⬡' },
  { href: '/admin/applications',  label: 'Applications',     icon: '◻' },
  { href: '/admin/students',      label: 'Students',         icon: '◎' },
  { href: '/admin/mentors',       label: 'Mentors',          icon: '◍' },
  { href: '/admin/content',       label: 'Content Library',  icon: '▶' },
  { href: '/admin/tasks',         label: 'Task Library',     icon: '◈' },
  { href: '/admin/concepts',      label: 'Curriculum',       icon: '▦' },
  { href: '/admin/submissions',   label: 'Submissions',      icon: '◷' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: '220px', flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed', top: 0, bottom: 0, left: 0,
      }}>
        <div style={{ marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
            Deca<span style={{ color: 'var(--accent)' }}>thlon</span>
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Admin Panel
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', textDecoration: 'none',
                color: active ? 'var(--text)' : 'var(--text2)',
                background: active ? 'var(--bg3)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ color: active ? 'var(--accent)' : 'var(--text3)' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Link href="/dashboard" style={{
          fontSize: '13px', color: 'var(--text3)', textDecoration: 'none',
          padding: '8px 12px', display: 'block',
        }}>
          ← Back to App
        </Link>
      </aside>

      <main style={{ marginLeft: '220px', flex: 1, padding: '40px 48px', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
