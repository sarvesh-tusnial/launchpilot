'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

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
    color: '#FF6A00',
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
    color: '#FF8C00',
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
    color: '#FF9A00',
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


// ── Chat types & data ──────────────────────────────────────────────────
type ChatStep = 'name' | 'category' | 'idea' | 'biz_name' | 'challenges' | 'stage' | 'generating' | 'done' | 'plan'

const CATEGORIES = [
  { id: 'saas', label: 'SaaS / Software' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'd2c', label: 'D2C / E-commerce' },
  { id: 'edtech', label: 'EdTech' },
  { id: 'fintech', label: 'FinTech' },
  { id: 'consulting', label: 'Consulting / Agency' },
  { id: 'community', label: 'Community / Content' },
  { id: 'other', label: 'Something else' },
]

const CHALLENGES = [
  { id: 'validation', label: 'Validating my idea' },
  { id: 'pmf', label: 'Finding product-market fit' },
  { id: 'revenue', label: 'Getting first revenue' },
  { id: 'marketing', label: 'Marketing & distribution' },
  { id: 'fundraising', label: 'Fundraising / investors' },
  { id: 'team', label: 'Building a team' },
  { id: 'product', label: 'Building the product' },
  { id: 'scale', label: 'Scaling what\'s working' },
]

const STAGES = [
  { id: '0-1', label: 'Just an idea — haven\'t started yet' },
  { id: '1-10', label: 'Early stage — some customers / revenue' },
  { id: '10-100', label: 'Growing — proven model, scaling now' },
]

const TRACK_NAMES: Record<string, string> = {
  validation: 'Idea Validation & PMF', pmf: 'Product-Market Fit',
  revenue: 'Revenue & Sales', marketing: 'Marketing & Growth',
  fundraising: 'Fundraising & Investors', team: 'Team Building',
  product: 'Product & Tech', scale: 'Scale & Operations',
}

const PLAN_MENTORS = [
  { name: 'Prantik Mazumdar', role: 'President, TiE Singapore', company: 'Exited Entrepreneur', img: '/images/mentors/prantik-mazumdar.jpg', tags: ['entrepreneurship','sales','GTM','startups'] },
  { name: 'Jason Kraus', role: 'Founder, Prepare4VC', company: 'Partner, EQx Fund', img: '/images/mentors/jason-kraus.jpg', tags: ['fundraising','VC','finance'] },
  { name: 'Renuka Belwalkar', role: 'Investor', company: 'Forbes Under 30 Scholar', img: '/images/mentors/renuka-belwalkar.jpg', tags: ['D2C','brand','marketing'] },
  { name: 'Yash Shah', role: 'GenAI Head India & SEA', company: 'Amazon Web Services', img: '/images/mentors/yash-shah.jpg', tags: ['AI','SaaS','product','tech'] },
  { name: 'Andrew Chow', role: 'Co-Founder', company: 'Asia Pro Ventures', img: '/images/mentors/andrew-chow.jpg', tags: ['marketplace','consumer','growth'] },
  { name: 'Daniel Ling', role: 'ex-VP Design', company: 'DBS & Lazada', img: '/images/mentors/daniel-ling.jpg', tags: ['product','growth','retention'] },
  { name: 'Rajesh Setty', role: '19x Author', company: 'Founder Institute', img: '/images/mentors/rajesh-shetty.jpg', tags: ['entrepreneurship','B2B','leadership'] },
  { name: 'Sarvash Malani', role: 'DeepTech VC', company: 'Temasek', img: '/images/mentors/sarvash-malani.jpg', tags: ['fundraising','SaaS','AI','seed'] },
  { name: 'Justin Strackany', role: 'LP at GTMFund', company: '3 exits (Vista)', img: '/images/mentors/justin-strackany.jpg', tags: ['GTM','sales','B2B'] },
  { name: 'Gaurav Thakkar', role: 'Principal VC', company: 'Silicon Road', img: '/images/mentors/gaurav-thakkar.jpg', tags: ['VC','India','consumer'] },
  { name: 'John Lim', role: 'Partner', company: 'Meet Ventures SG', img: '/images/mentors/john-lim.jpg', tags: ['brand','D2C','marketing'] },
  { name: 'Sarvesh Tusnial', role: 'Co-Founder, LaunchPilot', company: 'ex-EY', img: '/images/mentors/sarvesh-tusnial.jpg', tags: ['edtech','sales','revenue'] },
]

