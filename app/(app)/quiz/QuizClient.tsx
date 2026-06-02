'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Concept, Profile, QuizQuestion, QuizAnswerFeedback } from '@/types'

interface Props {
  profile: Profile | null
  unlockedConcepts: Concept[]
  initialConcept: Concept | null
}

type QuizState = 'select' | 'loading' | 'active' | 'reviewing' | 'complete'

export default function QuizClient({ profile, unlockedConcepts, initialConcept }: Props) {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(initialConcept)
  const [quizType, setQuizType] = useState<'mcq' | 'scenario'>('mcq')
  const [quizState, setQuizState] = useState<QuizState>(initialConcept ? 'select' : 'select')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, QuizAnswerFeedback>>({})
  const [evaluating, setEvaluating] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const router = useRouter()

  const startQuiz = async () => {
    if (!selectedConcept) return
    setQuizState('loading')

    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conceptId: selectedConcept.id,
        studentLevel: 1,
        domain: profile?.domain || 'B2C',
        quizType,
      }),
    })
    const data = await res.json()

    if (data.attempt) {
      setAttemptId(data.attempt.id)
      setQuestions(data.attempt.questions)
      setCurrentQ(0)
      setAnswers({})
      setFeedbacks({})
      setQuizState('active')
    } else {
      setQuizState('select')
    }
  }

  const submitAnswer = async () => {
    const q = questions[currentQ]
    const answer = answers[q.id]
    if (!answer?.trim() || !attemptId) return

    setEvaluating(true)
    const res = await fetch('/api/quiz/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        questionId: q.id,
        question: q,
        answer,
        conceptTitle: selectedConcept?.title,
      }),
    })
    const data = await res.json()
    setEvaluating(false)

    if (data.feedback) {
      setFeedbacks(prev => ({ ...prev, [q.id]: data.feedback }))
      setQuizState('reviewing')
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
      setQuizState('active')
    } else {
      // Calculate final score
      const total = Object.values(feedbacks).reduce((sum, f) => sum + (f.score || 0), 0)
      const avg = Math.round(total / questions.length)
      setFinalScore(avg)
      setPassed(avg >= 70)
      setQuizState('complete')

      // Submit final score
      if (attemptId && selectedConcept) {
        fetch('/api/quiz/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId,
            conceptId: selectedConcept.id,
            answers,
            feedbacks,
            score: avg,
            passed: avg >= 70,
          }),
        })
      }
    }
  }

  const q = questions[currentQ]
  const currentAnswer = q ? answers[q.id] || '' : ''
  const currentFeedback = q ? feedbacks[q.id] : null

  // Select state
  if (quizState === 'select') {
    return (
      <div style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Validation</div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '8px' }}>Quiz</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Test your understanding of a concept. Must score ≥70 to unlock next level.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Select Concept</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
              {unlockedConcepts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConcept(c)}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: '8px',
                    border: `1px solid ${selectedConcept?.id === c.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedConcept?.id === c.id ? 'rgba(123,92,240,0.12)' : 'var(--bg3)',
                    color: selectedConcept?.id === c.id ? 'var(--accent2)' : 'var(--text)',
                    fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Quiz Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['mcq', 'scenario'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setQuizType(type)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    border: `1px solid ${quizType === type ? 'var(--accent)' : 'var(--border)'}`,
                    background: quizType === type ? 'rgba(123,92,240,0.12)' : 'var(--bg3)',
                    color: quizType === type ? 'var(--accent2)' : 'var(--text2)',
                    fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {type === 'mcq' ? '◎ Multiple Choice' : '◈ Scenario'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={!selectedConcept}
            className="btn btn-primary"
            style={{ justifyContent: 'center', marginTop: '8px', opacity: !selectedConcept ? 0.4 : 1 }}
          >
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  if (quizState === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Generating quiz questions...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (quizState === 'complete') {
    return (
      <div style={{ maxWidth: '640px', textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ fontSize: '56px', fontWeight: '700', color: passed ? 'var(--teal)' : 'var(--coral)', marginBottom: '12px' }}>
          {finalScore}/100
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          {passed ? 'Quiz Passed!' : 'Not quite there yet'}
        </h2>
        <p style={{ color: 'var(--text2)', marginBottom: '32px' }}>
          {passed
            ? `Great work on ${selectedConcept?.title}. Your understanding has been validated.`
            : `You need 70+ to pass. Review the lesson and try again.`}
        </p>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Question Breakdown</div>
          {questions.map((q, i) => {
            const fb = feedbacks[q.id]
            return (
              <div key={q.id} style={{ padding: '12px 0', borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', flex: 1 }}>Q{i + 1}: {q.question.slice(0, 80)}...</div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: (fb?.score || 0) >= 70 ? 'var(--teal)' : 'var(--coral)', flexShrink: 0 }}>
                    {fb?.score || 0}/100
                  </span>
                </div>
                {fb?.feedback && <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>{fb.feedback}</p>}
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => { setQuizState('select'); setSelectedConcept(null) }} className="btn btn-ghost">
            New Quiz
          </button>
          <button onClick={() => router.push('/tasks')} className="btn btn-primary">
            Go to Tasks →
          </button>
        </div>
      </div>
    )
  }

  if (!q) return null

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {selectedConcept?.title}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '2px' }}>
            Question {currentQ + 1} of {questions.length}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i < currentQ ? 'var(--teal)' : i === currentQ ? 'var(--accent)' : 'var(--bg4)',
            }} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', marginBottom: '20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.65', marginBottom: '24px' }}>
          {q.question}
        </p>

        {/* MCQ Options */}
        {q.type === 'mcq' && q.options && quizState === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.split('.')[0].trim() }))}
                style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: '8px',
                  border: `1px solid ${currentAnswer === opt.split('.')[0].trim() ? 'var(--accent)' : 'var(--border)'}`,
                  background: currentAnswer === opt.split('.')[0].trim() ? 'rgba(123,92,240,0.12)' : 'var(--bg3)',
                  color: currentAnswer === opt.split('.')[0].trim() ? 'var(--accent2)' : 'var(--text)',
                  fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Scenario / Open answer */}
        {(q.type === 'scenario' || q.type === 'socratic') && quizState === 'active' && (
          <textarea
            value={currentAnswer}
            onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="Write your answer (3-5 sentences)..."
            rows={6}
            style={{
              width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '12px 14px', fontSize: '14px',
              color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'vertical',
            }}
          />
        )}

        {/* Feedback */}
        {quizState === 'reviewing' && currentFeedback && (
          <div>
            <div style={{
              padding: '14px 16px', borderRadius: '8px', marginBottom: '12px',
              background: currentFeedback.passed ? 'rgba(74,222,128,0.08)' : 'rgba(249,112,102,0.08)',
              border: `1px solid ${currentFeedback.passed ? 'rgba(74,222,128,0.2)' : 'rgba(249,112,102,0.2)'}`,
            }}>
              <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: currentFeedback.passed ? 'var(--green)' : 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                {currentFeedback.passed ? '✓ Correct' : '✗ Incorrect'} · {currentFeedback.score}/100
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.65' }}>{currentFeedback.feedback}</p>
              {currentFeedback.follow_up_question && (
                <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '10px', fontStyle: 'italic' }}>
                  Think about: {currentFeedback.follow_up_question}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {quizState === 'active' && (
          <button
            onClick={submitAnswer}
            disabled={!currentAnswer.trim() || evaluating}
            className="btn btn-primary"
          >
            {evaluating ? 'Evaluating...' : 'Submit Answer'}
          </button>
        )}
        {quizState === 'reviewing' && (
          <button onClick={nextQuestion} className="btn btn-primary">
            {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results →'}
          </button>
        )}
      </div>
    </div>
  )
}
