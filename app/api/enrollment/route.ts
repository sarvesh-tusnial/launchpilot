import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { program_id } = await req.json()
  if (!program_id) return NextResponse.json({ error: 'program_id required' }, { status: 400 })

  // Create enrollment record
  await supabase.from('enrollments').upsert({
    student_id: user.id,
    program_id,
  }, { onConflict: 'student_id,program_id' })

  // Set as active program on profile
  await supabase.from('profiles')
    .update({ active_program_id: program_id })
    .eq('id', user.id)

  // Unlock first concept of this program
  const { data: firstConcept } = await supabase
    .from('concepts')
    .select('id')
    .eq('program_id', program_id)
    .order('order_index')
    .limit(1)
    .single()

  if (firstConcept) {
    await supabase.from('student_concepts').upsert({
      student_id: user.id,
      concept_id: firstConcept.id,
      is_unlocked: true,
    }, { onConflict: 'student_id,concept_id' })
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, program:programs(*)')
    .eq('student_id', user.id)

  return NextResponse.json({ enrollments: enrollments || [] })
}
