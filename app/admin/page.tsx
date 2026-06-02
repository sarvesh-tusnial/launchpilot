import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

export default async function AdminPage() {
  const { supabase } = await requireAdmin()

  const [studentsRes, pendingRes, mentorsRes, contentRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', false).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', false).eq('status', 'pending'),
    supabase.from('mentors').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('content_library').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const stats = [
    { label: 'Active Students',   value: studentsRes.count || 0,  color: 'var(--accent)',  href: '/admin/students' },
    { label: 'Pending Approval',  value: pendingRes.count || 0,   color: 'var(--amber)',   href: '/admin/students' },
    { label: 'Active Mentors',    value: mentorsRes.count || 0,   color: 'var(--teal)',    href: '/admin/mentors' },
    { label: 'Content Items',     value: contentRes.count || 0,   color: 'var(--green)',   href: '/admin/content' },
  ]

  const quickLinks = [
    { href: '/admin/students',  label: 'Manage Students',    desc: 'Approve new employees, track progress' },
    { href: '/admin/mentors',   label: 'Add Mentors',        desc: 'Add internal experts and their knowledge' },
    { href: '/admin/content',   label: 'Upload Content',     desc: 'Add videos, articles, PDFs for Maya to use' },
    { href: '/admin/concepts',  label: 'Edit Curriculum',    desc: 'Review and edit the 300 concept titles' },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Decathlon Learning
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Admin Overview</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
        Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{l.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
