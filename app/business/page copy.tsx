import Link from 'next/link'
import MobileNav from '@/components/layout/MobileNav'

// ── Mobile-responsive CSS injected as a style tag ────────────────
const mobileStyles = `
  /* ── Nav ── */
  @media (max-width: 768px) {
    .nav-wrap { padding: 0 16px !important; height: 58px !important; }
  }

  /* ── Hero h1 ── */
  .h1-big { font-size: clamp(36px, 9vw, 88px); }

  /* ── Stat strip: stack on mobile ── */
  .stat-strip-item {
    padding: 12px 16px !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex: 0 0 50%;
  }
  .stat-strip-item:last-child { border-bottom: none; }
  @media (min-width: 640px) {
    .stat-strip-item { flex: 1; border-right: 1px solid rgba(255,255,255,0.05) !important; border-bottom: none !important; }
    .stat-strip-item:last-child { border-right: none !important; }
  }

  /* ── Section padding ── */
  @media (max-width: 768px) {
    section { padding-top: 72px !important; padding-bottom: 72px !important; }
    section h2.pf { font-size: clamp(28px, 7.5vw, 52px) !important; }
  }

  /* ── 3-col grids → 1-col on mobile ── */
  .grid-3-auto {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 900px) { .grid-3-auto { grid-template-columns: 1fr !important; } }
  @media (min-width: 601px) and (max-width: 900px) { .grid-3-auto { grid-template-columns: repeat(2, 1fr) !important; } }

  /* ── 2-col grids → 1-col on mobile ── */
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr !important; } }

  /* ── Programs 2-col grids ── */
  .programs-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 14px;
  }
  @media (max-width: 640px) { .programs-grid-2 { grid-template-columns: 1fr !important; } }

  /* ── Competency 3-col grid → 1-col ── */
  .comp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 48px;
  }
  @media (max-width: 900px) { .comp-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 540px) { .comp-grid { grid-template-columns: 1fr !important; } }

  /* ── PM MBA featured card flex → stack ── */
  .pmba-flex {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 24px;
  }
  @media (max-width: 640px) {
    .pmba-flex > div:first-child { min-width: unset !important; width: 100%; }
  }

  /* ── Director flex → stack on mobile ── */
  .ai-director-flex {
    display: flex;
    gap: 36px;
    align-items: flex-start;
  }
  @media (max-width: 640px) {
    .ai-director-flex { flex-direction: column !important; gap: 20px !important; }
    .ai-director-flex > div:last-child { min-width: unset !important; }
  }

  /* ── Maya section h2 ── */
  .ai-h2 { font-size: clamp(26px, 6vw, 44px) !important; }

  /* ── Evaluation mockup grid → 1-col ── */
  .eval-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  }
  @media (max-width: 480px) { .eval-grid { grid-template-columns: 1fr !important; } }

  /* ── Hero buttons stack on very small screens ── */
  @media (max-width: 420px) {
    .hero-cta { flex-direction: column !important; align-items: stretch !important; }
    .hero-cta a { text-align: center; }
  }

  /* ── Featured program card padding ── */
  @media (max-width: 640px) {
    .pmba-card { padding: 24px !important; }
  }

  /* ── hide-mob helper (already used in original) ── */
  .hide-mob { display: flex; }
  @media (max-width: 768px) { .hide-mob { display: none !important; } }

  /* ── CTA section padding ── */
  @media (max-width: 768px) {
    .cta-section { padding: 80px 20px !important; }
  }

  /* ── Footer ── */
  @media (max-width: 640px) {
    .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
  }
}`

const BIZ = '#FF6A00'
const BIZ_D = '#CC5500'

// ── School Director — Sarvesh Tusnial ────────────────────────────
const SCHOOL_DIRECTOR = {
  img:      '/images/mentors/sarvesh-tusnial.jpg',
  initials: 'AC',
  name:     'Sarvesh Tusnial',
  role:     'School Director, School of Business · Founder, CEO - LaunchPilot, ex-EY',
  col:      '#FF6A00',
  message:  'Most business education teaches you frameworks. What we built at Mentogram teaches you to use them under pressure. The practitioners in this school have launched products, scaled companies and managed teams in the messiest markets in the world — not case studies, not simulations, but real decisions with real consequences. If you want to lead in any organisation, this is where you build that instinct.',
}

