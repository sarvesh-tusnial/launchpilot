import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/db/server'
import { NextRequest, NextResponse } from 'next/server'

// Service role client — can create auth users
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const COMP_NAMES: Record<string, string> = {
  B01:'Product Management Fundamentals', B02:'Product Strategy & Vision', B03:'User Research & Insight',
  B04:'Growth Marketing & Acquisition',  B05:'Retention & Engagement',    B06:'Monetisation & Pricing',
  B07:'Distribution & Reach',            B08:'Metrics & Product Analytics',B09:'Go-to-Market Strategy',
  B10:'Stakeholder Management',          B11:'Operations & Scaling',       B12:'Consumer Psychology & Behaviour',
  F01:'Financial Modelling & Valuation', F02:'Corporate Finance & Capital Structure',
  F03:'Investment Analysis & Portfolio Mgmt', F04:'Venture Capital & Startup Finance',
  F05:'Investment Banking & Deal Execution',  F06:'Private Equity & Alt Investments',
  F07:'Financial Markets & Macro Economics',  F08:'FinTech & Digital Finance',
  F09:'Risk Management & Compliance',         F10:'Startup Fundraising & Investor Relations',
  F11:'Accounting & Financial Reporting',     F12:'ESG Investing & Sustainable Finance',
  A01:'AI & LLM Fundamentals',        A02:'AI Agents & Agentic Systems',    A03:'Prompt Engineering & LLM APIs',
  A04:'Machine Learning for Business', A05:'Data Strategy & Engineering',   A06:'Business Intelligence & Dashboarding',
  A07:'AI Product Management',         A08:'Automation & No-Code Systems',  A09:'AI Ethics, Safety & Governance',
  A10:'NLP & Language AI Applications',A11:'AI for Business Transformation',A12:'Computer Vision & Multimodal AI',
  M01:'Lean Manufacturing & Waste Elimination', M02:'Six Sigma & Quality Management',
  M03:'Supply Chain & Procurement',             M04:'Logistics & Distribution Operations',
  M05:'Demand Planning & Inventory Optimisation',M06:'Industrial AI & Predictive Maintenance',
  M07:'Industry 4.0 & Digital Twins',           M08:'Production Planning & Scheduling',
  M09:'Cost Engineering & Manufacturing Finance',M10:'Environmental, Health & Safety (EHS)',
  M11:'New Product Introduction (NPI)',          M12:'Plant Leadership & Workforce Management',
  G01:'Strategic Thinking',     G02:'Leadership & Management',    G03:'Communication & Storytelling',
  G04:'Data Analysis & Interpretation', G05:'AI Tools for Professionals', G06:'Problem Solving & Frameworks',
  G07:'Entrepreneurial Thinking',G08:'Negotiation & Influence',    G09:'Personal Productivity',
  G10:'Networking & Career Strategy',   G11:'Ethics, Sustainability & ESG',G12:'Global Business Context',
}

const PROGRAM_COMPETENCIES: Record<string, string[]> = {
  'PM MBA':                         ['B01','B02','B03','G04','B08','B10','B09','G06','B12','G02','G05','G01'],
  'PGP in Growth':                  ['B04','B05','B08','B07','B06','G04'],
  'PGP in Strategy & Leadership':   ['G01','G02','B10','B11','G08','G03'],
  'Certificate in Distribution':    ['B07','B04','B09'],
  'Finance MBA':                    ['F01','F02','F03','F07','F09','F11','G06','G01','G03','G04','G08','G12'],
  'PGP in Venture Capital':         ['F04','F03','F10','F01','G06','G07'],
  'PGP in Investment Banking':      ['F05','F01','F02','F06','G03','G08'],
  'PGP in FinTech':                 ['F08','F09','F07','G05','G06','G04'],
  'Certificate in Financial Modelling': ['F01','F11','F02'],
  'AI MBA':                         ['A01','A03','A02','A07','A11','A04','A05','A09','G06','G01','G04','G05'],
  'PGP in AI Agents':               ['A01','A02','A03','A10','A09','G05'],
  'PGP in Data & Analytics':        ['A04','A05','A06','G04','A10','G06'],
  'PGP in AI Strategy for Leaders': ['A11','A01','A09','G01','G02','G06'],
  'Certificate in Automation':      ['A08','A03','G05'],
  'Manufacturing MBA':              ['M01','M02','M03','M08','M09','M10','M11','M12','G01','G02','G06','G12'],
  'PGP in Supply Chain':            ['M03','M04','M05','M09','G06','G12'],
  'PGP in Industrial AI':           ['M06','M07','A12','G05','G04','G06'],
  'PGP in Lean & Ops Excellence':   ['M01','M02','M08','M10','M12','G02'],
  'Certificate in Lean Operations': ['M01','M02','M10'],
}

function getSchool(code: string) {
  const c = code[0]
  if (c === 'B') return 'business'
  if (c === 'F') return 'finance'
  if (c === 'A') return 'ai'
  if (c === 'M') return 'manufacturing'
  return 'generic'
}

export async function POST(req: NextRequest) {
  // Verify caller is an admin
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!callerProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { application_id, competency_codes } = await req.json()
  if (!application_id) return NextResponse.json({ error: 'application_id required' }, { status: 400 })

  // Get application
  const { data: app, error: appErr } = await adminClient.from('applications').select('*').eq('id', application_id).single()
  if (appErr || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const codes = competency_codes || PROGRAM_COMPETENCIES[app.program_name] || []
  if (codes.length === 0) return NextResponse.json({ error: `No competencies found for program: ${app.program_name}` }, { status: 400 })

  // Generate student ID and temp password
  const year      = new Date().getFullYear()
  const num       = String(Math.floor(Math.random() * 900) + 100)
  const studentId = `MG-${year}-${num}`
  const tempPass  = `Mentogram${num}!`

  // Check if auth user already exists
  let authUserId: string
  const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
  const existingUser = users?.find((u: any) => u.email === app.email)

  if (existingUser) {
    authUserId = existingUser.id
    await adminClient.auth.admin.updateUserById(authUserId, { password: tempPass })
  } else {
    const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
      email:         app.email,
      password:      tempPass,
      email_confirm: true,
    })
    if (authError || !newUser.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 500 })
    }
    authUserId = newUser.user.id
  }

  // Upsert profile
  const { error: profileErr } = await adminClient.from('profiles').upsert({
    id:               authUserId,
    full_name:        app.full_name,
    email:            app.email,
    student_id:       studentId,
    school:           app.school,
    program_name:     app.program_name,
    program_type:     app.program_type,
    status:           'active',
    job_title:        app.job_title,
    company:          app.company,
    years_experience: app.years_experience,
    is_admin:         false,
  })
  if (profileErr) return NextResponse.json({ error: `Profile error: ${profileErr.message}` }, { status: 500 })

  // Insert competencies
  const compRows = codes.map((code: string, i: number) => ({
    student_id:   authUserId,
    code,
    name:         COMP_NAMES[code] || code,
    school:       getSchool(code),
    program_name: app.program_name,
    sequence:     i + 1,
    status: i < 3 ? 'active' : 'locked',
  }))

  const { error: compErr } = await adminClient.from('student_competencies').insert(compRows)
  if (compErr) return NextResponse.json({ error: `Competency error: ${compErr.message}` }, { status: 500 })

  // Update application
  await adminClient.from('applications').update({
    status:     'approved',
    student_id: authUserId,
  }).eq('id', application_id)

  return NextResponse.json({
    ok:         true,
    name:       app.full_name,
    email:      app.email,
    student_id: studentId,
    temp_pass:  tempPass,
    comps:      codes.length,
  })
}
