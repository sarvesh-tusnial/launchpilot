'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Profile } from '@/types'

// ============================================
// INTERFACES
// ============================================
interface QuizData { question: string; options: string[]; correct: string; explanation: string }
interface TaskData { title: string; brief: string; concept: string; difficulty: number }
interface EvalData { score: number; verdict: 'PASS' | 'REVISE' | 'RELEARN'; strengths: string; gaps: string; fix: string }
interface ProgressData { mastered: number; unlocked: number; total: number; message: string }
interface VideoData { id: string; title: string; type: 'mentor_video' | 'youtube'; url?: string; duration?: number; description?: string }
interface ArticleData { id: string; title: string; url: string; description?: string }
interface CaseStudyData { id: string; title: string; description?: string }

interface SimulationData {
  scenario: string
  characters: Array<{ name: string; role: string; position: string; color: string }>
  objective: string
  turns: number
}

interface TimerData {
  prompt: string
  duration_seconds: number
  concept: string
  hint?: string
}

interface DragDropData {
  instruction: string
  items: Array<{ id: string; label: string; description: string }>
  correct_order: string[]
  explanation: string
}

interface InterviewData {
  company: string
  role: string
  interviewer_name: string
  opening_question: string
  duration_minutes: number
}

interface ScenarioBranchData {
  situation: string
  context: string
  company: string
  choices: Array<{
    id: string
    label: string
    description: string
    risk: 'low' | 'medium' | 'high'
  }>
  stage: number
  total_stages: number
}

interface DataDashboardData {
  company: string
  product: string
  period: string
  metrics: Array<{
    name: string
    value: string
    change: string
    direction: 'up' | 'down' | 'flat'
    is_concerning: boolean
  }>
  prompt: string
  hint?: string
}

type SpecialBlock =
  | { type: 'quiz'; data: QuizData }
  | { type: 'task'; data: TaskData }
  | { type: 'eval'; data: EvalData }
  | { type: 'progress'; data: ProgressData }
  | { type: 'video'; data: VideoData }
  | { type: 'article'; data: ArticleData }
  | { type: 'casestudy'; data: CaseStudyData }
  | { type: 'simulation'; data: SimulationData }
  | { type: 'timer'; data: TimerData }
  | { type: 'dragdrop'; data: DragDropData }
  | { type: 'interview'; data: InterviewData }
  | { type: 'scenario'; data: ScenarioBranchData }
  | { type: 'dashboard'; data: DataDashboardData }

interface MessagePart { text?: string; special?: SpecialBlock }
interface Message { id: string; role: 'user' | 'assistant'; parts: MessagePart[]; timestamp: Date }
interface Props {
  profile: Profile | null
  openingMessage: string
  sessionContext: string
  chatHistory?: Array<{ role: string; content: string; created_at: string }>
  currentConceptId?: string
  currentStage?: number
}

// ============================================
// PARSER
// ============================================
function parseMessage(raw: string): MessagePart[] {
  const parts: MessagePart[] = []
  const regex = /\|\|\|(QUIZ|TASK|EVAL|PROGRESS|VIDEO|ARTICLE|CASESTUDY|SIMULATION|TIMER|DRAGDROP|INTERVIEW|SCENARIO|DASHBOARD)\|\|\|(.*?)\|\|\|/gs
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > last) {
      const text = raw.slice(last, match.index).trim()
      if (text) parts.push({ text })
    }
try {
      const sanitised = match[2].trim().replace(/[\u0000-\u001F]/g, m => m === '\n' ? '\\n' : m === '\t' ? '\\t' : '')
      const data = JSON.parse(sanitised)
      parts.push({ special: { type: match[1].toLowerCase() as any, data } })
    } catch { parts.push({ text: match[0] }) }
    last = match.index + match[0].length
  }
  const remaining = raw.slice(last).trim()
  if (remaining) parts.push({ text: remaining })
  return parts.length > 0 ? parts : [{ text: raw }]
}

function textToMsg(text: string, role: 'user' | 'assistant', id?: string): Message {
  return { id: id || Date.now().toString(), role, parts: parseMessage(text), timestamp: new Date() }
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function MayaChat({ profile, openingMessage, sessionContext, chatHistory = [], currentConceptId, currentStage = 1 }: Props) {
  // Build initial messages from history + opening
  const buildInitialMessages = (): Message[] => {
    if (chatHistory.length > 0) {
      // Load history + show opening as latest Maya message
      const historyMessages: Message[] = chatHistory.map((m, i) => ({
        id: `history-${i}`,
        role: m.role as 'user' | 'assistant',
        parts: parseMessage(m.content),
        timestamp: new Date(m.created_at),
      }))
      // Add today's opening
      return [...historyMessages, textToMsg(openingMessage, 'assistant', 'opening')]
    }
    return [textToMsg(openingMessage, 'assistant', 'opening')]
  }

  const [messages, setMessages] = useState<Message[]>(buildInitialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [activeTask, setActiveTask] = useState<TaskData | null>(null)
  const [taskSubmission, setTaskSubmission] = useState('')
  const [interviewMode, setInterviewMode] = useState(false)
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)

  // Voice state
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [recording, setRecording] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Whiteboard state
  const [showWhiteboard, setShowWhiteboard] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const stageExchangeRef = useRef(0)
  const activeStageRef = useRef(currentStage || 1)  // ← add this

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Text-to-speech for Maya's responses
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/\|\|\|.*?\|\|\|/gs, '').replace(/\*\*/g, '').trim()
    if (!clean) return
    const utt = new SpeechSynthesisUtterance(clean)
    utt.rate = 1.0
    utt.pitch = 1.0
    utt.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
    if (preferred) utt.voice = preferred
    window.speechSynthesis.speak(utt)
  }, [ttsEnabled])

  // Start voice recording
  const startRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome.')
      return
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('')
      setInput(transcript)
    }

    recognition.onend = () => {
      setRecording(false)
    }

    recognition.onerror = () => {
      setRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setRecording(false)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || streaming) return
    const userMsg = textToMsg(content.trim(), 'user')
    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = { id: assistantId, role: 'assistant', parts: [], timestamp: new Date() }
    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setStreaming(true)

    // Save user message
    fetch('/api/chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: content.trim() }),
    })

