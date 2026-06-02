import Link from 'next/link'
import MobileNav from '@/components/layout/MobileNav'

const mobileStyles = `
  /* ── Nav ── */
  @media (max-width: 768px) {
    .nav-wrap { padding: 0 16px !important; height: 58px !important; }
  }

  /* ── Hero h1 ── */
  .h1-big { font-size: clamp(36px, 9vw, 88px); }

  /* ── Stat strip: 2-col wrap on mobile ── */
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

  /* ── 3-col grids → 2-col tablet, 1-col mobile ── */
  .grid-3-auto {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 900px) { .grid-3-auto { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 540px) { .grid-3-auto { grid-template-columns: 1fr !important; } }

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

  /* ── Competency 3-col grid ── */
  .comp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 48px;
  }
  @media (max-width: 900px) { .comp-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 540px) { .comp-grid { grid-template-columns: 1fr !important; } }

  /* ── OEE KPI 3-col mini grid ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-top: 20px;
  }
  @media (max-width: 420px) { .kpi-grid { grid-template-columns: 1fr !important; } }

  /* ── MBA featured card ── */
  .pmba-flex {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 24px;
  }
  @media (max-width: 640px) {
    .pmba-flex > div:first-child { min-width: unset !important; width: 100%; }
    .pmba-card { padding: 24px !important; }
  }

  /* ── Director card flex → stack on mobile ── */
  .ai-director-flex {
    display: flex;
    gap: 36px;
    align-items: flex-start;
  }
  @media (max-width: 640px) {
    .ai-director-flex { flex-direction: column !important; gap: 20px !important; align-items: flex-start !important; justify-content: flex-start !important; }
    .ai-director-flex > div:last-child { min-width: unset !important; }
  }

  /* ── B2B enterprise card ── */
  .enterprise-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 32px;
  }
  @media (max-width: 640px) {
    .enterprise-card > div:first-child { min-width: unset !important; }
    .enterprise-card > div:last-child { width: 100%; min-width: unset !important; }
  }

  /* ── Hero CTA stack on very small screens ── */
  @media (max-width: 420px) {
    .hero-cta { flex-direction: column !important; align-items: stretch !important; }
    .hero-cta a { text-align: center; }
  }

  /* ── hide-mob ── */
  .hide-mob { display: flex; }
  @media (max-width: 768px) { .hide-mob { display: none !important; } }

  /* ── Footer ── */
  @media (max-width: 640px) {
    .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
  }
`

const MFG = '#0D9488'
const MFG_BRIGHT = '#2DD4BF'
const MFG_L = 'rgba(13,148,136,0.08)'

// ── School Director — Hasit Dangi ────────────────────────────
const SCHOOL_DIRECTOR = {
  img:      '/images/mentors/hasit-dangi.jpg',
  initials: 'AC',
  name:     'Hasit Dangi',
  role:     'School Director, School of Manufacturing · MIT Sloan Alumni, ex-Head Bayer Production',
  col:      '#FF6A00',
  message:  'The factory floor does not work on theory. The practitioners behind this school have shut down lines, rebuilt supply chains from scratch and turned around plants that were haemorrhaging money — in India, Southeast Asia and the Middle East. Welcome to an exciting journey.',
}

