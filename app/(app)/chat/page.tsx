import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, progressRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('student_concepts')
      .select('level, is_unlocked, concept:concepts(title, slug)')
      .eq('student_id', user.id)
      .eq('is_unlocked', true)
      .order('level', { ascending: false })
      .limit(1),
  ])

  const profile = profileRes.data
  const currentConcept = (progressRes.data?.[0] as any)?.concept?.title || null

  return (
    <ChatClient
      profile={profile}
      currentConcept={currentConcept}
    />
  )
}
