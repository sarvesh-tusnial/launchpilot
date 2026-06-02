export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  domain: 'B2B' | 'B2C' | 'Marketplace' | 'Platform'
  current_phase: number
  total_score: number
  onboarding_completed: boolean
  current_job: string | null
  why_pm: string | null
  dream_company: string | null
  biggest_fear: string | null
  hours_per_week: string | null
  created_at: string
  updated_at: string
}

export interface Concept {
  id: string
  slug: string
  title: string
  description: string
  phase: number
  order_index: number
  prerequisites: string[]
  created_at: string
}

export interface StudentConcept {
  id: string
  student_id: string
  concept_id: string
  level: number
  best_score: number
  attempt_count: number
  is_unlocked: boolean
  is_mastered: boolean
  gap_flag: boolean
  teaching_strategy: 'analogy' | 'case' | 'first_principles' | 'socratic'
  unlocked_at: string | null
  mastered_at: string | null
  concept?: Concept
}

export interface Lesson {
  id: string
  student_id: string
  concept_id: string
  content: LessonContent
  student_level: number
  domain: string
  completed: boolean
  created_at: string
}

export interface LessonContent {
  core_explanation: string
  real_world_analogy: string
  anti_pattern: string
  product_moment: string
  challenge_question: string
  key_takeaway: string
}

export interface QuizQuestion {
  id: string
  type: 'mcq' | 'scenario' | 'socratic'
  question: string
  options?: string[]
  correct_answer?: string
  correct_criteria?: string
  correct_explanation?: string
  points: number
}

export interface QuizAttempt {
  id: string
  student_id: string
  concept_id: string
  questions: QuizQuestion[]
  answers: Record<string, string> | null
  score: number | null
  passed: boolean | null
  feedback: Record<string, QuizAnswerFeedback> | null
  attempt_number: number
  completed_at: string | null
  created_at: string
}

export interface QuizAnswerFeedback {
  passed: boolean
  score: number
  feedback: string
  gap_identified: string | null
  follow_up_question: string | null
}

export interface Task {
  id: string
  concept_id: string
  task_type: 'prd' | 'case_study' | 'experiment' | 'prioritization' | 'strategy_memo'
  title: string
  brief: string
  difficulty: number
  rubric: {
    dimensions: string[]
    weights: Record<string, number>
  }
  created_at: string
}

export interface Submission {
  id: string
  student_id: string
  task_id: string
  concept_id: string
  content: string
  score: number | null
  dimension_scores: Record<string, DimensionScore> | null
  verdict: 'PASS' | 'REVISE' | 'RELEARN' | null
  feedback_items: FeedbackItem[] | null
  bridge_insight: string | null
  attempt_number: number
  evaluated_at: string | null
  created_at: string
  task?: Task
}

export interface DimensionScore {
  score: number
  verdict: string
  instruction: string
}

export interface FeedbackItem {
  issue: string
  fix: string
  priority: number
}

export interface DashboardData {
  profile: Profile
  conceptProgress: (StudentConcept & { concept: Concept })[]
  recentSubmissions: Submission[]
  unlockedCount: number
  masteredCount: number
  totalConcepts: number
}