const SPECIALISED = [
  { code:'M01', name:'Lean Manufacturing & Waste Elimination', desc:'8 wastes (DOWNTIME), value stream mapping, 5S methodology, flow and pull systems, standard work, Kaizen events, visual management' },
  { code:'M02', name:'Six Sigma & Quality Management',          desc:'DMAIC process, statistical process control, measurement systems analysis, control charts, root cause tools (8D, Fishbone), Cpk' },
  { code:'M03', name:'Supply Chain & Procurement',              desc:'Supplier selection, RFQ process, contract negotiation, vendor risk management, multi-tier supply chain mapping, strategic sourcing' },
  { code:'M04', name:'Logistics & Distribution Operations',     desc:'Inbound/outbound logistics, warehouse management, last-mile delivery, 3PL management, freight, trade compliance, INCOTERMS' },
  { code:'M05', name:'Demand Planning & Inventory Optimisation','desc':'Demand forecasting methods, safety stock, reorder points, inventory turns, S&OP process, scenario planning, ABC analysis' },
  { code:'M06', name:'Industrial AI & Predictive Maintenance',  desc:'IIoT sensors, predictive vs preventive maintenance, anomaly detection, ML for equipment failure, digital monitoring, OPC-UA' },
  { code:'M07', name:'Industry 4.0 & Digital Twins',            desc:'Smart factory architecture, digital twin concept, real-time monitoring, OT/IT convergence, factory digitisation roadmap, SCADA' },
  { code:'M08', name:'Production Planning & Scheduling',        desc:'MRP, ERP systems (SAP, Oracle), capacity planning, master production schedule, bottleneck management, OEE, throughput analysis' },
  { code:'M09', name:'Cost Engineering & Manufacturing Finance', desc:'COGS breakdown, direct vs indirect costs, make vs buy analysis, cost reduction initiatives, capex ROI, yield analysis, standard costing' },
  { code:'M10', name:'Environmental, Health & Safety (EHS)',    desc:'ISO 14001, OHSAS 18001, hazard identification, accident investigation, environmental compliance, safety culture, near-miss reporting' },
  { code:'M11', name:'New Product Introduction (NPI)',          desc:'Design for manufacturability, stage-gate process, BOM management, prototype to production, tooling and validation, FMEA' },
  { code:'M12', name:'Plant Leadership & Workforce Management', desc:'Managing frontline teams, shift management, performance systems for blue-collar workers, union relations, cultural transformation on the factory floor' },
]

const GENERIC = [
  { code:'G01', name:'Strategic Thinking' },
  { code:'G02', name:'Leadership & Management' },
  { code:'G04', name:'Data Analysis & Interpretation' },
  { code:'G05', name:'AI Tools for Professionals' },
  { code:'G06', name:'Problem Solving & Frameworks' },
  { code:'G12', name:'Global Business Context' },
]

const PROGRAMS = [
  {
    badge: 'MBA',
    title: 'Manufacturing MBA',
    subtitle: '12 competencies · $5K–$8K · 12–18 months',
    desc: 'The complete operations leader. Lean, Six Sigma, supply chain, production planning, cost engineering, EHS and Industrial AI — everything a plant manager or operations head needs to lead at the highest level.',
    col: MFG,
    competencies: ['M01','M02','M03','M08','M09','M10','M11','M12','G01','G02','G06','G12'],
    hot: true,
  },
  {
    badge: 'PGP',
    title: 'PGP in Supply Chain Management',
    subtitle: '6 competencies · $3K–$4K · 6 months',
    desc: 'End-to-end supply chain from procurement to last-mile. Built for supply chain leads navigating volatile global networks.',
    col: '#F59E0B',
    competencies: ['M03','M04','M05','M09','G06','G12'],
  },
  {
    badge: 'PGP',
    title: 'PGP in Industrial AI & Industry 4.0',
    subtitle: '6 competencies · $4K–$5K · 6 months',
    desc: 'The intersection of AI and the factory floor. Predictive maintenance, digital twins, IIoT, and computer vision in manufacturing.',
    col: '#7C3AED',
    competencies: ['M06','M07','A12','G05','G04','G06'],
  },
  {
    badge: 'PGP',
    title: 'PGP in Lean & Operational Excellence',
    subtitle: '6 competencies · $3K–$4K · 6 months',
    desc: 'Lean, Six Sigma, OEE and EHS. The structured path to becoming a certified operational excellence leader.',
    col: '#0891B2',
    competencies: ['M01','M02','M08','M10','M12','G02'],
  },
  {
    badge: 'CERT',
    title: 'Certificate in Lean Operations',
    subtitle: '3 competencies · $1.5K–$2K · 2 months',
    desc: 'Foundational lean tools, waste elimination and process mapping. The fastest path into operational excellence.',
    col: '#16A34A',
    competencies: ['M01','M02','M10'],
  },
]

