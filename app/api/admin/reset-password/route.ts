import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/db/server'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!caller?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { student_id } = await req.json()
  if (!student_id) return NextResponse.json({ error: 'student_id required' }, { status: 400 })

  const num      = String(Math.floor(Math.random() * 9000) + 1000)
  const tempPass = `Mento${num}!`

  const { error } = await adminClient.auth.admin.updateUserById(student_id, { password: tempPass })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ temp_pass: tempPass })
}
