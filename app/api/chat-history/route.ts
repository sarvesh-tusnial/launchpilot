import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return NextResponse.json({ messages: (messages || []).reverse() })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role, content } = await req.json()
  if (!role || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Only save text content, strip special blocks for storage
  const cleanContent = content.replace(/\|\|\|.*?\|\|\|/gs, '').trim()
  if (!cleanContent) return NextResponse.json({ success: true })

  await supabase.from('chat_messages').insert({
    student_id: user.id,
    role,
    content: cleanContent,
  })

  return NextResponse.json({ success: true })
}
