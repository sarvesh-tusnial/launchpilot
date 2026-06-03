import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createAdminClient()
    const { data: copilot, error } = await supabase
      .from('copilot_profiles')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (error || !copilot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ copilot })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
