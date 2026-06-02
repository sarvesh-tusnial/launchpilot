import { createServerSupabaseClient } from '@/lib/db/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, progressRes, submissionsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('student_concepts').select('*, concept:concepts(title)').eq('student_id', user.id),
    supabase.from('submissions').select('score, verdict').eq('student_id', user.id),
  ])

  const profile = profileRes.data
  const progress = progressRes.data || []
  const submissions = submissionsRes.data || []

  const mastered = progress.filter(p => p.is_mastered)
  const unlocked = progress.filter(p => p.is_unlocked)
  const gaps = progress.filter(p => p.gap_flag)
  const passedSubs = submissions.filter(s => s.verdict === 'PASS')
  const avgScore = submissions.length > 0
    ? Math.round(submissions.filter(s => s.score !== null).reduce((a, s) => a + (s.score || 0), 0) / submissions.filter(s => s.score !== null).length)
    : 0

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PM Profile</div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.02em' }}>{profile?.full_name || 'PM Student'}</h1>
        <p style={{ color: 'var(--text2)', marginTop: '4px' }}>{profile?.email}</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Concepts Mastered', value: mastered.length, max: 24, color: 'var(--teal)' },
          { label: 'Tasks Passed', value: passedSubs.length, max: submissions.length, color: 'var(--green)' },
          { label: 'Avg Score', value: avgScore || '—', max: null, color: 'var(--accent2)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>
              {stat.value}{stat.max !== null ? <span style={{ fontSize: '16px', color: 'var(--text3)' }}>/{stat.max}</span> : ''}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Domain & Phase */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Track Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Domain</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent2)' }}>{profile?.domain}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Phase</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
              {profile?.current_phase === 1 ? 'Foundation' : profile?.current_phase === 2 ? 'Execution' : 'Mastery'}
            </div>
          </div>
        </div>
      </div>

      {/* Mastered Concepts */}
      {mastered.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Mastered Concepts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {mastered.map(p => (
              <span key={p.id} className="tag tag-teal">{(p as any).concept?.title}</span>
            ))}
          </div>
        </div>
      )}

      {/* Gap Concepts */}
      {gaps.length > 0 && (
        <div style={{ background: 'rgba(249,112,102,0.05)', border: '1px solid rgba(249,112,102,0.15)', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Gaps to Address
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {gaps.map(p => (
              <span key={p.id} className="tag tag-coral">{(p as any).concept?.title}</span>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '12px' }}>
            Revisit these concepts — you struggled with them previously.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Overall Progress</div>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--text2)' }}>Unlocked</span>
          <span style={{ color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{unlocked.length}/24</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', width: `${(unlocked.length / 24) * 100}%`, background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.5s' }} />
        </div>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'var(--text2)' }}>Mastered</span>
          <span style={{ color: 'var(--teal)', fontFamily: 'DM Mono, monospace' }}>{mastered.length}/24</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(mastered.length / 24) * 100}%`, background: 'var(--teal)', borderRadius: '3px', transition: 'width 0.5s' }} />
        </div>
      </div>
    </div>
  )
}
