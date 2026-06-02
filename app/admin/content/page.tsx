import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  mentor_video: 'Mentor Video',
  youtube: 'YouTube',
  article: 'Article',
  pdf: 'PDF / Case Study',
  case_study: 'Case Study',
}

const TYPE_COLORS: Record<string, string> = {
  mentor_video: 'tag-coral',
  youtube: 'tag-coral',
  article: 'tag-teal',
  pdf: 'tag-amber',
  case_study: 'tag-accent',
}

const TYPE_ICONS: Record<string, string> = {
  mentor_video: '🎥',
  youtube: '▶',
  article: '🔗',
  pdf: '📄',
  case_study: '📋',
}

export default async function ContentLibraryPage() {
  const { supabase } = await requireAdmin()

  const { data: content } = await supabase
    .from('content_library')
    .select('*, concept:concepts(title, slug)')
    .order('created_at', { ascending: false })

  const grouped: Record<string, typeof content> = {}
  for (const item of content || []) {
    if (!grouped[item.content_type]) grouped[item.content_type] = []
    grouped[item.content_type]!.push(item)
  }

  const totalActive = (content || []).filter(c => c.is_active).length

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Content Library</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
            {totalActive} active items · Maya surfaces these automatically during lessons
          </p>
        </div>
        <Link href="/admin/content/new" className="btn btn-primary">
          + Add Content
        </Link>
      </div>

      {/* How it works */}
      <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>How Maya uses this</div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', margin: 0 }}>
          When a student is learning a concept, Maya checks this library first. If there's a mentor video, she plays it inline before teaching. If there's an article or case study, she surfaces it as a card mid-conversation. She always uses your content before generating her own examples.
        </p>
      </div>

      {Object.entries(TYPE_LABELS).map(([type, label]) => {
        const items = grouped[type] || []
        return (
          <div key={type} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>{TYPE_ICONS[type]}</span>
              <span className={`tag ${TYPE_COLORS[type]}`}>{label}</span>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>

            {items.length === 0 ? (
              <Link href={`/admin/content/new?type=${type}`} style={{
                display: 'block', padding: '20px',
                background: 'var(--bg2)', border: '1px dashed var(--border)',
                borderRadius: '10px', textAlign: 'center',
                fontSize: '13px', color: 'var(--text3)', textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}>
                + Add your first {label}
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '14px 18px',
                    opacity: item.is_active ? 1 : 0.4,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>{item.title}</span>
                        {!item.is_active && <span className="tag tag-gray">Disabled</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        {(item.concept as any)?.title || 'No concept linked'} 
                        {item.duration_seconds && ` · ${Math.floor(item.duration_seconds / 60)}:${String(item.duration_seconds % 60).padStart(2, '0')}`}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
                          {item.description.slice(0, 100)}...
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <Link href={`/admin/content/${item.id}/edit`} style={{
                        padding: '6px 14px', borderRadius: '7px', fontSize: '13px',
                        background: 'var(--bg3)', border: '1px solid var(--border)',
                        color: 'var(--text2)', textDecoration: 'none',
                      }}>
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
