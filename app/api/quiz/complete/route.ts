import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { attemptId, conceptId, answers, feedbacks, score, passed } = await req.json()

  // Finalize attempt
  await supabase
    .from('quiz_attempts')
    .update({
      answers,
      feedback: feedbacks,
      score,
      passed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', attemptId)

  // Update student concept level
  const { data: sc } = await supabase
    .from('student_concepts')
    .select('*')
    .eq('student_id', user.id)
    .eq('concept_id', conceptId)
    .single()

  if (sc) {
    const newLevel = passed ? Math.min(5, (sc.level || 0) + 1) : sc.level
    const isMastered = score >= 90 && newLevel >= 4

    await supabase
      .from('student_concepts')
      .update({
        level: newLevel,
        best_score: Math.max(sc.best_score || 0, score),
        attempt_count: (sc.attempt_count || 0) + 1,
        gap_flag: !passed && (sc.attempt_count || 0) >= 1,
        is_mastered: isMastered,
        mastered_at: isMastered ? new Date().toISOString() : sc.mastered_at,
      })
      .eq('id', sc.id)

    // If passed, unlock next concepts
    if (passed) {
      await unlockNextConcepts(supabase, user.id, conceptId)
    }
  }

  // Update profile total score
  await (supabase.rpc('update_profile_score', {
    p_student_id: user.id,
    p_score: score,
  }) as any).then(() => {}).catch(() => {
    // RPC may not exist — update directly
    supabase
      .from('profiles')
      .update({ total_score: (score || 0) })
      .eq('id', user.id)
  })

  return NextResponse.json({ success: true, level: sc?.level })
}

async function unlockNextConcepts(supabase: any, studentId: string, completedConceptId: string) {
  // Find the slug of completed concept
  const { data: completedConcept } = await supabase
    .from('concepts')
    .select('slug')
    .eq('id', completedConceptId)
    .single()

  if (!completedConcept) return

  // Find concepts that have this as a prerequisite
  const { data: dependents } = await supabase
    .from('concepts')
    .select('*')
    .contains('prerequisites', [completedConcept.slug])

  if (!dependents?.length) return

  // For each dependent, check if ALL prerequisites are now passed
  const { data: allPassed } = await supabase
    .from('student_concepts')
    .select('concept_id, is_unlocked, level')
    .eq('student_id', studentId)

  const passedMap = new Map((allPassed || []).map((p: any) => [p.concept_id, p]))

  const { data: allConcepts } = await supabase.from('concepts').select('id, slug')
  const conceptBySlug = new Map((allConcepts || []).map((c: any) => [c.slug, c.id]))

  for (const dep of dependents) {
    const prereqIds = dep.prerequisites.map((slug: string) => conceptBySlug.get(slug)).filter(Boolean)
    const allPrereqsMet = prereqIds.every((id: string) => {
      const p = passedMap.get(id) as any
      return p && p.is_unlocked && (p.level || 0) >= 1
    })

    if (allPrereqsMet) {
      // Check if already exists
      const existing = await supabase
        .from('student_concepts')
        .select('id')
        .eq('student_id', studentId)
        .eq('concept_id', dep.id)
        .single()

      if (existing.data) {
        await supabase
          .from('student_concepts')
          .update({ is_unlocked: true, unlocked_at: new Date().toISOString() })
          .eq('id', existing.data.id)
      } else {
        await supabase
          .from('student_concepts')
          .insert({
            student_id: studentId,
            concept_id: dep.id,
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          })
      }
    }
  }
}
