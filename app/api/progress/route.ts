import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

// Called when Maya gives EVAL with verdict PASS
// Body: { competency_code, concept_sequence }

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { competency_code, concept_sequence, score } = await req.json()

  try {
    // ── 1. Get the concept that was just passed ───────────────
    const { data: currentConcept } = await supabase
      .from('concepts')
      .select('id, sequence, title')
      .eq('competency_code', competency_code)
      .eq('sequence', concept_sequence)
      .single()

    if (!currentConcept) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 })
    }

    // ── 2. Mark current concept as mastered ───────────────────
    await supabase
      .from('student_concepts')
      .upsert({
        student_id:  user.id,
        concept_id:  currentConcept.id,
        is_unlocked: true,
        is_mastered: true,
        score:       score || null,
        mastered_at: new Date().toISOString(),
      }, { onConflict: 'student_id,concept_id' })

    // ── 3. Get next concept in this competency ────────────────
    const { data: nextConcept } = await supabase
      .from('concepts')
      .select('id, sequence, title')
      .eq('competency_code', competency_code)
      .eq('sequence', concept_sequence + 1)
      .single()

    if (nextConcept) {
      // ── 4a. Unlock next concept ───────────────────────────
      await supabase
        .from('student_concepts')
        .upsert({
          student_id:  user.id,
          concept_id:  nextConcept.id,
          is_unlocked: true,
          is_mastered: false,
        }, { onConflict: 'student_id,concept_id' })

      return NextResponse.json({
        ok:      true,
        action:  'next_concept_unlocked',
        next:    nextConcept.title,
        sequence: nextConcept.sequence,
      })

    } else {
      // ── 4b. No next concept — all 24 done ────────────────
      // Check how many are actually mastered to confirm
      const { count } = await supabase
        .from('student_concepts')
        .select('id', { count: 'exact' })
        .eq('student_id', user.id)
        .eq('is_mastered', true)
        .in('concept_id',
          (await supabase
            .from('concepts')
            .select('id')
            .eq('competency_code', competency_code)
          ).data?.map((c: any) => c.id) || []
        )

      const { data: totalConcepts } = await supabase
        .from('concepts')
        .select('id')
        .eq('competency_code', competency_code)

      if (count === totalConcepts?.length) {
        // All concepts mastered — complete this competency
        await supabase
          .from('student_competencies')
          .update({ status: 'completed' })
          .eq('student_id', user.id)
          .eq('code', competency_code)

        // Find next locked competency and unlock it
        const { data: nextComp } = await supabase
          .from('student_competencies')
          .select('id, code, name, sequence')
          .eq('student_id', user.id)
          .eq('status', 'locked')
          .order('sequence')
          .limit(1)
          .single()

        if (nextComp) {
          await supabase
            .from('student_competencies')
            .update({ status: 'active' })
            .eq('id', nextComp.id)

          // Unlock concept 1 of next competency
          const { data: firstConcept } = await supabase
            .from('concepts')
            .select('id, title')
            .eq('competency_code', nextComp.code)
            .eq('sequence', 1)
            .single()

          if (firstConcept) {
            await supabase
              .from('student_concepts')
              .upsert({
                student_id:  user.id,
                concept_id:  firstConcept.id,
                is_unlocked: true,
                is_mastered: false,
              }, { onConflict: 'student_id,concept_id' })
          }

          return NextResponse.json({
            ok:               true,
            action:           'competency_completed_next_unlocked',
            completed_comp:   competency_code,
            next_comp_code:   nextComp.code,
            next_comp_name:   nextComp.name,
            next_concept:     firstConcept?.title,
          })

        } else {
          // No more competencies — program complete!
          return NextResponse.json({
            ok:     true,
            action: 'program_complete',
            message: 'All competencies mastered. Program complete.',
          })
        }
      }
    }

    return NextResponse.json({ ok: true, action: 'concept_mastered' })

  } catch (err) {
    console.error('Progress API error:', err)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
