import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import { evaluateQuizAnswer } from '@/lib/ai/claude'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { attemptId, questionId, question, answer, conceptTitle } = await req.json()

  const feedback = await evaluateQuizAnswer({
    question,
    studentAnswer: answer,
    concept: conceptTitle,
  })

  // Update attempt with this answer's feedback
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select('answers, feedback')
    .eq('id', attemptId)
    .single()

  const updatedAnswers = { ...(attempt?.answers || {}), [questionId]: answer }
  const updatedFeedback = { ...(attempt?.feedback || {}), [questionId]: feedback }

  await supabase
    .from('quiz_attempts')
    .update({ answers: updatedAnswers, feedback: updatedFeedback })
    .eq('id', attemptId)

  return NextResponse.json({ feedback })
}
