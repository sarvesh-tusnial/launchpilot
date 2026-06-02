import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import { CLIENT } from '@/client-config'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) password += chars.charAt(Math.floor(Math.random() * chars.length))
  return password
}

export async function POST(req: NextRequest) {
  try {
    const { applicationId, email, fullName, jobTitle, action } = await req.json()
    const supabase = await createAdminClient()

    if (action === 'reject') {
      await supabase.from('applications').update({ status: 'rejected' }).eq('id', applicationId)
      return NextResponse.json({ ok: true })
    }

    // Get pathway from application BEFORE creating user
    const { data: app } = await supabase
      .from('applications')
      .select('motivation')
      .eq('id', applicationId)
      .single()

    const motivationText = app?.motivation || ''
    const firstLine = motivationText.split('\n')[0].trim()
    const pathwayCode = firstLine.replace('Pathway:', '').trim()

    // Create auth user
    const password = generatePassword()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' },
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    // Update profile
    await supabase.from('profiles').update({
      full_name: fullName || null,
      job_title: jobTitle || null,
      status: 'active',
      selected_pathway: pathwayCode || null,
    }).eq('id', userId)

    // Assign pathway if valid
    if (pathwayCode && CLIENT.pathways.find((p: any) => p.code === pathwayCode)) {
      const { error: compError } = await supabase.from('student_competencies').insert({
        student_id: userId,
        competency_code: pathwayCode,
        is_unlocked: true,
        is_completed: false,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      if (compError) {
        return NextResponse.json({ error: `Pathway assign failed: ${compError.message}`, pathwayCode }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: `Invalid pathway code: "${pathwayCode}"`, motivationText }, { status: 500 })
    }

    // Mark application approved
    await supabase.from('applications').update({ status: 'approved' }).eq('id', applicationId)

    return NextResponse.json({ ok: true, password, email, pathwayCode })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
