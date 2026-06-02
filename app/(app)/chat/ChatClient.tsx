'use client'

import { useState, useRef, useEffect } from 'react'
import type { Profile } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Props {
  profile: Profile | null
  currentConcept: string | null
}

const SUGGESTED_QUESTIONS = [
  'What is the most important PM skill to learn first?',
  'How do I write a good problem statement?',
  'What is the difference between a metric and a KPI?',
  'How do I prioritise when everything feels urgent?',
  'What does a good PRD actually look like?',
  'How do PMs work with engineers effectively?',
  'What is jobs-to-be-done theory?',
  'How do I run a proper A/B test?',
]

export default function ChatClient({ profile, currentConcept }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey ${profile?.full_name?.split(' ')[0] || 'there'}! I'm Maya, your PM coach at Mentogram. 

I'm here to help you think through anything in product management — concepts, frameworks, decisions, career questions. Ask me anything.${currentConcept ? `\n\nI can see you're currently working on **${currentConcept}**. Want to dig deeper into that, or is there something else on your mind?` : ''}`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsStreaming(true)

    // Build message history for API (exclude the empty assistant message)
    const history = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          currentConcept,
          domain: profile?.domain,
          studentLevel: 1,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('Failed to get response')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        // Update the assistant message in real time as chunks stream in
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: fullText }
              : m
          )
        )
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      abortRef.current = null
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  const handleClear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `Fresh start! What do you want to work through?`,
      timestamp: new Date(),
    }])
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 80px)',
      maxWidth: '780px',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            PM Coach
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.02em' }}>
            Chat with Maya
          </h1>
          {currentConcept && (
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>
              Currently studying: <span style={{ color: 'var(--accent2)' }}>{currentConcept}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleClear}
          style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '8px 14px',
            fontSize: '13px', color: 'var(--text2)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text2)')}
        >
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '24px',
        paddingRight: '4px',
      }}>
        {messages.map((message, index) => (
          <div key={message.id} style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
          }}>
            {/* Avatar */}
            <div style={{
              width: '34px', height: '34px',
              borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '600',
              background: message.role === 'assistant'
                ? 'rgba(123,92,240,0.15)'
                : 'var(--bg4)',
              border: `1px solid ${message.role === 'assistant' ? 'rgba(123,92,240,0.3)' : 'var(--border)'}`,
              color: message.role === 'assistant' ? 'var(--accent2)' : 'var(--text2)',
            }}>
              {message.role === 'assistant' ? 'M' : (profile?.full_name?.[0] || 'Y')}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '85%',
              background: message.role === 'assistant' ? 'var(--bg2)' : 'rgba(123,92,240,0.1)',
              border: `1px solid ${message.role === 'assistant' ? 'var(--border)' : 'rgba(123,92,240,0.2)'}`,
              borderRadius: message.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
              padding: '14px 18px',
            }}>
              {message.content === '' && isStreaming ? (
                // Typing indicator
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--text3)',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                  <style>{`
                    @keyframes bounce {
                      0%, 60%, 100% { transform: translateY(0); }
                      30% { transform: translateY(-6px); }
                    }
                  `}</style>
                </div>
              ) : (
                <MessageContent content={message.content} />
              )}

              <div style={{
                fontSize: '11px', color: 'var(--text3)',
                marginTop: '8px', textAlign: message.role === 'user' ? 'right' : 'left',
              }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions — only show if just the welcome message */}
      {messages.length === 1 && (
        <div style={{ marginBottom: '16px', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Suggested questions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTED_QUESTIONS.slice(0, 4).map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: '20px', padding: '7px 14px',
                  fontSize: '13px', color: 'var(--text2)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent2)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text2)'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{
        flexShrink: 0,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '14px 16px',
        transition: 'border-color 0.2s',
      }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Maya anything about product management..."
          rows={1}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif',
            resize: 'none',
            lineHeight: '1.6',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
          onInput={e => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
          }}
          disabled={isStreaming}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
            Press Enter to send · Shift+Enter for new line
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isStreaming ? (
              <button
                onClick={handleStop}
                style={{
                  background: 'rgba(249,112,102,0.1)',
                  border: '1px solid rgba(249,112,102,0.2)',
                  borderRadius: '8px', padding: '7px 16px',
                  fontSize: '13px', color: 'var(--coral)',
                  cursor: 'pointer', fontWeight: '500',
                }}
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                style={{
                  background: input.trim() ? 'var(--accent)' : 'var(--bg4)',
                  border: 'none', borderRadius: '8px',
                  padding: '7px 18px', fontSize: '13px',
                  color: input.trim() ? 'white' : 'var(--text3)',
                  cursor: input.trim() ? 'pointer' : 'default',
                  fontWeight: '500', transition: 'all 0.15s',
                }}
              >
                Send →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Renders message text — handles bold (**text**) and line breaks
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  const lines = content.split('\n')

  return (
    <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.75' }}>
      {lines.map((line, i) => {
        if (line === '') return <br key={i} />
        const segments = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={i} style={{ margin: 0, marginBottom: i < lines.length - 1 ? '6px' : 0 }}>
            {segments.map((seg, j) =>
              seg.startsWith('**') && seg.endsWith('**') ? (
                <strong key={j} style={{ color: 'var(--text)', fontWeight: '600' }}>
                  {seg.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{seg}</span>
              )
            )}
          </p>
        )
      })}
    </div>
  )
}
