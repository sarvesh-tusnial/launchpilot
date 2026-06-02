import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient()

    const { data: students, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, status, job_title, created_at')
      .eq('is_admin', false)
      .order('created_at', { ascending: false })

    return NextResponse.json(
      { students: students || [], error: error?.message },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
