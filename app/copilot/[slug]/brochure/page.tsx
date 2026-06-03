'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const ALL_SPRINTS = [
  { name: 'Design Thinking',      desc: 'Customer empathy, problem framing, ideation and rapid prototyping. Build solutions people actually want.' },
  { name: 'Product Sprint',       desc: 'From idea to MVP — roadmapping, feature prioritisation, product definition and launch planning.' },
  { name: 'Marketing Sprint',     desc: 'Positioning, content strategy, paid and organic channels. Build a 90-day marketing engine.' },
  { name: 'Sales Sprint',         desc: 'B2B and B2C frameworks, cold outreach playbooks, demo scripts and closing techniques.' },
  { name: 'Fundraising Sprint',   desc: 'Investor narrative, pitch deck architecture, metrics and how to run a seed round.' },
  { name: 'Leadership Sprint',    desc: 'Team building, culture design, hiring your first 5 people, managing under pressure.' },
  { name: 'AI Tools Sprint',      desc: 'Automate your business with AI — support, content, workflows, product acceleration.' },
  { name: 'Growth Hacking',       desc: 'Referral loops, viral mechanics, SEO and organic growth without burning cash.' },
  { name: 'Operations Sprint',    desc: 'SOPs, unit economics, supply chain basics and systems without the founder in the loop.' },
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

const ALL_MENTORS_FALLBACK = [
  { name: 'Prantik Mazumdar',  role: 'President, TiE Singapore',     company: 'Exited Entrepreneur',     img: '/images/mentors/prantik-mazumdar.jpg' },
  { name: 'Jason Kraus',        role: 'Founder, Prepare4VC',           company: 'Partner, EQx Fund',      img: '/images/mentors/jason-kraus.jpg' },
  { name: 'Renuka Belwalkar',   role: 'Investor',                      company: 'Forbes Under 30 Scholar', img: '/images/mentors/renuka-belwalkar.jpg' },
  { name: 'Yash Shah',          role: 'GenAI Head India & SEA',        company: 'Amazon Web Services',     img: '/images/mentors/yash-shah.jpg' },
  { name: 'Andrew Chow',        role: 'Co-Founder, Asia Pro Ventures', company: 'NTU Singapore',           img: '/images/mentors/andrew-chow.jpg' },
  { name: 'Daniel Ling',        role: 'ex-VP Design',                  company: 'DBS & Lazada',            img: '/images/mentors/daniel-ling.jpg' },
  { name: 'Rajesh Setty',       role: '19x Author',                    company: 'Founder Institute',       img: '/images/mentors/rajesh-shetty.jpg' },
  { name: 'Sarvash Malani',     role: 'DeepTech VC',                   company: 'Temasek',                 img: '/images/mentors/sarvash-malani.jpg' },
]

