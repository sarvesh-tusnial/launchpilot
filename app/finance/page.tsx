import Link from 'next/link'
import MobileNav from '@/components/layout/MobileNav'

type GalleryItem = { src: string | null; city: string; label: string; bg: string }

const mobileStyles = `
  /* ── Nav ── */
  @media (max-width: 768px) {
    .nav-wrap { padding: 0 16px !important; height: 58px !important; }
  }

  /* ── Hero h1 — overrides globals.css with higher specificity ── */
  .fin-h1-wrap h1.pf { font-size: 82px; line-height: 1.04; }
  @media (max-width: 768px) { .fin-h1-wrap h1.pf { font-size: 52px !important; line-height: 1.08 !important; } }
  @media (max-width: 480px) { .fin-h1-wrap h1.pf { font-size: 48px !important; line-height: 1.08 !important; } }

  /* ── Hero ── */
  .h1-big { font-size: clamp(44px, 10vw, 88px) !important; line-height: 1.08 !important; }
  @media (max-width: 768px) {
    .fin-hero { padding: 100px 20px 64px !important; min-height: unset !important; }
    .fin-hero h1 { font-size: 52px !important; line-height: 1.1 !important; }
    .fin-hero p { font-size: 15px !important; margin-bottom: 32px !important; max-width: 100% !important; }
    .fin-hero-cta { flex-direction: column !important; align-items: stretch !important; }
    .fin-hero-cta a { text-align: center !important; width: 100% !important; box-sizing: border-box !important; }
    .fin-stat-strip { padding-top: 28px !important; }
  }

  /* ── Stat strip ── */
  .stat-strip-item {
    padding: 12px 16px !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex: 0 0 50%;
    text-align: center;
  }
  .stat-strip-item:last-child { border-bottom: none; }
  @media (min-width: 640px) {
    .stat-strip-item { flex: 1; border-right: 1px solid rgba(255,255,255,0.05) !important; border-bottom: none !important; }
    .stat-strip-item:last-child { border-right: none !important; }
  }

  /* ── Section padding ── */
  @media (max-width: 768px) {
    section { padding-top: 64px !important; padding-bottom: 64px !important; }
    section h2.pf, .fin-h2 { font-size: clamp(26px, 7vw, 48px) !important; }
  }

  /* ── 2-col grids ── */
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; } }

  /* ── 3-col grids ── */
  .grid-3-auto { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 900px) { .grid-3-auto { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 540px) { .grid-3-auto { grid-template-columns: 1fr !important; } }

  /* ── Programs grid ── */
  .fin-programs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  @media (max-width: 640px) { .fin-programs-grid { grid-template-columns: 1fr !important; } }

  /* ── Competency grid ── */
  .fin-comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 48px; }
  @media (max-width: 900px) { .fin-comp-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 540px) { .fin-comp-grid { grid-template-columns: 1fr !important; } }

  /* ── Roles grid ── */
  .fin-roles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  @media (max-width: 900px) { .fin-roles-grid { grid-template-columns: repeat(2, 1fr) !important; } }
  @media (max-width: 480px) { .fin-roles-grid { grid-template-columns: 1fr !important; } }

  /* ── Director flex ── */
  .fin-director-flex { display: flex; gap: 36px; align-items: flex-start; flex-wrap: wrap; }
  @media (max-width: 640px) {
    .fin-director-flex { flex-direction: column !important; gap: 20px !important; }
    .fin-director-flex > div:last-child { min-width: unset !important; }
  }

  /* ── Committee grid ── */
  .committee-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
  @media (max-width: 900px) { .committee-grid { grid-template-columns: repeat(3, 1fr) !important; } }
  @media (max-width: 540px) { .committee-grid { grid-template-columns: repeat(2, 1fr) !important; } }

  /* ── Footer ── */
  @media (max-width: 640px) {
    .fin-footer { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
  }

  /* ── CTA ── */
  @media (max-width: 768px) {
    .fin-cta { padding: 80px 20px !important; }
  }
`

const FIN   = '#1D4ED8'
const FIN_B = '#60A5FA'
const FIN_L = 'rgba(29,78,216,0.08)'

const SPECIALISED = [
  { code:'F01', name:'Financial Modelling & Valuation',        desc:'DCF, comparable company analysis, LBO basics, scenario modelling, Excel/Sheets mastery, sensitivity analysis' },
  { code:'F02', name:'Corporate Finance & Capital Structure',  desc:'WACC, capital allocation, debt vs equity trade-offs, M&A rationale, dividend policy, synergy analysis' },
  { code:'F03', name:'Investment Analysis & Portfolio Mgmt',   desc:'Equity research, fundamental analysis, portfolio theory, risk-return, factor investing, portfolio construction' },
  { code:'F04', name:'Venture Capital & Startup Finance',      desc:'VC fund mechanics, deal sourcing, term sheets, cap table management, valuation methods, portfolio construction' },
  { code:'F05', name:'Investment Banking & Deal Execution',    desc:'M&A process, fairness opinions, roadshows, IPO mechanics, debt capital markets, pitch book construction' },
  { code:'F06', name:'Private Equity & Alt Investments',       desc:'PE fund structure, leveraged buyouts, value creation plans, exit strategies, real assets, hedge funds' },
  { code:'F07', name:'Financial Markets & Macro Economics',    desc:'Interest rates, FX, equities, fixed income, commodities, central bank policy, macro indicators, global capital flows' },
  { code:'F08', name:'FinTech & Digital Finance',              desc:'Digital payments, neobanking, embedded finance, DeFi, blockchain basics, open banking APIs, regulatory landscape' },
  { code:'F09', name:'Risk Management & Compliance',           desc:'Market risk, credit risk, operational risk, Basel III, AML/KYC, stress testing, risk reporting frameworks' },
  { code:'F10', name:'Startup Fundraising & Investor Relations',desc:'Pitch deck construction, valuation negotiation, investor outreach, data room preparation, closing rounds' },
  { code:'F11', name:'Accounting & Financial Reporting',       desc:'P&L, balance sheet, cash flow, GAAP vs IFRS, financial statement analysis, earnings quality' },
  { code:'F12', name:'ESG Investing & Sustainable Finance',    desc:'ESG frameworks, impact measurement, green bonds, sustainability reporting, TCFD, responsible investment' },
]

const GENERIC = [
  { code:'G01', name:'Strategic Thinking' },
  { code:'G03', name:'Communication & Storytelling' },
  { code:'G04', name:'Data Analysis & Interpretation' },
  { code:'G05', name:'AI Tools for Professionals' },
  { code:'G06', name:'Problem Solving & Frameworks' },
  { code:'G07', name:'Entrepreneurial Thinking' },
  { code:'G08', name:'Negotiation & Influence' },
  { code:'G12', name:'Global Business Context' },
]