const PLAN_SPRINTS = [
  { name: 'Design Thinking', desc: 'Customer empathy, problem framing, rapid prototyping.', tags: ['validation','pmf','product'] },
  { name: 'Product Sprint', desc: 'From idea to MVP — roadmap, prioritisation, launch planning.', tags: ['product','pmf','validation'] },
  { name: 'Marketing Sprint', desc: 'Positioning, content, paid and organic channels.', tags: ['marketing','revenue','scale'] },
  { name: 'Sales Sprint', desc: 'B2B and B2C sales frameworks, outreach, closing techniques.', tags: ['revenue','marketing'] },
  { name: 'Fundraising Sprint', desc: 'Investor narrative, pitch deck, seed round mechanics.', tags: ['fundraising'] },
  { name: 'Leadership Sprint', desc: 'Hiring, culture, managing a founding team.', tags: ['team','scale'] },
  { name: 'AI Tools Sprint', desc: 'Automate your business with AI tools and workflows.', tags: ['product','scale'] },
  { name: 'Growth Hacking', desc: 'Referral loops, SEO, viral mechanics, compounding growth.', tags: ['marketing','scale','revenue'] },
]

const PLAN_SESSIONS = [
  { theme: 'Investor Roundtable', desc: 'Pitch to active seed investors and get live feedback on your narrative.' },
  { theme: 'Founder Fireside', desc: 'Closed-room with founders who crossed ₹1Cr ARR — unfiltered stories.' },
  { theme: 'GTM Masterclass', desc: 'Go-to-market workshop with founders who launched across India and SEA.' },
  { theme: 'PMF Lab', desc: 'Validate your PMF hypothesis with real customer interviews, facilitated live.' },
  { theme: 'Sales Simulation Day', desc: 'Role-play 10 real sales scenarios — cold calls, demos, objection handling.' },
]

async function generateRoadmapPlan(userData: { name: string; idea: string; category: string; bizName: string; challenges: string[]; stage: string }) {
  const trackNames = userData.challenges.slice(0, 3).map(c => TRACK_NAMES[c] || c)
  const mentors = PLAN_MENTORS.filter(m => userData.challenges.some(c => m.tags.some(t => t.includes(c) || c.includes(t))))
  // Always show at least 5 — top up from full list if needed
  const mentorKeys = new Set(mentors.map(m => m.name))
  const topUp = PLAN_MENTORS.filter(m => !mentorKeys.has(m.name))
  const finalMentors = [...mentors, ...topUp].slice(0, 5)
  const sprints = PLAN_SPRINTS.filter(s => userData.challenges.some(c => s.tags.includes(c))).slice(0, 6)
  const finalSprints = sprints.length >= 3 ? sprints : PLAN_SPRINTS.slice(0, 6)

  const res = await fetch('/api/generate-roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...userData, trackNames }),
  })
  const parsed = await res.json()
  if (parsed.error) throw new Error(parsed.error)

  return {
    ...parsed,
    tracks: trackNames.map((name: string, i: number) => ({ name, description: parsed.track_descriptions?.[i] || '' })),
    mentors: finalMentors,
    sprints: finalSprints,
    sessions: PLAN_SESSIONS,
  }
}

