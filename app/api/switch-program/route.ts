import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { program_id } = await req.json()
  if (!program_id) return NextResponse.json({ error: 'program_id required' }, { status: 400 })

  const { data: enrollment } = await supabase
    .from('enrollments').select('id')
    .eq('student_id', user.id).eq('program_id', program_id).single()

  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  await supabase.from('profiles')
    .update({ active_program_id: program_id }).eq('id', user.id)

  return NextResponse.json({ success: true })
}
