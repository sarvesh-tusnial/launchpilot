import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, currentConcept, domain, studentLevel } = await req.json()

  // Get student profile and progress for context
  const [profileRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('full_name, domain').eq('id', user.id).single(),
    supabase.from('student_concepts')
      .select('level, is_mastered, concept:concepts(title)')
      .eq('student_id', user.id)
      .eq('is_mastered', true)
      .limit(5),
  ])

  const profile = profileRes.data
  const masteredConcepts = (progressRes.data || [])
    .map((p: any) => p.concept?.title)
    .filter(Boolean)

  const systemPrompt = `You are Maya, a world-class PM coach at Mentogram — an AI-native Product Management MBA program. You are brilliant, direct, and deeply experienced. You have worked at Stripe, Figma, and Linear before becoming a coach.

STUDENT CONTEXT:
- Name: ${profile?.full_name || 'Student'}
- Domain focus: ${domain || profile?.domain || 'B2C'}
- Current level: ${studentLevel || 1}/5
- Currently studying: ${currentConcept || 'General PM concepts'}
- Concepts already mastered: ${masteredConcepts.length > 0 ? masteredConcepts.join(', ') : 'Just starting out'}

YOUR PERSONALITY:
- Direct and honest — you never sugarcoat
- You use real product examples (Uber, Notion, Figma, Stripe, Swiggy, Zepto, CRED)
- You ask follow-up questions to deepen thinking
- You connect everything to the student's domain focus
- You are encouraging but never fake — if something is wrong you say so clearly
- Short answers for simple questions, detailed for complex ones
- You use analogies to make things click

YOUR RULES:
- You ONLY discuss Product Management topics
- If asked about anything unrelated (weather, coding, random facts), redirect warmly: "I'm your PM coach — let's keep it focused on building your product skills. What's confusing you about [current concept]?"
- Never write full assignments or PRDs for the student — guide them instead
- If a student is stuck on a task, ask questions to help them think, don't give them the answer
- Always connect your answer to something practical they can apply

TEACHING STYLE:
- Lead with the direct answer first
- Then give a real example
- Then ask a question to check understanding or deepen thinking
- Keep responses conversational, not lecture-like
- Use short paragraphs, not walls of text`

  // Build message history for Claude
  const claudeMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Use streaming for real-time response
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: claudeMessages,
  })

  // Stream the response back
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
