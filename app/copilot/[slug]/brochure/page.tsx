'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const PAST_STUDENTS = [
  { name: 'Reyo Hashimoto',  business: 'Foliages',      category: 'D2C Plants · Singapore',  outcome: 'Launched in Singapore. First 50 orders in 3 weeks after validating with 12 real customers.', revenue: 'Rs. 2.1L / month', flag: '🇸🇬' },
  { name: 'Karthik Menon',   business: 'Bubbler',       category: 'India SaaS',               outcome: 'Found 3 paying B2B clients in 6 weeks without building a single feature first.', revenue: '$2,800 MRR', flag: '🇮🇳' },
  { name: 'Guliz Akar',      business: 'StyleStack',    category: 'Fashion D2C',              outcome: 'Pre-sold 120 units before the product existed. Validated price, demand and channel.', revenue: '$4,200 in pre-orders', flag: '🇹🇷' },
  { name: 'Swarit Agarwal',  business: 'HealthDesk',    category: 'HealthTech · India',       outcome: 'Pivoted twice in 8 weeks, found real PMF, and closed a seed round from a Singapore VC.', revenue: 'Seed funded', flag: '🇮🇳' },
  { name: 'Priya Nair',      business: 'MindfulMoms',   category: 'Community · India',        outcome: 'Built 800-member paid community in 10 weeks. No ads — pure word of mouth and referrals.', revenue: '$1,900 / month', flag: '🇮🇳' },
  { name: 'James Okafor',    business: 'BuildrAI',      category: 'AI SaaS · Nigeria',        outcome: 'Shipped MVP in 4 weeks, landed first enterprise POC, hired 2 people with revenue.', revenue: '$6,000 / month', flag: '🇳🇬' },
]

const STAGES = [
  { n: '01', title: 'Hook',            desc: 'Real challenge. No lectures. Dropped into your business context immediately.' },
  { n: '02', title: 'Reality Check',  desc: 'Accountability on last session\'s commitment. The AI never lets you skip.' },
  { n: '03', title: 'Teach & Coach',  desc: 'Core concept through Socratic dialogue with examples from your industry.' },
  { n: '04', title: 'Deep Dive',      desc: 'Edge cases, failure modes, pushback on your assumptions. Uncomfortable on purpose.' },
  { n: '05', title: 'Quiz Gate',      desc: '5 scenario-based questions. Fail means re-teach — not move on.' },
  { n: '06', title: 'Execution Task', desc: 'Real deliverable scored on 6 dimensions. Cold emails, pitch slides, pricing models.' },
  { n: '07', title: 'Feedback Loop',  desc: 'What did this reveal? What assumption needs testing this week?' },
  { n: '08', title: 'Action & Bridge', desc: 'One specific, time-bound commitment. Then bridged to the next concept.' },
]

function PageWrapper({ children, minH = false }: { children: React.ReactNode; minH?: boolean }) {
  return (
    <div className="page" style={{ padding: '44px 48px', ...(minH ? { minHeight: '297mm', display: 'flex', flexDirection: 'column' } : {}) }}>
      {children}
    </div>
  )
}

