import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return p
}

function generateSlug(businessName: string): string {
  return businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const { founderName, email, businessName, businessCategory, businessDescription, businessStage, country, track1, track2, track3 } = await req.json()

    if (!founderName || !email || !businessName || !businessCategory || !businessDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const password = generatePassword()
    const baseSlug = generateSlug(businessName)

    // Ensure slug is unique
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data: existing } = await supabase.from('copilot_profiles').select('id').eq('slug', slug).single()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: founderName },
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    // Update profile
    await supabase.from('profiles').update({
      full_name: founderName,
      status: 'active',
    }).eq('id', userId)

    // Create copilot profile
    const { error: cpError } = await supabase.from('copilot_profiles').insert({
      user_id: userId,
      slug,
      founder_name: founderName,
      business_name: businessName,
      business_category: businessCategory,
      business_description: businessDescription,
      business_stage: businessStage || '0-1',
      country: country || 'India',
      email: email.trim().toLowerCase(),
      password_hint: password,
      track_1_code: track1 || 'B01',
      track_2_code: track2 || 'B02',
      track_3_code: track3 || 'B03',
    })

    if (cpError) return NextResponse.json({ error: cpError.message }, { status: 500 })

    // Assign tracks as student_competencies
    const trackCodes = [track1, track2, track3].filter(Boolean)
    for (let i = 0; i < trackCodes.length; i++) {
      await supabase.from('student_competencies').insert({
        student_id: userId,
        competency_code: trackCodes[i],
        is_unlocked: true,
        status: i === 0 ? 'active' : 'paused',
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://launchpilot-phi.vercel.app'

    return NextResponse.json({
      ok: true,
      slug,
      email: email.trim().toLowerCase(),
      password,
      url: `${siteUrl}/copilot/${slug}`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
