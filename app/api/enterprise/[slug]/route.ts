import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('copilot_enterprise_profiles')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ company: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