function SectionHeader({ label, title, color = '#FF6A00' }: { label: string; title: string; color?: string }) {
  return (
    <div style={{ borderBottom: `3px solid ${color}`, paddingBottom: '10px', marginBottom: '24px' }}>
      <div style={{ fontSize: '8px', color, fontFamily: 'DM Mono,monospace', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display,serif', letterSpacing: '-0.02em', lineHeight: '1.1' }}>{title}</div>
    </div>
  )
}

function MentorRow({ m, relevance }: { m: any; relevance?: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 12px', background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '8px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,106,0,0.2)', flexShrink: 0, background: 'rgba(255,106,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {m.img
          ? <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          : <span style={{ fontSize: '13px', fontWeight: '800', color: '#FF6A00' }}>{m.name?.[0]}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '1px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{m.name}</span>
          <span style={{ fontSize: '9px', color: '#AAA' }}>·</span>
          <span style={{ fontSize: '9px', color: '#888' }}>{m.role}</span>
        </div>
        <div style={{ fontSize: '9px', color: '#AAA', marginBottom: relevance ? '4px' : '0' }}>{m.company}</div>
        {relevance && <div style={{ fontSize: '9px', color: '#FF8C00', fontStyle: 'italic', lineHeight: '1.4' }}>{relevance}</div>}
      </div>
    </div>
  )
}

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
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans,sans-serif', gap: '20px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid rgba(255,106,0,0.15)', borderTopColor: '#FF6A00', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#F0EDE6', marginBottom: '6px' }}>Personalising your brochure</div>
        <div style={{ fontSize: '11px', color: '#444', fontFamily: 'DM Mono,monospace' }}>About 15 seconds — writing content specific to your business</div>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans,sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#888' }}>Something went wrong. <a href={`/copilot/${slug}`} style={{ color: '#FF6A00' }}>Go back</a></div>
    </div>
  )

  const { cp, tracks, bc, timeline, allMentors } = data

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:'DM Sans',sans-serif;background:#E8E8E8}
    .page{width:210mm;background:#fff;margin:0 auto 16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)}
    @media screen{body{padding-top:58px}}
    @media print{
      .no-print{display:none!important}
      body{background:#fff;padding-top:0}
      .page{margin:0;box-shadow:none;page-break-after:always;page-break-inside:avoid}
      @page{size:A4;margin:0}
    }
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .fade{animation:fadeIn 0.4s ease both}
  `

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* Top bar */}
      <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#0A0A0F', padding: '10px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#FF6A00', fontFamily: 'Playfair Display,serif' }}>Launch<span style={{ color: '#fff' }}>Pilot</span></span>
          <span style={{ fontSize: '8px', color: '#333', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Personalised Brochure · {cp.business_name}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href={`/copilot/${slug}`} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#666', textDecoration: 'none', fontSize: '11px', fontFamily: 'DM Mono,monospace' }}>← Back</a>
          <button onClick={() => window.print()} style={{ padding: '8px 20px', background: '#FF6A00', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>⬇ Download PDF</button>
        </div>
      </div>

      {/* ── PAGE 1: COVER ── */}
      <div className="page fade">
        <div style={{ background: '#0A0A0F', padding: '44px 48px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', background: 'rgba(255,106,0,0.05)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '52px', position: 'relative' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'Playfair Display,serif', color: '#fff' }}>Launch<span style={{ color: '#FF6A00' }}>Pilot</span></div>
              <div style={{ fontSize: '7px', color: '#333', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '2px' }}>School</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '7px', color: '#444', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Prepared exclusively for</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#DDD' }}>{cp.founder_name}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '9px', color: '#FF8C00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>LaunchPilot's Personalised Program for</div>
            <div style={{ fontSize: '56px', fontWeight: '900', color: '#fff', fontFamily: 'Playfair Display,serif', lineHeight: '1.0', letterSpacing: '-0.03em', marginBottom: '16px' }}>{cp.business_name}</div>
            <div style={{ width: '60px', height: '4px', background: '#FF6A00', borderRadius: '2px', marginBottom: '16px' }} />
            <div style={{ fontSize: '17px', color: '#FF8C00', fontFamily: 'Playfair Display,serif', fontStyle: 'italic', lineHeight: '1.3', maxWidth: '460px' }}>{bc.tagline}</div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', borderBottom: '1px solid #F0F0F0' }}>
          {[['Founder', cp.founder_name], ['Business', cp.business_name], ['Category', cp.business_category], ['Stage', cp.business_stage], ['Country', cp.country]].map(([l, v]) => (
            <div key={l} style={{ padding: '11px 16px', borderRight: '1px solid #F0F0F0' }}>
              <div style={{ fontSize: '7px', color: '#AAA', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>{l}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#111' }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '28px 48px 36px' }}>
          <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '8px' }}>About this program</div>
          <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.85', marginBottom: '6px' }}>{bc.program_intro}</p>
          <p style={{ fontSize: '11px', color: '#888', lineHeight: '1.8', fontStyle: 'italic', marginBottom: '20px' }}>{bc.why_now}</p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {[['6 weeks', 'Avg. time to first revenue'], ['94%', 'Program completion rate'], ['100+', 'Global mentor network'], ['8,000+', 'Founders trained']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center', padding: '12px 8px', background: '#0A0A0F', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#FF6A00', fontFamily: 'Playfair Display,serif', letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: '8px', color: '#555', lineHeight: '1.3', marginTop: '4px', fontFamily: 'DM Mono,monospace' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE 2: AI CO-PILOT + TRACKS ── */}
      <PageWrapper>
        <SectionHeader label="Your Program Structure" title={`AI Co-Pilot + Focus Areas for ${cp.business_name}`} />
        <p style={{ fontSize: '11px', color: '#555', lineHeight: '1.8', marginBottom: '20px' }}>{bc.ai_system_desc}</p>

        {/* 8 stage strip */}
        <div style={{ fontSize: '7px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '8px' }}>LaunchPilot AI — 8-Stage Session Framework</div>
        <div style={{ display: 'flex', marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E8E8E8' }}>
          {STAGES.map((s, i) => (
            <div key={s.n} style={{ flex: 1, background: i % 2 === 0 ? '#0A0A0F' : '#FF6A00', padding: '10px 6px', textAlign: 'center', borderRight: i < 7 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontSize: '8px', fontWeight: '800', color: i % 2 === 0 ? '#FF6A00' : '#fff', fontFamily: 'DM Mono,monospace', marginBottom: '3px' }}>{s.n}</div>
              <div style={{ fontSize: '8px', fontWeight: '700', color: '#fff', lineHeight: '1.2', marginBottom: '2px' }}>{s.title}</div>
              <div style={{ fontSize: '7px', color: i % 2 === 0 ? '#666' : 'rgba(255,255,255,0.7)', lineHeight: '1.3' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div style={{ fontSize: '7px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>Your 3 Focus Areas — Built for {cp.business_name}</div>
        {/* Journey flow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '14px', padding: '10px 0', background: '#F8F8F8', borderRadius: '8px' }}>
          {tracks.map((t: any, i: number) => (
            <div key={t.code} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '6px 14px', background: ['#FF6A00', '#FF8C00', '#1D9E75'][i], borderRadius: '100px', color: '#fff', fontSize: '10px', fontWeight: '700' }}>
                {i + 1}. {t.name}
              </div>
              {i < tracks.length - 1 && <span style={{ fontSize: '16px', color: '#CCC', margin: '0 6px' }}>→</span>}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tracks.map((t: any, ti: number) => {
            const ov = bc.track_overviews?.[ti] || {}
            const colors = ['#FF6A00', '#FF8C00', '#1D9E75']
            const col = colors[ti]
            return (
              <div key={t.code} style={{ border: `1px solid ${col}20`, borderRadius: '9px', overflow: 'hidden', borderLeft: `4px solid ${col}` }}>
                <div style={{ padding: '10px 16px', background: `${col}08`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#fff', fontFamily: 'DM Mono,monospace' }}>0{ti + 1}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', fontFamily: 'Playfair Display,serif' }}>{t.name}</div>
                </div>
                <div style={{ padding: '10px 16px', display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '10px', color: '#555', lineHeight: '1.7', marginBottom: '6px' }}>{ov.overview}</p>
                    {(ov.outcomes || []).length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {ov.outcomes.map((o: string, i: number) => (
                          <span key={i} style={{ fontSize: '8px', color: col, background: `${col}08`, border: `1px solid ${col}20`, padding: '2px 7px', borderRadius: '100px' }}>+ {o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ width: '140px', flexShrink: 0 }}>
                    <div style={{ fontSize: '7px', color: '#AAA', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>8 Concepts</div>
                    {(t.concepts || []).map((c: any) => (
                      <div key={c.sequence} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '2px' }}>
                        <span style={{ fontSize: '7px', fontWeight: '700', color: col, fontFamily: 'DM Mono,monospace', flexShrink: 0, marginTop: '1px' }}>{String(c.sequence).padStart(2, '0')}</span>
                        <span style={{ fontSize: '8px', color: '#555', lineHeight: '1.3' }}>{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </PageWrapper>

      {/* ── PAGE 3: AI SYSTEM IN ACTION ── */}
      <PageWrapper>
        <SectionHeader label="LaunchPilot AI" title={`How our AI works for ${cp.business_name}`} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {/* Screenshot 1 — Hook */}
          <div style={{ border: '1px solid #E0E0E0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: '#0A0A0F', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>{['#F97066', '#F59E0B', '#4ADE80'].map(c => <div key={c} style={{ width: '6px', height: '6px', borderRadius: '50%', background: c, opacity: 0.6 }} />)}</div>
              <span style={{ fontSize: '8px', color: '#666', fontFamily: 'DM Mono,monospace' }}>LaunchPilot AI · Session 1 · Stage 1 — Hook</span>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '7px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '8px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono,monospace' }}>AI</span>
                </div>
                <div style={{ background: '#F5F5F5', border: '1px solid #EEEEEE', borderRadius: '3px 9px 9px 9px', padding: '8px 10px', flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.6', margin: 0 }}>{bc.hook_challenge}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'rgba(255,106,0,0.07)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '9px 3px 9px 9px', padding: '8px 10px', maxWidth: '78%' }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.5', margin: 0 }}>{bc.founder_reply}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '7px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '8px', fontWeight: '800', color: '#1D9E75', fontFamily: 'DM Mono,monospace' }}>AI</span>
                </div>
                <div style={{ background: 'rgba(29,158,117,0.04)', border: '1px solid rgba(29,158,117,0.18)', borderRadius: '3px 9px 9px 9px', padding: '8px 10px', flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.5', margin: 0 }}><span style={{ color: '#1D9E75', fontWeight: '700' }}>Real signal. </span>{bc.ai_followup}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '5px 12px', borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }}>
              <span style={{ fontSize: '7px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stage 1 of 8 · Hook</span>
            </div>
          </div>

          {/* Screenshot 2 — Evaluation */}
          <div style={{ border: '1px solid #E0E0E0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ background: '#0A0A0F', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>{['#F97066', '#F59E0B', '#4ADE80'].map(c => <div key={c} style={{ width: '6px', height: '6px', borderRadius: '50%', background: c, opacity: 0.6 }} />)}</div>
              <span style={{ fontSize: '8px', color: '#666', fontFamily: 'DM Mono,monospace' }}>LaunchPilot AI · Session 3 · Stage 6 — Execution Task</span>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '8px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono,monospace' }}>AI</span>
                </div>
                <div style={{ background: '#F5F5F5', border: '1px solid #EEEEEE', borderRadius: '3px 9px 9px 9px', padding: '8px 10px', flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#333', lineHeight: '1.5', margin: 0 }}>Your task: {bc.task}</p>
                </div>
              </div>
              <div style={{ background: 'rgba(29,158,117,0.04)', border: '1px solid rgba(29,158,117,0.18)', borderRadius: '9px', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <span style={{ fontSize: '8px', color: '#1D9E75', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Evaluation</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#1D9E75', fontFamily: 'Playfair Display,serif' }}>{bc.eval_score || '84'}</span>
                    <span style={{ fontSize: '9px', color: '#AAA' }}>/100</span>
                    <span style={{ fontSize: '7px', color: '#1D9E75', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)', padding: '2px 6px', borderRadius: '100px', fontFamily: 'DM Mono,monospace', fontWeight: '700' }}>PASS</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px', marginBottom: '7px' }}>
                  {[['Problem Clarity', 18, 20], ['Business Thinking', 17, 20], ['Execution', 16, 20], ['Communication', 15, 20], ['User Insight', 9, 20], ['Creativity', 9, 20]].map(([d, s, m]) => (
                    <div key={d as string} style={{ padding: '4px 6px', background: 'rgba(255,255,255,0.6)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '7px', color: '#888', marginBottom: '1px' }}>{d}</div>
                      <div style={{ fontSize: '9px', fontWeight: '700', color: '#1D9E75' }}>{s}<span style={{ color: '#CCC', fontWeight: '400' }}>/{m}</span></div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '9px', color: '#333', lineHeight: '1.6', borderTop: '1px solid rgba(29,158,117,0.12)', paddingTop: '6px' }}>
                  <span style={{ color: '#1D9E75', fontWeight: '700' }}>Strong: </span>{bc.eval_strength}<br />
                  <span style={{ color: '#BA7517', fontWeight: '700' }}>Fix: </span>{bc.eval_fix}
                </div>
              </div>
            </div>
            <div style={{ padding: '5px 12px', borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }}>
              <span style={{ fontSize: '7px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stage 6 of 8 · Execution Task</span>
            </div>
          </div>
        </div>

        {/* What AI does differently */}
        <div style={{ background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px' }}>What makes our AI different</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              ['Knows your business', `Built specifically for ${cp.business_name} — not generic advice`],
              ['Full memory', 'Remembers every session and every commitment you made'],
              ['Real evaluation', 'Scores your work on 6 dimensions and explains exactly why'],
              ['Accountability', 'Every session starts by checking last week\'s action step'],
              ['8-stage structure', 'Not a chatbot — a structured learning system per concept'],
              ['Always available', 'At 3am before a pitch or Sunday before a customer call'],
            ].map(([title, desc]) => (
              <div key={title as string} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#FF6A00', fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#111', marginBottom: '1px' }}>{title}</div>
                  <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.4' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>

      {/* ── PAGE 4: ALL MENTORS ── */}
      <PageWrapper>
        <SectionHeader label="Your Mentor Network" title={`Every mentor — their relevance to ${cp.business_name}`} />
        <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7', marginBottom: '16px' }}>Our 100+ mentor network spans founders, VCs, operators and domain experts across India, Singapore, US and SEA. Every mentor below teaches inside the program through weekly live sessions. Here is why each one matters to {cp.business_name}.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {allMentors.map((m: any, i: number) => (
            <MentorRow key={i} m={m} relevance={bc.mentor_relevance?.[m.name]} />
          ))}
        </div>
      </PageWrapper>

      {/* ── PAGE 5: SPRINTS + SESSIONS ── */}
      <PageWrapper>
        <SectionHeader label="Live Learning" title={`Sprints & Sunday Sessions for ${cp.business_name}`} />

        <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>6 Monthly Sprints — Most Relevant to You</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '24px' }}>
          {(bc.sprints || []).map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '0', border: '1px solid #EEEEEE', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ width: '32px', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono,monospace', writingMode: 'vertical-rl' as const, transform: 'rotate(180deg)' }}>S{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div style={{ padding: '9px 14px', flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{s.name}</div>
                <div style={{ fontSize: '9px', color: '#FF8C00', fontStyle: 'italic' }}>Why for {cp.business_name}: {s.why}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderBottom: '2px solid #0A0A0F', paddingBottom: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '8px', color: '#666', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '3px' }}>Sunday Experiential Sessions</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#111', fontFamily: 'Playfair Display,serif' }}>5 Sessions Most Useful for You</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(bc.sessions || []).map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '9px 12px', background: '#F8F8F8', borderRadius: '7px', border: '1px solid #EEEEEE' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#FF6A00', fontFamily: 'DM Mono,monospace' }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{s.name}</div>
                <div style={{ fontSize: '9px', color: '#FF8C00', fontStyle: 'italic' }}>Why for {cp.business_name}: {s.why}</div>
              </div>
            </div>
          ))}
        </div>
      </PageWrapper>

      {/* ── PAGE 6: PAST STUDENTS ── */}
      <PageWrapper>
        <SectionHeader label="Our Community" title="Founders who started where you are" />
        <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7', marginBottom: '20px' }}>These founders came in with an idea — many had doubts, no revenue, no team. They followed the program. Here is what happened.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {PAST_STUDENTS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px 16px', background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', flexShrink: 0, lineHeight: '1' }}>{s.flag}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{s.name}</span>
                  <span style={{ fontSize: '9px', color: '#AAA' }}>·</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{s.business}</span>
                  <span style={{ fontSize: '9px', color: '#CCC' }}>·</span>
                  <span style={{ fontSize: '9px', color: '#AAA' }}>{s.category}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#444', lineHeight: '1.6', marginBottom: '6px' }}>{s.outcome}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ padding: '4px 10px', background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '100px', whiteSpace: 'nowrap' as const }}>
                  <span style={{ fontSize: '10px', color: '#1D9E75', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>{s.revenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {[['8,000+', 'Founders trained globally'], ['40+', 'Countries represented'], ['6 wks', 'Avg. to first revenue'], ['$3.8K', 'Avg. first month revenue']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '14px 8px', background: '#0A0A0F', borderRadius: '9px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#FF6A00', fontFamily: 'Playfair Display,serif', letterSpacing: '-0.02em' }}>{n}</div>
              <div style={{ fontSize: '8px', color: '#555', lineHeight: '1.3', marginTop: '4px', fontFamily: 'DM Mono,monospace' }}>{l}</div>
            </div>
          ))}
        </div>
      </PageWrapper>

      {/* ── PAGE 7: IMMERSION PROGRAM ── */}
      <PageWrapper>
        <SectionHeader label="Immersion Program" title="Beyond the screen — live, in person" color="#1D9E75" />
        <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.85', marginBottom: '24px' }}>Once a year, the top founders in the LaunchPilot cohort are invited to a 4-day immersion program. This is where the real breakthroughs happen — not in front of a laptop, but in a room with people who are building at the same pace as you.</p>

        {/* Cities visual */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '28px' }}>
          {[['🇸🇬', 'Singapore', 'Investor meetings, pitch days, VC roundtables'],
            ['🇦🇪', 'Dubai', 'Middle East market entry, GTM workshops'],
            ['🇮🇩', 'Bali', 'Founder reset, deep strategy offsite, recovery'],
            ['🇮🇳', 'Mumbai', 'India market, distribution, founder fireside']].map(([flag, city, desc]) => (
            <div key={city as string} style={{ padding: '16px 14px', background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '10px', textAlign: 'center', borderTop: '3px solid #1D9E75' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{flag}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{city}</div>
              <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.4' }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* What happens */}
        <div style={{ fontSize: '8px', color: '#1D9E75', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>What happens at immersion</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {[
            ['🤝', 'Investor Roundtables', 'Pitch your business to active investors in the room. Get term sheets, not just feedback.'],
            ['🎤', 'Mentor Dinners', 'Closed dinners with 2-3 senior mentors. Real conversations, not presentations.'],
            ['⚡', 'Sprint Days', '2 full days of intensive working sessions — strategy, GTM, fundraising.'],
            ['🌐', 'Founder Network', 'Meet the cohort in person. The relationships you build here outlast the program.'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} style={{ display: 'flex', gap: '10px', padding: '12px 14px', background: '#F0FBF7', border: '1px solid rgba(29,158,117,0.15)', borderRadius: '8px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111', marginBottom: '3px' }}>{title}</div>
                <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.5' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {timeline.length > 0 && (
          <>
            <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>Your 6-Month Northstar for {cp.business_name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
              {timeline.map((t: any, i: number) => {
                const cols = ['#FF6A00', '#FF8C00', '#FFAA00', '#1D9E75', '#17876A', '#117055']
                const col = cols[i] || '#FF6A00'
                return (
                  <div key={i} style={{ padding: '10px', background: '#F8F8F8', border: `1px solid ${col}20`, borderRadius: '8px', borderTop: `3px solid ${col}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '7px', fontWeight: '800', color: '#fff', fontFamily: 'DM Mono,monospace' }}>M{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '7px', color: col, fontFamily: 'DM Mono,monospace', fontWeight: '700' }}>{t.month}</span>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#111', marginBottom: '2px', lineHeight: '1.2' }}>{t.milestone}</div>
                    <div style={{ fontSize: '8px', color: '#888', lineHeight: '1.4' }}>{t.description}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </PageWrapper>

      {/* ── PAGE 8: WOOLF + MBA ── */}
      <PageWrapper>
        <SectionHeader label="Academic Accreditation" title="Plan B — if the startup doesn't work out" color="#3B82F6" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px', alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.85', marginBottom: '14px' }}>LaunchPilot is accredited with <strong>Woolf University</strong> — a globally recognised institution. Every founder who completes the program is eligible to convert their experience into a Woolf MBA.</p>
            <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.8', marginBottom: '14px' }}>Most accelerators give you nothing when the startup fails. We give you a credential that opens doors — at high-growth startups, VC firms and operator roles that only hire people who have actually tried to build something.</p>
            <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '9px' }}>
              <div style={{ fontSize: '7px', color: '#3B82F6', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' }}>Woolf University · MBA</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#111', fontFamily: 'Playfair Display,serif', marginBottom: '6px', lineHeight: '1.2' }}>Globally recognised. Respected by startups and VCs.</div>
              <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.5' }}>Woolf is a Bologna-compliant institution with members across Europe and Asia. The MBA is taken seriously by employers who know what it takes to build something.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '8px', color: '#3B82F6', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '4px' }}>What the MBA opens up</div>
            {[
              ['🚀', 'Operator roles at high-growth startups', 'COO, VP Product, Head of Growth — companies that want founders who tried'],
              ['💼', 'VC and investor roles', 'Scouts, analysts and principals at seed and Series A funds hiring for judgment'],
              ['🌍', 'Global mobility', 'Recognised credential for visa applications and employer sponsorships internationally'],
              ['🎓', 'Further education', 'Pathway to doctoral programs and specialist executive education at partner institutions'],
              ['🤝', 'Executive network', 'Woolf alumni network across 30+ countries — operators, founders and investors'],
            ].map(([icon, title, desc]) => (
              <div key={title as string} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: '7px' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#111', marginBottom: '1px' }}>{title}</div>
                  <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.4' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0A0A0F', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px' }}>The two paths from LaunchPilot</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '14px', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '16px', marginBottom: '6px' }}>🚀</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ADE80', marginBottom: '4px', fontFamily: 'Playfair Display,serif' }}>Path A — Startup works</div>
              <div style={{ fontSize: '9px', color: '#AAA', lineHeight: '1.5' }}>Revenue, team, traction. You have a real business. LaunchPilot was the launchpad.</div>
            </div>
            <div style={{ fontSize: '20px', color: '#333', textAlign: 'center' }}>or</div>
            <div style={{ padding: '14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '16px', marginBottom: '6px' }}>🎓</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#60A5FA', marginBottom: '4px', fontFamily: 'Playfair Display,serif' }}>Path B — Startup doesn't</div>
              <div style={{ fontSize: '9px', color: '#AAA', lineHeight: '1.5' }}>Woolf MBA opens doors. You join a high-growth startup as a senior operator with real founder credibility.</div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ── PAGE 9: CRITICAL QUESTIONS + CLOSE ── */}
      <PageWrapper minH>
        <SectionHeader label="Before You Begin" title={`What ${cp.business_name} must answer`} color="#D85A30" />
        <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7', marginBottom: '16px' }}>These are the questions that determine whether {cp.business_name} succeeds or not. Most founders avoid them. This program forces you to answer every single one.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {(bc.critical_questions || []).map((q: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 16px', background: 'rgba(216,90,48,0.04)', border: '1px solid rgba(216,90,48,0.12)', borderRadius: '9px' }}>
              <span style={{ fontSize: '18px', color: '#D85A30', flexShrink: 0, fontWeight: '800' }}>?</span>
              <span style={{ fontSize: '12px', color: '#111', fontWeight: '600', lineHeight: '1.4' }}>{q}</span>
            </div>
          ))}
        </div>

        {/* What you achieve */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '10px' }}>What {cp.founder_name} achieves with LaunchPilot</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(bc.what_you_achieve || []).map((a: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 14px', background: '#F8FFF5', border: '1px solid rgba(29,158,117,0.15)', borderRadius: '7px', borderLeft: '3px solid #1D9E75' }}>
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#1D9E75', fontFamily: 'DM Mono,monospace', flexShrink: 0, marginTop: '2px' }}>0{i + 1}</span>
                <span style={{ fontSize: '11px', color: '#333', lineHeight: '1.5' }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: '#0A0A0F', borderRadius: '14px 14px 0 0', padding: '22px 26px' }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', fontFamily: 'Playfair Display,serif', letterSpacing: '-0.02em', marginBottom: '3px' }}>
              Ready to build {cp.business_name}?
            </div>
            <div style={{ fontSize: '8px', color: '#FF6A00', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.16em' }}>LaunchPilot School · Rolling Admissions</div>
          </div>
          <div style={{ background: '#FFF8F3', borderRadius: '0 0 14px 14px', padding: '18px 26px', borderBottom: '4px solid #FF6A00' }}>
            <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.85', marginBottom: '16px' }}>{bc.closing}</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ padding: '10px 24px', background: '#FF6A00', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif' }}>Apply for a spot →</div>
              <span style={{ fontSize: '10px', color: '#AAA', fontFamily: 'DM Mono,monospace' }}>launchpilot-phi.vercel.app/apply</span>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  )
}
