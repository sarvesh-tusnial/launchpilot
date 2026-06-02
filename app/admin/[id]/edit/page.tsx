import { requireAdmin } from '@/lib/auth/admin'
import ContentForm from '@/components/admin/ContentForm'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [contentRes, conceptsRes, programsRes] = await Promise.all([
    supabase.from('content_library').select('*').eq('id', id).single(),
    supabase.from('concepts').select('id, title, slug, phase, program_id').order('order_index'),
    supabase.from('programs').select('id, slug, title').order('order_index'),
  ])

  if (!contentRes.data) redirect('/admin/content')

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin · Content Library
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Edit Content</h1>
      </div>
      <ContentForm
        concepts={(conceptsRes.data || []) as any}
        competencies={(programsRes.data || []) as any}
        content={contentRes.data}
      />
    </div>
  )
}