const SPECIALISED = [
  { code:'B01', name:'Product Management Fundamentals',  desc:'Product discovery, user research, problem framing, opportunity sizing, PRD writing, roadmap building, prioritisation frameworks' },
  { code:'B02', name:'Product Strategy & Vision',        desc:'Vision setting, north star metrics, product-market fit, positioning, competitive moats, long-term roadmapping, platform thinking' },
  { code:'B03', name:'User Research & Insight',          desc:'Qualitative research, interview design, Jobs-to-be-Done, personas, usability testing, insight synthesis, ethnographic methods' },
  { code:'B04', name:'Growth Marketing & Acquisition',   desc:'Paid acquisition (Meta, Google Ads), SEO, content marketing, influencer, referral loops, attribution modelling, CAC optimisation' },
  { code:'B05', name:'Retention & Engagement',           desc:'Lifecycle marketing, push/email/in-app messaging, churn analysis, habit loops, loyalty mechanics, cohort analysis, re-engagement' },
  { code:'B06', name:'Monetisation & Pricing',           desc:'Pricing strategy, freemium models, subscription economics, value-based pricing, packaging design, upsell/cross-sell, revenue expansion' },
  { code:'B07', name:'Distribution & Reach',             desc:'Channel strategy, GTM planning, partnerships, B2B distribution, B2C reach, platform distribution, geographic expansion playbooks' },
  { code:'B08', name:'Metrics & Product Analytics',      desc:'AARRR framework, funnel analysis, cohort retention, LTV/CAC, dashboarding, product instrumentation, north star metric design' },
  { code:'B09', name:'Go-to-Market Strategy',            desc:'Segmentation, ICP definition, messaging hierarchy, launch planning, competitive positioning, sales enablement, GTM motion design' },
  { code:'B10', name:'Stakeholder Management',           desc:'Managing up, cross-functional leadership, influencing without authority, executive alignment, managing engineers and designers' },
  { code:'B11', name:'Operations & Scaling',             desc:'Process design, SOPs, hiring and team building, organisational design, scaling playbooks, operational excellence frameworks' },
  { code:'B12', name:'Consumer Psychology & Behaviour',  desc:'Behavioural economics, nudge theory, habit formation, motivation science, cognitive biases in product design and marketing' },
]

const GENERIC = [
  { code:'G01', name:'Strategic Thinking' },
  { code:'G02', name:'Leadership & Management' },
  { code:'G04', name:'Data Analysis & Interpretation' },
  { code:'G05', name:'AI Tools for Professionals' },
  { code:'G06', name:'Problem Solving & Frameworks' },
  { code:'G08', name:'Negotiation & Influence' },
  { code:'G09', name:'Personal Productivity' },
  { code:'G10', name:'Networking & Career Strategy' },
]

const PROGRAMS = [
  {
    badge: 'MBA',
    title: 'PM MBA',
    subtitle: '12 competencies · $5K–$8K · 12–18 months',
    desc: 'The most comprehensive PM education available. From discovery to strategy to GTM — built from how the best PMs at Swiggy, Razorpay, and Meesho actually work.',
    col: BIZ,
    competencies: ['B01','B02','B03','G04','B08','B10','B09','G06','B12','G02','G05','G01'],
    hot: true,
  },
  {
    badge: 'BYO',
    title: 'Build Your Own MBA',
    subtitle: 'Any 12 competencies · Custom pricing',
    desc: 'Pick exactly what you need. Mix Business, Finance, AI and Generic competencies. The only degree on earth designed entirely around you.',
    col: BIZ,
    competencies: [],
    hot: false,
  },
  {
    badge: 'PGP',
    title: 'PGP in Growth',
    subtitle: '6 competencies · $3K–$4K · 6 months',
    desc: 'Full-funnel growth from acquisition to monetisation. The playbook that growth leads at PhonePe, CRED and Razorpay actually use.',
    col: '#34D399',
    competencies: ['B04','B05','B08','B07','B06','G04'],
    hot: false,
  },
  {
    badge: 'PGP',
    title: 'PGP in Strategy & Leadership',
    subtitle: '6 competencies · $3K–$4K · 6 months',
    desc: 'For managers moving into senior leadership. Strategy, influence, operations and executive communication — compressed into 6 practitioner-led competencies.',
    col: '#A78BFA',
    competencies: ['G01','G02','B10','B11','G08','G03'],
    hot: false,
  },
  {
    badge: 'CERT',
    title: 'Certificate in Distribution & Reach',
    subtitle: '3 competencies · $1.5K–$2K · 2 months',
    desc: 'Channel strategy, GTM planning and marketing fundamentals. The fastest path to understanding how great products find their audience.',
    col: '#F59E0B',
    competencies: ['B07','B04','B09'],
    hot: false,
  },
]

