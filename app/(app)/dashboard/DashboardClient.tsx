'use client'
import { useState } from 'react'
import Link from 'next/link'
import MayaChat from '@/components/features/MayaChat'

type Props = {
  profile: any
  firstName: string
  active: any
  activeConcepts: any[]
  conceptProgress: any[]
  masteredConcepts: number
  openingMessage: string
  sessionContext: string
  chatHistory: any[]
  currentConceptId?: string
}

export default function DashboardClient({
  profile, firstName, active,
  activeConcepts, conceptProgress, masteredConcepts,
  openingMessage, sessionContext, chatHistory, currentConceptId,
}: Props) {

  const activeCode = (active?.competency as any)?.code
  const activeName = (active?.competency as any)?.name
  const activePathway = active?.competency as any
  const totalSteps = activeConcepts.length || 25
  const completedConceptIds = new Set(conceptProgress.filter(p => p.is_completed).map(p => p.concept_id))

  const signOut = async () => {
    const { createClient } = await import('@/lib/db/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const PATHWAY_EMOJIS: Record<string, string> = {
    P01: '🤖', P02: '🎓', P03: '💼', P04: '🏪', P05: '📦',
    P06: '👗', P07: '📚', P08: '🌐', P09: '🎬', P10: '💻',
  }

  return (
    <div style={{ background: '#16161E', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>

      {/* TOP NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '60px', background: 'rgba(22,22,30,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>
            Launch<span style={{ color: '#6C47FF' }}>Pilot</span>
          </div>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
          {active && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{PATHWAY_EMOJIS[activeCode] || '🚀'}</span>
              <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: 'DM Mono, monospace' }}>{activeName}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/progress" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#FFFFFF', textDecoration: 'none', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>
            📊 Progress
          </Link>
          <button onClick={signOut} style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
            Sign out
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#8B6FFF' }}>
            {firstName[0]}
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '60px' }}>

        {/* LEFT SIDEBAR */}
        <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 16px', position: 'fixed', top: '60px', bottom: 0, left: 0, overflowY: 'auto', background: '#16161E' }}>

          {/* Student card */}
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', marginBottom: '2px' }}>{profile.full_name || firstName}</div>
            <div style={{ fontSize: '11px', color: '#FFFFFF' }}>{profile.job_title || 'Founder'}</div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#6C47FF' }}>{masteredConcepts}</div>
                <div style={{ fontSize: '9px', color: '#FFFFFF', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>done</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{totalSteps - masteredConcepts}</div>
                <div style={{ fontSize: '9px', color: '#FFFFFF', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>left</div>
              </div>
            </div>
          </div>

          {/* Active pathway */}
          {active ? (
            <div style={{ background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Your Pathway</div>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{PATHWAY_EMOJIS[activeCode] || '🚀'}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', lineHeight: '1.3', marginBottom: '10px' }}>{activeName}</div>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < masteredConcepts ? '#6C47FF' : 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
              <div style={{ fontSize: '10px', color: '#FFFFFF', fontFamily: 'DM Mono, monospace' }}>{masteredConcepts}/{totalSteps} steps completed</div>
            </div>
          ) : (
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#FFFFFF', textAlign: 'center' }}>No pathway assigned yet</div>
            </div>
          )}

          {/* Steps list */}
          {active && activeConcepts.length > 0 && (
            <>
              <div style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', padding: '0 4px' }}>
                Steps
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {activeConcepts.map((c: any) => {
                  const isDone    = completedConceptIds.has(c.id)
                  const isCurrent = c.id === currentConceptId
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: isCurrent ? 'rgba(108,71,255,0.08)' : 'transparent', border: isCurrent ? '1px solid rgba(108,71,255,0.15)' : '1px solid transparent' }}>
                      <span style={{ fontSize: '10px', color: isDone ? '#00C851' : isCurrent ? '#6C47FF' : '#FFFFFF', flexShrink: 0, marginTop: '1px' }}>
                        {isDone ? '✓' : isCurrent ? '→' : '○'}
                      </span>
                      <span style={{ fontSize: '11px', color: isDone ? '#CCCCCC' : isCurrent ? '#FFFFFF' : '#FFFFFF', lineHeight: '1.4', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {c.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </aside>

        {/* MAIN — Maya chat */}
        <main style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
          <MayaChat
            profile={profile}
            openingMessage={openingMessage}
            sessionContext={sessionContext}
            chatHistory={chatHistory}
            currentConceptId={currentConceptId}
          />
        </main>
      </div>
    </div>
  )
}