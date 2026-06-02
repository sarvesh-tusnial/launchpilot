-- ============================================
-- MENTOGRAM DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extended from Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  domain TEXT DEFAULT 'B2C' CHECK (domain IN ('B2B', 'B2C', 'Marketplace', 'Platform')),
  current_phase INTEGER DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 3),
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONCEPTS (the 24 PM skill nodes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 3),
  order_index INTEGER NOT NULL,
  prerequisites TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDENT SKILL NODES (progress per concept)
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0 CHECK (level BETWEEN 0 AND 5),
  best_score INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_mastered BOOLEAN DEFAULT FALSE,
  gap_flag BOOLEAN DEFAULT FALSE,
  teaching_strategy TEXT DEFAULT 'analogy' CHECK (teaching_strategy IN ('analogy','case','first_principles','socratic')),
  unlocked_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, concept_id)
);

-- ============================================
-- LESSONS (AI-generated lesson content)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  student_level INTEGER NOT NULL,
  domain TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUIZ ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  answers JSONB,
  score INTEGER,
  passed BOOLEAN,
  feedback JSONB,
  attempt_number INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS (execution assignments)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('prd','case_study','experiment','prioritization','strategy_memo')),
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  rubric JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASK SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  score INTEGER,
  dimension_scores JSONB,
  verdict TEXT CHECK (verdict IN ('PASS','REVISE','RELEARN')),
  feedback_items JSONB,
  bridge_insight TEXT,
  attempt_number INTEGER DEFAULT 1,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED CONCEPTS DATA
