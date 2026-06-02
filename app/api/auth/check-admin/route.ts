import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ isAdmin: false, status: null, error: 'no userId' })

    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, status')
      .eq('id', userId)
      .single()

    if (error) return NextResponse.json({ isAdmin: false, status: null, error: error.message, hint: error.hint, code: error.code })
    if (!data) return NextResponse.json({ isAdmin: false, status: null, error: 'no data' })
    
    return NextResponse.json({ isAdmin: data.is_admin, status: data.status })
  } catch (e: any) {
    return NextResponse.json({ isAdmin: false, status: null, error: e.message })
  }
}
