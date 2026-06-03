import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ALL_MENTORS = [
  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',     company: 'Exited Entrepreneur',     img: '/images/mentors/prantik-mazumdar.jpg' },
  { name: 'Jason Kraus',        role: 'Founder, Prepare4VC',           company: 'Partner, EQx Fund',      img: '/images/mentors/jason-kraus.jpg' },
  { name: 'Renuka Belwalkar',   role: 'Investor',                      company: 'Forbes Under 30 Scholar', img: '/images/mentors/renuka-belwalkar.jpg' },
  { name: 'Yash Shah',          role: 'GenAI Head India & SEA',        company: 'Amazon Web Services',     img: '/images/mentors/yash-shah.jpg' },
  { name: 'Andrew Chow',        role: 'Co-Founder, Asia Pro Ventures', company: 'NTU Singapore',           img: '/images/mentors/andrew-chow.jpg' },
  { name: 'Daniel Ling',        role: 'ex-VP Design',                  company: 'DBS & Lazada',            img: '/images/mentors/daniel-ling.jpg' },
  { name: 'Rajesh Setty',       role: '19x Author',                    company: 'Founder Institute',       img: '/images/mentors/rajesh-shetty.jpg' },
  { name: 'Shavin Goswami',     role: 'Global Risk Ops',               company: 'Meta · ex-EY',            img: '/images/mentors/shavin-goswami.jpg' },
  { name: 'Sarvash Malani',     role: 'DeepTech VC',                   company: 'Temasek',                 img: '/images/mentors/sarvash-malani.jpg' },
  { name: 'Justin Strackany',   role: 'LP at GTMFund',                 company: '3 exits (Vista)',         img: '/images/mentors/justin-strackany.jpg' },
  { name: 'Gaurav Thakkar',     role: 'Principal VC',                  company: 'Silicon Road',            img: '/images/mentors/gaurav-thakkar.jpg' },
  { name: 'John Lim',           role: 'Partner',                       company: 'Meet Ventures SG',        img: '/images/mentors/john-lim.jpg' },
  { name: 'Sarvesh Tusnial',    role: 'Co-Founder, LaunchPilot',       company: 'ex-EY',                   img: '/images/mentors/sarvesh-tusnial.jpg' },
  { name: 'Bhavin Mehta',       role: 'Managing Director APAC',        company: 'Helpling',                img: '/images/mentors/bhavin-mehta.jpg' },
  { name: 'Sunil Kamath',       role: 'Founder and Partner',           company: 'Hustle Ventures',         img: '/images/mentors/sunil-kamath.jpg' },
  { name: 'Shlok Jain',         role: 'Product Manager',               company: 'Grab',                    img: '/images/mentors/shlok-jain.jpg' },
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

    const stored = (cp.personalised_content?.mentors || []).map((m: any) => ({
      ...m, img: ALL_MENTORS.find(a => a.name === m.name)?.img || '',
    }))
    const storedNames = new Set(stored.map((m: any) => m.name))
    const extra = ALL_MENTORS.filter(m => !storedNames.has(m.name)).slice(0, 8 - stored.length)
    const mentors = [...stored, ...extra].slice(0, 8)

    const prompt = `Write premium brochure content for a personalised AI coaching program.
FOUNDER: ${cp.founder_name}
BUSINESS: ${cp.business_name}
CATEGORY: ${cp.business_category}
DESCRIPTION: ${cp.business_description}
STAGE: ${cp.business_stage}
TRACKS: ${tracks.map((t: any) => t.name).join(', ')}

Return ONLY valid JSON, no markdown, no special characters outside ASCII:
{
  "tagline": "one powerful line max 10 words",
  "intro": "3 sentences on what this program achieves",
  "why_now": "2 sentences on why now is the right time",
  "outcomes": ["outcome 1","outcome 2","outcome 3","outcome 4","outcome 5"],
  "track_overviews": [
    {"overview":"2 sentences for track 1","outcomes":["o1","o2","o3"]},
    {"overview":"2 sentences for track 2","outcomes":["o1","o2","o3"]},
    {"overview":"2 sentences for track 3","outcomes":["o1","o2","o3"]}
  ],
  "maya_desc": "2 sentences on how Maya works for this founder",
  "hook_challenge": "the exact 5-minute challenge Maya gives in session 1 — no special characters",
  "founder_reply": "a good founder response — 1 sentence",
  "maya_followup": "Maya sharp followup — 1 sentence",
  "task": "real execution task Maya assigns — specific to their business",
  "eval_score": "82",
  "eval_strength": "what is strong about their submission — specific",
  "eval_fix": "what needs fixing — specific",
  "mentor_rationale": "2 sentences on why these mentors for this business",
  "critical_questions": ["question 1","question 2","question 3","question 4"],
  "closing": "2 sentences addressed to the founder"
}`

    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5', max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
    const bc = JSON.parse(text.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      cp, tracks, mentors, bc,
      timeline: cp.personalised_content?.timeline || [],
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
