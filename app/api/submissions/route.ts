import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import { evaluateSubmission } from '@/lib/ai/claude'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, conceptId, content, studentLevel } = await req.json()

  if (!content || content.trim().length < 100) {
    return NextResponse.json({ error: 'Submission too short' }, { status: 400 })
  }

  // Get task and concept
  const [taskRes, conceptRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('id', taskId).single(),
    supabase.from('concepts').select('*').eq('id', conceptId).single(),
  ])

  if (!taskRes.data || !conceptRes.data) {
    return NextResponse.json({ error: 'Task or concept not found' }, { status: 404 })
  }

  // Get attempt number
  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('task_id', taskId)

  // Evaluate via Claude
  const evaluation = await evaluateSubmission({
    task: taskRes.data,
    submission: content,
    concept: conceptRes.data.title,
    studentLevel: studentLevel || 1,
  })

  // Save submission
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({
      student_id: user.id,
      task_id: taskId,
      concept_id: conceptId,
      content,
      score: evaluation.score,
      dimension_scores: evaluation.dimension_scores,
      verdict: evaluation.verdict,
      feedback_items: evaluation.feedback_items,
      bridge_insight: evaluation.bridge_insight,
      attempt_number: (count || 0) + 1,
      evaluated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update skill graph on pass
  if (evaluation.verdict === 'PASS') {
    const { data: sc } = await supabase
      .from('student_concepts')
      .select('*')
      .eq('student_id', user.id)
      .eq('concept_id', conceptId)
      .single()

    if (sc) {
      await supabase
        .from('student_concepts')
        .update({
          level: Math.min(5, (sc.level || 0) + 1),
          best_score: Math.max(sc.best_score || 0, evaluation.score),
          is_mastered: evaluation.score >= 90,
          mastered_at: evaluation.score >= 90 ? new Date().toISOString() : sc.mastered_at,
          gap_flag: false,
        })
        .eq('id', sc.id)
    }
  } else if (evaluation.verdict === 'RELEARN') {
    await supabase
      .from('student_concepts')
      .update({ gap_flag: true })
      .eq('student_id', user.id)
      .eq('concept_id', conceptId)
  }

  return NextResponse.json({ submission })
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, task:tasks(title, task_type)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ submissions: submissions || [] })
}
