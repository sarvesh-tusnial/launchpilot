import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL = 'claude-sonnet-4-20250514'

// ============================================
// LESSON GENERATION
// ============================================
export async function generateLesson(params: {
  concept: { title: string; description: string; slug: string }
  studentLevel: number
  domain: string
  priorGaps: string[]
  teachingStrategy: string
}): Promise<{
  core_explanation: string
  real_world_analogy: string
  anti_pattern: string
  product_moment: string
  challenge_question: string
  key_takeaway: string
}> {
  const { concept, studentLevel, domain, priorGaps, teachingStrategy } = params

  const levelDescriptions: Record<number, string> = {
    0: 'complete beginner with no PM experience',
    1: 'aware of the concept but cannot apply it',
    2: 'can apply with guidance but misses nuance',
    3: 'applies independently but struggles with edge cases',
    4: 'expert who adapts frameworks to new contexts',
    5: 'mastered — could teach others',
  }

  const strategyInstructions: Record<string, string> = {
    analogy: 'Lead with a powerful real-world analogy that makes the concept click immediately.',
    case: 'Lead with a detailed case study from a real company, then extract the principle.',
    first_principles: 'Break the concept down from first principles. Start with WHY this matters.',
    socratic: 'Ask 3 probing questions that guide the student to discover the concept themselves, then explain.',
  }

  const systemPrompt = `You are a Senior PM at a Series B startup who is brilliant at teaching product management. You teach by doing — every concept connects to real product decisions. You never use academic language. You are direct, opinionated, and occasionally blunt. You hate vague PM-speak. You love specific examples.

The student's domain focus is: ${domain}.
${priorGaps.length > 0 ? `The student has gaps in: ${priorGaps.join(', ')}. Acknowledge these connections where relevant.` : ''}
${strategyInstructions[teachingStrategy] || strategyInstructions.analogy}`

  const userPrompt = `Teach the concept: "${concept.title}" (${concept.description})

The student is at level ${studentLevel}/5: ${levelDescriptions[studentLevel] || levelDescriptions[1]}.

Return ONLY a valid JSON object with these exact keys:
{
  "core_explanation": "150-200 word plain-language explanation. No jargon. Connect to ${domain} products.",
  "real_world_analogy": "A specific analogy using a product the student knows (e.g., Uber, Spotify, Slack). Make the concept feel obvious.",
  "anti_pattern": "What does BAD look like? Give a specific example of a PM doing this wrong and what happened.",
  "product_moment": "A specific real product decision (at a named company) where this concept was the key factor. What decision was made and what was the outcome?",
  "challenge_question": "A Socratic question that tests DEEP understanding. Not recall. It should be answerable in 2-3 sentences but require real thinking. Make it specific to ${domain}.",
  "key_takeaway": "One sentence. The single most important thing to remember about this concept."
}

Return only the JSON. No markdown. No preamble.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    throw new Error('Failed to parse lesson content from AI')
  }
}

// ============================================
// QUIZ GENERATION
// ============================================
export async function generateQuiz(params: {
  concept: { title: string; description: string }
  studentLevel: number
  domain: string
  quizType: 'mcq' | 'scenario' | 'socratic'
}): Promise<{
  questions: Array<{
    id: string
    type: string
    question: string
    options?: string[]
    correct_answer?: string
    correct_criteria?: string
    points: number
  }>
}> {
  const { concept, studentLevel, domain, quizType } = params

  const typeInstructions = {
    mcq: `Generate 3 multiple-choice questions. Each has 4 options. All options must be PLAUSIBLE PM responses — wrong options should represent common senior-level mistakes, not obviously bad choices. For each question, include which option is correct and why the others are wrong.`,
    scenario: `Generate 2 scenario questions. Each presents a real product situation (100-150 words). Student must write a 3-5 sentence response. Include the criteria for a correct answer (4 bullet points of what a good response must include).`,
    socratic: `Generate 1 challenging Socratic question that requires the student to reason through a complex tradeoff. This should take 5-10 minutes to answer well. Include a detailed rubric for evaluation.`,
  }

  const userPrompt = `Create a quiz on: "${concept.title}" for a level ${studentLevel}/5 student focused on ${domain} products.

${typeInstructions[quizType]}

Return ONLY a valid JSON object:
{
  "questions": [
    {
      "id": "q1",
      "type": "${quizType}",
      "question": "...",
      ${quizType === 'mcq' ? '"options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct_answer": "A", "correct_explanation": "...",' : ''}
      ${quizType !== 'mcq' ? '"correct_criteria": "...",' : ''}
      "points": ${quizType === 'mcq' ? 33 : quizType === 'scenario' ? 50 : 100}
    }
  ]
}

Return only the JSON. No markdown.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
    system: `You are a rigorous PM educator. You create assessments that test REAL understanding, not memorization. Make questions that even experienced PMs find challenging.`,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    throw new Error('Failed to parse quiz from AI')
  }
}

