import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { concept_id, score, verdict, strengths, gaps, fix } = await req.json()
  if (!concept_id || !score || !verdict) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

 const { error } = await supabase.from('submissions').insert({
  student_id:    user.id,
  concept_id,
  score,
  verdict,
  feedback_items: { strengths, gaps, fix },
  evaluated_at:  new Date().toISOString(),
})

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}