const PROGRAMS = [
  { badge:'MBA',  title:'Finance MBA',                       subtitle:'12 competencies · $8K · 12–18 months', desc:'The complete finance professional. From financial modelling to capital markets to ESG.', col:FIN,       competencies:['F01','F02','F03','F07','F09','F11','G01','G03','G04','G06','G08','G12'] },
  { badge:'PGP',  title:'PGP in Venture Capital',            subtitle:'6 competencies · $4K · 6–9 months',     desc:'Purpose-built for aspiring VC associates, analysts, and founders who want to understand the other side of the table.', col:'#7C3AED', competencies:['F04','F03','F10','F01','G06','G07'] },
  { badge:'PGP',  title:'PGP in Investment Banking',         subtitle:'6 competencies · $4K · 6–9 months',     desc:'The structured path to IB. Financial modelling, M&A, capital markets, and deal execution — taught by practitioners who have closed real deals.', col:'#0D9488', competencies:['F05','F01','F02','F06','G03','G08'] },
  { badge:'PGP',  title:'PGP in FinTech',                   subtitle:'6 competencies · $4K · 6 months',       desc:'The intersection of finance and technology. Digital payments, neobanking, DeFi, embedded finance and the regulatory landscape.', col:'#F59E0B', competencies:['F08','F09','F07','G05','G06','G04'] },
  { badge:'CERT', title:'Financial Modelling',subtitle:'3 competencies · $1.5K · 2 months',     desc:'The most in-demand technical finance skill. DCF, comparable company analysis, and financial statement mastery in 8 weeks.', col:'#16A34A', competencies:['F01','F11','F02'] },
  { badge:'BYO',  title:'Build Your Own Finance MBA',        subtitle:'Any 12 competencies · Custom pricing',       desc:'Pick exactly what you need from the full library. Mix Finance, AI, Business and Generic competencies. Your degree, your way.', col:FIN, competencies:['G01','G03','G04','G06','G08','G12'] },
]

const SCHOOL_DIRECTOR = {
  img:      '/images/mentors/toyoyuki-ushioda.jpg',
  initials: 'TU',
  name:     'Toyoyuki Ushioda',
  role:     'School Director · CFO Director, ex-VP · MapleTree Investments ($80B AUM)',
  col:      '#F59E0B',
  message:  'Finance is the language of business — but most finance education teaches you the vocabulary without ever putting you in a real conversation. What we have built at Mentogram is different. Every concept you learn here comes from practitioners who have done the actual work — closed the deals, built the models, lost the trades and learned from them. My job as School Director is to make sure that knowledge is real, rigorous, and relevant to where the world is going. Welcome to the School of Finance.',
}

// ── MentorCard component (same as homepage) ─────────────────
type MentorData = { img: string | null; initials: string; name: string; role: string; company: string; expertise: string; programs: string[]; col: string }

