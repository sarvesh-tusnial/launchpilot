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

function generateSlug(companyName: string): string {
  return companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// Generates the 6 tracks x 8 concepts, tailored to the company's industry/description.
async function generateEnterpriseConcepts(
  companyName: string,
  industry: string,
  companyDescription: string,
  trackNames: string[], // exactly 6
  slug: string
): Promise<{ tracks: Array<{ code: string; name: string; concepts: string[] }> }> {
  const prompt = `Generate 6 custom employee upskilling tracks for this company's internal training program.

COMPANY: ${companyName}
INDUSTRY: ${industry}
DESCRIPTION: ${companyDescription}

TRACK NAMES (these are company functions/departments — generate concepts specific to how THIS company would apply them):
${trackNames.map((t, i) => `${i + 1}. ${t}`).join('\n')}

For each track, generate 8 concept titles — practical, job-relevant skills an employee in that function at this specific company would need. Avoid generic textbook topics; ground each concept in the company's actual industry and described operations.

Return ONLY JSON, no markdown:
{
  "tracks": [
    ${trackNames.map((t, i) => `{ "code": "${slug}_0${i + 1}", "name": "${t}", "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"] }`).join(',\n    ')}
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// Generates the landing-page copy (replaces the old brochure) — track outcomes + a short pitch.
async function generateEnterpriseLandingContent(
  companyName: string,
  industry: string,
  companyDescription: string,
  trackNames: string[],
): Promise<any> {
  const prompt = `You are writing landing-page copy for an enterprise employee upskilling demo, to be shown to the company's leadership team for approval.

COMPANY: ${companyName}
INDUSTRY: ${industry}
DESCRIPTION: ${companyDescription}
TRACKS: ${trackNames.join(', ')}

Return ONLY valid JSON, no markdown, no explanation:
{
  "headline": "1 short sentence pitching this program specifically to ${companyName}'s leadership — confident, no hype words",
  "subheadline": "1 sentence on what employees will be able to do after this program, specific to ${industry}",
  "track_outcomes": [
    "1 sentence: what an employee in this track will be able to do at ${companyName} specifically",
    "...", "...", "...", "...", "..."
  ],
  "company_context_summary": "2 sentences summarizing why this program fits ${companyName}'s specific operations, referencing details from the description"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function POST(req: NextRequest) {
  try {
    const {
      companyName, industry, companyDescription, contactName, email,
      track1Name, track2Name, track3Name, track4Name, track5Name, track6Name,
    } = await req.json()

    if (!companyName || !industry || !companyDescription || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const trackNames = [track1Name, track2Name, track3Name, track4Name, track5Name, track6Name]
      .map(t => (t || '').trim())
    if (trackNames.some(t => !t)) {
      return NextResponse.json({ error: 'All 6 track names are required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const password = generatePassword()
    const baseSlug = generateSlug(companyName)

    // Ensure unique slug
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data: existing } = await supabase.from('copilot_enterprise_profiles').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    // Run both Claude calls in parallel
    const [conceptResult, landingContent] = await Promise.all([
      generateEnterpriseConcepts(companyName, industry, companyDescription, trackNames, slug),
      generateEnterpriseLandingContent(companyName, industry, companyDescription, trackNames),
    ])

    const { tracks } = conceptResult
    if (!tracks || tracks.length !== 6) {
      return NextResponse.json({ error: 'Concept generation did not return 6 tracks — try again' }, { status: 500 })
    }

    // Create auth user (single demo login)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: contactName || companyName },
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    await supabase.from('profiles').update({ full_name: contactName || companyName, status: 'active' }).eq('id', userId)

    // Seed competencies and concepts
    for (const track of tracks) {
      const { error: compError } = await supabase.from('competencies').upsert({
        code: track.code, name: track.name,
        description: `${companyName} — ${track.name}`,
        order_index: 200 + tracks.indexOf(track),
      }, { onConflict: 'code' })
      if (compError) return NextResponse.json({ error: `Failed to create track ${track.code}: ${compError.message}` }, { status: 500 })

      for (let i = 0; i < track.concepts.length; i++) {
        const { error: conceptError } = await supabase.from('concepts').upsert({
          competency_code: track.code,
          title: track.concepts[i],
          sequence: i + 1,
        }, { onConflict: 'competency_code,sequence' })
        if (conceptError) return NextResponse.json({ error: `Failed to create concept for ${track.code}: ${conceptError.message}` }, { status: 500 })
      }
    }

    // Assign all 6 tracks (first active, rest paused — same pattern as founder copilots)
    for (let i = 0; i < tracks.length; i++) {
      const { error: scError } = await supabase.from('student_competencies').insert({
        student_id: userId,
        competency_code: tracks[i].code,
        is_unlocked: true,
        status: i === 0 ? 'active' : 'paused',
      })
      if (scError) return NextResponse.json({ error: `Failed to assign track ${tracks[i].code}: ${scError.message}` }, { status: 500 })
    }

    // Create enterprise copilot profile
    const { error: insertError } = await supabase.from('copilot_enterprise_profiles').insert({
      user_id: userId, slug,
      company_name: companyName, industry, company_description: companyDescription,
      contact_name: contactName || null,
      email: email.trim().toLowerCase(), password_hint: password,
      track_1_code: tracks[0].code, track_2_code: tracks[1].code, track_3_code: tracks[2].code,
      track_4_code: tracks[3].code, track_5_code: tracks[4].code, track_6_code: tracks[5].code,
      personalised_content: landingContent,
    })
    if (insertError) return NextResponse.json({ error: `Failed to create enterprise profile: ${insertError.message}` }, { status: 500 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://launchpilot-phi.vercel.app'

    return NextResponse.json({
      ok: true, slug,
      email: email.trim().toLowerCase(), password,
      url: `${siteUrl}/enterprise/${slug}`,
      tracks: tracks.map(t => ({ code: t.code, name: t.name, concepts: t.concepts.length })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
