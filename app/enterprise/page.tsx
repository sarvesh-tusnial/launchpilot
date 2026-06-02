import React from 'react'
import Link from 'next/link'
import MobileNav from '@/components/layout/MobileNav'

// Enterprise accent colour — teal/blue, distinct from MBA orange
const ENT = '#60A5FA'

export default function EnterprisePage() {
  return (
    <div style={{ background:'#020817', minHeight:'100vh', color:'#E8F0FE', fontFamily:'DM Sans,sans-serif' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', padding:'0 48px', background:'rgba(2,8,23,0.95)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(96,165,250,0.1)' }} className="ent-nav">
        <div style={{ display:'flex', alignItems:'center', gap:'32px' }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}>
            <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#E8F0FE' }}>
              Mento<span style={{ color:'#60A5FA' }}>gram</span>
            </div>
            <span style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', padding:'3px 10px', borderRadius:'100px', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', color:'#60A5FA', letterSpacing:'0.1em', textTransform:'uppercase' }}>Enterprise</span>
          </Link>
          <div style={{ display:'flex', gap:'24px' }} className="hide-mob">
            {[['#vision','The Problem'],['#how','How It Works'],['#use-cases','Use Cases']].map(([h,l]) => (
              <a key={h} href={h} style={{ fontSize:'13px', color:'rgba(232,240,254,0.6)', textDecoration:'none', transition:'color 0.2s' }}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <Link href="/" className="hide-mob" style={{ fontSize:'13px', color:'rgba(232,240,254,0.5)', textDecoration:'none', padding:'8px 16px' }}>← For Students</Link>
          <a href="https://calendly.com/sarvesh-launchpilotschool/" target="_blank" className="hide-mob" style={{ fontSize:'13px', fontWeight:'700', padding:'10px 24px', borderRadius:'8px', background:'#60A5FA', color:'#020817', textDecoration:'none', transition:'opacity 0.2s' }}>Book a Demo →</a>
          <MobileNav page="enterprise" />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'130px 24px 90px', position:'relative', overflow:'hidden' }} className="ent-hero">
        {/* Grid background */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(96,165,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.04) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        {/* Radial glow */}
        <div style={{ position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)', width:'1000px', height:'600px', background:'radial-gradient(ellipse,rgba(96,165,250,0.07) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:'1100px' }}>

          {/* The problem statement — hits first */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', padding:'8px 20px', borderRadius:'100px', background:'rgba(249,112,102,0.08)', border:'1px solid rgba(249,112,102,0.2)', marginBottom:'40px' }}>
            <span style={{ fontSize:'14px' }}>⚠</span>
            <span className="mono" style={{ fontSize:'11px', color:'#F97066', textTransform:'uppercase', letterSpacing:'0.15em' }}>Welcome to the Future of Modern Enterprise Learning.</span>
          </div>

          <h1 className="pf" style={{ fontSize:'clamp(48px,6.5vw,84px)', fontWeight:'900', lineHeight:'1.04', letterSpacing:'-0.035em', marginBottom:'32px', color:'#E8F0FE' }}>
            Corporate Training has not changed in 30 years <br />
            <span style={{ color:'#60A5FA' }}>We fix that.</span>
          </h1>

          <p style={{ fontSize:'20px', color:'rgba(232,240,254,0.6)', lineHeight:'1.7', maxWidth:'700px', margin:'0 auto 16px', fontWeight:'400' }}>
            Mentogram for Enterprises captures your institutional knowledge — your frameworks, your playbooks, your culture — and turns it into personalised training for every employee to make them workforce ready.
          </p>
          <p style={{ fontSize:'16px', color:'rgba(232,240,254,0.35)', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto 52px', fontFamily:'DM Mono,monospace' }}>
          </p>

          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'80px' }} className="ent-btns">
            <a href="https://calendly.com/sarvesh-launchpilotschool/" target="_blank" style={{ fontSize:'15px', fontWeight:'700', padding:'16px 44px', borderRadius:'8px', background:'#60A5FA', color:'#020817', textDecoration:'none' }}>Book a Demo →</a>
            <a href="#how" style={{ fontSize:'15px', fontWeight:'600', padding:'16px 44px', borderRadius:'8px', background:'rgba(96,165,250,0.06)', color:'rgba(232,240,254,0.8)', textDecoration:'none', border:'1px solid rgba(96,165,250,0.15)' }}>See How It Works</a>
          </div>

          {/* The 3 brutal truths */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', maxWidth:'960px', margin:'0 auto' }} className="grid-3">
            {[
              { stat:'3–6 months', label:'before a new hire is truly productive', sub:'Most of that time is relearning what your company already knows.', col:'#F97066' },
              { stat:'$1,500',     label:'per employee spent on L&D every year', sub:'Most of it on generic courses that teach nothing specific to your business.', col:'#F59E0B' },
              { stat:'90%',      label:'current corporate skilling is redundant to the modern workforce', sub:'A skilled employee generates ROI. An unskilled employee adds to the cost.', col:'#A78BFA' },
            ].map(s => (
              <div key={s.stat} style={{ padding:'24px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'14px', borderTop:`3px solid ${s.col}`, textAlign:'left' }}>
                <div className="pf" style={{ fontSize:'32px', fontWeight:'900', color:s.col, letterSpacing:'-0.03em', marginBottom:'6px' }}>{s.stat}</div>
                <div style={{ fontSize:'14px', fontWeight:'600', color:'#E8F0FE', marginBottom:'8px', lineHeight:'1.3' }}>{s.label}</div>
                <div style={{ fontSize:'12px', color:'rgba(232,240,254,0.4)', lineHeight:'1.6' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" style={{ padding:'120px 24px', background:'#030C1A', borderTop:'1px solid rgba(96,165,250,0.08)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center' }} className="grid-2">
            <div>
              <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>The Problem</div>
              <h2 className="pf" style={{ fontSize:'48px', fontWeight:'800', letterSpacing:'-0.03em', color:'#E8F0FE', lineHeight:'1.1', marginBottom:'24px' }}>
                Your best people can&apos;t train everyone.
              </h2>
              <p style={{ fontSize:'17px', color:'rgba(232,240,254,0.55)', lineHeight:'1.75', marginBottom:'24px' }}>
                Every company has institutional knowledge — the way things are done, the frameworks that work, the mistakes already made. It lives in the heads of your senior people. When they try to pass it on, they can reach a few. The rest get generic training that teaches nothing specific to how your company operates.
              </p>
              <p style={{ fontSize:'17px', color:'rgba(232,240,254,0.55)', lineHeight:'1.75' }}>
                New employees spend months getting up to speed. L&D programmes cost a fortune and go stale. Training varies by manager. The company&apos;s real operating system — the one that makes you competitive — never fully transfers.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {[
                { icon:'⏱', col:'#F97066', title:'3-6 months to full productivity', desc:'The average time a new hire takes to reach full effectiveness. Most of that time is spent learning what your company already knows.' },
                { icon:'💸', col:'#F59E0B', title:'$1,500 per employee on L&D annually', desc:'The average enterprise L&D spend. Most of it goes to generic courses that teach nothing about how your company specifically operates.' },
                { icon:'🧠', col:'#A78BFA', title:'Knowledge locked in senior heads', desc:'Your best practitioners can mentor 5-10 people effectively. Every time a senior person leaves, institutional knowledge leaves with them.' },
                { icon:'📋', col:'#60A5FA', title:'70% training that no one remembers', desc:'Static content — PDFs, LMS courses, onboarding decks — goes out of date immediately and cannot answer follow-up questions.' },
              ].map(p => (
                <div key={p.title} style={{ display:'flex', gap:'14px', padding:'16px 20px', background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.08)', borderRadius:'12px', borderLeft:`3px solid ${p.col}` }}>
                  <span style={{ fontSize:'20px', flexShrink:0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'#E8F0FE', marginBottom:'4px' }}>{p.title}</div>
                    <div style={{ fontSize:'12px', color:'rgba(232,240,254,0.45)', lineHeight:'1.6' }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section style={{ padding:'120px 24px', background:'#020817', borderTop:'1px solid rgba(96,165,250,0.08)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'80px' }}>
            <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>The Solution</div>
            <h2 className="pf" style={{ fontSize:'52px', fontWeight:'800', letterSpacing:'-0.03em', color:'#E8F0FE', lineHeight:'1.1', marginBottom:'20px' }}>
              An AI-Native Learning System  <br /><span style={{ color:'#60A5FA' }}>that knows your company inside out.</span>
            </h2>
            <p style={{ fontSize:'17px', color:'rgba(232,240,254,0.55)', lineHeight:'1.7', maxWidth:'600px', margin:'0 auto' }}>
              We take your company&apos;s frameworks, processes, culture, and institutional knowledge — and turn it into personalised learning for every employee, relevant to today's workforce.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'80px' }} className="grid-3">
            {[
              { icon:'🏢', col:'#60A5FA', title:'Your knowledge, not generic AI', desc:'We upload your internal documentation, process guides, leadership frameworks, and past decisions. Maya learns your company — not a generic substitute.' },
              { icon:'🎯', col:'#34D399', title:'Tailored to each role', desc:'A new sales rep gets sales frameworks. A new engineer gets engineering culture. A new manager gets leadership principles. Each role gets what they actually need.' },
              { icon:'📈', col:'#A78BFA', title:'Tracks real competency, not completion', desc:'Employees don\'t just watch modules and tick checkboxes. They demonstrate understanding through real tasks — evaluated against your company\'s standards.' },
              { icon:'🔒', col:'#F59E0B', title:'Your data stays yours', desc:'Your proprietary knowledge never leaves your environment. We operate under enterprise data agreements. What you upload is never used to train public AI models.' },
              { icon:'⚡', col:'#F97066', title:'Day 1 readiness', desc:'New hires arrive with an AI mentor already loaded with everything they need to know about your company, their role, and how things work.' },
              { icon:'🔄', col:'#2DD4BF', title:'Always current', desc:'Update a policy, change a process, launch a new framework — the AI mentor updates immediately. Every employee gets the same current knowledge.' },
            ].map(f => (
              <div key={f.title} style={{ padding:'28px', background:'rgba(96,165,250,0.03)', border:'1px solid rgba(96,165,250,0.08)', borderRadius:'14px', borderTop:`3px solid ${f.col}` }}>
                <div style={{ fontSize:'28px', marginBottom:'14px' }}>{f.icon}</div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'#E8F0FE', marginBottom:'8px' }}>{f.title}</div>
                <div style={{ fontSize:'13px', color:'rgba(232,240,254,0.45)', lineHeight:'1.65' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding:'120px 24px', background:'#030C1A', borderTop:'1px solid rgba(96,165,250,0.08)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>How It Works</div>
            <h2 className="pf" style={{ fontSize:'48px', fontWeight:'800', letterSpacing:'-0.03em', color:'#E8F0FE', lineHeight:'1.1' }}>
              From your knowledge base<br />to every employee in 4 weeks.
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0', marginBottom:'80px' }} className="grid-4">
            {[
              { n:'01', col:'#60A5FA', title:'Knowledge Upload', time:'Week 1', desc:'We work with your L&D and leadership teams to upload your frameworks, processes, culture docs, onboarding materials, and institutional knowledge into the system.' },
              { n:'02', col:'#34D399', title:'Role Mapping', time:'Week 2', desc:'We configure Maya for each role in your organisation — what each person needs to know, in what order, evaluated against what standards.' },
              { n:'03', col:'#A78BFA', title:'Pilot Cohort', time:'Week 3', desc:'20-50 employees go through Maya first. We measure time-to-competency, identify knowledge gaps, and refine the curriculum with your team.' },
              { n:'04', col:'#F59E0B', title:'Company-Wide Rollout', time:'Week 4', desc:'Full deployment. Every employee gets a personalised AI mentor. You get a live dashboard showing competency progress across the organisation.' },
            ].map((s, i) => (
              <div key={s.n} style={{ padding:'28px', position:'relative', borderRight:i<3?'1px solid rgba(96,165,250,0.08)':'none' }}>
                <div className="mono" style={{ fontSize:'10px', color:s.col, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>{s.time}</div>
                <div style={{ fontSize:'36px', fontWeight:'900', color:`${s.col}20`, fontFamily:'DM Mono,monospace', marginBottom:'4px' }}>{s.n}</div>
                <div style={{ fontSize:'16px', fontWeight:'700', color:'#E8F0FE', marginBottom:'10px' }}>{s.title}</div>
                <div style={{ fontSize:'13px', color:'rgba(232,240,254,0.45)', lineHeight:'1.65' }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* SCREENSHOT 1 — Knowledge Upload Interface */}
          <div style={{ marginBottom:'80px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }} className="grid-2">
              <div>
                <div className="mono" style={{ fontSize:'10px', color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>Screenshot — Admin Portal</div>
                <h3 className="pf" style={{ fontSize:'32px', fontWeight:'800', color:'#E8F0FE', lineHeight:'1.2', marginBottom:'16px', letterSpacing:'-0.02em' }}>
                  Upload once.<br />Maya learns everything.
                </h3>
                <p style={{ fontSize:'15px', color:'rgba(232,240,254,0.55)', lineHeight:'1.75', marginBottom:'24px' }}>
                  Your admin team uploads documents, frameworks, and process guides through a simple dashboard. Maya processes everything and builds a searchable, teachable knowledge base that never goes stale.
                </p>
                {['Upload PDFs, docs, slides, and wikis', 'Link content to specific roles and competencies', 'Tag knowledge by recency — Maya surfaces latest versions first', 'Set access controls — some knowledge only for certain roles'].map(t => (
                  <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px', fontSize:'14px', color:'rgba(232,240,254,0.6)' }}>
                    <span style={{ color:'#60A5FA', flexShrink:0, fontWeight:'700' }}>✓</span>{t}
                  </div>
                ))}
              </div>

              {/* Mockup — Knowledge Upload */}
              <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.4)' }}>
                <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(96,165,250,0.1)', background:'rgba(96,165,250,0.04)', display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'5px' }}>
                    {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                  </div>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <span className="mono" style={{ fontSize:'10px', color:'rgba(96,165,250,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Mentogram Enterprise · Admin · Knowledge Base</span>
                  </div>
                </div>
                <div style={{ padding:'20px' }}>
                  {/* Upload area */}
                  <div style={{ border:'2px dashed rgba(96,165,250,0.2)', borderRadius:'12px', padding:'20px', textAlign:'center', marginBottom:'16px' }}>
                    <div style={{ fontSize:'24px', marginBottom:'8px' }}>📁</div>
                    <div style={{ fontSize:'13px', color:'rgba(232,240,254,0.5)', marginBottom:'4px' }}>Drop files or click to upload</div>
                    <div className="mono" style={{ fontSize:'10px', color:'rgba(96,165,250,0.4)' }}>PDF · DOCX · PPTX · NOTION · CONFLUENCE</div>
                  </div>
                  {/* Uploaded files */}
                  {[
                    { name:'Sales Playbook v3.2.pdf', size:'2.4 MB', tag:'Sales', status:'Processed', col:'#34D399' },
                    { name:'Engineering Culture Guide.pdf', size:'1.1 MB', tag:'Engineering', status:'Processed', col:'#34D399' },
                    { name:'Leadership Framework 2025.docx', size:'0.8 MB', tag:'Management', status:'Processing...', col:'#F59E0B' },
                    { name:'Onboarding Handbook.pdf', size:'4.2 MB', tag:'All Roles', status:'Queued', col:'rgba(232,240,254,0.3)' },
                  ].map(f => (
                    <div key={f.name} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', marginBottom:'6px' }}>
                      <div style={{ fontSize:'16px' }}>📄</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'12px', color:'#E8F0FE', marginBottom:'2px' }}>{f.name}</div>
                        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                          <span className="mono" style={{ fontSize:'9px', color:'rgba(232,240,254,0.3)' }}>{f.size}</span>
                          <span style={{ fontSize:'9px', fontFamily:'DM Mono,monospace', padding:'1px 7px', borderRadius:'100px', background:'rgba(96,165,250,0.1)', color:'#60A5FA', border:'1px solid rgba(96,165,250,0.15)' }}>{f.tag}</span>
                        </div>
                      </div>
                      <span style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', color:f.col }}>{f.status}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:'16px', padding:'12px', background:'rgba(96,165,250,0.06)', borderRadius:'8px' }}>
                    <div className="mono" style={{ fontSize:'10px', color:'#60A5FA', marginBottom:'4px' }}>KNOWLEDGE BASE STATUS</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                      {[['4', 'Documents'], ['312', 'Concepts extracted'], ['98%', 'Coverage score']].map(([v, l]) => (
                        <div key={l} style={{ textAlign:'center' }}>
                          <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#60A5FA' }}>{v}</div>
                          <div style={{ fontSize:'9px', color:'rgba(232,240,254,0.3)', fontFamily:'DM Mono,monospace' }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCREENSHOT 2 — Employee Chat Experience */}
          <div style={{ marginBottom:'80px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }} className="grid-2">
              {/* Mockup — Employee Maya Chat */}
              <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.4)' }}>
                <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(96,165,250,0.1)', background:'rgba(96,165,250,0.04)', display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'5px' }}>
                    {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c, opacity:0.5 }} />)}
                  </div>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <span className="mono" style={{ fontSize:'10px', color:'rgba(96,165,250,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Maya · Acme Corp · Sales Onboarding</span>
                  </div>
                  <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }} />
                    <span className="mono" style={{ fontSize:'9px', color:'#4ADE80' }}>Online</span>
                  </div>
                </div>
                <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'14px' }}>
                  {/* Maya message */}
                  <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#60A5FA', flexShrink:0, fontFamily:'Playfair Display,serif' }}>M</div>
                    <div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(96,165,250,0.35)', marginBottom:'4px' }}>MAYA · ACME CORP · Day 1</div>
                      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(96,165,250,0.1)', borderRadius:'4px 12px 12px 12px', padding:'12px 14px', maxWidth:'90%' }}>
                        <p style={{ fontSize:'13px', color:'rgba(232,240,254,0.75)', lineHeight:'1.6', margin:0 }}>Welcome, James. I&apos;m Maya — your onboarding mentor for Acme Corp. I&apos;ve been loaded with everything about your role as an Account Executive: our sales methodology, the product suite, how we handle objections, and what great looks like in your first 90 days.</p>
                      </div>
                    </div>
                  </div>
                  {/* Stage label */}
                  <div style={{ textAlign:'center' }}>
                    <span className="mono" style={{ fontSize:'9px', color:'#60A5FA', background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.15)', padding:'3px 12px', borderRadius:'100px', letterSpacing:'0.1em', textTransform:'uppercase' }}>▶ Module 1 — Acme Sales Methodology</span>
                  </div>
                  {/* Task card */}
                  <div style={{ background:'rgba(96,165,250,0.05)', border:'1px solid rgba(96,165,250,0.18)', borderRadius:'12px', padding:'14px', marginLeft:'38px' }}>
                    <div className="mono" style={{ fontSize:'9px', color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>📋 Task — Discovery Call Simulation</div>
                    <p style={{ fontSize:'12px', color:'rgba(232,240,254,0.55)', lineHeight:'1.6', margin:'0 0 10px' }}>You&apos;re on a discovery call with a CFO at a mid-market company. They&apos;ve just said: &ldquo;We already use a competitor and it&apos;s working fine.&rdquo; Using Acme&apos;s SPIN methodology, write how you&apos;d respond.</p>
                    <div style={{ fontSize:'10px', color:'rgba(232,240,254,0.3)', fontFamily:'DM Mono,monospace', padding:'6px 10px', background:'rgba(255,255,255,0.03)', borderRadius:'6px' }}>Using: Acme Sales Playbook v3.2 · SPIN Framework · Objection Handling Guide</div>
                  </div>
                  {/* User reply */}
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(96,165,250,0.35)', marginBottom:'4px', textAlign:'right' }}>JAMES · just now</div>
                      <div style={{ background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'12px 4px 12px 12px', padding:'10px 14px' }}>
                        <p style={{ fontSize:'13px', color:'rgba(232,240,254,0.75)', lineHeight:'1.6', margin:0 }}>&ldquo;I hear you — that&apos;s great that it&apos;s working. Can I ask, what would &lsquo;working even better&rsquo; look like for your team specifically?&rdquo;</p>
                      </div>
                    </div>
                  </div>
                  {/* Maya evaluation */}
                  <div style={{ marginLeft:'38px', background:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'12px', padding:'12px 14px' }}>
                    <p style={{ fontSize:'12px', color:'rgba(232,240,254,0.65)', lineHeight:'1.6', margin:0 }}>
                      <span style={{ color:'#34D399', fontWeight:'700' }}>Strong. </span>You reframed from defending Acme to exploring their definition of success — exactly what the Acme playbook calls for. That&apos;s the needle-threading move. <span style={{ color:'#60A5FA' }}>Score: 88/100.</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mono" style={{ fontSize:'10px', color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>Screenshot — Employee Experience</div>
                <h3 className="pf" style={{ fontSize:'32px', fontWeight:'800', color:'#E8F0FE', lineHeight:'1.2', marginBottom:'16px', letterSpacing:'-0.02em' }}>
                  Maya knows your<br />company&apos;s playbook.
                </h3>
                <p style={{ fontSize:'15px', color:'rgba(232,240,254,0.55)', lineHeight:'1.75', marginBottom:'24px' }}>
                  Every employee gets a personal AI mentor who knows your company specifically — your sales methodology, your culture principles, your technical standards. Not generic best practices. Your best practices.
                </p>
                {['Tasks are set in real scenarios from your industry and business', 'Maya evaluates against your company\'s specific standards, not generic rubrics', 'References your actual documents, playbooks, and frameworks in real time', 'Employees learn your way of working, not a generic textbook approach'].map(t => (
                  <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px', fontSize:'14px', color:'rgba(232,240,254,0.6)' }}>
                    <span style={{ color:'#60A5FA', flexShrink:0, fontWeight:'700' }}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCREENSHOT 3 — Manager Dashboard */}
          <div style={{ marginBottom:'40px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }} className="grid-2">
              <div>
                <div className="mono" style={{ fontSize:'10px', color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>Screenshot — Manager Dashboard</div>
                <h3 className="pf" style={{ fontSize:'32px', fontWeight:'800', color:'#E8F0FE', lineHeight:'1.2', marginBottom:'16px', letterSpacing:'-0.02em' }}>
                  See exactly where<br />every team member is.
                </h3>
                <p style={{ fontSize:'15px', color:'rgba(232,240,254,0.55)', lineHeight:'1.75', marginBottom:'24px' }}>
                  Managers get a live dashboard showing competency progress across their team. See who is ready to go solo on their first client call, who needs support on a specific skill, and where knowledge gaps cluster.
                </p>
                {['Real-time competency scores per employee per module', 'Team-wide analytics — where are your gaps?', 'Identify high performers and those needing support early', 'Export compliance-ready completion reports'].map(t => (
                  <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px', fontSize:'14px', color:'rgba(232,240,254,0.6)' }}>
                    <span style={{ color:'#60A5FA', flexShrink:0, fontWeight:'700' }}>✓</span>{t}
                  </div>
                ))}
              </div>

              {/* Mockup — Manager Dashboard */}
              <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.4)', padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                  <div>
                    <div className="pf" style={{ fontSize:'16px', fontWeight:'700', color:'#E8F0FE' }}>Sales Team · Q1 Cohort</div>
                    <div className="mono" style={{ fontSize:'10px', color:'rgba(96,165,250,0.4)', marginTop:'2px' }}>8 EMPLOYEES · ONBOARDING MODULE</div>
                  </div>
                  <div style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', padding:'4px 12px', borderRadius:'100px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', color:'#34D399' }}>Live</div>
                </div>
                {/* Team member rows */}
                {[
                  { name:'James Whitfield', role:'Account Executive', modules:5, score:88, status:'On track', col:'#34D399' },
                  { name:'Priya Sharma',    role:'Account Executive', modules:4, score:76, status:'On track', col:'#34D399' },
                  { name:'Marcus Lee',      role:'SDR',               modules:3, score:91, status:'Ahead',    col:'#60A5FA' },
                  { name:'Sophie Chen',     role:'Account Executive', modules:2, score:54, status:'Needs support', col:'#F97066' },
                  { name:'Tom Richards',    role:'SDR',               modules:5, score:82, status:'On track', col:'#34D399' },
                ].map(e => (
                  <div key={e.name} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid rgba(96,165,250,0.06)' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`${e.col}15`, border:`1px solid ${e.col}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:e.col, flexShrink:0, fontFamily:'Playfair Display,serif' }}>{e.name.split(' ').map(w=>w[0]).join('')}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', color:'#E8F0FE', marginBottom:'1px' }}>{e.name}</div>
                      <div className="mono" style={{ fontSize:'9px', color:'rgba(96,165,250,0.4)' }}>{e.role}</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div className="mono" style={{ fontSize:'10px', color:'rgba(232,240,254,0.4)' }}>{e.modules}/8</div>
                      <div style={{ fontSize:'9px', color:'rgba(232,240,254,0.3)', fontFamily:'DM Mono,monospace' }}>modules</div>
                    </div>
                    <div style={{ textAlign:'center', minWidth:'44px' }}>
                      <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:e.col }}>{e.score}</div>
                      <div style={{ fontSize:'9px', color:'rgba(232,240,254,0.3)', fontFamily:'DM Mono,monospace' }}>avg</div>
                    </div>
                    <div style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', padding:'3px 10px', borderRadius:'100px', background:`${e.col}10`, border:`1px solid ${e.col}20`, color:e.col, whiteSpace:'nowrap' as const }}>{e.status}</div>
                  </div>
                ))}
                <div style={{ marginTop:'16px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                  {[['76%', 'Team avg score'], ['18 days', 'Avg to ready'], ['1 flag', 'Needs attention']].map(([v, l]) => (
                    <div key={l} style={{ textAlign:'center', padding:'10px', background:'rgba(255,255,255,0.02)', borderRadius:'8px' }}>
                      <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#60A5FA' }}>{v}</div>
                      <div style={{ fontSize:'9px', color:'rgba(232,240,254,0.3)', fontFamily:'DM Mono,monospace' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" style={{ padding:'120px 24px', background:'#020817', borderTop:'1px solid rgba(96,165,250,0.08)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>Use Cases</div>
            <h2 className="pf" style={{ fontSize:'48px', fontWeight:'800', letterSpacing:'-0.03em', color:'#E8F0FE', lineHeight:'1.1' }}>
              Built for every team.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }} className="grid-3">
            {[
              {
                emoji:'🚀', col:'#60A5FA', title:'Employee Onboarding',
                desc:'New hires arrive with Maya already loaded with everything about your company. Day 1 to full productivity in weeks, not months.',
                examples:['Sales methodology training', 'Engineering culture and standards', 'Product knowledge for customer-facing roles', 'Compliance and policy certification'],
              },
              {
                emoji:'📈', col:'#34D399', title:'Sales Enablement',
                desc:'Maya learns your product, your ICP, your objection handling playbook, and your win/loss patterns — then trains every rep to your best reps\' standard.',
                examples:['Discovery call frameworks', 'Objection handling scenarios', 'Competitive positioning training', 'Deal review simulations'],
              },
              {
                emoji:'🏗️', col:'#A78BFA', title:'Leadership Development',
                desc:'Your leadership principles, management frameworks, and culture playbook — delivered as a personalised mentor to every manager in your organisation.',
                examples:['Feedback and difficult conversation skills', 'Strategic thinking frameworks', 'People management scenarios', 'Executive communication'],
              },
              {
                emoji:'🔧', col:'#F59E0B', title:'Technical Upskilling',
                desc:'Upload your technical standards, architecture decisions, and engineering culture. Every engineer learns how your org specifically builds — not generic tutorials.',
                examples:['Code review standards', 'System design frameworks specific to your stack', 'Security and compliance training', 'Architecture decision-making'],
              },
              {
                emoji:'🤝', col:'#F97066', title:'Customer Success',
                desc:'CS teams trained on your product, your customer archetypes, your escalation playbooks, and your success metrics — consistent quality at every interaction.',
                examples:['Product knowledge deep-dives', 'Customer health scoring', 'Escalation handling scenarios', 'QBR preparation training'],
              },
              {
                emoji:'📋', col:'#2DD4BF', title:'Compliance & Certification',
                desc:'Turn mandatory compliance training into something that actually lands. Maya makes it conversational, tests real understanding, and provides audit-ready completion records.',
                examples:['GDPR and data handling', 'Information security', 'Industry-specific regulation', 'HR policy certification'],
              },
            ].map(uc => (
              <div key={uc.title} style={{ padding:'28px', background:'rgba(96,165,250,0.02)', border:'1px solid rgba(96,165,250,0.07)', borderRadius:'14px', borderTop:`3px solid ${uc.col}` }}>
                <div style={{ fontSize:'28px', marginBottom:'12px' }}>{uc.emoji}</div>
                <div style={{ fontSize:'17px', fontWeight:'700', color:'#E8F0FE', marginBottom:'10px' }}>{uc.title}</div>
                <div style={{ fontSize:'13px', color:'rgba(232,240,254,0.45)', lineHeight:'1.65', marginBottom:'16px' }}>{uc.desc}</div>
                <div style={{ borderTop:'1px solid rgba(96,165,250,0.07)', paddingTop:'14px' }}>
                  {uc.examples.map(e => (
                    <div key={e} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'6px', fontSize:'12px', color:'rgba(232,240,254,0.4)' }}>
                      <span style={{ color:uc.col, flexShrink:0 }}>→</span>{e}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS TRADITIONAL L&D */}
      <section style={{ padding:'120px 24px', background:'#030C1A', borderTop:'1px solid rgba(96,165,250,0.08)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>Why Mentogram Wins</div>
            <h2 className="pf" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#E8F0FE', lineHeight:'1.1' }}>
              Traditional L&D vs<br /><span style={{ color:'#60A5FA' }}>Mentogram for Enterprises</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 48px 1fr', gap:'32px', alignItems:'start' }}>
            <div>
              <div className="mono" style={{ fontSize:'10px', color:'rgba(232,240,254,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'16px', textDecoration:'line-through' }}>Traditional L&D</div>
              {[
                'Generic courses that teach best practices, not your practices',
                'Static content that goes stale the moment it\'s published',
                'Completion rates tracked — not competency',
                'Same course for every employee regardless of role',
                'No way to know if training actually changed behaviour',
                'Expensive external consultants to build and update content',
                'LMS platforms with low engagement and high skip rates',
              ].map(t => (
                <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'12px', fontSize:'14px', color:'rgba(232,240,254,0.4)' }}>
                  <span style={{ color:'#F97066', flexShrink:0 }}>✗</span>{t}
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center', paddingTop:'40px', fontSize:'18px', color:'rgba(96,165,250,0.25)' }}>vs</div>
            <div>
              <div className="mono" style={{ fontSize:'10px', color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'16px' }}>Mentogram Enterprise</div>
              {[
                'Teaches your frameworks, your playbook, your way of working',
                'Knowledge base updates instantly — Maya always current',
                'Mastery-based: employees prove understanding, not just attendance',
                'Personalised to each role, team, and individual background',
                'Real-time competency data — see exactly what changed',
                'Your team uploads content once — no consultants needed',
                'Conversational, interactive, and evaluated — employees actually engage',
              ].map(t => (
                <div key={t} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'12px', fontSize:'14px', color:'rgba(232,240,254,0.7)' }}>
                  <span style={{ color:'#34D399', flexShrink:0 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCREENSHOT 4 — Analytics */}
      <section style={{ padding:'120px 24px', background:'#020817', borderTop:'1px solid rgba(96,165,250,0.08)' }}>
        <div style={{ maxWidth:'1160px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'64px' }}>
            <div className="label" style={{ marginBottom:'16px', color:'#60A5FA' }}>Analytics & Reporting</div>
            <h2 className="pf" style={{ fontSize:'44px', fontWeight:'800', letterSpacing:'-0.03em', color:'#E8F0FE', lineHeight:'1.1' }}>
              Prove the ROI of training.<br /><span style={{ color:'#60A5FA' }}>For the first time.</span>
            </h2>
          </div>

          {/* Analytics mockup — full width */}
          <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.4)', padding:'32px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'16px' }}>
              <div>
                <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#E8F0FE' }}>Acme Corp · Training Analytics</div>
                <div className="mono" style={{ fontSize:'10px', color:'rgba(96,165,250,0.4)', marginTop:'2px' }}>Q1 2025 · 148 EMPLOYEES ENROLLED</div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {['This Quarter', 'Export CSV', 'Share Report'].map(b => (
                  <div key={b} style={{ fontSize:'11px', fontFamily:'DM Mono,monospace', padding:'5px 14px', borderRadius:'6px', background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.12)', color:'#60A5FA', cursor:'pointer' }}>{b}</div>
                ))}
              </div>
            </div>

            {/* KPI tiles */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
              {[
                { n:'23 days', l:'Avg time to full productivity', sub:'↓ 31% vs last cohort', col:'#34D399' },
                { n:'84%',    l:'Team avg competency score',    sub:'↑ 12pts vs LMS baseline', col:'#60A5FA' },
                { n:'91%',    l:'Module completion rate',       sub:'vs 34% on previous LMS', col:'#A78BFA' },
                { n:'$42K',   l:'Estimated cost saved',        sub:'vs external training spend', col:'#F59E0B' },
              ].map(s => (
                <div key={s.l} style={{ padding:'18px', background:'rgba(255,255,255,0.02)', borderRadius:'10px', borderTop:`2px solid ${s.col}` }}>
                  <div className="pf" style={{ fontSize:'26px', fontWeight:'900', color:s.col, marginBottom:'4px' }}>{s.n}</div>
                  <div style={{ fontSize:'12px', color:'#E8F0FE', marginBottom:'4px', fontWeight:'600' }}>{s.l}</div>
                  <div className="mono" style={{ fontSize:'10px', color:'rgba(232,240,254,0.3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Module breakdown table */}
            <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:'10px', overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(96,165,250,0.07)', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr' }}>
                {['Module', 'Employees', 'Avg Score', 'Pass Rate', 'Status'].map(h => (
                  <div key={h} className="mono" style={{ fontSize:'9px', color:'rgba(96,165,250,0.4)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</div>
                ))}
              </div>
              {[
                { mod:'Sales Methodology', n:148, score:84, pass:91, status:'Complete', scol:'#34D399' },
                { mod:'Product Knowledge', n:148, score:79, pass:87, status:'Complete', scol:'#34D399' },
                { mod:'Objection Handling', n:112, score:71, pass:76, status:'In Progress', scol:'#F59E0B' },
                { mod:'Competitive Positioning', n:44, score:68, pass:71, status:'In Progress', scol:'#F59E0B' },
                { mod:'Enterprise Deals', n:0, score:0, pass:0, status:'Upcoming', scol:'rgba(232,240,254,0.2)' },
              ].map(r => (
                <div key={r.mod} style={{ padding:'12px 16px', borderBottom:'1px solid rgba(96,165,250,0.05)', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', alignItems:'center' }}>
                  <div style={{ fontSize:'13px', color:'#E8F0FE' }}>{r.mod}</div>
                  <div className="mono" style={{ fontSize:'12px', color:'rgba(232,240,254,0.5)' }}>{r.n}</div>
                  <div className="pf" style={{ fontSize:'14px', fontWeight:'700', color:'#60A5FA' }}>{r.score || '—'}</div>
                  <div style={{ fontSize:'13px', color:'rgba(232,240,254,0.5)' }}>{r.pass ? r.pass+'%' : '—'}</div>
                  <div style={{ fontSize:'10px', fontFamily:'DM Mono,monospace', color:r.scol }}>{r.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — BOOK A DEMO */}
      <section id="demo" style={{ padding:'140px 24px', background:'#020817', borderTop:'1px solid rgba(96,165,250,0.08)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(96,165,250,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.025) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'500px', background:'radial-gradient(ellipse,rgba(96,165,250,0.06) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:'720px', margin:'0 auto' }}>
          <div className="label" style={{ marginBottom:'24px', color:'#60A5FA' }}>Get Started</div>
          <h2 className="pf" style={{ fontSize:'clamp(40px,5.5vw,68px)', fontWeight:'900', letterSpacing:'-0.035em', color:'#E8F0FE', marginBottom:'24px', lineHeight:'1.05' }}>
            Your team is ready.<br /><span style={{ color:'#60A5FA' }}>Is your training?</span>
          </h2>
          <p style={{ fontSize:'18px', color:'rgba(232,240,254,0.5)', lineHeight:'1.72', marginBottom:'52px', maxWidth:'520px', margin:'0 auto 52px' }}>
            Book a 30-minute demo. We&apos;ll show you Maya working with your actual content — not a generic demo. Bring a doc or framework you want to train on and we&apos;ll build a live example.
          </p>

          {/* Demo booking form */}
          <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'16px', padding:'40px', maxWidth:'520px', margin:'0 auto 40px', textAlign:'left' }}>
            <div className="pf" style={{ fontSize:'20px', fontWeight:'700', color:'#E8F0FE', marginBottom:'24px' }}>Book a Demo</div>
            {[
              { label:'Your Name', ph:'Jane Smith', type:'text' },
              { label:'Work Email', ph:'jane@company.com', type:'email' },
              { label:'Company Name', ph:'Acme Corp', type:'text' },
              { label:'Team Size', ph:'e.g. 200 employees', type:'text' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:'16px' }}>
                <label style={{ fontSize:'12px', color:'rgba(232,240,254,0.5)', display:'block', marginBottom:'6px', fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'0.08em' }}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'8px', padding:'10px 14px', fontSize:'14px', color:'#E8F0FE', fontFamily:'DM Sans,sans-serif', boxSizing:'border-box' as const }} />
              </div>
            ))}
            <div style={{ marginBottom:'24px' }}>
              <label style={{ fontSize:'12px', color:'rgba(232,240,254,0.5)', display:'block', marginBottom:'6px', fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'0.08em' }}>What do you want to train on?</label>
              <textarea rows={3} placeholder="e.g. Sales onboarding, technical upskilling, leadership development..." style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:'8px', padding:'10px 14px', fontSize:'14px', color:'#E8F0FE', fontFamily:'DM Sans,sans-serif', resize:'none' as const, boxSizing:'border-box' as const }} />
            </div>
            <button style={{ width:'100%', padding:'14px', borderRadius:'8px', background:'#60A5FA', color:'#020817', fontWeight:'700', fontSize:'15px', border:'none', cursor:'pointer' }}>
              Book My Demo →
            </button>
            <p style={{ fontSize:'12px', color:'rgba(232,240,254,0.3)', textAlign:'center', marginTop:'12px' }}>We respond within 2 business hours. No sales pressure.</p>
          </div>

          <p style={{ fontSize:'14px', color:'rgba(232,240,254,0.25)' }}>
            Or email us directly at{' '}
            <a href="mailto:enterprise@mentogram.com" style={{ color:'#60A5FA', textDecoration:'none' }}>enterprise@mentogram.com</a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'36px 64px', borderTop:'1px solid rgba(96,165,250,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px', background:'#020817' }}>
        <div className="pf" style={{ fontSize:'18px', fontWeight:'700', color:'#E8F0FE' }}>
          Mento<span style={{ color:'#60A5FA' }}>gram</span>
          <span className="mono" style={{ fontSize:'8px', color:'rgba(96,165,250,0.25)', marginLeft:'8px', letterSpacing:'0.2em', textTransform:'uppercase', verticalAlign:'middle' }}>Enterprise</span>
        </div>
        <div style={{ display:'flex', gap:'28px' }}>
          {['How It Works','Use Cases','← For Students'].map(l => (
            <span key={l} className="mono" style={{ fontSize:'10px', color:'rgba(232,240,254,0.2)', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>{l}</span>
          ))}
        </div>
        <div className="mono" style={{ fontSize:'10px', color:'rgba(232,240,254,0.15)', letterSpacing:'0.08em' }}>© 2025 Mentogram · enterprise@mentogram.com</div>
      </footer>

    </div>
  )
}
