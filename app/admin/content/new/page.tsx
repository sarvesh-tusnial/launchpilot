import { requireAdmin } from '@/lib/auth/admin'
import ContentForm from '@/components/admin/ContentForm'
import { CLIENT } from '@/client-config'

const ALL_COMPETENCIES = CLIENT.pathways
const DECATHLON_CODES = CLIENT.pathways.map(c => c.code)

export default async function NewContentPage() {
  const { supabase } = await requireAdmin()

  const { data: allConcepts } = await supabase
    .from('concepts')
    .select('id, title, sequence, competency_code')
    .in('competency_code', DECATHLON_CODES)
    .order('competency_code').order('sequence')

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
      <ContentForm competencies={ALL_COMPETENCIES} concepts={allConcepts || []} />
    </div>
  )
}
