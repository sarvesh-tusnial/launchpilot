import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { name, idea, category, bizName, challenges, stage, trackNames } = await req.json()

    const prompt = `You are a startup advisor. Generate a personalised program plan for this founder.
FOUNDER: ${name}
BUSINESS: ${bizName}
CATEGORY: ${category}
IDEA: ${idea}
STAGE: ${stage}
TOP CHALLENGES: ${challenges.slice(0, 3).join(', ')}
TRACKS: ${trackNames.join(', ')}
Return ONLY valid JSON:
{
  "headline": "one powerful line about what this founder can achieve — specific to their business, max 12 words",
  "track_descriptions": ["1 sentence on what they learn in track 1 specific to ${bizName}", "track 2", "track 3"],
  "critical_questions": ["sharp question max 10 words", "question 2", "question 3", "question 4"],
  "timeline": [
    { "month": "Month 1", "milestone": "short title", "description": "specific to ${bizName}" },
    { "month": "Month 2", "milestone": "...", "description": "..." },
    { "month": "Month 3", "milestone": "...", "description": "..." },
    { "month": "Month 4", "milestone": "...", "description": "..." },
    { "month": "Month 5", "milestone": "...", "description": "..." },
    { "month": "Month 6", "milestone": "...", "description": "..." }
  ],
  "tools_highlight": "1 sentence on the most useful tools for ${bizName} from our 500+ deals platform"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())

    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
