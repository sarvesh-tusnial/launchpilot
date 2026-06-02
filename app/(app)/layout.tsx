import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/db/server'
import AppShell from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) redirect('/auth/login')

  return (
    <AppShell profile={profile}>
      {children}
    </AppShell>
  )
}
