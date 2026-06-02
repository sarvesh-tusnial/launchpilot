import { requireAdmin } from '@/lib/auth/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

const TYPE_LABELS: Record<string, string> = {
  interview_transcript: 'Interview Transcript',
  framework: 'Framework',
  opinion: 'Opinion / Belief',
  case_study: 'Case Study',
  career_story: 'Career Story',
  mistake: 'Mistake & Lesson',
  advice: 'Advice',
}

const TYPE_COLORS: Record<string, string> = {
  interview_transcript: 'tag-accent',
  framework: 'tag-teal',
  opinion: 'tag-amber',
  case_study: 'tag-coral',
  career_story: 'tag-blue',
  mistake: 'tag-pink',
  advice: 'tag-green',
}

const TYPE_ICONS: Record<string, string> = {
  interview_transcript: '🎙️',
  framework: '◈',
  opinion: '💬',
  case_study: '📋',
  career_story: '🏃',
  mistake: '⚠️',
  advice: '💡',
}

export default async function MentorKnowledgePage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [mentorRes, knowledgeRes, conceptsRes] = await Promise.all([
    supabase.from('mentors').select('*').eq('id', id).single(),
    supabase.from('mentor_knowledge')
      .select('*, concept:concepts(title)')
      .eq('mentor_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('concepts').select('id, title, order_index').order('order_index'),
  ])

  if (!mentorRes.data) redirect('/admin/mentors')
  const mentor = mentorRes.data
  const knowledge = knowledgeRes.data || []

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <Link href="/admin/mentors" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
            ← Back to Mentors
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,106,0,0.15)', border: '2px solid rgba(255,106,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '700', color: 'var(--accent2)',
            }}>
              {mentor.name[0]}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.02em' }}>{mentor.name}</h1>
              <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{mentor.title}</div>
            </div>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
            {knowledge.length} knowledge entries · Maya uses these when teaching linked concepts
          </p>
        </div>
        <Link href={`/admin/mentors/${id}/knowledge/new`} className="btn btn-primary">
          + Add Knowledge
        </Link>
      </div>

      {/* Tip */}
      <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '28px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>What to add</div>
        <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7' }}>
          Paste interview transcripts, frameworks, strong opinions, career stories, mistakes and lessons. The more specific and personal the content, the better Maya can teach with it. Generic advice = weak. Real stories with specific details = powerful.
        </div>
      </div>

      {knowledge.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🧠</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No knowledge yet</h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '20px' }}>
            Start by adding an interview transcript or a framework
          </p>
          <Link href={`/admin/mentors/${id}/knowledge/new`} className="btn btn-primary">Add First Entry</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {knowledge.map(entry => (
            <div key={entry.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '18px 20px',
              opacity: entry.is_active ? 1 : 0.4,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>
                  {TYPE_ICONS[entry.knowledge_type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{entry.title}</span>
                    <span className={`tag ${TYPE_COLORS[entry.knowledge_type]}`}>{TYPE_LABELS[entry.knowledge_type]}</span>
                    {!entry.is_active && <span className="tag tag-gray">Disabled</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
                    {(entry.concept as any)?.title || 'All concepts'}
                    {entry.tags?.length > 0 && ` · ${entry.tags.join(', ')}`}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {entry.content}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/admin/mentors/${id}/knowledge/${entry.id}/edit`} style={{
                    padding: '6px 14px', borderRadius: '7px', fontSize: '13px',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: 'var(--text2)', textDecoration: 'none',
                  }}>
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
