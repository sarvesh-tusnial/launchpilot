import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const { supabase } = await requireAdmin()

  const formData = await req.formData()
  const file = formData.get('file') as File
  const contentType = formData.get('contentType') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const folder = contentType === 'mentor_video' ? 'videos' : 'pdfs'
  const path = `${folder}/${uuidv4()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('content')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from('content').getPublicUrl(path)

  return NextResponse.json({ path, url: urlData.publicUrl })
}
