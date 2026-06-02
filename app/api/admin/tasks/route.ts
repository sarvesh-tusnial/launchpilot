import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireAdmin()
  const body = await req.json()

  const { task_type, title, concept_id, difficulty, brief, rubric, is_active } = body

  if (!title || !concept_id || !brief) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      task_type,
      title,
      concept_id,
      difficulty,
      brief,
      rubric,
      is_active,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function GET() {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, concept:concepts(title, slug)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data })
}
