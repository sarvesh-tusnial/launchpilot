import Link from 'next/link'

const PATHWAYS = [
  { code: 'P01', emoji: '🤖', name: 'AI Tech Business',     avgRevenue: '$4.2K', timeToRevenue: '6 wks' },
  { code: 'P02', emoji: '🎓', name: 'Course Business',       avgRevenue: '$3.8K', timeToRevenue: '8 wks' },
  { code: 'P03', emoji: '💼', name: 'Consulting',            avgRevenue: '$6.1K', timeToRevenue: '4 wks' },
  { code: 'P04', emoji: '🏪', name: 'Marketplace',           avgRevenue: '$2.9K', timeToRevenue: '12 wks' },
  { code: 'P05', emoji: '📦', name: 'E-commerce',            avgRevenue: '$3.1K', timeToRevenue: '7 wks' },
  { code: 'P06', emoji: '👗', name: 'Fashion D2C',           avgRevenue: '$2.4K', timeToRevenue: '10 wks' },
  { code: 'P07', emoji: '📚', name: 'EdTech',                avgRevenue: '$4.7K', timeToRevenue: '9 wks' },
  { code: 'P08', emoji: '🌐', name: 'Community',             avgRevenue: '$2.8K', timeToRevenue: '8 wks' },
  { code: 'P09', emoji: '🎬', name: 'Content Business',      avgRevenue: '$1.9K', timeToRevenue: '10 wks' },
  { code: 'P10', emoji: '💻', name: 'Freelancing',           avgRevenue: '$5.2K', timeToRevenue: '3 wks' },
]

