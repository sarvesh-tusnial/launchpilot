import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('student_concepts')
      .select('student_id, concept_id, is_completed, stage')
    return NextResponse.json({ data: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