// ── Maya Chat Widget ───────────────────────────────────────────────────
function MayaChatWidget({ onPlanGenerated }: { onPlanGenerated: (plan: any, userData: any) => void }) {
  const [step, setStep] = useState<ChatStep>('name')
  const [name, setName] = useState('')
  const [idea, setIdea] = useState('')
  const [category, setCategory] = useState('')
  const [bizName, setBizName] = useState('')
  const [challenges, setChallenges] = useState<string[]>([])
  const [inputVal, setInputVal] = useState('')
  const [messages, setMessages] = useState<{ role: 'maya' | 'user'; text: string }[]>([
    { role: 'maya', text: "Hey! I'm Maya. Answer 6 quick questions and I'll build your personalised launch roadmap — mentors, milestones, sprints, all tailored to your idea. What's your name?" }
  ])
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, step])

  const addMsg = (role: 'maya' | 'user', text: string) => setMessages(m => [...m, { role, text }])

  const handleSend = () => {
    const val = inputVal.trim()
    if (!val) return
    setInputVal('')
    if (step === 'name') {
      setName(val); addMsg('user', val)
      addMsg('maya', `Great to meet you, ${val.split(' ')[0]}! What type of business are you building?`)
      setStep('category')
    } else if (step === 'idea') {
      setIdea(val); addMsg('user', val)
      addMsg('maya', "Got it. Does your business have a name yet?")
      setStep('biz_name')
    } else if (step === 'biz_name') {
      const bn = val === 'skip' ? 'My Business' : val
      setBizName(bn); addMsg('user', val === 'skip' ? 'No name yet' : val)
      addMsg('maya', "Got it. What are your 3 biggest challenges right now? Pick up to 3 — these become your tracks.")
      setStep('challenges')
    }
  }

  const handleCategory = (cat: typeof CATEGORIES[0]) => {
    setCategory(cat.label); addMsg('user', cat.label)
    addMsg('maya', 'Perfect. Give me a one-liner — what is your business idea?')
    setStep('idea')
  }

  const toggleChallenge = (id: string) => {
    setChallenges(prev => prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const handleChallengesDone = () => {
    if (challenges.length === 0) return
    addMsg('user', challenges.map(c => CHALLENGES.find(ch => ch.id === c)?.label || c).join(', '))
    addMsg('maya', 'These become your 3 learning tracks. Last question — what stage are you at?')
    setStep('stage')
  }

  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  const handleStage = async (s: typeof STAGES[0]) => {
    addMsg('user', s.label)
    addMsg('maya', 'Building your personalised roadmap now...')
    setStep('generating')
    try {
      const result = await generateRoadmapPlan({ name, idea, category, bizName, challenges, stage: s.id })
      setGeneratedPlan(result)
      addMsg('maya', `Your personalised launch roadmap for ${bizName !== 'My Business' ? bizName : 'your business'} is ready, ${name.split(' ')[0]}!`)
      setStep('done')
    } catch {
      addMsg('maya', 'Something went wrong. Please try again.')
      setStep('stage')
    }
  }

  const stepsList: ChatStep[] = ['name','category','idea','biz_name','challenges','stage','done']
  const currentStepIdx = stepsList.indexOf(step)

  return (
    <div style={{ width: '100%', maxWidth: '640px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 60px rgba(255,106,0,0.06)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,106,0,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display,serif' }}>M</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6' }}>Maya · LaunchPilot AI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#4ADE80', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Online · LaunchPilot AI</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
          {stepsList.map((_, i) => (
            <div key={i} style={{ width: i === currentStepIdx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i < currentStepIdx ? '#FF6A00' : i === currentStepIdx ? '#FF8C00' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} style={{ height: '220px', overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-start', width: '100%' }}>
            {m.role === 'maya' && (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>M</div>
            )}
            <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? '#FF6A00' : 'rgba(255,255,255,0.04)', border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', color: m.role === 'user' ? '#fff' : '#E8E6E0', fontSize: '13px', lineHeight: '1.65', textAlign: 'left' }}>
              {m.text}
            </div>
          </div>
        ))}
        {step === 'generating' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#FF9A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>M</div>
            <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', borderRadius: '4px 14px 14px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[0,1,2].map(d => <div key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6A00', animation: `pulse 1.2s ${d * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px' }}>
        {step === 'category' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => handleCategory(c)} style={{ padding: '9px 14px', borderRadius: '8px', background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.2)', color: '#C8C4BC', fontSize: '12px', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}>{c.label}</button>
            ))}
          </div>
        )}
        {step === 'challenges' && (
          <div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '8px' }}>Pick up to 3 — these become your tracks</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {CHALLENGES.map(c => {
                const sel = challenges.includes(c.id)
                return (
                  <button key={c.id} onClick={() => toggleChallenge(c.id)} style={{ padding: '9px 12px', borderRadius: '8px', background: sel ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? 'rgba(255,106,0,0.4)' : 'rgba(255,255,255,0.08)'}`, color: sel ? '#C8C4BC' : '#777', fontSize: '12px', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '13px', height: '13px', borderRadius: '3px', border: sel ? '2px solid #FF8C00' : '1px solid rgba(255,255,255,0.2)', background: sel ? '#FF6A00' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff' }}>{sel ? '✓' : ''}</span>
                    {c.label}
                  </button>
                )
              })}
            </div>
            <button onClick={handleChallengesDone} disabled={challenges.length === 0} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: challenges.length > 0 ? '#FF6A00' : 'rgba(255,106,0,0.2)', color: challenges.length > 0 ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: 'inherit', fontWeight: '700', fontSize: '14px', cursor: challenges.length > 0 ? 'pointer' : 'default' }}>
              {challenges.length === 0 ? 'Select your challenges' : `Continue with ${challenges.length} challenge${challenges.length > 1 ? 's' : ''} →`}
            </button>
          </div>
        )}
        {step === 'stage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {STAGES.map(s => (
              <button key={s.id} onClick={() => handleStage(s)} style={{ padding: '11px 16px', borderRadius: '10px', background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.2)', color: '#C8C4BC', fontSize: '13px', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}>{s.label}</button>
            ))}
          </div>
        )}
        {step === 'done' && generatedPlan && (
          <button onClick={() => onPlanGenerated(generatedPlan, { name, bizName })}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#FF6A00', color: '#fff', fontFamily: 'inherit', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            View your personalised roadmap →
          </button>
        )}
        {(step === 'name' || step === 'idea' || step === 'biz_name') && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={step === 'name' ? 'Your first name...' : step === 'idea' ? 'One-liner — what are you building?' : 'Business name...'}
              autoFocus style={{ flex: 1, padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#F0EDE6', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
            {step === 'biz_name' && (
              <button onClick={() => { setInputVal('skip'); setTimeout(handleSend, 0) }} style={{ padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Mono,monospace', whiteSpace: 'nowrap' as const }}>No name yet</button>
            )}
            <button onClick={handleSend} disabled={!inputVal.trim()} style={{ width: '42px', height: '42px', borderRadius: '10px', border: 'none', background: inputVal.trim() ? '#FF6A00' : 'rgba(255,106,0,0.3)', color: '#fff', fontSize: '16px', cursor: inputVal.trim() ? 'pointer' : 'default', flexShrink: 0 }}>→</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Plan page (full screen overlay) ───────────────────────────────────
function RoadmapPlanPage({ plan, name, bizName, onBack }: { plan: any; name: string; bizName: string; onBack: () => void }) {
  const firstName = name.split(' ')[0]
  return (
    <div style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans',system-ui,sans-serif", color: '#E8E6E0' }}>
      <style>{`
        .plan-serif{font-family:'Fraunces',Georgia,serif}
        .plan-mono{font-family:'DM Mono',monospace}
        @keyframes planFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .plan-fade{animation:planFadeUp 0.5s ease both}
        .p-d1{animation-delay:0.1s}.p-d2{animation-delay:0.2s}.p-d3{animation-delay:0.3s}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        .plan-sprints{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .plan-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
        @media(max-width:768px){.plan-sprints{grid-template-columns:1fr!important}.plan-timeline{grid-template-columns:1fr 1fr!important}.plan-pad{padding:32px 20px 80px!important}.plan-hbar{padding:14px 20px!important}}
        @media(max-width:480px){.plan-timeline{grid-template-columns:1fr!important}}
      `}</style>

      {/* Top bar */}
      <div className="plan-hbar" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 48px', background: 'rgba(5,3,9,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF6A00' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6' }}>{bizName === 'My Business' ? 'Your' : bizName} Roadmap</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', color: '#444', textTransform: 'uppercase' as const, letterSpacing: '0.16em' }}>Powered by LaunchPilot</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onBack} style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Mono,monospace' }}>← Start over</button>
          <Link href="/apply" style={{ padding: '9px 20px', borderRadius: '8px', background: '#FF6A00', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Apply Now →</Link>
        </div>
      </div>

      <div className="plan-pad" style={{ maxWidth: '780px', margin: '0 auto', padding: '52px 48px 100px' }}>

        {/* Hero */}
        <div className="plan-fade" style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '16px' }}>Your personalised roadmap</div>
          <h1 className="plan-serif" style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: '900', color: '#F0EDE6', letterSpacing: '-0.03em', lineHeight: '1.08', marginBottom: '14px' }}>
            Hey {firstName},<br /><span style={{ color: '#FF6A00', fontStyle: 'italic' }}>{plan.headline || 'your launch roadmap is ready.'}</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#AAA', lineHeight: '1.8', maxWidth: '520px' }}>
            Based on your idea and challenges — here's exactly what LaunchPilot will help you build, tailored to {bizName === 'My Business' ? 'your business' : bizName}.
          </p>
        </div>

        {/* Tracks */}
        <div className="plan-fade p-d1" style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Your 3 focus areas</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>Built around your biggest challenges</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plan.tracks?.map((t: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(255,106,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', fontWeight: '700', color: '#FF6A00' }}>0{i+1}</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EDE6', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>{t.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentors */}
        <div className="plan-fade p-d1" style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#1D9E75', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Your mentors</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>From 100+ mentors, shortlisted for {bizName === 'My Business' ? 'you' : bizName}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {plan.mentors?.slice(0, 5).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(29,158,117,0.25)', flexShrink: 0, background: 'rgba(29,158,117,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.img ? <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                    : <span style={{ fontSize: '13px', fontWeight: '700', color: '#1D9E75' }}>{m.name?.[0]}</span>}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6' }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{m.role} · {m.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sprints */}
        <div className="plan-fade p-d2" style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#BA7517', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Monthly sprints</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>6 sprints lined up — 4 weeks each</div>
          <div className="plan-sprints">
            {plan.sprints?.slice(0, 6).map((s: any, i: number) => (
              <div key={i} style={{ padding: '13px 15px', background: i%2===0 ? 'rgba(186,117,23,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', borderTop: `2px solid ${i%2===0 ? 'rgba(186,117,23,0.4)' : 'rgba(255,106,0,0.3)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                  <div style={{ width: '17px', height: '17px', borderRadius: '50%', background: i%2===0 ? 'rgba(186,117,23,0.15)' : 'rgba(255,106,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '7px', fontWeight: '700', color: i%2===0 ? '#BA7517' : '#FF8C00' }}>{String(i+1).padStart(2,'0')}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#F0EDE6' }}>{s.name}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.55' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div className="plan-fade p-d2" style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Experiential sessions</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>Live sessions every Sunday — these 5 are most useful for you</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {plan.sessions?.slice(0, 5).map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '8px', fontWeight: '700', color: '#FF8C00' }}>{String(i+1).padStart(2,'0')}</span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EDE6', marginBottom: '2px' }}>{s.theme}</div>
                  <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.5' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="plan-fade p-d2" style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#60A5FA', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Tools & deals</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>500+ tools — free or heavily discounted</div>
          <div style={{ padding: '16px 18px', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px' }}>
            <p style={{ fontSize: '13px', color: '#AAA', lineHeight: '1.7' }}>{plan.tools_highlight || `As a LaunchPilot member you get access to 500+ tools and software deals — everything you need to build, launch and grow.`}</p>
          </div>
        </div>

        {/* Timeline */}
        {plan.timeline && (
          <div className="plan-fade p-d3" style={{ marginBottom: '48px' }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#AAA', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Your 6-month northstar</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>The journey ahead</div>
            <div className="plan-timeline">
              {plan.timeline.map((t: any, i: number) => {
                const cols = ['#FF8C00','#FF7A00','#FF6A00','#1D9E75','#17876A','#117055']
                const col = cols[i] || '#FF8C00'
                return (
                  <div key={i} style={{ margin: '0 3px 6px', padding: '13px 12px', background: `${col}08`, border: `1px solid ${col}20`, borderRadius: '9px', borderTop: `2px solid ${col}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${col}18`, border: `1px solid ${col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '7px', fontWeight: '700', color: col }}>M{i+1}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#F0EDE6', marginBottom: '3px', lineHeight: '1.3' }}>{t.milestone}</div>
                    <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.5' }}>{t.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Critical questions */}
        {plan.critical_questions && (
          <div className="plan-fade p-d3" style={{ marginBottom: '56px' }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '9px', color: '#D85A30', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '6px' }}>Before you begin</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#E8E6E0', marginBottom: '14px' }}>Questions your business must answer</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {plan.critical_questions.map((q: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', background: 'rgba(216,90,48,0.04)', border: '1px solid rgba(216,90,48,0.12)', borderRadius: '9px' }}>
                  <span style={{ fontSize: '15px', color: '#D85A30', flexShrink: 0 }}>?</span>
                  <span style={{ fontSize: '13px', color: '#E8E6E0', fontWeight: '500' }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: '40px', background: 'rgba(255,106,0,0.04)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '20px', textAlign: 'center' }}>
          <div className="plan-serif" style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: '900', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '10px' }}>This roadmap is waiting for you.</div>
          <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.7', maxWidth: '400px', margin: '0 auto 24px' }}>Apply for a spot on LaunchPilot — we review every application within 24 hours.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', borderRadius: '10px', background: '#FF6A00', color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: '700' }}>Apply for a spot →</Link>
            <button onClick={onBack} style={{ padding: '14px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#AAA', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Start over</button>
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '10px', color: '#333', marginTop: '14px', letterSpacing: '0.06em' }}>Rolling admissions · Review within 24 hours</div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [roadmapPlan, setRoadmapPlan] = useState<any>(null)
  const [planUserData, setPlanUserData] = useState<{ name: string; bizName: string } | null>(null)

  if (roadmapPlan && planUserData) {
    return <RoadmapPlanPage plan={roadmapPlan} name={planUserData.name} bizName={planUserData.bizName} onBack={() => { setRoadmapPlan(null); setPlanUserData(null) }} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050309', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#F0EDE6', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .d1{animation-delay:0.1s} .d2{animation-delay:0.25s} .d3{animation-delay:0.4s}
        .pw-card:hover { border-color: rgba(255,106,0,0.35) !important; transform: translateY(-2px); background: rgba(255,106,0,0.06) !important; }
        .pw-card { transition: all 0.18s; }
        .cta:hover { opacity:0.88; transform:translateY(-1px); }
        .cta { transition: all 0.15s; }
        .ghost:hover { background: rgba(255,255,255,0.06) !important; }
        .ghost { transition: background 0.15s; }
        
        /* MOBILE */
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .hero-stats { gap: 20px !important; flex-wrap: wrap !important; }
          .hero-stats > div { min-width: 80px !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns a { text-align: center !important; justify-content: center !important; }
          .pw-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .journey-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .journey-grid-reverse { grid-template-columns: 1fr !important; gap: 40px !important; }
          .journey-grid-reverse > div:first-child { order: 2; }
          .journey-grid-reverse > div:last-child { order: 1; }
          .roi-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .roi-stats { grid-template-columns: 1fr 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; align-items: center !important; text-align: center !important; }
          .section-pad { padding: 60px 16px !important; }
          .hero-section { padding: 80px 16px 40px !important; }
          .nav-pad { padding: 0 16px !important; }
          .screenshot-hide { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', background: 'rgba(5,3,9,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="nav-pad">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="serif" style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>Launch<span style={{ color: '#FF6A00' }}>Pilot</span></div>
          <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '2px' }}>School</span>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', gap: '10px' }}>
          <Link href="/auth/login" className="ghost" style={{ padding: '8px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#AAA', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Sign In</Link>
          <Link href="/apply" className="cta" style={{ padding: '9px 22px', borderRadius: '8px', background: '#FF6A00', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Apply Now →</Link>
        </div>
        <Link href="/apply" className="nav-mobile-btn cta" style={{ display: 'none', padding: '9px 18px', borderRadius: '8px', background: '#FF6A00', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Apply →</Link>
      </nav>

      {/* HERO */}
      <section className='hero-section' style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center', padding: '100px 24px 60px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(255,106,0,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '860px' }}>
          <div className="fade-up d1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.25)', marginBottom: '32px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF6A00', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize: '10px', color: '#FF8C00', textTransform: 'uppercase', letterSpacing: '0.16em' }}>10 pathways · idea to first revenue</span>
          </div>
          <h1 className="serif fade-up d2" style={{ fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: '900', lineHeight: '1.04', letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Stop planning.<br /><span style={{ color: '#FF6A00', fontStyle: 'italic' }}>Start launching with a personal AI mentor.</span>
          </h1>
          <p className="fade-up d3" style={{ fontSize: '16px', color: '#777', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 24px', fontWeight: '400' }}>
            Answer 6 questions — Maya builds your personalised launch roadmap in seconds.
          </p>
          <div className="fade-up d3" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '48px' }}>
            <MayaChatWidget onPlanGenerated={(plan, userData) => { setRoadmapPlan(plan); setPlanUserData(userData) }} />
          </div>
          <div className='hero-stats' style={{ display: 'flex', gap: '48px', justifyContent: 'center', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[{ n: '10', l: 'Launch Pathways' }, { n: '24/7', l: 'Available AI Coach' }, { n: '6 wks', l: 'Avg. time to revenue' }, { n: '94%', l: 'Completion rate' }].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: '26px', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.n}</div>
                <div className="mono" style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATHWAYS — right below hero */}
      <section className='section-pad' style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>Don't have an idea yet?</div>
            <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              Choose a predefined pathway.<br /><span style={{ color: '#FF6A00', fontStyle: 'italic' }}>Follow, launch and earn.</span>
            </h2>
            <p style={{ fontSize: '15px', color: '#666', marginTop: '16px', maxWidth: '480px', margin: '16px auto 0', lineHeight: '1.7' }}>
              10 battle-tested pathways — each with 25 structured steps from idea to first paying customer.
            </p>
          </div>
          <div className='pw-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
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
                    <span className="mono" style={{ fontSize: '8px', color: '#FF8C00' }}>{p.timeToRevenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/apply" className="cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '10px', background: '#FF6A00', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
              Choose your pathway →
            </Link>
          </div>
        </div>
      </section>

      {/* HYBRID LEARNING */}
      <section className='section-pad' style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#060608' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>How it works</div>
            <h2 className="serif" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.08', marginBottom: '16px' }}>
              AI coaching meets<br /><span style={{ color: '#FF6A00', fontStyle: 'italic' }}>real-world learning.</span>
            </h2>
            <p style={{ fontSize: '16px', color: '#666', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
              LaunchPilot is not a course. It's a structured system combining a 24/7 AI co-pilot with live mentor sessions, weekly sprints, and Sunday experiential workshops.
            </p>
          </div>

          {/* THREE PILLARS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '80px' }}>
            {[
              {
                icon: '🤖',
                label: 'AI Co-Pilot',
                color: '#FF6A00',
                title: 'Maya — your 24/7 AI mentor',
                desc: 'Maya teaches you every concept through an 8-stage structured session — hook, teach, quiz, task, action step. She knows your business, remembers every session, and is available any time.',
                tags: ['8-stage learning per concept', 'Full session memory', 'Instant task evaluation', 'Available at 3am'],
              },
              {
                icon: '🎤',
                label: 'Live Mentors',
                color: '#4ADE80',
                title: 'Weekly sessions with real practitioners',
                desc: 'Every week, live sessions with founders and operators who have done it. Not theory — real war stories, live Q&A, direct feedback on your work.',
                tags: ['100+ global mentors', 'Weekly live sessions', 'Direct Q&A', 'Real founder stories'],
              },
              {
                icon: '🌍',
                label: 'Sunday Sessions',
                color: '#60A5FA',
                title: 'Experiential workshops every Sunday',
                desc: 'Hands-on online workshops every Sunday — investor roundtables, sales simulations, GTM masterclasses, PMF labs. Learning by doing, not watching.',
                tags: ['Every Sunday online', 'Investor roundtables', 'Sales simulations', 'GTM masterclasses'],
              },
            ].map((p, i) => (
              <div key={i} style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '18px', borderTop: `3px solid ${p.color}` }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{p.icon}</div>
                <div className="mono" style={{ fontSize: '9px', color: p.color, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px' }}>{p.label}</div>
                <div className="serif" style={{ fontSize: '18px', fontWeight: '700', color: '#F0EDE6', marginBottom: '12px', lineHeight: '1.3' }}>{p.title}</div>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.7', marginBottom: '18px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {p.tags.map((t, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: p.color, fontSize: '10px', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '12px', color: '#AAA' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI CO-PILOT DEEP DIVE — screenshots */}
          <div style={{ marginBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '10px' }}>AI Co-Pilot · Deep dive</div>
              <h3 className="serif" style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                An AI mentor who actually knows you.
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* Screenshot 1 — Hook stage */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                  <span className="mono" style={{ fontSize: '9px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1, textAlign: 'center' }}>Maya · Stage 1 — Hook</span>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FF8C00', flexShrink: 0 }}>M</div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Before you build anything, let's find out if people will actually pay for this. I'm giving you a 5-minute challenge.</p>
                    </div>
                  </div>
                  <div style={{ marginLeft: '36px', background: 'rgba(249,112,102,0.05)', border: '1px solid rgba(249,112,102,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                    <div className="mono" style={{ fontSize: '9px', color: '#F97066', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>⏱ Timer Challenge · 5 minutes</div>
                    <p style={{ fontSize: '12px', color: '#AAA', lineHeight: '1.6', margin: 0 }}>Find 3 people who have this problem right now. Not friends. Real strangers. Where do they complain online?</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '12px 4px 12px 12px', padding: '10px 14px', maxWidth: '75%' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.6', margin: 0 }}>Found 5 Reddit threads where people complain about exactly this problem.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FF8C00', flexShrink: 0 }}>M</div>
                    <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}><span style={{ color: '#4ADE80', fontWeight: '600' }}>That's real signal.</span> Moving to Stage 2.</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Stage 1 of 8 · Hook</div>
                </div>
              </div>

              {/* Screenshot 2 — Accountability */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                  <span className="mono" style={{ fontSize: '9px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1, textAlign: 'center' }}>Maya · Stage 2 — Accountability</span>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FF8C00', flexShrink: 0 }}>M</div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Last session you committed to contacting 5 potential customers. <span style={{ color: '#F59E0B', fontWeight: '600' }}>Did you do it?</span></p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '12px 4px 12px 12px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.6', margin: 0 }}>I contacted 3. Got 2 replies. One wants a call tomorrow.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FF8C00', flexShrink: 0 }}>M</div>
                    <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>Two replies from cold outreach is strong. Let's prepare you to close the call tomorrow.</p>
                    </div>
                  </div>
                  <div style={{ marginLeft: '36px', padding: '10px 12px', background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '8px' }}>
                    <div className="mono" style={{ fontSize: '9px', color: '#FF8C00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>This week's action</div>
                    <p style={{ fontSize: '12px', color: '#AAA', margin: 0 }}>Write 3 objections they might raise and your responses. Do it tonight.</p>
                  </div>
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Stage 2 of 8 · Reality Check</div>
                </div>
              </div>

              {/* Screenshot 3 — Task evaluation */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                  <span className="mono" style={{ fontSize: '9px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1, textAlign: 'center' }}>Maya · Stage 6 — Task Evaluation</span>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="mono" style={{ fontSize: '9px', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Maya's Evaluation</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="serif" style={{ fontSize: '24px', fontWeight: '900', color: '#4ADE80' }}>84</span>
                        <span style={{ fontSize: '11px', color: '#888' }}>/100</span>
                        <span className="mono" style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', textTransform: 'uppercase' }}>PASS</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                      {[['Problem Clarity', 18, 20],['Business Thinking', 17, 20],['Execution', 16, 20],['Communication', 15, 20],['User Insight', 10, 20]].map(([d, s, m]) => (
                        <div key={d as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px' }}>
                          <span style={{ fontSize: '10px', color: '#888' }}>{d}</span>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#4ADE80' }}>{s}<span style={{ color: '#444' }}>/{m}</span></span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#AAA', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                      <span style={{ color: '#4ADE80', fontWeight: '600' }}>Strong: </span>You led with the customer's problem, not your solution.<br />
                      <span style={{ color: '#F59E0B', fontWeight: '600' }}>Fix: </span>Add one line of social proof to boost conversion.
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Stage 6 of 8 · Execution Task</div>
                </div>
              </div>

              {/* Screenshot 4 — Progress */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>{['#F97066','#F59E0B','#4ADE80'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.5 }} />)}</div>
                  <span className="mono" style={{ fontSize: '9px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1, textAlign: 'center' }}>Maya · Stage 8 — Action Step</span>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#FF8C00', flexShrink: 0 }}>M</div>
                    <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '12px', color: '#CCC', lineHeight: '1.65', margin: 0 }}>You're at <span style={{ color: '#4ADE80', fontWeight: '600' }}>$4,200/month</span>. 3 steps left and this business can replace your salary.</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="mono" style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase' }}>Pathway Progress</span>
                      <span className="mono" style={{ fontSize: '9px', color: '#FF8C00' }}>22/25 steps</span>
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: '5px', borderRadius: '2px', background: i < 22 ? '#FF6A00' : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '8px' }}>
                    <div className="mono" style={{ fontSize: '9px', color: '#FF8C00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Your action this week</div>
                    <p style={{ fontSize: '12px', color: '#AAA', margin: 0 }}>Hire one part-time person for customer support. By Friday. Can you commit?</p>
                  </div>
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="mono" style={{ fontSize: '9px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Stage 8 of 8 · Bridge</div>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE MENTOR SESSION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '64px' }}>
            <div>
              <div className="mono" style={{ fontSize: '9px', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>Real mentors · Live sessions</div>
              <h3 className="serif" style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: '700', color: '#F0EDE6', letterSpacing: '-0.02em', lineHeight: '1.15', marginBottom: '16px' }}>
                Weekly sessions with people who have actually done it.
              </h3>
              <p style={{ fontSize: '15px', color: '#888', lineHeight: '1.8', marginBottom: '24px' }}>
                Every week, LaunchPilot hosts live sessions with founders, investors and operators from our 100+ mentor network. Real stories, direct Q&A, no slides, no theory.
              </p>
              {[
                { label: 'Prantik Mazumdar', sub: 'President, TiE Singapore · Exited Founder', color: '#FF6A00' },
                { label: 'Jason Kraus', sub: 'Partner, EQx Fund · Prepare4VC', color: '#4ADE80' },
                { label: 'Yash Shah', sub: 'GenAI Head India & SEA · AWS', color: '#60A5FA' },
                { label: 'Sarvash Malani', sub: 'DeepTech VC · Temasek', color: '#F59E0B' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${m.color}18`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: m.color }}>{m.label[0]}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px' }}>
              <div className="mono" style={{ fontSize: '9px', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>This week's live sessions</div>
              {[
                { day: 'Mon', title: 'How I got to $100K ARR in 6 months', mentor: 'Prantik Mazumdar', type: 'Founder Story' },
                { day: 'Wed', title: 'Seed round mechanics — what investors actually look for', mentor: 'Jason Kraus', type: 'Investor AMA' },
                { day: 'Fri', title: 'Building with AI — what actually works right now', mentor: 'Yash Shah', type: 'Masterclass' },
                { day: 'Sun', title: 'Sales Simulation — cold call to close', mentor: 'Live facilitated', type: 'Sunday Session' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '9px', color: '#888', fontWeight: '700' }}>{s.day}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#E8E6E0', marginBottom: '2px' }}>{s.title}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>{s.mentor}</div>
                  </div>
                  <span className="mono" style={{ fontSize: '8px', color: s.type === 'Sunday Session' ? '#60A5FA' : '#FF8C00', background: s.type === 'Sunday Session' ? 'rgba(96,165,250,0.1)' : 'rgba(255,140,0,0.1)', border: `1px solid ${s.type === 'Sunday Session' ? 'rgba(96,165,250,0.2)' : 'rgba(255,140,0,0.2)'}`, padding: '3px 8px', borderRadius: '4px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.type}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ROI */}
      <section className='section-pad' style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className='journey-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ fontSize: '10px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>Why it works</div>
              <h2 className="serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '24px' }}>
                Most programs teach.<br />We make you launch.
              </h2>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.8', marginBottom: '32px' }}>
                The difference between people who launch and people who don't isn't knowledge — it's accountability and a clear next step. We give you both.
              </p>
              {[{ icon: '✓', text: 'One action step per session — specific, time-bound, committed' }, { icon: '✓', text: 'Real deliverables — cold emails, landing pages, sales scripts you actually use' }, { icon: '✓', text: 'Accountability loop — every session starts by checking last week\'s commitment' }, { icon: '✓', text: 'Pathway-specific — built for your exact business type, not generic advice' }].map(f => (
                <div key={f.text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ color: '#FF6A00', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>{f.icon}</span>
                  <span style={{ fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ n: '6 weeks', l: 'Average time to first revenue', col: '#FF6A00' }, { n: '94%', l: 'Students complete their pathway', col: '#00C851' }, { n: '$3.8K', l: 'Average first month revenue', col: '#FFD700' }, { n: '25', l: 'Clear steps per pathway', col: '#FF9A00' }].map(s => (
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
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(255,106,0,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '24px' }}>Limited spots per cohort</div>
          <h2 className="serif" style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.05', marginBottom: '24px' }}>
            Your business<br />won't launch itself.
          </h2>
          <p style={{ fontSize: '17px', color: '#666', lineHeight: '1.75', marginBottom: '48px' }}>
            Pick a pathway. Follow 25 steps. Launch your business. The only thing standing between you and your first customer is starting.
          </p>
          <Link href="/apply" className="cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '17px 48px', borderRadius: '12px', background: '#FF6A00', color: '#fff', textDecoration: 'none', fontSize: '17px', fontWeight: '700' }}>
            Apply for a spot →
          </Link>
          <div className="mono" style={{ fontSize: '11px', color: '#333', marginTop: '16px', letterSpacing: '0.06em' }}>Rolling admissions · Review within 24 hours</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='footer-inner'>
        <div className="serif" style={{ fontSize: '16px', fontWeight: '700', color: '#F0EDE6' }}>
          Launch<span style={{ color: '#FF6A00' }}>Pilot</span>
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