const JOURNEY = [
  {
    phase: '01',
    label: 'Idea & Validation',
    color: '#6C47FF',
    steps: ['What kind of business can you actually build', 'Finding a real problem worth solving', 'Validating demand before you build anything', 'Defining your ideal customer'],
    screen: {
      title: 'Step 3 — Validate your idea',
      maya: `Before you build anything, let's find out if people will actually pay for this. I'm going to give you a 5-minute challenge.`,
      action: '⏱ TIMER CHALLENGE — 5 minutes',
      actionDesc: 'You have 5 minutes to find 3 people who have this problem. Not friends. Real strangers. Go.',
      hint: 'Hint: Reddit, Facebook Groups, or LinkedIn comments. Where do they complain about this?',
    }
  },
  {
    phase: '02',
    label: 'Build & Launch',
    color: '#8B6FFF',
    steps: ['Building your MVP in 2 weeks', 'Your first sales conversation', 'Closing your first paying customer', 'Onboarding so they get real value'],
    screen: {
      title: 'Step 8 — First sales conversation',
      maya: `Last week you committed to reaching out to 5 potential customers. How many did you actually contact?`,
      studentReply: 'I contacted 3. Got 2 replies.',
      mayaReply: `Two replies from cold outreach is actually strong. Most people get zero because they never send. Now — did either of them say yes to a call?`,
      verdict: '→ Stage 7 unlocked',
    }
  },
  {
    phase: '03',
    label: 'Growth & Marketing',
    color: '#A78BFA',
    steps: ['Building a repeatable sales process', 'Content that attracts your ideal customer', 'Growing through referrals and word of mouth', 'Your first $1K month'],
    screen: {
      title: 'Step 16 — Repeatable sales',
      eval: { score: 84, verdict: 'PASS', strengths: 'Your cold email is specific and leads with the customer\'s problem, not your product. The CTA is clear.', fix: 'Add one line of social proof — even a single result from your first customer.' }
    }
  },
  {
    phase: '04',
    label: 'Revenue & Scale',
    color: '#C4B5FD',
    steps: ['Getting to $5K per month', 'Hiring your first help', 'Building systems that run without you', 'Going full-time — when the numbers make sense'],
    screen: {
      title: 'Step 22 — Getting to $5K/mo',
      progress: { mastered: 22, total: 25, message: '3 steps left. You\'re almost there.' }
    }
  },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#F0EDE6', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Fraunces', Georgia, serif; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .d1{animation-delay:0.1s} .d2{animation-delay:0.25s} .d3{animation-delay:0.4s}
        .pw-card:hover { border-color: rgba(108,71,255,0.35) !important; transform: translateY(-2px); background: rgba(108,71,255,0.06) !important; }
        .pw-card { transition: all 0.18s; }
        .cta:hover { opacity:0.88; transform:translateY(-1px); }
        .cta { transition: all 0.15s; }
        .ghost:hover { background: rgba(255,255,255,0.06) !important; }
        .ghost { transition: background 0.15s; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', background: 'rgba(5,3,9,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="serif" style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>Launch<span style={{ color: '#6C47FF' }}>Pilot</span></div>
          <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '2px' }}>School</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/auth/login" className="ghost" style={{ padding: '8px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#AAA', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Sign In</Link>
          <Link href="/apply" className="cta" style={{ padding: '9px 22px', borderRadius: '8px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Apply Now →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(108,71,255,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '860px' }}>
          <div className="fade-up d1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.25)', marginBottom: '32px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6C47FF', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize: '10px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.16em' }}>10 pathways · idea to first revenue</span>
          </div>
          <h1 className="serif fade-up d2" style={{ fontSize: 'clamp(52px, 7.5vw, 92px)', fontWeight: '900', lineHeight: '1.01', letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Stop planning.<br /><span style={{ color: '#6C47FF', fontStyle: 'italic' }}>Start launching.</span>
          </h1>
          <p className="fade-up d3" style={{ fontSize: '18px', color: '#777', lineHeight: '1.75', maxWidth: '520px', margin: '0 auto 48px', fontWeight: '400' }}>
            25 structured steps from idea to first revenue — built for working professionals who are serious about building a business on the side.
          </p>
          <div className="fade-up d3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            <Link href="/apply" className="cta" style={{ padding: '15px 40px', borderRadius: '10px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Apply for a spot →</Link>
            <Link href="/auth/login" className="ghost" style={{ padding: '15px 32px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#AAA', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Sign In</Link>
          </div>
          <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[{ n: '8,000+', l: 'Founders enrolled' }, { n: '$2.1M', l: 'Revenue generated' }, { n: '6 wks', l: 'Avg. time to revenue' }, { n: '94%', l: 'Completion rate' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: '26px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.n}</div>
                <div className="mono" style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATHWAYS — right below hero */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>Pick your pathway</div>
            <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              What do you want to build?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {PATHWAYS.map(p => (
              <div key={p.code} className="pw-card" style={{ padding: '18px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', cursor: 'pointer' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{p.emoji}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6', marginBottom: '10px', lineHeight: '1.3' }}>{p.name}</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span className="mono" style={{ fontSize: '8px', color: '#333', textTransform: 'uppercase' }}>Revenue</span>
                    <span className="mono" style={{ fontSize: '8px', color: '#00C851' }}>{p.avgRevenue}/mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="mono" style={{ fontSize: '8px', color: '#333', textTransform: 'uppercase' }}>Timeline</span>
                    <span className="mono" style={{ fontSize: '8px', color: '#8B6FFF' }}>{p.timeToRevenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/apply" className="cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '10px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
              Choose your pathway →
            </Link>
          </div>
        </div>
      </section>

      {/* JOURNEY FLOW */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>The journey</div>
            <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '16px' }}>
              From idea to revenue.<br />Step by step.
            </h2>
            <p style={{ fontSize: '15px', color: '#666', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
              Every pathway follows the same structure — 25 steps across 4 phases. Each step teaches you something and makes you execute it.
            </p>
          </div>

          {/* Phase 1 — Idea & Validation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '100px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: '11px', color: '#6C47FF', fontWeight: '700' }}>01</span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Phase one</div>
                  <div className="serif" style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>Idea & Validation</div>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                Most people skip this and build the wrong thing. We make you validate before you build. Real conversations with real potential customers — not surveys, not assumptions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Find a real problem worth solving', 'Validate demand before building anything', 'Define your ideal customer precisely', 'Get your first pre-commitment'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '9px', color: '#6C47FF', fontWeight: '700' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Screenshot */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(108,71,255,0.12)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                <span className="mono" style={{ fontSize: '9px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1, textAlign: 'center' }}>Step 3 — Validate your idea</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Before you build anything, let's find out if people will actually pay for this. I'm giving you a challenge.</p>
                  </div>
                </div>
                <div style={{ marginLeft: '36px', background: 'rgba(249,112,102,0.05)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#F97066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>⏱ Timer Challenge · 5 minutes</div>
                  <p style={{ fontSize: '12px', color: '#AAA', lineHeight: '1.6', margin: '0 0 10px' }}>Find 3 people who have this problem right now. Not friends. Real strangers. Where do they complain about it online?</p>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, #F97066, #F59E0B)', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '12px 4px 12px 12px', padding: '10px 14px', maxWidth: '75%' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.6', margin: 0 }}>Found 5 Reddit threads and a Facebook group where people complain about this exact problem.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}><span style={{ color: '#4ADE80', fontWeight: '600' }}>That's real signal.</span> Now let's turn one of those people into your first conversation. Moving to Step 4.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 — Build & Launch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '100px' }}>
            {/* Screenshot first */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(139,111,255,0.1)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                <span className="mono" style={{ fontSize: '9px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1, textAlign: 'center' }}>Step 12 — First sales conversation</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Last week you committed to contacting 5 potential customers. <span style={{ color: '#F59E0B', fontWeight: '600' }}>Did you do it?</span> Before we move on, I need to know.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '12px 4px 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.6', margin: 0 }}>I contacted 3. Got 2 replies. One wants to jump on a call tomorrow.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Two replies from cold outreach is strong — most people get zero. A call tomorrow is huge. Let's prepare you to close it.</p>
                  </div>
                </div>
                <div style={{ marginLeft: '36px', padding: '12px', background: 'rgba(108,71,255,0.05)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '8px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Your action step for this week</div>
                  <p style={{ fontSize: '12px', color: '#AAA', margin: 0, lineHeight: '1.5' }}>Before your call tomorrow, write out 3 objections they might raise and your response to each. Takes 20 minutes. Do it tonight.</p>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139,111,255,0.15)', border: '1px solid rgba(139,111,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: '11px', color: '#8B6FFF', fontWeight: '700' }}>02</span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Phase two</div>
                  <div className="serif" style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>Build & Launch</div>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                This is where most people stall — they build forever and never ship. We give you a deadline, a minimum viable product definition, and we hold you to it.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Build an MVP in 2 weeks, not 6 months', 'Your first sales conversation, scripted', 'Handle objections like a founder', 'Close your first paying customer'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(139,111,255,0.1)', border: '1px solid rgba(139,111,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '9px', color: '#8B6FFF', fontWeight: '700' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 3 — Growth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '100px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: '11px', color: '#A78BFA', fontWeight: '700' }}>03</span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Phase three</div>
                  <div className="serif" style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>Marketing & Sales</div>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                One customer isn't a business. We build the systems to get more — a repeatable sales process, content that attracts, referrals that compound.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Build a repeatable outreach process', 'Content that attracts your ideal customer', 'Turn customers into referral sources', 'Get to your first $1K month'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '9px', color: '#A78BFA', fontWeight: '700' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Evaluation screenshot */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(167,139,250,0.08)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                <span className="mono" style={{ fontSize: '9px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1, textAlign: 'center' }}>Step 16 — Your cold outreach email</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="mono" style={{ fontSize: '9px', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maya's Evaluation</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="serif" style={{ fontSize: '24px', fontWeight: '900', color: '#4ADE80' }}>84</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>/100</span>
                      <span className="mono" style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', textTransform: 'uppercase' }}>PASS</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                    {[{ d: 'Subject line', s: 18, m: 20 }, { d: 'Problem clarity', s: 17, m: 20 }, { d: 'Call to action', s: 16, m: 20 }, { d: 'Personalisation', s: 15, m: 20 }, { d: 'Social proof', s: 10, m: 20 }].map(d => (
                      <div key={d.d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#888' }}>{d.d}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#4ADE80' }}>{d.s}<span style={{ color: '#444', fontWeight: '400' }}>/{d.m}</span></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#AAA', lineHeight: '1.65', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ color: '#4ADE80', fontWeight: '600' }}>Strong: </span>You led with their problem, not your pitch. Subject line will get opens.
                    <br />
                    <span style={{ color: '#F59E0B', fontWeight: '600' }}>Fix: </span>Add one result from your first client. Even "helped one person get X" changes the conversion.
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(108,71,255,0.05)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '8px' }}>
                  <span className="mono" style={{ fontSize: '9px', color: '#8B6FFF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>This week's action: </span>
                  <span style={{ fontSize: '12px', color: '#AAA' }}>Add the social proof line and send to 10 people by Friday. Commit?</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4 — Revenue & Scale */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            {/* Progress screenshot */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(196,181,253,0.06)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                <span className="mono" style={{ fontSize: '9px', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1, textAlign: 'center' }}>Step 22 — Getting to $5K/month</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pathway Progress</span>
                    <span className="mono" style={{ fontSize: '9px', color: '#C4B5FD' }}>22/25 steps</span>
                  </div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: i < 22 ? '#6C47FF' : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[{ l: 'Revenue', v: '$4,200/mo', col: '#00C851' }, { l: 'Clients', v: '6 active', col: '#6C47FF' }, { l: 'Steps left', v: '3 to go', col: '#C4B5FD' }].map(s => (
                      <div key={s.l} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: s.col, marginBottom: '2px' }}>{s.v}</div>
                        <div className="mono" style={{ fontSize: '8px', color: '#444', textTransform: 'uppercase' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#8B6FFF', flexShrink: 0 }}>M</div>
                  <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>You're at $4,200/month. <span style={{ color: '#4ADE80', fontWeight: '600' }}>That's real money.</span> 3 steps left and you'll have a business that can replace your salary. Let's talk about what happens when you get there.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(196,181,253,0.15)', border: '1px solid rgba(196,181,253,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: '11px', color: '#C4B5FD', fontWeight: '700' }}>04</span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '9px', color: '#C4B5FD', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Phase four</div>
                  <div className="serif" style={{ fontSize: '22px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.01em' }}>Revenue & Scale</div>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                This is where your side hustle becomes a real business. We help you systematise, delegate, and decide if you're ready to go full-time.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Get to $5K per month consistently', 'Build systems that run without you', 'Hire your first help when ready', 'Go full-time when the numbers make sense'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(196,181,253,0.1)', border: '1px solid rgba(196,181,253,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '9px', color: '#C4B5FD', fontWeight: '700' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ fontSize: '10px', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>Why it works</div>
              <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '24px' }}>
                Most programs teach.<br />We make you launch.
              </h2>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', marginBottom: '32px' }}>
                The difference between people who launch and people who don't isn't knowledge — it's accountability and a clear next step. We give you both.
              </p>
              {[{ icon: '✓', text: 'One action step per session — specific, time-bound, committed' }, { icon: '✓', text: 'Real deliverables — cold emails, landing pages, sales scripts you actually use' }, { icon: '✓', text: 'Accountability loop — every session starts by checking last week\'s commitment' }, { icon: '✓', text: 'Pathway-specific — built for your exact business type, not generic advice' }].map(f => (
                <div key={f.text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ color: '#6C47FF', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>{f.icon}</span>
                  <span style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ n: '6 weeks', l: 'Average time to first revenue', col: '#6C47FF' }, { n: '94%', l: 'Students complete their pathway', col: '#00C851' }, { n: '$3.8K', l: 'Average first month revenue', col: '#FFD700' }, { n: '25', l: 'Clear steps per pathway', col: '#A78BFA' }].map(s => (
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
          <p style={{ fontSize: '17px', color: '#666', lineHeight: '1.75', marginBottom: '48px' }}>
            Pick a pathway. Follow 25 steps. Launch your business. The only thing standing between you and your first customer is starting.
          </p>
          <Link href="/apply" className="cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '17px 48px', borderRadius: '12px', background: '#6C47FF', color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700' }}>
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
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/apply" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>Apply</Link>
          <Link href="/auth/login" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/admin-login" style={{ fontSize: '12px', color: '#333', textDecoration: 'none' }}>Admin</Link>
        </div>
        <div className="mono" style={{ fontSize: '10px', color: '#333', letterSpacing: '0.06em' }}>© 2025 LaunchPilot School</div>
      </footer>
    </div>
  )
}
