import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ALL_MENTORS = [
  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',     company: 'Exited Entrepreneur'               },
  { name: 'Jason Kraus',        role: 'Founder, Prepare4VC',           company: 'Partner, EQx Fund'                },
  { name: 'Renuka Belwalkar',   role: 'Investor',                      company: 'Forbes Under 30 Scholar'          },
  { name: 'Yash Shah',          role: 'GenAI Head India & SEA',        company: 'Amazon Web Services'              },
  { name: 'Andrew Chow',        role: 'Co-Founder, Asia Pro Ventures', company: 'NTU Singapore'                    },
  { name: 'Daniel Ling',        role: 'ex-VP Design',                  company: 'DBS & Lazada'                     },
  { name: 'Rajesh Setty',       role: '19x Author',                    company: 'Founder Institute'                },
  { name: 'Shavin Goswami',     role: 'Global Risk Ops',               company: 'Meta · ex-EY'                     },
  { name: 'Sarvash Malani',     role: 'DeepTech VC',                   company: 'Temasek · Wharton Grad'           },
  { name: 'Justin Strackany',   role: 'LP at GTMFund',                 company: '3 exits (SecureLink/Vista)'       },
  { name: 'Gaurav Thakkar',     role: 'Principal VC',                  company: 'Silicon Road · ex-Morgan Stanley' },
  { name: 'John Lim',           role: 'Partner',                       company: 'Meet Ventures SG'                 },
  { name: 'Sarvesh Tusnial',    role: 'Co-Founder, LaunchPilot',       company: 'ex-EY'                            },
  { name: 'Bhavin Mehta',       role: 'Managing Director APAC',        company: 'Helpling'                         },
  { name: 'Sunil Kamath',       role: 'Founder and Partner',           company: 'Hustle Ventures'                  },
  { name: 'Shlok Jain',         role: 'Product Manager',               company: 'Grab'                             },
]

const ALL_SPRINTS = [
  { name: 'Design Thinking Sprint',      desc: 'Customer empathy, problem framing, ideation and rapid prototyping. Build solutions people actually want.' },
  { name: 'Product Sprint',              desc: 'From idea to MVP — roadmapping, feature prioritisation, product definition and launch planning.' },
  { name: 'Marketing Sprint',            desc: 'Positioning, content strategy, paid and organic channels. Build a 90-day marketing engine.' },
  { name: 'Sales Sprint',                desc: 'B2B and B2C frameworks, cold outreach playbooks, demo scripts and closing techniques.' },
  { name: 'Fundraising Sprint',          desc: 'Investor narrative, pitch deck architecture, metrics and how to run a seed round in India and SEA.' },
  { name: 'Leadership Sprint',           desc: 'Team building, culture design, hiring your first 5 people, managing a founding team under pressure.' },
  { name: 'AI Tools Sprint',             desc: 'Automate your business with AI — support, content generation, workflows, product acceleration.' },
  { name: 'Growth Hacking Sprint',       desc: 'Referral loops, viral mechanics, SEO and organic growth. Compounding growth without burning cash.' },
  { name: 'Operations Sprint',           desc: 'SOPs, unit economics, supply chain basics and systems that run without the founder in the loop.' },
  { name: 'Finance for Founders Sprint', desc: 'Unit economics, P&L, cash flow modelling — financial fundamentals every founder must master.' },
  { name: 'Community & Network Sprint',  desc: 'Build brand communities, leverage networks and turn first 100 customers into evangelists.' },
  { name: 'Scale & Expansion Sprint',    desc: 'Expand to new cities and geographies. The playbook for going from 1 market to 5.' },
]

const SUNDAY_SESSIONS = [
  { theme: 'Investor Roundtable',    desc: 'Pitch live to seed investors. Get real-time feedback on your narrative and fundraising readiness.' },
  { theme: 'Founder Fireside',       desc: 'Closed-room with founders who crossed Rs 1Cr ARR — raw, unfiltered stories of what actually worked.' },
  { theme: 'GTM Masterclass',        desc: 'Go-to-market workshop with founders who launched across India and SEA simultaneously.' },
  { theme: 'PMF Lab',                desc: 'Validate your PMF hypothesis with real customer interviews, facilitated live by senior product leaders.' },
  { theme: 'AI Tools Deep Dive',     desc: 'Build and deploy AI automations for your business in a 6-hour hands-on session.' },
  { theme: 'Sales Simulation Day',   desc: 'Role-play 10 real sales scenarios — cold calls, demos, objection handling, closing.' },
  { theme: 'Distribution Workshop',  desc: 'WhatsApp commerce, channel partnerships and D2C distribution for India market founders.' },
  { theme: 'Community Building',     desc: 'Turn customers into brand ambassadors. Build distribution through community and viral loops.' },
]

