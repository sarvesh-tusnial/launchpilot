import Link from 'next/link'

const PATHWAYS = [
  { code: 'P01', emoji: '🤖', name: 'AI Tech Business',     students: 847,  avgRevenue: '$4.2K',  timeToRevenue: '6 weeks' },
  { code: 'P02', emoji: '🎓', name: 'Course Business',       students: 1203, avgRevenue: '$3.8K',  timeToRevenue: '8 weeks' },
  { code: 'P03', emoji: '💼', name: 'Consulting Business',   students: 934,  avgRevenue: '$6.1K',  timeToRevenue: '4 weeks' },
  { code: 'P04', emoji: '🏪', name: 'Marketplace',           students: 421,  avgRevenue: '$2.9K',  timeToRevenue: '12 weeks' },
  { code: 'P05', emoji: '📦', name: 'E-commerce',            students: 1876, avgRevenue: '$3.1K',  timeToRevenue: '7 weeks' },
  { code: 'P06', emoji: '👗', name: 'Fashion D2C Brand',     students: 612,  avgRevenue: '$2.4K',  timeToRevenue: '10 weeks' },
  { code: 'P07', emoji: '📚', name: 'EdTech Business',       students: 389,  avgRevenue: '$4.7K',  timeToRevenue: '9 weeks' },
  { code: 'P08', emoji: '🌐', name: 'Community Business',    students: 743,  avgRevenue: '$2.8K',  timeToRevenue: '8 weeks' },
  { code: 'P09', emoji: '🎬', name: 'Content Business',      students: 1102, avgRevenue: '$1.9K',  timeToRevenue: '10 weeks' },
  { code: 'P10', emoji: '💻', name: 'Freelancing',           students: 2341, avgRevenue: '$5.2K',  timeToRevenue: '3 weeks' },
]