export default function BrochurePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  useEffect(() => {
    fetch(`/api/copilot/${slug}/brochure-data`)
      .then(r => r.json())
      .then(d => { setData(d); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [slug])

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', gap: '20px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,106,0,0.2)', borderTopColor: '#FF6A00', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#F0EDE6', marginBottom: '6px' }}>Building your brochure</div>
        <div style={{ fontSize: '12px', color: '#555', fontFamily: 'DM Mono, monospace' }}>Maya is personalising the content — about 15 seconds</div>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#888' }}>Something went wrong. <a href={`/copilot/${slug}`} style={{ color: '#FF6A00' }}>Go back</a></div>
    </div>
  )

  const { cp, tracks, bc, timeline } = data
  const mentors = (data.mentors || []).map((m: any) => ({
    ...m, img: m.img || ALL_MENTORS_FALLBACK.find(a => a.name === m.name)?.img || '',
  }))
  const firstName = cp.founder_name.split(' ')[0]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F5F5F5', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .serif{font-family:'Playfair Display',serif}
        .mono{font-family:'DM Mono',monospace}
        .page{width:210mm;background:#fff;margin:0 auto 20px;box-shadow:0 4px 40px rgba(0,0,0,0.12);position:relative;overflow:hidden}
        @media print{
          .no-print{display:none!important}
          .page{margin:0;box-shadow:none;page-break-after:always;page-break-inside:avoid}
          body{background:#fff}
          @page{size:A4;margin:0}
        }
        @media screen{body{padding-top:60px}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.5s ease both}
      `}</style>

      {/* Print bar */}
      <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#0A0A0F', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#FF6A00', fontFamily: 'Playfair Display, serif' }}>Launch<span style={{ color: '#fff' }}>Pilot</span></span>
          <span style={{ fontSize: '10px', color: '#333', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Brochure — {cp.business_name}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href={`/copilot/${slug}`} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', color: '#888', textDecoration: 'none', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>← Back</a>
          <button onClick={() => window.print()} style={{ padding: '9px 24px', background: '#FF6A00', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⬇ Download PDF
          </button>
        </div>
      </div>

      {/* ── PAGE 1: COVER ── */}
      <div className="page fade">
        <div style={{ background: '#0A0A0F', padding: '40px 48px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', background: 'rgba(255,106,0,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', background: 'rgba(255,106,0,0.03)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '56px', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'Playfair Display, serif', color: '#fff', letterSpacing: '-0.02em' }}>
                Launch<span style={{ color: '#FF6A00' }}>Pilot</span>
              </div>
              <div style={{ fontSize: '8px', color: '#333', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '2px' }}>School</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#444', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Prepared exclusively for</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#DDD' }}>{cp.founder_name}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '10px', color: '#FF8C00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>LaunchPilot Personalised Program for</div>
            <div style={{ fontSize: '56px', fontWeight: '900', color: '#fff', fontFamily: 'Playfair Display, serif', lineHeight: '1.0', letterSpacing: '-0.03em', marginBottom: '18px' }}>{cp.business_name}</div>
            <div style={{ width: '72px', height: '4px', background: '#FF6A00', borderRadius: '2px', marginBottom: '18px' }} />
            <div style={{ fontSize: '18px', color: '#FF8C00', fontFamily: 'Playfair Display, serif', fontStyle: 'italic', lineHeight: '1.3', maxWidth: '480px' }}>{bc.tagline}</div>
          </div>
        </div>

        {/* Meta strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #F0F0F0' }}>
          {[['Founder', cp.founder_name], ['Business', cp.business_name], ['Category', cp.business_category], ['Stage', cp.business_stage], ['Country', cp.country]].map(([l, v]) => (
            <div key={l} style={{ padding: '14px 18px', borderRight: '1px solid #F0F0F0' }}>
              <div style={{ fontSize: '8px', color: '#999', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{l}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '32px 48px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '8px' }}>About this program</div>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.8' }}>{bc.intro}</p>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: '1.8', marginTop: '8px', fontStyle: 'italic' }}>{bc.why_now}</p>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>What you will achieve</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {(bc.outcomes || []).map((o: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: '#FFF8F3', border: '1px solid rgba(255,106,0,0.12)', borderRadius: '8px', borderLeft: '3px solid #FF6A00' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono, monospace', flexShrink: 0, marginTop: '2px' }}>0{i + 1}</span>
                  <span style={{ fontSize: '12px', color: '#333', lineHeight: '1.5' }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE 2: TRACKS ── */}
      <div className="page" style={{ padding: '48px' }}>
        <div style={{ borderBottom: '3px solid #FF6A00', paddingBottom: '12px', marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px' }}>Curriculum</div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>Your 3 Learning Tracks</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tracks.map((t: any, ti: number) => {
            const ov = bc.track_overviews?.[ti] || {}
            return (
              <div key={t.code} style={{ border: '1px solid #EEEEEE', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: '#0A0A0F', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono, monospace' }}>0{ti + 1}</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display, serif' }}>{t.name}</div>
                </div>
                {ov.overview && (
                  <div style={{ padding: '14px 22px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.7', margin: 0 }}>{ov.overview}</p>
                    {(ov.outcomes || []).length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {ov.outcomes.map((o: string, i: number) => (
                          <span key={i} style={{ fontSize: '10px', color: '#FF6A00', background: 'rgba(255,106,0,0.07)', border: '1px solid rgba(255,106,0,0.18)', padding: '3px 10px', borderRadius: '100px' }}>+ {o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ padding: '14px 22px' }}>
                  <div style={{ fontSize: '8px', color: '#999', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>8 Concepts</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {(t.concepts || []).map((c: any) => (
                      <div key={c.sequence} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '5px 8px', background: '#F8F8F8', borderRadius: '5px' }}>
                        <span style={{ fontSize: '8px', fontWeight: '700', color: '#FF6A00', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>{String(c.sequence).padStart(2, '0')}</span>
                        <span style={{ fontSize: '10px', color: '#333', lineHeight: '1.4' }}>{c.title}</span>
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
      <div className="page" style={{ padding: '48px' }}>
        <div style={{ borderBottom: '3px solid #FF6A00', paddingBottom: '12px', marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px' }}>AI Co-Pilot</div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>Meet Maya</div>
        </div>
        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.8', marginBottom: '24px' }}>{bc.maya_desc}</p>

        <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>The 8-Stage Learning Framework</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
          {[['01','Hook','Real challenge specific to your business. No lectures.'],['02','Reality Check','Accountability on your last action. Maya never lets you skip.'],['03','Teach & Coach','Core concepts through dialogue with industry-specific examples.'],['04','Deep Dive','Edge cases, failure modes, hard pushback on your assumptions.'],['05','Quiz Gate','5 scenario-based questions. Fail means re-teach, not skip.'],['06','Execution Task','Real deliverable scored on 6 dimensions by Maya immediately.'],['07','Feedback Loop','What did this reveal? What needs testing this week?'],['08','Action & Bridge','One time-bound action, then connected to the next concept.']].map(([n, name, desc]) => (
            <div key={n} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: '#F8F8F8', borderRadius: '8px', border: '1px solid #EEEEEE' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#fff', fontFamily: 'DM Mono, monospace' }}>{n}</span>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{name}</div>
                <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.4' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '12px' }}>Maya in action — tailored to {cp.business_name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Screenshot 1 */}
          <div style={{ border: '1px solid #E8E8E8', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: '#0A0A0F', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>{['#F97066', '#F59E0B', '#4ADE80'].map(c => <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c, opacity: 0.6 }} />)}</div>
              <span style={{ fontSize: '9px', color: '#555', fontFamily: 'DM Mono, monospace' }}>Session 1 · Hook · Stage 1 of 8</span>
            </div>
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#FF6A00' }}>M</span>
                </div>
                <div style={{ background: '#F5F5F5', border: '1px solid #EEEEEE', borderRadius: '4px 10px 10px 10px', padding: '8px 12px', flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.6', margin: 0 }}>{bc.hook_challenge}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'rgba(255,106,0,0.07)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '10px 4px 10px 10px', padding: '8px 12px', maxWidth: '78%' }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.6', margin: 0 }}>{bc.founder_reply || `Found real people online with this exact problem.`}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#1D9E75' }}>M</span>
                </div>
                <div style={{ background: 'rgba(29,158,117,0.04)', border: '1px solid rgba(29,158,117,0.18)', borderRadius: '4px 10px 10px 10px', padding: '8px 12px', flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.6', margin: 0 }}><span style={{ color: '#1D9E75', fontWeight: '700' }}>Real signal. </span>{bc.maya_followup}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '6px 14px', borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }}>
              <span style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stage 1 of 8 · Hook</span>
            </div>
          </div>

          {/* Screenshot 2 */}
          <div style={{ border: '1px solid #E8E8E8', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: '#0A0A0F', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>{['#F97066', '#F59E0B', '#4ADE80'].map(c => <div key={c} style={{ width: '7px', height: '7px', borderRadius: '50%', background: c, opacity: 0.6 }} />)}</div>
              <span style={{ fontSize: '9px', color: '#555', fontFamily: 'DM Mono, monospace' }}>Session 3 · Evaluation · Stage 6</span>
            </div>
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#FF6A00' }}>M</span>
                </div>
                <div style={{ background: '#F5F5F5', border: '1px solid #EEEEEE', borderRadius: '4px 10px 10px 10px', padding: '8px 12px', flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.6', margin: 0 }}>Your task: {bc.task}</p>
                </div>
              </div>
              <div style={{ background: 'rgba(29,158,117,0.04)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '9px', color: '#1D9E75', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maya's Evaluation</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#1D9E75', fontFamily: 'Playfair Display, serif' }}>{bc.eval_score || '82'}</span>
                    <span style={{ fontSize: '9px', color: '#999' }}>/100</span>
                    <span style={{ fontSize: '8px', color: '#1D9E75', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)', padding: '2px 7px', borderRadius: '100px', fontFamily: 'DM Mono, monospace', fontWeight: '700' }}>PASS</span>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#333', lineHeight: '1.6', borderTop: '1px solid rgba(29,158,117,0.12)', paddingTop: '8px' }}>
                  <span style={{ color: '#1D9E75', fontWeight: '700' }}>Strong: </span>{bc.eval_strength}<br />
                  <span style={{ color: '#BA7517', fontWeight: '700' }}>Fix: </span>{bc.eval_fix}
                </div>
              </div>
            </div>
            <div style={{ padding: '6px 14px', borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }}>
              <span style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stage 6 of 8 · Execution Task</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE 4: MENTORS ── */}
      <div className="page" style={{ padding: '48px' }}>
        <div style={{ borderBottom: '3px solid #FF6A00', paddingBottom: '12px', marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px' }}>Your Mentors</div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>From 100+ mentors, shortlisted for {cp.business_name}</div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.7', marginBottom: '20px' }}>{bc.mentor_rationale}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {mentors.map((m: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '10px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,106,0,0.2)', flexShrink: 0, background: 'rgba(255,106,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.img
                  ? <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  : <span style={{ fontSize: '16px', fontWeight: '800', color: '#FF6A00' }}>{m.name?.[0]}</span>}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{m.name}</div>
                <div style={{ fontSize: '10px', color: '#888' }}>{m.role}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>{m.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAGE 5: SPRINTS + SESSIONS ── */}
      <div className="page" style={{ padding: '48px' }}>
        <div style={{ borderBottom: '3px solid #FF6A00', paddingBottom: '12px', marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px' }}>Monthly Sprints</div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>12 Sprints — 4 Weeks Each</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '32px' }}>
          {ALL_SPRINTS.map((s, i) => (
            <div key={i} style={{ padding: '10px 14px', background: i % 2 === 0 ? '#FFF8F3' : '#F8F8F8', border: '1px solid', borderColor: i % 2 === 0 ? 'rgba(255,106,0,0.12)' : '#EEEEEE', borderRadius: '8px', borderTop: `2px solid ${i % 2 === 0 ? '#FF6A00' : '#CCCCCC'}` }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono, monospace' }}>S{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{s.name}</span>
              </div>
              <p style={{ fontSize: '10px', color: '#888', lineHeight: '1.5', margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ borderBottom: '2px solid #0A0A0F', paddingBottom: '10px', marginBottom: '18px' }}>
          <div style={{ fontSize: '9px', color: '#888', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '4px' }}>Experiential Sessions</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>Live Every Sunday</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SUNDAY_SESSIONS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: '#F8F8F8', borderRadius: '8px', border: '1px solid #EEEEEE' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{s.theme}</div>
                <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.4' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAGE 6: TIMELINE + QUESTIONS + CLOSE ── */}
      <div className="page" style={{ padding: '48px', minHeight: '297mm', display: 'flex', flexDirection: 'column' }}>
        {timeline.length > 0 && (
          <>
            <div style={{ borderBottom: '3px solid #FF6A00', paddingBottom: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '6px' }}>6-Month Northstar</div>
              <div style={{ fontSize: '30px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>The Journey Ahead</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '32px' }}>
              {timeline.map((t: any, i: number) => {
                const cols = ['#FF6A00', '#FF8C00', '#FFAA00', '#1D9E75', '#17876A', '#117055']
                const col = cols[i] || '#FF6A00'
                return (
                  <div key={i} style={{ padding: '14px', background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '10px', borderTop: `3px solid ${col}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '8px', fontWeight: '800', color: '#fff', fontFamily: 'DM Mono, monospace' }}>M{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '8px', color: col, fontFamily: 'DM Mono, monospace', fontWeight: '700' }}>{t.month}</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '4px', lineHeight: '1.3' }}>{t.milestone}</div>
                    <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.5' }}>{t.description}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', color: '#D85A30', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '8px' }}>Before you begin</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em', marginBottom: '14px' }}>Questions {cp.business_name} must answer</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(bc.critical_questions || []).map((q: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', background: 'rgba(216,90,48,0.04)', border: '1px solid rgba(216,90,48,0.12)', borderRadius: '8px' }}>
                <span style={{ fontSize: '16px', color: '#D85A30', flexShrink: 0, fontWeight: '800' }}>?</span>
                <span style={{ fontSize: '12px', color: '#111', fontWeight: '600', lineHeight: '1.4' }}>{q}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: '#0A0A0F', borderRadius: '16px 16px 0 0', padding: '24px 28px' }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em', marginBottom: '4px' }}>Ready to launch {cp.business_name}?</div>
            <div style={{ fontSize: '9px', color: '#FF6A00', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em' }}>LaunchPilot School</div>
          </div>
          <div style={{ background: '#FFF8F3', borderRadius: '0 0 16px 16px', padding: '20px 28px', borderBottom: '4px solid #FF6A00' }}>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.8', marginBottom: '16px' }}>{bc.closing}</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ padding: '10px 24px', background: '#FF6A00', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>Apply for a spot →</div>
              <span style={{ fontSize: '11px', color: '#999', fontFamily: 'DM Mono, monospace' }}>launchpilot-phi.vercel.app/apply</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
