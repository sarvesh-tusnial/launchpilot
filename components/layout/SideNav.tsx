'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import type { Profile } from '@/types'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/learn', label: 'Learn', icon: '◈' },
  { href: '/quiz', label: 'Quiz', icon: '◎' },
  { href: '/tasks', label: 'Tasks', icon: '◷' },
  { href: '/chat', label: 'Chat with Maya', icon: '◍' },
  { href: '/profile', label: 'Profile', icon: '◉' },
]

interface Props {
  profile: Profile | null
}

export default function SideNav({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '24px 16px',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '8px 12px', marginBottom: '32px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
          Mento<span style={{ color: 'var(--accent2)' }}>gram</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
          PM MBA
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500',
                color: active ? 'var(--text)' : 'var(--text2)',
                background: active ? 'var(--bg3)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px', color: active ? 'var(--accent2)' : 'var(--text3)' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Profile */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
        {profile && (
          <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>
              {profile.full_name || 'PM Student'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
              {profile.domain} Track
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            background: 'transparent', border: 'none',
            color: 'var(--text3)', fontSize: '13px', cursor: 'pointer',
            textAlign: 'left', transition: 'color 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text3)')}
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
