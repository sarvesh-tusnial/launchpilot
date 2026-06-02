import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('student_competencies')
      .select('student_id, competency_code, status, is_completed, competency:competencies(name)')
    return NextResponse.json({ data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
