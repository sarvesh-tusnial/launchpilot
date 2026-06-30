import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Real mentor roster — fixed, not AI-generated. Same people across all enterprise demos.
// They can deliver in-person live sessions if the client requests it.
const ENTERPRISE_MENTORS = [
  { name: 'Andrew Chow', role: 'Managing Partner, Co-founder', company: 'Asia Pro Ventures', img: '/images/mentors/andrew-chow.jpg' },
  { name: 'Daniel Ling', role: 'ex-VP, Founder', company: 'DBS, Lazada', img: '/images/mentors/daniel-ling.jpg' },
  { name: 'Vansh Chiripal', role: 'Promoter', company: 'Chiripal Group of Companies', img: '/images/mentors/vansh-chiripal.jpg' },
  { name: 'Sarvesh Tusnial', role: 'Co-Founder & CEO', company: 'Mentogram', img: '/images/mentors/sarvesh-tusnial.jpg' },
  { name: 'Siddharth Dangi', role: 'Co-Founder & COO', company: 'Mentogram', img: '/images/mentors/siddharth-dangi.jpg' },
  { name: 'John Lim', role: 'Managing Partner', company: 'Meet Ventures', img: '/images/mentors/john-lim.jpg' },
  { name: 'Yash Shah', role: 'Head of AI, Cloud', company: 'Amazon Web Services', img: '/images/mentors/yash-shah.jpg' },
  { name: 'Toyoyuki Ushioda', role: 'CFO Director, ex-VP', company: 'MapleTree Investments · $80B AUM', img: '/images/mentors/toyoyuki-ushioda.jpg' },
  { name: 'Dr. Hasit Dangi', role: 'School Director', company: 'Mentogram', img: '/images/mentors/hasit-dangi.jpg' },
  { name: 'Sunil Kamath', role: 'Founder and Partner', company: 'Hustle Ventures', img: '/images/mentors/sunil-kamath.jpg' },
  { name: 'Sudeep Bhatter', role: 'Engineering Manager', company: 'Microsoft', img: '/images/mentors/sudeep-bhatter.jpg' },
  { name: 'Jason Kraus', role: 'Founder and VC', company: 'EQX Fund', img: '/images/mentors/jason-kraus.jpg' },
]

const AI_EXECUTION_TEAM = [
  { name: 'Shivam Pal', role: 'AI Execution Specialist', img: '/images/students/shivam.jpg' },
  { name: 'Reyo Augustine', role: 'AI Execution Specialist', img: '/images/students/reyo.jpg' },
  { name: 'Samrudh R', role: 'AI Execution Specialist', img: '/images/students/samrudh.jpg' },
  { name: 'Swarit Bharadwaj', role: 'AI Execution Specialist', img: '/images/students/swarit.jpg' },
]

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
  const prompt = `You are writing landing-page copy for an enterprise employee upskilling program, to be shown to the company's leadership team for approval.

This is a workforce upskilling program, not a generic course platform. Every line should read like it's about building internal capability at this specific company — use language like "your team," "your workforce," "your employees," not generic edtech phrasing. Avoid words like "students," "course," or "class" — use "employees," "program," and "tracks" instead.

COMPANY: ${companyName}
INDUSTRY: ${industry}
DESCRIPTION: ${companyDescription}
TRACKS: ${trackNames.join(', ')}

Return ONLY valid JSON, no markdown, no explanation:
{
  "headline": "1 short sentence pitching this upskilling program specifically to ${companyName}'s leadership — confident, no hype words, framed around building internal capability",
  "subheadline": "1 sentence on what employees will be able to do after this program, specific to ${industry}",
  "track_outcomes": [
    "1 sentence: what an employee in this track will be able to do at ${companyName} specifically, after completing it",
    "...", "...", "...", "...", "..."
  ],
  "company_context_summary": "2 sentences summarizing why this upskilling program fits ${companyName}'s specific operations and workforce needs, referencing details from the description"
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

// Generates exactly 4 AI opportunities, each short and stat-led — not paragraphs.
async function generateAIAudit(
  companyName: string,
  industry: string,
  companyDescription: string,
  websiteContent: string,
): Promise<any> {
  const websiteBlock = websiteContent
    ? `\n\nACTUAL WEBSITE CONTENT (scanned from their site — use this for specific, real details, not just the description above):\n${websiteContent}`
    : ''

  const prompt = `You are identifying quick-hit AI opportunities for ${companyName}, to show their leadership team in a short scannable list. This is NOT a report — brevity is the entire point. If you write more than one short sentence per opportunity, you have failed this task.

COMPANY: ${companyName}
INDUSTRY: ${industry}
DESCRIPTION: ${companyDescription}${websiteBlock}

Identify exactly 4 specific opportunities where AI could improve this company's operations, grounded in details from the description${websiteContent ? ' and website content' : ''} above.

STRICT FORMAT — every field has a hard length limit:
- "function": 2-4 words. A label, not a sentence. Example: "Inventory Forecasting", "Customer Support Triage"
- "description": ONE short sentence, 12 words MAXIMUM. State the pain point only — no explanation of the fix, no "AI-powered X could Y" reasoning. Example: "Manual demand forecasting causes seasonal overstock across regions."
- "stats": exactly 3 short stat strings, each under 6 words, plausible round-number estimates. Example: ["35% less overstock", "12hrs/week saved", "2x faster restocking"]

