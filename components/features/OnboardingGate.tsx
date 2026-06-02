'use client'

import { useState } from 'react'
import OnboardingInterview, { type OnboardingAnswers } from './OnboardingInterview'
import MayaChat from './MayaChat'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
  openingMessage: string
  sessionContext: string
  chatHistory: Array<{ role: string; content: string; created_at: string }>
}

export default function OnboardingGate({ profile, openingMessage, sessionContext, chatHistory }: Props) {
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [updatedProfile, setUpdatedProfile] = useState(profile)
  const [personalizedOpening, setPersonalizedOpening] = useState(openingMessage)
  const [personalizedContext, setPersonalizedContext] = useState(sessionContext)

  const handleComplete = (answers: OnboardingAnswers) => {
    // Build personalised opening using their answers
    const firstName = profile?.full_name?.split(' ')[0] || 'there'
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

    let msg = `${timeOfDay}, ${firstName}. Welcome to Mentogram. I'm Maya.\n\n`

    if (answers.why_pm) {
      msg += `You said you want to become a PM because: "${answers.why_pm}"\n\nI respect that. Let's make it happen.\n\n`
    }

    if (answers.dream_company) {
      msg += `Your goal is **${answers.dream_company}**. Every concept we cover, every task I assign — it's all building toward that.\n\n`
    }

    if (answers.biggest_fear) {
      msg += `Your biggest fear: "${answers.biggest_fear}"\n\nI hear that. We'll address it directly as we go.\n\n`
    }

    msg += `You've committed to **${answers.hours_per_week}** per week. I'll pace accordingly.\n\nNo lectures. No slides. You learn by doing real PM work.\n\n**Let's start.** What do you think makes someone a great PM? Don't overthink it — just tell me what you believe right now.`

    const ctx = `Day 1, background: ${answers.current_job}, working on PM fundamentals, domain: ${profile?.domain}, dream company: ${answers.dream_company}, why PM: ${answers.why_pm}, fear: ${answers.biggest_fear}, hours/week: ${answers.hours_per_week}`

    setPersonalizedOpening(msg)
    setPersonalizedContext(ctx)
    setUpdatedProfile({
      ...profile!,
      onboarding_completed: true,
      current_job: answers.current_job,
      why_pm: answers.why_pm,
      dream_company: answers.dream_company,
      biggest_fear: answers.biggest_fear,
      hours_per_week: answers.hours_per_week,
    })
    setOnboardingDone(true)
  }

  if (!onboardingDone) {
    return (
      <OnboardingInterview
        studentName={profile?.full_name || 'there'}
        onComplete={handleComplete}
      />
    )
  }

  return (
    <MayaChat
      profile={updatedProfile}
      openingMessage={personalizedOpening}
      sessionContext={personalizedContext}
      chatHistory={chatHistory}
    />
  )
}
