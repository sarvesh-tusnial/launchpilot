import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'
import { exec } from 'child_process'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ALL_MENTORS = [
  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',       company: 'Exited Entrepreneur'              },
  { name: 'Jason Kraus',        role: 'Founder, Prepare4VC',             company: 'Partner, EQx Fund'               },
  { name: 'Renuka Belwalkar',   role: 'Investor',                        company: 'Forbes Under 30 Scholar'         },
  { name: 'Yash Shah',          role: 'GenAI Head India & SEA',          company: 'Amazon Web Services'             },
  { name: 'Andrew Chow',        role: 'Co-Founder, Asia Pro Ventures',   company: 'NTU Singapore'                   },
  { name: 'Daniel Ling',        role: 'ex-VP Design',                    company: 'DBS & Lazada'                    },
  { name: 'Rajesh Setty',       role: '19x Author',                      company: 'Mentor at Founder Institute'     },
  { name: 'Shavin Goswami',     role: 'Global Risk Ops',                 company: 'Meta · ex-EY'                    },
  { name: 'Sarvash Malani',     role: 'DeepTech VC',                     company: 'Temasek · Wharton Grad'          },
  { name: 'Justin Strackany',   role: 'LP at GTMFund',                   company: '3 exits (SecureLink/Vista)'      },
  { name: 'Gaurav Thakkar',     role: 'Principal VC',                    company: 'Silicon Road · ex-Morgan Stanley'},
  { name: 'John Lim',           role: 'Partner',                         company: 'Meet Ventures SG'                },
  { name: 'Sarvesh Tusnial',    role: 'Co-Founder, LaunchPilot',         company: 'ex-EY'                           },
  { name: 'Bhavin Mehta',       role: 'Managing Director APAC',          company: 'Helpling'                        },
  { name: 'Sunil Kamath',       role: 'Founder and Partner',             company: 'Hustle Ventures'                 },
  { name: 'Shlok Jain',         role: 'Product Manager',                 company: 'Grab'                            },
]

const ALL_SPRINTS = [
  { name: 'Design Thinking Sprint',      desc: 'Customer empathy, problem framing, ideation and rapid prototyping. Build solutions people actually want before you spend a single rupee building.' },
  { name: 'Product Sprint',              desc: 'From idea to MVP in 4 weeks — roadmapping, feature prioritisation, product definition and launch planning using modern product frameworks.' },
  { name: 'Marketing Sprint',            desc: 'Positioning, content strategy, paid and organic acquisition channels. Build a 90-day marketing engine that generates leads without burning cash.' },
  { name: 'Sales Sprint',                desc: 'B2B and B2C sales frameworks, cold outreach playbooks, demo scripts and closing techniques. Get to yes faster.' },
  { name: 'Fundraising Sprint',          desc: 'Investor narrative construction, pitch deck architecture, metrics that matter and how to run a seed round in India and SEA.' },
  { name: 'Leadership Sprint',           desc: 'Team building, culture design, hiring your first 5 people and managing a founding team through high-pressure growth moments.' },
  { name: 'AI Tools Sprint',             desc: 'Automate your business end-to-end with AI — customer support, content generation, internal workflows, product acceleration.' },
  { name: 'Growth Hacking Sprint',       desc: 'Referral loops, viral mechanics, SEO and organic growth systems. Build compounding growth without burning cash on paid acquisition.' },
  { name: 'Operations Sprint',           desc: 'SOPs, unit economics, supply chain fundamentals and systems that run without the founder in the loop. Scale without chaos.' },
  { name: 'Finance for Founders Sprint', desc: 'Unit economics, P&L management, cash flow modelling and the financial fundamentals every founder must understand before raising.' },
  { name: 'Community & Network Sprint',  desc: 'Build brand communities, leverage networks for distribution and turn your first 100 customers into evangelists who sell for you.' },
  { name: 'Scale & Expansion Sprint',    desc: 'How to expand to new cities, geographies and customer segments. The playbook for going from 1 market to 5 without losing quality.' },
]