const history = [...messages, userMsg].slice(-30).map(m => ({ role: m.role, content: m.parts.map(p => p.text || '').join(' ') }))
abortRef.current = new AbortController()

      // Stage-specific interface enforcement
// Track interface count per stage
const STAGE_HINTS: Record<number, string> = {
        1: stageExchangeRef.current >= 3
          ? '[STAGE 1 DONE]: You have shown 3 hook interfaces. Do NOT show any more. Announce "Stage 2 —" now.'
          : '[STAGE 1]: Show ONE hook interface only (|||TIMER||| or |||SCENARIO||| or |||DASHBOARD||| or |||DRAGDROP|||). One interface, then stop and wait for the student to respond.',
        2: '[STAGE 2 — PROBLEM DISCOVERY]: Ask the student questions about their real world experience with this concept. Plain text only. No interfaces. No teaching yet.',
        3: '[STAGE 3 — CONCEPT DELIVERY]: Teach the concept through dialogue. Plain text only. No interfaces. No hooks.',
        4: '[STAGE 4 — DEEP DIVE]: Explore edge cases and nuance. Plain text only. No interfaces.',
        5: stageExchangeRef.current >= 5
          ? '[STAGE 5 DONE]: You have asked 5 quiz questions. Announce "Stage 6 —" now.'
          : '[STAGE 5]: Ask ONE |||QUIZ||| question only. Wait for the student to answer before asking the next.',
        6: '[STAGE 6]: Output |||TASK||| once. After student submits, output |||EVAL|||.',
        7: '[STAGE 7 — FEEDBACK]: Debrief the student on what their task revealed. Plain text only. No interfaces.',
        8: '[STAGE 8]: Output |||PROGRESS||| once.',
      }
      const stageHint = STAGE_HINTS[activeStageRef.current]  // ← change this
      const messagesWithHint = stageHint
        ? history.map((m: any, i: number) => i === history.length - 1 ? { ...m, content: m.content + `\n\n${stageHint}` } : m)
        : history

try {
  const res = await fetch('/api/maya', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messagesWithHint, sessionContext }),
    signal: abortRef.current.signal,
  })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, parts: parseMessage(full) } : m))
      }

      // Save assistant message
      fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: full }),
      })

      // Speak Maya's response if TTS enabled
      const textParts = parseMessage(full).filter(p => p.text).map(p => p.text || '').join(' ')
      if (ttsEnabled && textParts) speakText(textParts)

      const finalParts = parseMessage(full)
      const taskBlock = finalParts.find(p => p.special?.type === 'task')
      if (taskBlock?.special?.type === 'task') setActiveTask(taskBlock.special.data)
      const interviewBlock = finalParts.find(p => p.special?.type === 'interview')
      if (interviewBlock?.special?.type === 'interview') {
        setInterviewData(interviewBlock.special.data)
        setInterviewMode(true)
      }
      const interfaceShown = finalParts.some(p => p.special?.type)
      if (interfaceShown) stageExchangeRef.current += 1

      // Stage tracking — when Maya announces a new stage, save it
const stageDetected = full.match(/Stage\s+([1-8])\s*[—\-–]/i)
      if (stageDetected && currentConceptId) {
        const newStage = parseInt(stageDetected[1])
        activeStageRef.current = newStage // add this line
        stageExchangeRef.current = 0        // ← add this line
        fetch('/api/stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept_id: currentConceptId,
            stage: newStage,
          }),
        }).catch(err => console.error('Stage update failed:', err))
      }  // ─────────────────────────────────────────────────────────────────
