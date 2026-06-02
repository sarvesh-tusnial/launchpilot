import { createServerSupabaseClient } from '@/lib/db/server'
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('mentor_knowledge')
    .select('*, concept:concepts(title)')
    .eq('mentor_id', id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const body = await req.json()

  const { knowledge_type, title, content, concept_id, is_active } = body

  if (!title?.trim())   return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('mentor_knowledge')
    .insert([{
      mentor_id:      id,
      knowledge_type,
      title,
      content,
      concept_id:     concept_id || null,
      is_active:      is_active ?? true,
    }])
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
