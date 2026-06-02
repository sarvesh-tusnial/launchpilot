import Link from 'next/link'
import MobileNav from '@/components/layout/MobileNav'

const AI = '#7C3AED'
const AI_L = 'rgba(124,58,237,0.08)'
const AI_BRIGHT = '#A78BFA'

type GalleryItem = { src: string | null; city: string; label: string; bg: string }

const galleryRow1: GalleryItem[] = [
  { src:'/images/immersions/singapore-1.jpg', city:'Singapore',    label:'Jan 2025', bg:'linear-gradient(145deg,#1a0900,#2d1800)' },
  { src:'/images/immersions/dubai-1.jpg',     city:'Dubai',        label:'Feb 2025', bg:'linear-gradient(145deg,#001020,#002540)' },
  { src:'/images/immersions/sf-1.jpg',        city:'San Francisco',label:'Mar 2025', bg:'linear-gradient(145deg,#100a1a,#201530)' },
  { src:'/images/immersions/bali-1.jpg',      city:'New York',         label:'Apr 2025', bg:'linear-gradient(145deg,#001500,#002800)' },
  { src:'/images/immersions/nyc-1.jpg',       city:'China',     label:'May 2025', bg:'linear-gradient(145deg,#0a0a1a,#15153a)' },
  { src:'/images/immersions/london-1.jpg',    city:'India',       label:'Reyo - Indian Airfoce', bg:'linear-gradient(145deg,#1a1000,#302000)' },
]
const galleryRow1Full: GalleryItem[] = [...galleryRow1, ...galleryRow1]

const galleryRow2: GalleryItem[] = [
  { src:'/images/immersions/mumbai-1.jpg',    city:'Mumbai',      label:'Jul 2025 · 63 students',   bg:'linear-gradient(145deg,#0a0010,#180025)' },
  { src:'/images/immersions/singapore-2.jpg', city:'Singapore',   label:'Capstone Day · Aug 2025',  bg:'linear-gradient(145deg,#001a10,#003020)' },
  { src:'/images/immersions/dubai-2.jpg',     city:'Dubai',       label:'Mentor Summit · Sep 2025', bg:'linear-gradient(145deg,#1a0a00,#301800)' },
  { src:'/images/immersions/bali-2.jpg',      city:'IIT Bombay',        label:'AI Immersion · Oct 2025',       bg:'linear-gradient(145deg,#001018,#002030)' },
  { src:'/images/immersions/london-2.jpg',    city:'London',      label:'AI Bootcamp · Nov 2025',   bg:'linear-gradient(145deg,#100010,#200020)' },
  { src:'/images/immersions/shanghai-1.jpg',  city:'Shanghai',    label:'Asia Summit · Dec 2025',   bg:'linear-gradient(145deg,#0a1000,#182000)' },
]
const galleryRow2Full: GalleryItem[] = [...galleryRow2, ...galleryRow2]

const SPECIALISED = [
  { code:'A01', name:'AI & LLM Fundamentals',               desc:'How LLMs work, transformer architecture basics, context windows, tokens, model capabilities and limitations, AI landscape 2025' },
  { code:'A02', name:'AI Agents & Agentic Systems',         desc:'Agent architecture, tool use, memory systems, planning loops, multi-agent orchestration, LangChain, CrewAI, AutoGen' },
  { code:'A03', name:'Prompt Engineering & LLM APIs',       desc:'System prompts, chain-of-thought, few-shot learning, RAG systems, Claude/OpenAI/Gemini API, evaluation frameworks' },
  { code:'A04', name:'Machine Learning for Business',       desc:'Classification, regression, clustering, model evaluation, feature engineering, ML project lifecycle, AutoML tools' },
  { code:'A05', name:'Data Strategy & Engineering',         desc:'Data architecture, ETL/ELT pipelines, data governance, dbt basics, modern data stack (Snowflake, BigQuery), data quality' },
  { code:'A06', name:'Business Intelligence & Dashboarding','desc':'Tableau/Looker/Metabase, KPI design, dashboard architecture, self-serve analytics, storytelling with data, BI strategy' },
  { code:'A07', name:'AI Product Management',               desc:'Building AI-native products, AI-first UX, model selection, latency/cost trade-offs, hallucination management, AI roadmapping' },
  { code:'A08', name:'Automation & No-Code Systems',        desc:'Make/Zapier/n8n workflow design, no-code tools (Webflow, Airtable, Notion), AI-powered automation, measuring ROI of automation' },
  { code:'A09', name:'AI Ethics, Safety & Governance',      desc:'Bias in AI, explainability, AI regulation (EU AI Act, US EO), responsible deployment, model auditing, AI governance frameworks' },
  { code:'A10', name:'NLP & Language AI Applications',      desc:'NLP use cases, text classification, sentiment analysis, summarisation, information extraction, search, RAG system design' },
  { code:'A11', name:'AI for Business Transformation',      desc:'AI strategy, identifying AI opportunities, build vs buy decisions, change management for AI adoption, measuring AI ROI' },
  { code:'A12', name:'Computer Vision & Multimodal AI',     desc:'Image recognition, object detection, video AI, multimodal LLMs (GPT-4V, Claude), use cases across manufacturing, retail, healthcare' },
]

const GENERIC = [
  { code:'G01', name:'Strategic Thinking' },
  { code:'G02', name:'Leadership & Management' },
  { code:'G04', name:'Data Analysis & Interpretation' },
  { code:'G05', name:'AI Tools for Professionals' },
  { code:'G06', name:'Problem Solving & Frameworks' },
]

const PROGRAMS = [
  { badge:'MBA',  title:'AI MBA',                          subtitle:'12 competencies · $8K–$10K · 12–18 months', desc:'The complete AI professional. From LLM fundamentals to building agents to AI strategy and transformation.', col:AI,        competencies:['A01','A03','A02','A07','A11','A04','A05','A09','G06','G01','G04','G05'], hot:true },
  { badge:'PGP',  title:'PGP in AI Agents',               subtitle:'6 competencies · $4K–$5K · 6 months',      desc:'Purpose-built for builders. Design, build and deploy autonomous AI agents from simple tool-use to complex multi-agent orchestration.', col:'#6366F1', competencies:['A01','A02','A03','A10','A09','G05'] },
  { badge:'PGP',  title:'PGP in Data & Analytics',        subtitle:'6 competencies · $4K–$5K · 6 months',      desc:'For analysts who want to go deeper. Data strategy, ML fundamentals, BI, NLP — the full analytical stack.', col:'#0891B2', competencies:['A04','A05','A06','G04','A10','G06'] },
  { badge:'PGP',  title:'PGP in AI Strategy for Leaders', subtitle:'6 competencies · $4K–$5K · 6 months',      desc:'For non-technical leaders who need to make AI decisions. AI literacy, transformation playbooks, governance and ROI measurement.', col:'#0D9488', competencies:['A11','A01','A09','G01','G02','G06'] },
  { badge:'CERT', title:'Certificate in Automation & No-Code', subtitle:'3 competencies · $1.5K–$2K · 2 months', desc:'Build powerful AI-powered workflows without writing code. Make, Zapier, n8n, and prompt engineering — in 8 weeks.', col:'#16A34A', competencies:['A08','A03','G05'] },
]

