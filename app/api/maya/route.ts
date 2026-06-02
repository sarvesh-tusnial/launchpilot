import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'
import { CLIENT } from '@/client-config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, sessionContext } = await req.json()

  const [profileRes, studentCompRes, contentRes, mentorKnowledgeRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_competencies')
      .select('*, competency:competencies(code, name, order_index)')
      .eq('student_id', user.id),
    supabase.from('content_library')
      .select('id, title, description, content_type, url, storage_path, duration_seconds, competency_code, concept_id')
      .eq('is_active', true),
    supabase.from('mentor_knowledge')
      .select('*, mentor:mentors(name, title), competency_code, concept_id')
      .eq('is_active', true),
  ])

  const profile      = profileRes.data
  const studentComps = studentCompRes.data || []
  const allContent   = contentRes.data || []
  const allMentorKnowledge = mentorKnowledgeRes.data || []

  // ══════════════════════════════════════════════════════════════
  // BUBBLER FOUNDER — separate system prompt, same streaming logic
  // ══════════════════════════════════════════════════════════════
  if (profile?.email === 'founder@bubbler.app') {
    const active = studentComps.find((c: any) => c.status === 'active')
    const activeCode = (active?.competency as any)?.code

    let activeConcepts:  any[] = []
    let conceptProgress: any[] = []
    let masteredConcepts = 0
    let currentConcept:  any   = null
    let currentStage = 1

    const STAGE_LABELS: Record<number, string> = {
      1: 'Hook', 2: 'Reality Check', 3: 'Teach & Coach',
      4: 'Deep Dive', 5: 'Apply (Quiz)', 6: 'Execution Task',
      7: 'Feedback & Accountability', 8: 'Action Step & Bridge',
    }

    const TRACK_NAMES: Record<string, string> = {
      B01: 'Business Fundamentals', B02: 'Revenue', B03: 'Scale', B04: 'Fundraising',
    }

    if (active) {
      const [conceptData, cpData] = await Promise.all([
        supabase.from('concepts').select('*').eq('competency_code', activeCode).order('sequence'),
        supabase.from('student_concepts').select('*').eq('student_id', user.id),
      ])
      activeConcepts  = conceptData.data || []
      conceptProgress = cpData.data || []

      const activeConceptIds = new Set(activeConcepts.map((c: any) => c.id))
      masteredConcepts = conceptProgress.filter((p: any) => p.is_completed && activeConceptIds.has(p.concept_id)).length

      const completedIds = new Set(conceptProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
      currentConcept = activeConcepts.find((c: any) => !completedIds.has(c.id)) || activeConcepts[0] || null

      if (currentConcept) {
        const cp = conceptProgress.find((p: any) => p.concept_id === currentConcept.id)
        if (cp?.stage) currentStage = cp.stage
      }
    }

    const totalSteps = activeConcepts.length || 8
    const trackName  = TRACK_NAMES[activeCode] || 'Bubbler Co-Pilot'

    const bubblerContent = allContent.filter((c: any) => ['B01','B02','B03','B04'].includes(c.competency_code))
    const bubblerMentors = allMentorKnowledge.filter((k: any) => ['B01','B02','B03','B04'].includes(k.competency_code))

    const stepsProgress = activeConcepts.map((c: any) => {
      const cp = conceptProgress.find((p: any) => p.concept_id === c.id)
      const st = cp?.is_completed ? '✓' : '○'
      return `${st} ${String(c.sequence).padStart(2, '0')}. ${c.title}`
    }).join('\n')

    const mentorCtx = bubblerMentors.length > 0 ? `
EXPERT KNOWLEDGE BASE:
${bubblerMentors.map((k: any) => `---\nEXPERT: ${(k.mentor as any)?.name} (${(k.mentor as any)?.title})\nTITLE: ${k.title}\nCONTENT:\n${k.content}\n---`).join('\n')}` : ''

    const contentCtx = bubblerContent.length > 0 ? `
CONTENT LIBRARY:
${bubblerContent.map((c: any) => `- "${c.title}" | Type: ${c.content_type} | ID: ${c.id}`).join('\n')}
|||VIDEO|||{"id":"id","title":"title","type":"mentor_video","url":"url","duration":120,"description":"desc"}|||
|||ARTICLE|||{"id":"id","title":"title","url":"url","description":"desc"}|||` : ''

    const bubblerPrompt = `You are Maya — dedicated AI co-pilot and coach for the Bubbler founder.

═══════════════════════════════════════════════
ABOUT BUBBLER
═══════════════════════════════════════════════
Bubbler is a B2B SaaS platform for laundry business management in India, by dotbotz Interactives.

PRODUCT:
- Single dashboard: orders, pickups, billing, customer management
- Android app, iOS app, and web portal
- WhatsApp-native: auto-generates invoices, sends branded updates via WhatsApp
- Multi-branch support with individual pricing and staff controls
- Subscription plan management for recurring customers
- White-label ready — businesses use their own branding
- Analytics and insights dashboard
- 500+ businesses, India-focused, demo-led sales, 0-1 stage

═══════════════════════════════════════════════
CURRENT SESSION
═══════════════════════════════════════════════
Founder name: Karthik
Track: ${trackName}
Current concept: ${currentConcept ? `"${currentConcept.title}" (#${currentConcept.sequence}/${totalSteps})` : 'Starting first concept'}
Current stage: ${currentStage} of 8 — ${STAGE_LABELS[currentStage]}
${currentStage > 1 ? `⚠️ RESUME FROM STAGE ${currentStage} — do NOT restart from Stage 1.` : 'Starting fresh — begin with Stage 1 Hook.'}
Concepts mastered: ${masteredConcepts}/${totalSteps}

ALL CONCEPTS IN THIS TRACK:
${stepsProgress}

${mentorCtx}
${contentCtx}

SESSION CONTEXT: ${sessionContext || 'Bubbler co-pilot session'}

═══════════════════════════════════════════════
YOUR ROLE
═══════════════════════════════════════════════
Part teacher, part coach, part co-founder.
- Teach real concepts with India SaaS examples — Zoho, Razorpay, Khatabook, Urban Company, Meesho
- Every concept connects directly to Bubbler's specific situation
- Challenge weak thinking: "Are you sure? What's the data?"
- Push for execution — every session ends with ONE specific action
- Know their product deeply — reference WhatsApp integration, white-label, multi-branch features

═══════════════════════════════════════════════
THE 8-STAGE FRAMEWORK — NEVER SKIP A STAGE
═══════════════════════════════════════════════

STAGE 1 — HOOK (10 min)
Drop them into a real founder scenario specific to Bubbler/India B2B SaaS.
Use |||TIMER||| |||SCENARIO||| |||DASHBOARD||| |||DRAGDROP|||
Show ONE interface, wait for response, show ONE more, then IMMEDIATELY announce "Stage 2 —" and move forward.
Maximum 2 interfaces in Stage 1. Do not ask follow-up questions. Move on.

STAGE 2 — REALITY CHECK (15 min)
Ask ONE question: "Did you do last session's action?" then ONE follow-up connecting to today's concept.
After 2 exchanges maximum, announce "Stage 3 —" and move forward.
Do not linger. Do not ask more than 2 questions total.

STAGE 3 — TEACH & COACH (25 min)
Teach the concept in 3-4 paragraphs with India SaaS examples.
Ask ONE application question: "How does this apply to Bubbler right now?"
After their response, ask ONE more clarifying question, then announce "Stage 4 —".
Maximum 3 exchanges. Move forward.

STAGE 4 — DEEP DIVE (20 min)
Show ONE |||SIMULATION||| or |||SCENARIO||| interface.
After response, give your analysis in 2-3 sentences, then announce "Stage 5 —".
Maximum 2 exchanges. Move forward.

STAGE 5 — APPLY (15 min)
Ask 5 |||QUIZ||| questions one at a time. Wait for each answer before next.
After question 5 is answered, immediately announce "Stage 6 —".

STAGE 6 — EXECUTION TASK (45 min)
Show ONE |||TASK||| block. Wait for submission.
Evaluate with |||EVAL|||. ≥72 = PASS → announce "Stage 7 —". <72 = one revision then move on regardless.
NEVER write it for them.

STAGE 7 — FEEDBACK & ACCOUNTABILITY (15 min)
Ask ONE question about what the task revealed. After response, announce "Stage 8 —".
Maximum 2 exchanges.

STAGE 8 — ACTION STEP & BRIDGE (10 min)
Give ONE specific action step. Ask for verbal commitment.
Show |||PROGRESS|||. End the session.

═══════════════════════════════════════════════
INTERFACE FORMATS
═══════════════════════════════════════════════
|||QUIZ|||{"question":"q","options":["A. opt","B. opt","C. opt","D. opt"],"correct":"A","explanation":"why"}|||
|||TASK|||{"title":"title","brief":"full brief for Bubbler","concept":"concept","difficulty":3}|||
|||EVAL|||{"score":75,"verdict":"PASS","strengths":"specific","gaps":"specific","fix":"one fix"}|||
|||PROGRESS|||{"mastered":${masteredConcepts},"unlocked":${masteredConcepts + 1},"total":${totalSteps},"message":"one liner"}|||
|||TIMER|||{"prompt":"Bubbler-specific prompt","duration_seconds":300,"concept":"concept","hint":"optional"}|||
|||DRAGDROP|||{"instruction":"instruction","items":[{"id":"1","label":"label","description":"desc"}],"correct_order":["1","2"],"explanation":"why"}|||
|||SCENARIO|||{"situation":"real Bubbler crisis","context":"background","company":"Bubbler","choices":[{"id":"A","label":"title","description":"what","risk":"low"},{"id":"B","label":"title","description":"what","risk":"medium"},{"id":"C","label":"title","description":"what","risk":"high"},{"id":"D","label":"title","description":"what","risk":"medium"}],"stage":1,"total_stages":3}|||
|||DASHBOARD|||{"company":"Bubbler","product":"Laundry SaaS","period":"Month","metrics":[{"name":"MRR","value":"₹4.2L","change":"+8%","direction":"up","is_concerning":false}],"prompt":"What story does this tell?","hint":"optional"}|||
|||SIMULATION|||{"scenario":"situation","characters":[{"name":"Name","role":"Role","position":"stance","color":"#hex"}],"objective":"founder goal","turns":6}|||
|||VIDEO|||{"id":"id","title":"title","type":"mentor_video","url":"url","duration":120,"description":"desc"}|||
|||ARTICLE|||{"id":"id","title":"title","url":"url","description":"desc"}|||

ABSOLUTE RULES:
- NEVER write the deliverable for them
- NEVER skip a stage
- NEVER advance without score ≥72
- ALWAYS end with ONE specific action step
- After any |||interface|||, STOP and wait for response
- All examples must reference India B2B SaaS context`

    const claudeMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: bubblerPrompt,
      messages: claudeMessages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    })
  }

  // ══════════════════════════════════════════════════════════════
  // REGULAR LAUNCHPILOT STUDENTS — unchanged original logic
  // ══════════════════════════════════════════════════════════════
  const active = studentComps.find((c: any) => c.status === 'active')
  const activeCode = (active?.competency as any)?.code
  const activeName = (active?.competency as any)?.name
  const activePathway = CLIENT.pathways.find((p: any) => p.code === activeCode)

  let activeConcepts:  any[] = []
  let conceptProgress: any[] = []
  let masteredConcepts = 0
  let currentConcept:  any   = null
  let currentStage = 1

  const STAGE_LABELS: Record<number, string> = {
    1: 'Hook', 2: 'Reality Check', 3: 'Teach & Coach',
    4: 'Deep Dive', 5: 'Apply (Quiz)', 6: 'Execution Task',
    7: 'Feedback & Accountability', 8: 'Action Step & Bridge',
  }

  if (active) {
    const [conceptData, cpData] = await Promise.all([
      supabase.from('concepts').select('*').eq('competency_code', activeCode).order('sequence'),
      supabase.from('student_concepts').select('*').eq('student_id', user.id),
    ])
    activeConcepts  = conceptData.data || []
    conceptProgress = cpData.data || []

    const activeConceptIds = new Set(activeConcepts.map((c: any) => c.id))
    masteredConcepts = conceptProgress.filter((p: any) => p.is_completed && activeConceptIds.has(p.concept_id)).length

    const completedIds = new Set(conceptProgress.filter((p: any) => p.is_completed).map((p: any) => p.concept_id))
    currentConcept = activeConcepts.find((c: any) => !completedIds.has(c.id)) || activeConcepts[0] || null

    if (currentConcept) {
      const cp = conceptProgress.find((p: any) => p.concept_id === currentConcept.id)
      if (cp?.stage) currentStage = cp.stage
    }
  }

  const totalSteps = activeConcepts.length || 25
  const daysSince = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1

  const contentLibrary = allContent.filter((c: any) => !activeCode || c.competency_code === activeCode)
  const mentorKnowledge = allMentorKnowledge.filter((k: any) => !activeCode || k.competency_code === activeCode)

  const contentByType = {
    mentor_videos: contentLibrary.filter((c: any) => c.content_type === 'mentor_video'),
    youtube:       contentLibrary.filter((c: any) => c.content_type === 'youtube'),
    articles:      contentLibrary.filter((c: any) => c.content_type === 'article'),
    case_studies:  contentLibrary.filter((c: any) => c.content_type === 'case_study' || c.content_type === 'pdf'),
  }

  const contentContext = contentLibrary.length > 0 ? `
═══════════════════════════════════════════════
CONTENT LIBRARY (surface during Stage 3)
═══════════════════════════════════════════════
${contentByType.mentor_videos.length > 0 ? `FOUNDER VIDEOS:\n${contentByType.mentor_videos.map((c: any) => `- "${c.title}" | ID: ${c.id} | ${c.description || ''}`).join('\n')}` : ''}
${contentByType.youtube.length > 0 ? `YOUTUBE:\n${contentByType.youtube.map((c: any) => `- "${c.title}" | ID: ${c.id} | URL: ${c.url}`).join('\n')}` : ''}
${contentByType.articles.length > 0 ? `ARTICLES:\n${contentByType.articles.map((c: any) => `- "${c.title}" | ID: ${c.id} | URL: ${c.url}`).join('\n')}` : ''}
${contentByType.case_studies.length > 0 ? `CASE STUDIES:\n${contentByType.case_studies.map((c: any) => `- "${c.title}" | ID: ${c.id}`).join('\n')}` : ''}

|||VIDEO|||{"id":"id","title":"title","type":"mentor_video","url":"url","duration":120,"description":"desc"}|||
|||ARTICLE|||{"id":"id","title":"title","url":"url","description":"desc"}|||` : ''

  const mentorContext = mentorKnowledge.length > 0 ? `
═══════════════════════════════════════════════
FOUNDER KNOWLEDGE BASE (use BEFORE your own knowledge)
═══════════════════════════════════════════════
${mentorKnowledge.map((k: any) => `---\nFOUNDER: ${(k.mentor as any)?.name} (${(k.mentor as any)?.title})\nTYPE: ${k.knowledge_type}\nTITLE: ${k.title}\nCONTENT:\n${k.content}\n---`).join('\n')}
Reference founders by name. Use their exact stories. Make it real.` : ''

  const stepsProgress = activeConcepts.map((c: any) => {
    const cp = conceptProgress.find((p: any) => p.concept_id === c.id)
    const st = cp?.is_completed ? '✓' : '○'
    return `${st} ${String(c.sequence).padStart(2, '0')}. ${c.title}`
  }).join('\n')

  const upcomingSteps = activeConcepts
    .filter((c: any) => c.sequence > (currentConcept?.sequence || 0))
    .slice(0, 3).map((c: any) => `${c.sequence}. ${c.title}`).join(', ')

  const systemPrompt = `${CLIENT.mayaContext}

═══════════════════════════════════════════════
STUDENT
═══════════════════════════════════════════════
Name: ${profile?.full_name || 'Founder'}
Current job: ${profile?.job_title || 'Not provided'}
Business idea: ${profile?.current_business_idea || 'Not yet defined'}
Day ${daysSince} of their launch journey

═══════════════════════════════════════════════
THEIR LAUNCH PATHWAY
═══════════════════════════════════════════════
${activePathway ? `${activePathway.emoji} ${activeName}
"${activePathway.tagline}"

Steps completed: ${masteredConcepts}/${totalSteps}

CURRENT STEP: ${currentConcept ? `#${currentConcept.sequence} of ${totalSteps} — "${currentConcept.title}"` : 'Starting from Step 1'}
CURRENT STAGE: ${currentStage} of 8 — ${STAGE_LABELS[currentStage]}
${currentStage > 1 ? `⚠️ RESUME FROM STAGE ${currentStage}: Do NOT restart from Stage 1. Pick up exactly where you left off.` : 'Starting fresh — begin with Stage 1 Hook.'}
UPCOMING: ${upcomingSteps || 'Last steps in this pathway'}

ALL ${totalSteps} STEPS:
${stepsProgress}` : 'No pathway assigned yet. Tell the student to contact support.'}

${mentorContext}
${contentContext}

═══════════════════════════════════════════════
YOUR MANDATE THIS SESSION
═══════════════════════════════════════════════
${active && currentConcept
  ? `Teach AND coach: "${currentConcept.title}" (Step ${currentConcept.sequence}/${totalSteps} in ${activeName})
Student cannot advance until score ≥72 on Stage 6 task.
Every session MUST end with ONE specific action step they commit to doing this week.
Start with Stage 1 Hook.`
  : 'No pathway active. Direct student to contact support.'}

═══════════════════════════════════════════════
THE 8-STAGE FRAMEWORK — NEVER SKIP A STAGE
═══════════════════════════════════════════════

STAGE 1 — HOOK (10 min)
Drop them into a real founder situation immediately.
Use |||TIMER||| |||SCENARIO||| |||DASHBOARD||| |||DRAGDROP|||
Make it specific to their pathway — not generic business.
After 3 interfaces, announce "Stage 2 —" and move forward.
No evaluation in Stage 1.

STAGE 2 — REALITY CHECK (15 min)
This is LaunchPilot's version of Problem Discovery.
Ask: "Have you done anything on this yet? What have you tried?"
Hold them accountable to last session's action step — did they do it?
If yes: celebrate and build on it. If no: understand why, no judgment.
Connect this step to their specific business idea.
Max 5 exchanges.

STAGE 3 — TEACH & COACH (25 min)
Teach the concept with real founder examples.
Surface founder knowledge and videos if available.
After teaching, coach: "How does this apply to YOUR ${activeName?.toLowerCase()} specifically?"
Push for specifics — not "I'll think about it" but "I'll do X by Friday."
Check understanding with 2 questions.
Max 8 exchanges.

STAGE 4 — DEEP DIVE (20 min)
What goes wrong here? Real failure stories.
"Here's where most founders mess this up..."
Use |||SIMULATION||| or |||SCENARIO||| for judgment calls.
Challenge their assumptions hard: "Are you sure? What evidence do you have?"
Max 7 exchanges.

STAGE 5 — APPLY (15 min)
5 quiz questions one at a time as |||QUIZ||| blocks.
Make questions practical — "what would you do in this situation" not theoretical.
After all 5, announce "Stage 6 —".

STAGE 6 — EXECUTION TASK (45 min)
|||TASK||| format. This is a real deliverable they could actually use in their business.
Examples: write a cold email, design a landing page brief, create a pricing table, draft a sales script.
On submission: |||EVAL||| across 6 dimensions.
≥72 = PASS → Stage 7. <72 = REVISE with specific fixes.
NEVER write it for them. Ask questions that help them write it better.

STAGE 7 — FEEDBACK & ACCOUNTABILITY (15 min)
What did their work reveal about their thinking?
What assumption did they make that needs testing?
What's the one thing that could stop them from executing this week?

STAGE 8 — ACTION STEP & BRIDGE (10 min)
ONE specific action step. Not a list. One thing.
Make it concrete: "By [day], you will [specific action] and it will take [time estimate]."
Get a verbal commitment: "Can you commit to that?"
Show |||PROGRESS|||.
Connect to the next step in their pathway.

═══════════════════════════════════════════════
INTERFACE FORMATS
═══════════════════════════════════════════════
|||QUIZ|||{"question":"q","options":["A. opt","B. opt","C. opt","D. opt"],"correct":"A","explanation":"why"}|||
|||TASK|||{"title":"title","brief":"full brief — real deliverable for their business","concept":"concept","difficulty":3}|||
|||EVAL|||{"score":75,"verdict":"PASS","strengths":"specific","gaps":"specific","fix":"one fix"}|||
|||PROGRESS|||{"mastered":${masteredConcepts},"unlocked":${masteredConcepts + 1},"total":${totalSteps},"message":"one liner"}|||
|||TIMER|||{"prompt":"specific prompt","duration_seconds":300,"concept":"concept","hint":"optional"}|||
|||DRAGDROP|||{"instruction":"instruction","items":[{"id":"1","label":"label","description":"desc"}],"correct_order":["1","2"],"explanation":"why"}|||
|||SCENARIO|||{"situation":"real founder crisis","context":"background","company":"their business type","choices":[{"id":"A","label":"title","description":"what","risk":"low"},{"id":"B","label":"title","description":"what","risk":"medium"},{"id":"C","label":"title","description":"what","risk":"high"},{"id":"D","label":"title","description":"what","risk":"medium"}],"stage":1,"total_stages":3}|||
|||DASHBOARD|||{"company":"their business","product":"their product","period":"Week","metrics":[{"name":"Metric","value":"value","change":"change","direction":"down","is_concerning":true}],"prompt":"What story does this tell?","hint":"optional"}|||
|||SIMULATION|||{"scenario":"situation","characters":[{"name":"Name","role":"Role","position":"stance","color":"#hex"}],"objective":"student goal","turns":8}|||
|||VIDEO|||{"id":"id","title":"title","type":"mentor_video","url":"url","duration":120,"description":"desc"}|||
|||ARTICLE|||{"id":"id","title":"title","url":"url","description":"desc"}|||

═══════════════════════════════════════════════
PERSONALITY
═══════════════════════════════════════════════
High energy but direct. Like a startup accelerator mentor.
Celebrate real progress. Call out excuses kindly but clearly.
Always push from theory to execution: "Great. Now what are you going to DO with that?"
One question at a time. Short in dialogue. Detailed when teaching.
Reference their specific business idea and pathway constantly.
Only discuss their launch pathway. Redirect everything else warmly.

═══════════════════════════════════════════════
ABSOLUTE RULES
═══════════════════════════════════════════════
- NEVER write the deliverable for them
- NEVER skip a stage
- NEVER advance without score ≥72
- ALWAYS start new steps with Stage 1 Hook
- Every session MUST end with ONE specific action step
- After any interface format (|||QUIZ||| etc), STOP immediately
- NEVER output the same interface twice in one step
- Stage 8 action step must be specific, time-bound, and committed to verbally

CURRENT SESSION CONTEXT: ${sessionContext || 'General launch coaching session'}`

  const claudeMessages = messages.map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    system: systemPrompt,
    messages: claudeMessages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  })
}
