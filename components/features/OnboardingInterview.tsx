'use client'

import { useState } from 'react'

interface Props {
  studentName: string
  onComplete: (answers: OnboardingAnswers) => void
}

export interface OnboardingAnswers {
  current_job: string
  why_pm: string
  dream_company: string
  biggest_fear: string
  hours_per_week: string
}

const QUESTIONS = [
  {
    id: 'current_job',
    question: "What's your current job or background?",
    placeholder: 'e.g. Marketing Manager at a startup, Software Engineer, Consultant, Founder...',
    hint: "This helps Maya connect every concept to your existing experience from day one.",
    emoji: '💼',
  },
  {
    id: 'why_pm',
    question: "Why did you join Mentogram? Real answer — not the LinkedIn version.",
    placeholder: "What are you actually trying to achieve? What's not working about where you are right now?",
    hint: "The more honest you are, the better Maya can coach you toward what actually matters to you.",
    emoji: '🎯',
  },
  {
    id: 'dream_company',
    question: "Which company, industry, or type of work do you most want to be doing in 2 years?",
    placeholder: 'e.g. Stripe, a B2B SaaS startup, running my own company, leading a growth team at a unicorn...',
    hint: "Maya will use this to make every example and task relevant to your specific goal.",
    emoji: '🏢',
  },
  {
    id: 'biggest_fear',
    question: "What's your biggest fear about making this change?",
    placeholder: "e.g. Not being good enough, starting over, not knowing where to begin, imposter syndrome...",
    hint: "Maya will address this directly throughout your journey — not ignore it.",
    emoji: '😬',
  },
  {
    id: 'hours_per_week',
    question: "How many hours per week can you realistically commit to learning?",
    placeholder: '',
    hint: "Be honest — 3 hours is fine. Maya will plan your pace accordingly and won't guilt you.",
    emoji: '⏱',
    options: ['2–3 hours', '4–5 hours', '6–8 hours', '10+ hours'],
  },
]

export default function OnboardingInterview({ studentName, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [animating, setAnimating] = useState(false)

  const firstName = studentName.split(' ')[0] || 'there'
  const q = QUESTIONS[currentQ]
  const isLast = currentQ === QUESTIONS.length - 1
  const progress = ((currentQ) / QUESTIONS.length) * 100

  const handleNext = async () => {
    if (!currentAnswer.trim()) return

    const newAnswers = { ...answers, [q.id]: currentAnswer }
    setAnswers(newAnswers)

    if (isLast) {
      setSaving(true)
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_job: newAnswers.current_job || '',
          why_pm: newAnswers.why_pm || '',
          dream_company: newAnswers.dream_company || '',
          biggest_fear: newAnswers.biggest_fear || '',
          hours_per_week: newAnswers.hours_per_week || '',
        }),
      })
      setSaving(false)
      onComplete(newAnswers as unknown as OnboardingAnswers)
    } else {
      setAnimating(true)
      setTimeout(() => {
        setCurrentQ(prev => prev + 1)
        setCurrentAnswer('')
        setAnimating(false)
      }, 300)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && q.options) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Logo */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
          Mento<span style={{ color: 'var(--accent2)' }}>gram</span>
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>
          {currentQ + 1} of {QUESTIONS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'var(--bg4)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
      </div>

      {/* Content */}
      <div style={{
        width: '100%', maxWidth: '560px',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
      }}>
        {currentQ === 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
              Before we begin
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '12px' }}>
              Hey {firstName}. I'm Maya.
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text2)', lineHeight: '1.65' }}>
              Before we start, I need to know who you are. Five quick questions. Your answers shape everything — the examples I use, the pace I set, the goals I push you toward. This is the only time I ask.
            </p>
          </div>
        )}

        {/* Question */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', marginBottom: '16px' }}>{q.emoji}</div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--text)', lineHeight: '1.35', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            {q.question}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.5' }}>{q.hint}</p>
        </div>

        {/* Answer */}
        {q.options ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => setCurrentAnswer(opt)}
                style={{
                  textAlign: 'left', padding: '14px 18px', borderRadius: '10px',
                  border: `1px solid ${currentAnswer === opt ? 'var(--accent)' : 'var(--border)'}`,
                  background: currentAnswer === opt ? 'rgba(255,106,0,0.08)' : 'var(--bg2)',
                  color: currentAnswer === opt ? 'var(--accent2)' : 'var(--text)',
                  fontSize: '15px', fontWeight: '500', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={q.placeholder}
            rows={4}
            autoFocus
            style={{
              width: '100%', background: 'var(--bg2)',
              border: '1px solid var(--border2)', borderRadius: '12px',
              padding: '16px 18px', fontSize: '15px', color: 'var(--text)',
              fontFamily: 'DM Sans, sans-serif', lineHeight: '1.7',
              resize: 'none', marginBottom: '24px',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
          />
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                width: i === currentQ ? '20px' : '6px',
                height: '6px', borderRadius: '3px',
                background: i < currentQ ? 'var(--accent)' : i === currentQ ? 'var(--accent)' : 'var(--bg4)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim() || saving}
            style={{
              padding: '12px 28px', borderRadius: '10px',
              background: currentAnswer.trim() ? 'var(--accent)' : 'var(--bg4)',
              border: 'none', fontSize: '15px', fontWeight: '700',
              color: currentAnswer.trim() ? '#000' : 'var(--text3)',
              cursor: currentAnswer.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Starting...' : isLast ? "Let's go →" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
