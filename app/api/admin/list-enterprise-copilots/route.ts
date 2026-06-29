import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('copilot_enterprise_profiles')
      .select('id, slug, company_name, industry, email, is_active, created_at, track_1_code, track_2_code, track_3_code, track_4_code, track_5_code, track_6_code')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ copilots: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
