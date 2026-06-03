import { requireAdmin } from '@/lib/auth/admin'
import ContentForm from '@/components/admin/ContentForm'

export default async function NewContentPage() {
  const { supabase } = await requireAdmin()

  // Fetch ALL competencies from DB — pathways + copilot tracks
  const [competenciesRes, conceptsRes] = await Promise.all([
    supabase.from('competencies').select('code, name').order('order_index'),
    supabase.from('concepts').select('id, title, sequence, competency_code').order('competency_code').order('sequence'),
  ])

  const allCompetencies = (competenciesRes.data || []).map(c => ({
    code: c.code,
    name: c.name,
    school: 'launchpilot',
  }))

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin · Content Library
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Add Content</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '4px' }}>
          Maya will surface this automatically when teaching the linked concept.
        </p>
      </div>
      <ContentForm competencies={allCompetencies} concepts={conceptsRes.data || []} />
    </div>
  )
}
