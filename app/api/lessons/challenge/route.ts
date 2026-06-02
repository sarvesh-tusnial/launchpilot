import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import { evaluateQuizAnswer } from '@/lib/ai/claude'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, conceptId, challengeQuestion, answer, conceptTitle } = await req.json()

  const evaluation = await evaluateQuizAnswer({
    question: {
      question: challengeQuestion,
      correct_criteria: 'Answer demonstrates understanding of the core concept and can apply it to a real product scenario.',
      type: 'scenario',
    },
    studentAnswer: answer,
    concept: conceptTitle,
  })

  // Mark lesson as completed
  await supabase
    .from('lessons')
    .update({ completed: true })
    .eq('id', lessonId)
    .eq('student_id', user.id)

  // Update student concept if not yet flagged
  if (!evaluation.passed) {
    await supabase
      .from('student_concepts')
      .update({ gap_flag: true })
      .eq('student_id', user.id)
      .eq('concept_id', conceptId)
  }

  return NextResponse.json({ feedback: evaluation.feedback, passed: evaluation.passed })
}