const SUNDAY_SESSIONS = [
  { theme: 'Investor Roundtable',    desc: 'Pitch your business live to a panel of active seed investors. Get real-time feedback on your narrative, metrics and fundraising readiness.' },
  { theme: 'Founder Fireside',       desc: 'Closed-room with 3 founders who crossed Rs 1Cr ARR — raw, unfiltered stories about what actually worked and what almost killed their company.' },
  { theme: 'GTM Masterclass',        desc: 'Go-to-market strategy workshop with founders who have successfully launched in India and expanded across SEA simultaneously.' },
  { theme: 'PMF Lab',                desc: 'Hands-on workshop validating your PMF hypothesis with real customer interviews, facilitated by senior product leaders.' },
  { theme: 'AI Tools Deep Dive',     desc: 'Build and deploy AI automations for your specific business in a 6-hour hands-on session with engineers from top AI companies.' },
  { theme: 'Sales Simulation Day',   desc: 'Role-play 10 real sales scenarios — cold calls, demos, objection handling and closing. All in one day.' },
  { theme: 'Distribution Workshop',  desc: 'WhatsApp commerce, channel partnerships and D2C distribution for India market founders. Practical and immediately actionable.' },
  { theme: 'Community Building',     desc: 'Turn your first customers into brand ambassadors. Build distribution through community and create viral loops that compound.' },
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
CONCEPTS: ${concepts.map((c: any) => c.title).join(', ')}

Write rich, compelling brochure content. Return ONLY valid JSON, no markdown:
{
  "program_tagline": "one powerful tagline for this program — max 10 words",
  "program_intro": "3 sentences introducing this personalised program — why it exists, what it achieves, why now",
  "track_overviews": [
    { "name": "track name", "overview": "2-3 sentences on what this track covers and why it matters for this business", "key_outcomes": ["outcome 1","outcome 2","outcome 3","outcome 4"] },
    { "name": "track 2", "overview": "...", "key_outcomes": ["...","...","...","..."] },
    { "name": "track 3", "overview": "...", "key_outcomes": ["...","...","...","..."] }
  ],
  "mentor_selection_rationale": "2 sentences on why mentors were selected for this business specifically",
  "why_now": "2 sentences on why this is the right time for this business to go through this program",
  "expected_outcomes": ["specific outcome 1", "outcome 2", "outcome 3", "outcome 4", "outcome 5"],
  "maya_description": "2 sentences on how Maya will work specifically for this founder — mention their industry and specific challenges",
  "maya_chat_example": {
    "hook_challenge": "the exact timer challenge Maya would give this founder at the start of their first session — 1-2 sentences",
    "hook_response": "what a good founder response would look like — 1 sentence",
    "maya_followup": "Maya's sharp followup — 1 sentence",
    "accountability_check": "the accountability question Maya would ask at session 2 about a real action step from their business",
    "task_description": "the real execution task Maya would assign for their first concept — specific to their business, 2 sentences",
    "task_eval_strength": "what Maya would say is strong about their submission — specific, 1 sentence",
    "task_eval_fix": "what Maya would say needs fixing — specific, 1 sentence"
  },
  "critical_questions": ["question 1 this business must answer", "question 2", "question 3", "question 4"],
  "closing_message": "2 sentences — compelling close addressed to the founder about why this program will change their trajectory"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text.replace(/```json|```/g, '').trim())
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

    // Merge stored mentors + extra from full list up to 8
    const storedMentors = (cp.personalised_content?.mentors || []).map((m: any) => ({ name: m.name, role: m.role, company: m.company }))
    const storedNames = new Set(storedMentors.map((m: any) => m.name))
    const extraMentors = ALL_MENTORS.filter(m => !storedNames.has(m.name)).slice(0, 8 - storedMentors.length)
    const allMentors = [...storedMentors, ...extraMentors].slice(0, 8)

    const timeline = cp.personalised_content?.timeline || []

    // Generate rich Claude content
    const bc = await generateBrochureContent(cp, tracks, concepts)

    // Write data to a temp JSON file so Python can read it cleanly
    const id = randomUUID()
    const dataFile = join(tmpdir(), `brochure_data_${id}.json`)
    const outFile  = join(tmpdir(), `brochure_${id}.pdf`)

    await writeFile(dataFile, JSON.stringify({
      cp, tracks, concepts, allMentors, allSprints: ALL_SPRINTS,
      allSessions: SUNDAY_SESSIONS, bc, timeline,
    }))

    const pyScript = `
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

with open('${dataFile}') as f:
    data = json.load(f)

cp        = data['cp']
tracks    = data['tracks']
concepts  = data['concepts']
mentors   = data['allMentors']
sprints   = data['allSprints']
sessions  = data['allSessions']
bc        = data['bc']
timeline  = data['timeline']
maya      = bc.get('maya_chat_example', {})

ORANGE  = HexColor('#FF6A00')
DARK    = HexColor('#0A0A0F')
GRAY    = HexColor('#666666')
GREEN   = HexColor('#1D9E75')
RED     = HexColor('#D85A30')
CREAM   = HexColor('#FFF8F3')
PALE    = HexColor('#F9F9F9')
WHITE   = white

W, H = A4
doc = SimpleDocTemplate('${outFile}', pagesize=A4,
    leftMargin=18*mm, rightMargin=18*mm, topMargin=14*mm, bottomMargin=14*mm)

styles = getSampleStyleSheet()
def S(name, **kw):
    base = kw.pop('parent', styles['Normal'])
    return ParagraphStyle(name+str(id(kw)), parent=base, **kw)

def HR():
    return HRFlowable(width='100%', thickness=0.5, color=HexColor('#E8E8E8'), spaceAfter=6, spaceBefore=2)

def label_pill(text, color=None):
    c = color or ORANGE
    t = Table([[Paragraph(f'<b>{text.upper()}</b>',
        S('lp', fontSize=7, fontName='Helvetica-Bold', textColor=WHITE, leading=9))]])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),c),
        ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
        ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3),
    ]))
    return t

BODY  = S('bd', fontSize=10, textColor=HexColor('#333333'), leading=15, spaceAfter=4)
SMALL = S('sm', fontSize=9,  textColor=GRAY, leading=13, spaceAfter=3)
MONO  = S('mn', fontSize=8,  textColor=HexColor('#555555'), fontName='Courier', leading=11)
H1    = S('h1', fontSize=18, textColor=DARK, fontName='Helvetica-Bold', leading=22, spaceBefore=14, spaceAfter=4)
H2    = S('h2', fontSize=12, textColor=ORANGE, fontName='Helvetica-Bold', leading=16, spaceBefore=10, spaceAfter=3)
H3    = S('h3', fontSize=10, textColor=DARK, fontName='Helvetica-Bold', leading=14, spaceBefore=6, spaceAfter=2)

story = []

# ── COVER ──────────────────────────────────────────────────────────────
nav = Table([[
    Paragraph('<b>LaunchPilot</b> School', S('lg', fontSize=16, fontName='Helvetica-Bold', textColor=WHITE, leading=20)),
    Paragraph(f'Prepared exclusively for {cp["founder_name"]}',
        S('pr', fontSize=9, textColor=HexColor('#CCCCCC'), leading=12, alignment=2)),
]], colWidths=[100*mm, 77*mm])
nav.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1),DARK),
    ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
    ('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),12),
    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
]))
story.append(nav)
story.append(Spacer(1, 8*mm))

story.append(Paragraph('LaunchPilot Personalised Program for',
    S('sub', fontSize=11, textColor=GRAY, fontName='Helvetica', leading=14)))
story.append(Paragraph(cp['business_name'],
    S('biz', fontSize=40, fontName='Helvetica-Bold', textColor=DARK, leading=44, spaceAfter=4)))
story.append(HRFlowable(width='100%', thickness=3, color=ORANGE, spaceAfter=6, spaceBefore=0))
story.append(Paragraph(bc.get('program_tagline','Your personalised launch roadmap'),
    S('tg', fontSize=16, textColor=ORANGE, fontName='Helvetica', leading=20, spaceAfter=8)))

meta = Table([
    [Paragraph('Founder', MONO), Paragraph(f'<b>{cp["founder_name"]}</b>', BODY),
     Paragraph('Category', MONO), Paragraph(f'<b>{cp["business_category"]}</b>', BODY)],
    [Paragraph('Stage', MONO), Paragraph(f'<b>{cp["business_stage"]}</b>', BODY),
     Paragraph('Country', MONO), Paragraph(f'<b>{cp["country"]}</b>', BODY)],
], colWidths=[22*mm, 65*mm, 22*mm, 68*mm])
meta.setStyle(TableStyle([
    ('LINEBELOW',(0,0),(-1,-2),0.3,HexColor('#EEEEEE')),
    ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
    ('LEFTPADDING',(0,0),(-1,-1),0),
]))
story.append(meta)
story.append(Spacer(1,5*mm))
story.append(Paragraph(bc.get('program_intro',''), BODY))
story.append(Spacer(1,5*mm))
story.append(Paragraph(bc.get('why_now',''), S('wn', fontSize=10, textColor=HexColor('#444444'), leading=15, spaceAfter=4)))
story.append(PageBreak())

# ── EXPECTED OUTCOMES ──────────────────────────────────────────────────
story.append(Paragraph('What You Will Achieve', H1))
story.append(HR())
for i, o in enumerate(bc.get('expected_outcomes', [])):
    row = Table([[
        Paragraph(f'{i+1:02d}', S('on', fontSize=10, fontName='Helvetica-Bold', textColor=WHITE, leading=12, alignment=1)),
        Paragraph(o, BODY),
    ]], colWidths=[9*mm, 158*mm])
    row.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(0,0),ORANGE),('BACKGROUND',(1,0),(1,0),CREAM),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,0),(0,0),0),('LEFTPADDING',(1,0),(1,0),10),
        ('LINEBELOW',(0,0),(-1,-1),0.4,HexColor('#FFD0A0')),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ]))
    story.append(row)
    story.append(Spacer(1,2*mm))

# ── TRACKS ─────────────────────────────────────────────────────────────
story.append(Spacer(1,6*mm))
story.append(Paragraph('Your Learning Tracks', H1))
story.append(HR())
ovs = bc.get('track_overviews', [])
for ti, track in enumerate(tracks):
    ov = ovs[ti] if ti < len(ovs) else {}
    story.append(Paragraph(f'{ti+1:02d}.  {track["name"]}', H2))
    if ov.get('overview'):
        story.append(Paragraph(ov['overview'], BODY))
    tcs = [c for c in concepts if c['competency_code'] == track['code']]
    if tcs:
        rows = [[Paragraph(f'{c["sequence"]:02d}', MONO), Paragraph(c['title'], SMALL)] for c in tcs]
        t = Table(rows, colWidths=[9*mm, 158*mm])
        t.setStyle(TableStyle([
            ('LINEBELOW',(0,0),(-1,-2),0.2,HexColor('#EEEEEE')),
            ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3),
            ('LEFTPADDING',(0,0),(-1,-1),4),
            ('ROWBACKGROUNDS',(0,0),(-1,-1),[WHITE, PALE]),
        ]))
        story.append(t)
    kos = ov.get('key_outcomes', [])
    if kos:
        story.append(Spacer(1,3*mm))
        story.append(Paragraph('Key outcomes:', H3))
        for ko in kos:
            story.append(Paragraph(f'<font color="#FF6A00">+</font>  {ko}', SMALL))
    story.append(Spacer(1,4*mm))
story.append(PageBreak())

# ── MAYA AI CO-PILOT ───────────────────────────────────────────────────
story.append(Paragraph('Your AI Co-Pilot — Maya', H1))
story.append(HR())
story.append(Paragraph(bc.get('maya_description',''), BODY))
story.append(Spacer(1,4*mm))
story.append(Paragraph('The 8-Stage Learning Framework', H2))
stages = [
    ('01','Hook','Real challenge specific to your business. No lectures.'),
    ('02','Reality Check','Accountability on your last action. Maya does not let you skip.'),
    ('03','Teach & Coach','Core concepts through Socratic dialogue, with examples from your industry.'),
    ('04','Deep Dive','Edge cases, failure modes, hard pushback. Uncomfortable on purpose.'),
    ('05','Quiz Gate','5 scenario-based questions. Fail means re-teach, not skip.'),
    ('06','Execution Task','Real deliverable — scored on 6 dimensions by Maya immediately.'),
    ('07','Feedback Loop','What did this reveal? What assumption needs testing this week?'),
    ('08','Action & Bridge','One specific time-bound action. Then connected to the next concept.'),
]
srows = [[Paragraph(s[0],S('sn',fontSize=9,fontName='Helvetica-Bold',textColor=WHITE,leading=11,alignment=1)),
          Paragraph(f'<b>{s[1]}</b>',S('st',fontSize=9,fontName='Helvetica-Bold',textColor=DARK,leading=13)),
          Paragraph(s[2],SMALL)] for s in stages]
st = Table(srows, colWidths=[9*mm, 38*mm, 120*mm])
st.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(0,-1),ORANGE),
    ('ROWBACKGROUNDS',(1,0),(2,-1),[WHITE,CREAM]),
    ('LINEBELOW',(0,0),(-1,-2),0.3,HexColor('#EEEEEE')),
    ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
    ('LEFTPADDING',(0,0),(-1,-1),5),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
]))
story.append(st)
story.append(Spacer(1,6*mm))

# Maya chat screenshots — personalised to this founder
story.append(Paragraph('Maya In Action — Tailored to Your Business', H2))
story.append(Spacer(1,2*mm))

def chat_box(title, rows, accent=None):
    col = accent or ORANGE
    header = Table([[Paragraph(title, S('ch',fontSize=8,fontName='Helvetica-Bold',textColor=WHITE,leading=10))]],
        colWidths=[167*mm])
    header.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),DARK),
        ('LEFTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))
    msg_rows = []
    for sender, text, bg in rows:
        msg_rows.append([
            Paragraph(f'<b>{sender}</b>', S('ms',fontSize=8,fontName='Helvetica-Bold',textColor=WHITE,leading=10,alignment=1)),
            Paragraph(text, S('mt',fontSize=9,textColor=HexColor('#222222'),leading=13)),
        ])
    body = Table(msg_rows, colWidths=[12*mm, 155*mm])
    body.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(0,-1),col),
        ('ROWBACKGROUNDS',(1,0),(1,-1),[HexColor('#F5F5F5'),WHITE]),
        ('LINEBELOW',(0,0),(-1,-2),0.2,HexColor('#E0E0E0')),
        ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
        ('LEFTPADDING',(0,0),(0,0),0),('LEFTPADDING',(1,0),(1,0),10),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
    ]))
    border = Table([[header],[body]], colWidths=[167*mm])
    border.setStyle(TableStyle([
        ('BOX',(0,0),(-1,-1),1,HexColor('#E0E0E0')),
        ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
        ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
    ]))
    return border

hook_ch = maya.get('hook_challenge', f'You have 5 minutes. Find 3 real people who have the exact problem {cp["business_name"]} solves. Not friends. Real strangers online.')
hook_re = maya.get('hook_response', 'Found 4 people on Reddit complaining about exactly this.')
hook_fu = maya.get('maya_followup', "That's real signal. Now let's find out if they'd pay.")
story.append(chat_box(f'Session 1 — Hook Challenge · {cp["business_name"]}', [
    ('Maya', hook_ch, ORANGE),
    (cp['founder_name'].split()[0], hook_re, GREEN),
    ('Maya', hook_fu, ORANGE),
]))
story.append(Spacer(1,4*mm))

acc_q = maya.get('accountability_check', f'Last session you committed to contacting 5 potential customers for {cp["business_name"]}. How many did you actually reach?')
task_d = maya.get('task_description', f'Write a one-page pitch for {cp["business_name"]} covering the problem, your solution, and why you win.')
story.append(chat_box(f'Session 2 — Accountability & Execution Task', [
    ('Maya', acc_q, ORANGE),
    ('Maya', f'Good. Now your task: {task_d}', ORANGE),
]))
story.append(Spacer(1,4*mm))

eval_s = maya.get('task_eval_strength', 'Your problem statement is precise and grounded in real customer evidence.')
eval_f = maya.get('task_eval_fix', 'Your solution section needs one concrete example of how it works in practice.')
story.append(chat_box('Task Evaluation — Scored on 6 Dimensions', [
    ('Maya', f'Score: 81/100  PASS', GREEN),
    ('Maya', f'Strong: {eval_s}', GREEN),
    ('Maya', f'Fix: {eval_f}', HexColor('#BA7517')),
], accent=GREEN))
story.append(PageBreak())

# ── MENTORS ────────────────────────────────────────────────────────────
story.append(Paragraph('Your Mentor Network', H1))
story.append(HR())
story.append(Paragraph(bc.get('mentor_selection_rationale','Selected from 100+ mentors for their direct relevance to your business.'), BODY))
story.append(Spacer(1,3*mm))
mrows = [[
    Paragraph(f'{i+1:02d}', S('mn',fontSize=9,fontName='Helvetica-Bold',textColor=WHITE,leading=11,alignment=1)),
    Paragraph(f'<b>{m.get("name","")}</b>', S('nm',fontSize=10,fontName='Helvetica-Bold',textColor=DARK,leading=14)),
    Paragraph(m.get('role',''), SMALL),
    Paragraph(m.get('company',''), MONO),
] for i,m in enumerate(mentors)]
mt = Table(mrows, colWidths=[9*mm, 52*mm, 65*mm, 41*mm])
mt.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(0,-1),ORANGE),
    ('ROWBACKGROUNDS',(1,0),(3,-1),[WHITE,CREAM]),
    ('LINEBELOW',(0,0),(-1,-2),0.3,HexColor('#EEEEEE')),
    ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
    ('LEFTPADDING',(0,0),(-1,-1),5),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
]))
story.append(mt)
story.append(PageBreak())

# ── SPRINTS ────────────────────────────────────────────────────────────
story.append(Paragraph('Monthly Sprints — 4 Weeks Each', H1))
story.append(HR())
story.append(Paragraph('Intensive programs running every month. Join the ones most relevant to your stage and challenges.', BODY))
story.append(Spacer(1,3*mm))
srows2 = [[
    Paragraph(f'{i+1:02d}', S('sn2',fontSize=9,fontName='Helvetica-Bold',textColor=WHITE,leading=11,alignment=1)),
    Paragraph(f'<b>{s["name"]}</b>', S('sn3',fontSize=10,fontName='Helvetica-Bold',textColor=DARK,leading=14)),
    Paragraph(s['desc'], SMALL),
] for i,s in enumerate(sprints)]
spt = Table(srows2, colWidths=[9*mm, 52*mm, 106*mm])
spt.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(0,-1),ORANGE),
    ('ROWBACKGROUNDS',(1,0),(2,-1),[WHITE,CREAM]),
    ('LINEBELOW',(0,0),(-1,-2),0.3,HexColor('#EEEEEE')),
    ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
    ('LEFTPADDING',(0,0),(-1,-1),5),('VALIGN',(0,0),(-1,-1),'TOP'),
]))
story.append(spt)
story.append(PageBreak())

# ── SUNDAY SESSIONS ────────────────────────────────────────────────────
story.append(Paragraph('Sunday Experiential Sessions', H1))
story.append(HR())
story.append(Paragraph('Every Sunday, live online sessions designed for hands-on learning. You participate, you do, you learn.', BODY))
story.append(Spacer(1,3*mm))
sesr = [[
    Paragraph(f'<b>{s["theme"]}</b>', S('st2',fontSize=10,fontName='Helvetica-Bold',textColor=DARK,leading=14)),
    Paragraph(s['desc'], SMALL),
] for s in sessions]
sest = Table(sesr, colWidths=[52*mm, 115*mm])
sest.setStyle(TableStyle([
    ('LINEBELOW',(0,0),(-1,-2),0.3,HexColor('#EEEEEE')),
    ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
    ('LEFTPADDING',(0,0),(-1,-1),5),
    ('ROWBACKGROUNDS',(0,0),(-1,-1),[WHITE,PALE]),
    ('VALIGN',(0,0),(-1,-1),'TOP'),
]))
story.append(sest)
story.append(Spacer(1,5*mm))

# ── TIMELINE ───────────────────────────────────────────────────────────
if timeline:
    story.append(Paragraph('Your 6-Month Northstar', H1))
    story.append(HR())
    tlr = [[
        Paragraph(f'<b>{t.get("month","")}</b>', S('mo',fontSize=9,fontName='Helvetica-Bold',textColor=ORANGE,leading=12)),
        Paragraph(f'<b>{t.get("milestone","")}</b>', S('ms',fontSize=10,fontName='Helvetica-Bold',textColor=DARK,leading=14)),
        Paragraph(t.get('description',''), SMALL),
    ] for t in timeline]
    tlt = Table(tlr, colWidths=[22*mm, 48*mm, 97*mm])
    tlt.setStyle(TableStyle([
        ('LINEBELOW',(0,0),(-1,-2),0.3,HexColor('#EEEEEE')),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,0),(-1,-1),5),
        ('ROWBACKGROUNDS',(0,0),(-1,-1),[WHITE,CREAM]),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
    ]))
    story.append(tlt)
    story.append(Spacer(1,5*mm))

# ── CRITICAL QUESTIONS ─────────────────────────────────────────────────
story.append(Paragraph('Questions Your Business Must Answer', H1))
story.append(HR())
story.append(Paragraph('This program helps you confront and answer every one of these.', BODY))
story.append(Spacer(1,3*mm))
for q in bc.get('critical_questions', []):
    qt = Table([[
        Paragraph('?', S('qm',fontSize=14,fontName='Helvetica-Bold',textColor=WHITE,leading=16,alignment=1)),
        Paragraph(f'<b>{q}</b>', S('qq',fontSize=11,fontName='Helvetica-Bold',textColor=DARK,leading=16)),
    ]], colWidths=[10*mm, 157*mm])
    qt.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(0,0),RED),('BACKGROUND',(1,0),(1,0),HexColor('#FFF5F2')),
        ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
        ('LEFTPADDING',(0,0),(0,0),0),('LEFTPADDING',(1,0),(1,0),12),
        ('LINEBELOW',(0,0),(-1,-1),0.5,HexColor('#FFD0C0')),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ]))
    story.append(qt)
    story.append(Spacer(1,2*mm))
story.append(PageBreak())

# ── CLOSING ────────────────────────────────────────────────────────────
closing_h = Table([[Paragraph(
    f'Ready to launch {cp["business_name"]}?',
    S('cl',fontSize=22,fontName='Helvetica-Bold',textColor=WHITE,leading=26)
)]], colWidths=[177*mm])
closing_h.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1),DARK),
    ('LEFTPADDING',(0,0),(-1,-1),18),('TOPPADDING',(0,0),(-1,-1),18),('BOTTOMPADDING',(0,0),(-1,-1),14),
]))
story.append(closing_h)
closing_b = Table([[Paragraph(
    bc.get('closing_message','This program was built for you.'),
    S('cm',fontSize=11,textColor=DARK,leading=17)
)]], colWidths=[177*mm])
closing_b.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1),CREAM),
    ('LEFTPADDING',(0,0),(-1,-1),18),('TOPPADDING',(0,0),(-1,-1),14),('BOTTOMPADDING',(0,0),(-1,-1),14),
    ('LINEBELOW',(0,0),(-1,-1),3,ORANGE),
]))
story.append(closing_b)
story.append(Spacer(1,6*mm))
footer = Table([[
    Paragraph('<b>LaunchPilot</b> School', S('ft',fontSize=13,fontName='Helvetica-Bold',textColor=DARK,leading=16)),
    Paragraph('launchpilot-phi.vercel.app', S('ft2',fontSize=9,textColor=GRAY,leading=12,alignment=2)),
]], colWidths=[100*mm, 77*mm])
footer.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),0)]))
story.append(footer)

doc.build(story)
print("OK")
`

    const pyFile = join(tmpdir(), `brochure_py_${id}.py`)
    await writeFile(pyFile, pyScript)

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      exec(`python3 ${pyFile}`, { maxBuffer: 10 * 1024 * 1024 }, async (err, stdout, stderr) => {
        if (err) { reject(new Error(stderr || err.message)); return }
        try {
          const pdf = await readFile(outFile)
          await Promise.all([unlink(pyFile), unlink(dataFile), unlink(outFile)].map(p => p.catch(() => {})))
          resolve(pdf)
        } catch (e) { reject(e) }
      })
    })

    const filename = `${cp.business_name.replace(/[^a-z0-9]/gi, '-')}-LaunchPilot-Program.pdf`
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (e: any) {
    console.error('Brochure error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
