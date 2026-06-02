import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, jobTitle, department } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const supabase = await createAdminClient()
    const password = generatePassword()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' },
    })

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    // Update profile with extra details (trigger already created it)
    await supabase.from('profiles').update({
      full_name: fullName || null,
      job_title: jobTitle || null,
      department: department || null,
      status: 'active',
    }).eq('id', userId)

    return NextResponse.json({ email, password, userId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
