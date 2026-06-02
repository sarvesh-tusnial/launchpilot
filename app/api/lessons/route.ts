import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import { generateLesson } from '@/lib/ai/claude'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conceptId, studentLevel, domain, priorGaps, teachingStrategy } = await req.json()

  // Get concept
  const { data: concept } = await supabase
    .from('concepts')
    .select('*')
    .eq('id', conceptId)
    .single()

  if (!concept) return NextResponse.json({ error: 'Concept not found' }, { status: 404 })

  // Generate lesson via Claude
  const content = await generateLesson({
    concept,
    studentLevel: studentLevel || 1,
    domain: domain || 'B2C',
    priorGaps: priorGaps || [],
    teachingStrategy: teachingStrategy || 'analogy',
  })

  // Save lesson to DB
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      student_id: user.id,
      concept_id: conceptId,
      content,
      student_level: studentLevel || 1,
      domain: domain || 'B2C',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ lesson })
}