function MentorCard({ m }: { m: MentorData }) {
  return (
    <div style={{ width:'240px', background:'rgba(255,255,255,0.02)', border:`1px solid ${m.col}22`, borderRadius:'14px', overflow:'hidden', flexShrink:0 }}>
      <div style={{ position:'relative', height:'200px', background:`linear-gradient(145deg,${m.col}10,#05050A)` }}>
        {m.img
          ? <img src={m.img} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:`${m.col}18`, border:`2px solid ${m.col}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'800', color:m.col, fontFamily:'Playfair Display,serif' }}>{m.initials}</div>
            </div>
        }
        <div style={{ position:'absolute', top:'10px', right:'10px', display:'flex', flexDirection:'column', gap:'3px' }}>
          {m.programs.map(p => (
            <span key={p} style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', textTransform:'uppercase' as const, letterSpacing:'0.07em', padding:'3px 8px', borderRadius:'100px', background:`${m.col}20`, color:m.col, border:`1px solid ${m.col}30`, display:'block', whiteSpace:'nowrap' as const }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:'16px' }}>
        <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{m.name}</div>
        <div style={{ fontSize:'11px', color:m.col, fontWeight:'500', marginBottom:'1px' }}>{m.role}</div>
        <div style={{ fontSize:'11px', color:'#888', marginBottom:'10px' }}>{m.company}</div>
        <div className="mono" style={{ fontSize:'9px', color:'#444', textTransform:'uppercase' as const, letterSpacing:'0.05em', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'10px', lineHeight:'1.5' }}>{m.expertise}</div>
      </div>
    </div>
  )
}

// ── All mentor rows (same as homepage) ───────────────────────
const mentorRow1: MentorData[] = [
  { img:'/images/mentors/andrew-chow.jpg',      initials:'AC', name:'Andrew Chow',      role:'Managing Partner, Co-founder', company:'Asia Pro Ventures',                    expertise:'Consumer product · Discovery · Growth', programs:['Singapore'],     col:'#FF6A00' },
  { img:'/images/mentors/andrew-momat.jpg',     initials:'AM', name:'Andrew Momat',     role:'Chief Product Officer',        company:'Razorpay · Ex-Flipkart',               expertise:'Payments · B2B · Scaling',              programs:['Australia'],     col:'#60A5FA' },
  { img:'/images/mentors/bhavin-mehta.jpg',     initials:'BM', name:'Bhavin Mehta',     role:'Managing Director, APAC',      company:'Helpling',                             expertise:'AI implementation · Leadership',        programs:['Singapore'],     col:'#A78BFA' },
  { img:'/images/mentors/daniel-ling.jpg',      initials:'DL', name:'Daniel Ling',      role:'ex-VP, Founder',               company:'DBS, Lazada',                          expertise:'Growth loops · Retention · PLG',        programs:['Singapore'],     col:'#34D399' },
  { img:'/images/mentors/edmund-tan.jpg',       initials:'ET', name:'Edmund Tan',       role:'Investor and VC',              company:'Family Office',                        expertise:'Education · Scale',                    programs:['South East Asia'],col:'#2DD4BF' },
  { img:'/images/mentors/gaurav-thakkar.jpg',   initials:'GT', name:'Gaurav Thakkar',   role:'Managing Partner',             company:'Silicon Road Ventures, ex-Rockstud Capital', expertise:'Consumer · Ops · Growth',         programs:['India'],         col:'#FB923C' },
]

const mentorRow2: MentorData[] = [
  { img:'/images/mentors/jason-kraus.jpg',      initials:'JK', name:'Jason Kraus',      role:'Founder and VC',               company:'EQX Fund',                             expertise:'Algo trading · Risk · Markets',         programs:['Boston'],        col:'#F59E0B' },
  { img:'/images/mentors/john-lim.jpg',         initials:'JL', name:'John Lim',         role:'Managing Partner',             company:'Meet Ventures',                        expertise:'Brand · Performance · D2C',             programs:['Singapore'],     col:'#FB7185' },
  { img:'/images/mentors/justin-strackany.jpg', initials:'JS', name:'Justin Strackany', role:'General Partner',              company:'GTM Fund',                             expertise:'EdTech · Consumer · B2C',               programs:['San Francisco'], col:'#F97066' },
  { img:'/images/mentors/mayank-jain.jpg',      initials:'MJ', name:'Mayank Jain',      role:'Founder and Partner',          company:'Thinkuvate Ventures',                  expertise:'Cybersecurity · Fintech · Risk',        programs:['Singapore'],     col:'#818CF8' },
  { img:'/images/mentors/prantik-mazumdar.jpg', initials:'PM', name:'Prantik Mazumdar', role:'Chief Financial Officer',      company:'Exited Founder, President',            expertise:'TIE Singapore',                        programs:['Singapore'],     col:'#4ADE80' },
  { img:'/images/mentors/rajesh-shetty.jpg',    initials:'RS', name:'Rajesh Shetty',    role:'Founder and Investor',         company:'Silicon Valley Investments',           expertise:'Fintech growth · Product-led',          programs:['San Francisco'], col:'#60A5FA' },
]

const mentorRow3: MentorData[] = [
  { img:'/images/mentors/rajesh-tever.jpg',     initials:'PK', name:'Prathamesh Kant',  role:'Vice President',               company:'Goldman Sachs',                        expertise:'Search · Ads · Consumer AI',            programs:['India'],         col:'#2DD4BF' },
  { img:'/images/mentors/renuka-belwalkar.jpg', initials:'RB', name:'Renuka Belwalkar', role:'Advisor',                      company:'Forbes Recognized',                    expertise:'D2C brand · Content · Performance',     programs:['New York'],      col:'#FB7185' },
  { img:'/images/mentors/ronak-chiripal.jpg',   initials:'RC', name:'Ronak Chiripal',   role:'Promoter, Director and CEO',   company:'Chiripal Group of Companies',          expertise:'Portfolio management · Equity',         programs:['India'],         col:'#F59E0B' },
  { img:'/images/mentors/sarvash-malani.jpg',   initials:'SM', name:'Sarvash Malani',   role:'VC',                           company:'Temasek',                              expertise:'ML systems · AI product · Scale',       programs:['Singapore'],     col:'#A78BFA' },
  { img:'/images/mentors/shavin-goswami.jpg',   initials:'SG', name:'Shavin Goswami',   role:'Operations and Strategy',      company:'Meta',                                 expertise:'Marketplace · Consumer · Growth',       programs:['New York'],      col:'#FF6A00' },
  { img:'/images/mentors/shlok-jain.jpg',       initials:'SJ', name:'Shlok Jain',       role:'Product',                      company:'Grab',                                 expertise:'0-to-1 · Fundraising · Strategy',      programs:['Singapore'],     col:'#34D399' },
]

const mentorRow4: MentorData[] = [
  { img:'/images/mentors/sudeep-bhatter.jpg',   initials:'SB', name:'Sudeep Bhatter',   role:'Engineering Manager',          company:'Microsoft',                            expertise:'AI engineering · Platform · Scale',     programs:['Seattle'],       col:'#60A5FA' },
  { img:'/images/mentors/sunil-kamath.jpg',     initials:'SK', name:'Sunil Kamath',     role:'Founder and Partner',          company:'Hustle Ventures',                      expertise:'Consumer · Distribution · Partnerships',programs:['India'],         col:'#F97066' },
  { img:'/images/mentors/temple-fennel.jpg',    initials:'TF', name:'Temple Fennel',    role:'Venture Partner',              company:'Clean Energy Ventures',                expertise:'Social products · Ads · Consumer AI',   programs:['New York'],      col:'#818CF8' },
  { img:'/images/mentors/toyoyuki-ushioda.jpg', initials:'TU', name:'Toyoyuki Ushioda', role:'CFO Director, ex-VP',          company:'MapleTree Investments | $80B AUM',     expertise:'Venture · Strategy · Japan-SEA markets',programs:['Japan'],         col:'#F59E0B' },
  { img:'/images/mentors/vansh-chiripal.jpg',   initials:'VC', name:'Vansh Chiripal',   role:'Promoter',                     company:'Chiripal Group of Companies',          expertise:'D2C growth · Performance · Brand',      programs:['India'],         col:'#FB7185' },
  { img:'/images/mentors/yash-shah.jpg',        initials:'YS', name:'Yash Shah',        role:'Head of AI, Cloud',            company:'Amazon Web Services',                  expertise:'Payments · API products · B2B',         programs:['India'],         col:'#4ADE80' },
]

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
export default function FinancePage() {
  return (
    <div style={{ background:'#05050A', minHeight:'100vh', color:'#E8E6E0', fontFamily:'DM Sans,sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />
      <style>{`
        /* ── Finance page mobile optimisation ── */
        @media (max-width: 768px) {

          /* Sections */
          section { padding: 64px 20px !important; }

          /* Hero */
          .fin-hero h1 { font-size: 36px !important; line-height: 1.1 !important; }
          .fin-hero p  { font-size: 16px !important; }
          .fin-stat-strip { flex-direction: column; gap: 16px; border-top: none !important; }
          .fin-stat-strip > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0 !important; }
          .fin-stat-strip > div:last-child { border-bottom: none; }

          /* 2-col grids → 1 col */
          .grid-2 { grid-template-columns: 1fr !important; gap: 32px !important; }

          /* 3-col program grids → 1 col */
          .fin-programs-grid { grid-template-columns: 1fr !important; }

          /* Competency grid 3 col → 1 col */
          .fin-comp-grid { grid-template-columns: 1fr !important; }

          /* Comparison grid 2 col → 2 col (ok on mobile) */

          /* 8-stage section — hide chat mockup on mobile, show stages only */
          .fin-chat-hide { display: none !important; }

          /* Toyo director card — stack vertically */
          .fin-director-flex { flex-direction: column !important; gap: 24px !important; }
          .fin-director-flex blockquote { font-size: 14px !important; }

          /* Careers — globe stack */
          .fin-careers-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .fin-globe { max-width: 280px !important; margin: 0 auto; }

          /* Roles grid 4 col → 2 col */
          .fin-roles-grid { grid-template-columns: 1fr 1fr !important; }

          /* Headlines */
          .fin-h2 { font-size: 32px !important; }
          .fin-h2-sm { font-size: 28px !important; }

          /* Programs 3-col → 1-col */
          .fin-prog-3 { grid-template-columns: 1fr !important; }

          /* Footer stack */
          .fin-footer { flex-direction: column; align-items: flex-start !important; gap: 20px !important; }
          .fin-footer-links { flex-wrap: wrap; gap: 12px !important; }

          /* CTA padding */
          .fin-cta { padding: 80px 20px !important; }

          /* Mentor director image */
          .fin-director-img { width: 72px !important; height: 72px !important; }
        }

        @media (max-width: 480px) {
          section { padding: 48px 16px !important; }
          .fin-roles-grid { grid-template-columns: 1fr !important; }
          .fin-hero h1 { font-size: 30px !important; }
          .fin-h2 { font-size: 26px !important; }
          .fin-h2-sm { font-size: 22px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav-wrap" style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', background:'rgba(5,5,10,0.94)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'40px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6' }}>
              Mento<span style={{ color:'#FF6A00' }}>gram</span>
              <span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>Finance</span>
            </div>
          </Link>
          <div className="hide-mob" style={{ display:'flex', gap:'28px' }}>
            {[['#programs','Programs'],['#competencies','Competencies'],['#mentors','School Director'],['#careers','Careers']].map(([h,l]) => (
              <a key={h} href={h} className="nav-link">{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <Link href="/" className="hide-mob nav-link" style={{ padding:'8px 16px', fontSize:'13px' }}>← All Schools</Link>
          <Link href="/auth/login" className="nav-link hide-mob" style={{ padding:'8px 16px' }}>Sign In</Link>
          <Link href="/apply" className="btn-o" style={{ fontSize:'13px', padding:'10px 22px', background:FIN, borderColor:FIN }}>Apply Now →</Link>
          <MobileNav page="student" />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'130px 20px 90px', position:'relative', overflow:'hidden' }} className="fin-hero">
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1000px', height:'600px', background:'radial-gradient(ellipse,rgba(29,78,216,0.12) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'1040px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'100px', background:'rgba(29,78,216,0.07)', border:'1px solid rgba(29,78,216,0.25)', marginBottom:'32px' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:FIN, display:'inline-block', animation:'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize:'10px', color:FIN_B, textTransform:'uppercase', letterSpacing:'0.18em' }}>School of Finance · Mentogram</span>
          </div>
          <div className="fin-h1-wrap">
          <h1 className="pf h1-big" style={{ fontWeight:'900', lineHeight:'1.04', letterSpacing:'-0.035em', marginBottom:'28px', color:'#F0EDE6' }}>
            The career in finance<br />you always<br /><span style={{ color:FIN_B }}>deserved.</span>
          </h1>
          </div>
          <p style={{ fontSize:'19px', color:'#AAA', lineHeight:'1.72', maxWidth:'620px', margin:'0 auto 52px', fontWeight:'400' }}>
            No outdated textbooks. No theory without context. The School of Finance is built from exclusive knowledge from VCs, investment bankers, and CFOs — taught by Maya, your personal AI mentor, available 24/7.
          </p>
          <div className="fin-hero-cta" style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'72px' }}>
            <Link href="/apply" className="btn-o" style={{ fontSize:'15px', padding:'15px 40px', background:FIN, borderColor:FIN }}>Apply Now →</Link>
            <a href="#programs" style={{ fontSize:'15px', padding:'15px 40px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#AAA', textDecoration:'none' }}>See All Programs</a>
          </div>
          <div className="fin-stat-strip" style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'44px' }}>
            {[{n:'5',l:'Programs'},{n:'12',l:'Specialised competencies'},{n:'24',l:'Concepts per competency'},{n:'$5K',l:'Average price'},{n:'24/7',l:'Maya always on'}].map((s,i) => (
              <div key={s.l} className="stat-strip-item" style={{ padding:'0 32px', borderRight:i<4?'1px solid rgba(255,255,255,0.05)':'none', textAlign:'center' }}>
                <div className="pf" style={{ fontSize:'34px', fontWeight:'800', color:FIN_B, letterSpacing:'-0.03em' }}>{s.n}</div>
                <div className="mono" style={{ fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'5px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{ padding:'120px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div className="grid-2" style={{ gap:'80px', alignItems:'center' }}>
            <div>
              <div className="label" style={{ marginBottom:'20px', color:FIN_B }}>The Problem With Finance Education</div>
              <div className="pf" style={{ fontSize:'42px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'24px' }}>Finance is one of the most valuable skills on earth. And the hardest to learn well.</div>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75', marginBottom:'20px' }}>A CFA takes 4 years and costs $3,000+ in exams alone. An MBA at a top school costs $200,000+. And most programs still teach you theory — not how deals actually get done, how VCs actually think, or how CFOs actually make decisions.</p>
              <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.75' }}>The practitioners who know the real answers — the fund managers, the IB directors, the startup CFOs — can only mentor a handful of people per year. The rest of the world never gets access.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[
                { label:'CFA',               cost:'4 years · $3K+ exams', note:'Theory-heavy, no real-world context',                   live:false },
                { label:'Top MBA',           cost:'$200K+',               note:'900 seats per year globally',                           live:false },
                { label:'Online Courses',    cost:'$500–$2K',             note:'No structure, no mentorship, no credential',             live:false },
                { label:'School of Finance', cost:'From $1.5K',           note:'Practitioner knowledge · Maya 24/7 · Real credential',   live:true  },
              ].map(item => (
                <div key={item.label} style={{ background:item.live?FIN_L:'rgba(255,255,255,0.02)', border:`1px solid ${item.live?'rgba(29,78,216,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:'12px', padding:'20px' }}>
                  <div className="mono" style={{ fontSize:'9px', color:item.live?FIN_B:'#555', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{item.label}</div>
                  <div className="pf" style={{ fontSize:'18px', fontWeight:'800', color:item.live?FIN_B:'#555', marginBottom:'4px' }}>{item.cost}</div>
                  <div style={{ fontSize:'11px', color:item.live?'#AAA':'#333', lineHeight:'1.5' }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAYA */}
      <section id="maya" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:FIN_B }}>Your AI Finance Mentor</div>
            <h2 className="pf fin-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>Our AI knows finance<br /><span style={{ color:FIN_B }}>the way your best mentor would.</span></h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto' }}>Maya is trained on exclusive structured interviews with VCs, investment bankers, CFOs and fund managers. Not generic textbooks. Real thinking, real frameworks, real mistakes.</p>
          </div>
          <div className="grid-2" style={{ gap:'60px', alignItems:'start' }}>
            {/* Chat mockup */}
            <div className="fin-chat-hide" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', gap:'6px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c=><div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c, opacity:0.5 }}/>)}</div>
                <div style={{ flex:1, textAlign:'center' }}><span className="mono" style={{ fontSize:'10px', color:'#444', letterSpacing:'0.1em', textTransform:'uppercase' }}>Mentogram · Maya · Finance MBA</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}><div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }}/><span className="mono" style={{ fontSize:'9px', color:'#4ADE80' }}>Online</span></div>
              </div>
              <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', gap:'18px' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:FIN_L, border:'1px solid rgba(29,78,216,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:FIN_B, flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div>
                    <div className="mono" style={{ fontSize:'9px', color:'#333', marginBottom:'5px' }}>MAYA · Concept F01 · DCF Valuation</div>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'85%' }}>
                      <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>Morning, Arjun. Last session you built your first DCF model — you got the structure right but your terminal growth rate assumption was aggressive at 4.5%. Let&apos;s fix that today before we move to comparable company analysis.</div>
                    </div>
                    <div style={{ marginTop:'8px', background:FIN_L, border:'1px solid rgba(29,78,216,0.15)', borderRadius:'8px', padding:'10px 14px', display:'inline-flex', gap:'8px', alignItems:'center' }}>
                      <span style={{ fontSize:'10px' }}>⏱</span>
                      <span className="mono" style={{ fontSize:'9px', color:FIN_B, textTransform:'uppercase', letterSpacing:'0.06em' }}>Stage 1 — Hook · Terminal Value Challenge</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div style={{ background:'rgba(29,78,216,0.12)', border:'1px solid rgba(29,78,216,0.2)', borderRadius:'14px 4px 14px 14px', padding:'12px 16px', maxWidth:'80%' }}>
                    <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>Right — I was using GDP growth as a proxy but that&apos;s probably too high for a mature company. Should I use industry CAGR instead?</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:FIN_L, border:'1px solid rgba(29,78,216,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:FIN_B, flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px 14px 14px 14px', padding:'12px 16px', maxWidth:'85%' }}>
                    <div style={{ fontSize:'13px', color:'#E8E6E0', lineHeight:'1.65' }}>Sharp instinct. Industry CAGR is a better anchor, but the real answer from Jason Kraus: <span style={{ color:FIN_B, fontWeight:'600' }}>terminal growth should never exceed long-run inflation unless you can justify structural advantage.</span> For most companies: 2–3%. Moving to Stage 2.</div>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px' }}>
                  <div className="mono" style={{ fontSize:'9px', color:FIN_B, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Maya&apos;s Evaluation — DCF Concept</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                    <span style={{ fontSize:'11px', color:'#AAA' }}>Concept Score</span>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                      <span className="pf" style={{ fontSize:'28px', fontWeight:'900', color:FIN_B }}>79</span>
                      <span style={{ fontSize:'13px', color:'#555' }}>/100</span>
                      <span style={{ background:'rgba(74,222,128,0.15)', color:'#4ADE80', fontSize:'11px', fontWeight:'600', padding:'2px 8px', borderRadius:'4px', marginLeft:'8px' }}>PASS</span>
                    </div>
                  </div>
                  {[['Financial Reasoning','18/20'],['Model Accuracy','16/20'],['Assumption Quality','14/20'],['Communication','17/20']].map(([k,v])=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize:'11px', color:'#666' }}>{k}</span>
                      <span style={{ fontSize:'11px', color:'#AAA', fontFamily:'DM Mono,monospace' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* 8-stage */}
            <div>
              <div className="label" style={{ marginBottom:'20px', color:FIN_B }}>The 8-Stage Lesson Structure</div>
              <div className="pf" style={{ fontSize:'32px', fontWeight:'800', letterSpacing:'-0.02em', color:'#F0EDE6', lineHeight:'1.15', marginBottom:'20px' }}>Every concept follows the same rigorous structure. No shortcuts.</div>
              <p style={{ fontSize:'15px', color:'#AAA', lineHeight:'1.7', marginBottom:'32px' }}>Maya cannot advance you to the next stage until you demonstrate genuine understanding. You must score ≥72 to pass each concept.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  {n:'01',label:'Hook',            desc:'A real-world finance scenario. No theory first.',          col:FIN_B},
                  {n:'02',label:'Problem Discovery',desc:'Maya probes your thinking. What do you already know?',    col:'#7C3AED'},
                  {n:'03',label:'Concept Delivery', desc:'The structured framework, taught through dialogue.',       col:'#F59E0B'},
                  {n:'04',label:'Deep Dive',        desc:'Edge cases, exceptions, the nuance practitioners know.',   col:'#F97066'},
                  {n:'05',label:'Application',      desc:'You apply the concept to a real company or dataset.',      col:'#4ADE80'},
                  {n:'06',label:'Task',             desc:'A 60-minute real-world deliverable. No MCQs.',             col:'#FB923C'},
                  {n:'07',label:'Evaluation',       desc:'Maya scores you across 6 professional dimensions.',        col:FIN_B},
                  {n:'08',label:'Mastery Gate',     desc:'Score ≥72 to advance. Below that — you repeat.',          col:'#F59E0B'},
                ].map(stage=>(
                  <div key={stage.n} style={{ display:'flex', gap:'14px', alignItems:'center', padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', borderLeft:`3px solid ${stage.col}` }}>
                    <div className="mono" style={{ fontSize:'10px', color:stage.col, fontWeight:'700', width:'24px', flexShrink:0 }}>{stage.n}</div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#F0EDE6', marginBottom:'2px' }}>{stage.label}</div>
                      <div style={{ fontSize:'11px', color:'#666' }}>{stage.desc}</div>
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
            <div className="label" style={{ marginBottom:'16px', color:FIN_B }}>Programs</div>
            <h2 className="pf fin-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>Choose your path.<br /><span style={{ color:FIN_B }}>Or build your own.</span></h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' }}>Five predefined programs or a fully custom degree. Every program runs on Maya and includes the same practitioner knowledge.</p>
          </div>
          <div className="fin-prog-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'16px' }}>
            {PROGRAMS.slice(0,3).map(prog=>(
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
          <div className="fin-prog-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
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

      {/* COMPETENCIES */}
      <section id="competencies" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:FIN_B }}>The Competency Library</div>
            <h2 className="pf fin-h2" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'20px' }}>12 finance competencies.<br /><span style={{ color:FIN_B }}>Each built from practitioners.</span></h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'560px', margin:'0 auto' }}>Each competency = 24 concepts = ~180 minutes of structured Maya-led learning. Every concept ends with a real financial deliverable.</p>
          </div>
          <div className="label" style={{ marginBottom:'16px', color:FIN_B }}>Specialised Finance Competencies (F01–F12)</div>
          <div className="fin-comp-grid">
            {SPECIALISED.map(comp=>(
              <div key={comp.code} style={{ background:FIN_L, border:'1px solid rgba(29,78,216,0.12)', borderRadius:'12px', padding:'20px', borderLeft:'3px solid rgba(29,78,216,0.4)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <span className="mono" style={{ fontSize:'10px', fontWeight:'700', color:FIN_B, background:'rgba(29,78,216,0.12)', padding:'3px 8px', borderRadius:'4px' }}>{comp.code}</span>
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

      {/* MENTORS */}
      <section id="mentors" style={{ padding:'120px 24px 80px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', marginBottom:'56px' }}>
          <div style={{ marginBottom:'48px' }}>
            <div className="label" style={{ marginBottom:'14px', color:FIN_B }}>The Practitioners Behind Maya</div>
            <h2 className="pf" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'14px' }}>Every concept comes from<br /><span style={{ color:FIN_B }}>someone who did the real thing.</span></h2>
            <p style={{ fontSize:'15px', color:'#666', lineHeight:'1.6', maxWidth:'480px' }}>Practitioners who have closed deals, built models, and made real mistakes. Their exclusive knowledge lives only here.</p>
          </div>

          {/* School Director — Toyo */}
          <div style={{ background:FIN_L, border:'1px solid rgba(29,78,216,0.2)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'300px', height:'300px', background:'radial-gradient(ellipse,rgba(29,78,216,0.08) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div className="fin-director-flex" style={{ position:'relative', display:'flex', gap:'36px', alignItems:'flex-start', flexWrap:'wrap' }}>
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <div className="fin-director-img" style={{ width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', background:`${SCHOOL_DIRECTOR.col}18`, border:`2px solid ${SCHOOL_DIRECTOR.col}40`, marginBottom:'10px' }}>
                  {SCHOOL_DIRECTOR.img
                    ? <img src={SCHOOL_DIRECTOR.img} alt={SCHOOL_DIRECTOR.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 15%', display:'block' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'800', color:SCHOOL_DIRECTOR.col, fontFamily:'Playfair Display,serif' }}>{SCHOOL_DIRECTOR.initials}</div>
                  }
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:FIN_B, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'3px' }}>School Director</div>
                <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#F0EDE6', marginBottom:'2px' }}>{SCHOOL_DIRECTOR.name}</div>
                <div style={{ fontSize:'10px', color:'#888', lineHeight:'1.4', maxWidth:'140px', margin:'0 auto' }}>{SCHOOL_DIRECTOR.role}</div>
              </div>
              <div style={{ flex:1, minWidth:'280px' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:FIN_B, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'14px' }}>A Message from the School Director</div>
                <blockquote style={{ fontSize:'15px', color:'#E8E6E0', lineHeight:'1.8', margin:0, fontStyle:'italic', borderLeft:'3px solid rgba(29,78,216,0.4)', paddingLeft:'20px' }}>
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
            <div className="label" style={{ marginBottom:'16px', color:FIN_B }}>Program Committee</div>
            <h2 className="pf" style={{ fontSize:'clamp(28px,4.5vw,52px)', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'16px' }}>
              School committee backed by<br /><span style={{ color:FIN_B }}>real-world leaders in finance.</span>
            </h2>
            <p style={{ fontSize:'16px', color:'#888', lineHeight:'1.7', maxWidth:'580px' }}>
              Every program, competency and assessment has been designed with — and validated by — investors, bankers and CFOs who have done the actual work in the world's most competitive financial markets.
            </p>
          </div>
          <div className="committee-grid">
            {[
              { name:'Toyoyuki Ushioda', role:'School Director · CFO Director, ex-VP MapleTree Investments ($80B AUM)', tag:'School Director',  img:'/images/mentors/toyoyuki-ushioda.jpg' },
              { name:'Jason Kraus',      role:'Founder, Prepare4VC · Partner, EQx Fund',                               tag:'VC & Investing',   img:'/images/mentors/jason-kraus.jpg' },
              { name:'Renuka Belwalkar', role:'Investor · Forbes Under 30 Scholar',                                    tag:'Investment',       img:'/images/mentors/renuka-belwalkar.jpg' },
              { name:'Sarvash Malani',   role:'DeepTech VC, Temasek · Wharton Grad',                                  tag:'Venture Capital',  img:'/images/mentors/sarvash-malani.jpg' },
              { name:'Gaurav Thakkar',   role:'Principal VC, Silicon Road · ex-Morgan Stanley',                       tag:'Banking & VC',     img:'/images/mentors/gaurav-thakkar.jpg' },
              { name:'John Lim',         role:'Partner, Meet Ventures SG · ex-HOD $100M fund',                       tag:'Fund Management',  img:'/images/mentors/john-lim.jpg' },
              { name:'Justin Strackany', role:'LP at GTMFund · 3 exits (SecureLink/Vista)',                           tag:'Growth Finance',   img:'/images/mentors/justin-strackany.jpg' },
              { name:'Shavin Goswami',   role:'Global Risk Ops, Meta · ex-EY Consulting',                            tag:'Risk & Ops',       img:'/images/mentors/shavin-goswami.jpg' },
              { name:'Prantik Mazumdar', role:'President, TiE Singapore · Exited Entrepreneur',                       tag:'Entrepreneurship', img:'/images/mentors/prantik-mazumdar.jpg' },
              { name:'Andrew Chow',      role:'Co-Founder, Asia Pro Ventures · NTU',                                  tag:'Ventures',         img:'/images/mentors/andrew-chow.jpg' },
            ].map(m => (
              <div key={m.name} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'12px' }}>
                <div style={{ width:'88px', height:'88px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${FIN}30`, background:`${FIN}10`, flexShrink:0 }}>
                  <img src={m.img} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }} />
                </div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', letterSpacing:'0.14em', textTransform:'uppercase' as const, color:FIN_B, background:`rgba(29,78,216,0.1)`, border:`1px solid rgba(29,78,216,0.2)`, padding:'3px 10px', borderRadius:'100px' }}>{m.tag}</div>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#F0EDE6', lineHeight:'1.2' }}>{m.name}</div>
                <div style={{ fontSize:'10px', color:'#555', lineHeight:'1.5' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* 2 scrolling rows — smaller cards
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', gap:'10px', animation:'scrollLeft 35s linear infinite', width:'max-content' }}>
            {[...mentorRow1, ...mentorRow2, ...mentorRow1, ...mentorRow2].map((m, i) => (
              <div key={i} style={{ width:'180px', background:'rgba(255,255,255,0.02)', border:`1px solid ${m.col}22`, borderRadius:'12px', overflow:'hidden', flexShrink:0 }}>
                <div style={{ height:'150px', background:`linear-gradient(145deg,${m.col}10,#05050A)` }}>
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
            ))}
          </div>
        </div>
        <div>
          <div style={{ display:'flex', gap:'10px', animation:'scrollRight 40s linear infinite', width:'max-content' }}>
            {[...mentorRow3, ...mentorRow4, ...mentorRow3, ...mentorRow4].map((m, i) => (
              <div key={i} style={{ width:'180px', background:'rgba(255,255,255,0.02)', border:`1px solid ${m.col}22`, borderRadius:'12px', overflow:'hidden', flexShrink:0 }}>
                <div style={{ height:'150px', background:`linear-gradient(145deg,${m.col}10,#05050A)` }}>
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
            ))}
          </div>
        </div>
      </section> */}

           {/* GALLERY 
      <section style={{ padding:'80px 0', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto', padding:'0 24px', marginBottom:'40px', textAlign:'center' }}>
          <div className="label" style={{ marginBottom:'12px' }}>Global Immersions in World's Financial Hubs</div>
          <div className="pf" style={{ fontSize:'32px', fontWeight:'800', color:'#F0EDE6', letterSpacing:'-0.02em' }}>Learn with AI. Grow with People.</div>
        </div>
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', gap:'12px', animation:'scrollLeft 40s linear infinite', width:'max-content' }}>
            {galleryRow1Full.map((item, i) => (
              <div key={i} style={{ width:'320px', height:'220px', borderRadius:'14px', overflow:'hidden', flexShrink:0, position:'relative', border:'1px solid rgba(255,255,255,0.07)' }}>
                {item.src ? <img src={item.src} alt={item.city} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', background:item.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                      <div style={{ fontSize:'32px', opacity:0.3 }}>📸</div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.15)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Add photo here</div>
                    </div>
                }
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 16px', background:'linear-gradient(transparent,rgba(0,0,0,0.85))' }}>
                  <div className="pf" style={{ fontSize:'13px', fontWeight:'700', color:'#E8E6E0' }}>{item.city}</div>
                  <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display:'flex', gap:'12px', animation:'scrollRight 45s linear infinite', width:'max-content' }}>
            {galleryRow2Full.map((item, i) => (
              <div key={i} style={{ width:'280px', height:'200px', borderRadius:'14px', overflow:'hidden', flexShrink:0, position:'relative', border:'1px solid rgba(255,255,255,0.07)' }}>
                {item.src ? <img src={item.src} alt={item.city} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : <div style={{ width:'100%', height:'100%', background:item.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                      <div style={{ fontSize:'28px', opacity:0.3 }}>📸</div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.15)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Add photo here</div>
                    </div>
                }
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 14px', background:'linear-gradient(transparent,rgba(0,0,0,0.85))' }}>
                  <div className="pf" style={{ fontSize:'12px', fontWeight:'700', color:'#E8E6E0' }}>{item.city}</div>
                  <div className="mono" style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CAREERS */}
      <section id="careers" style={{ padding:'120px 24px', background:'#060608', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>

          <div className="fin-careers-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start', marginBottom:'72px' }}>

            {/* Left — headline + hubs */}
            <div>
              <div className="label" style={{ marginBottom:'14px', color:FIN_B }}>Global Finance Careers</div>
              <h2 className="pf" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.1', marginBottom:'16px' }}>
                Break into finance<br /><span style={{ color:FIN_B }}>anywhere in the world.</span>
              </h2>
              <p style={{ fontSize:'15px', color:'#666', lineHeight:'1.65', marginBottom:'36px' }}>
                Our network spans the four global finance capitals. The competencies you build here open doors in all of them.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'36px' }}>
                {[
                  { city:'Singapore', desc:'VC ecosystem · Family offices · SEA deal flow',  col:'#1D4ED8' },
                  { city:'Mumbai',    desc:'Private equity · SEBI · India capital markets',   col:'#F59E0B' },
                  { city:'New York',  desc:'Wall Street · Hedge funds · Global PE',           col:'#7C3AED' },
                  { city:'London',    desc:'IB · Asset management · European FinTech',        col:'#0D9488' },
                ].map(h => (
                  <div key={h.city} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px', borderLeft:`3px solid ${h.col}` }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:h.col, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#F0EDE6' }}>{h.city}</div>
                      <div style={{ fontSize:'11px', color:'#555' }}>{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/apply" style={{ display:'inline-block', padding:'12px 28px', borderRadius:'8px', background:FIN, color:'#fff', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>Apply to School of Finance →</Link>
            </div>

            {/* Right — animated SVG globe */}
            <div>
              <svg className="fin-globe" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:'480px' }}>
                <defs>
                  <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="globeFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0a0f1e" />
                    <stop offset="100%" stopColor="#05050A" />
                  </radialGradient>
                </defs>
                <circle cx="250" cy="250" r="240" fill="url(#globeGlow)" />
                <circle cx="250" cy="250" r="200" fill="url(#globeFill)" stroke="rgba(29,78,216,0.2)" strokeWidth="1" />
                {/* Latitude lines */}
                {[0.3,0.55,0.75,0.9].map((r,i) => (
                  <ellipse key={i} cx="250" cy="250" rx={200*r} ry={200*r*0.28} fill="none" stroke="rgba(29,78,216,0.08)" strokeWidth="1" />
                ))}
                {/* Longitude lines */}
                {[0,30,60,90,120,150].map((angle,i) => (
                  <ellipse key={i} cx="250" cy="250" rx={200*Math.abs(Math.cos(angle*Math.PI/180))+1} ry="200" fill="none" stroke="rgba(29,78,216,0.08)" strokeWidth="1" transform={`rotate(${angle} 250 250)`} />
                ))}
                <ellipse cx="250" cy="250" rx="200" ry="56" fill="none" stroke="rgba(29,78,216,0.15)" strokeWidth="1" />
                {/* Connection lines */}
                <path d="M 195 175 Q 250 200 305 205" fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 305 205 Q 320 240 315 290" fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 195 175 Q 220 250 220 310" fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 220 310 Q 265 310 315 290" fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                {/* Singapore */}
                <circle cx="340" cy="300" r="8" fill="#1D4ED8" opacity="0.9" />
                <circle cx="340" cy="300" r="16" fill="rgba(29,78,216,0.2)" />
                <circle cx="340" cy="300" r="24" fill="rgba(29,78,216,0.08)" />
                <text x="362" y="304" fill="#60A5FA" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700">SGP</text>
                <circle cx="340" cy="300" r="8" fill="none" stroke="#1D4ED8" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="8;28;8" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Mumbai */}
                <circle cx="295" cy="230" r="8" fill="#F59E0B" opacity="0.9" />
                <circle cx="295" cy="230" r="16" fill="rgba(245,158,11,0.2)" />
                <circle cx="295" cy="230" r="24" fill="rgba(245,158,11,0.08)" />
                <text x="317" y="234" fill="#F59E0B" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700">BOM</text>
                <circle cx="295" cy="230" r="8" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="8;28;8" dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="3.5s" repeatCount="indefinite" />
                </circle>
                {/* New York */}
                <circle cx="180" cy="195" r="8" fill="#7C3AED" opacity="0.9" />
                <circle cx="180" cy="195" r="16" fill="rgba(124,58,237,0.2)" />
                <circle cx="180" cy="195" r="24" fill="rgba(124,58,237,0.08)" />
                <text x="116" y="189" fill="#A78BFA" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700">NYC</text>
                <circle cx="180" cy="195" r="8" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="8;28;8" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite" />
                </circle>
                {/* London */}
                <circle cx="218" cy="165" r="8" fill="#0D9488" opacity="0.9" />
                <circle cx="218" cy="165" r="16" fill="rgba(13,148,136,0.2)" />
                <circle cx="218" cy="165" r="24" fill="rgba(13,148,136,0.08)" />
                <text x="232" y="150" fill="#2DD4BF" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700">LDN</text>
                <circle cx="218" cy="165" r="8" fill="none" stroke="#0D9488" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="8;28;8" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>

          {/* Roles grid */}
          <div style={{ marginBottom:'56px' }}>
            <div className="label" style={{ marginBottom:'20px', color:FIN_B }}>Roles our students break into</div>
            <div className="fin-roles-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
              {[
                { role:'VC Associate',             program:'PGP in Venture Capital',    col:'#7C3AED' },
                { role:'IB Analyst',               program:'Finance MBA',               col:FIN },
                { role:'CFO',                      program:'Finance MBA',               col:FIN },
                { role:'FinTech Product Lead',     program:'PGP in FinTech',            col:'#F59E0B' },
                { role:'Fund Manager',             program:'PGP in Investment Banking', col:'#0D9488' },
                { role:'Series A Founder',         program:'Finance MBA',               col:'#F97066' },
                { role:'Risk & Compliance Lead',   program:'Finance MBA',               col:FIN },
                { role:'ESG Investment Analyst',   program:'Finance MBA',               col:'#16A34A' },
                { role:'Financial Modelling Lead', program:'Certificate in Modelling',  col:'#16A34A' },
                { role:'PE Associate',             program:'PGP in Investment Banking', col:'#0D9488' },
                { role:'Startup CFO',              program:'Finance MBA',               col:FIN },
                { role:'Family Office Analyst',    program:'PGP in Venture Capital',    col:'#7C3AED' },
              ].map(c=>(
                <div key={c.role} style={{ padding:'16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', borderTop:`2px solid ${c.col}` }}>
                  <div className="pf" style={{ fontSize:'13px', fontWeight:'700', color:'#F0EDE6', marginBottom:'5px', lineHeight:'1.3' }}>{c.role}</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:'8px', color:c.col, textTransform:'uppercase', letterSpacing:'0.06em' }}>{c.program}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Scrolling hiring partner logos 
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'48px', overflow:'hidden' }}>
            <div style={{ marginBottom:'24px' }}>
              <div className="mono" style={{ fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'0.14em', textAlign:'center' }}>Hiring & Review Partners</div>
            </div>
            <div style={{ display:'flex', gap:'14px', animation:'scrollLeft 30s linear infinite', width:'max-content' }}>
              {[...Array(2)].map((_, repeat) =>
                [
                  'Goldman Sachs','Peak XV Partners','Sequoia Capital','Razorpay',
                  'MapleTree Investments','Citi','KPMG','Deloitte','EQX Fund','Silicon Road Ventures',
                ].map((name, i) => (
                  <div key={`${repeat}-${i}`} style={{ flexShrink:0, width:'160px', height:'60px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px' }}>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#444', textAlign:'center', lineHeight:'1.4' }}>{name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section> */}
        </div> 
      </section>

      {/* NOT JUST AI — HUMAN LEARNING */}
      <section style={{ padding:'100px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'700px', height:'500px', background:`radial-gradient(ellipse,rgba(29,78,216,0.07) 0%,transparent 65%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:'1160px', margin:'0 auto', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:FIN_B }}>The Learning Experience</div>
            <h2 className="pf" style={{ fontSize:'clamp(28px,4.5vw,56px)', fontWeight:'800', letterSpacing:'-0.03em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'20px' }}>
              You don't learn alone<br /><span style={{ color:FIN_B }}>with AI.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'#AAA', lineHeight:'1.7', maxWidth:'540px', margin:'0 auto' }}>
              75% of your learning is structured, personalised and AI-driven. But the other 25%? That's the human side that turns knowledge into real capability.
            </p>
          </div>

          {/* 75/25 bar */}
          <div style={{ maxWidth:'640px', margin:'0 auto 72px' }}>
            <div style={{ display:'flex', borderRadius:'100px', overflow:'hidden', height:'10px', marginBottom:'16px' }}>
              <div style={{ width:'75%', background:`linear-gradient(90deg,${FIN},${FIN_B})` }} />
              <div style={{ width:'25%', background:'linear-gradient(90deg,#7C3AED,#A855F7)' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:FIN }} />
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:FIN_B, letterSpacing:'0.1em', textTransform:'uppercase' as const }}>75% — Maya AI Learning</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#7C3AED' }} />
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#A855F7', letterSpacing:'0.1em', textTransform:'uppercase' as const }}>25% — Human</span>
              </div>
            </div>
          </div>

          <div className="grid-3-auto">
            {/* In-person Immersions */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,${FIN},${FIN_B})`, borderRadius:'20px 20px 0 0' }} />
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(29,78,216,0.1)', border:'1px solid rgba(29,78,216,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'20px' }}>✈️</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:FIN_B, letterSpacing:'0.14em', textTransform:'uppercase' as const, marginBottom:'10px' }}>01 · In-Person</div>
              <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'14px', lineHeight:'1.2' }}>Global Immersions</div>
              <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.75', marginBottom:'20px' }}>
                Travel with your cohort to the financial capitals of Asia and beyond — Singapore for fund connects, Dubai for family offices, New York and London for capital markets. You study finance from inside the rooms where decisions are made.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['Singapore — Venture Capital & Fund Ecosystem','Dubai — Family Offices & Regional Finance','Mumbai — India Investment & Startup Finance','San Francisco — Tech Finance & VC'].map(city => (
                  <div key={city} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:FIN, flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#666' }}>{city}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sunday Sessions */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#7C3AED,#A855F7)', borderRadius:'20px 20px 0 0' }} />
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'20px' }}>🧪</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#A855F7', letterSpacing:'0.14em', textTransform:'uppercase' as const, marginBottom:'10px' }}>02 · Experiential</div>
              <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'14px', lineHeight:'1.2' }}>Sunday Sessions</div>
              <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.75', marginBottom:'20px' }}>
                Every Sunday, your cohort meets live for a 3-hour experiential session — real deals that went wrong, models that were off, trades that cost millions. You don't analyse from a case study. You sit in the room and make the call.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['Live deal simulations — real term sheets, real numbers','M&A and fundraising crises — decide in real time','Team-based investment committee sessions','Debrief with a finance practitioner every session'].map(point => (
                  <div key={point} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#7C3AED', flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#666' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Leader Discussions */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'36px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#F59E0B,#FCD34D)', borderRadius:'20px 20px 0 0' }} />
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'20px' }}>🤝</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#FCD34D', letterSpacing:'0.14em', textTransform:'uppercase' as const, marginBottom:'10px' }}>03 · FINANCE FUNDAMENTALS</div>
              <div className="pf" style={{ fontSize:'22px', fontWeight:'700', color:'#F0EDE6', marginBottom:'14px', lineHeight:'1.2' }}>Weekly Finance 101</div>
              <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.75', marginBottom:'20px' }}>
                Once a week, a finance leader from our committee joins your cohort for a direct, unscripted conversation — the deal they almost lost, the model that was wrong, what they know now that they didn't at the start. This is not a lecture. This is access.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['VCs, CFOs, investment bankers, and fund managers','Unscripted — real decisions, real mistakes','Live Q&A — you ask, they answer honestly','Recorded and timestamped in your learning log'].map(point => (
                  <div key={point} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#F59E0B', flexShrink:0 }} />
                    <span style={{ fontSize:'12px', color:'#666' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom callout */}
          <div style={{ marginTop:'48px', padding:'32px 40px', background:'rgba(29,78,216,0.05)', border:'1px solid rgba(29,78,216,0.15)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'24px' }}>
            <div>
              <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#F0EDE6', marginBottom:'6px' }}>The AI does the teaching. The humans do the shaping.</div>
              <div style={{ fontSize:'14px', color:'#666' }}>Most programs give you one or the other. We built both into every week of the program.</div>
            </div>
            <Link href="/apply" style={{ fontFamily:'DM Mono,monospace', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase' as const, padding:'14px 28px', borderRadius:'8px', background:FIN, color:'#fff', textDecoration:'none', fontWeight:'600', whiteSpace:'nowrap' as const }}>Apply Now →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fin-cta" style={{ padding:'140px 24px', background:'#05050A', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'500px', background:'radial-gradient(ellipse,rgba(29,78,216,0.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'780px', margin:'0 auto' }}>
          <div className="label" style={{ marginBottom:'24px', color:FIN_B }}>Ready?</div>
          <h2 className="pf" style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:'900', letterSpacing:'-0.035em', color:'#F0EDE6', lineHeight:'1.05', marginBottom:'24px' }}>Your finance career<br />starts with an application.</h2>
          <p style={{ fontSize:'18px', color:'#888', lineHeight:'1.7', maxWidth:'520px', margin:'0 auto 48px' }}>We review every application personally. If accepted, you will receive your Mentogram Student ID within 48 hours and begin your first concept immediately.</p>
          <Link href="/apply" style={{ fontSize:'16px', fontWeight:'700', padding:'18px 56px', borderRadius:'8px', background:FIN, color:'#fff', textDecoration:'none', display:'inline-block' }}>Apply to School of Finance →</Link>
          <div style={{ marginTop:'32px', display:'flex', gap:'32px', justifyContent:'center', flexWrap:'wrap' }}>
            {['Applications reviewed within 48 hours','Student ID issued on approval','Begin learning immediately'].map(t=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:FIN }} />
                <span style={{ fontSize:'13px', color:'#555' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'48px 24px', background:'#02020A', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div className="fin-footer" style={{ maxWidth:'1160px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#F0EDE6' }}>Mento<span style={{ color:'#FF6A00' }}>gram</span><span className="mono" style={{ fontSize:'9px', color:'#333', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>School of Finance</span></div>
          </Link>
          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[['/', 'Home'],['/finance#programs','Programs'],['/finance#mentors','Mentors'],['/finance#careers','Careers'],['/enterprise','For Enterprises'],['/apply','Apply']].map(([href, label])=>(
              <Link key={label} href={href} style={{ fontSize:'13px', color:'#555', textDecoration:'none' }}>{label}</Link>
            ))}
          </div>
          <div className="mono" style={{ fontSize:'10px', color:'#222', letterSpacing:'0.08em' }}>2025 Mentogram School of Finance</div>
        </div>
      </footer>
    </div>
  )
}
