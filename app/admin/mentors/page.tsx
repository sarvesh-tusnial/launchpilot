import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'

export default async function MentorsPage() {
  const { supabase } = await requireAdmin()

  const { data: mentors } = await supabase
    .from('mentors')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: knowledge } = await supabase
    .from('mentor_knowledge')
    .select('mentor_id')

  const knowledgeCount = new Map<string, number>()
  for (const k of knowledge || []) {
    knowledgeCount.set(k.mentor_id, (knowledgeCount.get(k.mentor_id) || 0) + 1)
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Mentors</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
            {mentors?.length || 0} mentors · Maya teaches using their knowledge for linked concepts
          </p>
        </div>
        <Link href="/admin/mentors/new" className="btn btn-primary">+ Add Mentor</Link>
      </div>

      {/* How it works */}
      <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>How mentor knowledge works</div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', margin: 0 }}>
          Each mentor is assigned to specific concepts. You upload their interview transcripts, frameworks, opinions, and career stories. When Maya teaches those concepts, she draws from the mentor's actual thinking — not generic PM advice. Students learn through real expert knowledge.
        </p>
      </div>

      {!mentors?.length ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>👤</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No mentors yet</h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '20px' }}>Add your first mentor to start building a knowledge base</p>
          <Link href="/admin/mentors/new" className="btn btn-primary">Add First Mentor</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mentors.map(mentor => (
            <div key={mentor.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '20px',
              opacity: mentor.is_active ? 1 : 0.4,
            }}>
              {/* Avatar */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                background: mentor.avatar_url ? `url(${mentor.avatar_url}) center/cover` : 'rgba(255,106,0,0.15)',
                border: '2px solid rgba(255,106,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '700', color: 'var(--accent2)',
              }}>
                {!mentor.avatar_url && mentor.name[0]}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>{mentor.name}</span>
                  {!mentor.is_active && <span className="tag tag-gray">Inactive</span>}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '6px' }}>{mentor.title}</div>
                {mentor.domain_expertise?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {mentor.domain_expertise.map((d: string) => (
                      <span key={d} className="tag tag-accent">{d}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Knowledge count */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent2)' }}>
                  {knowledgeCount.get(mentor.id) || 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  knowledge entries
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link href={`/admin/mentors/${mentor.id}/knowledge`} style={{
                  padding: '7px 14px', borderRadius: '7px', fontSize: '13px',
                  background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)',
                  color: 'var(--accent2)', textDecoration: 'none', fontWeight: '500',
                }}>
                  Knowledge →
                </Link>
                <Link href={`/admin/mentors/${mentor.id}/edit`} style={{
                  padding: '7px 14px', borderRadius: '7px', fontSize: '13px',
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
}
