import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { concept_id, stage } = await req.json()

  if (!concept_id || !stage || stage < 1 || stage > 8) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const isCompleted = stage === 8

  const { error } = await supabase
    .from('student_concepts')
    .upsert({
      student_id:   user.id,
      concept_id,
      stage,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'student_id,concept_id' })

  if (error) {
    console.error('Stage update error:', error)
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
  }

  // If concept completed (stage 8), check if all concepts in competency are done
  // and if so, mark competency complete and unlock next one
  if (isCompleted) {
    // Get the competency code for this concept
    const { data: concept } = await supabase
      .from('concepts')
      .select('competency_code')
      .eq('id', concept_id)
      .single()

    if (concept) {
      // Count total vs completed concepts for this competency
      const { data: allConcepts } = await supabase
        .from('concepts')
        .select('id')
        .eq('competency_code', concept.competency_code)

      const { data: completedConcepts } = await supabase
        .from('student_concepts')
        .select('id')
        .eq('student_id', user.id)
        .eq('is_completed', true)
        .in('concept_id', (allConcepts || []).map(c => c.id))

      const allDone = (completedConcepts?.length || 0) >= (allConcepts?.length || 0)

      if (allDone) {
        // Mark competency as completed
        await supabase
          .from('student_competencies')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('student_id', user.id)
          .eq('competency_code', concept.competency_code)

        // Unlock next locked competency
        const { data: nextLocked } = await supabase
          .from('student_competencies')
          .select('competency_code, competency:competencies(order_index)')
          .eq('student_id', user.id)
          .eq('is_unlocked', false)
          .order('competency(order_index)')
          .limit(1)
          .single()

        if (nextLocked) {
          await supabase
            .from('student_competencies')
            .update({ is_unlocked: true, unlocked_at: new Date().toISOString() })
            .eq('student_id', user.id)
            .eq('competency_code', nextLocked.competency_code)
        }
      }
    }
  }

  return NextResponse.json({ ok: true, stage, completed: isCompleted })
}
