import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return p
}

function generateSlug(businessName: string): string {
  return businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

async function generateConcepts(
  businessName: string,
  businessCategory: string,
  businessDescription: string,
  businessStage: string,
  country: string,
  track1Name: string,
  track2Name: string,
  track3Name: string,
  slug: string
): Promise<{ tracks: Array<{ code: string; name: string; concepts: string[] }> }> {

  const prompt = `You are a curriculum designer for a personalised AI coaching program.

Generate 3 custom learning tracks for this founder:

BUSINESS: ${businessName}
CATEGORY: ${businessCategory}
DESCRIPTION: ${businessDescription}
STAGE: ${businessStage}
COUNTRY: ${country}

TRACK NAMES REQUESTED:
1. ${track1Name}
2. ${track2Name}  
3. ${track3Name}

For each track, generate 8 concept titles that are:
- Completely specific to this business (mention ${businessName} by name where relevant)
- Practical and actionable — not generic theory
- Progressive — each concept builds on the previous
- Tailored to ${businessStage} stage and ${country} market

Return ONLY a JSON object in this exact format, no other text:
{
  "tracks": [
    {
      "code": "${slug}_01",
      "name": "${track1Name}",
      "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"]
    },
    {
      "code": "${slug}_02", 
      "name": "${track2Name}",
      "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"]
    },
    {
      "code": "${slug}_03",
      "name": "${track3Name}",
      "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"]
    }
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function POST(req: NextRequest) {
  try {
    const {
      founderName, email, businessName, businessCategory,
      businessDescription, businessStage, country,
      track1Name, track2Name, track3Name,
    } = await req.json()

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
      const { data: existing } = await supabase.from('copilot_profiles').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    // Generate custom concepts via Claude
    const t1 = track1Name || 'Business Fundamentals'
    const t2 = track2Name || 'Revenue'
    const t3 = track3Name || 'Scale'

    const { tracks } = await generateConcepts(
      businessName, businessCategory, businessDescription,
      businessStage || '0-1', country || 'India',
      t1, t2, t3, slug
    )

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

    // Seed competencies (unique codes per founder)
    for (const track of tracks) {
      await supabase.from('competencies').upsert({
        code: track.code,
        name: track.name,
        description: `${businessName} — ${track.name}`,
        order_index: 100 + tracks.indexOf(track),
      }, { onConflict: 'code' })

      // Seed concepts
      for (let i = 0; i < track.concepts.length; i++) {
        await supabase.from('concepts').upsert({
          competency_code: track.code,
          title: track.concepts[i],
          sequence: i + 1,
        }, { onConflict: 'competency_code,sequence' })
      }
    }

    // Assign tracks to student
    for (let i = 0; i < tracks.length; i++) {
      await supabase.from('student_competencies').insert({
        student_id: userId,
        competency_code: tracks[i].code,
        is_unlocked: true,
        status: i === 0 ? 'active' : 'paused',
      })
    }

    // Create copilot profile
    await supabase.from('copilot_profiles').insert({
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
      track_1_code: tracks[0].code,
      track_2_code: tracks[1].code,
      track_3_code: tracks[2].code,
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://launchpilot-phi.vercel.app'

    return NextResponse.json({
      ok: true,
      slug,
      email: email.trim().toLowerCase(),
      password,
      url: `${siteUrl}/copilot/${slug}`,
      tracks: tracks.map(t => ({ code: t.code, name: t.name, concepts: t.concepts.length })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