async function generateBrochureContent(cp: any, tracks: any[], concepts: any[]) {
  const prompt = `You are writing a premium program brochure for a personalised AI coaching program.
FOUNDER: ${cp.founder_name}
BUSINESS: ${cp.business_name}
CATEGORY: ${cp.business_category}
DESCRIPTION: ${cp.business_description}
STAGE: ${cp.business_stage}
COUNTRY: ${cp.country}
TRACKS: ${tracks.map((t: any) => t.name).join(', ')}

Return ONLY valid JSON, no markdown:
{
  "program_tagline": "one powerful tagline max 10 words",
  "program_intro": "3 sentences on what this program achieves for this business",
  "why_now": "2 sentences on why now is the right time",
  "expected_outcomes": ["outcome 1","outcome 2","outcome 3","outcome 4","outcome 5"],
  "track_overviews": [
    {"name":"track 1","overview":"2 sentences","key_outcomes":["o1","o2","o3"]},
    {"name":"track 2","overview":"2 sentences","key_outcomes":["o1","o2","o3"]},
    {"name":"track 3","overview":"2 sentences","key_outcomes":["o1","o2","o3"]}
  ],
  "maya_description": "2 sentences on how Maya works specifically for this founder",
  "hook_challenge": "the exact 5-minute challenge Maya gives this founder in session 1 — 1 sentence",
  "task_description": "the real execution task Maya assigns for their first concept — specific to their business, 1 sentence",
  "eval_strength": "what Maya says is strong about their first submission — specific, 1 sentence",
  "eval_fix": "what Maya says needs fixing — specific, 1 sentence",
  "mentor_rationale": "2 sentences on why these mentors were selected for this business",
  "critical_questions": ["question 1","question 2","question 3","question 4"],
  "closing_message": "2 sentences — compelling close addressed to the founder"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

// ── PDF helpers ──────────────────────────────────────────────────────────
const ORANGE = rgb(1, 0.416, 0)        // #FF6A00
const DARK   = rgb(0.04, 0.04, 0.06)  // #0A0A0F
const GRAY   = rgb(0.4, 0.4, 0.4)
const WHITE  = rgb(1, 1, 1)
const CREAM  = rgb(1, 0.973, 0.953)   // #FFF8F3
const GREEN  = rgb(0.114, 0.62, 0.459)
const RED    = rgb(0.847, 0.353, 0.188)
const PALE   = rgb(0.976, 0.976, 0.976)

function wrap(text: string, maxChars: number): string[] {
  const words = text.replace(/\n/g, ' ').split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current.trim())
  return lines
}

type Fonts = { bold: any; regular: any; mono: any }

function drawRect(page: any, x: number, y: number, w: number, h: number, color: any) {
  page.drawRectangle({ x, y, width: w, height: h, color })
}

function drawText(page: any, text: string, x: number, y: number, size: number, color: any, font: any) {
  page.drawText(text, { x, y, size, color, font })
}

function sectionHeader(page: any, fonts: Fonts, title: string, y: number, pageW: number): number {
  drawText(page, title.toUpperCase(), 40, y, 9, ORANGE, fonts.bold)
  y -= 6
  page.drawLine({ start: { x: 40, y }, end: { x: pageW - 40, y }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) })
  return y - 14
}

function bodyText(page: any, fonts: Fonts, text: string, x: number, y: number, maxW: number, size = 10, color = DARK): number {
  const charsPerLine = Math.floor(maxW / (size * 0.52))
  const lines = wrap(text, charsPerLine)
  for (const line of lines) {
    if (y < 50) return y
    drawText(page, line, x, y, size, color, fonts.regular)
    y -= size + 4
  }
  return y
}

function addPage(pdfDoc: PDFDocument, fonts: Fonts) {
  const page = pdfDoc.addPage(PageSizes.A4)
  const { width, height } = page.getSize()
  return { page, width, height }
}

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
      code, name: tracksRes.data?.find((t: any) => t.code === code)?.name || code,
    }))
    const concepts = conceptsRes.data || []

    const storedMentors = (cp.personalised_content?.mentors || []).map((m: any) => ({ name: m.name, role: m.role, company: m.company }))
    const storedNames = new Set(storedMentors.map((m: any) => m.name))
    const extra = ALL_MENTORS.filter(m => !storedNames.has(m.name)).slice(0, 8 - storedMentors.length)
    const allMentors = [...storedMentors, ...extra].slice(0, 8)
    const timeline = cp.personalised_content?.timeline || []

    const bc = await generateBrochureContent(cp, tracks, concepts)

    // ── Build PDF ──────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create()
    pdfDoc.setTitle(`${cp.business_name} — LaunchPilot Program`)
    pdfDoc.setAuthor('LaunchPilot')

    const boldFont   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const monoFont   = await pdfDoc.embedFont(StandardFonts.Courier)
    const fonts: Fonts = { bold: boldFont, regular: regularFont, mono: monoFont }

    // ── PAGE 1: COVER ──────────────────────────────────────────────────
    let { page, width, height } = addPage(pdfDoc, fonts)
    let y = height

    // Nav bar
    drawRect(page, 0, height - 44, width, 44, DARK)
    drawText(page, 'LaunchPilot', 40, height - 26, 16, ORANGE, boldFont)
    drawText(page, ' School', 40 + boldFont.widthOfTextAtSize('LaunchPilot', 16), height - 26, 16, WHITE, boldFont)
    drawText(page, `Prepared for ${cp.founder_name}`, width - 40 - regularFont.widthOfTextAtSize(`Prepared for ${cp.founder_name}`, 9), height - 28, 9, rgb(0.8, 0.8, 0.8), regularFont)
    y = height - 44 - 28

    // Orange top bar accent
    drawRect(page, 40, y, width - 80, 3, ORANGE)
    y -= 24

    // Business name big
    const bizName = cp.business_name
    const bizSize = bizName.length > 18 ? 32 : 40
    drawText(page, bizName, 40, y, bizSize, DARK, boldFont)
    y -= bizSize + 8

    // Subtitle
    drawText(page, 'LaunchPilot Personalised Program', 40, y, 13, GRAY, regularFont)
    y -= 20

    // Tagline
    drawText(page, bc.program_tagline || 'Your personalised launch roadmap', 40, y, 14, ORANGE, boldFont)
    y -= 28

    // Divider
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) })
    y -= 20

    // Meta grid
    const metaItems = [
      ['Founder', cp.founder_name], ['Business', cp.business_name],
      ['Category', cp.business_category], ['Stage', cp.business_stage], ['Country', cp.country],
    ]
    for (const [label, value] of metaItems) {
      drawText(page, label.toUpperCase(), 40, y, 8, GRAY, monoFont)
      drawText(page, value, 140, y, 10, DARK, boldFont)
      y -= 18
      page.drawLine({ start: { x: 40, y: y + 4 }, end: { x: width - 40, y: y + 4 }, thickness: 0.3, color: rgb(0.9, 0.9, 0.9) })
    }
    y -= 12

    // Program intro
    y = bodyText(page, fonts, bc.program_intro || '', 40, y, width - 80, 10, DARK)
    y -= 8
    y = bodyText(page, fonts, bc.why_now || '', 40, y, width - 80, 10, GRAY)
    y -= 20

    // Expected outcomes box
    drawRect(page, 40, y - (bc.expected_outcomes?.length || 5) * 20 - 16, width - 80, (bc.expected_outcomes?.length || 5) * 20 + 36, CREAM)
    drawText(page, 'WHAT YOU WILL ACHIEVE', 52, y, 8, ORANGE, boldFont)
    y -= 16
    for (const [i, outcome] of (bc.expected_outcomes || []).entries()) {
      drawRect(page, 52, y - 2, 14, 14, ORANGE)
      drawText(page, `${i + 1}`, 57, y, 8, WHITE, boldFont)
      const lines = wrap(outcome, 90)
      drawText(page, lines[0] || '', 74, y + 2, 9, DARK, regularFont)
      y -= 20
    }

    // ── PAGE 2: TRACKS ─────────────────────────────────────────────────
    ;({ page, width, height } = addPage(pdfDoc, fonts))
    y = height - 50

    y = sectionHeader(page, fonts, 'Your Learning Tracks', y, width)
    const ovs = bc.track_overviews || []
    for (const [ti, track] of tracks.entries()) {
      if (y < 120) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      const ov = ovs[ti] || {}
      drawRect(page, 40, y - 4, 18, 18, ORANGE)
      drawText(page, `${ti + 1}`, 46, y, 10, WHITE, boldFont)
      drawText(page, track.name, 64, y, 13, DARK, boldFont)
      y -= 22
      if (ov.overview) { y = bodyText(page, fonts, ov.overview, 40, y, width - 80, 9, GRAY); y -= 4 }
      const tcs = concepts.filter((c: any) => c.competency_code === track.code)
      for (const c of tcs) {
        if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
        drawText(page, `${String(c.sequence).padStart(2, '0')}`, 40, y, 8, ORANGE, monoFont)
        drawText(page, c.title, 60, y, 9, DARK, regularFont)
        y -= 14
      }
      if ((ov.key_outcomes || []).length) {
        y -= 4
        drawText(page, 'Key outcomes:', 40, y, 8, DARK, boldFont)
        y -= 13
        for (const ko of ov.key_outcomes) {
          drawText(page, '+  ', 40, y, 8, ORANGE, boldFont)
          y = bodyText(page, fonts, ko, 55, y, width - 100, 8, GRAY); y -= 2
        }
      }
      y -= 14
    }

    // ── PAGE 3: MAYA AI ────────────────────────────────────────────────
    ;({ page, width, height } = addPage(pdfDoc, fonts))
    y = height - 50

    y = sectionHeader(page, fonts, 'Your AI Co-Pilot — Maya', y, width)
    y = bodyText(page, fonts, bc.maya_description || '', 40, y, width - 80, 10, DARK)
    y -= 14

    drawText(page, 'THE 8-STAGE LEARNING FRAMEWORK', 40, y, 8, ORANGE, boldFont)
    y -= 14
    const stages = [
      ['01','Hook','Real challenge specific to your business. No lectures.'],
      ['02','Reality Check','Accountability on your last action. Maya does not let you skip.'],
      ['03','Teach & Coach','Core concepts through dialogue, with examples from your industry.'],
      ['04','Deep Dive','Edge cases, failure modes, hard pushback on your assumptions.'],
      ['05','Quiz Gate','5 scenario-based questions. Fail means re-teach, not skip.'],
      ['06','Execution Task','Real deliverable scored on 6 dimensions by Maya immediately.'],
      ['07','Feedback Loop','What did this reveal? What assumption needs testing this week?'],
      ['08','Action & Bridge','One specific time-bound action. Then connected to the next concept.'],
    ]
    for (const [i, [num, name, desc]] of stages.entries()) {
      if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      const bg = i % 2 === 0 ? WHITE : PALE
      drawRect(page, 40, y - 4, width - 80, 18, bg)
      drawRect(page, 40, y - 4, 18, 18, ORANGE)
      drawText(page, num, 44, y, 8, WHITE, boldFont)
      drawText(page, name, 64, y, 9, DARK, boldFont)
      drawText(page, desc, 130, y, 8, GRAY, regularFont)
      y -= 20
    }
    y -= 12

    // Chat screenshots
    drawText(page, 'MAYA IN ACTION — TAILORED TO YOUR BUSINESS', 40, y, 8, ORANGE, boldFont)
    y -= 14

    const chatBoxes = [
      {
        title: `Session 1 — Hook Challenge`,
        msgs: [
          { from: 'Maya', text: bc.hook_challenge || `5-minute challenge: Find 3 real people who have the exact problem ${cp.business_name} solves. Not friends — real strangers online.`, color: ORANGE },
          { from: cp.founder_name.split(' ')[0], text: 'Found 4 people on Reddit complaining about exactly this problem.', color: GREEN },
          { from: 'Maya', text: "That's real signal. Now let's find out if they'd pay. Moving to Stage 2.", color: ORANGE },
        ]
      },
      {
        title: 'Execution Task & Evaluation',
        msgs: [
          { from: 'Maya', text: `Your task: ${bc.task_description || `Write a one-page pitch for ${cp.business_name} — problem, solution, why you win.`}`, color: ORANGE },
          { from: 'Eval', text: `Score: 82/100  PASS  |  Strong: ${bc.eval_strength || 'Clear problem statement grounded in customer evidence.'}`, color: GREEN },
          { from: 'Fix', text: bc.eval_fix || 'Add one concrete example of how the solution works in practice.', color: RED },
        ]
      },
    ]

    for (const box of chatBoxes) {
      if (y < 100) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      drawRect(page, 40, y - 6, width - 80, 16, DARK)
      drawText(page, box.title, 48, y, 8, WHITE, boldFont)
      y -= 18
      for (const msg of box.msgs) {
        const lines = wrap(msg.text, 90)
        const boxH = lines.length * 13 + 12
        drawRect(page, 40, y - boxH, width - 80, boxH, PALE)
        drawRect(page, 40, y - boxH, 36, boxH, msg.color)
        drawText(page, msg.from.substring(0, 5), 42, y - boxH / 2 - 4, 7, WHITE, boldFont)
        let ty = y - 10
        for (const line of lines) {
          drawText(page, line, 82, ty, 8, DARK, regularFont)
          ty -= 13
        }
        page.drawLine({ start: { x: 40, y: y - boxH }, end: { x: width - 40, y: y - boxH }, thickness: 0.3, color: rgb(0.88, 0.88, 0.88) })
        y -= boxH
      }
      y -= 10
    }

    // ── PAGE 4: MENTORS ────────────────────────────────────────────────
    ;({ page, width, height } = addPage(pdfDoc, fonts))
    y = height - 50

    y = sectionHeader(page, fonts, 'Your Mentor Network', y, width)
    y = bodyText(page, fonts, bc.mentor_rationale || 'Selected from 100+ mentors for their direct relevance to your business.', 40, y, width - 80, 10, DARK)
    y -= 10

    for (const [i, m] of allMentors.entries()) {
      if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      const bg = i % 2 === 0 ? WHITE : CREAM
      drawRect(page, 40, y - 6, width - 80, 22, bg)
      drawRect(page, 40, y - 6, 18, 22, ORANGE)
      drawText(page, String(i + 1).padStart(2, '0'), 43, y, 8, WHITE, boldFont)
      drawText(page, m.name, 64, y + 5, 10, DARK, boldFont)
      drawText(page, m.role, 64, y - 6, 8, GRAY, regularFont)
      const companyX = 64 + Math.max(boldFont.widthOfTextAtSize(m.name, 10), regularFont.widthOfTextAtSize(m.role, 8)) + 16
      drawText(page, m.company, companyX < 220 ? 220 : companyX, y, 8, GRAY, monoFont)
      y -= 24
    }

    // ── PAGE 5: SPRINTS + SESSIONS ─────────────────────────────────────
    ;({ page, width, height } = addPage(pdfDoc, fonts))
    y = height - 50

    y = sectionHeader(page, fonts, 'Monthly Sprints — 4 Weeks Each', y, width)
    drawText(page, 'Intensive programs every month — join the ones most relevant to your stage.', 40, y, 9, GRAY, regularFont)
    y -= 16

    for (const [i, s] of ALL_SPRINTS.entries()) {
      if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      const bg = i % 2 === 0 ? WHITE : PALE
      const lines = wrap(s.desc, 82)
      const boxH = lines.length * 12 + 16
      drawRect(page, 40, y - boxH, width - 80, boxH, bg)
      drawRect(page, 40, y - boxH, 18, boxH, ORANGE)
      drawText(page, String(i + 1).padStart(2, '0'), 43, y - boxH / 2 - 3, 8, WHITE, boldFont)
      drawText(page, s.name, 64, y - 8, 10, DARK, boldFont)
      let dy = y - 20
      for (const line of lines) { drawText(page, line, 64, dy, 8, GRAY, regularFont); dy -= 12 }
      y -= boxH + 2
    }

    // Sunday sessions
    if (y < 200) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
    y -= 10
    y = sectionHeader(page, fonts, 'Sunday Experiential Sessions', y, width)
    drawText(page, 'Every Sunday, live online — hands-on learning, not lectures.', 40, y, 9, GRAY, regularFont)
    y -= 16

    for (const [i, s] of SUNDAY_SESSIONS.entries()) {
      if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      const lines = wrap(s.desc, 88)
      const boxH = lines.length * 12 + 16
      const bg = i % 2 === 0 ? WHITE : PALE
      drawRect(page, 40, y - boxH, width - 80, boxH, bg)
      drawText(page, s.theme, 40, y - 8, 10, DARK, boldFont)
      let dy = y - 20
      for (const line of lines) { drawText(page, line, 40, dy, 8, GRAY, regularFont); dy -= 12 }
      page.drawLine({ start: { x: 40, y: y - boxH }, end: { x: width - 40, y: y - boxH }, thickness: 0.3, color: rgb(0.9, 0.9, 0.9) })
      y -= boxH + 2
    }

    // ── PAGE 6: TIMELINE + QUESTIONS + CLOSE ──────────────────────────
    ;({ page, width, height } = addPage(pdfDoc, fonts))
    y = height - 50

    if (timeline.length) {
      y = sectionHeader(page, fonts, 'Your 6-Month Northstar', y, width)
      for (const [i, t] of timeline.entries()) {
        if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
        const bg = i % 2 === 0 ? WHITE : CREAM
        const lines = wrap(t.description || '', 78)
        const boxH = lines.length * 12 + 16
        drawRect(page, 40, y - boxH, width - 80, boxH, bg)
        drawText(page, t.month || `Month ${i + 1}`, 40, y - 8, 9, ORANGE, boldFont)
        drawText(page, t.milestone || '', 100, y - 8, 10, DARK, boldFont)
        let dy = y - 20
        for (const line of lines) { drawText(page, line, 100, dy, 8, GRAY, regularFont); dy -= 12 }
        y -= boxH + 2
      }
      y -= 10
    }

    if (y < 160) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
    y = sectionHeader(page, fonts, 'Questions Your Business Must Answer', y, width)
    for (const q of (bc.critical_questions || [])) {
      if (y < 60) { ;({ page, width, height } = addPage(pdfDoc, fonts)); y = height - 50 }
      const lines = wrap(q, 90)
      const boxH = lines.length * 14 + 14
      drawRect(page, 40, y - boxH, width - 80, boxH, rgb(1, 0.961, 0.945))
      drawRect(page, 40, y - boxH, 18, boxH, RED)
      drawText(page, '?', 45, y - boxH / 2 - 4, 12, WHITE, boldFont)
      let dy = y - 12
      for (const line of lines) { drawText(page, line, 64, dy, 10, DARK, boldFont); dy -= 14 }
      page.drawLine({ start: { x: 40, y: y - boxH }, end: { x: width - 40, y: y - boxH }, thickness: 0.5, color: rgb(1, 0.82, 0.75) })
      y -= boxH + 6
    }

    y -= 16
    // Closing
    const closeText = `Ready to launch ${cp.business_name}?`
    drawRect(page, 40, y - 44, width - 80, 44, DARK)
    drawText(page, closeText, 52, y - 16, 16, WHITE, boldFont)
    drawText(page, 'LaunchPilot School', 52, y - 30, 9, rgb(0.8, 0.8, 0.8), regularFont)
    y -= 52
    drawRect(page, 40, y - 36, width - 80, 36, CREAM)
    const closeLines = wrap(bc.closing_message || 'This program was built for you.', 90)
    let cy = y - 12
    for (const line of closeLines) { drawText(page, line, 52, cy, 9, DARK, regularFont); cy -= 13 }
    page.drawLine({ start: { x: 40, y: y - 36 }, end: { x: width - 40, y: y - 36 }, thickness: 3, color: ORANGE })

    // ── Serialize & return ──────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save()
    const filename = `${cp.business_name.replace(/[^a-z0-9]/gi, '-')}-LaunchPilot-Program.pdf`

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (e: any) {
    console.error('Brochure error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