Return ONLY valid JSON, no markdown:
{
  "readinessScore": <number 1-100>,
  "gaps": [
    { "function": "2-4 words", "description": "max 12 words, pain point only", "stats": ["stat", "stat", "stat"], "priority": "high" | "medium" | "low" }
  ]
}
Exactly 4 items in gaps. Re-read your description fields before responding — if any exceeds 12 words, shorten it.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text2 = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean2 = text2.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean2)
  // Safety net: truncate to ~12 words even if the model ignores the instruction.
  if (parsed.gaps) {
    parsed.gaps = parsed.gaps.map((g: any) => {
      const words = (g.description || '').split(/\s+/)
      return {
        ...g,
        description: words.length > 12 ? words.slice(0, 12).join(' ') + '…' : g.description,
        stats: Array.isArray(g.stats) ? g.stats.slice(0, 3) : [],
      }
    })
  }
  return parsed
}

// Generates a benchmark-style assessment: score vs industry peers, time/cost impact, and critical upskilling gaps.
async function generateBenchmarkAssessment(
  companyName: string,
  industry: string,
  companyDescription: string,
  trackNames: string[],
  websiteContent: string,
): Promise<any> {
  const websiteBlock = websiteContent
    ? `\n\nACTUAL WEBSITE CONTENT (scanned from their site — use this for specific, real details):\n${websiteContent}`
    : ''

  const prompt = `You are producing a short workforce-readiness benchmark for ${companyName}'s leadership, comparing them against typical ${industry} peers. This is a scannable scorecard, not a report — every field is short.

COMPANY: ${companyName}
INDUSTRY: ${industry}
DESCRIPTION: ${companyDescription}${websiteBlock}
TRACKS BEING TRAINED: ${trackNames.join(', ')}

STRICT FORMAT — short fields only:
- "benchmarkScore": number 1-100, this company's estimated current skills-readiness vs industry peers
- "industryAvgScore": number 1-100, a plausible typical score for ${industry} companies of similar scale (should usually be different from benchmarkScore, to show gap or lead)
- "timeSavedPerWeek": short string, e.g. "6-8 hrs/employee/week"
- "costImpact": short string, e.g. "$80K-120K/year"
- "criticalAreas": exactly 3 items, each: { "area": "2-4 words, a skill/function name", "gap": "max 10 words, what's missing today" }

Return ONLY valid JSON, no markdown:
{
  "benchmarkScore": <number>,
  "industryAvgScore": <number>,
  "timeSavedPerWeek": "short string",
  "costImpact": "short string",
  "criticalAreas": [
    { "area": "2-4 words", "gap": "max 10 words" }
  ]
}
criticalAreas must have exactly 3 items.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  if (parsed.criticalAreas) parsed.criticalAreas = parsed.criticalAreas.slice(0, 3)
  return parsed
}

// Best-effort fetch of a company's website to ground the audit/benchmark in real content.
// Never throws — returns empty string on any failure, so a bad URL never blocks demo creation.
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    let target = url.trim()
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(target, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LaunchPilotBot/1.0)' },
    })
    clearTimeout(timeout)
    if (!res.ok) return ''

    const html = await res.text()
    // Strip tags/scripts/styles down to readable text, cap length to keep prompt size sane.
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return text.slice(0, 6000)
  } catch {
    return '' // timeout, network error, invalid URL, etc. — fail silently, never block creation
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      companyName, industry, companyDescription, contactName, email, companyWebsite,
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

    // Optional: scan the company website for richer audit/benchmark grounding. Never blocks creation if it fails.
    const websiteContent = companyWebsite ? await fetchWebsiteContent(companyWebsite) : ''

    // Run all four Claude calls in parallel
    const [conceptResult, landingContent, auditResult, benchmarkResult] = await Promise.all([
      generateEnterpriseConcepts(companyName, industry, companyDescription, trackNames, slug),
      generateEnterpriseLandingContent(companyName, industry, companyDescription, trackNames),
      generateAIAudit(companyName, industry, companyDescription, websiteContent),
      generateBenchmarkAssessment(companyName, industry, companyDescription, trackNames, websiteContent),
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
    const fullPersonalisedContent = {
      ...landingContent,
      audit: auditResult,
      benchmark: benchmarkResult,
      mentors: ENTERPRISE_MENTORS,
      aiExecutionTeam: AI_EXECUTION_TEAM,
    }

    const { error: insertError } = await supabase.from('copilot_enterprise_profiles').insert({
      user_id: userId, slug,
      company_name: companyName, industry, company_description: companyDescription,
      contact_name: contactName || null,
      email: email.trim().toLowerCase(), password_hint: password,
      track_1_code: tracks[0].code, track_2_code: tracks[1].code, track_3_code: tracks[2].code,
      track_4_code: tracks[3].code, track_5_code: tracks[4].code, track_6_code: tracks[5].code,
      personalised_content: fullPersonalisedContent,
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