export default function ManufacturingPage() {
  return (
    <div style={{ background:'#05050A', minHeight:'100vh', color:'#E8E6E0', fontFamily:'DM Sans,sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />

      {/* NAV */}
      <nav className="nav-wrap" style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', background:'rgba(5,5,10,0.94)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'40px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6' }}>
              Mento<span style={{ color:'#FF6A00' }}>gram</span>
              <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>Manufacturing</span>
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
          <Link href="/apply" style={{ fontSize:'13px', padding:'10px 22px', borderRadius:'8px', background:MFG, color:'#fff', fontWeight:'700', textDecoration:'none' }}>Apply Now →</Link>
          <MobileNav page="student" />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'130px 24px 90px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1000px', height:'600px', background:'radial-gradient(ellipse,rgba(13,148,136,0.13) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:'1040px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'100px', background:'rgba(13,148,136,0.07)', border:'1px solid rgba(13,148,136,0.25)', marginBottom:'32px' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:MFG, display:'inline-block', animation:'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize:'10px', color:MFG_BRIGHT, textTransform:'uppercase', letterSpacing:'0.18em' }}>School of Manufacturing · Mentogram</span>
          </div>

          <h1 className="pf h1-big" style={{ fontWeight:'900', lineHeight:'1.04', letterSpacing:'-0.035em', marginBottom:'28px', color:'#F0EDE6' }}>
            The factory floor<br />is changing fast.<br /><span style={{ color:MFG_BRIGHT }}>Lead it or fall behind.</span>
          </h1>

          <p style={{ fontSize:'19px', color:'#AAA', lineHeight:'1.72', maxWidth:'620px', margin:'0 auto 52px', fontWeight:'400' }}>
            Manufacturing is being transformed by AI, Industry 4.0 and global supply chain disruption. The School of Manufacturing gives operations leaders the knowledge to lead that transformation — not just survive it.
          </p>

          <div className="hero-cta" style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'72px' }}>
            <Link href="/apply" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', background:MFG, color:'#fff', fontWeight:'700', textDecoration:'none', display:'inline-block' }}>Apply Now →</Link>
            <a href="#programs" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#AAA', textDecoration:'none' }}>See All Programs</a>
          </div>

          <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'44px' }}>
            {[
              { n:'5',     l:'Programs' },
              { n:'12',    l:'Specialised competencies' },
              { n:'$16T',  l:'Global manufacturing market' },
              { n:'$5K',   l:'Starting price' },
              { n:'24/7',  l:'Maya always on' },
            ].map((s,i) => (
              <div key={s.l} className="stat-strip-item" style={{ padding:'0 32px', borderRight:i<4?'1px solid rgba(255,255,255,0.05)':'none', textAlign:'center' }}>
                <div className="pf" style={{ fontSize:'34px', fontWeight:'800', color:MFG_BRIGHT, letterSpacing:'-0.03em' }}>{s.n}</div>
                <div className="mono" style={{ fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'5px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE OPPORTUNITY */}
      <section style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div className="grid-2" style={{ gap:'80px', alignItems:'center' }}>
            <div>
              <div className="label" style={{ marginBottom:'20px', color:MFG_BRIGHT }}>The Manufacturing Opportunity</div>
              <div className="pf" style={{ fontSize:'42px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'24px' }}>
                73% of manufacturers say they cannot find leaders with both operational and digital skills.
              </div>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75', marginBottom:'20px' }}>
                Industry 4.0 is not coming — it is here. But the gap between what smart factories need and what most operations leaders know is massive. The leaders who close that gap will run the factories of the next decade.
              </p>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75' }}>
                The School of Manufacturing is designed for that exact gap. Lean and Six Sigma fundamentals combined with Industrial AI, digital twins and supply chain resilience — all taught by Maya, built from real practitioner knowledge.
              </p>
            </div>

            {/* OEE Dashboard mockup */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', gap:'5px' }}>
                  {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                </div>
                <span className="mono" style={{ fontSize:'8px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase', flex:1, textAlign:'center' }}>Plant OEE Dashboard · Live View</span>
              </div>
              <div style={{ padding:'20px' }}>
                <div className="mono" style={{ fontSize:'9px', color:MFG_BRIGHT, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'16px' }}>Overall Equipment Effectiveness</div>
                {[
                  { label:'Availability', value:87, col:MFG },
                  { label:'Performance',  value:73, col:'#F59E0B' },
                  { label:'Quality',      value:94, col:'#4ADE80' },
                  { label:'OEE Score',    value:60, col:MFG_BRIGHT },
                ].map(metric => (
                  <div key={metric.label} style={{ marginBottom:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                      <span style={{ fontSize:'11px', color:'#888' }}>{metric.label}</span>
                      <span className="pf" style={{ fontSize:'13px', fontWeight:'700', color:metric.col }}>{metric.value}%</span>
                    </div>
                    <div style={{ height:'6px', background:'rgba(255,255,255,0.04)', borderRadius:'3px' }}>
                      <div style={{ width:`${metric.value}%`, height:'100%', background:metric.col, borderRadius:'3px' }} />
                    </div>
                  </div>
                ))}
                <div className="kpi-grid">
                  {[
                    { label:'Downtime Events', value:'3',     col:'#F97066' },
                    { label:'Units Produced',  value:'8,240', col:MFG_BRIGHT },
                    { label:'Defect Rate',     value:'0.8%',  col:'#4ADE80' },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                      <div className="pf" style={{ fontSize:'18px', fontWeight:'800', color:kpi.col, marginBottom:'3px' }}>{kpi.value}</div>
                      <div style={{ fontSize:'9px', color:'#555', lineHeight:'1.4' }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU BUILD */}
      <section style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:MFG_BRIGHT }}>What You Actually Build</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Real operational problems.<br /><span style={{ color:MFG_BRIGHT }}>Real deliverables.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'580px', margin:'0 auto' }}>
              Every concept ends with a task that mirrors what operations leaders do every day. No case studies from 1995. No theory without application.
            </p>
          </div>

          <div className="grid-3-auto" style={{ marginBottom:'48px' }}>
            {[
              {
                stage: 'Stage 6 — Task · M01',
                title: 'Map the Value Stream & Identify Waste',
                context: 'A tier-1 auto parts manufacturer has cycle time 40% above benchmark. You are the Lean Lead. Map the current state VSM and design the future state.',
                deliverables: ['Current State VSM','Waste Identification','Future State VSM','Kaizen Events List','Implementation Timeline'],
                time: '60 min', col: MFG,
              },
              {
                stage: 'Stage 6 — Task · M06',
                title: 'Design a Predictive Maintenance System',
                context: 'A stamping plant loses $2.1M per year to unplanned downtime. You are the Industrial AI Lead. Design a predictive maintenance system using IIoT sensors.',
                deliverables: ['Sensor Placement Map','ML Model Selection','Alert Threshold Design','Integration Architecture','ROI Calculation'],
                time: '60 min', col: '#7C3AED',
              },
              {
                stage: 'Stage 6 — Task · M03',
                title: 'Redesign the Procurement Strategy',
                context: 'Post-pandemic, a medical device manufacturer has 3 single-source suppliers for critical components. You are the Supply Chain Head. Redesign the strategy.',
                deliverables: ['Supplier Risk Matrix','Dual-Source Plan','RFQ Template','Cost Impact Model','Transition Timeline'],
                time: '60 min', col: '#F59E0B',
              },
            ].map(task => (
              <div key={task.title} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:'5px' }}>
                    {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                  </div>
                  <span className="mono" style={{ fontSize:'8px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Maya · Task Assignment</span>
                  <span className="mono" style={{ fontSize:'8px', color:task.col }}>{task.time}</span>
                </div>
                <div style={{ padding:'20px' }}>
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
        </div>
      </section>

      {/* MAYA */}
      <section id="maya" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:MFG_BRIGHT }}>Your AI Mentor</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Maya thinks like<br /><span style={{ color:MFG_BRIGHT }}>a plant GM would.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto' }}>
              Maya is trained on exclusive interviews with plant managers, supply chain directors and operations heads across India, Southeast Asia and the Middle East. Real operational thinking — not MBA textbook theory.
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
                  <span className="mono" style={{ fontSize:'10px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Mentogram · Maya · Manufacturing MBA</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }} />
                  <span className="mono" style={{ fontSize:'9px', color:'#4ADE80' }}>Online</span>
                </div>
              </div>
              <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:MFG_L, border:`1px solid ${MFG}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:MFG_BRIGHT, flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div>
                    <div className="mono" style={{ fontSize:'9px', color:'#333', marginBottom:'5px', letterSpacing:'0.06em' }}>MAYA · Concept M01 · Stage 1 — Hook</div>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'88%' }}>
                      <div style={{ marginBottom:'8px' }}>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:MFG_BRIGHT, textTransform:'uppercase', letterSpacing:'0.08em' }}>5-Minute Challenge</span>
                      </div>
                      <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>
                        Line 3 just stopped. It is 2am. You are the plant manager on call. You have no information yet. Walk me through your first 5 minutes.
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div style={{ background:MFG_L, border:`1px solid ${MFG}30`, borderRadius:'14px 4px 14px 14px', padding:'12px 16px', maxWidth:'80%' }}>
                    <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>
                      Call the shift supervisor first — I need eyes on the line. Then check SCADA for the last alarm before stoppage. Do not touch anything until I know if it is mechanical or electrical.
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:MFG_L, border:`1px solid ${MFG}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:MFG_BRIGHT, flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'88%' }}>
                    <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>
                      Exactly right. Information before action. <span style={{ color:MFG_BRIGHT, fontWeight:'600' }}>Most people restart the line first and create a bigger problem.</span> You contained the situation. Moving to Stage 2.
                    </div>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px' }}>
                  <div className="mono" style={{ fontSize:'9px', color:MFG_BRIGHT, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Maya Evaluation — M01 Concept</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                    <span style={{ fontSize:'11px', color:'#AAA' }}>Concept Score</span>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                      <span className="pf" style={{ fontSize:'28px', fontWeight:'900', color:MFG_BRIGHT }}>83</span>
                      <span style={{ fontSize:'12px', color:'#555' }}>/100</span>
                      <span style={{ background:'rgba(74,222,128,0.15)', color:'#4ADE80', fontSize:'10px', fontWeight:'600', padding:'2px 7px', borderRadius:'4px', marginLeft:'6px' }}>PASS</span>
                    </div>
                  </div>
                  {[['Operational Judgement','20/20'],['Root Cause Thinking','18/20'],['Safety Awareness','17/20'],['Communication','16/20']].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize:'11px', color:'#666' }}>{k}</span>
                      <span style={{ fontSize:'11px', color:'#AAA', fontFamily:'DM Mono,monospace' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="label" style={{ marginBottom:'20px', color:MFG_BRIGHT }}>Built for Operations Leaders</div>
              <div className="pf" style={{ fontSize:'32px', fontWeight:'800', letterSpacing:'-0.02em', color:'#F0EDE6', lineHeight:'1.15', marginBottom:'20px' }}>
                No classroom theory. Every lesson starts with a real problem from the factory floor.
              </div>
              <p style={{ fontSize:'15px', color:'#AAA', lineHeight:'1.7', marginBottom:'32px' }}>
                The best plant managers learn from problems — not textbooks. Maya is built the same way. Every concept starts with a real operational challenge, then builds the framework to solve it.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { icon:'🏭', title:'Factory-floor scenarios only', desc:'Every Maya challenge is drawn from real situations at real plants. No sanitised case studies.' },
                  { icon:'🤖', title:'Industrial AI built in', desc:'Every program includes digital thinking — OEE dashboards, predictive maintenance and digital twins.' },
                  { icon:'🌐', title:'India, SEA and Middle East focus', desc:'Examples calibrated to the manufacturing corridors where our students actually operate.' },
                  { icon:'📊', title:'Mastery-gated. Score 72 to advance.', desc:'You cannot move forward without demonstrating genuine operational competence. No shortcuts.' },
                  { icon:'💼', title:'B2B enterprise ready', desc:'Companies can purchase seats for entire operations teams. Bulk pricing available.' },
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
      <section id="programs" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:MFG_BRIGHT }}>Programs</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              From lean fundamentals<br /><span style={{ color:MFG_BRIGHT }}>to Industry 4.0 leadership.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto' }}>
              Five programs across the full operations stack. Each with exact competency sequences built for your role.
            </p>
          </div>

          {/* Featured — Manufacturing MBA */}
          <div style={{ background:MFG_L, border:'1px solid rgba(13,148,136,0.2)', borderRadius:'20px', marginBottom:'16px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(13,148,136,0.1) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div className="pmba-card" style={{ position:'relative', padding:'36px' }}>
            <div className="pmba-flex">
              <div style={{ flex:1, minWidth:'300px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 12px', borderRadius:'100px', background:MFG, color:'#fff', letterSpacing:'0.08em' }}>MBA</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'4px 10px', borderRadius:'100px', background:MFG_L, color:MFG_BRIGHT, border:'1px solid rgba(13,148,136,0.3)', letterSpacing:'0.06em' }}>Most Comprehensive</span>
                </div>
                <div className="pf" style={{ fontSize:'28px', fontWeight:'800', color:'#F0EDE6', marginBottom:'8px', letterSpacing:'-0.02em' }}>Manufacturing MBA</div>
                <div className="mono" style={{ fontSize:'10px', color:MFG_BRIGHT, marginBottom:'16px' }}>12 competencies · $5K–$8K · 12–18 months</div>
                <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.7', marginBottom:'24px', maxWidth:'420px' }}>
                  The complete operations leader. Lean, Six Sigma, supply chain, production planning, cost engineering, EHS and Industrial AI — everything a plant manager needs to lead at the highest level.
                </p>
                <Link href="/apply" style={{ display:'inline-block', padding:'12px 28px', borderRadius:'8px', background:MFG, color:'#fff', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>Apply for Manufacturing MBA →</Link>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', maxWidth:'380px', alignContent:'flex-start' }}>
                {PROGRAMS[0].competencies.map(code => (
                  <div key={code} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px' }}>
                    <span className="mono" style={{ fontSize:'9px', fontWeight:'700', color:MFG_BRIGHT }}>{code}</span>
                    <span style={{ fontSize:'10px', color:'#666' }}>
                      {SPECIALISED.find(s => s.code === code)?.name || GENERIC.find(g => g.code === code)?.name || code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>

          <div className="programs-grid-2">
            {PROGRAMS.slice(1,3).map(prog => (
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
          <div className="programs-grid-2" style={{ marginBottom:0 }}>
            {PROGRAMS.slice(3).map(prog => (
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
        </div>
      </section>

      {/* SCHOOL DIRECTOR */}
      <section style={{ padding:'80px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
        {/* Hasit Dangi — School Director */}
          <div id="director" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(13,148,136,0.2)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(13,148,136,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div className="ai-director-flex" style={{ position:'relative' }}>
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <div style={{ width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${MFG}40`, marginBottom:'10px' }}>
                  <img src={SCHOOL_DIRECTOR.img} alt={SCHOOL_DIRECTOR.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:MFG, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'3px' }}>School Director</div>
                <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{SCHOOL_DIRECTOR.name}</div>
                <div style={{ fontSize:'10px', color:'#888', lineHeight:'1.4', maxWidth:'140px', margin:'0 auto' }}>MIT Sloan Alumni · ex-Head Bayer Production</div>
              </div>
              <div style={{ flex:1, minWidth:'0' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:MFG, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'14px' }}>A Message from the School Director</div>
                <blockquote style={{ fontSize:'15px', color:'#E8E6E0', lineHeight:'1.8', margin:0, fontStyle:'italic', borderLeft:`3px solid ${MFG}60`, paddingLeft:'20px' }}>
                  &ldquo;{SCHOOL_DIRECTOR.message}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETENCIES */}
      <section id="competencies" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:MFG_BRIGHT }}>The Competency Library</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              12 manufacturing competencies.<br /><span style={{ color:MFG_BRIGHT }}>Each built from practitioners.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' }}>
              Each competency = 24 concepts = ~180 minutes of structured Maya-led learning. Every concept ends with a real operational deliverable.
            </p>
          </div>

          <div className="label" style={{ marginBottom:'16px', color:MFG_BRIGHT }}>Specialised Manufacturing Competencies (M01–M12)</div>
          <div className="comp-grid">
            {SPECIALISED.map(comp => (
              <div key={comp.code} style={{ background:MFG_L, border:'1px solid rgba(13,148,136,0.12)', borderRadius:'12px', padding:'20px', borderLeft:'3px solid rgba(13,148,136,0.4)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <span className="mono" style={{ fontSize:'10px', fontWeight:'700', color:MFG_BRIGHT, background:'rgba(13,148,136,0.12)', padding:'3px 8px', borderRadius:'4px' }}>{comp.code}</span>
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

      {/* B2B ENTERPRISE */}
      <section style={{ padding:'80px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ background:MFG_L, border:'1px solid rgba(13,148,136,0.2)', borderRadius:'20px', padding:'48px' }}>
            <div className="enterprise-card">
            <div style={{ flex:1, minWidth:'280px' }}>
              <div className="mono" style={{ fontSize:'9px', color:MFG_BRIGHT, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px' }}>For Companies</div>
              <div className="pf" style={{ fontSize:'28px', fontWeight:'800', color:'#F0EDE6', lineHeight:'1.2', marginBottom:'12px' }}>Train your entire operations team.</div>
              <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.65' }}>
                Bulk seat pricing available for companies who want to upskill their plant managers, supply chain leads and operations heads together. Contact us for enterprise pricing.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', minWidth:'200px' }}>
              <Link href="/enterprise" style={{ display:'block', textAlign:'center', padding:'14px 28px', borderRadius:'8px', background:MFG, color:'#fff', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>Book Enterprise Demo →</Link>
              <Link href="/apply" style={{ display:'block', textAlign:'center', padding:'14px 28px', borderRadius:'8px', border:'1px solid rgba(13,148,136,0.3)', color:MFG_BRIGHT, fontWeight:'600', fontSize:'14px', textDecoration:'none' }}>Apply as Individual →</Link>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'140px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'500px', background:'radial-gradient(ellipse,rgba(13,148,136,0.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'780px', margin:'0 auto' }}>
          <div className="label" style={{ marginBottom:'24px', color:MFG_BRIGHT }}>The future of manufacturing is being built now.</div>
          <h2 className="pf" style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:'900', letterSpacing:'-0.035em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'24px' }}>
            The leaders who adapt<br />will run the factories<br />of the next decade.
          </h2>
          <p style={{ fontSize:'18px', color:'#888', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto 48px' }}>
            We review every application personally. If accepted, you receive your Student ID within 48 hours and begin your first concept immediately.
          </p>
          <Link href="/apply" style={{ fontSize:'16px', fontWeight:'700', padding:'18px 56px', borderRadius:'8px', background:MFG, color:'#fff', textDecoration:'none', display:'inline-block' }}>Apply to School of Manufacturing →</Link>
          <div style={{ marginTop:'32px', display:'flex', gap:'32px', justifyContent:'center', flexWrap:'wrap' }}>
            {['Reviewed within 48 hours','Student ID issued on approval','Begin learning immediately'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:MFG }} />
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
              <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>School of Manufacturing</span>
            </div>
          </Link>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[['/', 'Home'],['/finance','Finance'],['/business','Business'],['/ai','AI & Tech'],['/enterprise','Enterprise'],['/apply','Apply']].map(([href, label]) => (
              <Link key={label} href={href} style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>{label}</Link>
            ))}
          </div>
          <div className="mono" style={{ fontSize:'10px', color:'#222', letterSpacing:'0.08em' }}>2025 Mentogram School of Manufacturing</div>
        </div>
      </footer>
    </div>
  )
}
