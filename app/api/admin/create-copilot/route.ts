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

const ALL_MENTORS = [
  { key: 'prantik',  name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',         company: 'Exited Entrepreneur',              img: '/images/mentors/prantik-mazumdar.jpg',  expertise: ['entrepreneurship', 'growth', 'startups', 'sales', 'GTM'] },
  { key: 'jason',    name: 'Jason Kraus',         role: 'Founder, Prepare4VC',              company: 'Partner, EQx Fund',               img: '/images/mentors/jason-kraus.jpg',       expertise: ['fundraising', 'venture capital', 'finance', 'investing'] },
  { key: 'renuka',   name: 'Renuka Belwalkar',    role: 'Investor',                         company: 'Forbes Under 30 Scholar',         img: '/images/mentors/renuka-belwalkar.jpg',  expertise: ['D2C', 'brand', 'content', 'marketing', 'women founders'] },
  { key: 'yash',     name: 'Yash Shah',           role: 'GenAI Head India & SEA',           company: 'Amazon Web Services',             img: '/images/mentors/yash-shah.jpg',         expertise: ['AI', 'technology', 'SaaS', 'cloud', 'product'] },
  { key: 'andrew',   name: 'Andrew Chow',         role: 'Co-Founder',                       company: 'Asia Pro Ventures · NTU',         img: '/images/mentors/andrew-chow.jpg',       expertise: ['consumer product', 'discovery', 'growth', 'Asia markets'] },
  { key: 'daniel',   name: 'Daniel Ling',         role: 'ex-VP Design',                     company: 'DBS & Lazada',                    img: '/images/mentors/daniel-ling.jpg',       expertise: ['growth loops', 'retention', 'PLG', 'product', 'design'] },
  { key: 'rajesh',   name: 'Rajesh Setty',        role: '19x Author',                       company: 'Mentor at Founder Institute',     img: '/images/mentors/rajesh-shetty.jpg',     expertise: ['entrepreneurship', 'leadership', 'storytelling', 'B2B'] },
  { key: 'shavin',   name: 'Shavin Goswami',      role: 'Global Risk Ops',                  company: 'Meta · ex-EY Consulting',         img: '/images/mentors/shavin-goswami.jpg',    expertise: ['marketplace', 'consumer', 'operations', 'risk', 'scale'] },
  { key: 'sarvash',  name: 'Sarvash Malani',      role: 'DeepTech VC',                      company: 'Temasek · Wharton Grad',          img: '/images/mentors/sarvash-malani.jpg',    expertise: ['fundraising', 'deep tech', 'AI', 'SaaS', 'seed round'] },
  { key: 'justin',   name: 'Justin Strackany',    role: 'LP at GTMFund',                    company: '3 exits (SecureLink/Vista)',       img: '/images/mentors/justin-strackany.jpg',  expertise: ['GTM', 'sales', 'B2B SaaS', 'exits', 'fundraising'] },
  { key: 'gaurav',   name: 'Gaurav Thakkar',      role: 'Principal VC',                     company: 'Silicon Road · ex-Morgan Stanley', img: '/images/mentors/gaurav-thakkar.jpg',   expertise: ['venture capital', 'India markets', 'consumer', 'growth'] },
  { key: 'john',     name: 'John Lim',            role: 'Partner',                          company: 'Meet Ventures SG · ex-HOD $100M fund', img: '/images/mentors/john-lim.jpg',    expertise: ['brand', 'performance', 'D2C', 'marketing', 'SEA'] },
  { key: 'sarvesh',  name: 'Sarvesh Tusnial',     role: 'Co-Founder, Mentogram',            company: 'ex-EY',                           img: '/images/mentors/sarvesh-tusnial.jpg',   expertise: ['edtech', 'platform', 'sales', 'revenue', 'product'] },
  { key: 'bhavin',   name: 'Bhavin Mehta',        role: 'Managing Director APAC',           company: 'Helpling',                        img: '/images/mentors/bhavin-mehta.jpg',      expertise: ['marketplace', 'home services', 'scaling', 'APAC', 'ops'] },
  { key: 'sunil',    name: 'Sunil Kamath',        role: 'Founder and Partner',              company: 'Hustle Ventures',                 img: '/images/mentors/sunil-kamath.jpg',      expertise: ['consumer', 'distribution', 'partnerships', 'India'] },
  { key: 'shlok',    name: 'Shlok Jain',          role: 'Product',                          company: 'Grab',                            img: '/images/mentors/shlok-jain.jpg',        expertise: ['0-to-1', 'fundraising', 'strategy', 'SEA', 'super app'] },
]

const ALL_SPRINTS = [
  { name: 'Design Thinking Sprint',    month: 'January',   description: 'Customer empathy, problem framing, rapid prototyping and user testing. Build solutions people actually want.',  tags: ['product', 'marketplace', 'D2C', 'SaaS', 'validation'] },
  { name: 'Product Sprint',            month: 'February',  description: 'From idea to MVP — roadmapping, prioritisation, feature definition and launch planning in 3 days.',             tags: ['product', 'SaaS', 'tech', 'startup', 'MVP'] },
  { name: 'Marketing Sprint',          month: 'March',     description: 'Positioning, content strategy, paid and organic channels — build a 90-day marketing engine for your business.', tags: ['marketing', 'D2C', 'brand', 'content', 'growth'] },
  { name: 'Sales Sprint',              month: 'April',     description: 'B2B and B2C sales frameworks, cold outreach, demo scripts and closing techniques that actually work.',           tags: ['sales', 'B2B', 'revenue', 'marketplace', 'SaaS'] },
  { name: 'Fundraising Sprint',        month: 'May',       description: 'Investor narrative, pitch deck construction, metrics that matter and how to run a seed round in India.',         tags: ['fundraising', 'VC', 'seed', 'pitch', 'investors'] },
  { name: 'Leadership Sprint',         month: 'June',      description: 'Team building, culture, hiring your first 5 people and managing a founder team through high-pressure moments.',  tags: ['leadership', 'hiring', 'team', 'culture', 'scaling'] },
  { name: 'AI Tools Sprint',           month: 'July',      description: 'Automate your business using AI — from customer support to content generation to internal workflows.',           tags: ['AI', 'automation', 'tools', 'SaaS', 'tech', 'efficiency'] },
  { name: 'Growth Hacking Sprint',     month: 'August',    description: 'Referral loops, viral mechanics, SEO and organic growth — build compounding growth without burning cash.',      tags: ['growth', 'marketplace', 'D2C', 'consumer', 'SaaS'] },
  { name: 'Operations Sprint',         month: 'September', description: 'SOPs, unit economics, supply chain basics and building systems that run without the founder in the loop.',        tags: ['operations', 'marketplace', 'D2C', 'supply chain', 'scale'] },
  { name: 'Community & Network Sprint',month: 'October',   description: 'Build brand communities, leverage networks for distribution and turn customers into evangelists.',               tags: ['community', 'brand', 'D2C', 'marketplace', 'consumer'] },
  { name: 'Finance for Founders Sprint',month:'November',  description: 'Unit economics, P&L, cash flow, financial modelling basics every founder must understand before raising.',       tags: ['finance', 'fundraising', 'revenue', 'SaaS', 'D2C'] },
  { name: 'Scale & Expansion Sprint',  month: 'December',  description: 'How to expand cities, geographies and customer segments — the playbook for going from 1 to 10.',               tags: ['scale', 'expansion', 'marketplace', 'SaaS', 'D2C'] },
]

const SUNDAY_SESSIONS = [
  { city: 'Singapore',     theme: 'Investor Roundtable',      description: 'Pitch your business to a panel of active seed investors in Singapore and get live feedback on your fundraising narrative.' },
  { city: 'Mumbai',        theme: 'Founder Fireside',         description: 'A closed-room session with 3 Indian founders who have crossed ₹1Cr ARR — raw, unfiltered stories about what actually worked.' },
  { city: 'Dubai',         theme: 'GTM Masterclass',          description: 'Go-to-market strategy workshop with founders who have launched in the Middle East and India simultaneously.' },
  { city: 'Bangalore',     theme: 'Product-Market Fit Lab',   description: 'Hands-on workshop validating your PMF hypothesis with real customer interviews facilitated by senior product leaders.' },
  { city: 'San Francisco', theme: 'AI Tools Deep Dive',       description: 'Build and deploy AI automations for your business in a 6-hour hands-on session with engineers from top AI companies.' },
  { city: 'Singapore',     theme: 'Sales Simulation Day',     description: 'Role-play 10 real sales scenarios with trained facilitators. Cold calls, demos, objection handling and closing — all in one day.' },
  { city: 'Bali',          theme: 'Founder Reset',            description: 'A 2-day offsite combining deep strategy sessions with recovery — designed for founders hitting a wall at 0-1 stage.' },
  { city: 'Mumbai',        theme: 'Distribution Workshop',    description: 'WhatsApp commerce, channel partnerships and D2C distribution — a hands-on workshop for India market founders.' },
]

async function generatePersonalisedContent(
  founderName: string,
  businessName: string,
  businessCategory: string,
  businessDescription: string,
  businessStage: string,
  country: string,
  track1Name: string,
  track2Name: string,
  track3Name: string,
): Promise<any> {
  const prompt = `You are a startup advisor creating a personalised program roadmap for a founder.

FOUNDER: ${founderName}
BUSINESS: ${businessName}
CATEGORY: ${businessCategory}
DESCRIPTION: ${businessDescription}
STAGE: ${businessStage}
COUNTRY: ${country}
TRACKS: ${track1Name}, ${track2Name}, ${track3Name}

AVAILABLE MENTORS (pick 5 most relevant):
${ALL_MENTORS.map(m => `- ${m.key}: ${m.name} (${m.role}, ${m.company}) — expertise: ${m.expertise.join(', ')}`).join('\n')}

AVAILABLE SPRINTS (pick 3 most relevant):
${ALL_SPRINTS.map(s => `- ${s.name} (${s.month}): ${s.description} — tags: ${s.tags.join(', ')}`).join('\n')}

AVAILABLE SUNDAY SESSIONS (pick 3 most relevant):
${SUNDAY_SESSIONS.map(s => `- ${s.city}: ${s.theme} — ${s.description}`).join('\n')}

Generate a personalised program overview. Return ONLY valid JSON, no markdown, no explanation:
{
  "critical_warnings": [
    { "question": "short sharp question that creates fear — specific to this business, max 10 words, no answer" },
    { "question": "..." },
    { "question": "..." },
    { "question": "..." }
  ],
  "mentors": [
    { "key": "mentor_key_from_list", "reason": "1 sentence on what the founder will learn from this mentor in real world sessions" },
    { "key": "...", "reason": "..." },
    { "key": "...", "reason": "..." },
    { "key": "...", "reason": "..." },
    { "key": "...", "reason": "..." }
  ],
  "sprints": [
    { "name": "sprint name from list", "description": "original description", "relevance": "1 sentence why relevant to ${businessName}" },
    { "name": "...", "description": "...", "relevance": "..." },
    { "name": "...", "description": "...", "relevance": "..." }
  ],
  "sunday_sessions": [
    { "theme": "theme", "description": "original description", "relevance": "1 sentence why" },
    { "theme": "...", "description": "...", "relevance": "..." },
    { "theme": "...", "description": "...", "relevance": "..." }
  ],
  "timeline": [
    { "month": "Month 1", "milestone": "short milestone title", "description": "what they will achieve — specific to ${businessName}" },
    { "month": "Month 2", "milestone": "...", "description": "..." },
    { "month": "Month 3", "milestone": "...", "description": "..." },
    { "month": "Month 4", "milestone": "...", "description": "..." },
    { "month": "Month 5", "milestone": "...", "description": "..." },
    { "month": "Month 6", "milestone": "...", "description": "..." }
  ],
  "tools": ["tool1", "tool2", "tool3", "tool4", "tool5", "tool6"],
  "tools_highlight": "1 sentence on how these tools help ${businessName} specifically"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)

  // Hydrate mentor data from keys
  parsed.mentors = parsed.mentors.map((m: any) => {
    const mentor = ALL_MENTORS.find(am => am.key === m.key)
    return mentor ? { ...mentor, reason: m.reason } : m
  })

  return parsed
}

async function generateConcepts(
  businessName: string, businessCategory: string, businessDescription: string,
  businessStage: string, country: string,
  track1Name: string, track2Name: string, track3Name: string, slug: string
): Promise<{ tracks: Array<{ code: string; name: string; concepts: string[] }> }> {
  const prompt = `Generate 3 custom learning tracks for this founder:

BUSINESS: ${businessName}
CATEGORY: ${businessCategory}
DESCRIPTION: ${businessDescription}
STAGE: ${businessStage}
COUNTRY: ${country}

TRACK NAMES:
1. ${track1Name}
2. ${track2Name}
3. ${track3Name}

For each track, generate 8 concept titles specific to this business.
Return ONLY JSON:
{
  "tracks": [
    { "code": "${slug}_01", "name": "${track1Name}", "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"] },
    { "code": "${slug}_02", "name": "${track2Name}", "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"] },
    { "code": "${slug}_03", "name": "${track3Name}", "concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5", "concept 6", "concept 7", "concept 8"] }
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

    // Ensure unique slug
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data: existing } = await supabase.from('copilot_profiles').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const t1 = track1Name || 'Business Fundamentals'
    const t2 = track2Name || 'Revenue'
    const t3 = track3Name || 'Scale'

    // Run both Claude calls in parallel
    const [conceptResult, personalisedContent] = await Promise.all([
      generateConcepts(businessName, businessCategory, businessDescription, businessStage || '0-1', country || 'India', t1, t2, t3, slug),
      generatePersonalisedContent(founderName, businessName, businessCategory, businessDescription, businessStage || '0-1', country || 'India', t1, t2, t3),
    ])

    const { tracks } = conceptResult

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: founderName },
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const userId = authData.user.id

    await supabase.from('profiles').update({ full_name: founderName, status: 'active' }).eq('id', userId)

    // Seed competencies and concepts
    for (const track of tracks) {
      await supabase.from('competencies').upsert({
        code: track.code, name: track.name,
        description: `${businessName} — ${track.name}`,
        order_index: 100 + tracks.indexOf(track),
      }, { onConflict: 'code' })

      for (let i = 0; i < track.concepts.length; i++) {
        await supabase.from('concepts').upsert({
          competency_code: track.code,
          title: track.concepts[i],
          sequence: i + 1,
        }, { onConflict: 'competency_code,sequence' })
      }
    }

    // Assign tracks
    for (let i = 0; i < tracks.length; i++) {
      await supabase.from('student_competencies').insert({
        student_id: userId,
        competency_code: tracks[i].code,
        is_unlocked: true,
        status: i === 0 ? 'active' : 'paused',
      })
    }

    // Create copilot profile with personalised content
    await supabase.from('copilot_profiles').insert({
      user_id: userId, slug,
      founder_name: founderName, business_name: businessName,
      business_category: businessCategory, business_description: businessDescription,
      business_stage: businessStage || '0-1', country: country || 'India',
      email: email.trim().toLowerCase(), password_hint: password,
      track_1_code: tracks[0].code, track_2_code: tracks[1].code, track_3_code: tracks[2].code,
      personalised_content: personalisedContent,
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://launchpilot-phi.vercel.app'

    return NextResponse.json({
      ok: true, slug,
      email: email.trim().toLowerCase(), password,
      url: `${siteUrl}/copilot/${slug}`,
      tracks: tracks.map(t => ({ code: t.code, name: t.name, concepts: t.concepts.length })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
