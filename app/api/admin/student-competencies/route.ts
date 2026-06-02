import { createServerSupabaseClient } from '@/lib/db/server'
import { createAdminClient } from '@/lib/db/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json([], { status: 403 })

  const studentId = req.nextUrl.searchParams.get('student_id')
  if (!studentId) return NextResponse.json([])

  const adminClient = await createAdminClient()
  const { data } = await adminClient.from('student_competencies').select('*').eq('student_id', studentId).order('sequence')
  return NextResponse.json(data || [])
}