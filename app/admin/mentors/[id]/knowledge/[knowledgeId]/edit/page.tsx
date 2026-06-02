import { requireAdmin } from '@/lib/auth/admin'
import KnowledgeForm from '@/components/admin/KnowledgeForm'
import { redirect } from 'next/navigation'

interface Props { params: Promise<{ id: string; knowledgeId: string }> }

const ALL_COMPETENCIES = [
  { code:'B01', name:'Product Management Fundamentals',    school:'business' },
  { code:'B02', name:'Product Strategy & Vision',          school:'business' },
  { code:'B03', name:'User Research & Insight',            school:'business' },
  { code:'B04', name:'Growth Marketing & Acquisition',     school:'business' },
  { code:'B05', name:'Retention & Engagement',             school:'business' },
  { code:'B06', name:'Monetisation & Pricing',             school:'business' },
  { code:'B07', name:'Distribution & Reach',               school:'business' },
  { code:'B08', name:'Metrics & Product Analytics',        school:'business' },
  { code:'B09', name:'Go-to-Market Strategy',              school:'business' },
  { code:'B10', name:'Stakeholder Management',             school:'business' },
  { code:'B11', name:'Operations & Scaling',               school:'business' },
  { code:'B12', name:'Consumer Psychology & Behaviour',    school:'business' },
  { code:'F01', name:'Financial Modelling & Valuation',         school:'finance' },
  { code:'F02', name:'Corporate Finance & Capital Structure',   school:'finance' },
  { code:'F03', name:'Investment Analysis & Portfolio Mgmt',    school:'finance' },
  { code:'F04', name:'Venture Capital & Startup Finance',       school:'finance' },
  { code:'F05', name:'Investment Banking & Deal Execution',     school:'finance' },
  { code:'F06', name:'Private Equity & Alt Investments',        school:'finance' },
  { code:'F07', name:'Financial Markets & Macro Economics',     school:'finance' },
  { code:'F08', name:'FinTech & Digital Finance',               school:'finance' },
  { code:'F09', name:'Risk Management & Compliance',            school:'finance' },
  { code:'F10', name:'Startup Fundraising & Investor Relations',school:'finance' },
  { code:'F11', name:'Accounting & Financial Reporting',        school:'finance' },
  { code:'F12', name:'ESG Investing & Sustainable Finance',     school:'finance' },
  { code:'A01', name:'AI & LLM Fundamentals',               school:'ai' },
  { code:'A02', name:'AI Agents & Agentic Systems',          school:'ai' },
  { code:'A03', name:'Prompt Engineering & LLM APIs',        school:'ai' },
  { code:'A04', name:'Machine Learning for Business',        school:'ai' },
  { code:'A05', name:'Data Strategy & Engineering',          school:'ai' },
  { code:'A06', name:'Business Intelligence & Dashboarding', school:'ai' },
  { code:'A07', name:'AI Product Management',                school:'ai' },
  { code:'A08', name:'Automation & No-Code Systems',         school:'ai' },
  { code:'A09', name:'AI Ethics, Safety & Governance',       school:'ai' },
  { code:'A10', name:'NLP & Language AI Applications',       school:'ai' },
  { code:'A11', name:'AI for Business Transformation',       school:'ai' },
  { code:'A12', name:'Computer Vision & Multimodal AI',      school:'ai' },
  { code:'M01', name:'Lean Manufacturing & Waste Elimination',   school:'manufacturing' },
  { code:'M02', name:'Six Sigma & Quality Management',           school:'manufacturing' },
  { code:'M03', name:'Supply Chain & Procurement',               school:'manufacturing' },
  { code:'M04', name:'Logistics & Distribution Operations',      school:'manufacturing' },
  { code:'M05', name:'Demand Planning & Inventory Optimisation', school:'manufacturing' },
  { code:'M06', name:'Industrial AI & Predictive Maintenance',   school:'manufacturing' },
  { code:'M07', name:'Industry 4.0 & Digital Twins',             school:'manufacturing' },
  { code:'M08', name:'Production Planning & Scheduling',         school:'manufacturing' },
  { code:'M09', name:'Cost Engineering & Manufacturing Finance',  school:'manufacturing' },
  { code:'M10', name:'Environmental, Health & Safety (EHS)',     school:'manufacturing' },
  { code:'M11', name:'New Product Introduction (NPI)',           school:'manufacturing' },
  { code:'M12', name:'Plant Leadership & Workforce Management',  school:'manufacturing' },
  { code:'G01', name:'Strategic Thinking',            school:'generic' },
  { code:'G02', name:'Leadership & Management',        school:'generic' },
  { code:'G03', name:'Communication & Storytelling',   school:'generic' },
  { code:'G04', name:'Data Analysis & Interpretation', school:'generic' },
  { code:'G05', name:'AI Tools for Professionals',     school:'generic' },
  { code:'G06', name:'Problem Solving & Frameworks',   school:'generic' },
  { code:'G07', name:'Entrepreneurial Thinking',       school:'generic' },
  { code:'G08', name:'Negotiation & Influence',        school:'generic' },
  { code:'G09', name:'Personal Productivity',          school:'generic' },
  { code:'G10', name:'Networking & Career Strategy',   school:'generic' },
  { code:'G11', name:'Ethics, Sustainability & ESG',   school:'generic' },
  { code:'G12', name:'Global Business Context',        school:'generic' },
]

export default async function EditKnowledgePage({ params }: Props) {
  const { id, knowledgeId } = await params
  const { supabase } = await requireAdmin()

  const [entryRes, mentorRes, biz, fin, ai, mfg, gen] = await Promise.all([
    supabase.from('mentor_knowledge').select('*').eq('id', knowledgeId).single(),
    supabase.from('mentors').select('name').eq('id', id).single(),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'business').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'finance').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'ai').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'manufacturing').order('competency_code').order('sequence'),
    supabase.from('concepts').select('id, title, sequence, competency_code').eq('school', 'generic').order('competency_code').order('sequence'),
  ])

  if (!entryRes.data) redirect(`/admin/mentors/${id}/knowledge`)

  const allConcepts = [
    ...(biz.data || []),
    ...(fin.data || []),
    ...(ai.data || []),
    ...(mfg.data || []),
    ...(gen.data || []),
  ].filter(c => c.competency_code)

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin · {mentorRes.data?.name}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>Edit Knowledge Entry</h1>
      </div>
      <KnowledgeForm mentorId={id} competencies={ALL_COMPETENCIES} concepts={allConcepts} knowledge={entryRes.data} />
    </div>
  )
}