// ============================================
// ANSWER EVALUATION
// ============================================
export async function evaluateQuizAnswer(params: {
  question: { question: string; correct_criteria?: string; correct_answer?: string; type: string }
  studentAnswer: string
  concept: string
}): Promise<{
  passed: boolean
  score: number
  feedback: string
  gap_identified: string | null
  follow_up_question: string | null
}> {
  const { question, studentAnswer, concept } = params

  const userPrompt = `You are a strict PM validator. Evaluate this answer.

Concept being tested: ${concept}
Question: ${question.question}
${question.correct_criteria ? `Correct response criteria: ${question.correct_criteria}` : ''}
${question.correct_answer ? `Correct answer: ${question.correct_answer}` : ''}
Student's answer: "${studentAnswer}"

Return ONLY a JSON object:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "2-3 sentences. Be direct. If wrong, say what mental model is broken. No softening.",
  "gap_identified": "If there's a specific conceptual gap, name it precisely. Null if passed.",
  "follow_up_question": "If failed, a targeted 1-sentence question that isolates the specific gap. Null if passed."
}

Return only JSON.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: userPrompt }],
    system: `You are a rigorous evaluator. A score above 70 means PASSED. Be strict but precise. Never give empty encouragement.`,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    return {
      passed: false,
      score: 0,
      feedback: 'Unable to evaluate answer. Please try again.',
      gap_identified: null,
      follow_up_question: null,
    }
  }
}

// ============================================
// SUBMISSION EVALUATION (Full Rubric)
// ============================================
export async function evaluateSubmission(params: {
  task: { title: string; brief: string; task_type: string; rubric: { weights: Record<string, number> } }
  submission: string
  concept: string
  studentLevel: number
}): Promise<{
  score: number
  verdict: 'PASS' | 'REVISE' | 'RELEARN'
  dimension_scores: Record<string, { score: number; verdict: string; instruction: string }>
  feedback_items: Array<{ issue: string; fix: string; priority: number }>
  bridge_insight: string
}> {
  const { task, submission, concept, studentLevel } = params

  const rubricDimensions = `
- user_insight (${task.rubric.weights.user_insight || 20}%): Does the work show genuine understanding of who the user is and what they ACTUALLY need?
- problem_clarity (${task.rubric.weights.problem_clarity || 20}%): Is the problem statement sharp enough that an engineer could build toward it?
- business_thinking (${task.rubric.weights.business_thinking || 20}%): Does the student understand business model implications of their decisions?
- execution_quality (${task.rubric.weights.execution_quality || 15}%): Is the deliverable something you could hand to a team and actually execute?
- tradeoff_reasoning (${task.rubric.weights.tradeoff_reasoning || 15}%): Does the student show awareness of what they're giving up?
- communication_clarity (${task.rubric.weights.communication_clarity || 10}%): Can a non-expert understand the thinking in under 3 minutes?`

  const userPrompt = `You are a Principal PM reviewing work from a junior PM (level ${studentLevel}/5).

Task: ${task.title}
Brief: ${task.brief}

Student's submission:
---
${submission}
---

Score on these dimensions:
${rubricDimensions}

A score ≥ 72 overall = PASS
A score 55-71 = REVISE  
A score < 55 = RELEARN

Return ONLY this JSON:
{
  "score": 0-100,
  "verdict": "PASS" | "REVISE" | "RELEARN",
  "dimension_scores": {
    "user_insight": {"score": 0-5, "verdict": "one sentence", "instruction": "one actionable instruction"},
    "problem_clarity": {"score": 0-5, "verdict": "one sentence", "instruction": "one actionable instruction"},
    "business_thinking": {"score": 0-5, "verdict": "one sentence", "instruction": "one actionable instruction"},
    "execution_quality": {"score": 0-5, "verdict": "one sentence", "instruction": "one actionable instruction"},
    "tradeoff_reasoning": {"score": 0-5, "verdict": "one sentence", "instruction": "one actionable instruction"},
    "communication_clarity": {"score": 0-5, "verdict": "one sentence", "instruction": "one actionable instruction"}
  },
  "feedback_items": [
    {"issue": "specific problem referencing their text", "fix": "exactly what to change", "priority": 1},
    {"issue": "...", "fix": "...", "priority": 2},
    {"issue": "...", "fix": "...", "priority": 3}
  ],
  "bridge_insight": "One sentence connecting what they learned here to what they'll work on next in ${concept}."
}

Be strict. Reference specific lines from their submission. Do not soften feedback. Real PMs don't get kind rejections.
Return only JSON.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
    system: `You are a Principal PM at a top-tier product company. You have zero tolerance for vague thinking, buzzword usage, or outputs that couldn't survive a real product review. Your feedback is surgical — specific, actionable, direct.`,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    throw new Error('Failed to parse evaluation from AI')
  }
}

// ============================================
// PROGRESSION CHECK
// ============================================
export async function generateProgressInsight(params: {
  studentName: string
  masteredConcepts: string[]
  gapConcepts: string[]
  currentConcept: string
  overallScore: number
}): Promise<string> {
  const { studentName, masteredConcepts, gapConcepts, currentConcept, overallScore } = params

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Student: ${studentName}. Mastered: ${masteredConcepts.join(', ') || 'none yet'}. Gaps: ${gapConcepts.join(', ') || 'none'}. Currently learning: ${currentConcept}. Score: ${overallScore}/100.

Write a 2-sentence honest progress note. What's going well, what needs work. Be direct, not encouraging for its own sake. No filler.`,
      },
    ],
    system: `You are a senior PM mentor. You give honest, useful feedback. Not cheerleader feedback.`,
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
