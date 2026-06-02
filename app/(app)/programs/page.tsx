import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'
import ProgramsBrowser from '@/components/features/ProgramsBrowser'

export default async function ProgramsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, allProgramsRes, enrollmentsRes] = await Promise.all([
    supabase.from('profiles').select('active_program_id').eq('id', user.id).single(),
    supabase.from('programs').select('*').order('order_index'),
    supabase.from('enrollments').select('program_id').eq('student_id', user.id),
  ])

  const profile = profileRes.data
  const allPrograms = allProgramsRes.data || []
  const enrolledProgramIds = (enrollmentsRes.data || []).map((e: any) => e.program_id)

  return (
    <ProgramsBrowser
      allPrograms={allPrograms}
      enrolledProgramIds={enrolledProgramIds}
      activeProgramId={profile?.active_program_id || ''}
    />
  )
}