const OUTCOMES = [
  { name: 'Priya S.', role: 'Product Manager → Consultant', pathway: '💼 Consulting', result: 'First $8K client in 5 weeks', img: null },
  { name: 'James T.', role: 'Engineer → Course Creator', pathway: '🎓 Course Business', result: '$12K launch in first cohort', img: null },
  { name: 'Aisha M.', role: 'Marketing Lead → Freelancer', pathway: '💻 Freelancing', result: 'Replaced salary in 7 weeks', img: null },
  { name: 'Rahul K.', role: 'MBA Student → Founder', pathway: '🤖 AI Tech', result: '40 paying users, $2K MRR', img: null },
]

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050309',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#F0EDE6',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Fraunces', Georgia, serif; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scrollLeft { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .fade-up { animation: fadeUp 0.8s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .pathway-card:hover { border-color: rgba(108,71,255,0.4) !important; transform: translateY(-2px); }
        .pathway-card { transition: all 0.2s; }
        .outcome-card:hover { border-color: rgba(255,255,255,0.12) !important; }
        .outcome-card { transition: border-color 0.2s; }
        .cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cta-btn { transition: all 0.15s; }
        .ghost-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .ghost-btn { transition: background 0.15s; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', background: 'rgba(5,3,9,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="serif" style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>
            Launch<span style={{ color: '#6C47FF' }}>Pilot</span>
          </div>
          <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.2em', verticalAlign: 'middle', marginTop: '2px' }}>School</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/auth/login" className="ghost-btn" style={{ padding: '8px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#AAA', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            Sign In
          </Link>
          <Link href="/apply" className="cta-btn" style={{ padding: '9px 22px', borderRadius: '8px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
            Apply Now →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(108,71,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '820px' }}>
          <div className="fade-up fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.25)', marginBottom: '32px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6C47FF', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize: '10px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.18em' }}>10 launch pathways · idea to revenue</span>
          </div>

          <h1 className="serif fade-up fade-up-2" style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: '900', lineHeight: '1.02', letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Stop planning.<br />
            <span style={{ color: '#6C47FF', fontStyle: 'italic' }}>Start launching.</span>
          </h1>

          <p className="fade-up fade-up-3" style={{ fontSize: '18px', color: '#888', lineHeight: '1.75', maxWidth: '560px', margin: '0 auto 48px', fontWeight: '400' }}>
            25 structured steps from idea to first revenue — built for working professionals who are serious about launching a business on the side.
          </p>

          <div className="fade-up fade-up-3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply" className="cta-btn" style={{ padding: '15px 40px', borderRadius: '10px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Apply for a spot →
            </Link>
            <Link href="/auth/login" className="ghost-btn" style={{ padding: '15px 32px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#AAA', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>
              Sign In
            </Link>
          </div>

          {/* Social proof numbers */}
          <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '72px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { n: '8,000+', l: 'Founders enrolled' },
              { n: '$2.1M',  l: 'Revenue generated' },
              { n: '6 wks',  l: 'Avg. time to revenue' },
              { n: '94%',    l: 'Completion rate' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: '28px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.n}</div>
                <div className="mono" style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>How it works</div>
            <h2 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              A structured path<br />from zero to revenue.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { n: '01', title: 'Pick your pathway', desc: 'Choose the business you want to launch. 10 pathways, each designed for a specific type of founder.', icon: '🎯' },
              { n: '02', title: '25 structured steps', desc: 'Every pathway has 25 steps — from idea validation to your first paying customer. No skipping, no guessing.', icon: '🗺️' },
              { n: '03', title: 'Execute and launch', desc: 'Each step ends with one specific action. Not a list. One thing to do this week. Build momentum fast.', icon: '🚀' },
            ].map(s => (
              <div key={s.n} style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', borderTop: '2px solid #6C47FF' }}>
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{s.icon}</div>
                <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', letterSpacing: '0.1em', marginBottom: '10px' }}>STEP {s.n}</div>
                <div className="serif" style={{ fontSize: '20px', fontWeight: '700', color: '#F0EDE6', marginBottom: '10px', letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontSize: '14px', color: '#777', lineHeight: '1.7' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATHWAYS */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>10 Launch Pathways</div>
              <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                Pick the business<br />you want to build.
              </h2>
            </div>
            <div style={{ padding: '16px 24px', background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '12px' }}>
              <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Each pathway includes</div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.7' }}>25 steps · 8-stage framework · Real deliverables</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {PATHWAYS.map(p => (
              <div key={p.code} className="pathway-card" style={{ padding: '20px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', cursor: 'pointer' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{p.emoji}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '8px', lineHeight: '1.3' }}>{p.name}</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase' }}>Avg revenue</span>
                    <span className="mono" style={{ fontSize: '9px', color: '#00C851' }}>{p.avgRevenue}/mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase' }}>To revenue</span>
                    <span className="mono" style={{ fontSize: '9px', color: '#8B6FFF' }}>{p.timeToRevenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SCREENSHOT */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>The Product</div>
            <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', letterSpacing: '-0.03em' }}>
              Your launch dashboard.
            </h2>
          </div>

          {/* Mock dashboard */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(108,71,255,0.15)' }}>
            {/* Window chrome */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.6 }} />)}
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: '10px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>LaunchPilot · Your Dashboard</span>
              </div>
            </div>

            <div style={{ display: 'flex', height: '480px' }}>
              {/* Sidebar */}
              <div style={{ width: '220px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 14px', flexShrink: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#F0EDE6', marginBottom: '4px' }}>Launch<span style={{ color: '#6C47FF' }}>Pilot</span></div>
                <div className="mono" style={{ fontSize: '9px', color: '#333', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>School</div>
                <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6', marginBottom: '2px' }}>James T.</div>
                  <div style={{ fontSize: '10px', color: '#444' }}>Engineer → Founder</div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                    <div><div style={{ fontSize: '16px', fontWeight: '700', color: '#6C47FF' }}>8</div><div style={{ fontSize: '8px', color: '#333', textTransform: 'uppercase', fontFamily: 'monospace' }}>Done</div></div>
                    <div><div style={{ fontSize: '16px', fontWeight: '700', color: '#555' }}>17</div><div style={{ fontSize: '8px', color: '#333', textTransform: 'uppercase', fontFamily: 'monospace' }}>Left</div></div>
                  </div>
                </div>
                <div style={{ fontSize: '8px', fontFamily: 'monospace', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Your Pathway</div>
                <div style={{ background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>🎓</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#E8E6E0', marginBottom: '8px', lineHeight: '1.3' }}>Course Business</div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < 8 ? '#6C47FF' : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', maxWidth: '80%' }}>
                    <p style={{ fontSize: '13px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Last week you committed to recording your first module. <span style={{ color: '#F59E0B', fontWeight: '600' }}>Did you do it?</span> Before we move to Step 9, I need to know.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '14px 4px 14px 14px', padding: '12px 16px', maxWidth: '70%' }}>
                    <p style={{ fontSize: '13px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Yes! Recorded 3 videos. First module is done.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', maxWidth: '80%' }}>
                    <p style={{ fontSize: '13px', color: '#CCC', lineHeight: '1.65', margin: 0 }}><span style={{ color: '#4ADE80', fontWeight: '600' }}>That's real progress.</span> Most people never record the first one. Step 9 is pricing — and this is where most course creators leave $10K on the table. Let's fix that.</p>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#333' }}>Reply to Maya...</span>
                  <div style={{ padding: '6px 16px', background: '#6C47FF', borderRadius: '6px', fontSize: '12px', color: '#fff', fontWeight: '600' }}>Send →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>Real outcomes</div>
            <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', letterSpacing: '-0.03em' }}>
              They launched.<br /><span style={{ color: '#6C47FF', fontStyle: 'italic' }}>You're next.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {OUTCOMES.map((o, i) => (
              <div key={i} className="outcome-card" style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>
                    {o.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EDE6' }}>{o.name}</div>
                    <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{o.role}</div>
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'rgba(0,200,81,0.04)', border: '1px solid rgba(0,200,81,0.12)', borderRadius: '10px', marginBottom: '16px' }}>
                  <div className="serif" style={{ fontSize: '18px', fontWeight: '700', color: '#00C851', letterSpacing: '-0.01em' }}>{o.result}</div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '100px' }}>
                  <span style={{ fontSize: '11px' }}>{o.pathway.split(' ')[0]}</span>
                  <span className="mono" style={{ fontSize: '9px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{o.pathway.split(' ').slice(1).join(' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI SECTION */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>The ROI</div>
              <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '24px' }}>
                Most courses teach.<br />We make you launch.
              </h2>
              <p style={{ fontSize: '15px', color: '#777', lineHeight: '1.8', marginBottom: '32px' }}>
                The average LaunchPilot student goes from zero to first revenue in 6 weeks. Not because we're magic — because we give you 25 specific steps and hold you accountable to each one.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { icon: '✓', text: 'Step-by-step — no guessing what to do next' },
                  { icon: '✓', text: 'Pathway-specific — built for your exact business type' },
                  { icon: '✓', text: 'Accountability — one action step per session, no exceptions' },
                  { icon: '✓', text: 'Real deliverables — cold emails, landing pages, sales scripts' },
                ].map(f => (
                  <div key={f.text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#6C47FF', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>{f.icon}</span>
                    <span style={{ fontSize: '14px', color: '#AAA', lineHeight: '1.5' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { n: '6 weeks', l: 'Average time to first revenue', col: '#6C47FF' },
                { n: '94%',     l: 'Students complete their pathway', col: '#00C851' },
                { n: '$3.8K',   l: 'Average first month revenue', col: '#FFD700' },
                { n: '25',      l: 'Clear steps per pathway', col: '#8B6FFF' },
              ].map(s => (
                <div key={s.l} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                  <div className="serif" style={{ fontSize: '32px', fontWeight: '800', color: s.col, letterSpacing: '-0.02em', marginBottom: '8px' }}>{s.n}</div>
                  <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(108,71,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '24px' }}>Limited spots per cohort</div>
          <h2 className="serif" style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.05', marginBottom: '24px' }}>
            Your business<br />won't launch itself.
          </h2>
          <p style={{ fontSize: '17px', color: '#777', lineHeight: '1.75', marginBottom: '48px' }}>
            Pick a pathway. Follow 25 steps. Launch your business. The only thing standing between you and your first customer is starting.
          </p>
          <Link href="/apply" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '17px 48px', borderRadius: '12px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700' }}>
            Apply for a spot →
          </Link>
          <div className="mono" style={{ fontSize: '11px', color: '#333', marginTop: '16px', letterSpacing: '0.06em' }}>Rolling admissions · Review within 24 hours</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="serif" style={{ fontSize: '16px', fontWeight: '700', color: '#F0EDE6' }}>
          Launch<span style={{ color: '#6C47FF' }}>Pilot</span>
          <span className="mono" style={{ fontSize: '8px', color: '#333', marginLeft: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', verticalAlign: 'middle' }}>School</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/apply" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>Apply</Link>
          <Link href="/auth/login" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/admin-login" style={{ fontSize: '12px', color: '#333', textDecoration: 'none' }}>Admin</Link>
        </div>
        <div className="mono" style={{ fontSize: '10px', color: '#333', letterSpacing: '0.06em' }}>© 2025 LaunchPilot School</div>
      </footer>
    </div>
  )
}
