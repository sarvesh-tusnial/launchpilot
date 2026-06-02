import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireAdmin()
  const body = await req.json()

  const { data, error } = await supabase
    .from('content_library')
    .insert({ ...body, created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data })
}

export async function GET() {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('content_library')
    .select('*, concept:concepts(title, slug)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data })
}