// ADD THESE LINES in MayaChat.tsx inside sendMessage()
// Place them RIGHT AFTER this existing block (around line 268-275):
//
//   const finalParts = parseMessage(full)
//   const taskBlock = finalParts.find(p => p.special?.type === 'task')
//   if (taskBlock?.special?.type === 'task') setActiveTask(taskBlock.special.data)
//   const interviewBlock = finalParts.find(p => p.special?.type === 'interview')
//   if (interviewBlock?.special?.type === 'interview') {
//     setInterviewData(interviewBlock.special.data)
//     setInterviewMode(true)
//   }
//
// ADD THIS BLOCK IMMEDIATELY AFTER:
// ─────────────────────────────────────────────────────────────────
      // ── Progress tracking — fires when Maya gives PASS eval ──
      const evalBlock = finalParts.find(p => p.special?.type === 'eval')
      if (evalBlock?.special?.type === 'eval') {
        const evalData = evalBlock.special.data

        // ── Save every eval attempt to submissions table ──
        // Save eval result to database
        if (currentConceptId) {
          fetch('/api/save-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              concept_id: currentConceptId,
              score:      evalData.score,
              verdict:    evalData.verdict,
              strengths:  evalData.strengths,
              gaps:       evalData.gaps,
              fix:        evalData.fix,
            }),
          }).catch(err => console.error('Submission save failed:', err))
        }

        if (evalData.verdict === 'PASS' && evalData.score >= 72) {
          // Extract competency code and concept sequence from sessionContext
          const compMatch = sessionContext.match(/Active competency:\s*([A-Z]\d+)/i)
          const seqMatch  = sessionContext.match(/Current Concept.*?#(\d+)/i)
          
          const competency_code  = compMatch?.[1] || null
          const concept_sequence = seqMatch ? parseInt(seqMatch[1]) : null

          if (competency_code && concept_sequence) {
            fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                competency_code,
                concept_sequence,
                score: evalData.score,
              }),
            })
            .then(r => r.json())
            .then(result => {
              if (result.action === 'next_concept_unlocked') {
                console.log(`✓ Concept passed. Next: ${result.next}`)
              } else if (result.action === 'competency_completed_next_unlocked') {
                console.log(`✓ Competency ${result.completed_comp} complete! Starting ${result.next_comp_code}`)
              } else if (result.action === 'program_complete') {
                console.log('🎉 Program complete!')
              }
            })
            .catch(err => console.error('Progress update failed:', err))
          }
        }
      } 
      // Stage tracking
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, parts: [{ text: 'Something went wrong. Try again.' }] } : m))
      }
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }, [messages, streaming, sessionContext])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const submitTask = async () => {
    if (!taskSubmission.trim() || !activeTask) return
    const content = `[TASK SUBMISSION for "${activeTask.title}"]\n\n${taskSubmission}`
    setActiveTask(null)
    setTaskSubmission('')
    await sendMessage(content)
  }

  const endInterview = () => {
    setInterviewMode(false)
    sendMessage('[INTERVIEW ENDED — Please evaluate my performance and give me a full debrief with score, what I did well, what I missed, and specific improvements.]')
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Interview mode banner */}
      {interviewMode && interviewData && (
        <div style={{
          position: 'fixed', top: '52px', left: 0, right: 0, zIndex: 90,
          background: 'rgba(255,106,0,0.95)', padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#000' }}>
              LIVE INTERVIEW — {interviewData.company} · {interviewData.interviewer_name}
            </span>
          </div>
          <button onClick={endInterview} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '12px', color: '#000', fontWeight: '600', cursor: 'pointer' }}>
            End Interview & Get Feedback
          </button>
        </div>
      )}

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: '760px', margin: '0 auto', width: '100%',
        padding: `0 24px`, paddingTop: interviewMode ? '52px' : '0',
      }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              profile={profile}
              onOptionSelect={sendMessage}
              isLast={idx === messages.length - 1}
              streaming={streaming && idx === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Task submission panel */}
        {activeTask && (
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '12px', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Task Active — {activeTask.title}
            </div>
            <textarea
              value={taskSubmission}
              onChange={e => setTaskSubmission(e.target.value)}
              placeholder="Write your full response here..."
              rows={6}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveTask(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', color: 'var(--text3)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitTask} disabled={taskSubmission.trim().length < 50}
                style={{ background: taskSubmission.trim().length >= 50 ? 'var(--amber)' : 'var(--bg4)', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontWeight: '600', color: taskSubmission.trim().length >= 50 ? '#000' : 'var(--text3)', cursor: taskSubmission.trim().length >= 50 ? 'pointer' : 'default' }}>
                Submit Task →
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ flexShrink: 0, paddingBottom: '20px' }}>

          {/* Voice / TTS / Whiteboard controls */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            {/* Voice input toggle */}
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              title={voiceEnabled ? 'Disable voice input' : 'Enable voice input'}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                border: `1px solid ${voiceEnabled ? 'rgba(255,106,0,0.4)' : 'var(--border)'}`,
                background: voiceEnabled ? 'rgba(255,106,0,0.1)' : 'var(--bg3)',
                color: voiceEnabled ? 'var(--accent2)' : 'var(--text3)',
                cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              🎤 {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
            </button>

            {/* TTS toggle */}
            <button
              onClick={() => { setTtsEnabled(t => !t); if (ttsEnabled) window.speechSynthesis?.cancel() }}
              title={ttsEnabled ? 'Disable Maya speaking' : 'Enable Maya to speak responses'}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                border: `1px solid ${ttsEnabled ? 'rgba(45,212,191,0.4)' : 'var(--border)'}`,
                background: ttsEnabled ? 'rgba(45,212,191,0.08)' : 'var(--bg3)',
                color: ttsEnabled ? 'var(--teal)' : 'var(--text3)',
                cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              🔊 {ttsEnabled ? 'Maya Speaks' : 'Maya Silent'}
            </button>

            {/* Whiteboard toggle */}
            <button
              onClick={() => setShowWhiteboard(w => !w)}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                border: `1px solid ${showWhiteboard ? 'rgba(123,92,240,0.4)' : 'var(--border)'}`,
                background: showWhiteboard ? 'rgba(123,92,240,0.1)' : 'var(--bg3)',
                color: showWhiteboard ? 'var(--accent2)' : 'var(--text3)',
                cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              ◈ {showWhiteboard ? 'Close Board' : 'Whiteboard'}
            </button>

            {recording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.3)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--coral)', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '11px', color: 'var(--coral)' }}>Listening...</span>
              </div>
            )}
          </div>

          {/* Whiteboard panel */}
          {showWhiteboard && (
            <Whiteboard onSubmit={(description) => {
              setShowWhiteboard(false)
              sendMessage(`[WHITEBOARD SUBMISSION]\n\n${description}`)
            }} />
          )}

          {/* Text / Voice input box */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 16px', transition: 'border-color 0.2s' }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,106,0,0.4)')}
            onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={recording ? '🎤 Listening — speak now...' : interviewMode ? `Reply to ${interviewData?.interviewer_name}...` : streaming ? 'Maya is typing...' : 'Reply to Maya... or use 🎤 to speak'}
              disabled={streaming || recording}
              rows={1}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'none', lineHeight: '1.6', maxHeight: '100px', overflowY: 'auto' }}
              onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>
                {interviewMode ? '🔴 Interview in progress' : 'Enter to send · Shift+Enter for new line'}
              </span>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {/* Voice record button */}
                {voiceEnabled && (
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={streaming}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: recording ? 'rgba(249,112,102,0.15)' : 'var(--bg3)',
                      border: `1px solid ${recording ? 'rgba(249,112,102,0.4)' : 'var(--border)'}`,
                      color: recording ? 'var(--coral)' : 'var(--text3)',
                      cursor: 'pointer', fontSize: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: recording ? 'pulse 1s infinite' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {recording ? '⏹' : '🎤'}
                  </button>
                )}

                {/* Send / Stop button */}
                <button
                  onClick={() => streaming ? abortRef.current?.abort() : sendMessage(input)}
                  style={{
                    background: streaming ? 'rgba(249,112,102,0.1)' : input.trim() ? 'var(--accent)' : 'var(--bg4)',
                    border: streaming ? '1px solid rgba(249,112,102,0.2)' : 'none',
                    borderRadius: '8px', padding: '6px 16px',
                    fontSize: '13px', fontWeight: '500',
                    color: streaming ? 'var(--coral)' : input.trim() ? 'white' : 'var(--text3)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {streaming ? 'Stop' : 'Send →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes whiteboardFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}

// ============================================
// MESSAGE BUBBLE
// ============================================
function MessageBubble({ message, profile, onOptionSelect, isLast, streaming }: {
  message: Message; profile: Profile | null; onOptionSelect: (t: string) => void; isLast: boolean; streaming: boolean
}) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', gap: '12px', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', background: isUser ? 'var(--bg4)' : 'rgba(255,106,0,0.15)', border: `1px solid ${isUser ? 'var(--border)' : 'rgba(255,106,0,0.3)'}`, color: isUser ? 'var(--text2)' : 'var(--accent2)', marginTop: '2px' }}>
        {isUser ? (profile?.full_name?.[0] || 'Y') : 'M'}
      </div>
      <div style={{ maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {isUser ? (profile?.full_name?.split(' ')[0] || 'You') : 'Maya'}
        </div>
        {message.parts.length === 0 && streaming && <TypingDots />}
        {message.parts.map((part, i) => (
          <div key={i}>
            {part.text && (
              <div style={{ background: isUser ? 'rgba(255,106,0,0.08)' : 'var(--bg2)', border: `1px solid ${isUser ? 'rgba(255,106,0,0.15)' : 'var(--border)'}`, borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '12px 16px' }}>
                <FormattedText text={part.text} />
              </div>
            )}
            {part.special && <SpecialCard block={part.special} onOptionSelect={onOptionSelect} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text3)', animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}

function FormattedText({ text }: { text: string }) {
  return (
    <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.75' }}>
      {text.split('\n').map((line, i, arr) => {
        const segments = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={i} style={{ margin: 0, marginBottom: i < arr.length - 1 ? '8px' : 0 }}>
            {segments.map((seg, j) =>
              seg.startsWith('**') && seg.endsWith('**')
                ? <strong key={j} style={{ color: 'var(--text)', fontWeight: '600' }}>{seg.slice(2, -2)}</strong>
                : <span key={j}>{seg}</span>
            )}
          </p>
        )
      })}
    </div>
  )
}

// ============================================
// WHITEBOARD COMPONENT
// ============================================
function Whiteboard({ onSubmit }: { onSubmit: (description: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text' | 'rect' | 'arrow'>('pen')
  const [color, setColor] = useState('#FF8C00')
  const [strokeSize, setStrokeSize] = useState(2)
  const [description, setDescription] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const COLORS = ['#FF8C00', '#FFFFFF', '#4ADE80', '#60A5FA', '#F472B6', '#F97066', '#2DD4BF']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#18181F'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setDrawing(true)
    const pos = getPos(e, canvas)
    lastPos.current = pos

    if (tool === 'rect') {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.strokeStyle = color
      ctx.lineWidth = strokeSize
      ctx.strokeRect(pos.x - 40, pos.y - 20, 80, 40)
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.strokeStyle = tool === 'eraser' ? '#18181F' : color
      ctx.lineWidth = tool === 'eraser' ? 20 : strokeSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (lastPos.current) {
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      }
    } else if (tool === 'arrow') {
      // Draw arrow
      if (lastPos.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Can't redraw history easily, so just draw line
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = strokeSize
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        // Arrowhead
        const angle = Math.atan2(pos.y - lastPos.current.y, pos.x - lastPos.current.x)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x - 12 * Math.cos(angle - Math.PI / 6), pos.y - 12 * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(pos.x - 12 * Math.cos(angle + Math.PI / 6), pos.y - 12 * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
      }
    }

    lastPos.current = pos
  }

  const stopDraw = () => { setDrawing(false); lastPos.current = null }

  const addText = (e: React.MouseEvent) => {
    if (tool !== 'text') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    const text = window.prompt('Enter text:')
    if (text) {
      ctx.font = '16px DM Sans, sans-serif'
      ctx.fillStyle = color
      ctx.fillText(text, pos.x, pos.y)
    }
  }

  const clearBoard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#18181F'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleSubmit = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const desc = description.trim() || 'I drew a diagram on the whiteboard.'
    onSubmit(`${desc}\n\n[Whiteboard diagram created — canvas data available]`)
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid rgba(123,92,240,0.25)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', animation: 'whiteboardFade 0.2s ease' }}>
      {/* Toolbar */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(123,92,240,0.05)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: '4px' }}>◈ Whiteboard</span>

        {/* Tools */}
        {(['pen', 'eraser', 'text', 'rect', 'arrow'] as const).map(t => (
          <button key={t} onClick={() => setTool(t)}
            style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: `1px solid ${tool === t ? 'var(--accent)' : 'var(--border)'}`, background: tool === t ? 'rgba(123,92,240,0.15)' : 'var(--bg3)', color: tool === t ? 'var(--accent2)' : 'var(--text3)', cursor: 'pointer', transition: 'all 0.15s' }}>
            {t === 'pen' ? '✏️' : t === 'eraser' ? '⬜' : t === 'text' ? 'T' : t === 'rect' ? '▭' : '→'}
          </button>
        ))}

        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Colors */}
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)}
            style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: `2px solid ${color === c ? 'white' : 'transparent'}`, cursor: 'pointer', transition: 'border 0.15s' }} />
        ))}

        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Stroke size */}
        <select value={strokeSize} onChange={e => setStrokeSize(Number(e.target.value))}
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer' }}>
          {[1, 2, 4, 8].map(s => <option key={s} value={s}>{s}px</option>)}
        </select>

        <button onClick={clearBoard}
          style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text3)', cursor: 'pointer' }}>
          Clear
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={740}
        height={300}
        onMouseDown={tool === 'text' ? addText : startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
        style={{ display: 'block', width: '100%', height: '300px', cursor: tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair', touchAction: 'none' }}
      />

      {/* Submit area */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what you drew (optional) — e.g. 'This is my RICE prioritisation framework'"
          style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif' }}
        />
        <button onClick={handleSubmit}
          style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', border: 'none', fontSize: '13px', fontWeight: '600', color: '#000', cursor: 'pointer', flexShrink: 0 }}>
          Send to Maya →
        </button>
      </div>
    </div>
  )
}

// ============================================
// SPECIAL CARDS
// ============================================
function SpecialCard({ block, onOptionSelect }: { block: SpecialBlock; onOptionSelect: (t: string) => void }) {

  // ---- QUIZ ----
  if (block.type === 'quiz') {
    const d = block.data
    const [selected, setSelected] = useState<string | null>(null)
    const [revealed, setRevealed] = useState(false)
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,106,0,0.25)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,106,0,0.06)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Quick Check</div>
          <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.5', margin: 0 }}>{d.question}</p>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {d.options.map((opt, i) => {
            const letter = opt.split('.')[0].trim()
            const isSelected = selected === letter
            const isCorrect = letter === d.correct
            return (
              <button key={i} onClick={() => { if (revealed) return; setSelected(letter); setRevealed(true); setTimeout(() => onOptionSelect(isCorrect ? `Correct! ${d.explanation}` : `Not quite. Correct answer is ${d.correct}. ${d.explanation}`), 600) }}
                style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${revealed && isCorrect ? 'rgba(74,222,128,0.4)' : revealed && isSelected && !isCorrect ? 'rgba(249,112,102,0.4)' : isSelected ? 'var(--accent)' : 'var(--border)'}`, background: revealed && isCorrect ? 'rgba(74,222,128,0.08)' : revealed && isSelected && !isCorrect ? 'rgba(249,112,102,0.08)' : isSelected ? 'rgba(255,106,0,0.1)' : 'var(--bg3)', color: 'var(--text)', fontSize: '14px', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                {opt}
                {revealed && isCorrect && <span style={{ float: 'right', color: 'var(--green)' }}>✓</span>}
                {revealed && isSelected && !isCorrect && <span style={{ float: 'right', color: 'var(--coral)' }}>✗</span>}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ---- TASK ----
  if (block.type === 'task') {
    const d = block.data
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Task Assigned</div>
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{'◆'.repeat(d.difficulty)}{'◇'.repeat(5 - d.difficulty)}</span>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>{d.title}</div>
          <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>{d.brief}</p>
          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>Submit your response in the panel below ↓</div>
        </div>
      </div>
    )
  }

  // ---- EVAL ----
  if (block.type === 'eval') {
    const d = block.data
    const color = d.verdict === 'PASS' ? 'var(--teal)' : d.verdict === 'REVISE' ? 'var(--amber)' : 'var(--coral)'
    const bg = d.verdict === 'PASS' ? 'rgba(45,212,191,0.06)' : d.verdict === 'REVISE' ? 'rgba(245,158,11,0.06)' : 'rgba(249,112,102,0.06)'
    const border = d.verdict === 'PASS' ? 'rgba(45,212,191,0.25)' : d.verdict === 'REVISE' ? 'rgba(245,158,11,0.25)' : 'rgba(249,112,102,0.25)'
    return (
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Evaluation</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color }}>{d.score}/100</span>
            <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '4px', background: bg, border: `1px solid ${border}`, color }}>{d.verdict}</span>
          </div>
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>What worked</div><p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: '1.6' }}>{d.strengths}</p></div>
          <div><div style={{ fontSize: '11px', color: 'var(--coral)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>What was missing</div><p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: '1.6' }}>{d.gaps}</p></div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--amber)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Fix this</div>
            <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, fontWeight: '500', lineHeight: '1.6' }}>{d.fix}</p>
          </div>
        </div>
      </div>
    )
  }

  // ---- PROGRESS ----
  if (block.type === 'progress') {
    const d = block.data
    const pct = Math.round((d.mastered / d.total) * 100)
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Your Progress</div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
          {[{ v: d.mastered, l: 'Mastered', c: 'var(--teal)' }, { v: d.unlocked, l: 'Unlocked', c: 'var(--accent2)' }, { v: d.total, l: 'Total', c: 'var(--text2)' }].map(s => (
            <div key={s.l}><div style={{ fontSize: '24px', fontWeight: '700', color: s.c }}>{s.v}</div><div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div></div>
          ))}
        </div>
        <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--teal))', borderRadius: '3px' }} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, fontStyle: 'italic' }}>{d.message}</p>
      </div>
    )
  }

  // ---- VIDEO ----
  if (block.type === 'video') {
    const d = block.data
    const [playing, setPlaying] = useState(false)
    const ytId = d.type === 'youtube' && d.url ? (d.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] || null) : null
    const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null
    const mins = d.duration ? Math.floor(d.duration / 60) : 0
    const secs = d.duration ? d.duration % 60 : 0
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(255,106,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{d.type === 'youtube' ? 'Video Reference' : 'Mentor Video'}</span>
          {d.duration && <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: 'auto' }}>{mins}:{String(secs).padStart(2, '0')}</span>}
        </div>
        {playing && ytId ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        ) : playing && d.url ? (
          <video src={d.url} controls autoPlay style={{ width: '100%', display: 'block', maxHeight: '300px', background: '#000' }} />
        ) : (
          <div onClick={() => setPlaying(true)} style={{ position: 'relative', cursor: 'pointer', background: thumbnail ? `url(${thumbnail}) center/cover` : 'var(--bg3)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {thumbnail && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />}
            <div style={{ position: 'relative', zIndex: 1, width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,106,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#000', boxShadow: '0 4px 20px rgba(255,106,0,0.5)' }}>▶</div>
          </div>
        )}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{d.title}</div>
          {d.description && <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, lineHeight: '1.5' }}>{d.description}</p>}
        </div>
      </div>
    )
  }

  // ---- ARTICLE ----
  if (block.type === 'article') {
    const d = block.data
    const domain = (() => { try { return new URL(d.url).hostname.replace('www.', '') } catch { return d.url } })()
    return (
      <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', background: 'var(--bg2)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(45,212,191,0.04)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Reference Article</span>
          <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: 'auto' }}>{domain}</span>
        </div>
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{d.title}</div>
            {d.description && <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, lineHeight: '1.5' }}>{d.description}</p>}
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text3)', flexShrink: 0 }}>→</div>
        </div>
      </a>
    )
  }

  // ---- CASESTUDY ----
  if (block.type === 'casestudy') {
    const d = block.data
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.04)' }}>
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>📋 Case Study</span>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>{d.title}</div>
          {d.description && <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: '1.65' }}>{d.description}</p>}
        </div>
      </div>
    )
  }

  // ---- SIMULATION ----
  if (block.type === 'simulation') {
    const d = block.data
    const [started, setStarted] = useState(false)
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(249,112,102,0.25)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(249,112,102,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--coral)', animation: started ? 'pulse 1.5s infinite' : 'none' }} />
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Stakeholder Simulation</span>
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '16px', lineHeight: '1.65' }}>{d.scenario}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {d.characters.map((c, i) => (
              <div key={i} style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{c.role}</div>
                <div style={{ fontSize: '11px', color: 'var(--coral)', marginTop: '4px', fontStyle: 'italic' }}>"{c.position}"</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(249,112,102,0.06)', border: '1px solid rgba(249,112,102,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--coral)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Your Objective</div>
            <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0 }}>{d.objective}</p>
          </div>
          {!started && (
            <button onClick={() => { setStarted(true); onOptionSelect('[SIMULATION STARTED] I am ready. Begin the simulation. Play all characters simultaneously and present me with the situation.') }}
              style={{ width: '100%', padding: '12px', background: 'var(--coral)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>
              Enter the Room →
            </button>
          )}
          {started && <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', fontStyle: 'italic' }}>Simulation in progress — reply in the chat above</div>}
        </div>
      </div>
    )
  }

  // ---- TIMER CHALLENGE ----
  if (block.type === 'timer') {
    const d = block.data
    const [timeLeft, setTimeLeft] = useState(d.duration_seconds)
    const [running, setRunning] = useState(false)
    const [finished, setFinished] = useState(false)
    const [answer, setAnswer] = useState('')
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const startTimer = () => {
      setRunning(true)
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setRunning(false)
            setFinished(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    const submitAnswer = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      setRunning(false)
      setFinished(true)
      onOptionSelect(`[TIMER CHALLENGE SUBMISSION — ${d.concept}]\n\nTime taken: ${d.duration_seconds - timeLeft}s\n\nMy answer:\n${answer}`)
    }

    const mins = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    const pct = (timeLeft / d.duration_seconds) * 100
    const urgent = timeLeft < 60

    return (
      <div style={{ background: 'var(--bg2)', border: `1px solid ${urgent && running ? 'rgba(249,112,102,0.4)' : 'rgba(123,92,240,0.25)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.5s' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(123,92,240,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>⏱ Timer Challenge</span>
          {(running || finished) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '80px', height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: urgent ? 'var(--coral)' : 'var(--accent)', borderRadius: '2px', transition: 'width 1s linear, background 0.5s' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'DM Mono, monospace', color: urgent ? 'var(--coral)' : 'var(--text)', minWidth: '42px' }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.6', marginBottom: '16px' }}>{d.prompt}</p>
          {d.hint && !running && !finished && (
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px', fontStyle: 'italic' }}>Hint: {d.hint}</div>
          )}
          {!running && !finished && (
            <button onClick={startTimer} style={{ width: '100%', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>
              Start Timer — {Math.floor(d.duration_seconds / 60)} minutes
            </button>
          )}
          {running && (
            <>
              <textarea
                value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                style={{ width: '100%', background: 'var(--bg3)', border: `1px solid ${urgent ? 'rgba(249,112,102,0.3)' : 'var(--border)'}`, borderRadius: '8px', padding: '12px', fontSize: '14px', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', marginBottom: '10px', transition: 'border-color 0.5s' }}
              />
              <button onClick={submitAnswer} style={{ width: '100%', padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: 'white', cursor: 'pointer' }}>
                Submit Answer
              </button>
            </>
          )}
          {finished && timeLeft === 0 && (
            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(249,112,102,0.08)', borderRadius: '8px', fontSize: '13px', color: 'var(--coral)' }}>
              Time's up! Your answer was submitted automatically.
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- DRAG AND DROP ----
  if (block.type === 'dragdrop') {
    const d = block.data
    const [items, setItems] = useState(d.items.map((item, i) => ({ ...item, order: i })))
    const [submitted, setSubmitted] = useState(false)
    const [dragIdx, setDragIdx] = useState<number | null>(null)
    const [score, setScore] = useState<number | null>(null)

    const handleDragStart = (i: number) => setDragIdx(i)
    const handleDragOver = (e: React.DragEvent, i: number) => {
      e.preventDefault()
      if (dragIdx === null || dragIdx === i) return
      const newItems = [...items]
      const dragged = newItems.splice(dragIdx, 1)[0]
      newItems.splice(i, 0, dragged)
      setItems(newItems)
      setDragIdx(i)
    }

    const handleSubmit = () => {
      const studentOrder = items.map(item => item.id)
      let correct = 0
      studentOrder.forEach((id, i) => { if (id === d.correct_order[i]) correct++ })
      const pct = Math.round((correct / d.correct_order.length) * 100)
      setScore(pct)
      setSubmitted(true)
      onOptionSelect(`[DRAG AND DROP RESULT — ${pct}% correct]\n\nMy ranking: ${items.map(i => i.label).join(' → ')}\n\nCorrect ranking: ${d.correct_order.map(id => d.items.find(item => item.id === id)?.label).join(' → ')}\n\n${d.explanation}`)
    }

    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(45,212,191,0.05)' }}>
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Drag to Rank</span>
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', marginBottom: '16px' }}>{d.instruction}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {items.map((item, i) => {
              const isCorrect = submitted && item.id === d.correct_order[i]
              const isWrong = submitted && item.id !== d.correct_order[i]
              return (
                <div
                  key={item.id}
                  draggable={!submitted}
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDragEnd={() => setDragIdx(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '8px',
                    background: isCorrect ? 'rgba(74,222,128,0.08)' : isWrong ? 'rgba(249,112,102,0.08)' : 'var(--bg3)',
                    border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : isWrong ? 'rgba(249,112,102,0.3)' : 'var(--border)'}`,
                    cursor: submitted ? 'default' : 'grab',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', minWidth: '20px' }}>#{i + 1}</span>
                  {!submitted && <span style={{ color: 'var(--text3)', fontSize: '14px' }}>⠿</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{item.label}</div>
                    {item.description && <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{item.description}</div>}
                  </div>
                  {isCorrect && <span style={{ color: 'var(--green)', fontSize: '14px' }}>✓</span>}
                  {isWrong && <span style={{ color: 'var(--coral)', fontSize: '14px' }}>✗</span>}
                </div>
              )
            })}
          </div>
          {!submitted ? (
            <button onClick={handleSubmit} style={{ width: '100%', padding: '10px', background: 'var(--teal)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#000', cursor: 'pointer' }}>
              Submit Ranking
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', background: score! >= 70 ? 'rgba(74,222,128,0.08)' : 'rgba(249,112,102,0.08)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: score! >= 70 ? 'var(--green)' : 'var(--coral)' }}>
              {score}% correct
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- INTERVIEW ----
  if (block.type === 'interview') {
    const d = block.data
    const [accepted, setAccepted] = useState(false)
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,106,0,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,106,0,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>🎯 PM Interview — {d.company}</span>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,106,0,0.15)', border: '2px solid rgba(255,106,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--accent2)', flexShrink: 0 }}>
              {d.interviewer_name[0]}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{d.interviewer_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Hiring Manager · {d.company} · {d.duration_minutes} min interview</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent2)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Opening Question</div>
            <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>"{d.opening_question}"</p>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px', lineHeight: '1.6' }}>
            This is a live mock interview. Maya will play {d.interviewer_name} and probe your answers like a real interviewer. At the end you'll get a full debrief with score and feedback.
          </div>
          {!accepted ? (
            <button onClick={() => { setAccepted(true); onOptionSelect(`[INTERVIEW STARTED] I am ready for my interview at ${d.company}. Please begin as ${d.interviewer_name}. Start with your opening question.`) }}
              style={{ width: '100%', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#000', cursor: 'pointer' }}>
              I'm Ready — Start Interview →
            </button>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', fontStyle: 'italic' }}>Interview in progress — use the red banner above to end and get feedback</div>
          )}
        </div>
      </div>
    )
  }

  // ---- SCENARIO BRANCHING ----
  if (block.type === 'scenario') {
    const d = block.data
    const [selected, setSelected] = useState<string | null>(null)
    const [revealed, setRevealed] = useState(false)

    const riskColors: Record<string, string> = {
      low: 'rgba(74,222,128,0.15)',
      medium: 'rgba(245,158,11,0.15)',
      high: 'rgba(249,112,102,0.15)',
    }
    const riskBorders: Record<string, string> = {
      low: 'rgba(74,222,128,0.3)',
      medium: 'rgba(245,158,11,0.3)',
      high: 'rgba(249,112,102,0.3)',
    }
    const riskLabels: Record<string, string> = {
      low: '🟢 Low risk',
      medium: '🟡 Medium risk',
      high: '🔴 High risk',
    }

    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(96,165,250,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🔀</span>
            <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Decision Point
            </span>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>
            {d.company} · Stage {d.stage}/{d.total_stages}
          </span>
        </div>

        {/* Situation */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            The Situation
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.6', margin: '0 0 10px 0' }}>
            {d.situation}
          </p>
          {d.context && (
            <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.65', margin: 0, fontStyle: 'italic' }}>
              {d.context}
            </p>
          )}
        </div>

        {/* Choices */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            What do you do?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {d.choices.map((choice) => {
              const isSelected = selected === choice.id
              const isRevealed = revealed

              return (
                <button
                  key={choice.id}
                  onClick={() => {
                    if (revealed) return
                    setSelected(choice.id)
                    setRevealed(true)
                    setTimeout(() => {
                      onOptionSelect(`[SCENARIO CHOICE — Stage ${d.stage}/${d.total_stages}]\n\nSituation: ${d.situation}\n\nI chose: ${choice.label}\n\nMy reasoning: ${choice.description}\n\nWhat happens next?`)
                    }, 800)
                  }}
                  style={{
                    textAlign: 'left', padding: '14px 16px', borderRadius: '10px',
                    border: `1px solid ${isSelected ? riskBorders[choice.risk] : 'var(--border)'}`,
                    background: isSelected ? riskColors[choice.risk] : 'var(--bg3)',
                    cursor: revealed ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: choice.risk === 'low' ? 'var(--green)' : choice.risk === 'medium' ? 'var(--amber)' : 'var(--coral)' }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                        {choice.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>
                        {choice.description}
                      </div>
                    </div>
                    {isRevealed && (
                      <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: choice.risk === 'low' ? 'var(--green)' : choice.risk === 'medium' ? 'var(--amber)' : 'var(--coral)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {riskLabels[choice.risk]}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {revealed && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#60A5FA', margin: 0, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Decision made — seeing consequences...
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- DATA DASHBOARD ----
  if (block.type === 'dashboard') {
    const d = block.data
    const [answered, setAnswered] = useState(false)
    const [answer, setAnswer] = useState('')

    const directionIcon = (dir: string) => dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'
    const directionColor = (dir: string, concerning: boolean) => {
      if (concerning) return 'var(--coral)'
      if (dir === 'up') return 'var(--green)'
      if (dir === 'down') return 'var(--coral)'
      return 'var(--text3)'
    }

    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(45,212,191,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>📊</span>
            <span style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Live Dashboard
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{d.company} — {d.product}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{d.period}</div>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {d.metrics.map((metric, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px', borderRadius: '10px',
                  background: metric.is_concerning ? 'rgba(249,112,102,0.06)' : 'var(--bg3)',
                  border: `1px solid ${metric.is_concerning ? 'rgba(249,112,102,0.2)' : 'var(--border)'}`,
                  position: 'relative',
                }}
              >
                {metric.is_concerning && (
                  <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '10px', color: 'var(--coral)' }}>⚠</div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  {metric.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                    {metric.value}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: directionColor(metric.direction, metric.is_concerning), fontFamily: 'DM Mono, monospace' }}>
                    {directionIcon(metric.direction)} {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart visual */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Trend (last 4 weeks)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px' }}>
            {[65, 72, 68, 61].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%', height: `${h * 0.48}px`, borderRadius: '4px 4px 0 0',
                  background: i === 3 ? (d.metrics.some(m => m.is_concerning) ? 'var(--coral)' : 'var(--teal)') : 'var(--bg4)',
                  transition: 'height 0.5s ease',
                }} />
                <div style={{ fontSize: '9px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                  W{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Your Analysis
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.6', marginBottom: '14px' }}>
            {d.prompt}
          </p>
          {d.hint && !answered && (
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '12px', fontStyle: 'italic' }}>
              💡 {d.hint}
            </p>
          )}

          {!answered ? (
            <>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Write your analysis here. What story does this data tell? What's the real problem?"
                rows={5}
                style={{
                  width: '100%', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '12px', fontSize: '14px', color: 'var(--text)',
                  fontFamily: 'DM Sans, sans-serif', resize: 'vertical',
                  marginBottom: '10px', lineHeight: '1.65',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={() => {
                  if (!answer.trim()) return
                  setAnswered(true)
                  onOptionSelect(`[DASHBOARD ANALYSIS — ${d.company} ${d.product}]\n\nData presented:\n${d.metrics.map(m => `${m.name}: ${m.value} (${m.change})`).join(', ')}\n\nMy analysis:\n${answer}`)
                }}
                disabled={!answer.trim()}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: answer.trim() ? 'var(--teal)' : 'var(--bg4)',
                  border: 'none', fontSize: '14px', fontWeight: '600',
                  color: answer.trim() ? '#000' : 'var(--text3)',
                  cursor: answer.trim() ? 'pointer' : 'default', transition: 'all 0.15s',
                }}
              >
                Submit Analysis →
              </button>
            </>
          ) : (
            <div style={{ padding: '12px 14px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--teal)', margin: 0, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Analysis submitted — Maya is evaluating...
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
