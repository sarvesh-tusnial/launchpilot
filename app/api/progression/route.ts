import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [conceptsRes, progressRes] = await Promise.all([
    supabase.from('concepts').select('*').order('order_index'),
    supabase.from('student_concepts').select('*').eq('student_id', user.id),
  ])

  const concepts = conceptsRes.data || []
  const progress = progressRes.data || []
  const progressMap = new Map(progress.map(p => [p.concept_id, p]))

  const graph = concepts.map(concept => ({
    ...concept,
    progress: progressMap.get(concept.id) || {
      level: 0,
      is_unlocked: false,
      is_mastered: false,
      gap_flag: false,
      best_score: 0,
      attempt_count: 0,
    },
  }))

  const stats = {
    total: concepts.length,
    unlocked: progress.filter(p => p.is_unlocked).length,
    mastered: progress.filter(p => p.is_mastered).length,
    gaps: progress.filter(p => p.gap_flag).length,
  }

  return NextResponse.json({ graph, stats })
}
