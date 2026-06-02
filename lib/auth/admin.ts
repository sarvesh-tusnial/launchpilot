import { createServerSupabaseClient } from '@/lib/db/server'
import { createAdminClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const adminClient = await createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return { user, supabase: adminClient }
}