export default function BusinessPage() {
  return (
    <div style={{ background:'#05050A', minHeight:'100vh', color:'#E8E6E0', fontFamily:'DM Sans,sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />

      {/* NAV */}
      <nav className="nav-wrap" style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', background:'rgba(5,5,10,0.94)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'40px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6' }}>
              Mento<span style={{ color:'#FF6A00' }}>gram</span>
              <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>Business</span>
            </div>
          </Link>
          <div className="hide-mob" style={{ display:'flex', gap:'28px' }}>
            {[['#programs','Programs'],['#maya','How Maya Works'],['#competencies','Competencies'],['#director','School Director']].map(([h,l]) => (
              <a key={h} href={h} className="nav-link">{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <Link href="/" className="hide-mob nav-link" style={{ padding:'8px 16px', fontSize:'13px' }}>← All Schools</Link>
          <Link href="/auth/login" className="nav-link hide-mob" style={{ padding:'8px 16px' }}>Sign In</Link>
          <Link href="/apply" style={{ fontSize:'13px', padding:'10px 22px', borderRadius:'8px', background:'#FF6A00', color:'#fff', fontWeight:'700', textDecoration:'none' }}>Apply Now →</Link>
          <MobileNav page="student" />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'130px 20px 90px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1000px', height:'600px', background:'radial-gradient(ellipse,rgba(255,106,0,0.12) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:'1040px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'100px', background:'rgba(255,106,0,0.07)', border:'1px solid rgba(255,106,0,0.25)', marginBottom:'32px' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:BIZ, display:'inline-block', animation:'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize:'10px', color:'#FF8C00', textTransform:'uppercase', letterSpacing:'0.18em' }}>School of Business · Mentogram</span>
          </div>

          <h1 className="pf h1-big" style={{ fontWeight:'900', lineHeight:'1.04', letterSpacing:'-0.035em', marginBottom:'28px', color:'#F0EDE6' }}>
            Become the PM,<br />the operator, the leader<br /><span style={{ color:'#FF6A00' }}>companies fight over.</span>
          </h1>

          <p style={{ fontSize:'19px', color:'#AAA', lineHeight:'1.72', maxWidth:'620px', margin:'0 auto 52px', fontWeight:'400' }}>
            The School of Business is built from exclusive knowledge from the PMs, growth leaders and operators who built India and Southeast Asia's most successful products. Taught by Maya, your personal AI mentor, 24/7.
          </p>

          <div className="hero-cta" style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'72px' }}>
            <Link href="/apply" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', background:'#FF6A00', color:'#fff', fontWeight:'700', textDecoration:'none', display:'inline-block' }}>Apply Now →</Link>
            <a href="#programs" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#AAA', textDecoration:'none' }}>See All Programs</a>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'44px' }}>
            {[
              { n:'5',    l:'Programs' },
              { n:'12',   l:'Specialised competencies' },
              { n:'24',   l:'Concepts per competency' },
              { n:'$5K',  l:'Starting price' },
              { n:'24/7', l:'Maya always on' },
            ].map((s,i) => (
              <div key={s.l} className="stat-strip-item" style={{ padding:'0 32px', borderRight:i<4?'1px solid rgba(255,255,255,0.05)':'none', textAlign:'center' }}>
                <div className="pf" style={{ fontSize:'34px', fontWeight:'800', color:BIZ, letterSpacing:'-0.03em' }}>{s.n}</div>
                <div className="mono" style={{ fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'5px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU BUILD */}
      <section style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>What You Actually Build</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Not theory. Not slides.<br /><span style={{ color:'#FF6A00' }}>Real deliverables.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'580px', margin:'0 auto' }}>
              Every concept ends with a real task. Not multiple choice. Not reflection questions. You build the actual thing — a PRD, a growth model, a GTM plan — and Maya evaluates it like a senior colleague would.
            </p>
          </div>

          {/* 3 task cards */}
          <div className="grid-3-auto" style={{ marginBottom:'60px' }}>
            {[
              {
                stage: 'Stage 6 — Task',
                title: 'Write the Product Requirements Document',
                context: 'You are the PM at Airbnb. Host churn in European markets is up 18% YoY. The CEO wants a retention solution in 90 days.',
                deliverables: ['Problem Statement','Success Metrics','User Stories','Technical Constraints','Rollout Plan'],
                time: '60 min',
                col: BIZ,
              },
              {
                stage: 'Stage 6 — Task',
                title: 'Build the Growth Model',
                context: 'Meesho\'s reseller acquisition cost has increased 3x in 6 months. You are the Growth Lead. Design the reacquisition strategy.',
                deliverables: ['Channel Audit','CAC Breakdown','90-Day Plan','Success Metrics','Budget Allocation'],
                time: '60 min',
                col: '#34D399',
              },
              {
                stage: 'Stage 6 — Task',
                title: 'Design the GTM Launch Plan',
                context: 'Razorpay is launching a new B2B credit product in Indonesia. You are the PM. Build the full GTM from zero.',
                deliverables: ['ICP Definition','Channel Strategy','Pricing Model','Launch Timeline','KPI Dashboard'],
                time: '60 min',
                col: '#A78BFA',
              },
            ].map(task => (
              <div key={task.title} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                {/* Header bar */}
                <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:'5px' }}>
                    {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                  </div>
                  <span className="mono" style={{ fontSize:'8px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Maya · Task Assignment</span>
                  <span className="mono" style={{ fontSize:'8px', color:task.col }}>{task.time}</span>
                </div>
                <div style={{ padding:'20px' }}>
                  {/* Stage badge */}
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'3px 10px', background:`${task.col}12`, border:`1px solid ${task.col}25`, borderRadius:'6px', marginBottom:'14px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:task.col }} />
                    <span className="mono" style={{ fontSize:'8px', color:task.col, textTransform:'uppercase', letterSpacing:'0.08em' }}>{task.stage}</span>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', lineHeight:'1.4', marginBottom:'12px' }}>{task.title}</div>
                  <div style={{ fontSize:'11px', color:'#666', lineHeight:'1.6', marginBottom:'16px', padding:'10px 12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', borderLeft:`2px solid ${task.col}40` }}>{task.context}</div>
                  <div className="mono" style={{ fontSize:'8px', color:'#444', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>Deliverables</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {task.deliverables.map(d => (
                      <span key={d} style={{ fontSize:'10px', padding:'3px 8px', background:`${task.col}10`, border:`1px solid ${task.col}20`, borderRadius:'4px', color:'#AAA' }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation mockup */}
          <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden', maxWidth:'680px', margin:'0 auto' }}>
            <div style={{ padding:'10px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ display:'flex', gap:'5px' }}>
                {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
              </div>
              <span className="mono" style={{ fontSize:'9px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase', flex:1, textAlign:'center' }}>Maya&apos;s Evaluation · PRD Task</span>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <div>
                  <div className="mono" style={{ fontSize:'9px', color:'#FF6A00', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }}>Concept B01 — Product Management</div>
                  <div style={{ fontSize:'13px', color:'#888' }}>Write the Product Requirements Document</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                    <span className="pf" style={{ fontSize:'36px', fontWeight:'900', color:BIZ }}>84</span>
                    <span style={{ fontSize:'13px', color:'#555' }}>/100</span>
                    <span style={{ background:'rgba(74,222,128,0.15)', color:'#4ADE80', fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'4px', marginLeft:'8px' }}>PASS</span>
                  </div>
                </div>
              </div>
              <div className="eval-grid">
                {[
                  ['User Insight','17/20'],['Problem Clarity','18/20'],
                  ['Business Thinking','16/20'],['Execution Quality','13/15'],
                  ['Tradeoff Reasoning','11/15'],['Communication','9/10'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px' }}>
                    <span style={{ fontSize:'11px', color:'#666' }}>{k}</span>
                    <span style={{ fontSize:'11px', color:'#AAA', fontFamily:'DM Mono,monospace', fontWeight:'600' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'14px 16px', background:'rgba(255,106,0,0.05)', borderRadius:'10px', borderLeft:`3px solid ${BIZ}` }}>
                <div style={{ fontSize:'11px', color:'#AAA', lineHeight:'1.7' }}>
                  <span style={{ color:'#4ADE80', fontWeight:'600' }}>Strong: </span>Your problem statement is precise — you quantified the gap (40%) and connected it to user impact. The rollout plan is realistic.<br />
                  <span style={{ color:'#F97066', fontWeight:'600' }}>Fix: </span>Your success metrics are output-focused. Rewrite KR2 as a user outcome metric, not a delivery metric.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAYA */}
      <section id="maya" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>Your AI Mentor</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Maya thinks like<br /><span style={{ color:'#FF6A00' }}>a senior PM would.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto' }}>
              Maya is trained on exclusive structured interviews with PMs, growth leads and operators from Swiggy, Razorpay, CRED, Meesho and more. Not generic frameworks. Real thinking from people who shipped real products.
            </p>
          </div>

          <div className="grid-2" style={{ gap:'60px', alignItems:'start' }}>
            {/* Chat mockup */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', gap:'6px' }}>
                  {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                </div>
                <div style={{ flex:1, textAlign:'center' }}>
                  <span className="mono" style={{ fontSize:'10px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Mentogram · Maya · PM MBA</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }} />
                  <span className="mono" style={{ fontSize:'9px', color:'#4ADE80' }}>Online</span>
                </div>
              </div>
              <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', gap:'16px' }}>
                {/* Maya */}
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,106,0,0.15)', border:'1px solid rgba(255,106,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#FF8C00', flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div>
                    <div className="mono" style={{ fontSize:'9px', color:'#333', marginBottom:'5px', letterSpacing:'0.06em' }}>MAYA · Day 8 · Concept B01 · Stage 1</div>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'88%' }}>
                      <div style={{ marginBottom:'8px' }}>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:BIZ, textTransform:'uppercase', letterSpacing:'0.08em' }}>⏱ Timer Challenge · 5 Minutes</span>
                      </div>
                      <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>
                        Airbnb bookings in Europe dropped 18% overnight. You are the PM. Write your first 3 diagnostic questions.
                      </div>
                      <div style={{ marginTop:'10px', background:'rgba(255,106,0,0.08)', borderRadius:'6px', padding:'6px 10px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ fontSize:'10px', color:'#666' }}>2:54 elapsed</span>
                          <span style={{ fontSize:'10px', color:BIZ, fontWeight:'600' }}>2:06 remaining</span>
                        </div>
                        <div style={{ marginTop:'4px', height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'2px' }}>
                          <div style={{ width:'57%', height:'100%', background:BIZ, borderRadius:'2px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* User */}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div>
                    <div className="mono" style={{ fontSize:'9px', color:'#333', marginBottom:'5px', letterSpacing:'0.06em', textAlign:'right' }}>SARVESH · just now</div>
                    <div style={{ background:'rgba(255,106,0,0.12)', border:'1px solid rgba(255,106,0,0.2)', borderRadius:'14px 4px 14px 14px', padding:'12px 16px', maxWidth:'80%' }}>
                      <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>
                        1. City-specific or pan-India? 2. Did it start on a specific date? 3. New users or returning?
                      </div>
                    </div>
                  </div>
                </div>
                {/* Maya response */}
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,106,0,0.15)', border:'1px solid rgba(255,106,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#FF8C00', flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'88%' }}>
                    <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>
                      That&apos;s sharp. You segmented before hypothesising. <span style={{ color:BIZ, fontWeight:'600' }}>Moving to Stage 2.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Maya */}
            <div>
              <div className="label" style={{ marginBottom:'20px' }}>What Makes Maya Different</div>
              <div className="pf" style={{ fontSize:'32px', fontWeight:'800', letterSpacing:'-0.02em', color:'#F0EDE6', lineHeight:'1.15', marginBottom:'20px' }}>
                Every session is personalised. Every evaluation is honest.
              </div>
              <p style={{ fontSize:'15px', color:'#AAA', lineHeight:'1.7', marginBottom:'32px' }}>
                Maya knows your background, your domain, your dream company. She adjusts examples, difficulty and feedback accordingly. And she never lets you skip — you must score ≥72 on every concept to advance.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { icon:'🎯', title:'Personalised to you', desc:'Maya knows your job, your domain, your ambition. Every example is calibrated to where you are.' },
                  { icon:'📋', title:'8-stage structured learning', desc:'Hook → Discovery → Concept → Deep Dive → Application → Task → Evaluation → Mastery Gate.' },
                  { icon:'⚡', title:'Mastery-gated progression', desc:'Score ≥72 to advance. Below that, Maya helps you understand why and you try again.' },
                  { icon:'🧠', title:'Practitioner knowledge only', desc:'Trained exclusively from interviews with PMs and operators. Not Wikipedia. Not textbooks.' },
                  { icon:'🔄', title:'Remembers every session', desc:'Maya picks up exactly where you left off. Your context, your progress, your history.' },
                ].map(f => (
                  <div key={f.title} style={{ display:'flex', gap:'14px', alignItems:'flex-start', padding:'14px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px' }}>
                    <span style={{ fontSize:'18px', flexShrink:0 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#F0EDE6', marginBottom:'3px' }}>{f.title}</div>
                      <div style={{ fontSize:'12px', color:'#666', lineHeight:'1.55' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>Programs</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Structured paths.<br /><span style={{ color:'#FF6A00' }}>Or build your own.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto' }}>
              Four predefined programs with exact competency sequences — or pick any 12 from the full library and design your own degree.
            </p>
          </div>

          {/* Featured — PM MBA */}
          <div style={{ background:'rgba(255,106,0,0.05)', border:'1px solid rgba(255,106,0,0.2)', borderRadius:'20px', position:'relative', overflow:'hidden', marginBottom:'16px' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(255,106,0,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div className="pmba-card" style={{ position:'relative', padding:'36px' }}>
            <div className="pmba-flex">
              <div style={{ flex:1, minWidth:'min(300px, 100%)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 12px', borderRadius:'100px', background:BIZ, color:'#fff', letterSpacing:'0.08em' }}>MBA</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'4px 10px', borderRadius:'100px', background:'rgba(255,106,0,0.1)', color:'#FF8C00', border:'1px solid rgba(255,106,0,0.2)', letterSpacing:'0.06em' }}>Most Popular</span>
                </div>
                <div className="pf" style={{ fontSize:'28px', fontWeight:'800', color:'#F0EDE6', marginBottom:'8px', letterSpacing:'-0.02em' }}>PM MBA</div>
                <div className="mono" style={{ fontSize:'10px', color:'#FF8C00', marginBottom:'16px' }}>12 competencies · $5K–$8K · 12–18 months</div>
                <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.7', marginBottom:'24px', maxWidth:'420px' }}>
                  The most comprehensive PM education available. From discovery to strategy to GTM — built from how the best PMs at Swiggy, Razorpay, and Meesho actually work.
                </p>
                <Link href="/apply" style={{ display:'inline-block', padding:'12px 28px', borderRadius:'8px', background:BIZ, color:'#fff', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>Apply for PM MBA →</Link>
              </div>
              {/* Competency pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', maxWidth:'380px', alignContent:'flex-start' }}>
                {PROGRAMS[0].competencies.map((code, i) => (
                  <div key={code} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px' }}>
                    <span className="mono" style={{ fontSize:'9px', fontWeight:'700', color:BIZ }}>{code}</span>
                    <span style={{ fontSize:'10px', color:'#666' }}>
                      {SPECIALISED.find(s => s.code === code)?.name || GENERIC.find(g => g.code === code)?.name || code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>

          {/* Other programs grid */}
          <div className="programs-grid-2">
            {PROGRAMS.slice(2,4).map(prog => (
              <div key={prog.title} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${prog.col}22`, borderRadius:'16px', overflow:'hidden', borderTop:`3px solid ${prog.col}` }}>
                <div style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 10px', borderRadius:'100px', background:`${prog.col}15`, color:prog.col, border:`1px solid ${prog.col}30`, textTransform:'uppercase', letterSpacing:'0.08em' }}>{prog.badge}</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#555' }}>{prog.subtitle}</span>
                  </div>
                  <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px', lineHeight:'1.2' }}>{prog.title}</div>
                  <p style={{ fontSize:'13px', color:'#888', lineHeight:'1.65', marginBottom:'20px' }}>{prog.desc}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {prog.competencies.map(code => (
                      <span key={code} style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'3px 8px', borderRadius:'4px', background:`${prog.col}10`, color:prog.col, border:`1px solid ${prog.col}20` }}>{code}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding:'14px 24px', borderTop:`1px solid ${prog.col}15` }}>
                  <Link href="/apply" style={{ display:'block', textAlign:'center', padding:'10px', borderRadius:'8px', background:prog.col, color:'#fff', fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>Apply →</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="programs-grid-2" style={{ marginBottom: 0 }}>
            {[PROGRAMS[1], PROGRAMS[4]].map(prog => (
              <div key={prog.title} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${prog.col}22`, borderRadius:'16px', overflow:'hidden', borderTop:`3px solid ${prog.col}` }}>
                <div style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 10px', borderRadius:'100px', background:`${prog.col}15`, color:prog.col, border:`1px solid ${prog.col}30`, textTransform:'uppercase', letterSpacing:'0.08em' }}>{prog.badge}</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#555' }}>{prog.subtitle}</span>
                  </div>
                  <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px', lineHeight:'1.2' }}>{prog.title}</div>
                  <p style={{ fontSize:'13px', color:'#888', lineHeight:'1.65', marginBottom:'20px' }}>{prog.desc}</p>
                  {prog.competencies.length > 0 ? (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {prog.competencies.map(code => (
                        <span key={code} style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'3px 8px', borderRadius:'4px', background:`${prog.col}10`, color:prog.col, border:`1px solid ${prog.col}20` }}>{code}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:'12px', color:'#555', fontStyle:'italic' }}>Pick any 12 from the full library — B01–B12, G01–G12, and more</div>
                  )}
                </div>
                <div style={{ padding:'14px 24px', borderTop:`1px solid ${prog.col}15` }}>
                  <Link href="/apply" style={{ display:'block', textAlign:'center', padding:'10px', borderRadius:'8px', background:prog.col, color: prog.badge === 'BYO' ? '#000' : '#fff', fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>Apply →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

          {/* MENTORS */}
      <section id="mentors" style={{ padding:'120px 24px 80px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', marginBottom:'56px' }}>
          <div style={{ marginBottom:'48px' }}>
            <div className="label" style={{ marginBottom:'14px', color:BIZ_D }}>The Humans Behind our AI</div>
            <h2 className="pf ai-h2" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'14px' }}>Preparing you <br /><span style={{ color:BIZ_D }}>with today's leaders</span></h2>
            <p style={{ fontSize:'15px', color:'#666', lineHeight:'1.6', maxWidth:'480px' }}>Growth, PMs and AI leaders who have evolved with AI. Their exclusive knowledge lives only here.</p>
          </div>

          {/* Sarvesh Tusnial — School Director */}
          <div id="director" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(124,58,237,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div className="ai-director-flex" style={{ position:'relative', display:'flex', gap:'36px', alignItems:'flex-start' }}>
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <div style={{ width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${SCHOOL_DIRECTOR.col}40`, marginBottom:'10px' }}>
                  <img src={SCHOOL_DIRECTOR.img} alt={SCHOOL_DIRECTOR.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:BIZ_D, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'3px' }}>School Director</div>
                <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{SCHOOL_DIRECTOR.name}</div>
                <div style={{ fontSize:'10px', color:'#888', lineHeight:'1.4', maxWidth:'140px', margin:'0 auto' }}>Managing Partner · LaunchPilot </div>
              </div>
              <div style={{ flex:1, minWidth:'0' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:BIZ_D, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'14px' }}>A Message from the School Director</div>
                <blockquote style={{ fontSize:'15px', color:'#E8E6E0', lineHeight:'1.8', margin:0, fontStyle:'italic', borderLeft:'3px solid rgba(124,58,237,0.4)', paddingLeft:'20px' }}>
                  &ldquo;{SCHOOL_DIRECTOR.message}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETENCIES */}
      <section id="competencies" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px' }}>The Competency Library</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              12 business competencies.<br /><span style={{ color:'#FF6A00' }}>Each one built from practitioners.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' }}>
              Each competency = 24 concepts = ~180 minutes of structured Maya-led learning. Every concept includes a real task you must pass to advance.
            </p>
          </div>

          <div className="label" style={{ marginBottom:'16px' }}>Specialised Business Competencies (B01–B12)</div>
          <div className="comp-grid">
            {SPECIALISED.map(comp => (
              <div key={comp.code} style={{ background:'rgba(255,106,0,0.03)', border:'1px solid rgba(255,106,0,0.1)', borderRadius:'12px', padding:'20px', borderLeft:`3px solid rgba(255,106,0,0.35)` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <span className="mono" style={{ fontSize:'10px', fontWeight:'700', color:BIZ, background:'rgba(255,106,0,0.1)', padding:'3px 8px', borderRadius:'4px' }}>{comp.code}</span>
                  <div style={{ fontSize:'12px', fontWeight:'600', color:'#F0EDE6' }}>{comp.name}</div>
                </div>
                <div style={{ fontSize:'11px', color:'#666', lineHeight:'1.6' }}>{comp.desc}</div>
              </div>
            ))}
          </div>

          <div className="label" style={{ marginBottom:'16px', color:'#16A34A' }}>Generic Competencies — Shared Across All Schools</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {GENERIC.map(comp => (
              <div key={comp.code} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'rgba(22,163,74,0.05)', border:'1px solid rgba(22,163,74,0.15)', borderRadius:'8px' }}>
                <span className="mono" style={{ fontSize:'10px', fontWeight:'700', color:'#4ADE80' }}>{comp.code}</span>
                <span style={{ fontSize:'12px', color:'#AAA' }}>{comp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'140px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'500px', background:'radial-gradient(ellipse,rgba(255,106,0,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'780px', margin:'0 auto' }}>
          <div className="label" style={{ marginBottom:'24px' }}>Ready to build your career?</div>
          <h2 className="pf" style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:'900', letterSpacing:'-0.035em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'24px' }}>
            The best product people<br />started exactly here.
          </h2>
          <p style={{ fontSize:'18px', color:'#888', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto 48px' }}>
            We review every application personally. If accepted, you receive your Mentogram Student ID within 48 hours and begin your first concept immediately.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/apply" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', background:'#FF6A00', color:'#fff', fontWeight:'700', textDecoration:'none', display:'inline-block' }}>Apply to School of Business →</Link>
          </div>
          <div style={{ marginTop:'32px', display:'flex', gap:'32px', justifyContent:'center', flexWrap:'wrap' }}>
            {['Reviewed within 48 hours','Student ID issued on approval','Begin learning immediately'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:BIZ }} />
                <span style={{ fontSize:'13px', color:'#555' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'48px 24px', background:'#02020A', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div className="footer-inner" style={{ maxWidth:'1160px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#F0EDE6' }}>
              Mento<span style={{ color:'#FF6A00' }}>gram</span>
              <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>School of Business</span>
            </div>
          </Link>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[['/', 'Home'],['/finance','School of Finance'],['/ai','School of AI'],['/manufacturing','Manufacturing'],['/apply','Apply']].map(([href, label]) => (
              <Link key={label} href={href} style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>{label}</Link>
            ))}
          </div>
          <div className="mono" style={{ fontSize:'10px', color:'#222', letterSpacing:'0.08em' }}>© 2025 Mentogram · School of Business</div>
        </div>
      </footer>
    </div>
  )
}
