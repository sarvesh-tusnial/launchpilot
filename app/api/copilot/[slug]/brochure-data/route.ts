import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ALL_MENTORS = [
  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',      company: 'Exited Entrepreneur',              img: '/images/mentors/prantik-mazumdar.jpg',  expertise: 'entrepreneurship, GTM, sales, India & SEA markets' },
  { name: 'Jason Kraus',        role: 'Founder, Prepare4VC',            company: 'Partner, EQx Fund',               img: '/images/mentors/jason-kraus.jpg',        expertise: 'fundraising, venture capital, pitch decks, seed rounds' },
  { name: 'Renuka Belwalkar',   role: 'Investor',                       company: 'Forbes Under 30 Scholar',         img: '/images/mentors/renuka-belwalkar.jpg',   expertise: 'D2C, brand building, content, women founders' },
  { name: 'Yash Shah',          role: 'GenAI Head India & SEA',         company: 'Amazon Web Services',             img: '/images/mentors/yash-shah.jpg',          expertise: 'AI, SaaS, cloud, product development, tech' },
  { name: 'Andrew Chow',        role: 'Co-Founder',                     company: 'Asia Pro Ventures · NTU',         img: '/images/mentors/andrew-chow.jpg',        expertise: 'marketplace, consumer products, Asia market entry' },
  { name: 'Daniel Ling',        role: 'ex-VP Design',                   company: 'DBS & Lazada',                    img: '/images/mentors/daniel-ling.jpg',        expertise: 'product design, growth loops, PLG, retention' },
  { name: 'Rajesh Setty',       role: '19x Author',                     company: 'Mentor at Founder Institute',     img: '/images/mentors/rajesh-shetty.jpg',      expertise: 'entrepreneurship, leadership, B2B, storytelling' },
  { name: 'Shavin Goswami',     role: 'Global Risk Ops',                company: 'Meta · ex-EY',                    img: '/images/mentors/shavin-goswami.jpg',     expertise: 'marketplace operations, scale, risk, consumer platforms' },
  { name: 'Sarvash Malani',     role: 'DeepTech VC',                    company: 'Temasek · Wharton Grad',          img: '/images/mentors/sarvash-malani.jpg',     expertise: 'fundraising, deep tech, AI, seed rounds, SaaS' },
  { name: 'Justin Strackany',   role: 'LP at GTMFund',                  company: '3 exits (SecureLink/Vista)',       img: '/images/mentors/justin-strackany.jpg',   expertise: 'GTM, B2B sales, SaaS exits, revenue growth' },
  { name: 'Gaurav Thakkar',     role: 'Principal VC',                   company: 'Silicon Road · ex-Morgan Stanley',img: '/images/mentors/gaurav-thakkar.jpg',     expertise: 'venture capital, India markets, consumer, growth' },
  { name: 'John Lim',           role: 'Partner',                        company: 'Meet Ventures SG',                img: '/images/mentors/john-lim.jpg',           expertise: 'brand, performance marketing, D2C, SEA markets' },
  { name: 'Sarvesh Tusnial',    role: 'Co-Founder, LaunchPilot',        company: 'ex-EY',                           img: '/images/mentors/sarvesh-tusnial.jpg',    expertise: 'edtech, platform building, sales, revenue, product' },
  { name: 'Bhavin Mehta',       role: 'Managing Director APAC',         company: 'Helpling',                        img: '/images/mentors/bhavin-mehta.jpg',       expertise: 'marketplace, home services, APAC scaling, operations' },
  { name: 'Sunil Kamath',       role: 'Founder and Partner',            company: 'Hustle Ventures',                 img: '/images/mentors/sunil-kamath.jpg',       expertise: 'consumer brands, distribution, partnerships, India' },
  { name: 'Shlok Jain',         role: 'Product Manager',                company: 'Grab',                            img: '/images/mentors/shlok-jain.jpg',         expertise: 'product, 0-to-1, fundraising, SEA markets, super apps' },
]

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createAdminClient()

    const { data: cp } = await supabase.from('copilot_profiles').select('*').eq('slug', slug).single()
    if (!cp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const trackCodes = [cp.track_1_code, cp.track_2_code, cp.track_3_code].filter(Boolean)
    const [tracksRes, conceptsRes] = await Promise.all([
      supabase.from('competencies').select('code, name').in('code', trackCodes),
      supabase.from('concepts').select('competency_code, title, sequence').in('competency_code', trackCodes).order('competency_code').order('sequence'),
    ])

    const tracks = trackCodes.map((code: string) => ({
      code,
      name: tracksRes.data?.find((t: any) => t.code === code)?.name || code,
      concepts: (conceptsRes.data || []).filter((c: any) => c.competency_code === code),
    }))

    const timeline = cp.personalised_content?.timeline || []

    const prompt = `You are writing a personalised brochure for a founder going through LaunchPilot's program.

FOUNDER: ${cp.founder_name}
BUSINESS: ${cp.business_name}
CATEGORY: ${cp.business_category}
DESCRIPTION: ${cp.business_description}
STAGE: ${cp.business_stage}
COUNTRY: ${cp.country}
TRACKS: ${tracks.map((t: any) => t.name).join(', ')}

ALL MENTORS (write 1 sentence on relevance to this specific business for each):
${ALL_MENTORS.map(m => `- ${m.name} (${m.role}, ${m.company}) — expertise: ${m.expertise}`).join('\n')}

ALL SPRINTS available (pick 6 most relevant, write why each matters for this business):
Design Thinking, Product Sprint, Marketing Sprint, Sales Sprint, Fundraising Sprint, Leadership Sprint, AI Tools Sprint, Growth Hacking, Operations Sprint, Finance for Founders, Community Sprint, Scale & Expansion

ALL SUNDAY SESSIONS (pick 5 most relevant, write why each matters):
Investor Roundtable, Founder Fireside, GTM Masterclass, PMF Lab, AI Tools Deep Dive, Sales Simulation Day, Distribution Workshop, Community Building

Return ONLY valid JSON, no markdown, no special characters:
{
  "tagline": "one powerful tagline for ${cp.business_name} max 10 words",
  "program_intro": "3 sentences on what LaunchPilot's program achieves for ${cp.business_name} specifically",
  "why_now": "2 sentences on why now is the right time for ${cp.business_name}",
  "track_overviews": [
    { "overview": "2 sentences on what this track covers for ${cp.business_name}", "outcomes": ["outcome 1", "outcome 2", "outcome 3"] },
    { "overview": "2 sentences for track 2", "outcomes": ["o1", "o2", "o3"] },
    { "overview": "2 sentences for track 3", "outcomes": ["o1", "o2", "o3"] }
  ],
  "ai_system_desc": "2 sentences on how our AI system works specifically for ${cp.business_name} and ${cp.founder_name}",
  "hook_challenge": "the exact 5-minute challenge the AI gives ${cp.founder_name} in session 1 — specific to ${cp.business_name}",
  "founder_reply": "a realistic founder response — 1 sentence",
  "ai_followup": "the AI sharp followup — 1 sentence",
  "task": "the real execution task assigned for their first concept — specific to ${cp.business_name}",
  "eval_score": "84",
  "eval_strength": "what is strong about their submission — specific to ${cp.business_name}",
  "eval_fix": "what needs fixing — specific to ${cp.business_name}",
  "mentor_relevance": {
    ${ALL_MENTORS.map(m => `"${m.name}": "1 sentence on why specifically relevant to ${cp.business_name}"`).join(',\n    ')}
  },
  "sprints": [
    { "name": "sprint name", "why": "1 sentence why relevant to ${cp.business_name}" },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." }
  ],
  "sessions": [
    { "name": "session name", "why": "1 sentence why relevant to ${cp.business_name}" },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." }
  ],
  "critical_questions": ["question 1 specific to ${cp.business_name}", "question 2", "question 3", "question 4"],
  "what_you_achieve": ["specific achievement 1 for ${cp.business_name} after the program", "achievement 2", "achievement 3", "achievement 4", "achievement 5"],
  "closing": "2 sentences addressed to ${cp.founder_name} — compelling close about what ${cp.business_name} can become"
}`

    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
    const bc = JSON.parse(text.replace(/```json|```/g, '').trim())

    return NextResponse.json({ cp, tracks, bc, timeline, allMentors: ALL_MENTORS })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
