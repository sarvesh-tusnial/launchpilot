import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

interface Props {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const body = await req.json()

  const { data, error } = await supabase
    .from('tasks')
    .update({
      task_type: body.task_type,
      title: body.title,
      concept_id: body.concept_id,
      difficulty: body.difficulty,
      brief: body.brief,
      rubric: body.rubric,
      is_active: body.is_active,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
