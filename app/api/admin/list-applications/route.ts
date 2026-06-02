import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    return NextResponse.json({ applications: applications || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
