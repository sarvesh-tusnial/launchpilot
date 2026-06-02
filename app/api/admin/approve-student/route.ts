import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import { CLIENT } from '@/client-config'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action')

  if (!userId || !action) return NextResponse.redirect(new URL('/admin/students', req.url))

  const supabase = await createAdminClient()

  if (action === 'approve') {
    // Update status to active
    await supabase.from('profiles').update({ status: 'active' }).eq('id', userId)

    // Assign all 15 competencies — D01 unlocked, rest locked
    const competencyInserts = CLIENT.pathways.map((c, i) => ({
      student_id: userId,
      competency_code: c.code,
      is_unlocked: i === 0,
      is_completed: false,
    }))
    await supabase.from('student_competencies').upsert(competencyInserts, { onConflict: 'student_id,competency_code' })

  } else if (action === 'reject') {
    await supabase.from('profiles').update({ status: 'rejected' }).eq('id', userId)
  }

  return NextResponse.redirect(new URL('/admin/students', req.url))
}
