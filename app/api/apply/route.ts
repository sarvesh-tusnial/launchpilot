import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, jobTitle, experience, selectedPathway, motivation, businessIdea } = await req.json()

    if (!email || !fullName || !selectedPathway || !motivation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 400 })
    }

    const { error } = await supabase.from('applications').insert({
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      job_title: jobTitle || null,
      years_experience: experience || null,
      motivation: `Pathway: ${selectedPathway}\n\nBusiness idea: ${businessIdea}\n\nMotivation: ${motivation}`,
      status: 'pending',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
