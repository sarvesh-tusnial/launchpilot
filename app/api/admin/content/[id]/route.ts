import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

interface Props {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()
  const body = await req.json()

  const { data, error } = await supabase
    .from('content_library')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data })
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from('content_library').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
