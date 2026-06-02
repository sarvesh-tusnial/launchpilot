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

    // Approve — create auth user
    const password = generatePassword()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' },
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    // Update profile with job title and status
    await supabase.from('profiles').update({
      full_name: fullName || null,
      job_title: jobTitle || null,
      status: 'active',
    }).eq('id', userId)

    // Get the pathway from the application motivation field
    const { data: app } = await supabase.from('applications').select('motivation').eq('id', applicationId).single()
    const pathwayLine = (app?.motivation || '').split('\n')[0]
    const pathwayCode = pathwayLine.replace('Pathway: ', '').trim()

    // Assign the selected pathway
    if (pathwayCode && CLIENT.pathways.find((p: any) => p.code === pathwayCode)) {
      await supabase.from('student_competencies').insert({
        student_id: userId,
        competency_code: pathwayCode,
        is_unlocked: true,
        is_completed: false,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })

      // Update profile with selected pathway
      await supabase.from('profiles').update({ selected_pathway: pathwayCode }).eq('id', userId)
    }

    // Mark application as approved
    await supabase.from('applications').update({ status: 'approved' }).eq('id', applicationId)

    return NextResponse.json({ ok: true, password, email })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
