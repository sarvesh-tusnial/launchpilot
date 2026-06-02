import { createServerSupabaseClient } from '@/lib/db/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('mentors').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const body = await req.json()

  const { name, title, bio, avatar_url, domain_expertise, is_active, concept_ids } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  // Insert mentor
  const { data: mentor, error } = await supabase
    .from('mentors')
    .insert([{ name, title, bio, avatar_url, domain_expertise, is_active }])
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Link to concepts if provided
  if (concept_ids && concept_ids.length > 0) {
    await supabase
      .from('mentor_knowledge')
      .insert(concept_ids.map((concept_id: string) => ({
        mentor_id: mentor.id,
        concept_id,
        knowledge_type: 'general',
        content: '',
      })))
  }

  return NextResponse.json({ id: mentor.id })
}
