import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { competency_code } = await req.json()
  if (!competency_code) return NextResponse.json({ error: 'competency_code required' }, { status: 400 })

  // Check target exists and is unlocked
  const { data: target } = await supabase
    .from('student_competencies')
    .select('id, status, competency_code')
    .eq('student_id', user.id)
    .eq('competency_code', competency_code)
    .single()

  if (!target) return NextResponse.json({ error: 'Competency not found' }, { status: 404 })
  if (target.status === 'locked') return NextResponse.json({ error: 'Competency is locked' }, { status: 403 })
  if (target.status === 'completed') return NextResponse.json({ error: 'Already completed' }, { status: 400 })

  // Set current active to paused
  await supabase
    .from('student_competencies')
    .update({ status: 'paused' })
    .eq('student_id', user.id)
    .eq('status', 'active')

  // Set target to active
  await supabase
    .from('student_competencies')
    .update({ status: 'active' })
    .eq('student_id', user.id)
    .eq('competency_code', competency_code)

  return NextResponse.json({ ok: true, active: competency_code })
}
