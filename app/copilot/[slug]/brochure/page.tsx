import { createAdminClient } from '@/lib/db/server'
import { notFound } from 'next/navigation'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ALL_MENTORS = [
  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',     company: 'Exited Entrepreneur',              img: '/images/mentors/prantik-mazumdar.jpg' },
  { name: 'Jason Kraus',        role: 'Founder, Prepare4VC',           company: 'Partner, EQx Fund',               img: '/images/mentors/jason-kraus.jpg' },
  { name: 'Renuka Belwalkar',   role: 'Investor',                      company: 'Forbes Under 30 Scholar',         img: '/images/mentors/renuka-belwalkar.jpg' },
  { name: 'Yash Shah',          role: 'GenAI Head India & SEA',        company: 'Amazon Web Services',             img: '/images/mentors/yash-shah.jpg' },
  { name: 'Andrew Chow',        role: 'Co-Founder, Asia Pro Ventures', company: 'NTU Singapore',                   img: '/images/mentors/andrew-chow.jpg' },
  { name: 'Daniel Ling',        role: 'ex-VP Design',                  company: 'DBS & Lazada',                    img: '/images/mentors/daniel-ling.jpg' },
  { name: 'Rajesh Setty',       role: '19x Author',                    company: 'Founder Institute',               img: '/images/mentors/rajesh-shetty.jpg' },
  { name: 'Shavin Goswami',     role: 'Global Risk Ops',               company: 'Meta · ex-EY',                    img: '/images/mentors/shavin-goswami.jpg' },
  { name: 'Sarvash Malani',     role: 'DeepTech VC',                   company: 'Temasek · Wharton Grad',          img: '/images/mentors/sarvash-malani.jpg' },
  { name: 'Justin Strackany',   role: 'LP at GTMFund',                 company: '3 exits (Vista)',                 img: '/images/mentors/justin-strackany.jpg' },
  { name: 'Gaurav Thakkar',     role: 'Principal VC',                  company: 'Silicon Road',                    img: '/images/mentors/gaurav-thakkar.jpg' },
  { name: 'John Lim',           role: 'Partner',                       company: 'Meet Ventures SG',                img: '/images/mentors/john-lim.jpg' },
  { name: 'Sarvesh Tusnial',    role: 'Co-Founder, LaunchPilot',       company: 'ex-EY',                           img: '/images/mentors/sarvesh-tusnial.jpg' },
  { name: 'Bhavin Mehta',       role: 'Managing Director APAC',        company: 'Helpling',                        img: '/images/mentors/bhavin-mehta.jpg' },
  { name: 'Sunil Kamath',       role: 'Founder and Partner',           company: 'Hustle Ventures',                 img: '/images/mentors/sunil-kamath.jpg' },
  { name: 'Shlok Jain',         role: 'Product Manager',               company: 'Grab',                            img: '/images/mentors/shlok-jain.jpg' },
]

const ALL_SPRINTS = [
  { name: 'Design Thinking',      desc: 'Customer empathy, problem framing, ideation and rapid prototyping. Build solutions people actually want.' },
  { name: 'Product Sprint',       desc: 'From idea to MVP — roadmapping, feature prioritisation, product definition and launch planning.' },
  { name: 'Marketing Sprint',     desc: 'Positioning, content strategy, paid and organic channels. Build a 90-day marketing engine.' },
  { name: 'Sales Sprint',         desc: 'B2B and B2C frameworks, cold outreach playbooks, demo scripts and closing techniques.' },
  { name: 'Fundraising Sprint',   desc: 'Investor narrative, pitch deck architecture, metrics and how to run a seed round.' },
  { name: 'Leadership Sprint',    desc: 'Team building, culture design, hiring your first 5 people, managing under pressure.' },
  { name: 'AI Tools Sprint',      desc: 'Automate your business with AI — support, content, workflows, product acceleration.' },
  { name: 'Growth Hacking',       desc: 'Referral loops, viral mechanics, SEO and organic growth without burning cash.' },
  { name: 'Operations Sprint',    desc: 'SOPs, unit economics, supply chain basics and systems that run without the founder.' },
  { name: 'Finance for Founders', desc: 'Unit economics, P&L, cash flow modelling — financial fundamentals every founder must master.' },
  { name: 'Community Sprint',     desc: 'Build brand communities and turn first 100 customers into evangelists who sell for you.' },
  { name: 'Scale & Expansion',    desc: 'Expand to new cities and geographies. The playbook for going from 1 market to 5.' },
]