// ── School Director — Andrew Chow ────────────────────────────
const SCHOOL_DIRECTOR = {
  img:      '/images/mentors/andrew-chow.jpg',
  initials: 'AC',
  name:     'Andrew Chow',
  role:     'School Director, School of AI · Managing Partner, Asia Pro Ventures',
  col:      '#FF6A00',
  message:  'Most AI education teaches you to use tools. What we built at Mentogram teaches you to think in systems. The practitioners in this school have shipped real AI in production — not demo projects, not Kaggle competitions, but systems that serve real users at scale. If you want to lead AI in any organisation, this is where you build that foundation.',
}

// ── Mentor data type ─────────────────────────────────────────
type MentorData = { img: string | null; initials: string; name: string; role: string; company: string; expertise: string; programs: string[]; col: string }

function MentorCard({ m }: { m: MentorData }) {
  return (
    <div style={{ width:'180px', background:'rgba(255,255,255,0.02)', border:`1px solid ${m.col}22`, borderRadius:'12px', overflow:'hidden', flexShrink:0 }}>
      <div style={{ height:'150px', background:`linear-gradient(145deg,${m.col}10,#05050A)`, position:'relative' }}>
        {m.img
          ? <img src={m.img} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:`${m.col}18`, border:`2px solid ${m.col}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'800', color:m.col, fontFamily:'Playfair Display,serif' }}>{m.initials}</div>
            </div>
        }
      </div>
      <div style={{ padding:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{m.name}</div>
        <div style={{ fontSize:'10px', color:m.col, marginBottom:'1px' }}>{m.role}</div>
        <div style={{ fontSize:'9px', color:'#555' }}>{m.company}</div>
      </div>
    </div>
  )
}

const mentorRow1: MentorData[] = [
  { img:'/images/mentors/bhavin-mehta.jpg',     initials:'BM', name:'Bhavin Mehta',     role:'Managing Director, APAC', company:'Helpling',                   expertise:'AI implementation · Leadership',    programs:['Singapore'],     col:'#A78BFA' },
  { img:'/images/mentors/daniel-ling.jpg',      initials:'DL', name:'Daniel Ling',      role:'ex-VP, Founder',          company:'DBS, Lazada',                expertise:'Growth loops · Retention · PLG',   programs:['Singapore'],     col:'#34D399' },
  { img:'/images/mentors/edmund-tan.jpg',       initials:'ET', name:'Edmund Tan',       role:'Investor and VC',         company:'Family Office',              expertise:'Education · Scale',               programs:['South East Asia'],col:'#2DD4BF' },
  { img:'/images/mentors/justin-strackany.jpg', initials:'JS', name:'Justin Strackany', role:'General Partner',         company:'GTM Fund',                   expertise:'EdTech · Consumer · B2C',         programs:['San Francisco'], col:'#F97066' },
  { img:'/images/mentors/mayank-jain.jpg',      initials:'MJ', name:'Mayank Jain',      role:'Founder and Partner',     company:'Thinkuvate Ventures',        expertise:'Cybersecurity · Fintech · Risk',  programs:['Singapore'],     col:'#818CF8' },
  { img:'/images/mentors/prantik-mazumdar.jpg', initials:'PM', name:'Prantik Mazumdar', role:'CFO · Exited Founder',    company:'TIE Singapore',              expertise:'AI strategy · Scale',             programs:['Singapore'],     col:'#4ADE80' },
]

const mentorRow2: MentorData[] = [
  { img:'/images/mentors/sarvash-malani.jpg',   initials:'SM', name:'Sarvash Malani',   role:'VC',                      company:'Temasek',                    expertise:'ML systems · AI product · Scale', programs:['Singapore'],     col:'#A78BFA' },
  { img:'/images/mentors/shavin-goswami.jpg',   initials:'SG', name:'Shavin Goswami',   role:'Operations and Strategy', company:'Meta',                       expertise:'Marketplace · Consumer · Growth', programs:['New York'],      col:'#FF6A00' },
  { img:'/images/mentors/shlok-jain.jpg',       initials:'SJ', name:'Shlok Jain',       role:'Product',                 company:'Grab',                       expertise:'0-to-1 · Fundraising · Strategy', programs:['Singapore'],     col:'#34D399' },
  { img:'/images/mentors/sudeep-bhatter.jpg',   initials:'SB', name:'Sudeep Bhatter',   role:'Engineering Manager',     company:'Microsoft',                  expertise:'AI engineering · Platform · Scale',programs:['Seattle'],       col:'#60A5FA' },
  { img:'/images/mentors/yash-shah.jpg',        initials:'YS', name:'Yash Shah',        role:'Head of AI, Cloud',       company:'Amazon Web Services',        expertise:'Payments · API products · B2B',   programs:['India'],         col:'#4ADE80' },
  { img:'/images/mentors/rajesh-shetty.jpg',    initials:'RS', name:'Rajesh Shetty',    role:'Founder and Investor',    company:'Silicon Valley Investments', expertise:'FinTech growth · Product-led',     programs:['San Francisco'], col:'#60A5FA' },
]

// ── AI Tools students master ─────────────────────────────────
const TOOLS = [
  { name:'Claude',          cat:'LLM',           col:'#A78BFA', icon:'🤖' },
  { name:'GPT-4',           cat:'LLM',           col:'#74AA9C', icon:'🤖' },
  { name:'Gemini',          cat:'LLM',           col:'#4285F4', icon:'🤖' },
  { name:'LangChain',       cat:'Agents',        col:'#1C3C3C', icon:'⛓' },
  { name:'LangGraph',       cat:'Agents',        col:'#6366F1', icon:'🕸' },
  { name:'CrewAI',          cat:'Agents',        col:'#F97066', icon:'👥' },
  { name:'Pinecone',        cat:'Vector DB',     col:'#0D9488', icon:'🌲' },
  { name:'Weaviate',        cat:'Vector DB',     col:'#FA0050', icon:'🔍' },
  { name:'Make',            cat:'Automation',    col:'#6366F1', icon:'⚙️' },
  { name:'n8n',             cat:'Automation',    col:'#EA4B71', icon:'🔄' },
  { name:'Zapier',          cat:'Automation',    col:'#FF4A00', icon:'⚡' },
  { name:'Snowflake',       cat:'Data',          col:'#29B5E8', icon:'❄️' },
  { name:'BigQuery',        cat:'Data',          col:'#4285F4', icon:'📊' },
  { name:'dbt',             cat:'Data',          col:'#FF694A', icon:'🔧' },
  { name:'Tableau',         cat:'BI',            col:'#E97627', icon:'📈' },
  { name:'Looker',          cat:'BI',            col:'#4285F4', icon:'👁' },
  { name:'OpenAI API',      cat:'API',           col:'#74AA9C', icon:'🔌' },
  { name:'Anthropic API',   cat:'API',           col:'#A78BFA', icon:'🔌' },
  { name:'Hugging Face',    cat:'Models',        col:'#FFD21E', icon:'🤗' },
  { name:'Replicate',       cat:'Models',        col:'#0EA5E9', icon:'🔁' },
  { name:'Airtable',        cat:'No-Code',       col:'#FCB400', icon:'📋' },
  { name:'Webflow',         cat:'No-Code',       col:'#4353FF', icon:'🌐' },
  { name:'Retool',          cat:'No-Code',       col:'#3D5AFE', icon:'🛠' },
  { name:'Cursor',          cat:'Dev Tools',     col:'#000000', icon:'✏️' },
]

export default function AIPage() {
  return (
    <div style={{ background:'#05050A', minHeight:'100vh', color:'#E8E6E0', fontFamily:'DM Sans,sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          section { padding: 64px 20px !important; }
          .ai-hero { padding: 100px 20px 64px !important; }
          .ai-hero h1 { font-size: 52px !important; line-height: 1.08 !important; }
          .ai-hero p  { font-size: 16px !important; }
          .ai-hero-cta { flex-direction: column !important; align-items: stretch !important; }
          .ai-hero-cta a { text-align: center !important; white-space: nowrap !important; box-sizing: border-box !important; }
          .ai-stat-strip { flex-direction: column; gap: 16px; }
          .ai-stat-strip > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0 !important; }
          .ai-stat-strip > div:last-child { border-bottom: none; }
          .grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }
          .ai-3col { grid-template-columns: 1fr !important; }
          .ai-2col { grid-template-columns: 1fr !important; }
          .ai-chat-hide { display: none !important; }
          .ai-h2 { font-size: 30px !important; }
          .ai-director-flex { flex-direction: column !important; gap: 24px !important; }
          .ai-tools-grid { grid-template-columns: repeat(3,1fr) !important; }
          .ai-maya-grid { grid-template-columns: 1fr !important; }
          .ai-screens-grid { grid-template-columns: 1fr !important; }
          .ai-cta { padding: 80px 20px !important; }
          .committee-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .grid-3-auto { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          section { padding: 48px 16px !important; }
          .ai-hero h1 { font-size: 48px !important; }
          .ai-h2 { font-size: 24px !important; }
          .ai-tools-grid { grid-template-columns: repeat(2,1fr) !important; }
          .committee-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .committee-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .grid-3-auto { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      `}</style>

      {/* NAV */}
      <nav className="nav-wrap" style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', background:'rgba(5,5,10,0.94)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'40px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6' }}>
              Mento<span style={{ color:'#FF6A00' }}>gram</span>
              <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>AI & Tech</span>
            </div>
          </Link>
          <div className="hide-mob" style={{ display:'flex', gap:'28px' }}>
            {[['#programs','Programs'],['#maya','How Maya Works'],['#mentors','School Director'],['#tools','Tools'],['#competencies','Competencies']].map(([h,l]) => (
              <a key={h} href={h} className="nav-link">{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <Link href="/" className="hide-mob nav-link" style={{ padding:'8px 16px', fontSize:'13px' }}>← All Schools</Link>
          <Link href="/auth/login" className="nav-link hide-mob" style={{ padding:'8px 16px' }}>Sign In</Link>
          <Link href="/apply" style={{ fontSize:'13px', padding:'10px 16px', borderRadius:'8px', background:AI, color:'#fff', fontWeight:'700', textDecoration:'none', whiteSpace:'nowrap' as const }}>Apply Now →</Link>
          <MobileNav page="student" />
        </div>
      </nav>

      {/* HERO */}
      <section className="ai-hero" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'130px 24px 90px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1000px', height:'600px', background:'radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', left:'20%', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'1040px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'100px', background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.25)', marginBottom:'32px' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:AI, display:'inline-block', animation:'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize:'10px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.18em' }}>School of AI & Technology · Mentogram</span>
          </div>
          <h1 className="pf h1-big" style={{ fontWeight:'900', lineHeight:'1.04', letterSpacing:'-0.035em', marginBottom:'28px', color:'#F0EDE6' }}>
            The people building<br />the future of AI<br /><span style={{ color:AI_BRIGHT }}>learned it here.</span>
          </h1>
          <p style={{ fontSize:'19px', color:'#AAA', lineHeight:'1.72', maxWidth:'620px', margin:'0 auto 52px', fontWeight:'400' }}>
            Not a video course. Not a bootcamp. The School of AI is built from exclusive knowledge from the engineers, product managers and AI leaders who are shipping real AI systems today — taught by Maya, 24/7.
          </p>
          <div className="ai-hero-cta" style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'72px' }}>
            <Link href="/apply" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', background:AI, color:'#fff', fontWeight:'700', textDecoration:'none' }}>Apply Now →</Link>
            <a href="#programs" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#AAA', textDecoration:'none' }}>See All Programs</a>
          </div>
          <div className="ai-stat-strip" style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'44px' }}>
            {[{n:'5',l:'Programs'},{n:'12',l:'Specialised competencies'},{n:'24',l:'Concepts per competency'},{n:'$8K',l:'Starting price'},{n:'24/7',l:'Maya always on'}].map((s,i) => (
              <div key={s.l} className="stat-strip-item" style={{ padding:'0 32px', borderRight:i<4?'1px solid rgba(255,255,255,0.05)':'none', textAlign:'center' }}>
                <div className="pf" style={{ fontSize:'34px', fontWeight:'800', color:AI_BRIGHT, letterSpacing:'-0.03em' }}>{s.n}</div>
                <div className="mono" style={{ fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'5px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY AI NOW */}
      <section style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div className="grid-2" style={{ gap:'80px', alignItems:'center' }}>
            <div>
              <div className="label" style={{ marginBottom:'20px', color:AI_BRIGHT }}>The Opportunity Right Now</div>
              <div className="pf ai-h2" style={{ fontSize:'42px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'24px' }}>AI skills command a 4.1x salary premium. Most people have none.</div>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75', marginBottom:'20px' }}>LinkedIn Learning 2025 data: AI-skilled professionals earn 4.1x more than peers without AI skills. 8.5 million AI roles will go unfilled globally by 2030. The gap between what companies need and what people know has never been wider.</p>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75' }}>Most AI courses teach you to use tools. They don't teach you to think in systems, build agents, or transform organisations. That gap is exactly what the School of AI fills.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[
                { label:'Generic AI Course',     cost:'$200–$500',  note:'Tools-focused, no depth, no credential',             live:false },
                { label:'AI Bootcamp',           cost:'$5K–$15K',   note:'Cohort-based, no personalisation, rushed',           live:false },
                { label:'Self-taught (YouTube)', cost:'Free',        note:'No structure, no evaluation, no credential',         live:false },
                { label:'School of AI',          cost:'From $1.5K', note:'Practitioner knowledge · Maya 24/7 · Real credential',live:true  },
              ].map(item => (
                <div key={item.label} style={{ background:item.live?AI_L:'rgba(255,255,255,0.02)', border:`1px solid ${item.live?'rgba(124,58,237,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'20px' }}>
                  <div className="mono" style={{ fontSize:'9px', color:item.live?AI_BRIGHT:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{item.label}</div>
                  <div className="pf" style={{ fontSize:'18px', fontWeight:'800', color:item.live?AI_BRIGHT:'#555', marginBottom:'4px' }}>{item.cost}</div>
                  <div style={{ fontSize:'11px', color:item.live?'#AAA':'#333', lineHeight:'1.5' }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAYA — expanded with multiple screenshots */}
      <section id="maya" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>Your AI Mentor</div>
            <h2 className="pf ai-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>
              Our AI is structured to <br /><span style={{ color:AI_BRIGHT }}>make you think like an AI Pro.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto' }}>
              Maya is trained on exclusive interviews with AI engineers, ML leads and AI product managers shipping real AI in production. Not tutorials. Real systems thinking.
            </p>
          </div>

          {/* 3 Maya screenshots side by side */}
          <div className="ai-screens-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'64px' }}>

            {/* Screen 1 — Hook: production crisis */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{ display:'flex', gap:'4px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'7px', height:'7px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
                <span className="mono" style={{ fontSize:'8px', color:'#444', flex:1, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.08em' }}>Stage 1 · Hook</span>
              </div>
              <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:AI_L, border:`1px solid ${AI}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:AI_BRIGHT, flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 12px 12px 12px', padding:'10px 12px' }}>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, marginBottom:'5px' }}>⏱ 5-MIN CHALLENGE · A02</div>
                    <div style={{ fontSize:'12px', color:'#E8E6E0', lineHeight:'1.6' }}>Your AI support agent is hallucinating order details in production. It&apos;s live. You have 5 minutes. What are your first 3 moves?</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div style={{ background:AI_L, border:`1px solid ${AI}30`, borderRadius:'12px 4px 12px 12px', padding:'10px 12px', maxWidth:'82%' }}>
                    <div style={{ fontSize:'12px', color:'#E8E6E0', lineHeight:'1.6' }}>Kill the agent, route to humans. Pull last 100 outputs. Check if it&apos;s retrieval or generation failure.</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:AI_L, border:`1px solid ${AI}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:AI_BRIGHT, flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 12px 12px 12px', padding:'10px 12px' }}>
                    <div style={{ fontSize:'12px', color:'#E8E6E0', lineHeight:'1.6' }}><span style={{ color:AI_BRIGHT, fontWeight:'600' }}>Safety before diagnosis.</span> Most people debug first. You contained it first. Moving to Stage 2.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 2 — Quiz interface */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{ display:'flex', gap:'4px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'7px', height:'7px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
                <span className="mono" style={{ fontSize:'8px', color:'#444', flex:1, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.08em' }}>Stage 5 · Quiz</span>
              </div>
              <div style={{ padding:'16px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>Concept A03 · RAG Systems</div>
                <div style={{ fontSize:'12px', color:'#E8E6E0', lineHeight:'1.5', marginBottom:'14px', fontWeight:'500' }}>Your RAG system returns semantically similar but factually wrong chunks. The most likely cause is:</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {[
                    { id:'A', text:'Embedding model is too small', correct:false },
                    { id:'B', text:'Chunking strategy breaks context across boundaries', correct:true },
                    { id:'C', text:'Vector database has too many dimensions', correct:false },
                    { id:'D', text:'Temperature is set too high', correct:false },
                  ].map(opt => (
                    <div key={opt.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'8px', background: opt.correct ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)', border:`1px solid ${opt.correct ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', fontWeight:'700', color: opt.correct ? '#4ADE80' : '#555', width:'16px' }}>{opt.id}</span>
                      <span style={{ fontSize:'11px', color: opt.correct ? '#E8E6E0' : '#666' }}>{opt.text}</span>
                      {opt.correct && <span style={{ marginLeft:'auto', fontSize:'10px', color:'#4ADE80' }}>✓</span>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:'12px', padding:'10px 12px', background:'rgba(74,222,128,0.05)', borderRadius:'8px', borderLeft:'2px solid rgba(74,222,128,0.3)' }}>
                  <div style={{ fontSize:'11px', color:'#888', lineHeight:'1.6' }}><span style={{ color:'#4ADE80', fontWeight:'600' }}>Why B:</span> Large chunks that span topic boundaries create embeddings that blend meaning — similar in vector space but wrong in context.</div>
                </div>
              </div>
            </div>

            {/* Screen 3 — Eval card */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{ display:'flex', gap:'4px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'7px', height:'7px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
                <span className="mono" style={{ fontSize:'8px', color:'#444', flex:1, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.08em' }}>Stage 7 · Evaluation</span>
              </div>
              <div style={{ padding:'16px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Maya&apos;s Evaluation · A02 Agent Architecture</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                  <span style={{ fontSize:'11px', color:'#AAA' }}>Concept Score</span>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                    <span className="pf" style={{ fontSize:'28px', fontWeight:'900', color:AI_BRIGHT }}>81</span>
                    <span style={{ fontSize:'11px', color:'#555' }}>/100</span>
                    <span style={{ background:'rgba(74,222,128,0.15)', color:'#4ADE80', fontSize:'9px', fontWeight:'600', padding:'2px 7px', borderRadius:'4px', marginLeft:'6px' }}>PASS</span>
                  </div>
                </div>
                {[['System Design','19/20'],['Tool Selection','16/20'],['Error Handling','14/20'],['Scalability','17/20'],['Cost Awareness','15/20']].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize:'10px', color:'#666' }}>{k}</span>
                    <span style={{ fontSize:'10px', color:'#AAA', fontFamily:'DM Mono,monospace' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:'12px', padding:'10px 12px', background:AI_L, borderRadius:'8px', borderLeft:`2px solid ${AI}` }}>
                  <div style={{ fontSize:'11px', color:'#AAA', lineHeight:'1.6' }}>
                    <span style={{ color:'#4ADE80', fontWeight:'600' }}>Strong: </span>Orchestrator design correctly separates routing from execution.<br/>
                    <span style={{ color:'#F97066', fontWeight:'600' }}>Fix: </span>No fallback when sub-agent fails. Add graceful degradation before production.
                  </div>
                </div>
              </div>
            </div>
          </div>

         {/* Maya features */}
<div className="grid-2" style={{ gap:'60px', alignItems:'start' }}>
  
  {/* LEFT COLUMN — both mockups stacked */}
  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
    
    {/* SCENARIO interface mockup */}
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden' }}>
      <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ display:'flex', gap:'4px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'7px', height:'7px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
        <span className="mono" style={{ fontSize:'8px', color:'#444', flex:1, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.08em' }}>Stage 4 · Scenario · A11</span>
      </div>
      <div style={{ padding:'20px' }}>
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>AI Transformation Decision</div>
        <div style={{ fontSize:'12px', color:'#E8E6E0', lineHeight:'1.6', marginBottom:'16px' }}>The CFO wants AI to reduce headcount by 30% in 18 months. The CTO says the data infrastructure isn&apos;t ready. You&apos;re the AI Lead. What do you do?</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {[
            { id:'A', text:'Side with the CFO — the business case is clear', risk:'high', col:'#F97066' },
            { id:'B', text:'Side with the CTO — pause until infrastructure is ready', risk:'medium', col:'#F59E0B' },
            { id:'C', text:'Propose a phased plan: fix data first, automate second', risk:'low', col:'#4ADE80' },
            { id:'D', text:'Bring in a third-party audit before deciding', risk:'medium', col:'#F59E0B' },
          ].map(choice => (
            <div key={choice.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer' }}>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', fontWeight:'700', color:choice.col, width:'16px', flexShrink:0 }}>{choice.id}</span>
              <span style={{ fontSize:'11px', color:'#AAA', flex:1 }}>{choice.text}</span>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', padding:'2px 7px', borderRadius:'4px', background:`${choice.col}10`, color:choice.col, flexShrink:0 }}>{choice.risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* EVAL interface mockup */}
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden' }}>
      <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ display:'flex', gap:'4px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'7px', height:'7px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
        <span className="mono" style={{ fontSize:'8px', color:'#444', flex:1, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.08em' }}>Stage 7 · Eval · A02</span>
      </div>
      <div style={{ padding:'20px' }}>
        <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>Concept Mastery · AI Agents & Agentic Systems</div>
        <div style={{ fontSize:'12px', color:'#E8E6E0', lineHeight:'1.6', marginBottom:'16px' }}>Maya has reviewed your agent architecture submission. Here&apos;s your performance breakdown.</div>

        {/* Score ring + overall */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px', padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'50%', border:'3px solid #4ADE80', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:'14px', fontWeight:'700', color:'#4ADE80' }}>87</span>
          </div>
          <div>
            <div style={{ fontSize:'11px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>Strong Pass</div>
            <div style={{ fontSize:'10px', color:'#666', lineHeight:'1.5' }}>You demonstrated solid understanding of agent memory systems and tool use. One gap identified below.</div>
          </div>
        </div>

        {/* Criteria breakdown */}
        {[
          { label:'Agent Architecture', score:92, col:'#4ADE80' },
          { label:'Tool Use & Memory', score:88, col:'#4ADE80' },
          { label:'Multi-Agent Orchestration', score:74, col:'#F59E0B' },
          { label:'Planning Loops', score:91, col:'#4ADE80' },
        ].map(item => (
          <div key={item.label} style={{ marginBottom:'10px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#888', textTransform:'uppercase' as const, letterSpacing:'0.05em' }}>{item.label}</span>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:item.col }}>{item.score}%</span>
            </div>
            <div style={{ height:'3px', borderRadius:'2px', background:'rgba(255,255,255,0.06)' }}>
              <div style={{ height:'100%', width:`${item.score}%`, borderRadius:'2px', background:item.col, opacity:0.8 }}/>
            </div>
          </div>
        ))}

        {/* Maya note */}
        <div style={{ marginTop:'14px', padding:'10px 12px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:`2px solid ${AI_BRIGHT}` }}>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:'4px' }}>Maya&apos;s Note</div>
          <div style={{ fontSize:'10px', color:'#888', lineHeight:'1.6' }}>Your multi-agent orchestration score suggests you&apos;re conflating CrewAI and AutoGen patterns. Next concept will address this directly.</div>
        </div>
      </div>
    </div>

  </div>{/* end LEFT COLUMN */}

  {/* RIGHT COLUMN — text */}
  <div>
    <div className="label" style={{ marginBottom:'20px', color:AI_BRIGHT }}>Why This Is Different</div>
    <div className="pf ai-h2" style={{ fontSize:'32px', fontWeight:'800', letterSpacing:'-0.02em', color:'#F0EDE6', lineHeight:'1.15', marginBottom:'20px' }}>AI is moving too fast for static courses. Maya moves with it.</div>
    <p style={{ fontSize:'15px', color:'#AAA', lineHeight:'1.7', marginBottom:'32px' }}>Maya&apos;s knowledge base is updated as practitioners are interviewed. When the AI landscape shifts — and it shifts every month — the curriculum reflects it.</p>
    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
      {[
        { icon:'🤖', title:'Agentic learning — not passive watching', desc:'Maya challenges, probes and evaluates. Every session is an active dialogue across 8 structured stages.' },
        { icon:'🔒', title:'Mastery-gated. Score ≥72 or you do not advance.', desc:'No shortcuts. Every concept is evaluated across system design, reasoning, cost awareness and communication.' },
        { icon:'⚡', title:'Always current', desc:'Trained on exclusive practitioner interviews. Updated as AI evolves. Not a recorded course from 2023.' },
        { icon:'🎯', title:'Calibrated to your background', desc:'Maya knows if you are a developer, a PM or a business leader. She teaches accordingly.' },
        { icon:'🧪', title:'8 learning interfaces', desc:'TIMER, SCENARIO, QUIZ, TASK, EVAL, DASHBOARD, DRAGDROP, SIMULATION — Maya picks the right one for every concept.' },
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
  </div>{/* end RIGHT COLUMN */}

  </div> {/* end grid-2 */}
        </div> {/* end maxWidth div — closes the maya section's wrapper */}
      </section> {/* end maya section */}

            {/* COMPETENCIES */}
      <section id="competencies" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>The Competency Library</div>
            <h2 className="pf ai-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>12 AI competencies.<br /><span style={{ color:AI_BRIGHT }}>Each one built from practitioners.</span></h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' }}>Each competency = 24 concepts = ~180 minutes of structured Maya-led learning. Every concept includes a real deliverable you must pass to advance.</p>
          </div>
          <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>Specialised AI Competencies (A01–A12)</div>
          <div className="ai-3col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'48px' }}>
            {SPECIALISED.map(comp=>(
              <div key={comp.code} style={{ background:AI_L, border:'1px solid rgba(124,58,237,0.12)', borderRadius:'12px', padding:'20px', borderLeft:'3px solid rgba(124,58,237,0.4)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <span className="mono" style={{ fontSize:'10px', fontWeight:'700', color:AI_BRIGHT, background:'rgba(124,58,237,0.12)', padding:'3px 8px', borderRadius:'4px' }}>{comp.code}</span>
                  <div style={{ fontSize:'12px', fontWeight:'600', color:'#F0EDE6' }}>{comp.name}</div>
                </div>
                <div style={{ fontSize:'11px', color:'#666', lineHeight:'1.6' }}>{comp.desc}</div>
              </div>
            ))}
          </div>
          <div className="label" style={{ marginBottom:'16px', color:'#16A34A' }}>Generic Competencies — Shared Across All Schools</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {GENERIC.map(comp=>(
              <div key={comp.code} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', background:'rgba(22,163,74,0.05)', border:'1px solid rgba(22,163,74,0.15)', borderRadius:'8px' }}>
                <span className="mono" style={{ fontSize:'10px', fontWeight:'700', color:'#4ADE80' }}>{comp.code}</span>
                <span style={{ fontSize:'12px', color:'#AAA' }}>{comp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU BUILD */}
      <section style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>What You Actually Build</div>
            <h2 className="pf ai-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>Real AI systems.<br /><span style={{ color:AI_BRIGHT }}>Not toy projects.</span></h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'580px', margin:'0 auto' }}>Every concept ends with a real task. You design agents, build RAG pipelines, write AI strategies — Maya evaluates you the way a senior AI engineer would.</p>
          </div>
          <div className="ai-3col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { stage:'Stage 6 — Task · A02', title:'Design a Multi-Agent Customer Support System', context:'You are the AI lead at a Series B fintech. Support tickets have grown 10x in 6 months. Design an agentic system to handle 80% of tickets autonomously.', deliverables:['Agent Architecture','Tool Definitions','Handoff Logic','Evaluation Framework','Cost Estimate'], time:'60 min', col:AI },
              { stage:'Stage 6 — Task · A03', title:'Build the RAG Pipeline for a Legal Knowledge Base', context:'A law firm wants to query 10,000 case documents using natural language. Design the full RAG architecture — chunking, embedding, retrieval and generation.', deliverables:['Chunking Strategy','Embedding Model Choice','Retrieval Logic','Prompt Design','Evaluation Metrics'], time:'60 min', col:'#6366F1' },
              { stage:'Stage 6 — Task · A11', title:'Write the AI Transformation Roadmap', context:'The CEO of a 500-person logistics company asks you to identify 5 AI opportunities, prioritise by ROI and build a 12-month implementation plan.', deliverables:['Opportunity Audit','ROI Framework','Build vs Buy Matrix','12-Month Plan','Success Metrics'], time:'60 min', col:'#0891B2' },
            ].map(task => (
              <div key={task.title} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:'5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
                  <span className="mono" style={{ fontSize:'8px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Maya · Task</span>
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
                    {task.deliverables.map(d=><span key={d} style={{ fontSize:'10px', padding:'3px 8px', background:`${task.col}10`, border:`1px solid ${task.col}20`, borderRadius:'4px', color:'#AAA' }}>{d}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>Programs</div>
            <h2 className="pf ai-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>From builder to strategist.<br /><span style={{ color:AI_BRIGHT }}>Pick your path.</span></h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto' }}>Five programs across the full AI stack — from building agents to leading AI transformation.</p>
          </div>
          {/* Featured */}
          <div style={{ background:AI_L, border:'1px solid rgba(124,58,237,0.2)', borderRadius:'20px', padding:'36px', marginBottom:'16px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'24px' }}>
              <div style={{ flex:1, minWidth:'300px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 12px', borderRadius:'100px', background:AI, color:'#fff', letterSpacing:'0.08em' }}>MBA</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'4px 10px', borderRadius:'100px', background:AI_L, color:AI_BRIGHT, border:'1px solid rgba(124,58,237,0.3)', letterSpacing:'0.06em' }}>Most Comprehensive</span>
                </div>
                <div className="pf" style={{ fontSize:'28px', fontWeight:'800', color:'#F0EDE6', marginBottom:'8px', letterSpacing:'-0.02em' }}>AI MBA</div>
                <div className="mono" style={{ fontSize:'10px', color:AI_BRIGHT, marginBottom:'16px' }}>12 competencies · $8K–$10K · 12–18 months</div>
                <p style={{ fontSize:'14px', color:'#888', lineHeight:'1.7', marginBottom:'24px', maxWidth:'420px' }}>The complete AI professional. From LLM fundamentals to agent architecture to AI strategy. Graduate with the skills to lead AI in any organisation.</p>
                <Link href="/apply" style={{ display:'inline-block', padding:'12px 28px', borderRadius:'8px', background:AI, color:'#fff', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>Apply for AI MBA →</Link>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', maxWidth:'380px', alignContent:'flex-start' }}>
                {PROGRAMS[0].competencies.map(code=>(
                  <div key={code} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px' }}>
                    <span className="mono" style={{ fontSize:'9px', fontWeight:'700', color:AI_BRIGHT }}>{code}</span>
                    <span style={{ fontSize:'10px', color:'#666' }}>{SPECIALISED.find(s=>s.code===code)?.name||GENERIC.find(g=>g.code===code)?.name||code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="ai-2col" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px', marginBottom:'14px' }}>
            {PROGRAMS.slice(1,3).map(prog=>(
              <div key={prog.title} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${prog.col}22`, borderRadius:'16px', overflow:'hidden', borderTop:`3px solid ${prog.col}` }}>
                <div style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 10px', borderRadius:'100px', background:`${prog.col}15`, color:prog.col, border:`1px solid ${prog.col}30`, textTransform:'uppercase', letterSpacing:'0.08em' }}>{prog.badge}</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#555' }}>{prog.subtitle}</span>
                  </div>
                  <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px', lineHeight:'1.2' }}>{prog.title}</div>
                  <p style={{ fontSize:'13px', color:'#888', lineHeight:'1.65', marginBottom:'20px' }}>{prog.desc}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {prog.competencies.map(code=><span key={code} style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'3px 8px', borderRadius:'4px', background:`${prog.col}10`, color:prog.col, border:`1px solid ${prog.col}20` }}>{code}</span>)}
                  </div>
                </div>
                <div style={{ padding:'14px 24px', borderTop:`1px solid ${prog.col}15` }}>
                  <Link href="/apply" style={{ display:'block', textAlign:'center', padding:'10px', borderRadius:'8px', background:prog.col, color:'#fff', fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>Apply →</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="ai-2col" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
            {PROGRAMS.slice(3).map(prog=>(
              <div key={prog.title} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${prog.col}22`, borderRadius:'16px', overflow:'hidden', borderTop:`3px solid ${prog.col}` }}>
                <div style={{ padding:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', fontWeight:'700', padding:'4px 10px', borderRadius:'100px', background:`${prog.col}15`, color:prog.col, border:`1px solid ${prog.col}30`, textTransform:'uppercase', letterSpacing:'0.08em' }}>{prog.badge}</span>
                    <span className="mono" style={{ fontSize:'9px', color:'#555' }}>{prog.subtitle}</span>
                  </div>
                  <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6', marginBottom:'10px', lineHeight:'1.2' }}>{prog.title}</div>
                  <p style={{ fontSize:'13px', color:'#888', lineHeight:'1.65', marginBottom:'20px' }}>{prog.desc}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {prog.competencies.map(code=><span key={code} style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', padding:'3px 8px', borderRadius:'4px', background:`${prog.col}10`, color:prog.col, border:`1px solid ${prog.col}20` }}>{code}</span>)}
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

      {/* MENTORS */}
      <section id="mentors" style={{ padding:'120px 24px 80px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', marginBottom:'56px' }}>
          <div style={{ marginBottom:'48px' }}>
            <div className="label" style={{ marginBottom:'14px', color:AI_BRIGHT }}>The Practitioners Behind Maya</div>
            <h2 className="pf ai-h2" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'14px' }}>Designed by <br /><span style={{ color:AI_BRIGHT }}>Mentogram Mentors</span></h2>
            <p style={{ fontSize:'15px', color:'#666', lineHeight:'1.6', maxWidth:'480px' }}>Engineers, PMs and AI leaders who have deployed production AI. Their exclusive knowledge lives only here.</p>
          </div>

          {/* Andrew Chow — School Director */}
          <div style={{ background:AI_L, border:'1px solid rgba(124,58,237,0.2)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(124,58,237,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div className="ai-director-flex" style={{ position:'relative', display:'flex', gap:'36px', alignItems:'flex-start' }}>
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <div style={{ width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${SCHOOL_DIRECTOR.col}40`, marginBottom:'10px' }}>
                  <img src={SCHOOL_DIRECTOR.img} alt={SCHOOL_DIRECTOR.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'3px' }}>School Director</div>
                <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{SCHOOL_DIRECTOR.name}</div>
                <div style={{ fontSize:'10px', color:'#888', lineHeight:'1.4', maxWidth:'140px', margin:'0 auto' }}>Managing Partner · Asia Pro Ventures</div>
              </div>
              <div style={{ flex:1, minWidth:'280px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'14px' }}>A Message from the School Director</div>
                <blockquote style={{ fontSize:'15px', color:'#E8E6E0', lineHeight:'1.8', margin:0, fontStyle:'italic', borderLeft:'3px solid rgba(124,58,237,0.4)', paddingLeft:'20px' }}>
                  &ldquo;{SCHOOL_DIRECTOR.message}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM COMMITTEE */}
      <section style={{ padding:'80px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ marginBottom:'56px' }}>
            <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>Program Committee</div>
            <h2 className="pf" style={{ fontSize:'clamp(28px,4.5vw,52px)', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'16px' }}>
              School committee backed by<br /><span style={{ color:AI_BRIGHT }}>real-world AI & tech leaders.</span>
            </h2>
            <p style={{ fontSize:'16px', color:'#888', lineHeight:'1.7', maxWidth:'580px' }}>
              Every program, competency and assessment has been designed with — and validated by — engineers, product leaders and AI practitioners who are shipping real AI systems in production today.
            </p>
          </div>
          <div className="committee-grid">
            {[
              { name:'Andrew Chow',      role:'School Director · Managing Partner, Asia Pro Ventures · NTU',  tag:'School Director',  img:'/images/mentors/andrew-chow.jpg' },
              { name:'Yash Shah',        role:'Head of AI, Cloud · Amazon Web Services · India & SEA',        tag:'AI & Cloud',       img:'/images/mentors/yash-shah.jpg' },
              { name:'Prantik Mazumdar', role:'President, TiE Singapore · Exited Entrepreneur',               tag:'AI Strategy',      img:'/images/mentors/prantik-mazumdar.jpg' },
              { name:'Shavin Goswami',   role:'Operations & Strategy · Meta · ex-EY Consulting',             tag:'AI Ops',           img:'/images/mentors/shavin-goswami.jpg' },
              { name:'Jason Kraus',      role:'Founder, Prepare4VC · Partner, EQx Fund',                     tag:'AI Ventures',      img:'/images/mentors/jason-kraus.jpg' },
              { name:'Renuka Belwalkar', role:'Investor · Forbes Under 30 Scholar',                          tag:'Investment',       img:'/images/mentors/renuka-belwalkar.jpg' },
              { name:'Justin Strackany', role:'General Partner · GTM Fund · 3 exits (SecureLink/Vista)',     tag:'Growth',           img:'/images/mentors/justin-strackany.jpg' },
              { name:'Daniel Ling',      role:'ex-VP Design, Lazada & DBS · NUS',                           tag:'AI Product',       img:'/images/mentors/daniel-ling.jpg' },
              { name:'Rajesh Setty',     role:'19x Author · Mentor at Founder Institute · Silicon Valley',  tag:'Strategy',         img:'/images/mentors/rajesh-shetty.jpg' },
              { name:'Sarvash Malani',   role:'DeepTech VC, Temasek · Wharton Grad',                        tag:'DeepTech VC',      img:'/images/mentors/sarvash-malani.jpg' },
            ].map(m => (
              <div key={m.name} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'12px' }}>
                <div style={{ width:'88px', height:'88px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${AI}30`, background:`${AI}10`, flexShrink:0 }}>
                  <img src={m.img} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }} />
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', letterSpacing:'0.14em', textTransform:'uppercase' as const, color:AI_BRIGHT, background:`${AI}12`, border:`1px solid ${AI}25`, padding:'3px 10px', borderRadius:'100px' }}>{m.tag}</div>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#F0EDE6', lineHeight:'1.2' }}>{m.name}</div>
                <div style={{ fontSize:'10px', color:'#555', lineHeight:'1.5' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS YOU MASTER */}
      <section id="tools" style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'56px' }}>
            <div className="label" style={{ marginBottom:'14px', color:AI_BRIGHT }}>Tools You Will Master</div>
            <h2 className="pf ai-h2" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'14px' }}>
              The actual stack.<br /><span style={{ color:AI_BRIGHT }}>Not theory about it.</span>
            </h2>
            <p style={{ fontSize:'15px', color:'#666', lineHeight:'1.6', maxWidth:'520px', margin:'0 auto' }}>
              Every concept in the School of AI is taught using the tools practitioners actually use. By the time you finish, these are part of your working vocabulary.
            </p>
          </div>

          {/* Category filters as static labels */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', marginBottom:'40px' }}>
            {['LLM','Agents','Vector DB','Automation','Data','BI','API','Models','No-Code','Dev Tools'].map(cat => (
              <div key={cat} style={{ padding:'5px 14px', borderRadius:'100px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', fontFamily:'DM Mono,monospace', fontSize:'9px', color:AI_BRIGHT, textTransform:'uppercase', letterSpacing:'0.08em' }}>{cat}</div>
            ))}
          </div>

          <div className="ai-tools-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px' }}>
            {TOOLS.map(tool => (
              <div key={tool.name} style={{ padding:'16px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', textAlign:'center', borderTop:`2px solid ${tool.col}40` }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>{tool.icon}</div>
                <div style={{ fontSize:'12px', fontWeight:'600', color:'#E8E6E0', marginBottom:'4px' }}>{tool.name}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:'#555', textTransform:'uppercase', letterSpacing:'0.06em' }}>{tool.cat}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'32px', padding:'16px 24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', textAlign:'center' }}>
            <span style={{ fontSize:'13px', color:'#555' }}>Tools are covered within their relevant competency. You learn them in the context of real problems — not as standalone tutorials.</span>
          </div>
        </div>
      </section>

      {/* NOT JUST AI — HUMAN LEARNING */}
      <section style={{ padding:'100px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'500px', background:`radial-gradient(ellipse,rgba(124,58,237,0.07) 0%,transparent 65%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:'1160px', margin:'0 auto', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:AI_BRIGHT }}>The Learning Experience</div>
            <h2 className="pf" style={{ fontSize:'clamp(28px,4.5vw,56px)', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'20px' }}>
              You don't learn alone<br /><span style={{ color:AI_BRIGHT }}>with AI.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'540px', margin:'0 auto' }}>
              75% of your learning is structured, personalised and AI-driven. But the other 25%? That's the human side that turns knowledge into real capability.
            </p>
          </div>

          {/* 75/25 bar */}
          <div style={{ maxWidth:'640px', margin:'0 auto 72px' }}>
            <div style={{ display:'flex', borderRadius:'100px', overflow:'hidden', height:'10px', marginBottom:'16px' }}>
              <div style={{ width:'75%', background:`linear-gradient(90deg,${AI},${AI_BRIGHT})` }} />
              <div style={{ width:'25%', background:'linear-gradient(90deg,#FF6A00,#FF9A00)' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:AI }} />
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:AI_BRIGHT, letterSpacing:'0.1em', textTransform:'uppercase' as const }}>75% — Maya AI Learning</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#FF6A00' }} />
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#FF9A00', letterSpacing:'0.1em', textTransform:'uppercase' as const }}>25% — Human</span>
              </div>
            </div>
          </div>

          <div className="grid-3-auto">
            {/* In-person Immersions */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,${AI},${AI_BRIGHT})`, borderRadius:'20px 20px 0 0' }} />
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:`${AI}15`, border:`1px solid ${AI}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'20px' }}>✈️</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:AI_BRIGHT, letterSpacing:'0.14em', textTransform:'uppercase' as const, marginBottom:'10px' }}>01 · In-Person</div>
              <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'14px', lineHeight:'1.2' }}>Global Immersions</div>
              <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.75', marginBottom:'20px' }}>
                Travel with your cohort to the world's most important AI ecosystems — Silicon Valley for foundation model companies, Singapore for AI governance and Southeast Asia deployment, and India for AI at scale.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['San Francisco — AI labs, foundation model companies','Singapore — AI governance & Southeast Asia','Mumbai — AI at scale, India tech ecosystem','Dubai — AI in enterprise & regional expansion'].map(city => (
                  <div key={city} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:AI, flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#666' }}>{city}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sunday Sessions */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#FF6A00,#FF9A00)', borderRadius:'20px 20px 0 0' }} />
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(255,106,0,0.1)', border:'1px solid rgba(255,106,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'20px' }}>🧪</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#FF9A00', letterSpacing:'0.14em', textTransform:'uppercase' as const, marginBottom:'10px' }}>02 · Experiential</div>
              <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'14px', lineHeight:'1.2' }}>Sunday Sessions</div>
              <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.75', marginBottom:'20px' }}>
                Every Sunday, your cohort gathers live for a 3-hour experiential session — real AI product crises, agent failures, model failures in production, and deployment disasters. You don't read about them. You solve them as if you shipped the system.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['AI product crises — solve in real time','Agent failures & debugging sessions','Live model evaluation & red-teaming','Debrief with an AI practitioner every session'].map(point => (
                  <div key={point} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#FF6A00', flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#666' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Leader Discussions */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#6366F1,#A78BFA)', borderRadius:'20px 20px 0 0' }} />
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'20px' }}>🤝</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#A78BFA', letterSpacing:'0.14em', textTransform:'uppercase' as const, marginBottom:'10px' }}>03 · AI Sessions</div>
              <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'14px', lineHeight:'1.2' }}>AI Faculty Discussions</div>
              <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.75', marginBottom:'20px' }}>
                Once a week, an AI practitioner from our committee joins your cohort for a direct, unscripted conversation — the systems they've shipped, the failures that taught them the most, and where AI is actually going. This is not a lecture. This is access.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['AI engineers, PMs, founders and researchers','Unscripted — real systems, real failures','Live Q&A — you ask, they answer honestly','Recorded and timestamped in your learning log'].map(point => (
                  <div key={point} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#6366F1', flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#666' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom callout */}
          <div style={{ marginTop:'48px', padding:'32px 40px', background:`${AI}06`, border:`1px solid ${AI}20`, borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'24px' }}>
            <div>
              <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6', marginBottom:'6px' }}>The AI does the teaching. The humans do the shaping.</div>
              <div style={{ fontSize:'14px', color:'#666' }}>Most programs give you one or the other. We built both into every week of the program.</div>
            </div>
            <Link href="/apply" style={{ fontFamily:'DM Mono,monospace', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase' as const, padding:'14px 28px', borderRadius:'8px', background:AI, color:'#fff', textDecoration:'none', fontWeight:'600', whiteSpace:'nowrap' as const }}>Apply Now →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ai-cta" style={{ padding:'140px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'500px', background:'radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'780px', margin:'0 auto' }}>
          <div className="label" style={{ marginBottom:'24px', color:AI_BRIGHT }}>The window is open. For now.</div>
          <h2 className="pf" style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:'900', letterSpacing:'-0.035em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'24px' }}>AI skills compound.<br />Start earlier than everyone else.</h2>
          <p style={{ fontSize:'18px', color:'#888', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto 48px' }}>We review every application personally. If accepted, you receive your Student ID within 48 hours and begin your first AI concept immediately.</p>
          <Link href="/apply" style={{ fontSize:'16px', fontWeight:'700', padding:'18px 56px', borderRadius:'8px', background:AI, color:'#fff', textDecoration:'none', display:'inline-block' }}>Apply to School of AI & Tech →</Link>
          <div style={{ marginTop:'32px', display:'flex', gap:'32px', justifyContent:'center', flexWrap:'wrap' }}>
            {['Reviewed within 48 hours','Student ID issued on approval','Begin learning immediately'].map(t=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:AI }} />
                <span style={{ fontSize:'13px', color:'#555' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'48px 24px', background:'#02020A', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#F0EDE6' }}>Mento<span style={{ color:'#FF6A00' }}>gram</span><span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>School of AI & Tech</span></div>
          </Link>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[['/', 'Home'],['/finance','Finance'],['/business','Business'],['/manufacturing','Manufacturing'],['/apply','Apply']].map(([href, label])=>(
              <Link key={label} href={href} style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>{label}</Link>
            ))}
          </div>
          <div className="mono" style={{ fontSize:'10px', color:'#222', letterSpacing:'0.08em' }}>2025 Mentogram · School of AI & Tech</div>
        </div>
      </footer>
    </div>
  )
}
