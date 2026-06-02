'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Concept, Profile, StudentConcept, Lesson } from '@/types'

interface Props {
  concept: Concept
  profile: Profile | null
  studentConcept: StudentConcept
  existingLesson: Lesson | null
  priorGaps: string[]
}

const SECTIONS = [
  { key: 'core_explanation', label: 'Core Concept', icon: '◈' },
  { key: 'real_world_analogy', label: 'Real-World Analogy', icon: '◎' },
  { key: 'anti_pattern', label: 'What Bad Looks Like', icon: '⚠' },
  { key: 'product_moment', label: 'Product Moment', icon: '◷' },
  { key: 'challenge_question', label: 'Challenge Question', icon: '?' },
]

export default function LessonClient({ concept, profile, studentConcept, existingLesson, priorGaps }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(existingLesson)
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [challengeAnswer, setChallengeAnswer] = useState('')
  const [submittingChallenge, setSubmittingChallenge] = useState(false)
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const router = useRouter()

  const generateLesson = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: concept.id,
          studentLevel: studentConcept.level,
          domain: profile?.domain || 'B2C',
          priorGaps,
          teachingStrategy: studentConcept.teaching_strategy,
        }),
      })
      const data = await res.json()
      if (data.lesson) setLesson(data.lesson)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const submitChallenge = async () => {
    if (!challengeAnswer.trim() || !lesson) return
    setSubmittingChallenge(true)
    try {
      const res = await fetch('/api/lessons/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          conceptId: concept.id,
          challengeQuestion: lesson.content.challenge_question,
          answer: challengeAnswer,
          conceptTitle: concept.title,
        }),
      })
      const data = await res.json()
      setChallengeFeedback(data.feedback)
      setLessonCompleted(true)
    } catch (e) {
      console.error(e)
    }
    setSubmittingChallenge(false)
  }

  const content = lesson?.content

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Generating your lesson...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Phase {concept.phase} · Level {studentConcept.level}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          {concept.title}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{concept.description}</p>
      </div>

      {!lesson ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 40px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>◈</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Ready to learn {concept.title}?</h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px', maxWidth: '380px' }}>
            The AI will generate a personalized lesson based on your level and domain focus.
          </p>
          <button onClick={generateLesson} className="btn btn-primary" style={{ marginTop: '8px' }}>
            Generate Lesson
          </button>
        </div>
      ) : (
        <>
          {/* Key Takeaway */}
          <div style={{ background: 'rgba(123,92,240,0.08)', border: '1px solid rgba(123,92,240,0.2)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Key Takeaway</div>
            <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>{content?.key_takeaway}</p>
          </div>

          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '2px' }}>
            {SECTIONS.map((section, i) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(i)}
                style={{
                  padding: '8px 14px', borderRadius: '8px',
                  border: `1px solid ${activeSection === i ? 'var(--accent)' : 'var(--border)'}`,
                  background: activeSection === i ? 'rgba(123,92,240,0.12)' : 'var(--bg3)',
                  color: activeSection === i ? 'var(--accent2)' : 'var(--text2)',
                  fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', marginBottom: '24px', minHeight: '200px' }}>
            <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
              {SECTIONS[activeSection].icon} {SECTIONS[activeSection].label}
            </div>

            {activeSection < 4 ? (
              <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {content?.[SECTIONS[activeSection].key as keyof typeof content] || ''}
              </p>
            ) : (
              <div>
                <p style={{ fontSize: '16px', color: 'var(--text)', fontWeight: '500', marginBottom: '20px', lineHeight: '1.6' }}>
                  {content?.challenge_question}
                </p>
                {!lessonCompleted ? (
                  <>
                    <textarea
                      value={challengeAnswer}
                      onChange={e => setChallengeAnswer(e.target.value)}
                      placeholder="Write your answer here (2-4 sentences)..."
                      rows={5}
                      style={{
                        width: '100%', background: 'var(--bg3)',
                        border: '1px solid var(--border)', borderRadius: '8px',
                        padding: '12px 14px', fontSize: '14px',
                        color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                        resize: 'vertical', marginBottom: '12px',
                      }}
                    />
                    <button
                      onClick={submitChallenge}
                      disabled={submittingChallenge || !challengeAnswer.trim()}
                      className="btn btn-primary"
                    >
                      {submittingChallenge ? 'Evaluating...' : 'Submit Answer'}
                    </button>
                  </>
                ) : (
                  <>
                    {challengeFeedback && (
                      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>AI Feedback</div>
                        <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.7' }}>{challengeFeedback}</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => router.push(`/quiz?concept=${concept.id}`)}
                        className="btn btn-primary"
                      >
                        Take Quiz →
                      </button>
                      <button
                        onClick={() => router.push('/learn')}
                        className="btn btn-ghost"
                      >
                        Back to Concepts
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="btn btn-ghost"
              style={{ opacity: activeSection === 0 ? 0.3 : 1 }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{activeSection + 1} / {SECTIONS.length}</span>
            <button
              onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
              disabled={activeSection === SECTIONS.length - 1}
              className="btn btn-ghost"
              style={{ opacity: activeSection === SECTIONS.length - 1 ? 0.3 : 1 }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