const SUNDAY_SESSIONS = [
  { theme: 'Investor Roundtable',   desc: 'Pitch live to seed investors. Real-time feedback on narrative and fundraising readiness.' },
  { theme: 'Founder Fireside',      desc: 'Closed-room with founders who crossed Rs. 1Cr ARR — raw stories of what actually worked.' },
  { theme: 'GTM Masterclass',       desc: 'Go-to-market with founders who launched across India and SEA simultaneously.' },
  { theme: 'PMF Lab',               desc: 'Validate your PMF hypothesis with real customer interviews, facilitated live.' },
  { theme: 'AI Tools Deep Dive',    desc: 'Build and deploy AI automations for your business in a 6-hour hands-on session.' },
  { theme: 'Sales Simulation Day',  desc: 'Role-play 10 real sales scenarios — cold calls, demos, objection handling, closing.' },
  { theme: 'Distribution Workshop', desc: 'WhatsApp commerce, channel partnerships and D2C distribution for India founders.' },
  { theme: 'Community Building',    desc: 'Turn customers into brand ambassadors and build viral distribution loops.' },
]

async function getBrochureData(slug: string) {
  const supabase = await createAdminClient()
  const { data: cp } = await supabase.from('copilot_profiles').select('*').eq('slug', slug).single()
  if (!cp) return null

  const trackCodes = [cp.track_1_code, cp.track_2_code, cp.track_3_code].filter(Boolean)
  const [tracksRes, conceptsRes] = await Promise.all([
    supabase.from('competencies').select('code, name').in('code', trackCodes),
    supabase.from('concepts').select('competency_code, title, sequence').in('competency_code', trackCodes).order('competency_code').order('sequence'),
  ])

  const tracks = trackCodes.map((code: string) => ({
    code, name: tracksRes.data?.find((t: any) => t.code === code)?.name || code,
    concepts: (conceptsRes.data || []).filter((c: any) => c.competency_code === code),
  }))

  // Mentors — stored ones + top up to 8
  const stored = (cp.personalised_content?.mentors || [])
  const storedNames = new Set(stored.map((m: any) => m.name))
  const extra = ALL_MENTORS.filter(m => !storedNames.has(m.name)).slice(0, 8 - stored.length)
  const mentors = [...stored, ...extra].slice(0, 8).map((m: any) => ({
    ...m,
    img: m.img || ALL_MENTORS.find(am => am.name === m.name)?.img || '',
  }))

  // Generate rich content via Claude
  const prompt = `Write a premium brochure for this personalised program.
FOUNDER: ${cp.founder_name}
BUSINESS: ${cp.business_name}
CATEGORY: ${cp.business_category}
DESCRIPTION: ${cp.business_description}
STAGE: ${cp.business_stage}
TRACKS: ${tracks.map(t => t.name).join(', ')}

Return ONLY valid JSON:
{
  "tagline": "one powerful line, max 10 words",
  "intro": "3 sentences on what this program achieves",
  "why_now": "2 sentences on why now is the right time",
  "outcomes": ["outcome 1","outcome 2","outcome 3","outcome 4","outcome 5"],
  "track_overviews": [
    {"overview":"2 sentences for track 1","outcomes":["o1","o2","o3"]},
    {"overview":"2 sentences for track 2","outcomes":["o1","o2","o3"]},
    {"overview":"2 sentences for track 3","outcomes":["o1","o2","o3"]}
  ],
  "maya_desc": "2 sentences on how Maya works for this founder specifically",
  "hook_challenge": "the exact 5-minute challenge Maya gives this founder in session 1",
  "founder_reply": "what a good response looks like — 1 sentence",
  "maya_followup": "Maya's sharp followup — 1 sentence",
  "task": "the real execution task Maya assigns — specific to their business",
  "eval_score": "82",
  "eval_strength": "what Maya says is strong — specific to this business",
  "eval_fix": "what Maya says needs fixing — specific",
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

  return { cp, tracks, mentors, bc, timeline: cp.personalised_content?.timeline || [] }
}

export default async function BrochurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getBrochureData(slug)
  if (!data) notFound()
  const { cp, tracks, mentors, bc, timeline } = data
  const firstName = cp.founder_name.split(' ')[0]

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{cp.business_name} — LaunchPilot Program</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'DM Sans',sans-serif;background:#fff;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .serif{font-family:'Playfair Display',serif}
          .mono{font-family:'DM Mono',monospace}
          .page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative;overflow:hidden}
          @media screen{.page{box-shadow:0 4px 40px rgba(0,0,0,0.12);margin:20px auto}}
          @media print{
            body{margin:0}.page{width:210mm;margin:0;box-shadow:none;page-break-after:always}
            .no-print{display:none!important}
            @page{size:A4;margin:0}
          }
          /* Print button */
          .print-bar{position:fixed;top:0;left:0;right:0;z-index:100;background:#0A0A0F;padding:12px 40px;display:flex;align-items:center;justify-content:space-between}
          .print-btn{padding:10px 28px;background:#FF6A00;color:#fff;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px}
          .print-btn:hover{opacity:0.88}
          @media screen{body{padding-top:56px}}
        `}</style>
      </head>
      <body>

        {/* Print bar */}
        <div className="print-bar no-print">
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'15px',fontWeight:'700',color:'#FF6A00',fontFamily:'Playfair Display,serif'}}>Launch<span style={{color:'#fff'}}>Pilot</span></span>
            <span style={{fontSize:'11px',color:'#555',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.1em'}}>Brochure Preview</span>
          </div>
          <button className="print-btn" onClick={() => (window as any).print()}>
            ⬇ Download PDF
          </button>
        </div>

        {/* ── PAGE 1: COVER ── */}
        <div className="page" style={{display:'flex',flexDirection:'column'}}>
          {/* Dark header */}
          <div style={{background:'#0A0A0F',padding:'32px 48px 40px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,right:0,width:'300px',height:'300px',background:'rgba(255,106,0,0.06)',borderRadius:'50%',transform:'translate(100px,-100px)'}} />
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'48px'}}>
              <div>
                <div style={{fontSize:'22px',fontWeight:'800',color:'#fff',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>
                  Launch<span style={{color:'#FF6A00'}}>Pilot</span>
                </div>
                <div style={{fontSize:'9px',color:'#555',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.2em',marginTop:'2px'}}>School</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'10px',color:'#555',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.1em'}}>Prepared exclusively for</div>
                <div style={{fontSize:'14px',color:'#AAA',fontWeight:'600',marginTop:'2px'}}>{cp.founder_name}</div>
              </div>
            </div>
            <div style={{fontSize:'11px',color:'#FF8C00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:'12px'}}>LaunchPilot Personalised Program for</div>
            <div style={{fontSize:'64px',fontWeight:'900',color:'#fff',fontFamily:'Playfair Display,serif',lineHeight:'1.0',letterSpacing:'-0.03em',marginBottom:'16px'}}>{cp.business_name}</div>
            <div style={{width:'80px',height:'4px',background:'#FF6A00',borderRadius:'2px',marginBottom:'20px'}} />
            <div style={{fontSize:'20px',color:'#FF8C00',fontFamily:'Playfair Display,serif',fontStyle:'italic',lineHeight:'1.3'}}>{bc.tagline}</div>
          </div>

          {/* Meta strip */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',borderBottom:'1px solid #F0F0F0'}}>
            {[['Founder',cp.founder_name],['Business',cp.business_name],['Category',cp.business_category],['Stage',cp.business_stage],['Country',cp.country]].map(([l,v])=>(
              <div key={l} style={{padding:'14px 20px',borderRight:'1px solid #F0F0F0'}}>
                <div style={{fontSize:'8px',color:'#999',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'4px'}}>{l}</div>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#111'}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Intro */}
          <div style={{padding:'36px 48px',flex:1,display:'flex',flexDirection:'column',gap:'24px'}}>
            <div>
              <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'8px'}}>About this program</div>
              <p style={{fontSize:'13px',color:'#444',lineHeight:'1.8'}}>{bc.intro}</p>
              <p style={{fontSize:'13px',color:'#888',lineHeight:'1.8',marginTop:'8px'}}>{bc.why_now}</p>
            </div>

            {/* Outcomes */}
            <div>
              <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'12px'}}>What you will achieve</div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {(bc.outcomes||[]).map((o:string,i:number)=>(
                  <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start',padding:'10px 14px',background:'#FFF8F3',border:'1px solid rgba(255,106,0,0.15)',borderRadius:'8px',borderLeft:'3px solid #FF6A00'}}>
                    <span style={{fontSize:'10px',fontWeight:'800',color:'#FF6A00',fontFamily:'DM Mono,monospace',flexShrink:0,marginTop:'1px'}}>0{i+1}</span>
                    <span style={{fontSize:'12px',color:'#333',lineHeight:'1.5'}}>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 2: TRACKS ── */}
        <div className="page" style={{padding:'48px'}}>
          <div style={{borderBottom:'3px solid #FF6A00',paddingBottom:'12px',marginBottom:'32px'}}>
            <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'6px'}}>Curriculum</div>
            <div style={{fontSize:'28px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>Your 3 Learning Tracks</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>
            {tracks.map((t:any,ti:number)=>{
              const ov = bc.track_overviews?.[ti] || {}
              return (
                <div key={t.code} style={{border:'1px solid #F0F0F0',borderRadius:'12px',overflow:'hidden'}}>
                  <div style={{background:'#0A0A0F',padding:'16px 24px',display:'flex',alignItems:'center',gap:'14px'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'rgba(255,106,0,0.15)',border:'1px solid rgba(255,106,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'11px',fontWeight:'800',color:'#FF6A00',fontFamily:'DM Mono,monospace'}}>0{ti+1}</span>
                    </div>
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#fff',fontFamily:'Playfair Display,serif'}}>{t.name}</div>
                  </div>
                  <div style={{padding:'16px 24px',background:'#FAFAFA',borderBottom:'1px solid #F0F0F0'}}>
                    <p style={{fontSize:'12px',color:'#666',lineHeight:'1.7'}}>{ov.overview}</p>
                    {(ov.outcomes||[]).length>0&&(
                      <div style={{display:'flex',gap:'8px',marginTop:'10px',flexWrap:'wrap'}}>
                        {ov.outcomes.map((o:string,i:number)=>(
                          <span key={i} style={{fontSize:'10px',color:'#FF6A00',background:'rgba(255,106,0,0.08)',border:'1px solid rgba(255,106,0,0.2)',padding:'3px 10px',borderRadius:'100px'}}>+ {o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{padding:'16px 24px'}}>
                    <div style={{fontSize:'8px',color:'#999',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'10px'}}>8 Concepts</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
                      {t.concepts.map((c:any)=>(
                        <div key={c.sequence} style={{display:'flex',gap:'8px',alignItems:'center',padding:'5px 8px',background:'#F8F8F8',borderRadius:'5px'}}>
                          <span style={{fontSize:'9px',fontWeight:'700',color:'#FF6A00',fontFamily:'DM Mono,monospace',flexShrink:0}}>{String(c.sequence).padStart(2,'0')}</span>
                          <span style={{fontSize:'10px',color:'#333',lineHeight:'1.4'}}>{c.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── PAGE 3: MAYA ── */}
        <div className="page" style={{padding:'48px'}}>
          <div style={{borderBottom:'3px solid #FF6A00',paddingBottom:'12px',marginBottom:'32px'}}>
            <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'6px'}}>AI Co-Pilot</div>
            <div style={{fontSize:'28px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>Meet Maya</div>
          </div>
          <p style={{fontSize:'13px',color:'#444',lineHeight:'1.8',marginBottom:'28px'}}>{bc.maya_desc}</p>

          {/* 8 stages */}
          <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'12px'}}>The 8-Stage Learning Framework</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'32px'}}>
            {[
              ['01','Hook','Real challenge specific to your business. No lectures.'],
              ['02','Reality Check','Accountability on your last action. Maya never lets you skip.'],
              ['03','Teach & Coach','Core concepts through dialogue with industry-specific examples.'],
              ['04','Deep Dive','Edge cases, failure modes, hard pushback on your assumptions.'],
              ['05','Quiz Gate','5 scenario-based questions. Fail means re-teach, not skip.'],
              ['06','Execution Task','Real deliverable scored on 6 dimensions by Maya immediately.'],
              ['07','Feedback Loop','What did this reveal? What assumption needs testing this week?'],
              ['08','Action & Bridge','One time-bound action, then connected to the next concept.'],
            ].map(([n,name,desc])=>(
              <div key={n} style={{display:'flex',gap:'10px',padding:'10px 12px',background:'#F8F8F8',borderRadius:'8px',border:'1px solid #EEEEEE'}}>
                <div style={{width:'24px',height:'24px',borderRadius:'6px',background:'#FF6A00',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:'9px',fontWeight:'800',color:'#fff',fontFamily:'DM Mono,monospace'}}>{n}</span>
                </div>
                <div>
                  <div style={{fontSize:'11px',fontWeight:'700',color:'#111',marginBottom:'2px'}}>{name}</div>
                  <div style={{fontSize:'10px',color:'#888',lineHeight:'1.4'}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Maya chat screenshots */}
          <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'12px'}}>Maya in action — tailored to {cp.business_name}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>

            {/* Screenshot 1 — Hook */}
            <div style={{border:'1px solid #E8E8E8',borderRadius:'10px',overflow:'hidden'}}>
              <div style={{background:'#0A0A0F',padding:'8px 14px',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{display:'flex',gap:'4px'}}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{width:'7px',height:'7px',borderRadius:'50%',background:c,opacity:0.6}}/>)}</div>
                <span style={{fontSize:'9px',color:'#555',fontFamily:'DM Mono,monospace',letterSpacing:'0.08em'}}>Session 1 · Hook · Stage 1 of 8</span>
              </div>
              <div style={{padding:'14px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                  <div style={{width:'22px',height:'22px',borderRadius:'50%',background:'rgba(255,106,0,0.15)',border:'1px solid rgba(255,106,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:'9px',fontWeight:'800',color:'#FF6A00'}}>M</span>
                  </div>
                  <div style={{background:'#F8F8F8',border:'1px solid #EEEEEE',borderRadius:'4px 10px 10px 10px',padding:'8px 12px',flex:1}}>
                    <p style={{fontSize:'10px',color:'#333',lineHeight:'1.6',margin:0}}>{bc.hook_challenge}</p>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <div style={{background:'rgba(255,106,0,0.08)',border:'1px solid rgba(255,106,0,0.2)',borderRadius:'10px 4px 10px 10px',padding:'8px 12px',maxWidth:'80%'}}>
                    <p style={{fontSize:'10px',color:'#333',lineHeight:'1.6',margin:0}}>{bc.founder_reply || 'Found 4 people on Reddit complaining about exactly this.'}</p>
                  </div>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                  <div style={{width:'22px',height:'22px',borderRadius:'50%',background:'rgba(29,158,117,0.15)',border:'1px solid rgba(29,158,117,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:'9px',fontWeight:'800',color:'#1D9E75'}}>M</span>
                  </div>
                  <div style={{background:'rgba(29,158,117,0.05)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'4px 10px 10px 10px',padding:'8px 12px',flex:1}}>
                    <p style={{fontSize:'10px',color:'#333',lineHeight:'1.6',margin:0}}><span style={{color:'#1D9E75',fontWeight:'700'}}>Real signal.</span> {bc.maya_followup || "Now let's find out if they'd pay."}</p>
                  </div>
                </div>
              </div>
              <div style={{padding:'6px 14px',borderTop:'1px solid #F0F0F0',background:'#FAFAFA'}}>
                <span style={{fontSize:'8px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.1em'}}>Stage 1 of 8 · Hook</span>
              </div>
            </div>

            {/* Screenshot 2 — Evaluation */}
            <div style={{border:'1px solid #E8E8E8',borderRadius:'10px',overflow:'hidden'}}>
              <div style={{background:'#0A0A0F',padding:'8px 14px',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{display:'flex',gap:'4px'}}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{width:'7px',height:'7px',borderRadius:'50%',background:c,opacity:0.6}}/>)}</div>
                <span style={{fontSize:'9px',color:'#555',fontFamily:'DM Mono,monospace',letterSpacing:'0.08em'}}>Session 3 · Task Evaluation · Stage 6</span>
              </div>
              <div style={{padding:'14px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                  <div style={{width:'22px',height:'22px',borderRadius:'50%',background:'rgba(255,106,0,0.15)',border:'1px solid rgba(255,106,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:'9px',fontWeight:'800',color:'#FF6A00'}}>M</span>
                  </div>
                  <div style={{background:'#F8F8F8',border:'1px solid #EEEEEE',borderRadius:'4px 10px 10px 10px',padding:'8px 12px',flex:1}}>
                    <p style={{fontSize:'10px',color:'#333',lineHeight:'1.6',margin:0}}>Your task: {bc.task}</p>
                  </div>
                </div>
                <div style={{background:'rgba(29,158,117,0.05)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'10px',padding:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                    <span style={{fontSize:'9px',color:'#1D9E75',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.1em'}}>Maya's Evaluation</span>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <span style={{fontSize:'20px',fontWeight:'900',color:'#1D9E75',fontFamily:'Playfair Display,serif'}}>{bc.eval_score || '82'}</span>
                      <span style={{fontSize:'9px',color:'#888'}}>/100</span>
                      <span style={{fontSize:'8px',color:'#1D9E75',background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',padding:'2px 7px',borderRadius:'100px',fontFamily:'DM Mono,monospace',fontWeight:'700'}}>PASS</span>
                    </div>
                  </div>
                  <div style={{fontSize:'10px',color:'#333',lineHeight:'1.6',borderTop:'1px solid rgba(29,158,117,0.15)',paddingTop:'8px'}}>
                    <span style={{color:'#1D9E75',fontWeight:'700'}}>Strong: </span>{bc.eval_strength}<br/>
                    <span style={{color:'#BA7517',fontWeight:'700'}}>Fix: </span>{bc.eval_fix}
                  </div>
                </div>
              </div>
              <div style={{padding:'6px 14px',borderTop:'1px solid #F0F0F0',background:'#FAFAFA'}}>
                <span style={{fontSize:'8px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.1em'}}>Stage 6 of 8 · Execution Task</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 4: MENTORS ── */}
        <div className="page" style={{padding:'48px'}}>
          <div style={{borderBottom:'3px solid #FF6A00',paddingBottom:'12px',marginBottom:'24px'}}>
            <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'6px'}}>Your Mentors</div>
            <div style={{fontSize:'28px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>From 100+ mentors, shortlisted for {cp.business_name}</div>
          </div>
          <p style={{fontSize:'12px',color:'#666',lineHeight:'1.7',marginBottom:'24px'}}>{bc.mentor_rationale}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            {mentors.map((m:any,i:number)=>(
              <div key={i} style={{display:'flex',gap:'12px',alignItems:'center',padding:'12px 14px',background:'#F8F8F8',border:'1px solid #EEEEEE',borderRadius:'10px'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(255,106,0,0.25)',flexShrink:0,background:'rgba(255,106,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {m.img
                    ? <img src={m.img} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />
                    : <span style={{fontSize:'14px',fontWeight:'800',color:'#FF6A00'}}>{m.name?.[0]}</span>}
                </div>
                <div>
                  <div style={{fontSize:'12px',fontWeight:'700',color:'#111',marginBottom:'2px'}}>{m.name}</div>
                  <div style={{fontSize:'10px',color:'#888'}}>{m.role}</div>
                  <div style={{fontSize:'10px',color:'#888'}}>{m.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAGE 5: SPRINTS + SESSIONS ── */}
        <div className="page" style={{padding:'48px'}}>
          <div style={{borderBottom:'3px solid #FF6A00',paddingBottom:'12px',marginBottom:'24px'}}>
            <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'6px'}}>Monthly Sprints</div>
            <div style={{fontSize:'28px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>12 Sprints — 4 Weeks Each</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'36px'}}>
            {ALL_SPRINTS.map((s,i)=>(
              <div key={i} style={{padding:'10px 14px',background:i%2===0?'#FFF8F3':'#F8F8F8',border:'1px solid',borderColor:i%2===0?'rgba(255,106,0,0.15)':'#EEEEEE',borderRadius:'8px',borderTop:`2px solid ${i%2===0?'#FF6A00':'#BBBBBB'}`}}>
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'4px'}}>
                  <span style={{fontSize:'9px',fontWeight:'800',color:'#FF6A00',fontFamily:'DM Mono,monospace'}}>S{String(i+1).padStart(2,'0')}</span>
                  <span style={{fontSize:'11px',fontWeight:'700',color:'#111'}}>{s.name}</span>
                </div>
                <p style={{fontSize:'10px',color:'#888',lineHeight:'1.5',margin:0}}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{borderBottom:'3px solid #0A0A0F',paddingBottom:'12px',marginBottom:'20px'}}>
            <div style={{fontSize:'9px',color:'#888',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'6px'}}>Experiential Sessions</div>
            <div style={{fontSize:'22px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>Sunday Sessions — Live Every Week</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            {SUNDAY_SESSIONS.map((s,i)=>(
              <div key={i} style={{display:'flex',gap:'14px',alignItems:'flex-start',padding:'10px 14px',background:'#F8F8F8',borderRadius:'8px',border:'1px solid #EEEEEE'}}>
                <div style={{width:'28px',height:'28px',borderRadius:'7px',background:'#0A0A0F',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:'9px',fontWeight:'800',color:'#FF6A00',fontFamily:'DM Mono,monospace'}}>{String(i+1).padStart(2,'0')}</span>
                </div>
                <div>
                  <div style={{fontSize:'11px',fontWeight:'700',color:'#111',marginBottom:'2px'}}>{s.theme}</div>
                  <div style={{fontSize:'10px',color:'#888',lineHeight:'1.4'}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAGE 6: TIMELINE + QUESTIONS + CLOSE ── */}
        <div className="page" style={{padding:'48px',display:'flex',flexDirection:'column'}}>
          {timeline.length>0&&(
            <>
              <div style={{borderBottom:'3px solid #FF6A00',paddingBottom:'12px',marginBottom:'24px'}}>
                <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'6px'}}>Your 6-Month Northstar</div>
                <div style={{fontSize:'28px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em'}}>The Journey Ahead</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'36px'}}>
                {timeline.map((t:any,i:number)=>{
                  const colors=['#FF6A00','#FF8C00','#FFAA00','#1D9E75','#17876A','#117055']
                  const col=colors[i]||'#FF6A00'
                  return(
                    <div key={i} style={{padding:'14px',background:'#F8F8F8',border:`1px solid #EEEEEE`,borderRadius:'10px',borderTop:`3px solid ${col}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px'}}>
                        <div style={{width:'20px',height:'20px',borderRadius:'50%',background:col,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <span style={{fontSize:'8px',fontWeight:'800',color:'#fff',fontFamily:'DM Mono,monospace'}}>M{i+1}</span>
                        </div>
                        <span style={{fontSize:'8px',color:col,fontFamily:'DM Mono,monospace',fontWeight:'700'}}>{t.month}</span>
                      </div>
                      <div style={{fontSize:'11px',fontWeight:'700',color:'#111',marginBottom:'4px',lineHeight:'1.3'}}>{t.milestone}</div>
                      <div style={{fontSize:'10px',color:'#888',lineHeight:'1.5'}}>{t.description}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div style={{marginBottom:'28px'}}>
            <div style={{fontSize:'9px',color:'#D85A30',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'10px'}}>Before you begin</div>
            <div style={{fontSize:'18px',fontWeight:'900',color:'#111',fontFamily:'Playfair Display,serif',letterSpacing:'-0.01em',marginBottom:'14px'}}>Questions {cp.business_name} must answer</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {(bc.critical_questions||[]).map((q:string,i:number)=>(
                <div key={i} style={{display:'flex',gap:'12px',alignItems:'center',padding:'12px 16px',background:'rgba(216,90,48,0.04)',border:'1px solid rgba(216,90,48,0.15)',borderRadius:'8px'}}>
                  <span style={{fontSize:'16px',color:'#D85A30',flexShrink:0,fontWeight:'800'}}>?</span>
                  <span style={{fontSize:'12px',color:'#111',fontWeight:'600',lineHeight:'1.4'}}>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Closing */}
          <div style={{marginTop:'auto'}}>
            <div style={{background:'#0A0A0F',borderRadius:'16px 16px 0 0',padding:'24px 28px'}}>
              <div style={{fontSize:'22px',fontWeight:'900',color:'#fff',fontFamily:'Playfair Display,serif',letterSpacing:'-0.02em',marginBottom:'4px'}}>Ready to launch {cp.business_name}?</div>
              <div style={{fontSize:'9px',color:'#FF6A00',fontFamily:'DM Mono,monospace',textTransform:'uppercase',letterSpacing:'0.16em'}}>LaunchPilot School</div>
            </div>
            <div style={{background:'#FFF8F3',borderRadius:'0 0 16px 16px',padding:'20px 28px',borderBottom:'4px solid #FF6A00'}}>
              <p style={{fontSize:'13px',color:'#444',lineHeight:'1.8',margin:0}}>{bc.closing}</p>
              <div style={{marginTop:'16px',display:'flex',gap:'12px',alignItems:'center'}}>
                <div style={{padding:'10px 24px',background:'#FF6A00',color:'#fff',borderRadius:'8px',fontSize:'13px',fontWeight:'700',fontFamily:'DM Sans,sans-serif'}}>Apply for a spot →</div>
                <span style={{fontSize:'11px',color:'#999',fontFamily:'DM Mono,monospace'}}>launchpilot-phi.vercel.app/apply</span>
              </div>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{__html:`
          document.querySelector('.print-btn').addEventListener('click',()=>window.print())
        `}} />
      </body>
    </html>
  )
}
