import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data: copilots } = await supabase
      .from('copilot_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return NextResponse.json({ copilots: copilots || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
