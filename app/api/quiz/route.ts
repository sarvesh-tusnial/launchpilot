import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import { generateQuiz } from '@/lib/ai/claude'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conceptId, studentLevel, domain, quizType } = await req.json()

  // Get concept
  const { data: concept } = await supabase
    .from('concepts')
    .select('*')
    .eq('id', conceptId)
    .single()
  if (!concept) return NextResponse.json({ error: 'Concept not found' }, { status: 404 })

  // Get attempt count
  const { count } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('concept_id', conceptId)

  // Generate quiz
  const quiz = await generateQuiz({
    concept,
    studentLevel: studentLevel || 1,
    domain: domain || 'B2C',
    quizType: quizType || 'mcq',
  })

  // Save attempt
  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .insert({
      student_id: user.id,
      concept_id: conceptId,
      questions: quiz.questions,
      attempt_number: (count || 0) + 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ attempt })
}