-- ============================================
INSERT INTO public.concepts (slug, title, description, phase, order_index, prerequisites) VALUES
('problem-discovery', 'Problem Discovery', 'Learning to identify real problems worth solving', 1, 1, '{}'),
('user-research', 'User Research Methods', 'Qualitative and quantitative research techniques', 1, 2, '{problem-discovery}'),
('jtbd', 'Jobs-to-be-Done', 'Understanding what users are trying to accomplish', 1, 3, '{user-research}'),
('competitive-analysis', 'Competitive Analysis', 'Mapping the competitive landscape strategically', 1, 4, '{problem-discovery}'),
('opportunity-sizing', 'Opportunity Sizing', 'Quantifying market opportunity and impact', 1, 5, '{competitive-analysis}'),
('hypothesis-formation', 'Hypothesis Formation', 'Forming testable product hypotheses', 1, 6, '{jtbd}'),
('prd-writing', 'PRD Writing', 'Writing product requirements that teams can execute', 1, 7, '{hypothesis-formation}'),
('prioritization', 'Prioritization Frameworks', 'RICE, MoSCoW, ICE and when to use each', 1, 8, '{prd-writing}'),
('roadmap-strategy', 'Roadmap Strategy', 'Building and communicating a product roadmap', 1, 9, '{prioritization}'),
('metrics-okrs', 'Metrics & OKRs', 'Defining the right success metrics', 1, 10, '{hypothesis-formation}'),
('experimentation', 'Experimentation Design', 'Designing rigorous product experiments', 2, 11, '{metrics-okrs,hypothesis-formation}'),
('ab-testing', 'A/B Testing Mechanics', 'Statistical foundations of controlled experiments', 2, 12, '{experimentation}'),
('stakeholder-mgmt', 'Stakeholder Management', 'Influencing without authority', 2, 13, '{roadmap-strategy}'),
('go-to-market', 'Go-to-Market Strategy', 'Planning product launches', 2, 14, '{roadmap-strategy}'),
('pricing-strategy', 'Pricing Strategy', 'Monetization models and pricing psychology', 2, 15, '{opportunity-sizing}'),
('business-model', 'Business Model Design', 'Unit economics and business model patterns', 2, 16, '{pricing-strategy}'),
('data-analysis', 'Data Analysis for PMs', 'SQL, dashboards, and data-driven decisions', 2, 17, '{metrics-okrs}'),
('technical-fluency', 'Technical Fluency', 'Understanding engineering to collaborate better', 2, 18, '{prd-writing}'),
('design-thinking', 'Design Thinking', 'User-centered design principles', 2, 19, '{user-research}'),
('product-led-growth', 'Product-Led Growth', 'PLG strategy and viral mechanics', 3, 20, '{go-to-market,business-model}'),
('platform-thinking', 'Platform Thinking', 'Network effects and platform dynamics', 3, 21, '{business-model}'),
('launch-rollout', 'Launch & Rollout', 'Feature flags, gradual rollouts, launch checklists', 3, 22, '{go-to-market,ab-testing}'),
('post-launch', 'Post-Launch Iteration', 'Learning loops after shipping', 3, 23, '{launch-rollout,experimentation}'),
('pm-leadership', 'PM Leadership & Influence', 'Growing as a PM and leading product culture', 3, 24, '{stakeholder-mgmt}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED TASKS DATA
-- ============================================
INSERT INTO public.tasks (concept_id, task_type, title, brief, difficulty, rubric)
SELECT 
  c.id,
  'prd',
  'Write a PRD: Driver Retention Feature',
  'You are a PM at RideFlow, a rideshare startup losing drivers in tier-2 cities. Monthly driver churn is 18%, up from 12% six months ago. Exit surveys cite "inconsistent earnings" and "lack of incentives." Engineering capacity: 2 sprints. Write a complete PRD for a feature to address driver retention.

Your PRD must include:
1. Problem Statement (specific, measurable)
2. User Segment & Key Insights
3. Goals and Non-Goals
4. Success Metrics (primary + guardrail)
5. Solution Hypothesis
6. Scope (what is IN, what is OUT)
7. Open Questions (min 3)',
  2,
  '{"dimensions": ["user_insight", "problem_clarity", "business_thinking", "execution_quality", "tradeoff_reasoning", "communication_clarity"], "weights": {"user_insight": 20, "problem_clarity": 20, "business_thinking": 20, "execution_quality": 15, "tradeoff_reasoning": 15, "communication_clarity": 10}}'
FROM public.concepts c WHERE c.slug = 'prd-writing'
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (concept_id, task_type, title, brief, difficulty, rubric)
SELECT 
  c.id,
  'prioritization',
  'Prioritize the Q3 Backlog',
  'You are a PM at Finflow, a B2B invoicing SaaS with 500 SMB customers. Your Q3 backlog has these items:

1. Bulk invoice export (top sales request, 40 prospects blocked)
2. Payment reminder automation (requested by 120 customers, low eng effort)
3. Stripe integration upgrade (tech debt, required for PCI compliance by Q4)
4. Custom branding on invoices (nice-to-have, 15 customer requests)
5. Mobile app (CEO priority, large effort, unclear demand signal)
6. API rate limit increase (3 enterprise customers blocked, high ARR risk)
7. Invoice template library (marketing wants it, no customer validation)
8. Xero accounting integration (20 customer requests, medium effort)

You have 3 engineers for 6 weeks. Apply a prioritization framework. Rank all 8 items. For your top 3 choices, write a 2-sentence defense. For items 4-8, explain in one sentence why they ranked lower.',
  2,
  '{"dimensions": ["user_insight", "problem_clarity", "business_thinking", "execution_quality", "tradeoff_reasoning", "communication_clarity"], "weights": {"user_insight": 15, "problem_clarity": 15, "business_thinking": 25, "execution_quality": 15, "tradeoff_reasoning": 20, "communication_clarity": 10}}'
FROM public.concepts c WHERE c.slug = 'prioritization'
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (concept_id, task_type, title, brief, difficulty, rubric)
SELECT 
  c.id,
  'experiment',
  'Design an Experiment: Onboarding Flow',
  'You are a PM at Notion-competitor TaskFlow. Your 7-day activation rate is 34% (industry benchmark: 55%). You hypothesize that reducing the onboarding from 8 steps to 3 steps will improve activation.

Design a rigorous A/B experiment. Your response must include:
1. Null hypothesis and alternative hypothesis
2. Primary success metric (and why, not just "activation rate")
3. Guardrail metrics (what you will NOT let get worse)
4. Minimum detectable effect and why you chose it
5. Required sample size (show rough reasoning)
6. Threat to validity (name at least 2)
7. Decision framework: ship if X, kill if Y, iterate if Z
8. How long will you run the experiment and why',
  3,
  '{"dimensions": ["user_insight", "problem_clarity", "business_thinking", "execution_quality", "tradeoff_reasoning", "communication_clarity"], "weights": {"user_insight": 10, "problem_clarity": 20, "business_thinking": 20, "execution_quality": 25, "tradeoff_reasoning": 15, "communication_clarity": 10}}'
FROM public.concepts c WHERE c.slug = 'experimentation'
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Concepts: everyone can read
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "concepts_select_all" ON public.concepts FOR SELECT USING (true);

-- Tasks: everyone can read
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select_all" ON public.tasks FOR SELECT USING (true);

-- Student concepts: own only
CREATE POLICY "student_concepts_select_own" ON public.student_concepts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "student_concepts_insert_own" ON public.student_concepts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "student_concepts_update_own" ON public.student_concepts FOR UPDATE USING (auth.uid() = student_id);

-- Lessons: own only
CREATE POLICY "lessons_select_own" ON public.lessons FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "lessons_insert_own" ON public.lessons FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "lessons_update_own" ON public.lessons FOR UPDATE USING (auth.uid() = student_id);

-- Quiz attempts: own only
CREATE POLICY "quiz_select_own" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "quiz_insert_own" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "quiz_update_own" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = student_id);

-- Submissions: own only
CREATE POLICY "submissions_select_own" ON public.submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "submissions_insert_own" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "submissions_update_own" ON public.submissions FOR UPDATE USING (auth.uid() = student_id);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Unlock first concept automatically
  INSERT INTO public.student_concepts (student_id, concept_id, is_unlocked, unlocked_at)
  SELECT NEW.id, c.id, true, NOW()
  FROM public.concepts c
  WHERE c.slug = 'problem-discovery';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: update updated_at automatically
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER student_concepts_updated_at BEFORE UPDATE ON public.student_concepts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
